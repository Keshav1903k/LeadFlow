"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.leadsRouter = void 0;
const express_1 = require("express");
const prisma_js_1 = require("../lib/prisma.js");
const auth_js_1 = require("../middleware/auth.js");
const validate_js_1 = require("../middleware/validate.js");
const leadSchema_js_1 = require("../schemas/leadSchema.js");
exports.leadsRouter = (0, express_1.Router)();
exports.leadsRouter.use(auth_js_1.authMiddleware);
function formatSource(source) {
    if (source === 'Cold_Call')
        return 'Cold Call';
    if (source === 'Google_Ads')
        return 'Google Ads';
    return source;
}
function toPrismaSource(source) {
    if (source === 'Cold Call')
        return 'Cold_Call';
    if (source === 'Google Ads')
        return 'Google_Ads';
    return source;
}
// GET /api/leads/stats
exports.leadsRouter.get('/stats', async (req, res) => {
    const userId = req.userId;
    const leads = await prisma_js_1.prisma.lead.findMany({
        where: { userId },
        select: { id: true, name: true, email: true, phone: true, company: true, source: true, status: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
    });
    const total = leads.length;
    const counts = {
        New: 0,
        Contacted: 0,
        Qualified: 0,
        Lost: 0,
    };
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    let addedThisWeek = 0;
    for (const lead of leads) {
        if (counts[lead.status] !== undefined) {
            counts[lead.status]++;
        }
        if (lead.createdAt >= sevenDaysAgo) {
            addedThisWeek++;
        }
    }
    const qualifiedCount = counts.Qualified || 0;
    const conversionRate = total > 0 ? ((qualifiedCount / total) * 100).toFixed(1) : '0';
    const recentLeads = leads.slice(0, 5).map((l) => ({
        ...l,
        source: formatSource(l.source),
    }));
    res.json({
        total,
        counts,
        conversionRate: `${conversionRate}%`,
        addedThisWeek,
        recentLeads,
    });
});
// GET /api/leads
exports.leadsRouter.get('/', async (req, res) => {
    const userId = req.userId;
    const { search, status, source, page = '1', sort = 'desc' } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = 10;
    const sortDirection = sort === 'asc' ? 'asc' : 'desc';
    const where = { userId };
    if (status && status !== 'All') {
        where.status = status;
    }
    if (source && source !== 'All') {
        where.source = toPrismaSource(source);
    }
    if (search && typeof search === 'string' && search.trim() !== '') {
        const q = search.trim();
        where.OR = [
            { name: { contains: q, mode: 'insensitive' } },
            { company: { contains: q, mode: 'insensitive' } },
        ];
    }
    const total = await prisma_js_1.prisma.lead.count({ where });
    const allUserLeads = await prisma_js_1.prisma.lead.findMany({
        where: { userId },
        select: { status: true },
    });
    const statusCounts = {
        All: allUserLeads.length,
        New: 0,
        Contacted: 0,
        Qualified: 0,
        Lost: 0,
    };
    for (const l of allUserLeads) {
        if (statusCounts[l.status] !== undefined) {
            statusCounts[l.status]++;
        }
    }
    const rawLeads = await prisma_js_1.prisma.lead.findMany({
        where,
        orderBy: { createdAt: sortDirection },
        skip: (pageNum - 1) * pageSize,
        take: pageSize,
    });
    const leads = rawLeads.map((l) => ({
        ...l,
        source: formatSource(l.source),
    }));
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    res.json({
        leads,
        total,
        page: pageNum,
        totalPages,
        statusCounts,
    });
});
// POST /api/leads
exports.leadsRouter.post('/', (0, validate_js_1.validate)(leadSchema_js_1.createLeadSchema), async (req, res) => {
    const userId = req.userId;
    const { name, email, phone, company, source, status } = req.body;
    const existing = await prisma_js_1.prisma.lead.findUnique({
        where: {
            userId_email: {
                userId,
                email,
            },
        },
    });
    if (existing) {
        return res.status(409).json({
            error: 'A lead with this email already exists',
            fields: { email: 'A lead with this email already exists' },
        });
    }
    const created = await prisma_js_1.prisma.lead.create({
        data: {
            name,
            email,
            phone,
            company: company || null,
            source: toPrismaSource(source),
            status,
            userId,
        },
    });
    res.status(201).json({
        ...created,
        source: formatSource(created.source),
    });
});
// PUT /api/leads/:id
exports.leadsRouter.put('/:id', (0, validate_js_1.validate)(leadSchema_js_1.updateLeadSchema), async (req, res) => {
    const userId = req.userId;
    const id = req.params.id;
    const { name, email, phone, company, source, status } = req.body;
    const lead = await prisma_js_1.prisma.lead.findFirst({
        where: { id, userId },
    });
    if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
    }
    if (email && email.toLowerCase() !== lead.email.toLowerCase()) {
        const existing = await prisma_js_1.prisma.lead.findUnique({
            where: {
                userId_email: {
                    userId,
                    email,
                },
            },
        });
        if (existing) {
            return res.status(409).json({
                error: 'A lead with this email already exists',
                fields: { email: 'A lead with this email already exists' },
            });
        }
    }
    const data = {};
    if (name !== undefined)
        data.name = name;
    if (email !== undefined)
        data.email = email;
    if (phone !== undefined)
        data.phone = phone;
    if (company !== undefined)
        data.company = company || null;
    if (source !== undefined)
        data.source = toPrismaSource(source);
    if (status !== undefined)
        data.status = status;
    const updated = await prisma_js_1.prisma.lead.update({
        where: { id },
        data,
    });
    res.json({
        ...updated,
        source: formatSource(updated.source),
    });
});
// DELETE /api/leads/:id
exports.leadsRouter.delete('/:id', async (req, res) => {
    const userId = req.userId;
    const id = req.params.id;
    const lead = await prisma_js_1.prisma.lead.findFirst({
        where: { id, userId },
    });
    if (!lead) {
        return res.status(404).json({ error: 'Lead not found' });
    }
    await prisma_js_1.prisma.lead.delete({
        where: { id },
    });
    res.json({ message: 'Lead deleted successfully' });
});

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const supertest_1 = __importDefault(require("supertest"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const JWT_SECRET = 'super_secret_jwt_key_change_in_production';
// In-memory test store
let users = [];
let leads = [];
vitest_1.vi.mock('../lib/prisma.js', () => ({
    prisma: {
        user: {
            findUnique: vitest_1.vi.fn(async ({ where }) => {
                if (where.email)
                    return users.find((u) => u.email === where.email) || null;
                if (where.id)
                    return users.find((u) => u.id === where.id) || null;
                return null;
            }),
            create: vitest_1.vi.fn(async ({ data }) => {
                const user = { id: `user-${Date.now()}`, ...data, createdAt: new Date() };
                users.push(user);
                return user;
            }),
            findFirst: vitest_1.vi.fn(async () => users[0] || null),
        },
        lead: {
            findUnique: vitest_1.vi.fn(async ({ where }) => {
                if (where.userId_email) {
                    return (leads.find((l) => l.userId === where.userId_email.userId &&
                        l.email === where.userId_email.email) || null);
                }
                return null;
            }),
            findFirst: vitest_1.vi.fn(async ({ where }) => {
                return (leads.find((l) => {
                    if (where.id && l.id !== where.id)
                        return false;
                    if (where.userId && l.userId !== where.userId)
                        return false;
                    return true;
                }) || null);
            }),
            findMany: vitest_1.vi.fn(async ({ where }) => {
                return leads.filter((l) => {
                    if (where.userId && l.userId !== where.userId)
                        return false;
                    if (where.status && l.status !== where.status)
                        return false;
                    return true;
                });
            }),
            count: vitest_1.vi.fn(async ({ where }) => {
                return leads.filter((l) => {
                    if (where.userId && l.userId !== where.userId)
                        return false;
                    if (where.status && l.status !== where.status)
                        return false;
                    return true;
                }).length;
            }),
            create: vitest_1.vi.fn(async ({ data }) => {
                const lead = {
                    id: `lead-${Date.now()}-${Math.random()}`,
                    ...data,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                };
                leads.push(lead);
                return lead;
            }),
            update: vitest_1.vi.fn(async ({ where, data }) => {
                const index = leads.findIndex((l) => l.id === where.id);
                if (index === -1)
                    throw { code: 'P2025' };
                leads[index] = { ...leads[index], ...data, updatedAt: new Date() };
                return leads[index];
            }),
            delete: vitest_1.vi.fn(async ({ where }) => {
                const index = leads.findIndex((l) => l.id === where.id);
                if (index === -1)
                    throw { code: 'P2025' };
                leads.splice(index, 1);
                return { message: 'deleted' };
            }),
        },
    },
}));
// Import app after mocking
const app_js_1 = require("../app.js");
(0, vitest_1.describe)('LeadFlow API Endpoints', () => {
    let userToken;
    let otherUserToken;
    (0, vitest_1.beforeEach)(async () => {
        users = [];
        leads = [];
        // Seed test users
        const hash = await bcryptjs_1.default.hash('password123', 10);
        const userA = {
            id: 'user-a',
            name: 'Keshav Sharma',
            email: 'keshav@test.com',
            passwordHash: hash,
            createdAt: new Date(),
        };
        const userB = {
            id: 'user-b',
            name: 'Other User',
            email: 'other@test.com',
            passwordHash: hash,
            createdAt: new Date(),
        };
        users.push(userA, userB);
        userToken = jsonwebtoken_1.default.sign({ userId: userA.id }, JWT_SECRET);
        otherUserToken = jsonwebtoken_1.default.sign({ userId: userB.id }, JWT_SECRET);
    });
    // Test 1: Signup and Login
    (0, vitest_1.it)('allows user signup and login with token generation', async () => {
        const signupRes = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/auth/signup')
            .send({
            name: 'New Sales Rep',
            email: 'sales@test.com',
            password: 'password123',
        })
            .expect(201);
        (0, vitest_1.expect)(signupRes.body).toHaveProperty('token');
        (0, vitest_1.expect)(signupRes.body.user.email).toBe('sales@test.com');
        const loginRes = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/auth/login')
            .send({
            email: 'sales@test.com',
            password: 'password123',
        })
            .expect(200);
        (0, vitest_1.expect)(loginRes.body).toHaveProperty('token');
    });
    // Test 2: Create valid lead
    (0, vitest_1.it)('creates a new lead with valid data', async () => {
        const res = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/leads')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            name: 'Aarav Malhotra',
            email: 'aarav@dental.com',
            phone: '+91 98110 24763',
            company: 'Malhotra Dental',
            source: 'Referral',
            status: 'New',
        })
            .expect(201);
        (0, vitest_1.expect)(res.body.name).toBe('Aarav Malhotra');
        (0, vitest_1.expect)(res.body.email).toBe('aarav@dental.com');
    });
    // Test 3: Create invalid lead (validation failure)
    (0, vitest_1.it)('returns 400 with field errors when creating invalid lead', async () => {
        const res = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/leads')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            name: '',
            email: 'invalid-email',
            phone: '12',
        })
            .expect(400);
        (0, vitest_1.expect)(res.body.error).toBe('Validation failed');
        (0, vitest_1.expect)(res.body.fields).toHaveProperty('email');
        (0, vitest_1.expect)(res.body.fields).toHaveProperty('name');
    });
    // Test 4: List leads with status filter
    (0, vitest_1.it)('lists leads filtered by status', async () => {
        // Add two leads: one Qualified, one New
        await (0, supertest_1.default)(app_js_1.app)
            .post('/api/leads')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            name: 'Qualified Lead',
            email: 'qualified@test.com',
            phone: '+91 98110 11111',
            source: 'Website',
            status: 'Qualified',
        });
        await (0, supertest_1.default)(app_js_1.app)
            .post('/api/leads')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            name: 'New Lead',
            email: 'new@test.com',
            phone: '+91 98110 22222',
            source: 'Website',
            status: 'New',
        });
        const res = await (0, supertest_1.default)(app_js_1.app)
            .get('/api/leads?status=Qualified')
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        (0, vitest_1.expect)(res.body.leads.length).toBe(1);
        (0, vitest_1.expect)(res.body.leads[0].name).toBe('Qualified Lead');
    });
    // Test 5: Update lead status
    (0, vitest_1.it)('updates lead status correctly', async () => {
        const createRes = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/leads')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            name: 'Lead To Update',
            email: 'update@test.com',
            phone: '+91 98110 33333',
            source: 'Website',
            status: 'New',
        });
        const leadId = createRes.body.id;
        const updateRes = await (0, supertest_1.default)(app_js_1.app)
            .put(`/api/leads/${leadId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            status: 'Qualified',
        })
            .expect(200);
        (0, vitest_1.expect)(updateRes.body.status).toBe('Qualified');
    });
    // Test 6: Delete lead
    (0, vitest_1.it)('deletes a lead successfully', async () => {
        const createRes = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/leads')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            name: 'Lead To Delete',
            email: 'delete@test.com',
            phone: '+91 98110 44444',
            source: 'Website',
            status: 'New',
        });
        const leadId = createRes.body.id;
        await (0, supertest_1.default)(app_js_1.app)
            .delete(`/api/leads/${leadId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(200);
        // Verify it cannot be deleted again
        await (0, supertest_1.default)(app_js_1.app)
            .delete(`/api/leads/${leadId}`)
            .set('Authorization', `Bearer ${userToken}`)
            .expect(404);
    });
    // Test 7: User isolation (user cannot see another user's lead)
    (0, vitest_1.it)("prevents one user from seeing or modifying another user's lead", async () => {
        // User A creates a lead
        const createRes = await (0, supertest_1.default)(app_js_1.app)
            .post('/api/leads')
            .set('Authorization', `Bearer ${userToken}`)
            .send({
            name: "User A's Lead",
            email: 'user-a-lead@test.com',
            phone: '+91 98110 55555',
            source: 'Referral',
            status: 'New',
        });
        const userALeadId = createRes.body.id;
        // User B lists leads -> should NOT see User A's lead
        const listRes = await (0, supertest_1.default)(app_js_1.app)
            .get('/api/leads')
            .set('Authorization', `Bearer ${otherUserToken}`)
            .expect(200);
        const found = listRes.body.leads.find((l) => l.id === userALeadId);
        (0, vitest_1.expect)(found).toBeUndefined();
        // User B tries to delete User A's lead -> 404
        await (0, supertest_1.default)(app_js_1.app)
            .delete(`/api/leads/${userALeadId}`)
            .set('Authorization', `Bearer ${otherUserToken}`)
            .expect(404);
    });
});

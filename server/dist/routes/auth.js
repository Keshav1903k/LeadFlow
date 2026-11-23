"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_js_1 = require("../lib/prisma.js");
const validate_js_1 = require("../middleware/validate.js");
const authSchema_js_1 = require("../schemas/authSchema.js");
const auth_js_1 = require("../middleware/auth.js");
exports.authRouter = (0, express_1.Router)();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_change_in_production';
// POST /api/auth/signup
exports.authRouter.post('/signup', (0, validate_js_1.validate)(authSchema_js_1.signupSchema), async (req, res) => {
    const { name, email, password } = req.body;
    const existing = await prisma_js_1.prisma.user.findUnique({
        where: { email },
    });
    if (existing) {
        return res.status(409).json({
            error: 'An account with this email already exists',
            fields: { email: 'Email is already registered' },
        });
    }
    const passwordHash = await bcryptjs_1.default.hash(password, 10);
    const user = await prisma_js_1.prisma.user.create({
        data: {
            name,
            email,
            passwordHash,
        },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
        token,
        user,
    });
});
// POST /api/auth/login
exports.authRouter.post('/login', (0, validate_js_1.validate)(authSchema_js_1.loginSchema), async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma_js_1.prisma.user.findUnique({
        where: { email },
    });
    if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const isMatch = await bcryptjs_1.default.compare(password, user.passwordHash);
    if (!isMatch) {
        return res.status(401).json({ error: 'Invalid email or password' });
    }
    const token = jsonwebtoken_1.default.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
    res.json({
        token,
        user: {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
        },
    });
});
// GET /api/auth/me
exports.authRouter.get('/me', auth_js_1.requireAuth, async (req, res) => {
    const user = await prisma_js_1.prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
        },
    });
    if (!user) {
        return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
});

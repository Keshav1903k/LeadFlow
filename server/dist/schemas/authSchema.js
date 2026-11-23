"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.loginSchema = exports.signupSchema = void 0;
const zod_1 = require("zod");
exports.signupSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, 'Name is required'),
    email: zod_1.z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
    password: zod_1.z.string().min(1, 'Password is required'),
});

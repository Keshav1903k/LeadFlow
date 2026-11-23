"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateLeadStatusSchema = exports.updateLeadSchema = exports.createLeadSchema = exports.leadStatuses = exports.leadSources = void 0;
const zod_1 = require("zod");
exports.leadSources = [
    'Referral',
    'Website',
    'Cold Call',
    'Facebook',
    'Google Ads',
    'LinkedIn',
    'Other',
];
exports.leadStatuses = [
    'New',
    'Contacted',
    'Qualified',
    'Lost',
];
exports.createLeadSchema = zod_1.z.object({
    name: zod_1.z.string().trim().min(1, 'Name is required'),
    email: zod_1.z.string().trim().min(1, 'Email is required').email('Please enter a valid email address'),
    phone: zod_1.z
        .string()
        .trim()
        .min(1, 'Phone number is required')
        .regex(/^[+]?[0-9\s\-()]{7,20}$/, 'Please enter a valid phone number'),
    company: zod_1.z.string().trim().optional().nullable(),
    source: zod_1.z.enum(exports.leadSources, {
        errorMap: () => ({ message: 'Please select a valid source' }),
    }),
    status: zod_1.z.enum(exports.leadStatuses, {
        errorMap: () => ({ message: 'Please select a valid status' }),
    }),
});
exports.updateLeadSchema = exports.createLeadSchema.partial();
exports.updateLeadStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(exports.leadStatuses, {
        errorMap: () => ({ message: 'Please select a valid status' }),
    }),
});

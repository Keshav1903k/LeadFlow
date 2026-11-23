"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_js_1 = require("./routes/auth.js");
const leads_js_1 = require("./routes/leads.js");
const errorHandler_js_1 = require("./middleware/errorHandler.js");
dotenv_1.default.config();
exports.app = (0, express_1.default)();
exports.app.use((0, cors_1.default)({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
exports.app.use(express_1.default.json());
// Health check
exports.app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', service: 'LeadFlow API' });
});
// Authentication
exports.app.use('/api/auth', auth_js_1.authRouter);
// Leads CRUD & stats
exports.app.use('/api/leads', leads_js_1.leadsRouter);
// Central error handler
exports.app.use(errorHandler_js_1.errorHandler);
exports.default = exports.app;

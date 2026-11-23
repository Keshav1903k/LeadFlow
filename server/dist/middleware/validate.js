"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
function validate(schema) {
    return async (req, res, next) => {
        try {
            req.body = await schema.parseAsync(req.body);
            next();
        }
        catch (err) {
            if (err instanceof zod_1.ZodError) {
                const fields = {};
                for (const issue of err.issues) {
                    const field = issue.path.join('.');
                    if (!fields[field]) {
                        fields[field] = issue.message;
                    }
                }
                return res.status(400).json({
                    error: 'Validation failed',
                    fields,
                });
            }
            next(err);
        }
    };
}

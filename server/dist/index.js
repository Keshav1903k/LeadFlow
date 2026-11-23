"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const app_js_1 = require("./app.js");
const PORT = process.env.PORT || 5000;
if (!process.env.VERCEL) {
    app_js_1.app.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`);
    });
}
exports.default = app_js_1.app;

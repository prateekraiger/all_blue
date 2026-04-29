"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const validate_1 = require("../middlewares/validate");
const aiService = __importStar(require("../services/aiService"));
const router = (0, express_1.Router)();
// ─── GET /api/ai/recommendations — Personalised recommendations ───────────────
router.get('/recommendations', auth_1.requireAuth, async (req, res) => {
    const limit = req.query.limit
        ? Math.min(parseInt(req.query.limit, 10), 20)
        : 12;
    const products = await aiService.getRecommendations(req.user.id, limit);
    res.json({ success: true, data: products });
});
// ─── GET /api/ai/similar/:productId — Similar products ───────────────────────
router.get('/similar/:productId', async (req, res) => {
    const limit = req.query.limit
        ? Math.min(parseInt(req.query.limit, 10), 12)
        : 8;
    const products = await aiService.getSimilarProducts(req.params.productId, limit);
    res.json({ success: true, data: products });
});
// ─── POST /api/ai/preferences — Record user behaviour signals ─────────────────
router.post('/preferences', auth_1.requireAuth, (0, validate_1.validate)(validate_1.schemas.preferences), async (req, res) => {
    const prefs = await aiService.updatePreferences(req.user.id, req.body);
    res.json({ success: true, data: prefs });
});
// ─── POST /api/ai/chat — Rule-based chatbot endpoint ─────────────────────────
router.post('/chat', auth_1.optionalAuth, (0, validate_1.validate)(validate_1.schemas.chat), async (req, res) => {
    const { message } = req.body;
    const response = await aiService.chatbotResponse(message, req.user?.id ?? null);
    res.json({ success: true, data: response });
});
exports.default = router;
//# sourceMappingURL=ai.js.map
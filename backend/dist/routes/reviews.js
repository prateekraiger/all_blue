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
const reviewService = __importStar(require("../services/reviewService"));
const router = (0, express_1.Router)();
// ─── GET /api/reviews/:productId — Get all reviews for a product ──────────────
router.get('/:productId', async (req, res) => {
    const { page, limit } = req.query;
    const result = await reviewService.getProductReviews(req.params.productId, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
    });
    res.json({ success: true, data: result });
});
// ─── POST /api/reviews — Submit a review (auth required) ──────────────────────
router.post('/', auth_1.requireAuth, (0, validate_1.validate)(validate_1.schemas.review), async (req, res) => {
    const review = await reviewService.createReview(req.user.id, req.body);
    res.status(201).json({ success: true, data: review });
});
// ─── DELETE /api/reviews/:id — Delete own review (auth required) ──────────────
router.delete('/:id', auth_1.requireAuth, async (req, res) => {
    const result = await reviewService.deleteReview(req.user.id, req.params.id);
    res.json({ success: true, data: result });
});
exports.default = router;
//# sourceMappingURL=reviews.js.map
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
const productService = __importStar(require("../services/productService"));
const router = (0, express_1.Router)();
// ─── GET /api/products — List with filters / search / pagination ──────────────
router.get('/', auth_1.optionalAuth, async (req, res) => {
    const { category, tag, q, page, limit, sort } = req.query;
    const result = await productService.listProducts({
        category: category || undefined,
        tag: tag || undefined,
        q: q || undefined,
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? Math.min(parseInt(limit, 10), 100) : 20,
        sort: sort || 'created_at',
    });
    res.json({ success: true, data: result });
});
// ─── GET /api/products/trending — Trending products ──────────────────────────
router.get('/trending', async (req, res) => {
    const limit = req.query.limit
        ? Math.min(parseInt(req.query.limit, 10), 20)
        : 8;
    const products = await productService.getTrendingProducts(limit);
    res.json({ success: true, data: products });
});
// ─── GET /api/products/categories — Distinct category list ───────────────────
router.get('/categories', async (_req, res) => {
    const categories = await productService.getCategories();
    res.json({ success: true, data: categories });
});
// ─── GET /api/products/:id — Single product detail ───────────────────────────
router.get('/:id', auth_1.optionalAuth, async (req, res) => {
    const product = await productService.getProduct(req.params.id);
    res.json({ success: true, data: product });
});
// ─── POST /api/products — Create (admin) ─────────────────────────────────────
router.post('/', auth_1.requireAdmin, (0, validate_1.validate)(validate_1.schemas.product), async (req, res) => {
    const product = await productService.createProduct(req.body);
    res.status(201).json({ success: true, data: product });
});
// ─── PUT/PATCH /api/products/:id — Update (admin) ───────────────────────────
router.patch('/:id', auth_1.requireAdmin, (0, validate_1.validate)(validate_1.schemas.product.partial()), async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
});
router.put('/:id', auth_1.requireAdmin, (0, validate_1.validate)(validate_1.schemas.product.partial()), async (req, res) => {
    const product = await productService.updateProduct(req.params.id, req.body);
    res.json({ success: true, data: product });
});
// ─── DELETE /api/products/:id — Soft-delete (admin) ──────────────────────────
router.delete('/:id', auth_1.requireAdmin, async (req, res) => {
    const result = await productService.deleteProduct(req.params.id);
    res.json({ success: true, data: result });
});
exports.default = router;
//# sourceMappingURL=products.js.map
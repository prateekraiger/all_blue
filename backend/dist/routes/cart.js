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
const cartService = __importStar(require("../services/cartService"));
const router = (0, express_1.Router)();
// All cart routes require a valid session
router.use(auth_1.requireAuth);
// ─── GET /api/cart — Retrieve the current user's cart ────────────────────────
router.get('/', async (req, res) => {
    const cart = await cartService.getCart(req.user.id);
    res.json({ success: true, data: cart });
});
// ─── POST /api/cart — Add an item to the cart ─────────────────────────────────
router.post('/', (0, validate_1.validate)(validate_1.schemas.cartItem), async (req, res) => {
    const { product_id, quantity } = req.body;
    const item = await cartService.addToCart(req.user.id, product_id, quantity);
    res.status(201).json({ success: true, data: item });
});
// ─── PUT /api/cart/:id — Update item quantity ─────────────────────────────────
router.put('/:id', (0, validate_1.validate)(validate_1.schemas.cartUpdate), async (req, res) => {
    const { quantity } = req.body;
    const item = await cartService.updateCartItem(req.user.id, req.params.id, quantity);
    res.json({ success: true, data: item });
});
// ─── DELETE /api/cart/:id — Remove a single item ─────────────────────────────
router.delete('/:id', async (req, res) => {
    const result = await cartService.removeFromCart(req.user.id, req.params.id);
    res.json({ success: true, data: result });
});
// ─── DELETE /api/cart — Clear entire cart ─────────────────────────────────────
router.delete('/', async (req, res) => {
    await cartService.clearCart(req.user.id);
    res.json({ success: true, data: { message: 'Cart cleared' } });
});
exports.default = router;
//# sourceMappingURL=cart.js.map
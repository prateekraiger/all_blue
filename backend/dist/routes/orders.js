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
const orderService = __importStar(require("../services/orderService"));
const router = (0, express_1.Router)();
// ─── Admin routes (MUST be before generic routes and requireAuth) ───────────
// GET /api/orders/admin — Admin: all orders
router.get('/admin', auth_1.requireAdmin, async (req, res) => {
    const { page, limit, status } = req.query;
    const result = await orderService.getAllOrders({
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 20,
        status: status || undefined,
    });
    res.json({ success: true, data: result });
});
// PATCH /api/orders/admin/:id/status — Admin: update order status
router.patch('/admin/:id/status', auth_1.requireAdmin, (0, validate_1.validate)(validate_1.schemas.orderStatus), async (req, res) => {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json({ success: true, data: order });
});
// All other user order routes require standard authentication
router.use(auth_1.requireAuth);
// ─── POST /api/orders — Create a new order ────────────────────────────────────
router.post('/', (0, validate_1.validate)(validate_1.schemas.order), async (req, res) => {
    const order = await orderService.createOrder(req.user.id, req.body);
    res.status(201).json({ success: true, data: order });
});
// ─── GET /api/orders — List user orders (paginated) ───────────────────────────
router.get('/', async (req, res) => {
    const { page, limit } = req.query;
    const result = await orderService.getUserOrders(req.user.id, {
        page: page ? parseInt(page, 10) : 1,
        limit: limit ? parseInt(limit, 10) : 10,
    });
    res.json({ success: true, data: result });
});
// ─── GET /api/orders/:id — Get single order (own orders only) ─────────────────
router.get('/:id', async (req, res) => {
    const order = await orderService.getOrder(req.user.id, req.params.id);
    res.json({ success: true, data: order });
});
// ─── PATCH /api/orders/:id/cancel — Cancel a pending order ───────────────────
router.patch('/:id/cancel', async (req, res) => {
    const order = await orderService.cancelOrder(req.user.id, req.params.id);
    res.json({ success: true, data: order });
});
exports.default = router;
//# sourceMappingURL=orders.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const supabase_1 = __importDefault(require("../config/supabase"));
const router = (0, express_1.Router)();
// ─── POST /api/admin/login — Login with hardcoded credentials ─────────────────
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const ADMIN_EMAIL = "admin@gmail.com";
    const ADMIN_PASSWORD = "admin123";
    const ADMIN_TOKEN = auth_1.LOCAL_ADMIN_TOKEN;
    if (email?.toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return res.json({
            success: true,
            data: {
                token: ADMIN_TOKEN,
                user: {
                    email: ADMIN_EMAIL,
                    full_name: "Admin",
                    role: "admin"
                }
            }
        });
    }
    return res.status(401).json({ success: false, error: "Invalid admin credentials" });
});
// All subsequent routes in this file require admin privileges
router.use(auth_1.requireAdmin);
// ─── GET /api/admin/dashboard — Aggregate dashboard statistics ─────────────────
router.get('/dashboard', async (_req, res) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];
    // ── Parallelize independent queries ──────────────────────────────────────────
    const [revenueResult, ordersTodayResult, totalOrdersResult, totalProductsResult, lowStockResult, recentOrdersResult, allPaidOrdersResult, ...statusResults] = await Promise.all([
        supabase_1.default.from('orders').select('total_amount').eq('status', 'paid'),
        supabase_1.default.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase_1.default.from('orders').select('*', { count: 'exact', head: true }),
        supabase_1.default.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase_1.default.from('products').select('id, name, stock').eq('is_active', true).lt('stock', 10).order('stock', { ascending: true }).limit(5),
        supabase_1.default.from('orders').select('*').order('created_at', { ascending: false }).limit(5),
        supabase_1.default.from('orders').select('items').eq('status', 'paid'),
        ...statuses.map(status => supabase_1.default.from('orders').select('*', { count: 'exact', head: true }).eq('status', status))
    ]);
    const totalRevenue = (revenueResult.data ?? []).reduce((sum, o) => sum + (o.total_amount ?? 0), 0);
    const ordersToday = ordersTodayResult.count;
    const totalOrders = totalOrdersResult.count;
    const totalProducts = totalProductsResult.count;
    const lowStock = lowStockResult.data;
    const recentOrders = recentOrdersResult.data;
    const allPaidOrders = allPaidOrdersResult.data;
    const statusCounts = {};
    statuses.forEach((status, index) => {
        statusCounts[status] = statusResults[index].count ?? 0;
    });
    // Basic calculation for popular products from paid orders
    const productCounts = {};
    (allPaidOrders ?? []).forEach((order) => {
        (order.items ?? []).forEach((item) => {
            productCounts[item.product_id] = (productCounts[item.product_id] || 0) + (item.qty || 1);
        });
    });
    // Get top 5 popular product IDs
    const topProductIds = Object.entries(productCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([id]) => id);
    // Fetch actual product details for the popular ones
    let popularProducts = [];
    if (topProductIds.length > 0) {
        const { data: popularData } = await supabase_1.default
            .from('products')
            .select('*')
            .in('id', topProductIds);
        popularProducts = (popularData ?? []).map(p => ({
            ...p,
            orders: productCounts[p.id] || 0
        })).sort((a, b) => b.orders - a.orders);
    }
    const dashboard = {
        stats: {
            totalRevenue: parseFloat(totalRevenue.toFixed(2)),
            ordersToday: ordersToday ?? 0,
            totalOrders: totalOrders ?? 0,
            totalProducts: totalProducts ?? 0,
        },
        ordersByStatus: statusCounts,
        lowStockProducts: (lowStock ?? []),
        recentOrders: (recentOrders ?? []),
        popularProducts,
    };
    return res.json({ success: true, data: dashboard });
});
// ─── GET /api/admin/products — All products including inactive ─────────────────
router.get('/products', async (_req, res) => {
    const { data, error, count } = await supabase_1.default
        .from('products')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });
    if (error) {
        return res.status(500).json({ success: false, error: error.message });
    }
    return res.json({ success: true, data: { products: data ?? [], total: count ?? 0 } });
});
exports.default = router;
//# sourceMappingURL=admin.js.map
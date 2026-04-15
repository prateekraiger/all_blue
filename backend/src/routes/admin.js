const express = require('express');
const router = express.Router();
const { requireAdmin } = require('../middlewares/auth');
const supabase = require('../config/supabase');
const { AppError } = require('../middlewares/errorHandler');

// All admin routes require admin role
router.use(requireAdmin);

// GET /api/admin/dashboard — Dashboard stats
router.get('/dashboard', async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Total revenue (paid orders)
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'paid');

  const totalRevenue = (revenueData || []).reduce((sum, o) => sum + (o.total_amount || 0), 0);

  // Orders today
  const { count: ordersToday } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // Total orders
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // Total products
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // Low stock products (stock < 10)
  const { data: lowStock } = await supabase
    .from('products')
    .select('id, name, stock')
    .eq('is_active', true)
    .lt('stock', 10)
    .order('stock', { ascending: true })
    .limit(5);

  // Recent orders
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // Popular products (by order count)
  const { data: allOrders } = await supabase
    .from('orders')
    .select('items')
    .eq('status', 'paid');

  const productCount = {};
  for (const order of allOrders || []) {
    for (const item of Array.isArray(order.items) ? order.items : []) {
      productCount[item.product_id] = (productCount[item.product_id] || 0) + item.qty;
    }
  }

  const topProductIds = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let popularProducts = [];
  if (topProductIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('id, name, price, stock')
      .in('id', topProductIds);
    popularProducts = (data || []).map((p) => ({
      ...p,
      orders: productCount[p.id] || 0,
    }));
  }

  // Revenue by status
  const statusCounts = {};
  for (const status of ['pending', 'paid', 'shipped', 'delivered', 'cancelled']) {
    const { count } = await supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', status);
    statusCounts[status] = count || 0;
  }

  res.json({
    success: true,
    data: {
      stats: {
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        ordersToday: ordersToday || 0,
        totalOrders: totalOrders || 0,
        totalProducts: totalProducts || 0,
      },
      ordersByStatus: statusCounts,
      lowStockProducts: lowStock || [],
      recentOrders: recentOrders || [],
      popularProducts,
    },
  });
});

module.exports = router;

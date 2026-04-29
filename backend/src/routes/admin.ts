import { Router } from 'express';
import type { Response } from 'express';
import { requireAdmin } from '../middlewares/auth';
import supabase from '../config/supabase';
import type { AuthRequest, DashboardStats, Order } from '../types';

const router: Router = Router();

// All routes in this file require admin privileges
router.use(requireAdmin);

// ─── GET /api/admin/dashboard — Aggregate dashboard statistics ─────────────────
router.get('/dashboard', async (_req: AuthRequest, res: Response) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ── Total revenue from paid orders ─────────────────────────────────────────
  const { data: revenueData } = await supabase
    .from('orders')
    .select('total_amount')
    .eq('status', 'paid');

  const totalRevenue = ((revenueData ?? []) as { total_amount: number }[]).reduce(
    (sum, o) => sum + (o.total_amount ?? 0),
    0
  );

  // ── Orders created today ────────────────────────────────────────────────────
  const { count: ordersToday } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true })
    .gte('created_at', today.toISOString());

  // ── Total order count ───────────────────────────────────────────────────────
  const { count: totalOrders } = await supabase
    .from('orders')
    .select('*', { count: 'exact', head: true });

  // ── Active product count ────────────────────────────────────────────────────
  const { count: totalProducts } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('is_active', true);

  // ── Low-stock products (stock < 10) ────────────────────────────────────────
  const { data: lowStock } = await supabase
    .from('products')
    .select('id, name, stock')
    .eq('is_active', true)
    .lt('stock', 10)
    .order('stock', { ascending: true })
    .limit(5);

  // ── Most recent orders ──────────────────────────────────────────────────────
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5);

  // ── Popular products by number of paid order units ──────────────────────────
  const { data: allPaidOrders } = await supabase
    .from('orders')
    .select('items')
    .eq('status', 'paid');

  const productCount: Record<string, number> = {};
  for (const order of (allPaidOrders ?? []) as { items: { product_id: string; qty: number }[] }[]) {
    const items = Array.isArray(order.items) ? order.items : [];
    for (const item of items) {
      productCount[item.product_id] = (productCount[item.product_id] ?? 0) + item.qty;
    }
  }

  const topProductIds = Object.entries(productCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([id]) => id);

  let popularProducts: DashboardStats['popularProducts'] = [];
  if (topProductIds.length > 0) {
    const { data } = await supabase
      .from('products')
      .select('*')
      .in('id', topProductIds);

    popularProducts = (data ?? []).map((p) => ({
      ...(p as any),
      orders: productCount[p.id] ?? 0,
    })) as DashboardStats['popularProducts'];
  }

  // ── Orders split by status ──────────────────────────────────────────────────
  const statusCounts: Record<string, number> = {};
  const statuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

  await Promise.all(
    statuses.map(async (status) => {
      const { count } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', status);
      statusCounts[status] = count ?? 0;
    })
  );

  const dashboard: DashboardStats = {
    stats: {
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      ordersToday: ordersToday ?? 0,
      totalOrders: totalOrders ?? 0,
      totalProducts: totalProducts ?? 0,
    },
    ordersByStatus: statusCounts,
    lowStockProducts: (lowStock ?? []) as DashboardStats['lowStockProducts'],
    recentOrders: (recentOrders ?? []) as Order[],
    popularProducts,
  };

  res.json({ success: true, data: dashboard });
});

// ─── GET /api/admin/products — All products including inactive ─────────────────
router.get('/products', async (_req: AuthRequest, res: Response) => {
  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ success: false, error: error.message });
    return;
  }

  res.json({ success: true, data: { products: data ?? [], total: count ?? 0 } });
});

export default router;

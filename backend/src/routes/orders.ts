import { Router } from 'express';
import type { Response } from 'express';
import { requireAuth, requireAdmin } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import * as orderService from '../services/orderService';
import type { AuthRequest } from '../types';

const router: Router = Router();

// ─── Admin routes (MUST be before generic routes and requireAuth) ───────────
// GET /api/orders/admin — Admin: all orders
router.get('/admin', requireAdmin, async (req: AuthRequest, res: Response) => {
  const { page, limit, status } = req.query as Record<string, string>;

  const result = await orderService.getAllOrders({
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 20,
    status: status || undefined,
  });

  res.json({ success: true, data: result });
});

// PATCH /api/orders/admin/:id/status — Admin: update order status
router.patch(
  '/admin/:id/status',
  requireAdmin,
  validate(schemas.orderStatus),
  async (req: AuthRequest, res: Response) => {
    const { status } = req.body as { status: string };
    const order = await orderService.updateOrderStatus(req.params.id, status);
    res.json({ success: true, data: order });
  }
);

// All other user order routes require standard authentication
router.use(requireAuth);

// ─── POST /api/orders — Create a new order ────────────────────────────────────
router.post('/', validate(schemas.order), async (req: AuthRequest, res: Response) => {
  const order = await orderService.createOrder(req.user!.id, req.body);
  res.status(201).json({ success: true, data: order });
});

// ─── GET /api/orders — List user orders (paginated) ───────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  const { page, limit } = req.query as Record<string, string>;
  const result = await orderService.getUserOrders(req.user!.id, {
    page: page ? parseInt(page, 10) : 1,
    limit: limit ? parseInt(limit, 10) : 10,
  });
  res.json({ success: true, data: result });
});

// ─── GET /api/orders/:id — Get single order (own orders only) ─────────────────
router.get('/:id', async (req: AuthRequest, res: Response) => {
  const order = await orderService.getOrder(req.user!.id, req.params.id);
  res.json({ success: true, data: order });
});

// ─── PATCH /api/orders/:id/cancel — Cancel a pending order ───────────────────
router.patch('/:id/cancel', async (req: AuthRequest, res: Response) => {
  const order = await orderService.cancelOrder(req.user!.id, req.params.id);
  res.json({ success: true, data: order });
});

export default router;


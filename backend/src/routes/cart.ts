import { Router } from 'express';
import type { Response } from 'express';
import { requireAuth } from '../middlewares/auth';
import { validate, schemas } from '../middlewares/validate';
import * as cartService from '../services/cartService';
import type { AuthRequest } from '../types';

const router: Router = Router();

// All cart routes require a valid session
router.use(requireAuth);

// ─── GET /api/cart — Retrieve the current user's cart ────────────────────────
router.get('/', async (req: AuthRequest, res: Response) => {
  const cart = await cartService.getCart(req.user!.id);
  res.json({ success: true, data: cart });
});

// ─── POST /api/cart — Add an item to the cart ─────────────────────────────────
router.post('/', validate(schemas.cartItem), async (req: AuthRequest, res: Response) => {
  const { product_id, quantity } = req.body as { product_id: string; quantity: number };
  const item = await cartService.addToCart(req.user!.id, product_id, quantity);
  res.status(201).json({ success: true, data: item });
});

// ─── PUT /api/cart/:id — Update item quantity ─────────────────────────────────
router.put('/:id', validate(schemas.cartUpdate), async (req: AuthRequest, res: Response) => {
  const { quantity } = req.body as { quantity: number };
  const item = await cartService.updateCartItem(req.user!.id, req.params.id, quantity);
  res.json({ success: true, data: item });
});

// ─── DELETE /api/cart/:id — Remove a single item ─────────────────────────────
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  const result = await cartService.removeFromCart(req.user!.id, req.params.id);
  res.json({ success: true, data: result });
});

// ─── DELETE /api/cart — Clear entire cart ─────────────────────────────────────
router.delete('/', async (req: AuthRequest, res: Response) => {
  await cartService.clearCart(req.user!.id);
  res.json({ success: true, data: { message: 'Cart cleared' } });
});

export default router;

import { Router } from 'express';
import type { Request, Response } from 'express';
import supabase from '../config/supabase';
import { AppError } from '../middlewares/errorHandler';

const router: Router = Router();

/**
 * GET /api/ar/preview/:productId
 *
 * Returns AR / 3-D preview metadata for a product.
 *
 * The response includes:
 *  - images       : all product images to use in AR carousel
 *  - arSupported  : whether the product category supports AR
 *  - modelUrl     : URL of a GLTF/GLB 3-D model (if configured on the product)
 *  - instructions : user-facing copy for the AR experience
 *
 * Categories that support AR preview:
 *   Decor, Lighting, Bedroom, Living Room, Luxury, Jewellery
 */
const AR_SUPPORTED_CATEGORIES = new Set([
  'Decor',
  'Lighting',
  'Bedroom',
  'Living Room',
  'Luxury',
  'Jewellery',
  'Furniture',
  'Kitchen',
]);

router.get('/preview/:productId', async (req: Request, res: Response) => {
  const { productId } = req.params;

  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, category, images, tags, price, description')
    .eq('id', productId)
    .eq('is_active', true)
    .single();

  if (error || !product) {
    throw new AppError('Product not found', 404);
  }

  const arSupported = product.category
    ? AR_SUPPORTED_CATEGORIES.has(product.category)
    : false;

  const instructions = arSupported
    ? [
        'Tap "Launch AR" on your mobile device.',
        'Point your camera at a flat surface.',
        'Pinch to resize and drag to reposition.',
        'Walk around to see all angles.',
      ]
    : [
        'AR preview is not available for this product.',
        'Browse the images below to get a detailed look.',
      ];

  res.json({
    success: true,
    data: {
      product_id: product.id,
      name: product.name,
      category: product.category,
      images: product.images ?? [],
      arSupported,
      // modelUrl would point to a real GLTF file when available
      modelUrl: null,
      instructions,
      previewMessage: arSupported
        ? `See how "${product.name}" looks in your space before you buy.`
        : `Explore "${product.name}" with our HD image gallery.`,
    },
  });
});

/**
 * GET /api/ar/supported-categories
 * Returns the list of categories that support AR preview.
 */
router.get('/supported-categories', (_req: Request, res: Response) => {
  res.json({
    success: true,
    data: Array.from(AR_SUPPORTED_CATEGORIES),
  });
});

export default router;

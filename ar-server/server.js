/**
 * ALL BLUE — AR Preview Server
 * 
 * Standalone Node.js server that serves AR (Augmented Reality) preview 
 * experiences for products. Uses camera passthrough + product image overlay
 * to let users visualize products in their real environment.
 * 
 * Endpoints:
 *   GET /                  → Health check
 *   GET /ar/:productId     → AR viewer page for a specific product
 *   GET /api/ar/products   → List all products with AR support
 *   GET /api/ar/product/:id → Get AR-ready product data
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = parseInt(process.env.AR_PORT || '4000', 10);
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// ─── Middleware ──────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    const envOrigins = process.env.ALLOWED_ORIGINS?.split(",") || [];
    const allowed = [
      ...envOrigins,
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:5000',
      FRONTEND_URL
    ];
    if (!origin || allowed.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`[CORS] Origin ${origin} blocked on AR Server`);
      callback(new Error(`CORS: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ─── Product AR Data ────────────────────────────────────────────────────────
// Maps product IDs to AR-specific metadata (scale, offset, rotation hints)
const AR_PRODUCT_CONFIG = {
  "1": {
    name: "Modern Chair",
    category: "Living Room",
    arScale: 0.8,
    arYOffset: -0.3,
    arRotation: 0,
    placementType: "floor",
    dimensions: { width: 0.6, height: 0.9, depth: 0.6 },
    description: "Place this modern chair in your room to see how it fits."
  },
  "2": {
    name: "Ceramic Vase",
    category: "Decor",
    arScale: 0.4,
    arYOffset: 0,
    arRotation: 0,
    placementType: "surface",
    dimensions: { width: 0.2, height: 0.35, depth: 0.2 },
    description: "See how this ceramic vase looks on your table or shelf."
  },
  "3": {
    name: "Wood Table",
    category: "Living Room",
    arScale: 1.0,
    arYOffset: -0.3,
    arRotation: 0,
    placementType: "floor",
    dimensions: { width: 1.2, height: 0.75, depth: 0.7 },
    description: "Visualize this wood table in your living space."
  },
  "4": {
    name: "Pendant Lamp",
    category: "Lighting",
    arScale: 0.5,
    arYOffset: 1.5,
    arRotation: 0,
    placementType: "ceiling",
    dimensions: { width: 0.3, height: 0.4, depth: 0.3 },
    description: "See how this pendant lamp would look hanging in your room."
  },
  "5": {
    name: "Storage Unit",
    category: "Bedroom",
    arScale: 0.9,
    arYOffset: -0.3,
    arRotation: 0,
    placementType: "floor",
    dimensions: { width: 0.8, height: 1.5, depth: 0.4 },
    description: "Check how this storage unit fits in your bedroom."
  },
  "6": {
    name: "Wall Mirror",
    category: "Decor",
    arScale: 0.6,
    arYOffset: 0.5,
    arRotation: 0,
    placementType: "wall",
    dimensions: { width: 0.6, height: 0.6, depth: 0.05 },
    description: "See how this mirror looks on your wall."
  },
  "7": {
    name: "Minimalist Bed",
    category: "Bedroom",
    arScale: 1.2,
    arYOffset: -0.3,
    arRotation: 0,
    placementType: "floor",
    dimensions: { width: 1.6, height: 0.5, depth: 2.0 },
    description: "Visualize this bed in your bedroom space."
  }
};

// Default config for unknown products
const DEFAULT_AR_CONFIG = {
  arScale: 0.5,
  arYOffset: 0,
  arRotation: 0,
  placementType: "surface",
  dimensions: { width: 0.3, height: 0.3, depth: 0.3 },
  description: "See how this product looks in your space."
};

// ─── Health Check ───────────────────────────────────────────────────────────
app.get('/', (_req, res) => {
  res.json({
    success: true,
    service: 'ALL BLUE — AR Preview Server',
    version: '1.0.0',
    endpoints: {
      viewer: '/ar/:productId',
      products: '/api/ar/products',
      product: '/api/ar/product/:id',
    }
  });
});

// ─── API: Get all AR-enabled products ───────────────────────────────────────
app.get('/api/ar/products', (_req, res) => {
  const products = Object.entries(AR_PRODUCT_CONFIG).map(([id, config]) => ({
    id,
    ...config,
  }));
  res.json({ success: true, data: products });
});

// ─── API: Get AR config for a product ───────────────────────────────────────
app.get('/api/ar/product/:id', (req, res) => {
  const { id } = req.params;
  const config = AR_PRODUCT_CONFIG[id] || { ...DEFAULT_AR_CONFIG, name: `Product ${id}` };
  res.json({ 
    success: true, 
    data: { id, ...config, arEnabled: !!AR_PRODUCT_CONFIG[id] } 
  });
});

// ─── API: Proxy image for CORS ──────────────────────────────────────────────
app.get('/proxy', async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send('URL is required');
  
  try {
    console.log(`[Proxy] Fetching: ${url}`);
    
    // Some sites like Pinterest are very picky about headers
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Referer': 'https://www.pinterest.com/',
        'Sec-Ch-Ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': '"Windows"',
        'Sec-Fetch-Dest': 'image',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    });

    if (!response.ok) {
      console.error(`[Proxy] Failed to fetch ${url}: ${response.status} ${response.statusText}`);
      // Return a 404 or original status instead of 500 to help debugging
      return res.status(response.status).send(`Failed to fetch image: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType) {
      res.setHeader('Content-Type', contentType);
    } else {
      // Fallback if no content type
      res.setHeader('Content-Type', 'image/png');
    }
    
    // Essential CORS and security headers for cross-origin canvas usage
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    res.send(buffer);
  } catch (error) {
    console.error('[Proxy] Fatal error:', error);
    res.status(500).send('Error fetching image through proxy');
  }
});

// ─── AR Viewer Page ─────────────────────────────────────────────────────────
app.get('/ar/:productId', (req, res) => {
  const { productId } = req.params;
  const config = AR_PRODUCT_CONFIG[productId] || { ...DEFAULT_AR_CONFIG, name: `Product ${productId}` };
  
  // Get product image URL and back URL from query params
  const rawImageUrl = req.query.image || '';
  const backUrl = req.query.back || `${FRONTEND_URL}/shop/${productId}`;
  const productName = req.query.name || config.name;

  // Resolve final image URL
  let finalImageUrl = rawImageUrl;
  if (rawImageUrl && !rawImageUrl.startsWith('http')) {
    // Relative URL, assume it's from the frontend
    finalImageUrl = `${FRONTEND_URL}${rawImageUrl.startsWith('/') ? '' : '/'}${rawImageUrl}`;
  }

  // Use proxy for all images that are not on this server's origin
  // This ensures we always have CORS headers for canvas capture
  const imageUrl = finalImageUrl && !finalImageUrl.includes(`localhost:${PORT}`)
    ? `http://localhost:${PORT}/proxy?url=${encodeURIComponent(finalImageUrl)}`
    : finalImageUrl;

  res.send(generateARViewerHTML({
    productId,
    productName,
    imageUrl,
    backUrl,
    config,
    frontendUrl: FRONTEND_URL,
  }));
});

// ─── Generate AR Viewer HTML ────────────────────────────────────────────────
function generateARViewerHTML({ productId, productName, imageUrl, backUrl, config, frontendUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>AR Preview — ${productName} | ALL BLUE</title>
  <meta name="description" content="View ${productName} in your space with AR Preview by ALL BLUE">
  <meta name="mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-capable" content="yes">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Inter', sans-serif;
      background: #000;
      color: #fff;
      overflow: hidden;
      height: 100vh;
      width: 100vw;
      position: relative;
      -webkit-user-select: none;
      user-select: none;
    }

    /* Camera feed */
    #camera-feed {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: 1;
      transform: scaleX(-1);
    }

    /* AR Canvas overlay */
    #ar-canvas {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      z-index: 2;
      pointer-events: none;
    }

    /* Product overlay (draggable) */
    #product-overlay {
      position: fixed;
      z-index: 10;
      cursor: grab;
      touch-action: none;
      filter: drop-shadow(0 20px 40px rgba(0,0,0,0.4));
      transition: transform 0.1s ease-out;
    }

    #product-overlay:active {
      cursor: grabbing;
    }

    #product-overlay img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      pointer-events: none;
    }

    /* Surface detection indicator */
    .surface-indicator {
      position: fixed;
      z-index: 5;
      width: 200px;
      height: 100px;
      left: 50%;
      top: 60%;
      transform: translate(-50%, -50%) perspective(500px) rotateX(60deg);
      border: 2px dashed rgba(100, 140, 255, 0.6);
      border-radius: 50%;
      background: radial-gradient(ellipse, rgba(100, 140, 255, 0.1), transparent);
      pointer-events: none;
      animation: surfacePulse 2s ease-in-out infinite;
    }

    @keyframes surfacePulse {
      0%, 100% { opacity: 0.6; transform: translate(-50%, -50%) perspective(500px) rotateX(60deg) scale(1); }
      50% { opacity: 1; transform: translate(-50%, -50%) perspective(500px) rotateX(60deg) scale(1.05); }
    }

    .surface-indicator.placed {
      border-color: rgba(80, 200, 120, 0.6);
      background: radial-gradient(ellipse, rgba(80, 200, 120, 0.1), transparent);
      animation: none;
      opacity: 0.4;
    }

    /* Top header bar */
    .ar-header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 100;
      padding: 12px 16px;
      padding-top: max(12px, env(safe-area-inset-top));
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: linear-gradient(to bottom, rgba(0,0,0,0.7), transparent);
    }

    .ar-header .back-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      color: #fff;
      padding: 10px 18px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 700;
      cursor: pointer;
      text-decoration: none;
      letter-spacing: 0.5px;
      transition: all 0.2s;
    }

    .ar-header .back-btn:hover {
      background: rgba(255,255,255,0.25);
    }

    .ar-header .back-btn svg {
      width: 16px;
      height: 16px;
    }

    .ar-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(100, 140, 255, 0.2);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(100, 140, 255, 0.3);
      padding: 8px 16px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(150, 180, 255, 1);
    }

    .ar-badge .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #50c878;
      animation: blink 1.5s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.3; }
    }

    /* Bottom controls */
    .ar-controls {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 100;
      padding: 20px 16px;
      padding-bottom: max(20px, env(safe-area-inset-bottom));
      background: linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.4), transparent);
    }

    .product-info-bar {
      display: flex;
      align-items: center;
      gap: 14px;
      margin-bottom: 16px;
      background: rgba(255,255,255,0.1);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.15);
      padding: 14px 18px;
      border-radius: 24px;
    }

    .product-info-bar .thumb {
      width: 48px;
      height: 48px;
      border-radius: 14px;
      background: rgba(255,255,255,0.1);
      overflow: hidden;
      flex-shrink: 0;
    }

    .product-info-bar .thumb img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .product-info-bar .details {
      flex: 1;
      min-width: 0;
    }

    .product-info-bar .details h3 {
      font-size: 15px;
      font-weight: 800;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 2px;
    }

    .product-info-bar .details p {
      font-size: 11px;
      color: rgba(255,255,255,0.5);
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .controls-row {
      display: flex;
      gap: 10px;
      justify-content: center;
      align-items: center;
    }

    .ctrl-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      background: rgba(255,255,255,0.12);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.15);
      color: #fff;
      padding: 14px 20px;
      border-radius: 18px;
      font-size: 12px;
      font-weight: 700;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      transition: all 0.2s;
      flex: 1;
      max-width: 160px;
    }

    .ctrl-btn:hover {
      background: rgba(255,255,255,0.2);
    }

    .ctrl-btn:active {
      transform: scale(0.96);
    }

    .ctrl-btn.primary {
      background: rgba(100, 140, 255, 0.3);
      border-color: rgba(100, 140, 255, 0.4);
    }

    .ctrl-btn svg {
      width: 18px;
      height: 18px;
      flex-shrink: 0;
    }

    /* Scale slider */
    .scale-control {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 18px;
      background: rgba(255,255,255,0.08);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 18px;
      margin-bottom: 12px;
    }

    .scale-control label {
      font-size: 10px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: rgba(255,255,255,0.5);
      white-space: nowrap;
    }

    .scale-control input[type="range"] {
      flex: 1;
      -webkit-appearance: none;
      appearance: none;
      height: 4px;
      background: rgba(255,255,255,0.2);
      border-radius: 4px;
      outline: none;
    }

    .scale-control input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      background: #fff;
      cursor: pointer;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
    }

    .scale-control .scale-value {
      font-size: 12px;
      font-weight: 800;
      color: rgba(100, 140, 255, 1);
      min-width: 36px;
      text-align: right;
    }

    /* Loading screen */
    .loading-screen {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: #0a0a0a;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 24px;
      transition: opacity 0.5s, visibility 0.5s;
    }

    .loading-screen.hidden {
      opacity: 0;
      visibility: hidden;
    }

    .loading-screen h1 {
      font-size: 28px;
      font-weight: 900;
      letter-spacing: -1px;
    }

    .loading-screen p {
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      max-width: 280px;
      text-align: center;
      line-height: 1.5;
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      border: 3px solid rgba(255,255,255,0.1);
      border-top-color: rgba(100, 140, 255, 0.8);
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Permission denied */
    .permission-screen {
      position: fixed;
      inset: 0;
      z-index: 1000;
      background: #0a0a0a;
      display: none;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 20px;
      padding: 32px;
      text-align: center;
    }

    .permission-screen.show {
      display: flex;
    }

    .permission-screen .icon {
      width: 64px;
      height: 64px;
      border-radius: 20px;
      background: rgba(255, 80, 80, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .permission-screen .icon svg {
      width: 28px;
      height: 28px;
      color: #ff5050;
    }

    .permission-screen h2 {
      font-size: 22px;
      font-weight: 800;
    }

    .permission-screen p {
      font-size: 14px;
      color: rgba(255,255,255,0.5);
      line-height: 1.6;
      max-width: 320px;
    }

    .permission-screen .retry-btn {
      background: #fff;
      color: #000;
      padding: 14px 32px;
      border-radius: 14px;
      font-size: 13px;
      font-weight: 800;
      border: none;
      cursor: pointer;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-top: 8px;
    }

    /* Toast notification */
    .ar-toast {
      position: fixed;
      top: 80px;
      left: 50%;
      transform: translateX(-50%) translateY(-20px);
      z-index: 200;
      background: rgba(255,255,255,0.15);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.2);
      padding: 12px 24px;
      border-radius: 100px;
      font-size: 13px;
      font-weight: 700;
      opacity: 0;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      pointer-events: none;
      white-space: nowrap;
    }

    .ar-toast.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }

    /* Crosshair */
    .crosshair {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 3;
      width: 40px;
      height: 40px;
      pointer-events: none;
      opacity: 0.4;
    }

    .crosshair::before,
    .crosshair::after {
      content: '';
      position: absolute;
      background: #fff;
      border-radius: 2px;
    }

    .crosshair::before {
      width: 2px;
      height: 100%;
      left: 50%;
      transform: translateX(-50%);
    }

    .crosshair::after {
      width: 100%;
      height: 2px;
      top: 50%;
      transform: translateY(-50%);
    }

    /* Instruction overlay */
    .instruction-overlay {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 50;
      text-align: center;
      pointer-events: none;
      transition: opacity 0.5s;
    }

    .instruction-overlay.hidden {
      opacity: 0;
    }

    .instruction-overlay .inst-text {
      background: rgba(0,0,0,0.6);
      backdrop-filter: blur(20px);
      padding: 16px 28px;
      border-radius: 18px;
      font-size: 14px;
      font-weight: 600;
      line-height: 1.5;
      border: 1px solid rgba(255,255,255,0.1);
    }

    /* Rotation indicator */
    .rotation-hint {
      position: fixed;
      bottom: 220px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 50;
      font-size: 11px;
      font-weight: 700;
      color: rgba(255,255,255,0.4);
      text-transform: uppercase;
      letter-spacing: 1px;
      pointer-events: none;
    }

    /* Screenshot flash */
    .flash {
      position: fixed;
      inset: 0;
      z-index: 500;
      background: #fff;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.1s;
    }

    .flash.active {
      opacity: 0.8;
      transition: none;
    }
  </style>
</head>
<body>

  <!-- Loading Screen -->
  <div class="loading-screen" id="loadingScreen">
    <div style="font-size: 36px; font-weight: 900; letter-spacing: -1.5px;">ALL BLUE</div>
    <div class="loading-spinner"></div>
    <p>Initializing AR Preview<br>Please allow camera access</p>
  </div>

  <!-- Permission Denied Screen -->
  <div class="permission-screen" id="permissionScreen">
    <div class="icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16.88 3.549L7.12 3.549"/>
        <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        <path d="M15 9l-6 6M9 9l6 6"/>
      </svg>
    </div>
    <h2>Camera Access Needed</h2>
    <p>To use AR Preview, please allow camera access in your browser settings and try again.</p>
    <button class="retry-btn" onclick="initCamera()">Try Again</button>
    <a href="${backUrl}" style="color: rgba(255,255,255,0.5); font-size: 13px; margin-top: 8px; text-decoration: underline;">Return to Product</a>
  </div>

  <!-- Camera Feed -->
  <video id="camera-feed" autoplay playsinline muted></video>

  <!-- Crosshair -->
  <div class="crosshair" id="crosshair"></div>

  <!-- Surface Detection Indicator -->
  <div class="surface-indicator" id="surfaceIndicator"></div>

  <!-- Product Overlay -->
  <div id="product-overlay" style="display: none;">
    <img id="product-image" src="" alt="${productName}" crossorigin="anonymous">
  </div>

  <!-- Instructions -->
  <div class="instruction-overlay" id="instructionOverlay">
    <div class="inst-text">
      Tap anywhere to place product<br>
      Drag to move &bull; Pinch to resize
    </div>
  </div>

  <!-- Header -->
  <div class="ar-header" id="arHeader" style="display: none;">
    <a href="${backUrl}" class="back-btn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back
    </a>
    <div class="ar-badge">
      <span class="dot"></span>
      AR LIVE
    </div>
  </div>

  <!-- Bottom Controls -->
  <div class="ar-controls" id="arControls" style="display: none;">
    <div class="product-info-bar">
      <div class="thumb">
        <img id="thumbImage" src="" alt="">
      </div>
      <div class="details">
        <h3 id="productTitle">${productName}</h3>
        <p id="productPlacement">${config.description || 'View in your space'}</p>
      </div>
    </div>

    <div class="scale-control">
      <label>Size</label>
      <input type="range" id="scaleSlider" min="30" max="200" value="100">
      <span class="scale-value" id="scaleValue">100%</span>
    </div>

    <div class="controls-row">
      <button class="ctrl-btn" id="rotateBtn" onclick="rotateProduct()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/>
        </svg>
        Rotate
      </button>
      <button class="ctrl-btn primary" id="captureBtn" onclick="captureScreenshot()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/>
          <circle cx="12" cy="13" r="4"/>
        </svg>
        Capture
      </button>
      <button class="ctrl-btn" id="resetBtn" onclick="resetProduct()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 12a9 9 0 019-9 9.75 9.75 0 016.74 2.74L21 8"/>
          <path d="M21 3v5h-5"/>
          <path d="M21 12a9 9 0 01-9 9 9.75 9.75 0 01-6.74-2.74L3 16"/>
          <path d="M8 16H3v5"/>
        </svg>
        Reset
      </button>
    </div>
  </div>

  <!-- Toast -->
  <div class="ar-toast" id="arToast"></div>

  <!-- Flash (for screenshot) -->
  <div class="flash" id="flash"></div>

  <!-- Rotation hint -->
  <div class="rotation-hint" id="rotationHint" style="display: none;">Use two fingers to rotate</div>

  <script>
    // ─── Configuration ────────────────────────────────────────────────
    const PRODUCT_ID = "${productId}";
    const IMAGE_URL = "${imageUrl}";
    const PRODUCT_NAME = "${productName}";
    const AR_CONFIG = ${JSON.stringify(config)};
    const BASE_SIZE = 250; // Base size in pixels

    // ─── State ────────────────────────────────────────────────────────
    let isPlaced = false;
    let currentRotation = 0;
    let currentScale = 1;
    let productX = window.innerWidth / 2;
    let productY = window.innerHeight * 0.55;
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;
    let lastTouchDistance = 0;

    // ─── Elements ─────────────────────────────────────────────────────
    const video = document.getElementById('camera-feed');
    const overlay = document.getElementById('product-overlay');
    const productImg = document.getElementById('product-image');
    const thumbImg = document.getElementById('thumbImage');
    const loadingScreen = document.getElementById('loadingScreen');
    const permissionScreen = document.getElementById('permissionScreen');
    const arHeader = document.getElementById('arHeader');
    const arControls = document.getElementById('arControls');
    const instructionOverlay = document.getElementById('instructionOverlay');
    const surfaceIndicator = document.getElementById('surfaceIndicator');
    const crosshair = document.getElementById('crosshair');
    const scaleSlider = document.getElementById('scaleSlider');
    const scaleValue = document.getElementById('scaleValue');
    const flash = document.getElementById('flash');
    const toast = document.getElementById('arToast');

    // ─── Initialize Camera ────────────────────────────────────────────
    async function initCamera() {
      permissionScreen.classList.remove('show');
      loadingScreen.classList.remove('hidden');

      try {
        const constraints = {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
          audio: false,
        };

        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        video.srcObject = stream;
        
        await new Promise((resolve) => {
          video.onloadedmetadata = resolve;
        });

        // Load product image
        if (IMAGE_URL) {
          productImg.src = IMAGE_URL;
          thumbImg.src = IMAGE_URL;
        }

        // Ready
        setTimeout(() => {
          loadingScreen.classList.add('hidden');
          arHeader.style.display = 'flex';
          arControls.style.display = 'block';
          showToast('Tap anywhere to place ' + PRODUCT_NAME);
        }, 800);

      } catch (err) {
        console.error('Camera error:', err);
        loadingScreen.classList.add('hidden');
        permissionScreen.classList.add('show');
      }
    }

    // ─── Place Product ────────────────────────────────────────────────
    function placeProduct(x, y) {
      if (isPlaced) return;
      
      isPlaced = true;
      productX = x;
      productY = y;

      const size = BASE_SIZE * (AR_CONFIG.arScale || 0.5);
      overlay.style.display = 'block';
      overlay.style.width = size + 'px';
      overlay.style.height = size + 'px';
      updateProductPosition();

      // Update UI
      surfaceIndicator.classList.add('placed');
      instructionOverlay.classList.add('hidden');
      crosshair.style.display = 'none';
      
      showToast('Product placed! Drag to reposition');

      // Enable pointer events on overlay
      overlay.style.pointerEvents = 'auto';
    }

    function updateProductPosition() {
      const size = BASE_SIZE * (AR_CONFIG.arScale || 0.5) * currentScale;
      overlay.style.width = size + 'px';
      overlay.style.height = size + 'px';
      overlay.style.left = (productX - size / 2) + 'px';
      overlay.style.top = (productY - size / 2) + 'px';
      overlay.style.transform = 'rotate(' + currentRotation + 'deg)';
    }

    // ─── Touch/Click Handlers ─────────────────────────────────────────
    document.addEventListener('click', (e) => {
      if (e.target.closest('.ar-header') || e.target.closest('.ar-controls') || 
          e.target.closest('#product-overlay')) return;
      
      if (!isPlaced) {
        placeProduct(e.clientX, e.clientY);
      }
    });

    // Drag support (mouse)
    overlay.addEventListener('mousedown', (e) => {
      if (!isPlaced) return;
      isDragging = true;
      const rect = overlay.getBoundingClientRect();
      dragOffsetX = e.clientX - (rect.left + rect.width / 2);
      dragOffsetY = e.clientY - (rect.top + rect.height / 2);
      overlay.style.cursor = 'grabbing';
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      productX = e.clientX - dragOffsetX;
      productY = e.clientY - dragOffsetY;
      updateProductPosition();
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
      overlay.style.cursor = 'grab';
    });

    // Touch support
    overlay.addEventListener('touchstart', (e) => {
      if (!isPlaced) return;
      
      if (e.touches.length === 1) {
        isDragging = true;
        const touch = e.touches[0];
        const rect = overlay.getBoundingClientRect();
        dragOffsetX = touch.clientX - (rect.left + rect.width / 2);
        dragOffsetY = touch.clientY - (rect.top + rect.height / 2);
      } else if (e.touches.length === 2) {
        // Pinch-to-zoom start
        isDragging = false;
        lastTouchDistance = getTouchDistance(e.touches);
      }
      e.preventDefault();
    }, { passive: false });

    document.addEventListener('touchmove', (e) => {
      if (!isPlaced) return;

      if (e.touches.length === 1 && isDragging) {
        const touch = e.touches[0];
        productX = touch.clientX - dragOffsetX;
        productY = touch.clientY - dragOffsetY;
        updateProductPosition();
      } else if (e.touches.length === 2) {
        // Pinch-to-zoom
        const dist = getTouchDistance(e.touches);
        if (lastTouchDistance > 0) {
          const delta = dist / lastTouchDistance;
          currentScale = Math.max(0.3, Math.min(2, currentScale * delta));
          scaleSlider.value = Math.round(currentScale * 100);
          scaleValue.textContent = Math.round(currentScale * 100) + '%';
          updateProductPosition();
        }
        lastTouchDistance = dist;
      }
    }, { passive: false });

    document.addEventListener('touchend', (e) => {
      if (e.touches.length === 0) {
        isDragging = false;
        lastTouchDistance = 0;
      }

      // Tap to place (on areas outside overlay)
      if (!isPlaced && e.changedTouches.length === 1) {
        const touch = e.changedTouches[0];
        const el = document.elementFromPoint(touch.clientX, touch.clientY);
        if (!el || (!el.closest('.ar-header') && !el.closest('.ar-controls'))) {
          placeProduct(touch.clientX, touch.clientY);
        }
      }
    });

    function getTouchDistance(touches) {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    }

    // ─── Scale Slider ─────────────────────────────────────────────────
    scaleSlider.addEventListener('input', (e) => {
      currentScale = parseInt(e.target.value) / 100;
      scaleValue.textContent = e.target.value + '%';
      if (isPlaced) updateProductPosition();
    });

    // ─── Controls ─────────────────────────────────────────────────────
    function rotateProduct() {
      if (!isPlaced) {
        showToast('Place the product first');
        return;
      }
      currentRotation = (currentRotation + 45) % 360;
      updateProductPosition();
      showToast('Rotated to ' + currentRotation + ' degrees');
    }

    function resetProduct() {
      isPlaced = false;
      currentRotation = 0;
      currentScale = 1;
      productX = window.innerWidth / 2;
      productY = window.innerHeight * 0.55;
      overlay.style.display = 'none';
      overlay.style.pointerEvents = 'none';
      surfaceIndicator.classList.remove('placed');
      instructionOverlay.classList.remove('hidden');
      crosshair.style.display = 'block';
      scaleSlider.value = 100;
      scaleValue.textContent = '100%';
      showToast('Reset — tap to place again');
    }

    async function captureScreenshot() {
      if (!isPlaced) {
        showToast('Place the product first');
        return;
      }

      try {
        // Flash effect
        flash.classList.add('active');
        setTimeout(() => flash.classList.remove('active'), 150);

        // Create canvas combining video + product
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 1920;
        canvas.height = video.videoHeight || 1080;
        const ctx = canvas.getContext('2d');

        // Draw video frame (flip back since video is mirrored)
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
        ctx.restore();

        // Draw product overlay at its position (scaled to canvas coords)
        if (productImg.complete && productImg.naturalWidth > 0) {
          const scaleX = canvas.width / window.innerWidth;
          const scaleY = canvas.height / window.innerHeight;
          const size = BASE_SIZE * (AR_CONFIG.arScale || 0.5) * currentScale;
          const drawW = size * scaleX;
          const drawH = size * scaleY;
          const drawX = (productX - size / 2) * scaleX;
          const drawY = (productY - size / 2) * scaleY;

          ctx.save();
          ctx.translate(drawX + drawW / 2, drawY + drawH / 2);
          ctx.rotate(currentRotation * Math.PI / 180);
          ctx.drawImage(productImg, -drawW / 2, -drawH / 2, drawW, drawH);
          ctx.restore();
        }

        // Download
        canvas.toBlob((blob) => {
          if (!blob) return;
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'AR_Preview_' + PRODUCT_NAME.replace(/\\s+/g, '_') + '_' + Date.now() + '.jpg';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast('Screenshot saved!');
        }, 'image/jpeg', 0.92);

      } catch (err) {
        console.error('Screenshot error:', err);
        showToast('Could not capture screenshot');
      }
    }

    // ─── Toast ────────────────────────────────────────────────────────
    function showToast(message) {
      toast.textContent = message;
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2500);
    }

    // ─── Initialize ───────────────────────────────────────────────────
    initCamera();
  </script>
</body>
</html>`;
}

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log('');
  console.log('  ALL BLUE — AR Preview Server v1.0.0');
  console.log('  ────────────────────────────────────');
  console.log('  Port     :', PORT);
  console.log('  Frontend :', FRONTEND_URL);
  console.log('  Health   : http://localhost:' + PORT);
  console.log('  AR View  : http://localhost:' + PORT + '/ar/:productId');
  console.log('');
});

module.exports = app;

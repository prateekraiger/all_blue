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
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const dotenv = __importStar(require("dotenv"));
const supabase_js_1 = require("@supabase/supabase-js");
// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
if (!supabaseUrl || !supabaseServiceRoleKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}
const supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseServiceRoleKey);
async function syncProducts() {
    try {
        const filePath = path.resolve(__dirname, '../../products_api.json');
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File not found: ${filePath}`);
            process.exit(1);
        }
        let content = fs.readFileSync(filePath, 'utf8');
        // Remove BOM if present
        if (content.charCodeAt(0) === 0xFEFF) {
            content = content.slice(1);
        }
        const jsonData = JSON.parse(content);
        const productsData = jsonData.data?.products || jsonData.products || [];
        console.log(`📦 Found ${productsData.length} products in JSON. Syncing...`);
        for (const product of productsData) {
            const { updated_at, ...productToUpsert } = product; // Avoid issues if updated_at is auto-managed
            const { data, error } = await supabase
                .from('products')
                .upsert(productToUpsert, { onConflict: 'id' })
                .select()
                .single();
            if (error) {
                console.error(`❌ Error upserting product ${product.id} (${product.name}):`, error.message);
            }
            else {
                console.log(`✅ Synced: ${product.name}`);
            }
        }
        console.log('✨ All products synced successfully.');
    }
    catch (err) {
        console.error('❌ Sync failed:', err.message);
    }
}
syncProducts();
//# sourceMappingURL=syncProducts.js.map
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

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
      } else {
        console.log(`✅ Synced: ${product.name}`);
      }
    }

    console.log('✨ All products synced successfully.');
  } catch (err: any) {
    console.error('❌ Sync failed:', err.message);
  }
}

syncProducts();

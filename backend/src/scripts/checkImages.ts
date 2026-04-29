import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function checkProducts() {
  const { data: products, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  
  let issues = 0;
  for (const p of products) {
    if (!p.images || p.images.length === 0 || p.images[0] === '/placeholder.jpg' || !p.images[0].startsWith('http')) {
      console.log(`Product missing valid image: ${p.id} - ${p.name} - images:`, p.images);
      issues++;
    } else {
      console.log(`${p.name}: ${p.images[0]}`);
    }
  }
  console.log(`Total products: ${products.length}. Issues found: ${issues}`);
}

checkProducts();

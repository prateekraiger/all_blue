import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCustomProducts() {
  console.log('--- Custom Product Seeder ---');

  let customProducts = [];
  try {
    const rawData = fs.readFileSync(resolve(__dirname, 'products.json'), 'utf-8');
    customProducts = JSON.parse(rawData);
  } catch (error) {
    console.error('Could not read or parse products.json. Please make sure the file exists in the scripts directory and contains valid JSON.');
    console.error(error);
    process.exit(1);
  }

  const formattedProducts = customProducts.map((p: any) => ({
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category || 'Uncategorized',
    images: p.images || (p.image ? [p.image] : []),
    tags: p.tags || (p.category ? [p.category.toLowerCase()] : []),
    stock: p.stock !== undefined ? p.stock : 50,
    is_active: p.is_active !== undefined ? p.is_active : true
  }));

  const { data, error } = await supabase
    .from('products')
    .insert(formattedProducts)
    .select();

  if (error) {
    console.error('Error seeding products:', error.message);
  } else {
    console.log(`Successfully seeded ${data?.length} custom products!`);
  }
}

seedCustomProducts();

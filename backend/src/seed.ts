
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const products = [
  { name: "Modern Chair", category: "Living Room", price: 29900, tags: ["furniture", "minimalist"], images: ["/modern-minimalist-chair.jpg"], stock: 10, description: "A sleek, modern chair for your living room." },
  { name: "Ceramic Vase", category: "Decor", price: 8900, tags: ["decor", "minimalist", "ceramic"], images: ["/minimalist-ceramic-vase.png"], stock: 10, description: "Handcrafted ceramic vase with a minimalist touch." },
  { name: "Wood Table", category: "Living Room", price: 59900, tags: ["furniture", "minimalist", "wood"], images: ["/minimalist-wood-table.jpg"], stock: 10, description: "Solid wood table with a light finish." },
  { name: "Pendant Lamp", category: "Lighting", price: 15900, tags: ["lighting", "minimalist"], images: ["/minimalist-pendant-lamp.jpg"], stock: 10, description: "Elegant pendant lamp for a soft ambiance." },
  { name: "Storage Unit", category: "Bedroom", price: 44900, tags: ["furniture", "minimalist"], images: ["/minimalist-storage-cabinet.jpg"], stock: 10, description: "Versatile storage unit for any room." },
  { name: "Wall Mirror", category: "Decor", price: 19900, tags: ["decor", "minimalist"], images: ["/minimalist-round-mirror.jpg"], stock: 10, description: "Minimalist round mirror for your wall." },
  { name: "Minimalist Bed", category: "Bedroom", price: 89900, tags: ["furniture", "bedroom"], images: ["/modern-minimalist-bedroom.png"], stock: 5, description: "A comfortable and stylish bed for the modern bedroom." },
];

async function seed() {
  console.log('Seeding products...');
  
  const { data: existingProducts, error: fetchError } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (fetchError) {
    console.error('Error checking existing products:', fetchError);
    return;
  }

  if (existingProducts && existingProducts.length > 0) {
    console.log('Products already exist in the database. Skipping seed.');
    return;
  }

  const { data, error } = await supabase
    .from('products')
    .insert(products);

  if (error) {
    console.error('Error seeding products:', error);
  } else {
    console.log('Products seeded successfully!');
  }
}

seed();

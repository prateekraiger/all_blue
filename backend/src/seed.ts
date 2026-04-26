
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
  { name: "Modern Chair", category: "Living Room", price: 29900, tags: ["furniture", "minimalist"], images: ["https://images.unsplash.com/photo-1592078615290-033ee584e267?auto=format&fit=crop&q=80&w=800"], stock: 10, description: "A sleek, modern chair for your living room." },
  { name: "Ceramic Vase", category: "Decor", price: 8900, tags: ["decor", "minimalist", "ceramic"], images: ["https://images.unsplash.com/photo-1581783898377-1c85bf937427?auto=format&fit=crop&q=80&w=800"], stock: 10, description: "Handcrafted ceramic vase with a minimalist touch." },
  { name: "Wood Table", category: "Living Room", price: 59900, tags: ["furniture", "minimalist", "wood"], images: ["https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&q=80&w=800"], stock: 10, description: "Solid wood table with a light finish." },
  { name: "Pendant Lamp", category: "Lighting", price: 15900, tags: ["lighting", "minimalist"], images: ["https://images.unsplash.com/photo-1507473884658-c4a3dd12b5b5?auto=format&fit=crop&q=80&w=800"], stock: 10, description: "Elegant pendant lamp for a soft ambiance." },
  { name: "Storage Unit", category: "Bedroom", price: 44900, tags: ["furniture", "minimalist"], images: ["https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&q=80&w=800"], stock: 10, description: "Versatile storage unit for any room." },
  { name: "Wall Mirror", category: "Decor", price: 19900, tags: ["decor", "minimalist"], images: ["https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&q=80&w=800"], stock: 10, description: "Minimalist round mirror for your wall." },
  { name: "Minimalist Bed", category: "Bedroom", price: 89900, tags: ["furniture", "bedroom"], images: ["https://images.unsplash.com/photo-1505693419148-ad3b17448efc?auto=format&fit=crop&q=80&w=800"], stock: 5, description: "A comfortable and stylish bed for the modern bedroom." },
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

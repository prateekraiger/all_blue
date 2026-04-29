import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

const updates: Record<string, string> = {
  "Caricature Illustration Digital Print": "https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=800",
  "Personalized Welcome Door Sign": "https://images.unsplash.com/photo-1589136171542-a72eb56bb8c2?auto=format&fit=crop&q=80&w=800",
  "Gaming Mousepad & Coaster Set": "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?auto=format&fit=crop&q=80&w=800",
  "Personalized Spotify Art Frame": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&q=80&w=800",
  "3D Moon Lamp – Rechargeable Night Light": "https://images.unsplash.com/photo-1532054041183-500b84803964?auto=format&fit=crop&q=80&w=800",
};

async function fixProducts() {
  const { data: products, error } = await supabase.from('products').select('*');
  
  if (error) {
    console.error('Error fetching products:', error);
    return;
  }
  
  for (const p of products) {
    if (updates[p.name]) {
      const { error: updateError } = await supabase
        .from('products')
        .update({ images: [updates[p.name]] })
        .eq('id', p.id);
      
      if (updateError) {
        console.error(`Failed to update ${p.name}:`, updateError);
      } else {
        console.log(`Updated ${p.name} with Unsplash URL.`);
      }
    }
  }
}

fixProducts();

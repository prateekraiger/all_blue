
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

async function checkProducts() {
  const { data, error, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' });

  if (error) {
    console.error('Error fetching products:', error);
    return;
  }

  console.log(`Products count: ${count}`);
  if (data && data.length > 0) {
    console.log('Sample product:', data[0]);
  } else {
    console.log('No products found in the database.');
  }
}

checkProducts();

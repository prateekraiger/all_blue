import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load environment variables
dotenv.config({ path: resolve(__dirname, '../.env') });

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const customProducts = [
  {
    "name": "Personalized Ceramic Mug",
    "description": "Customizable white ceramic mug perfect for coffee lovers, featuring names, dates, or photos. Ideal for birthdays, anniversaries, or daily use with a capacity of 11 oz.",
    "price": 2990, // Assuming price is in major units, converting to cents
    "category": "Personalized Gifts",
    "image": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/908a5f9bc58549e471626e1471698a457772c4e4.jpg"
  },
  {
    "name": "Glowing Panda Lamp",
    "description": "Adorable wooden panda-shaped night lamp that glows softly, customizable with names. Adds a cute touch to bedrooms or desks, perfect for kids or anime fans.",
    "price": 5990,
    "category": "Home Decor",
    "image": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/0a1f6d2fd2e05c24dad786bf24ba0f71fe32360f.jpg"
  },
  {
    "name": "Bubble Letter Necklace",
    "description": "Trendy gold-plated necklace with large bubble letter pendant encrusted with gems. Stylish accessory for teens and young adults, available in multiple letters.",
    "price": 7990,
    "category": "Jewelry",
    "image": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/4ef958279027d78006cc0ddec56d51d858db1046.jpg"
  },
  {
    "name": "HydroJug Water Bottle",
    "description": "Large 73oz BPA-free, leakproof water bottle in sage green for daily hydration. Time-marked design encourages drinking more water, great for gym or office.",
    "price": 1499,
    "category": "Wellness",
    "image": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/785bc3b529c4df46a0124b99cf3b6ccff20a9542.jpg"
  },
  {
    "name": "Fujifilm Instax Mini Camera",
    "description": "Compact instant camera in blue for fun photo prints. Easy to use with selfie mode and close-up lens, perfect gift for tweens, teens, or memory makers.",
    "price": 6499,
    "category": "Electronics",
    "image": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/ca1e70d8f49cdc342953f2e90364a799c332c686.jpg"
  },
  {
    "name": "Ultrasonic Aromatherapy Diffuser",
    "description": "Wooden essential oil diffuser for creating a calming atmosphere with mist and lights. Supports multiple oils, ideal for home spa or relaxation routines.",
    "price": 1299,
    "category": "Wellness",
    "image": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/d4c2bd03b1d227f272dc347a45af8eea5d58e52a.jpg"
  },
  {
    "name": "Personalized Disc Necklace",
    "description": "Elegant gold-filled necklace with engraved disc pendant for names or initials. Timeless jewelry piece suitable for daily wear or special occasions.",
    "price": 899,
    "category": "Jewelry",
    "image": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/55676896fb43fb28c713de0267a8814d4251ddf1.jpg"
  },
  {
    "name": "Weighted Anxiety Blanket",
    "description": "Super soft 15 lbs gray weighted blanket for better sleep and anxiety relief. Provides deep pressure therapy, queen size for bed or sofa use.",
    "price": 3499,
    "category": "Wellness",
    "image": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/bcf85f628cdee379709bdbb57cfe7c319d6b125a.jpg"
  },
  {
    "name": "Flower Trinket Bowl",
    "description": "Hand-painted ceramic trinket dish with red flower design for jewelry or small items. Charming decorative piece for dressing tables or shelves.",
    "price": 4550,
    "category": "Home Decor",
    "image": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/86e0504f18d45b078a8aa0b6e850436f836525a1.jpg"
  },
  {
    "name": "Self-Stirring Coffee Mug",
    "description": "Innovative electric mug that stirs drinks automatically with a button press. Perfect for lazy mornings, holds hot beverages like coffee or tea.",
    "price": 999,
    "category": "Kitchen Gadgets",
    "image": "https://pplx-res.cloudinary.com/image/upload/pplx_search_images/9a35640f10d49839a18054dc9af4988c8e884b65.jpg"
  }
];

async function seedCustomProducts() {
  console.log('--- Custom Product Seeder ---');

  const formattedProducts = customProducts.map(p => ({
    name: p.name,
    description: p.description,
    price: p.price,
    category: p.category,
    images: [p.image],
    tags: [p.category.toLowerCase()],
    stock: 50,
    is_active: true
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

import 'dotenv/config';
import { MongoClient } from 'mongodb';
import fs from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/all_blue';
const DB_NAME = 'all_blue';
const COLLECTION_NAME = 'products';

const unsplashMapping: Record<string, string> = {
  "Personalized Photo Mug": "https://images.unsplash.com/photo-1517256011271-10f5Fa8369ec?auto=format&fit=crop&w=800&q=80",
  "Wooden Photo Frame with Name": "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=800&q=80",
  "LED Message Board Lamp": "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=800&q=80",
  "Personalized Photo Cushion Cover": "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=800&q=80",
  "Engraved Wooden Keychain": "https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=800&q=80",
  "Rotating Rose Teddy Box": "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=800&q=80",
  "3D Photo Crystal Cube": "https://images.unsplash.com/photo-1590732822180-29c878982a7a?auto=format&fit=crop&w=800&q=80",
  "Personalized Diary / Notebook": "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=800&q=80",
  "Personalized Canvas Print": "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=800&q=80",
  "Desk Organizer with Pen Holder": "https://images.unsplash.com/photo-1518455027359-f3f8139ca67f?auto=format&fit=crop&w=800&q=80",
  "Aromatherapy Candle Gift Set": "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=800&q=80",
  "Mini Succulent Plant Set": "https://images.unsplash.com/photo-1520302630591-fd1c66edc19d?auto=format&fit=crop&w=800&q=80",
  "Personalized T‑Shirt": "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=800&q=80",
  "LED Phone Stand with Light": "https://images.unsplash.com/photo-1586953208448-b95a79798f07?auto=format&fit=crop&w=800&q=80",
  "Personalized Love Puzzle Box": "https://images.unsplash.com/photo-1516280440614-37939bbacd81?auto=format&fit=crop&w=800&q=80",
  "LED Digital Photo Frame": "https://images.unsplash.com/photo-1522204538344-922f76eba0a4?auto=format&fit=crop&w=800&q=80",
  "Van Gogh Wall Art Print": "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=800&q=80",
  "Chocolate Snack Gift Hamper": "https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=800&q=80",
  "Personalized Office Tumbler": "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=800&q=80",
  "Couple Keychain Set": "https://images.unsplash.com/photo-1582142306909-195724d33ffc?auto=format&fit=crop&w=800&q=80"
};

async function updateProducts() {
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    const collection = db.collection(COLLECTION_NAME);

    const jsonPath = path.join(__dirname, '..', 'products_api.json');
    const rawData = fs.readFileSync(jsonPath, 'utf8');
    const jsonData = JSON.parse(rawData);
    const products = jsonData.data.products;

    for (const product of products) {
      const unsplashUrl = unsplashMapping[product.name];
      if (unsplashUrl) {
        product.images = [unsplashUrl];
      }
      
      // Update or insert
      await collection.updateOne(
        { id: product.id },
        { $set: product },
        { upsert: true }
      );
      console.log(`Updated product: ${product.name}`);
    }

    console.log('Product update completed successfully!');
  } catch (error) {
    console.error('Failed to update products:', error);
  } finally {
    await client.close();
  }
}

updateProducts();

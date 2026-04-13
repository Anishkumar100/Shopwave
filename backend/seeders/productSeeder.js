const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');
const path = require('path');
const dns = require('dns');

// 1. Bulletproof .env loading using an absolute path
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectDB = async () => {
  // 2. The Google DNS bypass to fix the ECONNREFUSED error
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4']);
  } catch (error) {
    // silently fail and use default if it can't set
  }

  // Ensure MONGO_URI exists, otherwise throw an error instead of using localhost
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is undefined. The .env file was not loaded correctly.");
  }

  await mongoose.connect(process.env.MONGO_URI);
};

const categories = [
  { name: 'Electronics', description: 'Gadgets and electronic devices' },
  { name: 'Fashion', description: 'Clothing, shoes and accessories' },
  { name: 'Home & Living', description: 'Furniture and home decor' },
  { name: 'Sports', description: 'Sports and fitness equipment' },
  { name: 'Books', description: 'Books and educational material' },
];

const getProducts = (catIds) => [
  { name: 'Sony WH-1000XM5 Wireless Headphones', description: 'Industry-leading noise canceling with Auto NC Optimizer. Up to 30-hour battery life with quick charging.', shortDescription: 'Premium noise-canceling wireless headphones', price: 24999, originalPrice: 34999, category: catIds[0], brand: 'Sony', stock: 50, isFeatured: true, ratings: 4.8, numReviews: 234, images: [{ public_id: 'sony1', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' }], tags: ['headphones', 'wireless', 'noise-canceling'] },
  { name: 'Apple MacBook Air M2', description: 'Supercharged by the next-generation M2 chip. Strikingly thin redesign with 13.6-inch Liquid Retina display.', shortDescription: 'Ultraslim laptop with M2 chip', price: 114900, originalPrice: 119900, category: catIds[0], brand: 'Apple', stock: 25, isFeatured: true, ratings: 4.9, numReviews: 456, images: [{ public_id: 'mac1', url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400' }], tags: ['laptop', 'apple', 'macbook'] },
  { name: 'Samsung 65" QLED 4K Smart TV', description: 'Quantum HDR 32X. 100% Color Volume with Quantum Dot. Quantum Processor 4K. Motion Xcelerator 120Hz.', shortDescription: '65-inch QLED 4K Smart TV', price: 89999, originalPrice: 109999, category: catIds[0], brand: 'Samsung', stock: 15, isFeatured: true, ratings: 4.7, numReviews: 189, images: [{ public_id: 'tv1', url: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=400' }], tags: ['tv', 'samsung', '4k', 'smart-tv'] },
  { name: 'iPhone 15 Pro Max', description: '48MP main camera system. A17 Pro chip. Titanium design. USB 3 for faster transfers.', shortDescription: 'Apple flagship smartphone', price: 159900, originalPrice: 169900, category: catIds[0], brand: 'Apple', stock: 30, isFeatured: true, ratings: 4.9, numReviews: 678, images: [{ public_id: 'iphone1', url: 'https://images.unsplash.com/photo-1696446701796-da61dc2285b8?w=400' }], tags: ['iphone', 'apple', 'smartphone'] },
  { name: 'Men\'s Classic Leather Jacket', description: 'Premium genuine leather jacket with quilted lining. Slim fit design with multiple pockets.', shortDescription: 'Classic genuine leather jacket for men', price: 4999, originalPrice: 7999, category: catIds[1], brand: 'LeatherCraft', stock: 80, isFeatured: false, ratings: 4.5, numReviews: 92, images: [{ public_id: 'jacket1', url: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400' }], tags: ['jacket', 'leather', 'men', 'fashion'] },
  { name: 'Women\'s Floral Summer Dress', description: 'Lightweight chiffon floral print dress. Perfect for summer outings and casual events.', shortDescription: 'Elegant floral chiffon dress', price: 1499, originalPrice: 2499, category: catIds[1], brand: 'FloralMode', stock: 120, isFeatured: false, ratings: 4.3, numReviews: 67, images: [{ public_id: 'dress1', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400' }], tags: ['dress', 'women', 'floral', 'summer'] },
  { name: 'Scandinavian Wooden Coffee Table', description: 'Minimalist solid oak coffee table. Natural finish with hairpin steel legs. 120x60cm.', shortDescription: 'Modern Scandinavian coffee table', price: 8999, originalPrice: 12999, category: catIds[2], brand: 'NordicHome', stock: 20, isFeatured: true, ratings: 4.6, numReviews: 43, images: [{ public_id: 'table1', url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400' }], tags: ['furniture', 'table', 'wood', 'scandinavian'] },
  { name: 'Yoga Mat Premium Non-Slip', description: 'Extra thick 6mm TPE yoga mat. Non-slip surface on both sides. Includes carrying strap and bag.', shortDescription: 'Professional grade yoga mat', price: 999, originalPrice: 1799, category: catIds[3], brand: 'ZenFit', stock: 200, isFeatured: false, ratings: 4.4, numReviews: 312, images: [{ public_id: 'yoga1', url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400' }], tags: ['yoga', 'fitness', 'mat', 'sports'] },
  { name: 'Nike Air Max 270', description: 'Inspired by the Air Max 180 and Air Max 93. Max Air heel unit for all-day comfort.', shortDescription: 'Iconic Nike running shoes', price: 7995, originalPrice: 9995, category: catIds[1], brand: 'Nike', stock: 100, isFeatured: true, ratings: 4.7, numReviews: 523, images: [{ public_id: 'nike1', url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400' }], tags: ['shoes', 'nike', 'running', 'sports'] },
  { name: 'Atomic Habits - James Clear', description: 'No.1 New York Times bestseller. Tiny Changes, Remarkable Results. Over 15 million copies sold.', shortDescription: 'Transformative self-help book', price: 499, originalPrice: 799, category: catIds[4], brand: 'Penguin Random House', stock: 500, isFeatured: false, ratings: 4.9, numReviews: 1024, images: [{ public_id: 'book1', url: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400' }], tags: ['book', 'self-help', 'habits', 'bestseller'] },
  { name: 'DJI Mini 3 Drone', description: 'Under 249 g. 48MP photos, 4K video. True Vertical Shooting. Extended battery life.', shortDescription: 'Compact 4K camera drone', price: 54990, originalPrice: 62990, category: catIds[0], brand: 'DJI', stock: 18, isFeatured: true, ratings: 4.8, numReviews: 145, images: [{ public_id: 'drone1', url: 'https://images.unsplash.com/photo-1508444845599-5c89863b1c44?w=400' }], tags: ['drone', 'camera', 'aerial', 'dji'] },
  { name: 'Whey Protein Gold Standard 5lb', description: '24g of protein per serving. 5.5g BCAAs. 11g essential amino acids. Instantized for easy mixing.', shortDescription: 'Premium whey protein powder', price: 3499, originalPrice: 4999, category: catIds[3], brand: 'Optimum Nutrition', stock: 150, isFeatured: false, ratings: 4.6, numReviews: 891, images: [{ public_id: 'protein1', url: 'https://images.unsplash.com/photo-1579722822945-db631c0e00b8?w=400' }], tags: ['protein', 'fitness', 'nutrition', 'gym'] },
];

const seedProducts = async () => {
  try {
    await connectDB();
    const Category = require('../models/Category');
    const Product = require('../models/Product');

    await Product.deleteMany();
    await Category.deleteMany();
    console.log('🗑️  Cleared existing data'.red);

    // 1. ADD SLUGS TO CATEGORIES BEFORE INSERTING
    const categoriesWithSlugs = categories.map(cat => ({
        ...cat,
        slug: cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    }));
    const createdCats = await Category.insertMany(categoriesWithSlugs);
    console.log('✅ Categories seeded'.green);

    const catIds = createdCats.map(c => c._id);
    const products = getProducts(catIds);

    // 2. ADD SLUGS TO PRODUCTS BEFORE INSERTING (To prevent the same error here)
    const productsWithSlugs = products.map((prod, index) => ({
        ...prod,
        slug: prod.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        // Generate a guaranteed unique dummy SKU (e.g., SKU-1712345678-0)
        sku: `SKU-${Date.now()}-${index}` 
    }));
    
    await Product.insertMany(productsWithSlugs);
    console.log(`✅ ${products.length} products seeded`.green);
    console.log('🎉 Database seeded successfully!'.rainbow);
    process.exit(0);
  } catch (error) {
    console.error(`❌ Seeder Error: ${error.message}`.red);
    process.exit(1);
  }
};

seedProducts();
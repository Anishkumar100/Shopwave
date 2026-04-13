require('dotenv').config();
const mongoose = require('mongoose');
const Coupon = require('../models/Coupon');
const FlashSale = require('../models/FlashSale');
const Bundle = require('../models/Bundle');
const Product = require('../models/Product');

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected. Seeding promotions…');

  await Coupon.deleteMany({});
  await Coupon.insertMany([
    { code: 'WELCOME10', type: 'percent',  value: 10, minOrder: 500,  maxDiscount: 500,  label: '10% off your first order' },
    { code: 'FLAT500',   type: 'flat',     value: 500, minOrder: 2500, label: 'Flat ₹500 off above ₹2500' },
    { code: 'MEGA20',    type: 'percent',  value: 20, minOrder: 5000, maxDiscount: 2000, label: '20% off above ₹5000' },
    { code: 'FREESHIP',  type: 'shipping', value: 0,  minOrder: 0,    label: 'Free shipping on any order' },
    { code: 'FESTIVE15', type: 'percent',  value: 15, minOrder: 1500, maxDiscount: 1500, label: 'Festive 15% off' },
  ]);
  console.log('✓ Coupons seeded');

  await FlashSale.deleteMany({});
  await FlashSale.create({
    title: 'FLASH SALE',
    subtitle: 'Up to 30% off sitewide',
    percentage: 30,
    active: false, // admin toggles this on
    endsAt: new Date(Date.now() + 24 * 3600 * 1000),
  });
  console.log('✓ Flash sale seeded (inactive — admin must enable)');

  await Bundle.deleteMany({});
  const products = await Product.find().limit(6);
  if (products.length >= 4) {
    await Bundle.insertMany([
      {
        title: 'Starter Bundle',
        description: 'Perfect for beginners',
        image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=600&q=80',
        products: [products[0]._id, products[1]._id],
        price: Math.round((products[0].price + products[1].price) * 0.85),
        mrp: products[0].price + products[1].price,
        badge: 'POPULAR',
      },
      {
        title: 'Pro Bundle',
        description: 'Everything you need',
        image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
        products: [products[2]._id, products[3]._id],
        price: Math.round((products[2].price + products[3].price) * 0.80),
        mrp: products[2].price + products[3].price,
        badge: 'BEST DEAL',
      },
    ]);
    console.log('✓ Bundles seeded');
  } else {
    console.log('⚠  Not enough products to seed bundles. Run productSeeder first.');
  }

  await mongoose.disconnect();
  console.log('Done.');
};

seed().catch((e) => { console.error(e); process.exit(1); });

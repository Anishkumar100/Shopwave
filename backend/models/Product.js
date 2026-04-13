const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, { timestamps: true });

const productSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Product name is required'], trim: true, maxlength: [200, 'Name cannot exceed 200 chars'] },
  slug: { type: String, unique: true },
  description: { type: String, required: [true, 'Description is required'] },
  shortDescription: { type: String, maxlength: [300, 'Short description too long'] },
  price: { type: Number, required: [true, 'Price is required'], maxlength: [8, 'Price cannot exceed 8 digits'], default: 0 },
  originalPrice: { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  brand: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  images: [{
    public_id: { type: String, required: true },
    url: { type: String, required: true },
  }],
  ratings: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  reviews: [reviewSchema],
  tags: [String],
  isFeatured: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  specifications: [{
    key: String,
    value: String,
  }],
  weight: { type: Number },
  sku: { type: String, unique: true },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

// Auto-generate slug and SKU
const slugify = require('slugify');
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true }) + '-' + Date.now();
  }
  if (!this.sku) {
    this.sku = 'SKU-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  }
  if (this.originalPrice && this.originalPrice > this.price) {
    this.discountPercent = Math.round(((this.originalPrice - this.price) / this.originalPrice) * 100);
  }
  next();
});

// Virtual for discount
productSchema.virtual('discountAmount').get(function () {
  return this.originalPrice - this.price;
});

module.exports = mongoose.model('Product', productSchema);

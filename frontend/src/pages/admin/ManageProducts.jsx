import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Search, Package, LayoutDashboard, ShoppingBag, Users , Tag , Folder } from 'lucide-react';
import API from '../../api/axios';
import toast from 'react-hot-toast';
import ImageUploader from '../../components/ImageUploader';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ name: '', price: '', originalPrice: '', stock: '', brand: '', category: '', description: '', isFeatured: false, images: [] });
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadData();
    API.get('/categories').then((r) => setCategories(r.data.categories));
  }, []);

  const loadData = () => {
    setLoading(true);
    API.get('/products/admin/all').then((r) => setProducts(r.data.products)).finally(() => setLoading(false));
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"?`)) return;
    try { await API.delete(`/products/${id}`); toast.success('Product deleted'); loadData(); }
    catch (err) { toast.error(err.response?.data?.message || 'Delete failed'); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editProduct) {
        await API.put(`/products/${editProduct._id}`, form);
        toast.success('Product updated!');
      } else {
        const payload = { ...form, images: (form.images && form.images.length) ? form.images : [{ public_id: 'default', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400' }] };
        await API.post('/products', payload);
        toast.success('Product created!');
      }
      setShowForm(false); setEditProduct(null);
      setForm({ name: '', price: '', originalPrice: '', stock: '', brand: '', category: '', description: '', isFeatured: false, images: [] });
      loadData();
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="pt-6 pb-16">
      

      <div className="p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl text-base-c">Manage Products</h1>
          <button onClick={() => { setShowForm(true); setEditProduct(null); }}
            className="btn-primary flex items-center gap-2 py-2.5 px-5">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-6 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-faint-c" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
            className="input-field pl-11" />
        </div>

        {/* Product Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="glass rounded-3xl p-8 w-full max-w-2xl border border-base max-h-[90vh] overflow-y-auto">
              <h3 className="font-display font-bold text-2xl text-base-c mb-6">{editProduct ? 'Edit Product' : 'Add Product'}</h3>
              <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
                {[['name', 'Product Name', 2], ['brand', 'Brand', 1], ['price', 'Sale Price (₹)', 1], ['originalPrice', 'Original Price (₹)', 1], ['stock', 'Stock Qty', 1]].map(([key, label, col]) => (
                  <div key={key} className={col === 2 ? 'col-span-2' : ''}>
                    <label className="text-muted-c text-xs uppercase tracking-wider mb-1.5 block">{label}</label>
                    <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                      className="input-field" placeholder={label} required={['name', 'price', 'stock'].includes(key)} />
                  </div>
                ))}
                <div>
                  <label className="text-muted-c text-xs uppercase tracking-wider mb-1.5 block">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="input-field">
                    <option value="">Select category</option>
                    {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="text-muted-c text-xs uppercase tracking-wider mb-1.5 block">Description</label>
                  <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={3} className="input-field resize-none" placeholder="Product description" />
                </div>
                <div className="col-span-2">
                  <label className="text-muted-c text-xs uppercase tracking-wider mb-1.5 block">Product Images</label>
                  <ImageUploader
                    value={form.images || []}
                    onChange={(imgs) => setForm({ ...form, images: imgs })}
                    max={6}
                  />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="featured" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} className="accent-brand-500 w-4 h-4" />
                  <label htmlFor="featured" className="text-muted-c text-sm">Featured product</label>
                </div>
                <div className="col-span-2 flex gap-3 pt-2">
                  <button type="submit" className="btn-primary px-8 py-3 flex-1">{editProduct ? 'Update' : 'Create'}</button>
                  <button type="button" onClick={() => setShowForm(false)} className="btn-outline px-6 py-3">Cancel</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Table */}
        <div className="glass rounded-2xl border border-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-base">
                  {['Product', 'Price', 'Stock', 'Category', 'Featured', 'Actions'].map((h) => (
                    <th key={h} className="text-left px-5 py-3 text-muted-c text-xs font-medium uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? [...Array(5)].map((_, i) => (
                  <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="shimmer-bg h-8 rounded-lg" /></td></tr>
                )) : filtered.map((product, i) => (
                  <motion.tr key={product._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                    className="border-b border-base last:border-0 hover:bg-card-soft transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={product.images?.[0]?.url} alt={product.name} className="w-10 h-10 rounded-lg object-cover bg-surface" />
                        <div>
                          <p className="text-base-c text-sm font-medium line-clamp-1 max-w-[180px]">{product.name}</p>
                          <p className="text-faint-c text-xs">{product.brand}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 price-tag font-bold text-sm">₹{product.price?.toLocaleString('en-IN')}</td>
                    <td className="px-5 py-4">
                      <span className={`badge ${product.stock > 10 ? 'badge-green' : product.stock > 0 ? 'badge-amber' : 'badge-red'}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-muted-c text-sm">{product.category?.name || '—'}</td>
                    <td className="px-5 py-4">{product.isFeatured ? <span className="badge-green">Yes</span> : <span className="text-faint-c text-xs">No</span>}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setEditProduct(product); setForm({ name: product.name, price: product.price, originalPrice: product.originalPrice, stock: product.stock, brand: product.brand, category: product.category?._id || '', description: product.description, isFeatured: product.isFeatured }); setShowForm(true); }}
                          className="p-2 text-muted-c hover:text-brand hover:bg-brand-soft rounded-lg transition-all">
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(product._id, product.name)}
                          className="p-2 text-muted-c hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ManageProducts;

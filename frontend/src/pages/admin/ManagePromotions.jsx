import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Tag, Gift, Zap, Save , Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import { promosStore } from '../../utils/promosStore';
import API from '../../api/axios';
import ImageUploader from '../../components/ImageUploader';

const ManagePromotions = () => {
  const [tab, setTab] = useState('coupons');
  const [coupons, setCoupons] = useState([]);
  const [bundles, setBundles] = useState([]);
  const [flashList, setFlashList] = useState([]);
  const [allProducts, setAllProducts] = useState([]);

  // "draft" state holds in-progress edits; saved explicitly
  const [couponDrafts, setCouponDrafts] = useState({});
  const [bundleDrafts, setBundleDrafts] = useState({});
  const [flashDrafts, setFlashDrafts] = useState({});
  const dirty = Object.keys(couponDrafts).length + Object.keys(bundleDrafts).length + Object.keys(flashDrafts).length > 0;

  const loadAll = async () => {
    try {
      const [c, f, b, p] = await Promise.all([
        promosStore.fetchCoupons(),
        promosStore.fetchFlashSale(),
        promosStore.fetchAllBundlesAdmin(),
        API.get('/products?limit=100').then(r => r.data.products),
      ]);
      setCoupons(c);
      setFlashList(f.all);
      setBundles(b);
      setAllProducts(p);
    } catch (err) {
      toast.error('Failed to load promotions: ' + (err.response?.data?.message || err.message));
    }
  };
  useEffect(() => { loadAll(); }, []);

  /* ===== Coupons ===== */
  const editCoupon = (id, k, v) => setCouponDrafts(d => ({ ...d, [id]: { ...(d[id] || {}), [k]: v } }));
  const addCoupon = async () => {
    try {
      const c = await promosStore.createCoupon({ code: 'NEW' + (coupons.length + 1), type: 'percent', value: 10, minOrder: 0, label: 'New coupon', active: true });
      setCoupons([c, ...coupons]);
      toast.success('Coupon added — edit fields and Save');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const delCoupon = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    try { await promosStore.deleteCoupon(id); setCoupons(coupons.filter(c => c._id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  /* ===== Bundles ===== */
  const editBundle = (id, k, v) => setBundleDrafts(d => ({ ...d, [id]: { ...(d[id] || {}), [k]: v } }));
  const addBundle = async () => {
    if (allProducts.length < 2) return toast.error('Need at least 2 products in catalog first');
    const p1 = allProducts[0], p2 = allProducts[1];
    try {
      const b = await promosStore.createBundle({
        title: 'New Bundle',
        description: '',
        image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80',
        products: [p1._id, p2._id],
        price: Math.round((p1.price + p2.price) * 0.85),
        mrp: p1.price + p2.price,
        badge: 'NEW',
        active: true,
      });
      setBundles([b, ...bundles]);
      toast.success('Bundle added');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const delBundle = async (id) => {
    if (!confirm('Delete this bundle?')) return;
    try { await promosStore.deleteBundle(id); setBundles(bundles.filter(b => b._id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const toggleBundleProduct = (bid, pid) => {
    const b = bundles.find(x => x._id === bid);
    const draft = bundleDrafts[bid] || {};
    const currentProducts = draft.products || b.products.map(p => p._id || p);
    const newProducts = currentProducts.includes(pid) ? currentProducts.filter(x => x !== pid) : [...currentProducts, pid];
    editBundle(bid, 'products', newProducts);
  };

  /* ===== Flash sale ===== */
  const editFlash = (id, k, v) => setFlashDrafts(d => ({ ...d, [id]: { ...(d[id] || {}), [k]: v } }));
  const addFlash = async () => {
    try {
      const s = await promosStore.createFlashSale({ title: 'FLASH SALE', subtitle: 'Limited time', percentage: 20, active: false, endsAt: new Date(Date.now() + 24 * 3600000) });
      setFlashList([s, ...flashList]);
      toast.success('Flash sale added');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };
  const delFlash = async (id) => {
    if (!confirm('Delete this flash sale?')) return;
    try { await promosStore.deleteFlashSale(id); setFlashList(flashList.filter(f => f._id !== id)); toast.success('Deleted'); }
    catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  /* ===== Save all drafts ===== */
  const saveAll = async () => {
    const tasks = [];
    for (const [id, patch] of Object.entries(couponDrafts)) tasks.push(promosStore.updateCoupon(id, patch));
    for (const [id, patch] of Object.entries(bundleDrafts)) tasks.push(promosStore.updateBundle(id, patch));
    for (const [id, patch] of Object.entries(flashDrafts))  tasks.push(promosStore.updateFlashSale(id, patch));
    try {
      await Promise.all(tasks);
      setCouponDrafts({}); setBundleDrafts({}); setFlashDrafts({});
      await loadAll();
      toast.success('All changes saved ✓');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };
  const discardAll = () => { setCouponDrafts({}); setBundleDrafts({}); setFlashDrafts({}); toast('Changes discarded'); };

  // Merge draft over live data for rendering
  const viewCoupon = (c) => ({ ...c, ...(couponDrafts[c._id] || {}) });
  const viewBundle = (b) => ({ ...b, ...(bundleDrafts[b._id] || {}) });
  const viewFlash  = (f) => ({ ...f, ...(flashDrafts[f._id]  || {}) });

  return (
    <div className="pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="font-display text-4xl text-base-c mb-2">Promotions</h1>
        <p className="text-muted-c mb-8">Manage coupons, bundles & flash sales — all persisted to MongoDB</p>

        <div className="flex gap-2 mb-8 glass rounded-2xl p-2 w-fit">
          {[['coupons', Tag, 'Coupons'], ['bundles', Gift, 'Bundles'], ['flash', Zap, 'Flash Sale']].map(([k, Icon, label]) => (
            <button key={k} onClick={() => setTab(k)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-display tracking-wide transition-all ${tab === k ? 'bg-brand text-[color:var(--brand-contrast)]' : 'text-muted-c hover:text-base-c'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        {tab === 'coupons' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={addCoupon} className="btn-primary mb-4 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> New Coupon</button>
            <div className="space-y-3">
              {coupons.map(raw => { const c = viewCoupon(raw); return (
                <div key={c._id} className="glass rounded-2xl p-4 grid grid-cols-1 md:grid-cols-7 gap-3 items-end">
                  <input value={c.code || ''} onChange={e => editCoupon(c._id, 'code', e.target.value.toUpperCase())} placeholder="CODE" className="input-field text-sm py-2" />
                  <select value={c.type || 'percent'} onChange={e => editCoupon(c._id, 'type', e.target.value)} className="input-field text-sm py-2">
                    <option value="percent">Percent</option><option value="flat">Flat ₹</option><option value="shipping">Free Ship</option>
                  </select>
                  <input type="number" value={c.value || 0} onChange={e => editCoupon(c._id, 'value', +e.target.value)} placeholder="Value" className="input-field text-sm py-2" />
                  <input type="number" value={c.minOrder || 0} onChange={e => editCoupon(c._id, 'minOrder', +e.target.value)} placeholder="Min ₹" className="input-field text-sm py-2" />
                  <input value={c.label || ''} onChange={e => editCoupon(c._id, 'label', e.target.value)} placeholder="Label" className="input-field text-sm py-2 md:col-span-2" />
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 text-xs text-muted-c"><input type="checkbox" checked={!!c.active} onChange={e => editCoupon(c._id, 'active', e.target.checked)} /> Active</label>
                    <button onClick={() => delCoupon(c._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );})}
            </div>
          </motion.div>
        )}

        {tab === 'bundles' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={addBundle} className="btn-primary mb-4 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> New Bundle</button>
            <div className="grid md:grid-cols-2 gap-4">
              {bundles.map(raw => { const b = viewBundle(raw); const selectedIds = (b.products || []).map(p => p._id || p); return (
                <div key={b._id} className="glass rounded-2xl p-4 space-y-2">
                  <input value={b.title || ''} onChange={e => editBundle(b._id, 'title', e.target.value)} className="input-field font-display text-lg" placeholder="Title" />
                  <ImageUploader value={b.image ? [{ public_id: b._id, url: b.image }] : []} onChange={(imgs) => editBundle(b._id, 'image', imgs[0]?.url || '')} max={1} />
                  <label className="text-faint-c text-[10px] uppercase tracking-wider block">Link Products (min 2)</label>
                  <div className="max-h-32 overflow-y-auto space-y-1 p-2 bg-card-soft rounded-xl">
                    {allProducts.map(p => (
                      <label key={p._id} className="flex items-center gap-2 text-xs text-base-c cursor-pointer">
                        <input type="checkbox" checked={selectedIds.includes(p._id)} onChange={() => toggleBundleProduct(b._id, p._id)} />
                        <span className="flex-1 truncate">{p.name}</span>
                        <span className="text-brand">₹{p.price}</span>
                      </label>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="number" value={b.price || 0} onChange={e => editBundle(b._id, 'price', +e.target.value)} placeholder="Price" className="input-field text-sm" />
                    <input type="number" value={b.mrp || 0}   onChange={e => editBundle(b._id, 'mrp', +e.target.value)}   placeholder="MRP"   className="input-field text-sm" />
                    <input value={b.badge || ''} onChange={e => editBundle(b._id, 'badge', e.target.value)} placeholder="Badge" className="input-field text-sm" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-1 text-xs text-muted-c"><input type="checkbox" checked={!!b.active} onChange={e => editBundle(b._id, 'active', e.target.checked)} /> Active</label>
                    <button onClick={() => delBundle(b._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );})}
            </div>
          </motion.div>
        )}

        {tab === 'flash' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <button onClick={addFlash} className="btn-primary mb-4 inline-flex items-center gap-2"><Plus className="w-4 h-4" /> New Flash Sale</button>
            <p className="text-muted-c text-xs mb-4">⚠ Only ONE flash sale can be active at a time. Activating one auto-deactivates others. When active, its percentage is applied site-wide to all product prices.</p>
            <div className="space-y-4">
              {flashList.map(raw => { const f = viewFlash(raw); return (
                <div key={f._id} className="glass rounded-2xl p-5 space-y-3">
                  <div className="grid md:grid-cols-2 gap-3">
                    <input value={f.title || ''} onChange={e => editFlash(f._id, 'title', e.target.value)} placeholder="Title" className="input-field" />
                    <input value={f.subtitle || ''} onChange={e => editFlash(f._id, 'subtitle', e.target.value)} placeholder="Subtitle" className="input-field" />
                    <input type="number" min="1" max="90" value={f.percentage || 0} onChange={e => editFlash(f._id, 'percentage', +e.target.value)} placeholder="Discount %" className="input-field" />
                    <input type="datetime-local" value={f.endsAt ? new Date(f.endsAt).toISOString().slice(0,16) : ''} onChange={e => editFlash(f._id, 'endsAt', new Date(e.target.value).toISOString())} className="input-field" />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-base-c font-bold"><input type="checkbox" checked={!!f.active} onChange={e => editFlash(f._id, 'active', e.target.checked)} /> Activate (applies {f.percentage}% site-wide)</label>
                    <button onClick={() => delFlash(f._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              );})}
              {flashList.length === 0 && <p className="text-faint-c text-center py-8">No flash sales yet. Click "New Flash Sale" above.</p>}
            </div>
          </motion.div>
        )}
      </div>

      {dirty && (
        <motion.div initial={{ y: 80 }} animate={{ y: 0 }} className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-base p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="text-base-c font-bold">You have unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={discardAll} className="btn-outline py-2.5 px-5 text-sm">Discard</button>
              <button onClick={saveAll} className="btn-primary py-2.5 px-6 text-sm inline-flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ManagePromotions;

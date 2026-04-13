import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Save, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import API from '../../api/axios';
import ImageUploader from '../../components/ImageUploader';

const ManageCategories = () => {
  const [categories, setCategories] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [newCat, setNewCat] = useState({ name: '', description: '', image: null });

  const dirty = Object.keys(drafts).length > 0;

  const load = async () => {
    try {
      const { data } = await API.get('/categories');
      setCategories(data.categories || []);
    } catch (err) { toast.error('Failed to load categories'); }
  };
  useEffect(() => { load(); }, []);

  const edit = (id, k, v) => setDrafts((d) => ({ ...d, [id]: { ...(d[id] || {}), [k]: v } }));
  const view = (c) => ({ ...c, ...(drafts[c._id] || {}) });

  const saveAll = async () => {
    try {
      await Promise.all(Object.entries(drafts).map(([id, patch]) => API.put(`/categories/${id}`, patch)));
      setDrafts({});
      await load();
      toast.success('Categories saved ✓');
    } catch (err) { toast.error(err.response?.data?.message || 'Save failed'); }
  };

  const addCategory = async () => {
    if (!newCat.name) return toast.error('Name is required');
    try {
      await API.post('/categories', {
        name: newCat.name,
        description: newCat.description,
        image: newCat.image || undefined,
      });
      setNewCat({ name: '', description: '', image: null });
      setShowForm(false);
      await load();
      toast.success('Category created');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  const deleteCategory = async (id) => {
    if (!confirm('Delete this category? Products linked to it must be removed first.')) return;
    try {
      await API.delete(`/categories/${id}`);
      setCategories(categories.filter(c => c._id !== id));
      toast.success('Deleted');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
  };

  return (
    <div className="pt-6 pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-4xl text-base-c">Categories</h1>
            <p className="text-muted-c mt-1">Organize your product catalog</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Category
          </button>
        </div>

        {showForm && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-2xl p-6 mb-6 space-y-4">
            <h3 className="font-display text-xl text-base-c">Create Category</h3>
            <input value={newCat.name} onChange={(e) => setNewCat({ ...newCat, name: e.target.value })}
              className="input-field" placeholder="Category name (e.g., Electronics)" />
            <textarea value={newCat.description} onChange={(e) => setNewCat({ ...newCat, description: e.target.value })}
              className="input-field resize-none" rows={2} placeholder="Short description (optional)" />
            <div>
              <label className="text-muted-c text-xs uppercase tracking-wider mb-2 block">Cover Image</label>
              <ImageUploader
                value={newCat.image ? [newCat.image] : []}
                onChange={(imgs) => setNewCat({ ...newCat, image: imgs[0] || null })}
                max={1}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={addCategory} className="btn-primary">Create</button>
              <button onClick={() => setShowForm(false)} className="btn-outline">Cancel</button>
            </div>
          </motion.div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((raw, i) => {
            const c = view(raw);
            return (
              <motion.div
                key={c._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="glass rounded-2xl overflow-hidden hover:border-brand transition-all"
              >
                {c.image?.url && (
                  <div className="aspect-video overflow-hidden">
                    <img src={c.image.url} alt={c.name} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <Folder className="w-5 h-5 text-brand" />
                    <input value={c.name || ''} onChange={(e) => edit(c._id, 'name', e.target.value)}
                      className="input-field font-display text-lg py-2 flex-1" />
                  </div>
                  <textarea value={c.description || ''} onChange={(e) => edit(c._id, 'description', e.target.value)}
                    className="input-field text-sm resize-none py-2" rows={2} placeholder="Description" />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-muted-c">
                      <input type="checkbox" checked={!!c.isActive} onChange={(e) => edit(c._id, 'isActive', e.target.checked)} />
                      Active
                    </label>
                    <button onClick={() => deleteCategory(c._id)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-20">
            <Folder className="w-16 h-16 text-faint-c mx-auto mb-4" />
            <p className="font-display text-2xl text-base-c">No categories yet</p>
            <p className="text-muted-c">Click "New Category" to create your first one</p>
          </div>
        )}
      </div>

      {dirty && (
        <motion.div initial={{ y: 80 }} animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 z-40 glass-strong border-t border-base p-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            <p className="text-base-c font-bold">Unsaved changes</p>
            <div className="flex gap-3">
              <button onClick={() => setDrafts({})} className="btn-outline py-2.5 px-5 text-sm">Discard</button>
              <button onClick={saveAll} className="btn-primary py-2.5 px-6 text-sm inline-flex items-center gap-2">
                <Save className="w-4 h-4" /> Save
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ManageCategories;

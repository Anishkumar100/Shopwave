// REST-backed promotions store.
import API from '../api/axios';

let cache = { coupons: [], bundles: [], flash: null };

export const promosStore = {
  async fetchCoupons() {
    const { data } = await API.get('/promotions/coupons');
    cache.coupons = data.coupons || [];
    return cache.coupons;
  },
  getCouponsSync() { return cache.coupons; },
  async createCoupon(payload) { const { data } = await API.post('/promotions/coupons', payload); return data.coupon; },
  async updateCoupon(id, payload) { const { data } = await API.put(`/promotions/coupons/${id}`, payload); return data.coupon; },
  async deleteCoupon(id) { await API.delete(`/promotions/coupons/${id}`); },
  async validateCoupon(code, subtotal) {
    try {
      const { data } = await API.post('/promotions/coupons/validate', { code, subtotal });
      return { ok: true, coupon: data.coupon, discount: data.discount, freeShipping: data.freeShipping };
    } catch (err) {
      return { ok: false, reason: err.response?.data?.reason || err.response?.data?.message || 'Invalid coupon' };
    }
  },

  async fetchFlashSale() {
    const { data } = await API.get('/promotions/flash-sale');
    cache.flash = data.active;
    return { all: data.all || [], active: data.active };
  },
  getFlashSync() { return cache.flash; },
  async createFlashSale(payload) { const { data } = await API.post('/promotions/flash-sale', payload); return data.sale; },
  async updateFlashSale(id, payload) { const { data } = await API.put(`/promotions/flash-sale/${id}`, payload); return data.sale; },
  async deleteFlashSale(id) { await API.delete(`/promotions/flash-sale/${id}`); },

  async fetchBundles({ page = 1, limit = 9 } = {}) {
    const { data } = await API.get('/promotions/bundles', { params: { page, limit } });
    cache.bundles = data.bundles || [];
    return data;
  },
  async fetchAllBundlesAdmin() {
    const { data } = await API.get('/promotions/bundles/admin');
    return data.bundles || [];
  },
  getBundlesSync() { return cache.bundles; },
  async createBundle(payload) { const { data } = await API.post('/promotions/bundles', payload); return data.bundle; },
  async updateBundle(id, payload) { const { data } = await API.put(`/promotions/bundles/${id}`, payload); return data.bundle; },
  async deleteBundle(id) { await API.delete(`/promotions/bundles/${id}`); },
};

export const applyCouponFromStore = (code, subtotal) => promosStore.validateCoupon(code, subtotal);

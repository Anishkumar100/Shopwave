// Hardcoded coupon catalog — replace with API call when backend ready
export const COUPONS = {
  WELCOME10:  { code: 'WELCOME10',  type: 'percent', value: 10, minOrder: 500,  label: '10% off your first order',     maxDiscount: 500 },
  FLAT500:    { code: 'FLAT500',    type: 'flat',    value: 500, minOrder: 2500, label: 'Flat ₹500 off above ₹2500' },
  FREESHIP:   { code: 'FREESHIP',   type: 'shipping',value: 0,   minOrder: 0,    label: 'Free shipping on any order' },
  MEGA20:     { code: 'MEGA20',     type: 'percent', value: 20,  minOrder: 5000, label: '20% off above ₹5000', maxDiscount: 2000 },
  FESTIVE15:  { code: 'FESTIVE15',  type: 'percent', value: 15,  minOrder: 1500, label: 'Festive 15% off', maxDiscount: 1500 },
};

export const applyCoupon = (code, subtotal) => {
  const c = COUPONS[code?.toUpperCase()?.trim()];
  if (!c) return { ok: false, reason: 'Invalid coupon code' };
  if (subtotal < c.minOrder) return { ok: false, reason: `Minimum order ₹${c.minOrder} required` };
  let discount = 0, freeShipping = false;
  if (c.type === 'percent')  discount = Math.min(Math.round(subtotal * c.value / 100), c.maxDiscount || Infinity);
  if (c.type === 'flat')     discount = c.value;
  if (c.type === 'shipping') freeShipping = true;
  return { ok: true, coupon: c, discount, freeShipping };
};

// Browser geolocation — used by Checkout to capture user position, with reverse geocoding
export const captureGeolocation = () =>
  new Promise((resolve) => {
    if (!navigator.geolocation) return resolve({ ok: false, reason: 'Geolocation not supported by your browser' });
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const base = {
          ok: true,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          capturedAt: new Date().toISOString(),
        };
        // Reverse geocode via free Nominatim API (OpenStreetMap)
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${base.lat}&lon=${base.lng}&zoom=18&addressdetails=1`, {
            headers: { 'Accept-Language': 'en' },
          });
          if (res.ok) {
            const j = await res.json();
            const a = j.address || {};
            base.address = {
              street:  [a.house_number, a.road].filter(Boolean).join(' ') || a.neighbourhood || a.suburb || '',
              city:    a.city || a.town || a.village || a.county || '',
              state:   a.state || '',
              zipCode: a.postcode || '',
              country: a.country || 'India',
              full:    j.display_name || '',
            };
          }
        } catch { /* geocoding optional — ignore failures */ }
        resolve(base);
      },
      (err) => resolve({ ok: false, reason: err.message || 'Location permission denied' }),
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });

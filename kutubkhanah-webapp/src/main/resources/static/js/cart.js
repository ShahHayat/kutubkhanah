/* Cart & checkout page. */
document.addEventListener('alpine:init', () => {
  const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  Alpine.data('checkout', (ctx) => ({
    authenticated: !!(ctx && ctx.authenticated),
    loginUrl: (ctx && ctx.loginUrl) || '/oauth2/authorization/kutubkhanah-webapp',
    placing: false,
    serverError: '',
    touched: {},
    v: {
      name: (ctx && ctx.user && ctx.user.name) || '',
      email: (ctx && ctx.user && ctx.user.email) || '',
      phone: '',
      line1: '', line2: '', city: '', state: '', zip: '', country: 'India'
    },
    comments: '',
    countries: ['India', 'Pakistan', 'Bangladesh', 'United Arab Emirates', 'Saudi Arabia', 'United Kingdom', 'United States', 'Other'],

    fields: {
      contact: [
        { k: 'name', label: 'Full name', type: 'text', ac: 'name', cls: '' },
        { k: 'email', label: 'Email', type: 'email', ac: 'email', cls: 'kk-field--half' },
        { k: 'phone', label: 'Phone', type: 'tel', ac: 'tel', cls: 'kk-field--third' }
      ],
      address: [
        { k: 'line1', label: 'Address line 1', ph: 'House number and street', ac: 'address-line1', cls: '' },
        { k: 'line2', label: 'Address line 2 · optional', ph: 'Apartment, floor, landmark', ac: 'address-line2', cls: '', optional: true },
        { k: 'city', label: 'City', ac: 'address-level2', cls: 'kk-field--third' },
        { k: 'state', label: 'State / province', ac: 'address-level1', cls: 'kk-field--third' },
        { k: 'zip', label: 'Postal code', ac: 'postal-code', cls: 'kk-field--quarter' }
      ]
    },

    touch(k) { this.touched[k] = true; },
    errorFor(k) {
      const val = (this.v[k] || '').trim();
      const def = this.fields.contact.concat(this.fields.address).find((f) => f.k === k) || {};
      if (!def.optional && !val) return 'Required';
      if (k === 'email' && val && !EMAIL.test(val)) return 'That email doesn’t look right';
      return '';
    },
    showError(k) { return !!this.touched[k] && !!this.errorFor(k); },
    get errorCount() {
      return this.fields.contact.concat(this.fields.address).filter((f) => this.errorFor(f.k)).length;
    },

    get cart() { return this.$store.cart; },
    get lines() { return this.cart.items.map((i) => Object.assign(KK.book(i), { quantity: i.quantity })); },
    get canPlace() { return this.cart.count > 0 && this.errorCount === 0 && !this.placing; },
    get blockReason() {
      if (this.cart.count === 0) return 'Add a book to place an order.';
      const n = this.errorCount;
      return n ? 'Fill in the highlighted ' + (n === 1 ? 'field' : n + ' fields') + ' to continue.' : '';
    },
    get emailShown() { return EMAIL.test(this.v.email || '') ? this.v.email : 'you'; },

    inc(code) { this.cart.setQty(code, this.cart.qty(code) + 1); },
    dec(code) { this.cart.setQty(code, this.cart.qty(code) - 1); },
    remove(code) { this.cart.remove(code); },

    async placeOrder() {
      this.fields.contact.concat(this.fields.address).forEach((f) => this.touch(f.k));
      if (!this.canPlace) return;
      this.placing = true;
      this.serverError = '';
      const body = {
        items: this.cart.items.map((i) => ({ code: i.code, name: i.name, price: i.price, quantity: i.quantity })),
        customer: { name: this.v.name.trim(), email: this.v.email.trim(), phone: this.v.phone.trim() },
        deliveryAddress: {
          addressLine1: this.v.line1.trim(), addressLine2: this.v.line2.trim(), city: this.v.city.trim(),
          state: this.v.state.trim(), zipCode: this.v.zip.trim(), country: this.v.country
        },
        comments: this.comments.trim()
      };
      try {
        const res = await KK.postJson('/api/orders', body);
        this.cart.clear();
        window.location = '/orders/' + encodeURIComponent(res.orderNumber) + '?placed=1';
      } catch (e) {
        this.placing = false;
        if (e.status === 401 || e.status === 403) { window.location = this.loginUrl; return; }
        this.serverError = e.message;
        KK.toast(e.message, { kind: 'error' });
      }
    },

    cover(b) { return KK.cover(b); },
    fmt(n) { return KK.fmt(n); }
  }));
});

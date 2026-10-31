/*
 * Orders page: list on the left, the selected order on the right.
 *
 * GET /api/orders only returns { orderNumber, status } per order, so each order's details are fetched
 * afterwards to fill in the date, items and total. A richer summary API removes those extra calls
 * (see the API list).
 */
document.addEventListener('alpine:init', () => {
  const FEATURES = { cancelOrders: false }; // flip on once the order service has a cancel endpoint

  const STATUS = {
    NEW: 'New', IN_PROCESS: 'In process', DELIVERED: 'Delivered', CANCELLED: 'Cancelled', ERROR: 'Error'
  };

  Alpine.data('orders', (ctx) => ({
    loading: true,
    error: '',
    orders: [],
    details: {},
    selected: (ctx && ctx.selected) || null,
    banner: !!(ctx && ctx.placed),
    userEmail: (ctx && ctx.userEmail) || '',
    features: FEATURES,

    async init() {
      try {
        this.orders = await KK.getJson('/api/orders');
        if (this.selected && !this.orders.some((o) => o.orderNumber === this.selected)) {
          this.orders.unshift({ orderNumber: this.selected, status: 'NEW' });
        }
        if (!this.selected && this.orders.length) this.selected = this.orders[0].orderNumber;
        this.loading = false;
        await Promise.allSettled(this.orders.map((o) => this.loadDetail(o.orderNumber)));
      } catch (e) {
        this.error = e.message;
        this.loading = false;
      }
    },

    async loadDetail(n) {
      try {
        const d = await KK.getJson('/api/orders/' + encodeURIComponent(n));
        d.books = (d.items || []).map((i) => Object.assign(KK.book(i), { quantity: i.quantity }));
        d.count = d.books.reduce((s, b) => s + b.quantity, 0);
        d.total = d.books.reduce((s, b) => s + b.price * b.quantity, 0);
        this.details[n] = d;
        const row = this.orders.find((o) => o.orderNumber === n);
        if (row && d.status) row.status = d.status;
      } catch (e) {
        this.details[n] = { error: e.message };
      }
    },

    select(n) {
      this.selected = n;
      history.replaceState(null, '', '/orders/' + encodeURIComponent(n));
      if (!this.details[n]) this.loadDetail(n);
    },

    get sel() { return this.selected ? this.details[this.selected] : null; },
    get selRow() { return this.orders.find((o) => o.orderNumber === this.selected) || null; },
    get countLabel() { return this.orders.length + (this.orders.length === 1 ? ' order' : ' orders'); },

    short(n) { return String(n || '').slice(0, 8).toUpperCase(); },
    statusLabel(s) { return STATUS[s] || s || ''; },
    statusClass(s) { return 'kk-status--' + (s || ''); },
    date(iso) { return KK.formatDate(iso); },
    thumbs(n) { const d = this.details[n]; return d && d.books ? d.books.slice(0, 3) : []; },
    summary(n) { const d = this.details[n]; return d && d.books ? d.count + (d.count === 1 ? ' book' : ' books') : ''; },
    total(n) { const d = this.details[n]; return d && d.books ? KK.fmt(d.total) : ''; },

    address(d) {
      if (!d || !d.deliveryAddress) return '';
      const a = d.deliveryAddress, c = d.customer || {};
      return [c.name, a.addressLine1, a.addressLine2, [a.city, a.state, a.zipCode].filter(Boolean).join(', '), a.country].filter(Boolean).join('\n');
    },
    contact(d) { if (!d || !d.customer) return ''; return [d.customer.email, d.customer.phone].filter(Boolean).join('\n'); },

    /** The journey strip: Placed → In process → Delivered, or Placed → Cancelled / Error. */
    steps(d) {
      if (!d) return [];
      const placedAt = d.createdAt ? KK.formatDate(d.createdAt) : '—';
      const s = d.status;
      if (s === 'CANCELLED' || s === 'ERROR') {
        return [
          { mark: '✓', label: 'Placed', note: 'We received your order.', time: placedAt, cls: 'is-done' },
          s === 'CANCELLED'
            ? { mark: '×', label: 'Cancelled', note: 'Cancelled before dispatch. Nothing was sent.', time: '—', cls: 'is-stop' }
            : { mark: '!', label: 'Needs attention', note: 'Something went wrong while processing. We will be in touch.', time: '—', cls: 'is-stop' }
        ];
      }
      const lvl = { NEW: 0, IN_PROCESS: 1, DELIVERED: 2 }[s] || 0;
      const cls = (i) => (i < lvl ? 'is-done' : i === lvl ? (lvl === 2 ? 'is-done' : 'is-now') : '');
      return [
        { mark: lvl > 0 ? '✓' : '01', label: 'Placed', note: 'Confirmation emailed the moment we accepted it.', time: placedAt, cls: cls(0) },
        { mark: lvl > 1 ? '✓' : '02', label: 'In process', note: 'Being packed and handed to the courier.', time: '—', cls: cls(1) },
        { mark: lvl === 2 ? '✓' : '03', label: 'Delivered', note: 'On your doorstep. Happy reading.', time: '—', cls: cls(2) }
      ];
    },

    cover(b) { return KK.cover(b); },
    fmt(n) { return KK.fmt(n); }
  }));
});

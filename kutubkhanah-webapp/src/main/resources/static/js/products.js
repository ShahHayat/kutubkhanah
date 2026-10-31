/*
 * Catalog page.
 *
 * The catalog API only supports paging today, so search, price bands and sorting are done in the browser
 * over the full list (15 titles). When the backend grows search/sort/filter parameters
 * (see the API list in the project notes), replace `load()` with a single server call per page.
 */
document.addEventListener('alpine:init', () => {
  const PAGE_SIZE = 10;

  Alpine.data('catalog', (initial) => ({
    loading: true,
    error: '',
    all: [],
    q: (initial && initial.q) || '',
    band: 'all',
    sort: 'name',
    page: (initial && initial.page) || 1,

    bands: [
      { id: 'all', label: 'All prices', test: () => true },
      { id: 'lt20', label: 'Under ' + KK.CURRENCY + '20', test: (p) => p < 20 },
      { id: 'mid', label: KK.CURRENCY + '20 – ' + KK.CURRENCY + '35', test: (p) => p >= 20 && p <= 35 },
      { id: 'gt35', label: 'Over ' + KK.CURRENCY + '35', test: (p) => p > 35 }
    ],
    sorts: [
      { id: 'name', label: 'Name A–Z', cmp: (a, b) => a.title.localeCompare(b.title) },
      { id: 'asc', label: 'Price ↑', cmp: (a, b) => a.price - b.price || a.title.localeCompare(b.title) },
      { id: 'desc', label: 'Price ↓', cmp: (a, b) => b.price - a.price || a.title.localeCompare(b.title) }
    ],

    async init() {
      try {
        this.all = await KK.allProducts();
      } catch (e) {
        this.error = e.message;
      }
      this.loading = false;
      this.$watch('q', () => { this.page = 1; this.syncUrl(); });
      this.$watch('band', () => { this.page = 1; });
      this.$watch('sort', () => { this.page = 1; });
      this.$watch('page', () => this.syncUrl());
    },

    syncUrl() {
      const params = new URLSearchParams();
      if (this.q.trim()) params.set('q', this.q.trim());
      if (this.page > 1) params.set('page', String(this.page));
      const qs = params.toString();
      history.replaceState(null, '', '/products' + (qs ? '?' + qs : ''));
    },

    get filtered() {
      const q = this.q.trim().toLowerCase();
      const band = this.bands.find((b) => b.id === this.band) || this.bands[0];
      const sort = this.sorts.find((s) => s.id === this.sort) || this.sorts[0];
      return this.all
        .filter((b) => band.test(b.price) && (!q || (b.title + ' ' + b.author + ' ' + b.code).toLowerCase().includes(q)))
        .sort(sort.cmp);
    },
    get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / PAGE_SIZE)); },
    get current() { return Math.min(Math.max(1, this.page), this.totalPages); },
    get items() { const s = (this.current - 1) * PAGE_SIZE; return this.filtered.slice(s, s + PAGE_SIZE); },
    get pages() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); },
    get rangeLabel() {
      const n = this.filtered.length;
      if (!n) return 'No matches';
      const s = (this.current - 1) * PAGE_SIZE;
      return 'Showing ' + (s + 1) + '–' + Math.min(s + PAGE_SIZE, n) + ' of ' + n;
    },
    get totalLabel() { return this.all.length + ' titles · ' + this.totalPages + (this.totalPages === 1 ? ' page' : ' pages'); },

    clear() { this.q = ''; this.band = 'all'; this.page = 1; },
    go(n) { this.page = Math.min(this.totalPages, Math.max(1, n)); window.scrollTo({ top: 0, behavior: 'smooth' }); },

    cover(b) { return KK.cover(b); },
    fmt(n) { return KK.fmt(n); },
    inCart(code) { return this.$store.cart.has(code); },
    add(b) { this.$store.cart.add(b, 1); }
  }));
});

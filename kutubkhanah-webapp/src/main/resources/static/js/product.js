/* Book detail page. */
document.addEventListener('alpine:init', () => {
  Alpine.data('product', (code) => ({
    code,
    loading: true,
    notFound: false,
    error: '',
    book: null,
    related: [],
    qty: 1,
    gl: false,
    scene: null,

    async init() {
      try {
        this.book = KK.book(await KK.getJson('/api/products/' + encodeURIComponent(this.code)));
        document.title = this.book.title + ' — Kutub Khanah';
        this.loading = false;
        this.$nextTick(() => this.mount());
      } catch (e) {
        if (e.status === 404) this.notFound = true; else this.error = e.message;
        this.loading = false;
        return;
      }
      try {
        // "Also under X": the four closest-priced titles. Replace with a related-products API when it exists.
        const all = await KK.allProducts();
        const me = this.book;
        this.related = all
          .filter((b) => b.code !== me.code)
          .sort((a, b) => Math.abs(a.price - me.price) - Math.abs(b.price - me.price) || a.title.localeCompare(b.title))
          .slice(0, 4);
      } catch (ignored) { /* the shelf is optional */ }
    },

    mount() {
      const canvas = this.$refs.stage;
      if (!canvas || !this.book) return;
      KK.when3d((k3d) => {
        this.scene = k3d.mountBook(canvas, this.book);
        if (this.scene) this.gl = true;
      });
    },

    destroy() { if (this.scene) this.scene.dispose(); },

    get under() {
      if (!this.related.length) return '';
      const max = Math.max.apply(null, this.related.map((b) => b.price).concat([this.book.price]));
      return KK.CURRENCY + Math.ceil(max / 5) * 5;
    },
    get inCart() { return this.book && this.$store.cart.has(this.book.code); },
    inc() { this.qty = Math.min(9, this.qty + 1); },
    dec() { this.qty = Math.max(1, this.qty - 1); },
    add() { this.$store.cart.add(this.book, this.qty); },
    cover(b) { return KK.cover(b); },
    fmt(n) { return KK.fmt(n); }
  }));
});

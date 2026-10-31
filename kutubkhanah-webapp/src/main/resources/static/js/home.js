/* Home page. */
document.addEventListener('alpine:init', () => {
  Alpine.data('home', () => ({
    loading: true,
    error: '',
    books: [],
    shelf: [],
    feature: null,
    hover: null,
    gl: false,
    scene: null,

    async init() {
      try {
        this.books = await KK.allProducts();
        // "Five to begin with": the five least expensive titles.
        this.shelf = this.books.slice().sort((a, b) => a.price - b.price || a.title.localeCompare(b.title)).slice(0, 5);
        // Featured: the title with the most to say about itself.
        this.feature = this.books.slice().sort((a, b) => b.description.length - a.description.length)[0] || null;
        this.loading = false;
        this.$nextTick(() => this.mount());
      } catch (e) {
        this.error = e.message;
        this.loading = false;
      }
    },

    mount() {
      const canvas = this.$refs.orbit;
      if (!canvas || !this.books.length) return;
      KK.when3d((k3d) => {
        this.scene = k3d.mountOrbit(canvas, this.books, (b) => { this.hover = b; });
        if (this.scene) this.gl = true;
      });
    },

    destroy() {
      if (this.scene) this.scene.dispose();
    },

    cover(b) { return KK.cover(b); },
    fmt(n) { return KK.fmt(n); },
    inCart(code) { return this.$store.cart.has(code); },
    add(b) { this.$store.cart.add(b, 1); }
  }));
});

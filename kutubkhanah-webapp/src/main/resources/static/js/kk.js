/*
 * Kutub Khanah — shared browser helpers.
 *
 *  KK.fmt(n)            → formatted price
 *  KK.book(product)     → normalised book object used by every page
 *  KK.cover(book)       → HTML for the generated cloth cover (use with x-html)
 *  KK.getJson(url)      → fetch that throws a readable Error on failure
 *  KK.allProducts()     → every product in the catalog (pages are fetched one after another)
 *  KK.toast(msg, opts)  → small non-blocking message
 *  Alpine.store('cart') → the cart, kept in localStorage
 */
window.KK = (function () {
  'use strict';

  var CURRENCY = '$';
  var STORAGE_KEY = 'KUTUBKHANAH_CART';

  // Cloth colours per book code, taken from the design. Unknown codes get a stable colour from the same palette.
  var CLOTH = {
    P100: '#5E2419', P101: '#2E3A26', P102: '#1F3550', P103: '#5C1E2A', P104: '#22304F',
    P105: '#2F4A33', P106: '#3A2A1E', P107: '#6E4518', P108: '#3F4A2C', P109: '#1C3B4A',
    P110: '#6E3418', P111: '#2B2B30', P112: '#4A2238', P113: '#24443F', P114: '#34363C'
  };
  var PALETTE = Object.keys(CLOTH).map(function (k) { return CLOTH[k]; });

  function cloth(code) {
    if (CLOTH[code]) return CLOTH[code];
    var h = 0, s = String(code || '');
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return PALETTE[h % PALETTE.length];
  }

  function fmt(n) {
    return CURRENCY + Number(n || 0).toFixed(2);
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /** Turns a catalog product (or an order item) into the shape the templates use. */
  function book(p) {
    if (!p) return null;
    return {
      code: p.code,
      title: p.name || p.title || '',
      author: p.author || '',
      description: p.description || '',
      imageUrl: p.imageUrl || '',
      price: Number(p.price || 0),
      quantity: p.quantity,
      cloth: cloth(p.code)
    };
  }

  function titleSize(t) {
    var n = (t || '').length;
    return n <= 13 ? '12.4cqw' : n <= 18 ? '10.8cqw' : n <= 24 ? '9.4cqw' : '8.4cqw';
  }

  /** The generated cloth cover from the design, as HTML. */
  function cover(b) {
    if (!b) return '';
    var label = 'Cover of ' + b.title + (b.author ? ' by ' + b.author : '');
    return '' +
      '<div class="kk-cover" role="img" aria-label="' + esc(label) + '" style="--cloth:' + esc(b.cloth || cloth(b.code)) + '">' +
        '<div class="kk-cover__weave" aria-hidden="true"></div>' +
        '<div class="kk-cover__shade" aria-hidden="true"></div>' +
        '<div class="kk-cover__spine" aria-hidden="true"></div>' +
        '<div class="kk-cover__frame" aria-hidden="true"></div>' +
        '<div class="kk-cover__frame-2" aria-hidden="true"></div>' +
        '<div class="kk-cover__body" aria-hidden="true">' +
          '<div class="kk-cover__code">N° ' + esc(b.code) + '</div>' +
          '<div class="kk-cover__mid">' +
            '<div class="kk-cover__orn"><i></i><b></b><i></i></div>' +
            '<div class="kk-cover__title" style="font-size:' + titleSize(b.title) + '">' + esc(b.title) + '</div>' +
            '<div class="kk-cover__bar"></div>' +
            (b.author ? '<div class="kk-cover__author">' + esc(b.author) + '</div>' : '') +
          '</div>' +
          '<div class="kk-cover__brand">' +
            '<div class="kk-cover__brand-urdu" lang="ur">کتب خانہ</div>' +
            '<div class="kk-cover__brand-latin">KUTUB KHANAH</div>' +
          '</div>' +
        '</div>' +
        '<div class="kk-cover__sheen" aria-hidden="true"></div>' +
      '</div>';
  }

  async function getJson(url, options) {
    var opts = Object.assign({ headers: { Accept: 'application/json' } }, options || {});
    var res;
    try {
      res = await fetch(url, opts);
    } catch (e) {
      var err = new Error('The shelf is unreachable right now. Check your connection and try again.');
      err.status = 0;
      throw err;
    }
    if (!res.ok) {
      var detail = '';
      try { var p = await res.json(); detail = p.detail || p.title || ''; } catch (ignored) { /* no body */ }
      var e2 = new Error(detail || ('Request failed (' + res.status + ')'));
      e2.status = res.status;
      throw e2;
    }
    if (res.status === 204) return null;
    return res.json();
  }

  function postJson(url, body) {
    return getJson(url, {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
  }

  var productsCache = null;

  /**
   * Loads the whole catalog. The catalog API only pages (10 per page), so pages are fetched one after another.
   * TODO: replace with a single call once the catalog exposes "all products" / search / sort (see the API list).
   */
  async function allProducts() {
    if (productsCache) return productsCache;
    var page = 1, totalPages = 1, all = [];
    do {
      var res = await getJson('/api/products?page=' + page);
      all = all.concat(res.data || []);
      totalPages = res.totalPages || 1;
      page++;
    } while (page <= totalPages && page < 50);
    productsCache = all.map(book);
    return productsCache;
  }

  /* ---------------------------------------------------------------- toasts */
  function toast(message, opts) {
    opts = opts || {};
    var host = document.getElementById('kk-toasts');
    if (!host) return;
    var el = document.createElement('div');
    el.className = 'kk-toast' + (opts.kind === 'error' ? ' kk-toast--error' : '');
    el.setAttribute('role', 'status');
    var icon = opts.kind === 'error'
      ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 7v6"/><path d="M12 17v.01"/></svg>'
      : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
    el.innerHTML = '<span class="kk-toast__mark" aria-hidden="true">' + icon + '</span><span>' + esc(message) + '</span>' +
      (opts.link ? '<a href="' + esc(opts.link.href) + '">' + esc(opts.link.label) + '</a>' : '');
    host.appendChild(el);
    setTimeout(function () { el.classList.add('is-leaving'); setTimeout(function () { el.remove(); }, 350); }, opts.duration || 3200);
  }

  /* -------------------------------------------------------------- cart store */
  document.addEventListener('alpine:init', function () {
    Alpine.store('cart', {
      items: [],
      init: function () {
        try {
          var saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
          this.items = (saved && Array.isArray(saved.items)) ? saved.items : [];
        } catch (e) { this.items = []; }
      },
      save: function () {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ items: this.items })); } catch (e) { /* private mode */ }
      },
      get count() { return this.items.reduce(function (s, i) { return s + i.quantity; }, 0); },
      get total() { return this.items.reduce(function (s, i) { return s + i.price * i.quantity; }, 0); },
      has: function (code) { return this.items.some(function (i) { return i.code === code; }); },
      qty: function (code) { var it = this.items.find(function (i) { return i.code === code; }); return it ? it.quantity : 0; },
      add: function (b, qty) {
        qty = Math.max(1, parseInt(qty || 1, 10));
        var it = this.items.find(function (i) { return i.code === b.code; });
        if (it) it.quantity = Math.min(9, it.quantity + qty);
        else this.items.push({ code: b.code, name: b.title || b.name, price: Number(b.price), quantity: Math.min(9, qty) });
        this.save();
        bump();
        toast((qty > 1 ? qty + ' × ' : '') + (b.title || b.name) + ' added to your cart', { link: { href: '/cart', label: 'View cart' } });
      },
      setQty: function (code, q) {
        q = parseInt(q, 10);
        if (isNaN(q) || q < 1) return this.remove(code);
        var it = this.items.find(function (i) { return i.code === code; });
        if (it) it.quantity = Math.min(9, q);
        this.save();
      },
      remove: function (code) {
        this.items = this.items.filter(function (i) { return i.code !== code; });
        this.save();
      },
      clear: function () { this.items = []; this.save(); }
    });
  });

  function bump() {
    document.querySelectorAll('.kk-cart-badge').forEach(function (el) {
      el.classList.add('is-bump');
      setTimeout(function () { el.classList.remove('is-bump'); }, 320);
    });
  }

  /** Waits for the 3D modules (orbit3d.js / book3d.js) which load as ES modules after Alpine. */
  function when3d(cb) {
    var tries = 0;
    (function go() {
      if (window.KK3D) cb(window.KK3D);
      else if (tries++ < 60) setTimeout(go, 120);
    })();
  }

  function formatDate(iso) {
    if (!iso) return '';
    var d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
      d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  }

  return {
    CURRENCY: CURRENCY, fmt: fmt, esc: esc, cloth: cloth, book: book, cover: cover,
    getJson: getJson, postJson: postJson, allProducts: allProducts, toast: toast, when3d: when3d, formatDate: formatDate
  };
})();

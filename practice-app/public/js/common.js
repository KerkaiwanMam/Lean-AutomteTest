/* ShopLab shared front-end helpers: API client, header, i18n, toasts. */
window.SL = (() => {
  const I18N = {
    en: {
      'nav.products': 'Products', 'nav.cart': 'Cart', 'nav.orders': 'My Orders', 'nav.admin': 'Admin', 'nav.lab': 'Elements Lab',
      'nav.api': 'API Docs', 'nav.login': 'Login', 'nav.register': 'Register', 'nav.logout': 'Logout',
      'catalog.title': 'Products', 'catalog.search': 'Search products', 'catalog.searchBtn': 'Search', 'catalog.category': 'Category',
      'catalog.all': 'All categories', 'catalog.sort': 'Sort by', 'catalog.inStock': 'In stock only', 'catalog.minPrice': 'Min price',
      'catalog.maxPrice': 'Max price', 'catalog.apply': 'Apply filters', 'catalog.clear': 'Clear', 'catalog.empty': 'No products found',
      'catalog.addToCart': 'Add to cart', 'catalog.outOfStock': 'Out of stock', 'catalog.prev': 'Previous', 'catalog.next': 'Next',
      'login.title': 'Login', 'login.username': 'Username', 'login.password': 'Password', 'login.submit': 'Login', 'login.show': 'Show password',
      'login.noAccount': "Don't have an account?", 'cart.title': 'Shopping Cart', 'cart.empty': 'Your cart is empty',
      'cart.coupon': 'Coupon code', 'cart.apply': 'Apply', 'cart.checkout': 'Proceed to checkout', 'cart.remove': 'Remove',
      'summary.subtotal': 'Subtotal', 'summary.discount': 'Discount', 'summary.shipping': 'Shipping', 'summary.vat': 'VAT 7%', 'summary.total': 'Total',
      'orders.title': 'My Orders', 'register.title': 'Create account', 'checkout.title': 'Checkout', 'admin.title': 'Back Office',
    },
    th: {
      'nav.products': 'สินค้า', 'nav.cart': 'ตะกร้า', 'nav.orders': 'คำสั่งซื้อของฉัน', 'nav.admin': 'ผู้ดูแลระบบ', 'nav.lab': 'แล็บองค์ประกอบ',
      'nav.api': 'เอกสาร API', 'nav.login': 'เข้าสู่ระบบ', 'nav.register': 'สมัครสมาชิก', 'nav.logout': 'ออกจากระบบ',
      'catalog.title': 'สินค้า', 'catalog.search': 'ค้นหาสินค้า', 'catalog.searchBtn': 'ค้นหา', 'catalog.category': 'หมวดหมู่',
      'catalog.all': 'ทุกหมวดหมู่', 'catalog.sort': 'เรียงตาม', 'catalog.inStock': 'เฉพาะสินค้าที่มีของ', 'catalog.minPrice': 'ราคาต่ำสุด',
      'catalog.maxPrice': 'ราคาสูงสุด', 'catalog.apply': 'กรอง', 'catalog.clear': 'ล้าง', 'catalog.empty': 'ไม่พบสินค้า',
      'catalog.addToCart': 'ใส่ตะกร้า', 'catalog.outOfStock': 'สินค้าหมด', 'catalog.prev': 'ก่อนหน้า', 'catalog.next': 'ถัดไป',
      'login.title': 'เข้าสู่ระบบ', 'login.username': 'ชื่อผู้ใช้', 'login.password': 'รหัสผ่าน', 'login.submit': 'เข้าสู่ระบบ', 'login.show': 'แสดงรหัสผ่าน',
      'login.noAccount': 'ยังไม่มีบัญชี?', 'cart.title': 'ตะกร้าสินค้า', 'cart.empty': 'ตะกร้าของคุณว่างเปล่า',
      'cart.coupon': 'โค้ดส่วนลด', 'cart.apply': 'ใช้โค้ด', 'cart.checkout': 'ไปชำระเงิน', 'cart.remove': 'ลบ',
      'summary.subtotal': 'ยอดรวมสินค้า', 'summary.discount': 'ส่วนลด', 'summary.shipping': 'ค่าจัดส่ง', 'summary.vat': 'VAT 7%', 'summary.total': 'ยอดสุทธิ',
      'orders.title': 'คำสั่งซื้อของฉัน', 'register.title': 'สมัครสมาชิก', 'checkout.title': 'ชำระเงิน', 'admin.title': 'ระบบหลังบ้าน',
    },
  };

  const lang = () => {
    try { return localStorage.getItem('sl_lang') || 'en'; } catch { return 'en'; }
  };
  const t = (key) => (I18N[lang()] && I18N[lang()][key]) || I18N.en[key] || key;

  function applyI18n(root = document) {
    document.documentElement.lang = lang();
    root.querySelectorAll('[data-i18n]').forEach((el) => { el.textContent = t(el.dataset.i18n); });
    root.querySelectorAll('[data-i18n-placeholder]').forEach((el) => { el.placeholder = t(el.dataset.i18nPlaceholder); });
  }

  /** fetch wrapper → { ok, status, data } (never throws for HTTP errors) */
  async function api(path, { method = 'GET', body, form } = {}) {
    const opts = { method, headers: {}, credentials: 'same-origin' };
    if (form) opts.body = form;
    else if (body !== undefined) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    try {
      const res = await fetch(`/api${path}`, opts);
      let data = null;
      const type = res.headers.get('content-type') || '';
      if (type.includes('application/json')) data = await res.json();
      else if (res.status !== 204) data = await res.text();
      return { ok: res.ok, status: res.status, data };
    } catch (e) {
      return { ok: false, status: 0, data: { error: { code: 'NETWORK', message: e.message } } };
    }
  }

  const money = (n) => `฿${Number(n || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const qs = (name) => new URLSearchParams(location.search).get(name);
  const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const errMsg = (r) => (r.data && r.data.error && r.data.error.message) || `Request failed (${r.status})`;

  function toast(message, type = 'info', ms = 3000) {
    let region = document.getElementById('toast-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'toast-region';
      region.setAttribute('aria-live', 'polite');
      document.body.appendChild(region);
    }
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.setAttribute('role', 'status');
    el.dataset.testid = 'toast';
    el.textContent = message;
    region.appendChild(el);
    setTimeout(() => el.remove(), ms);
  }

  let mePromise;
  const me = () => {
    mePromise = mePromise || api('/auth/me').then((r) => (r.ok ? r.data.user : null));
    return mePromise;
  };
  let configPromise;
  const config = () => {
    configPromise = configPromise || api('/test/config').then((r) => (r.ok ? r.data : { bugMode: false }));
    return configPromise;
  };

  async function refreshCartCount() {
    const el = document.querySelector('[data-testid="cart-count"]');
    if (!el) return;
    const user = await me();
    if (!user) { el.textContent = '0'; return; }
    const r = await api('/cart');
    el.textContent = r.ok ? String(r.data.count) : '0';
  }

  async function renderHeader(active) {
    const host = document.getElementById('app-header');
    if (!host) return;
    const [user, cfg] = await Promise.all([me(), config()]);
    const link = (href, key, id) => `<a href="${href}" data-testid="nav-${id}" ${active === id ? 'class="active" aria-current="page"' : ''} data-i18n="${key}">${t(key)}</a>`;
    host.innerHTML = `
      ${cfg.bugMode ? '<div class="bug-banner" data-testid="bug-banner">BUG MODE is ON — intentional defects are active</div>' : ''}
      <header class="site-header">
        <div class="inner">
          <a class="brand" href="/" data-testid="brand"><img src="/img/logo.svg" alt="" width="26" height="26"> ShopLab</a>
          <nav aria-label="Main">
            ${link('/', 'nav.products', 'products')}
            ${link('/lab', 'nav.lab', 'lab')}
            ${link('/api-docs', 'nav.api', 'api')}
            ${user && user.role === 'admin' ? link('/admin', 'nav.admin', 'admin') : ''}
          </nav>
          <div class="right">
            <a href="/cart" data-testid="nav-cart" class="linkish"><span data-i18n="nav.cart">${t('nav.cart')}</span> <span class="badge" data-testid="cart-count">0</span></a>
            ${user ? `
              <a href="/orders" class="linkish" data-testid="nav-orders" data-i18n="nav.orders">${t('nav.orders')}</a>
              <span class="linkish" data-testid="nav-username" title="${esc(user.email)}">👤 ${esc(user.username)}</span>
              <button class="linkish" data-testid="nav-logout" type="button" data-i18n="nav.logout">${t('nav.logout')}</button>` : `
              <a href="/login" class="linkish" data-testid="nav-login" data-i18n="nav.login">${t('nav.login')}</a>
              <a href="/register" class="linkish" data-testid="nav-register" data-i18n="nav.register">${t('nav.register')}</a>`}
            <button class="linkish" type="button" data-testid="lang-toggle" title="Switch language">${lang() === 'en' ? 'TH' : 'EN'}</button>
          </div>
        </div>
      </header>`;
    const logout = host.querySelector('[data-testid="nav-logout"]');
    if (logout) logout.addEventListener('click', async () => { await api('/auth/logout', { method: 'POST' }); location.href = '/login'; });
    host.querySelector('[data-testid="lang-toggle"]').addEventListener('click', () => {
      try { localStorage.setItem('sl_lang', lang() === 'en' ? 'th' : 'en'); } catch { /* ignore */ }
      location.reload();
    });
    if (!document.querySelector('footer.site-footer')) {
      document.body.insertAdjacentHTML('beforeend', '<footer class="site-footer">ShopLab — practice application for test automation training. Not a real shop.</footer>');
    }
    applyI18n();
    refreshCartCount();
  }

  async function requireLogin() {
    const user = await me();
    if (!user) {
      location.href = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;
      return new Promise(() => {}); // stop the caller
    }
    return user;
  }

  /** Show field errors: elements with data-testid="error-<field>" */
  function showFieldErrors(form, errors = {}) {
    form.querySelectorAll('.field').forEach((f) => f.classList.remove('invalid'));
    form.querySelectorAll('.field-error').forEach((e) => { e.textContent = ''; });
    Object.entries(errors).forEach(([field, message]) => {
      const el = form.querySelector(`[data-testid="error-${field}"]`);
      if (el) {
        el.textContent = message;
        el.closest('.field')?.classList.add('invalid');
      }
    });
  }

  return { api, money, qs, esc, errMsg, toast, me, config, renderHeader, refreshCartCount, requireLogin, showFieldErrors, t, applyI18n, lang };
})();

(async () => {
  const { api, money, esc, t, toast, me, refreshCartCount } = window.SL;
  await window.SL.renderHeader('products');

  const form = document.getElementById('filter-form');
  const grid = document.getElementById('grid');
  const loading = document.getElementById('loading');
  const errorBox = document.getElementById('error');
  const empty = document.getElementById('empty');
  const summary = document.querySelector('[data-testid="result-summary"]');
  const pagination = document.getElementById('pagination');
  const FIELDS = ['search', 'category', 'sort', 'minPrice', 'maxPrice', 'inStock', 'page'];

  const cats = await api('/categories');
  if (cats.ok) {
    const sel = document.getElementById('category');
    cats.data.categories.forEach((c) => sel.insertAdjacentHTML('beforeend', `<option value="${c.category}">${c.category} (${c.count})</option>`));
  }

  // URL <-> form sync, so every state is deep-linkable (handy for tests: page.goto('/?category=books'))
  function stateFromUrl() {
    const p = new URLSearchParams(location.search);
    FIELDS.forEach((f) => {
      const el = form.elements[f];
      if (!el) return;
      if (el.type === 'checkbox') el.checked = p.get(f) === 'true';
      else if (p.has(f)) el.value = p.get(f);
    });
    return p;
  }

  function buildQuery(page = 1) {
    const p = new URLSearchParams();
    const fd = new FormData(form);
    for (const [k, v] of fd.entries()) if (v !== '') p.set(k, v);
    if (page > 1) p.set('page', String(page));
    return p;
  }

  function card(p) {
    const name = window.SL.lang() === 'th' ? p.nameTh : p.name;
    return `
      <article class="card product-card" data-testid="product-card" data-product-id="${p.id}" data-sku="${p.sku}">
        <img src="${p.image}" alt="${esc(p.name)}">
        <a class="name" href="/product?id=${p.id}" data-testid="product-name">${esc(name)}</a>
        <div><span class="tag">${p.category}</span> ${p.inStock ? '' : `<span class="tag out" data-testid="out-of-stock">${t('catalog.outOfStock')}</span>`}</div>
        <div class="price" data-testid="product-price" data-price="${p.price}">${money(p.price)}</div>
        <div class="muted"><span class="stars" aria-label="Rating ${p.rating} of 5">★</span> ${p.rating.toFixed(1)}</div>
        <div class="actions">
          <button class="btn primary small" type="button" data-testid="add-to-cart" data-product-id="${p.id}" ${p.inStock ? '' : 'disabled'}>${t('catalog.addToCart')}</button>
        </div>
      </article>`;
  }

  function renderPagination(page, totalPages) {
    if (totalPages <= 1) { pagination.innerHTML = ''; return; }
    let html = `<button class="btn small" type="button" data-page="${page - 1}" data-testid="pagination-prev" ${page <= 1 ? 'disabled' : ''}>${t('catalog.prev')}</button>`;
    for (let i = 1; i <= totalPages; i += 1) {
      html += `<button class="btn small" type="button" data-page="${i}" data-testid="pagination-page" ${i === page ? 'aria-current="page"' : ''}>${i}</button>`;
    }
    html += `<button class="btn small" type="button" data-page="${page + 1}" data-testid="pagination-next" ${page >= totalPages ? 'disabled' : ''}>${t('catalog.next')}</button>`;
    pagination.innerHTML = html;
  }

  async function load(params) {
    grid.innerHTML = '';
    pagination.innerHTML = '';
    [errorBox, empty].forEach((e) => e.classList.add('hidden'));
    loading.classList.remove('hidden');
    summary.textContent = '';
    const r = await api(`/products?${params.toString()}`);
    loading.classList.add('hidden');
    if (!r.ok) {
      document.getElementById('error-text').textContent = window.SL.errMsg(r);
      errorBox.classList.remove('hidden');
      return;
    }
    const { items, total, page, pageSize, totalPages } = r.data;
    if (!items.length) { empty.classList.remove('hidden'); summary.textContent = 'Showing 0 of 0 products'; return; }
    grid.innerHTML = items.map(card).join('');
    const from = (page - 1) * pageSize + 1;
    summary.textContent = `Showing ${from}–${from + items.length - 1} of ${total} products`;
    renderPagination(page, totalPages);
  }

  function navigate(page = 1) {
    const p = buildQuery(page);
    history.pushState(null, '', `${location.pathname}${p.toString() ? `?${p}` : ''}`);
    load(p);
  }

  form.addEventListener('submit', (e) => { e.preventDefault(); navigate(1); });
  document.getElementById('category').addEventListener('change', () => navigate(1));
  document.getElementById('sort').addEventListener('change', () => navigate(Number(new URLSearchParams(location.search).get('page')) || 1));
  document.getElementById('clear-filters').addEventListener('click', () => { form.reset(); navigate(1); });
  document.getElementById('retry').addEventListener('click', () => load(new URLSearchParams(location.search)));
  pagination.addEventListener('click', (e) => {
    const b = e.target.closest('button[data-page]');
    if (b && !b.disabled) { navigate(Number(b.dataset.page)); window.scrollTo(0, 0); }
  });
  window.addEventListener('popstate', () => load(stateFromUrl()));

  grid.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-testid="add-to-cart"]');
    if (!b) return;
    if (!(await me())) { location.href = `/login?next=${encodeURIComponent(location.pathname + location.search)}`; return; }
    b.disabled = true;
    const r = await api('/cart/items', { method: 'POST', body: { productId: Number(b.dataset.productId), qty: 1 } });
    b.disabled = false;
    if (r.ok) { toast('Added to cart', 'success'); refreshCartCount(); } else toast(window.SL.errMsg(r), 'error');
  });

  load(stateFromUrl());
})();

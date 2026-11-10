(async () => {
  const { api, money, esc, toast, errMsg, showFieldErrors, requireLogin } = window.SL;
  await window.SL.renderHeader('admin');
  const user = await requireLogin();
  if (user.role !== 'admin') { document.getElementById('forbidden').classList.remove('hidden'); return; }
  document.getElementById('admin').classList.remove('hidden');

  // ---- tabs (WAI-ARIA tabs pattern, arrow keys supported) ----
  const tabs = [...document.querySelectorAll('[role=tab]')];
  const loaders = { dashboard: loadStats, products: loadProducts, orders: loadOrders, users: loadUsers };
  function selectTab(tab) {
    tabs.forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')).hidden = !on;
    });
    loaders[tab.id.replace('tab-', '')]();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        next.focus();
        selectTab(next);
      }
    });
  });

  async function loadStats() {
    const r = await api('/admin/stats');
    if (!r.ok) return;
    const s = r.data;
    const tile = (label, value, id) => `<div class="card stat" data-testid="stat-${id}"><div class="muted">${label}</div><div class="value">${value}</div></div>`;
    document.getElementById('stats').innerHTML = tile('Users', s.users, 'users') + tile('Active products', s.products, 'products')
      + tile('Out of stock', s.outOfStock, 'out-of-stock') + tile('Orders', s.orders, 'orders') + tile('Revenue', money(s.revenue), 'revenue');
  }

  // ---- products ----
  let products = [];
  async function loadProducts() {
    const r = await api('/products?pageSize=50&includeInactive=1&sort=newest');
    products = r.ok ? r.data.items : [];
    // load a second page if needed (pageSize max = 50)
    if (r.ok && r.data.totalPages > 1) {
      for (let p = 2; p <= r.data.totalPages; p += 1) {
        const more = await api(`/products?pageSize=50&includeInactive=1&sort=newest&page=${p}`);
        if (more.ok) products = products.concat(more.data.items);
      }
    }
    renderProducts();
  }
  function renderProducts() {
    const f = document.getElementById('product-filter').value.trim().toLowerCase();
    const list = products.filter((p) => !f || p.sku.toLowerCase().includes(f) || p.name.toLowerCase().includes(f));
    document.getElementById('products-body').innerHTML = list.map((p) => `
      <tr data-testid="admin-product-row" data-product-id="${p.id}" data-sku="${p.sku}">
        <td>${p.id}</td><td>${p.sku}</td><td data-testid="admin-product-name">${esc(p.name)}</td><td>${p.category}</td>
        <td class="right-align" data-testid="admin-product-price">${money(p.price)}</td><td class="right-align" data-testid="admin-product-stock">${p.stock}</td>
        <td>${p.active ? 'Yes' : '<span class="muted">No</span>'}</td>
        <td><button class="btn small" type="button" data-action="edit" data-testid="edit-product">Edit</button>
            ${p.active ? '<button class="btn small danger" type="button" data-action="delete" data-testid="delete-product">Delete</button>' : ''}</td>
      </tr>`).join('');
  }
  document.getElementById('product-filter').addEventListener('input', renderProducts);

  const modal = document.getElementById('product-modal');
  const pform = document.getElementById('product-form');
  function openModal(p) {
    pform.reset();
    showFieldErrors(pform, {});
    document.getElementById('pf-error').classList.add('hidden');
    document.getElementById('modal-title').textContent = p ? `Edit product ${p.sku}` : 'Add product';
    pform.id.value = p ? p.id : '';
    if (p) {
      pform.sku.value = p.sku; pform.category.value = p.category; pform.name.value = p.name; pform.nameTh.value = p.nameTh;
      pform.price.value = p.price; pform.stock.value = p.stock; pform.description.value = p.description || '';
    }
    modal.classList.remove('hidden');
    pform.sku.focus();
  }
  const closeModal = () => modal.classList.add('hidden');
  document.getElementById('add-product').addEventListener('click', () => openModal(null));
  document.getElementById('pf-cancel').addEventListener('click', closeModal);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeModal(); closeConfirm(false); } });

  pform.addEventListener('submit', async (e) => {
    e.preventDefault();
    const body = {
      sku: pform.sku.value.trim(), category: pform.category.value, name: pform.name.value.trim(), nameTh: pform.nameTh.value.trim() || undefined,
      price: pform.price.value === '' ? undefined : Number(pform.price.value), stock: pform.stock.value === '' ? undefined : Number(pform.stock.value),
      description: pform.description.value,
    };
    const id = pform.id.value;
    const r = await api(id ? `/products/${id}` : '/products', { method: id ? 'PUT' : 'POST', body });
    if (!r.ok) {
      showFieldErrors(pform, r.data.error.details || {});
      const box = document.getElementById('pf-error');
      box.textContent = errMsg(r);
      box.classList.remove('hidden');
      return;
    }
    closeModal();
    toast(id ? 'Product updated' : 'Product created', 'success');
    loadProducts();
  });

  // custom confirm dialog (not window.confirm) — practice for modal handling
  let confirmResolve;
  function askConfirm(text) {
    document.getElementById('confirm-text').textContent = text;
    document.getElementById('confirm-modal').classList.remove('hidden');
    document.getElementById('confirm-no').focus();
    return new Promise((r) => { confirmResolve = r; });
  }
  function closeConfirm(v) {
    document.getElementById('confirm-modal').classList.add('hidden');
    if (confirmResolve) { confirmResolve(v); confirmResolve = null; }
  }
  document.getElementById('confirm-yes').addEventListener('click', () => closeConfirm(true));
  document.getElementById('confirm-no').addEventListener('click', () => closeConfirm(false));

  document.getElementById('products-body').addEventListener('click', async (e) => {
    const b = e.target.closest('button[data-action]');
    if (!b) return;
    const id = Number(b.closest('tr').dataset.productId);
    const p = products.find((x) => x.id === id);
    if (b.dataset.action === 'edit') openModal(p);
    if (b.dataset.action === 'delete' && await askConfirm(`Delete product ${p.sku} — ${p.name}?`)) {
      const r = await api(`/products/${id}`, { method: 'DELETE' });
      if (r.ok) toast('Product deleted', 'success'); else toast(errMsg(r), 'error');
      loadProducts();
    }
  });

  document.getElementById('import-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const out = document.getElementById('import-result');
    const fileInput = document.getElementById('import-file');
    if (!fileInput.files.length) { out.textContent = 'Choose a CSV file first'; return; }
    const fd = new FormData();
    fd.append('file', fileInput.files[0]);
    const r = await api('/admin/products/import', { method: 'POST', form: fd });
    out.textContent = r.ok
      ? `Created ${r.data.created}, updated ${r.data.updated}, errors ${r.data.errors.length}${r.data.errors.length ? `: ${r.data.errors.map((x) => `line ${x.line} ${x.message}`).join('; ')}` : ''}`
      : errMsg(r);
    if (r.ok) loadProducts();
  });

  // ---- orders ----
  const NEXT = { PENDING: ['PAID', 'CANCELLED'], PAID: ['SHIPPED', 'CANCELLED'], SHIPPED: ['DELIVERED'], DELIVERED: [], CANCELLED: [] };
  async function loadOrders() {
    const r = await api('/orders?all=1');
    const items = r.ok ? r.data.items : [];
    document.getElementById('orders-body').innerHTML = items.map((o) => `
      <tr data-testid="admin-order-row" data-order-id="${o.id}" data-order-no="${o.orderNo}">
        <td>${o.orderNo}</td><td>${o.userId}</td><td><span class="status ${o.status}" data-testid="admin-order-status">${o.status}</span></td>
        <td class="right-align">${money(o.total)}</td>
        <td>${NEXT[o.status].length ? `<select aria-label="New status for ${o.orderNo}" data-testid="admin-order-next">${NEXT[o.status].map((s) => `<option>${s}</option>`).join('')}</select>
          <button class="btn small" type="button" data-testid="admin-order-update">Update</button>` : '<span class="muted">final</span>'}</td>
      </tr>`).join('');
  }
  document.getElementById('orders-body').addEventListener('click', async (e) => {
    if (e.target.dataset.testid !== 'admin-order-update') return;
    const row = e.target.closest('tr');
    const status = row.querySelector('select').value;
    const r = await api(`/admin/orders/${row.dataset.orderId}/status`, { method: 'PATCH', body: { status } });
    if (r.ok) toast(`Order ${row.dataset.orderNo} → ${status}`, 'success'); else toast(errMsg(r), 'error');
    loadOrders();
  });

  // ---- users ----
  async function loadUsers() {
    const r = await api('/admin/users');
    const items = r.ok ? r.data.items : [];
    document.getElementById('users-body').innerHTML = items.map((u) => `
      <tr data-testid="admin-user-row" data-username="${esc(u.username)}" data-user-id="${u.id}">
        <td>${u.id}</td><td>${esc(u.username)}</td><td>${esc(u.email)}</td><td>${u.role}</td>
        <td data-testid="admin-user-status">${u.status}</td><td>${u.failedAttempts}</td>
        <td>${u.id === user.id ? '<span class="muted">you</span>' : `<button class="btn small" type="button" data-testid="toggle-user" data-next="${u.status === 'active' ? 'locked' : 'active'}">${u.status === 'active' ? 'Lock' : 'Unlock'}</button>`}</td>
      </tr>`).join('');
  }
  document.getElementById('users-body').addEventListener('click', async (e) => {
    if (e.target.dataset.testid !== 'toggle-user') return;
    const row = e.target.closest('tr');
    const r = await api(`/admin/users/${row.dataset.userId}`, { method: 'PATCH', body: { status: e.target.dataset.next } });
    if (r.ok) toast(`User ${row.dataset.username} is now ${r.data.status}`, 'success'); else toast(errMsg(r), 'error');
    loadUsers();
  });

  selectTab(tabs[0]);
})();

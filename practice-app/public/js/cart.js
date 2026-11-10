(async () => {
  const { api, money, esc, toast, errMsg, refreshCartCount, requireLogin } = window.SL;
  await window.SL.renderHeader('cart');
  await requireLogin();

  const body = document.getElementById('cart-body');
  const couponInput = document.getElementById('coupon');
  const couponMsg = document.querySelector('[data-testid="coupon-message"]');
  const COUPON_MESSAGES = {
    COUPON_INVALID: 'Coupon code is invalid',
    COUPON_EXPIRED: 'Coupon has expired',
    COUPON_MIN_SUBTOTAL: 'Subtotal is too low for this coupon',
  };
  let state = { coupon: sessionStorage.getItem('sl_coupon') || '', shipping: sessionStorage.getItem('sl_shipping') || 'standard' };
  couponInput.value = state.coupon;
  document.querySelector(`input[name=shipping][value=${state.shipping}]`).checked = true;

  async function refreshQuote() {
    const r = await api('/cart/quote', { method: 'POST', body: { couponCode: state.coupon || undefined, shippingMethod: state.shipping } });
    if (!r.ok) return;
    const q = r.data;
    const set = (id, v) => { document.querySelector(`[data-testid="summary-${id}"]`).textContent = v; };
    set('subtotal', money(q.subtotal));
    set('discount', q.discount ? `-${money(q.discount)}` : money(0));
    set('shipping', q.shipping ? money(q.shipping) : 'FREE');
    set('vat', money(q.vat));
    set('total', money(q.total));
    if (state.coupon) {
      couponMsg.textContent = q.couponError ? COUPON_MESSAGES[q.couponError] : `Coupon ${q.couponCode} applied`;
      couponMsg.style.color = q.couponError ? 'var(--danger)' : 'var(--success)';
    } else couponMsg.textContent = '';
  }

  async function render() {
    const r = await api('/cart');
    const items = r.ok ? r.data.items : [];
    document.getElementById('cart-empty').classList.toggle('hidden', items.length > 0);
    document.getElementById('cart-content').classList.toggle('hidden', items.length === 0);
    body.innerHTML = items.map((i) => `
      <tr data-testid="cart-row" data-product-id="${i.productId}" data-sku="${i.sku}">
        <td><a href="/product?id=${i.productId}" data-testid="cart-item-name">${esc(i.name)}</a><div class="hint">${i.sku}</div></td>
        <td class="right-align" data-testid="cart-item-price">${money(i.price)}</td>
        <td><input type="number" min="1" max="10" value="${i.qty}" aria-label="Quantity for ${esc(i.name)}" data-testid="cart-item-qty" style="width:70px"></td>
        <td class="right-align" data-testid="cart-item-total">${money(i.lineTotal)}</td>
        <td><button class="btn small" type="button" data-testid="remove-item" aria-label="Remove ${esc(i.name)}">${window.SL.t('cart.remove')}</button></td>
      </tr>`).join('');
    refreshCartCount();
    if (items.length) await refreshQuote();
  }

  body.addEventListener('change', async (e) => {
    if (e.target.dataset.testid !== 'cart-item-qty') return;
    const row = e.target.closest('tr');
    const r = await api(`/cart/items/${row.dataset.productId}`, { method: 'PATCH', body: { qty: Number(e.target.value) } });
    if (!r.ok) toast(errMsg(r), 'error');
    render();
  });
  body.addEventListener('click', async (e) => {
    if (e.target.dataset.testid !== 'remove-item') return;
    const row = e.target.closest('tr');
    await api(`/cart/items/${row.dataset.productId}`, { method: 'DELETE' });
    toast('Item removed');
    render();
  });
  document.getElementById('clear-cart').addEventListener('click', async () => {
    if (!window.confirm('Remove all items from your cart?')) return;
    await api('/cart', { method: 'DELETE' });
    render();
  });
  document.getElementById('coupon-form').addEventListener('submit', (e) => {
    e.preventDefault();
    state.coupon = couponInput.value.trim().toUpperCase();
    sessionStorage.setItem('sl_coupon', state.coupon);
    refreshQuote();
  });
  document.querySelectorAll('input[name=shipping]').forEach((r) => r.addEventListener('change', () => {
    state.shipping = r.value;
    sessionStorage.setItem('sl_shipping', state.shipping);
    refreshQuote();
  }));

  render();
})();

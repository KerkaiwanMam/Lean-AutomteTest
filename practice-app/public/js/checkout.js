(async () => {
  const { api, money, esc, errMsg, showFieldErrors, refreshCartCount, requireLogin } = window.SL;
  await window.SL.renderHeader('cart');
  const user = await requireLogin();
  const form = document.getElementById('checkout-form');
  const errBox = document.getElementById('checkout-error');
  const coupon = sessionStorage.getItem('sl_coupon') || undefined;
  const shippingMethod = sessionStorage.getItem('sl_shipping') || 'standard';

  const cart = await api('/cart');
  if (!cart.ok || !cart.data.items.length) { location.href = '/cart'; return; }
  form.fullName.value = user.fullName || '';

  function go(step) {
    document.querySelectorAll('[data-step-panel]').forEach((p) => p.classList.toggle('hidden', p.dataset.stepPanel !== String(step)));
    document.querySelectorAll('.steps li').forEach((li) => {
      const n = Number(li.dataset.step);
      li.className = n === step ? 'current' : n < step ? 'done' : '';
      if (n === step) li.setAttribute('aria-current', 'step'); else li.removeAttribute('aria-current');
    });
    errBox.classList.add('hidden');
  }

  const address = () => ({
    fullName: form.fullName.value.trim(), phone: form.phone.value.trim(), line1: form.line1.value.trim(),
    district: form.district.value.trim(), province: form.province.value.trim(), postcode: form.postcode.value.trim(),
  });
  const payMethod = () => form.paymentMethod.value;
  const card = () => ({ number: form.cardNumber.value.replace(/\s/g, ''), expiry: form.cardExpiry.value.trim(), cvv: form.cardCvv.value.trim(), name: form.cardName.value.trim() });

  function validateAddress() {
    const a = address();
    const e = {};
    if (a.fullName.length < 2) e['address.fullName'] = 'Full name is required';
    if (!/^0\d{9}$/.test(a.phone)) e['address.phone'] = 'Phone must be 10 digits starting with 0';
    if (!a.line1) e['address.line1'] = 'Address is required';
    if (!a.district) e['address.district'] = 'District is required';
    if (!a.province) e['address.province'] = 'Province is required';
    if (!/^\d{5}$/.test(a.postcode)) e['address.postcode'] = 'Postcode must be 5 digits';
    return e;
  }
  function validatePayment() {
    if (payMethod() !== 'card') return {};
    const c = card();
    const e = {};
    if (!/^\d{16}$/.test(c.number)) e['card.number'] = 'Card number must be 16 digits';
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(c.expiry)) e['card.expiry'] = 'Expiry must be MM/YY';
    if (!/^\d{3}$/.test(c.cvv)) e['card.cvv'] = 'CVV must be 3 digits';
    if (!c.name) e['card.name'] = 'Name on card is required';
    return e;
  }

  // auto-format card number "4242424242424242" -> "4242 4242 4242 4242"
  form.cardNumber.addEventListener('input', () => {
    const digits = form.cardNumber.value.replace(/\D/g, '').slice(0, 16);
    form.cardNumber.value = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  });
  form.cardExpiry.addEventListener('input', () => {
    const d = form.cardExpiry.value.replace(/\D/g, '').slice(0, 4);
    form.cardExpiry.value = d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d;
  });
  form.querySelectorAll('input[name=paymentMethod]').forEach((r) => r.addEventListener('change', () => {
    document.getElementById('card-fields').classList.toggle('hidden', payMethod() !== 'card');
  }));

  async function renderReview() {
    const q = await api('/cart/quote', { method: 'POST', body: { couponCode: coupon, shippingMethod } });
    document.getElementById('review-body').innerHTML = cart.data.items.map((i) => `
      <tr data-testid="review-row"><td>${esc(i.name)}</td><td>${i.qty}</td><td class="right-align">${money(i.lineTotal)}</td></tr>`).join('');
    const d = q.data;
    document.getElementById('review-summary').innerHTML = `
      <dt>Subtotal</dt><dd data-testid="review-subtotal">${money(d.subtotal)}</dd>
      <dt>Discount ${d.couponCode ? `(${esc(d.couponCode)})` : ''}</dt><dd data-testid="review-discount">${d.discount ? `-${money(d.discount)}` : money(0)}</dd>
      <dt>Shipping (${esc(d.shippingMethod)})</dt><dd data-testid="review-shipping">${d.shipping ? money(d.shipping) : 'FREE'}</dd>
      <dt>VAT 7%</dt><dd data-testid="review-vat">${money(d.vat)}</dd>
      <dt class="total">Total</dt><dd class="total" data-testid="review-total">${money(d.total)}</dd>`;
    const a = address();
    document.getElementById('review-address').textContent = `Ship to: ${a.fullName}, ${a.line1}, ${a.district}, ${a.province} ${a.postcode} · Payment: ${payMethod() === 'card' ? `card ending ${card().number.slice(-4)}` : 'cash on delivery'}`;
  }

  form.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-next]');
    if (!b) return;
    const target = Number(b.dataset.next);
    const current = Number(document.querySelector('[data-step-panel]:not(.hidden)').dataset.stepPanel);
    if (target > current) {
      const errors = current === 1 ? validateAddress() : validatePayment();
      showFieldErrors(form, errors);
      if (Object.keys(errors).length) return;
    }
    if (target === 3) await renderReview();
    go(target);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('place-order');
    btn.disabled = true;
    btn.textContent = 'Placing order…';
    const body = { address: address(), shippingMethod, paymentMethod: payMethod(), couponCode: coupon };
    if (payMethod() === 'card') body.card = card();
    const r = await api('/orders', { method: 'POST', body });
    btn.disabled = false;
    btn.textContent = 'Place order';
    if (!r.ok) {
      errBox.textContent = errMsg(r);
      errBox.classList.remove('hidden');
      const details = r.data.error && r.data.error.details;
      if (details) {
        showFieldErrors(form, details);
        go(Object.keys(details).some((k) => k.startsWith('address')) ? 1 : 2);
        errBox.textContent = errMsg(r);
        errBox.classList.remove('hidden');
      }
      return;
    }
    sessionStorage.removeItem('sl_coupon');
    document.getElementById('order-number').textContent = r.data.orderNo;
    document.getElementById('order-status').textContent = r.data.status;
    document.getElementById('order-total').textContent = money(r.data.total);
    document.getElementById('view-order').href = `/order?id=${r.data.id}`;
    go(4);
    refreshCartCount();
  });

  go(1);
})();

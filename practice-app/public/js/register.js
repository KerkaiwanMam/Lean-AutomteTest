(async () => {
  const { api, showFieldErrors, errMsg, esc } = window.SL;
  await window.SL.renderHeader('register');
  const form = document.getElementById('register-form');
  const ok = document.getElementById('register-success');
  const errBox = document.getElementById('register-error');

  const meta = await api('/meta/register');
  if (meta.ok) {
    const sel = document.getElementById('province');
    meta.data.provinces.forEach((p) => sel.insertAdjacentHTML('beforeend', `<option value="${esc(p)}">${esc(p)}</option>`));
    document.getElementById('interests').innerHTML = meta.data.interests
      .map((i) => `<label><input type="checkbox" name="interests" value="${i}" data-testid="interest-${i}"> ${i}</label>`).join('');
  }

  function strength(pw) {
    let s = 0;
    if (pw.length >= 8) s += 1;
    if (pw.length >= 12) s += 1;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s += 1;
    if (/\d/.test(pw)) s += 1;
    if (/[^A-Za-z0-9]/.test(pw)) s += 1;
    return pw ? ['Very weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very strong'][s] : '-';
  }
  form.password.addEventListener('input', () => { document.getElementById('strength').textContent = strength(form.password.value); });

  form.avatar.addEventListener('change', () => {
    const f = form.avatar.files[0];
    const img = document.getElementById('avatar-preview');
    const errors = {};
    if (f && !['image/png', 'image/jpeg'].includes(f.type)) errors.avatar = 'Avatar must be PNG or JPEG';
    else if (f && f.size > 1024 * 1024) errors.avatar = 'Avatar must be 1 MB or smaller';
    form.querySelector('[data-testid="error-avatar"]').textContent = errors.avatar || '';
    if (f && !errors.avatar) { img.src = URL.createObjectURL(f); img.classList.remove('hidden'); } else img.classList.add('hidden');
  });

  // Client-side validation mirrors the server rules (REQ-REG-*). The server is still the source of truth.
  function validate() {
    const e = {};
    const v = (n) => (form[n].value || '').trim();
    if (!/^[A-Za-z0-9_]{4,20}$/.test(v('username'))) e.username = 'Username must be 4-20 characters: letters, digits or _';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v('email'))) e.email = 'Email is invalid';
    const pw = form.password.value;
    if (pw.length < 8 || pw.length > 64) e.password = 'Password must be 8-64 characters';
    else if (!/[A-Z]/.test(pw) || !/[a-z]/.test(pw) || !/\d/.test(pw) || !/[^A-Za-z0-9]/.test(pw)) e.password = 'Password needs upper, lower, digit and special character';
    if (form.confirmPassword.value !== pw) e.confirmPassword = 'Passwords do not match';
    if (v('fullName').length < 2) e.fullName = 'Full name must be 2-100 characters';
    if (!/^0\d{9}$/.test(v('phone'))) e.phone = 'Phone must be 10 digits starting with 0';
    if (!v('birthDate')) e.birthDate = 'Birth date is required (YYYY-MM-DD)';
    if (!v('province')) e.province = 'Please select a province';
    if (!form.acceptTerms.checked) e.acceptTerms = 'You must accept the terms';
    return e;
  }

  form.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    ok.classList.add('hidden');
    errBox.classList.add('hidden');
    const errors = validate();
    showFieldErrors(form, errors);
    if (Object.keys(errors).length) {
      form.querySelector('.field.invalid input, .field.invalid select')?.focus();
      return;
    }
    const fd = new FormData(form);
    fd.set('acceptTerms', form.acceptTerms.checked ? 'true' : 'false');
    if (!form.avatar.files.length) fd.delete('avatar');
    const btn = document.getElementById('register-button');
    btn.disabled = true;
    const r = await api('/users/register', { method: 'POST', form: fd });
    btn.disabled = false;
    if (r.ok) {
      form.reset();
      document.getElementById('avatar-preview').classList.add('hidden');
      ok.innerHTML = `Account <strong data-testid="registered-username">${esc(r.data.user.username)}</strong> created. <a href="/login" data-testid="go-to-login">Login now</a>`;
      ok.classList.remove('hidden');
    } else {
      showFieldErrors(form, (r.data.error && r.data.error.details) || {});
      errBox.textContent = errMsg(r);
      errBox.classList.remove('hidden');
    }
  });
})();

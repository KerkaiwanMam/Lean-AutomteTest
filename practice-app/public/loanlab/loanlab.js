/* LoanLab shared front-end helpers. Builds on window.SL (/js/common.js): API client, escaping, money. */
window.LL = (() => {
  const { api, esc, me, config } = window.SL;

  const status = (value, testid) => `<span class="status ${esc(value)}" data-testid="${testid}">${esc(value)}</span>`;

  /** LL-RPT-04: how the settlement of a transaction is shown */
  function settlementText(t) {
    if (t.type !== 'PAYMENT') return '—';
    if (t.settlementDate) return `Settled on ${t.settlementDate}`;
    return t.status === 'REVERSED' ? 'Not settled (reversed)' : 'Pending settlement';
  }

  async function renderHeader(active) {
    const host = document.getElementById('app-header');
    const [user, cfg] = await Promise.all([me(), config()]);
    const link = (href, label, id) => `<a href="${href}" data-testid="nav-${id}" ${active === id ? 'class="active" aria-current="page"' : ''}>${label}</a>`;
    host.innerHTML = `
      ${cfg.bugMode ? '<div class="bug-banner" data-testid="bug-banner">BUG MODE is ON — intentional defects are active</div>' : ''}
      <header class="site-header loanlab">
        <div class="inner">
          <a class="brand" href="/loanlab/" data-testid="brand">🏦 LoanLab</a>
          <nav aria-label="Main">
            ${link('/loanlab/', 'Accounts', 'accounts')}
            ${link('/api-docs', 'API Docs', 'api')}
            ${link('/', 'ShopLab', 'shoplab')}
          </nav>
          <div class="right">
            ${user ? `
              <span class="ll-chip" data-testid="nav-role">${user.role === 'admin' ? 'Officer' : 'Customer'}</span>
              <span class="linkish" data-testid="nav-username" title="${esc(user.email)}">👤 ${esc(user.username)}</span>
              <button class="linkish" data-testid="nav-logout" type="button">Logout</button>` : `
              <a href="/login?next=${encodeURIComponent(location.pathname + location.search)}" class="linkish" data-testid="nav-login">Login</a>`}
          </div>
        </div>
      </header>`;
    const logout = host.querySelector('[data-testid="nav-logout"]');
    if (logout) logout.addEventListener('click', async () => { await api('/auth/logout', { method: 'POST' }); location.href = '/login?next=/loanlab/'; });
    if (!document.querySelector('footer.site-footer')) {
      document.body.insertAdjacentHTML('beforeend', '<footer class="site-footer">LoanLab — fictional lending practice module for test automation training. Not a real bank; no rule here describes one.</footer>');
    }
    return user;
  }

  /** Renders the header and returns the logged-in user, or redirects to the login page. */
  async function start(active) {
    const user = await renderHeader(active);
    if (!user) {
      location.href = `/login?next=${encodeURIComponent(location.pathname + location.search)}`;
      return new Promise(() => {}); // stop the caller
    }
    return user;
  }

  function showAlert(el, message) {
    el.textContent = message;
    el.classList.toggle('hidden', !message);
  }

  /** "1234.5" → 1234.5, or null when the text is not an amount with at most 2 decimals */
  function parseAmount(text) {
    const value = String(text).trim().replace(/,/g, '');
    return /^\d+(\.\d{1,2})?$/.test(value) ? Number(value) : null;
  }

  return { renderHeader, start, status, settlementText, showAlert, parseAmount };
})();

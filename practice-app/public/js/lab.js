(async () => {
  await window.SL.renderHeader('lab');
  const $ = (id) => document.getElementById(id);
  const cfg = await window.SL.config();
  if (cfg.bugMode) $('visual').classList.add('bug-visual');

  // 1. dialogs
  $('btn-alert').onclick = () => { window.alert('Hello from ShopLab!'); $('dialog-result').textContent = 'alert closed'; };
  $('btn-confirm').onclick = () => { $('dialog-result').textContent = window.confirm('Do you confirm?') ? 'confirmed' : 'dismissed'; };
  $('btn-prompt').onclick = () => {
    const v = window.prompt('What is your name?', 'Tester');
    $('dialog-result').textContent = v === null ? 'prompt cancelled' : `Hello, ${v}`;
  };

  // 2. dynamic loading
  $('start-loading').onclick = async () => {
    $('start-loading').disabled = true;
    $('loaded-text').classList.add('hidden');
    $('loading-indicator').classList.remove('hidden');
    const r = await window.SL.api('/lab/delay?ms=2500');
    $('loading-indicator').classList.add('hidden');
    $('loaded-text').textContent = r.ok ? 'Hello World! Content loaded.' : 'Failed to load';
    $('loaded-text').classList.remove('hidden');
    $('start-loading').disabled = false;
  };
  setTimeout(() => { $('delayed-enable').disabled = false; $('delayed-enable').textContent = 'I am enabled now'; }, 3000);
  $('delayed-enable').onclick = () => { $('delayed-enable').textContent = 'Clicked!'; };
  setTimeout(() => $('appear-host').insertAdjacentHTML('beforeend', '<strong id="appeared">I have appeared!</strong>'), 2500);
  $('remove-me').onclick = () => $('remove-me').remove();
  $('start-progress').onclick = () => {
    let v = 0;
    const bar = $('progress');
    const timer = setInterval(() => {
      v = Math.min(100, v + 10);
      bar.firstElementChild.style.width = `${v}%`;
      bar.setAttribute('aria-valuenow', String(v));
      $('progress-text').textContent = v === 100 ? 'Complete!' : `${v}%`;
      if (v === 100) clearInterval(timer);
    }, 250);
  };

  // 3. dynamic ids
  const rnd = () => Math.random().toString(36).slice(2, 8);
  $('dynamic-id-host').innerHTML = `<button type="button" class="btn btn-${rnd()}" id="btn-${rnd()}">Save changes</button>
    <input type="text" id="input-${rnd()}" name="field_${rnd()}" placeholder="Type your nickname" aria-label="Nickname">`;
  $('dynamic-id-host').querySelector('button').onclick = () => { $('dynamic-clicks').textContent = String(Number($('dynamic-clicks').textContent) + 1); };

  // 4. iframe message
  window.addEventListener('message', (e) => {
    if (e.origin === location.origin && e.data && e.data.type === 'frame-submit') $('frame-message').textContent = e.data.text;
  });

  // 5. popup
  $('open-popup').onclick = () => window.open('/lab-window.html?popup=1', 'shoplabPopup', 'width=480,height=360');

  // 6. mouse
  $('right-click-target').addEventListener('contextmenu', (e) => {
    e.preventDefault();
    document.querySelector('.context-menu')?.remove();
    const m = document.createElement('div');
    m.className = 'context-menu';
    m.setAttribute('role', 'menu');
    m.style.left = `${e.clientX}px`;
    m.style.top = `${e.clientY}px`;
    m.innerHTML = '<button role="menuitem" type="button">Copy</button><button role="menuitem" type="button">Paste</button><button role="menuitem" type="button">Delete</button>';
    m.addEventListener('click', (ev) => { $('mouse-result').textContent = `context: ${ev.target.textContent}`; m.remove(); });
    document.body.appendChild(m);
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.context-menu')) document.querySelector('.context-menu')?.remove(); });
  $('double-click-target').addEventListener('dblclick', () => { $('mouse-result').textContent = 'double-clicked'; });
  document.querySelectorAll('.submenu a').forEach((a) => a.addEventListener('click', (e) => {
    e.preventDefault();
    a.blur(); // close the menu (it is shown on :hover / :focus-within)
    $('mouse-result').textContent = `menu: ${a.textContent}`;
  }));

  // 8. drag and drop (HTML5)
  let dragged = null;
  document.querySelectorAll('.draggable').forEach((d) => d.addEventListener('dragstart', (e) => { dragged = d; e.dataTransfer.setData('text/plain', d.id); }));
  document.querySelectorAll('#col-todo, #col-done').forEach((zone) => {
    zone.addEventListener('dragover', (e) => { e.preventDefault(); zone.classList.add('over'); });
    zone.addEventListener('dragleave', () => zone.classList.remove('over'));
    zone.addEventListener('drop', (e) => {
      e.preventDefault();
      zone.classList.remove('over');
      const el = dragged || document.getElementById(e.dataTransfer.getData('text/plain'));
      if (el) zone.appendChild(el);
      $('done-count').textContent = String($('col-done').querySelectorAll('.draggable').length);
    });
  });

  // 9. controls
  $('volume').addEventListener('input', () => { $('volume-out').textContent = $('volume').value; });
  const trigger = $('fruit-trigger');
  const list = document.querySelector('#fruit-select .options');
  trigger.onclick = () => list.classList.toggle('hidden');
  list.addEventListener('click', (e) => {
    const li = e.target.closest('li');
    if (!li) return;
    list.querySelectorAll('li').forEach((x) => x.setAttribute('aria-selected', String(x === li)));
    $('fruit-value').textContent = li.textContent;
    list.classList.add('hidden');
  });
  const COUNTRIES = ['Thailand', 'Taiwan', 'Tanzania', 'Japan', 'Jamaica', 'Singapore', 'Spain', 'Sweden', 'Vietnam', 'Laos', 'Malaysia', 'Myanmar'];
  const country = $('country');
  const clist = $('country-list');
  country.addEventListener('input', () => {
    const v = country.value.trim().toLowerCase();
    const matches = v ? COUNTRIES.filter((c) => c.toLowerCase().startsWith(v)) : [];
    clist.innerHTML = matches.map((c) => `<li role="option" style="padding:.25rem .5rem;cursor:pointer">${c}</li>`).join('');
    clist.classList.toggle('hidden', !matches.length);
    country.setAttribute('aria-expanded', String(matches.length > 0));
  });
  clist.addEventListener('click', (e) => {
    if (e.target.matches('li')) { country.value = e.target.textContent; clist.classList.add('hidden'); country.setAttribute('aria-expanded', 'false'); }
  });

  // 10. keyboard
  $('key-input').addEventListener('keydown', (e) => {
    const combo = [e.ctrlKey && 'Control', e.shiftKey && e.key !== 'Shift' && 'Shift', e.altKey && 'Alt', e.key].filter(Boolean).join('+');
    $('key-result').textContent = combo;
  });

  // 11. table
  const emp = await window.SL.api('/lab/employees');
  const all = emp.ok ? emp.data.items : [];
  const tState = { sortKey: 'id', dir: 1, page: 1, filter: '' };
  function renderTable() {
    const size = Number($('emp-page-size').value);
    const f = tState.filter.toLowerCase();
    const rows = all.filter((r) => !f || r.name.toLowerCase().includes(f) || r.department.toLowerCase().includes(f))
      .sort((a, b) => (a[tState.sortKey] > b[tState.sortKey] ? 1 : a[tState.sortKey] < b[tState.sortKey] ? -1 : 0) * tState.dir);
    const pages = Math.max(1, Math.ceil(rows.length / size));
    tState.page = Math.min(tState.page, pages);
    const slice = rows.slice((tState.page - 1) * size, tState.page * size);
    document.querySelector('#employees tbody').innerHTML = slice.map((r) => `<tr><td>${r.id}</td><td>${r.name}</td><td>${r.department}</td><td>${r.salary.toLocaleString('en-US')}</td><td>${r.startDate}</td></tr>`).join('');
    $('emp-info').textContent = `Page ${tState.page} of ${pages} (${rows.length} rows)`;
    $('emp-prev').disabled = tState.page <= 1;
    $('emp-next').disabled = tState.page >= pages;
    document.querySelectorAll('#employees th').forEach((th) => {
      th.setAttribute('aria-sort', th.dataset.key === tState.sortKey ? (tState.dir === 1 ? 'ascending' : 'descending') : 'none');
    });
  }
  document.querySelectorAll('#employees th.sortable').forEach((th) => th.addEventListener('click', () => {
    tState.dir = tState.sortKey === th.dataset.key ? -tState.dir : 1;
    tState.sortKey = th.dataset.key;
    renderTable();
  }));
  $('emp-filter').addEventListener('input', () => { tState.filter = $('emp-filter').value; tState.page = 1; renderTable(); });
  $('emp-page-size').addEventListener('change', () => { tState.page = 1; renderTable(); });
  $('emp-prev').onclick = () => { tState.page -= 1; renderTable(); };
  $('emp-next').onclick = () => { tState.page += 1; renderTable(); };
  renderTable();

  // 12. files
  async function upload(files) {
    const fd = new FormData();
    [...files].forEach((f) => fd.append('files', f));
    const r = await window.SL.api('/lab/upload', { method: 'POST', form: fd });
    $('upload-result').innerHTML = r.ok ? r.data.files.map((f) => `<li>${window.SL.esc(f.name)} (${f.size} bytes)</li>`).join('') : `<li class="field-error">${window.SL.errMsg(r)}</li>`;
  }
  $('upload-form').addEventListener('submit', (e) => { e.preventDefault(); upload($('files-input').files); });
  const drop = $('drop-upload');
  drop.addEventListener('dragover', (e) => { e.preventDefault(); drop.classList.add('over'); });
  drop.addEventListener('dragleave', () => drop.classList.remove('over'));
  drop.addEventListener('drop', (e) => { e.preventDefault(); drop.classList.remove('over'); upload(e.dataTransfer.files); });

  // 13. infinite scroll
  const feed = $('feed');
  let feedPage = 0;
  let feedLoading = false;
  let feedDone = false;
  async function loadFeed() {
    if (feedLoading || feedDone) return;
    feedLoading = true;
    feedPage += 1;
    const r = await window.SL.api(`/lab/feed?page=${feedPage}`);
    feedLoading = false;
    if (!r.ok || !r.data.items.length) { feedDone = true; feed.insertAdjacentHTML('beforeend', '<p class="muted" id="feed-end">End of feed</p>'); return; }
    feed.insertAdjacentHTML('beforeend', r.data.items.map((i) => `<div class="feed-item" style="padding:.5rem;border-bottom:1px solid var(--border)">${i.text}</div>`).join(''));
    $('feed-count').textContent = String(feed.querySelectorAll('.feed-item').length);
    if (feedPage >= r.data.totalPages) { feedDone = true; feed.insertAdjacentHTML('beforeend', '<p class="muted" id="feed-end">End of feed</p>'); }
  }
  feed.addEventListener('scroll', () => { if (feed.scrollTop + feed.clientHeight >= feed.scrollHeight - 20) loadFeed(); });
  loadFeed();

  // 14. flaky
  $('call-flaky').onclick = async () => {
    const r = await window.SL.api('/lab/flaky');
    $('flaky-result').textContent = r.ok ? r.data.message : `Error: ${window.SL.errMsg(r)}`;
  };
  $('show-toast').onclick = () => window.SL.toast('Saved successfully', 'success', 2000);
  let moved = false;
  $('moving-button').addEventListener('mouseenter', () => {
    if (moved) return;
    moved = true;
    $('moving-button').style.transform = 'translateX(80px)';
  });
  $('moving-button').onclick = () => { $('moving-result').textContent = 'caught!'; };
})();

// 7. shadow DOM custom element
class ShadowGreeter extends HTMLElement {
  connectedCallback() {
    const mode = this.dataset.mode === 'closed' ? 'closed' : 'open';
    const root = this.attachShadow({ mode });
    root.innerHTML = `
      <style>div{border:1px dashed #8aa0e6;border-radius:8px;padding:.6rem;margin:.4rem 0} input{padding:.35rem} button{padding:.35rem .7rem}</style>
      <div>
        <strong>${mode} shadow root</strong><br>
        <label>Your name <input type="text" placeholder="Name inside ${mode} shadow"></label>
        <button type="button">Greet</button>
        <p class="greeting" role="status"></p>
      </div>`;
    root.querySelector('button').addEventListener('click', () => {
      root.querySelector('.greeting').textContent = `Hello, ${root.querySelector('input').value || 'stranger'}!`;
    });
  }
}
customElements.define('shadow-greeter', ShadowGreeter);

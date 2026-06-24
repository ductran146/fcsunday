const FC = (() => {
  const FEE = 200000;
  const FINE = 50000;
  const BASE_YEAR = 2026;
  const KEY = 'fc2026';
  const AUTH_KEY = 'fc-sunday-auth';
  const YEAR_KEY = 'fc-sunday-year';
  const API_KEY = 'AIzaSyBi2JPD56s_vrUkEj-BovpnFWlz9MBNwj8';
  const DB_URL = 'https://fc-sunday-8f932-default-rtdb.asia-southeast1.firebasedatabase.app';
  const months = ['T1','T2','T3','T4','T5','T6','T7','T8','T9','T10','T11','T12'];
  const cats = ['Sân bóng','Thiết bị','Tiệc / Liên hoan','Y tế','Phần thưởng','Khác'];
  const money = n => `${Number(n || 0).toLocaleString('vi-VN')}đ`;
  const uid = () => Date.now();
  let S;
  let currentPage = 'index';
  let currentTitle = 'Tổng quan';
  let dataSrc = 'local';
  let isRefreshing = false;

  const icon = name => ({
    home:'<svg viewBox="0 0 24 24" fill="none"><path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-8.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    wallet:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 8.5h14.5A2.5 2.5 0 0 1 21 11v6.5A2.5 2.5 0 0 1 18.5 20h-12A3.5 3.5 0 0 1 3 16.5v-9A3.5 3.5 0 0 1 6.5 4H18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M17 13.5h4M17.3 13.5h.1" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
    cup:'<svg viewBox="0 0 24 24" fill="none"><path d="M8 5h8v4a4 4 0 1 1-8 0V5Z" stroke="currentColor" stroke-width="1.8"/><path d="M8 7H5.8a2 2 0 0 0 0 4H8M16 7h2.2a2 2 0 0 1 0 4H16M12 13v4M8.5 20h7" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    receipt:'<svg viewBox="0 0 24 24" fill="none"><path d="M6 3h12v18l-2-1.2-2 1.2-2-1.2-2 1.2-2-1.2L6 21V3Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 8h6M9 12h6M9 16h3" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    users:'<svg viewBox="0 0 24 24" fill="none"><path d="M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2.5 20c.7-3.4 3-5 6.5-5s5.8 1.6 6.5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><path d="M16 11a3 3 0 1 0 0-6M17 15c2.5.2 4 1.8 4.5 5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    plus:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    refresh:'<svg viewBox="0 0 24 24" fill="none"><path d="M20 12a8 8 0 1 1-2.34-5.66M20 4v6h-6" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    share:'<svg viewBox="0 0 24 24" fill="none"><path d="M18 8a3 3 0 1 0-2.83-4M6 15a3 3 0 1 0 2.83 4M6 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8.7 7.4l6.6 3.2M15.3 13.4l-6.6 3.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    edit:'<svg viewBox="0 0 24 24" fill="none"><path d="M4 20h16M5 16.5 16.8 4.7a2 2 0 0 1 2.8 2.8L7.8 19.3H5v-2.8Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    trash:'<svg viewBox="0 0 24 24" fill="none"><path d="M5 7h14M10 11v6M14 11v6M7 7l1 13h8l1-13M9 7V5h6v2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    search:'<svg viewBox="0 0 24 24" fill="none"><path d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    bell:'<svg viewBox="0 0 24 24" fill="none"><path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9ZM10 21h4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    coin:'<svg viewBox="0 0 24 24" fill="none"><path d="M12 21c4.97 0 9-2.24 9-5s-4.03-5-9-5-9 2.24-9 5 4.03 5 9 5Z" stroke="currentColor" stroke-width="1.8"/><path d="M5 13V8c0-2.76 3.13-5 7-5s7 2.24 7 5v5" stroke="currentColor" stroke-width="1.8"/><path d="M5 8c0 2.76 3.13 5 7 5s7-2.24 7-5" stroke="currentColor" stroke-width="1.8"/></svg>',
    beer:'<svg viewBox="0 0 24 24" fill="none"><path d="M6 8h9v11a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V8Z" stroke="currentColor" stroke-width="1.8"/><path d="M15 10h2a3 3 0 0 1 0 6h-2M7 8V6a3 3 0 0 1 6 0v2M9 12v5M12 12v5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    bomb:'<svg viewBox="0 0 24 24" fill="none"><path d="M11 21a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z" stroke="currentColor" stroke-width="1.8"/><path d="M16.5 5.5 19 3M18 7l3-3M15 3.5l2.5 2.5M8.5 8.5h.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    calendar:'<svg viewBox="0 0 24 24" fill="none"><path d="M7 3v3M17 3v3M4 9h16M6 5h12a2 2 0 0 1 2 2v11a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V7a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>'
  }[name] || '');

  const initData = () => ({
    _meta: { version: '2.0', lastUpdated: new Date().toISOString().slice(0,10), updatedBy: 'fc-sunday-v2' },
    members: [
      { id: 1, name: 'Nguyễn Văn A', phone: '', status: 'active', note: '' },
      { id: 2, name: 'Lê Văn C', phone: '', status: 'active', note: '' },
      { id: 3, name: 'Trần B.', phone: '', status: 'inactive', note: 'Tạm nghỉ' }
    ],
    nextMid: 4,
    thuThang: {
      '1': [1,1,1,1,1,1,0,0,0,0,0,0],
      '2': [1,1,1,1,1,1,0,0,0,0,0,0],
      '3': [2,2,2,2,2,2,2,2,2,2,2,2]
    },
    matches: [{ id: 1, date: '2026-06-16', monthIdx: 5, note: 'Trận #14', losers: [{ memberId: 1, paid: true }, { memberId: 2, paid: false }], thuThem: 500000, ghiChuThem: 'Ủng hộ' }],
    nextMaid: 2,
    chiTieu: [
      { id: 1, date: '2026-06-21', amount: 600000, cat: 'Sân bóng', fund: 'thang', note: 'Thuê sân tuần 24' },
      { id: 2, date: '2026-06-11', amount: 1650000, cat: 'Khác', fund: 'bia', note: 'Tiền thua trận #14' }
    ],
    nextCid: 3
  });

  const auth = () => { try { return JSON.parse(localStorage.getItem(AUTH_KEY) || 'null'); } catch { return null; } };
  const isAdmin = () => { const a = auth(); return !!(a && a.idToken && Number(a.expiresAt || 0) > Date.now() + 60000); };
  const dataUrl = () => `${DB_URL}/.json`;
  const writeUrl = () => `${DB_URL}/.json?auth=${encodeURIComponent(auth()?.idToken || '')}`;
  const localLoad = () => { try { S = JSON.parse(localStorage.getItem(KEY)) || initData(); } catch { S = initData(); } normalize(); ensureYearData(currentYear()); return S; };
  const localSave = () => localStorage.setItem(KEY, JSON.stringify(S));

  function normalize() {
    if (!S || typeof S !== 'object') S = initData();
    S.members ||= [];
    S.thuThang ||= S.monthly || {};
    S.matches ||= [];
    S.chiTieu ||= S.expenses || [];
    S.nextMid ||= nextId(S.members);
    S.nextMaid ||= nextId(S.matches);
    S.nextCid ||= nextId(S.chiTieu);
    S._meta ||= {};
  }
  const nextId = arr => Math.max(0, ...arr.map(x => Number(x.id) || 0)) + 1;
  const currentYear = () => {
    const y = Number(localStorage.getItem(YEAR_KEY) || BASE_YEAR);
    return Number.isFinite(y) && y >= BASE_YEAR ? y : BASE_YEAR;
  };
  const setCurrentYear = year => {
    const y = Number(year);
    localStorage.setItem(YEAR_KEY, Number.isFinite(y) && y >= BASE_YEAR ? String(y) : String(BASE_YEAR));
    ensureYearData(currentYear());
  };
  const yearFromDate = (date, fallback = BASE_YEAR) => {
    const y = Number(String(date || '').slice(0, 4));
    return Number.isFinite(y) && y >= 1900 ? y : fallback;
  };
  const monthIndexOf = item => {
    const byMonthIdx = Number(item?.monthIdx);
    if (Number.isInteger(byMonthIdx) && byMonthIdx >= 0 && byMonthIdx <= 11) return byMonthIdx;
    const byDate = Number(String(item?.date || '').slice(5, 7)) - 1;
    return Number.isInteger(byDate) && byDate >= 0 && byDate <= 11 ? byDate : -1;
  };
  const monthlyKeyForYear = (id, year = currentYear()) => Number(year) === BASE_YEAR ? String(id) : `${id}_${Number(year)}`;
  const monthlyKey = id => monthlyKeyForYear(id, currentYear());
  const rawMonthlyArrForYear = (id, year = currentYear()) => {
    const k = monthlyKeyForYear(id, year);
    return Array.isArray(S.thuThang[k]) ? S.thuThang[k] : null;
  };
  const emptyMonthlyArr = () => Array(12).fill(0);
  const monthlyArrForYear = (id, year = currentYear()) => rawMonthlyArrForYear(id, year) || emptyMonthlyArr();
  const monthlyArrForWrite = (id, year = currentYear()) => {
    const k = monthlyKeyForYear(id, year);
    if (!Array.isArray(S.thuThang[k])) S.thuThang[k] = emptyMonthlyArr();
    return S.thuThang[k];
  };
  const monthlyArr = id => monthlyArrForYear(id, currentYear());
  const ensureYearData = (year = currentYear()) => {
    normalize();
    // Không tự tạo dòng thu tháng rỗng cho toàn bộ thành viên.
    // Dữ liệu legacy chỉ tính nghĩa vụ cho những thành viên đã phát sinh thu/miễn trong năm.
  };
  const activeMembers = () => S.members.filter(m => m.status !== 'left');
  const paidMonthsForYear = (year = currentYear()) => months.map((_, i) => activeMembers().filter(m => (rawMonthlyArrForYear(m.id, year) || [])[i] === 1).length);
  const paidMonths = () => paidMonthsForYear(currentYear());
  const totalMonthlyForYear = (year = currentYear()) => paidMonthsForYear(year).reduce((a, b) => a + b * FEE, 0);
  const totalMonthly = () => totalMonthlyForYear(currentYear());
  const matchYear = g => Number(g?.year) || yearFromDate(g?.date, BASE_YEAR);
  const expenseYear = e => Number(e?.year) || yearFromDate(e?.date, BASE_YEAR);
  const matchYearOk = (g, year = currentYear()) => matchYear(g) === Number(year);
  const expenseYearOk = (e, year = currentYear()) => expenseYear(e) === Number(year);
  const matchesOfYear = (year = currentYear()) => S.matches.filter(g => matchYearOk(g, year));
  const expensesOfYear = (year = currentYear()) => S.chiTieu.filter(e => expenseYearOk(e, year));
  const totalFineForYear = (year = currentYear()) => matchesOfYear(year).reduce((sum, g) => sum + (g.losers || []).filter(l => l.paid).length * FINE + Number(g.thuThem || 0), 0);
  const totalFine = () => totalFineForYear(currentYear());
  const totalExpensesForYear = (fund, year = currentYear()) => expensesOfYear(year).filter(e => !fund || e.fund === fund).reduce((a, e) => a + Number(e.amount || 0), 0);
  const totalExpenses = fund => totalExpensesForYear(fund, currentYear());
  const debtFineForYear = (mid, year = currentYear()) => matchesOfYear(year).reduce((a, g) => a + (g.losers || []).filter(l => String(l.memberId) === String(mid) && !l.paid).length * FINE, 0);
  const debtFine = mid => debtFineForYear(mid, currentYear());
  const initials = n => (n || '?').split(' ').filter(Boolean).slice(-2).map(w => w[0]).join('').toUpperCase();
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  const dateInCurrentYear = () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    return `${currentYear()}-${mm}-${dd}`;
  };

  async function fetchRemote(silent = false) {
    if (isRefreshing) return;
    isRefreshing = true;
    try {
      const r = await fetch(`${dataUrl()}?t=${Date.now()}`, { cache: 'no-store' });
      if (!r.ok) throw new Error('Không đọc được Firebase');
      const data = await r.json();
      if (data) {
        S = data;
        normalize();
        ensureYearData(currentYear());
        dataSrc = 'firebase';
        localSave();
        renderCurrent();
        updateSyncBadge();
        if (!silent) toast('Đã tải dữ liệu mới từ Firebase');
      }
    } catch (err) {
      dataSrc = 'cache';
      updateSyncBadge();
      if (!silent) toast('Đang dùng dữ liệu cache trên thiết bị');
    } finally {
      isRefreshing = false;
    }
  }

  async function save() {
    normalize();
    S._meta.lastUpdated = new Date().toISOString().slice(0,10);
    S._meta.updatedBy = auth()?.email || 'admin';
    localSave();
    if (!isAdmin()) { toast('Bạn cần đăng nhập admin để lưu lên Firebase'); return false; }
    try {
      const r = await fetch(writeUrl(), { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(S) });
      if (!r.ok) throw new Error(await r.text());
      dataSrc = 'firebase';
      updateSyncBadge();
      toast('Đã đồng bộ Firebase');
      return true;
    } catch (err) {
      dataSrc = 'cache';
      updateSyncBadge();
      toast('Chưa đồng bộ được Firebase');
      return false;
    }
  }

  async function login(email, password) {
    const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`;
    const r = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password, returnSecureToken: true }) });
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || 'Đăng nhập thất bại');
    localStorage.setItem(AUTH_KEY, JSON.stringify({ email: data.email, idToken: data.idToken, refreshToken: data.refreshToken, expiresAt: Date.now() + Number(data.expiresIn || 3600) * 1000 }));
    updateAuthUI();
    renderCurrent();
  }
  function logout() { localStorage.removeItem(AUTH_KEY); updateAuthUI(); renderCurrent(); toast('Đã đăng xuất admin'); }

  function boot(page, title) {
    currentPage = page;
    currentTitle = title;
    localLoad();
    document.body.classList.toggle('is-pwa', isPWA());
    renderChrome(page, title);
    setupPWA();
    setupPull();
    updateAuthUI();
    fetchRemote(true);
    window.addEventListener('resize', () => document.body.classList.toggle('is-pwa', isPWA()));
  }

  function renderChrome(page, title) {
    const shell = document.querySelector('.app-shell');
    if (!shell) return;
    shell.insertAdjacentHTML('afterbegin', `<aside class="sidebar">${sidebar(page)}</aside>`);
    document.querySelector('.main').insertAdjacentHTML('afterbegin', topbar(title));
    document.body.insertAdjacentHTML('beforeend', bottomNav(page) + loginModal() + `<div class="toast" id="toast"></div><div class="pull-indicator" id="pullIndicator">Kéo để làm mới</div>`);
    hydrateIcons();
    document.querySelectorAll('[data-action="refresh"]').forEach(b => b.onclick = () => fetchRemote(false));
    document.querySelectorAll('[data-action="login"]').forEach(b => b.onclick = () => isAdmin() ? logout() : openLogin());
    document.querySelectorAll('[data-action="export"]').forEach(b => b.onclick = exportJSON);
    document.querySelector('#loginForm')?.addEventListener('submit', async e => {
      e.preventDefault();
      const email = e.currentTarget.email.value.trim();
      const password = e.currentTarget.password.value;
      try { await login(email, password); closeLogin(); toast('Đã đăng nhập admin'); }
      catch (err) { document.getElementById('loginError').textContent = viAuthError(err.message); }
    });
    document.querySelectorAll('[data-action="close-login"]').forEach(b => b.onclick = closeLogin);
  }

  function topbar(title) {
    return `<header class="topbar"><div class="topbar-inner"><a class="brand-mini" href="index.html"><img src="assets/logo-1024.png" alt="FC Sunday"><div><div class="brand-title">${esc(title || 'FC Sunday')}</div><div class="page-sub">Carbon Đỏ · <span id="syncBadge">${syncText()}</span></div></div></a><div class="top-actions"><a class="icon-btn" href="share.html" title="Xem tổng quỹ"><span data-icon="share"></span></a><button class="icon-btn" data-action="refresh" title="Làm mới"><span data-icon="refresh"></span></button><button class="btn small" data-action="login" id="adminBtn">Admin</button></div></div></header>`;
  }
  const navs = [['index','index.html','home','Tổng quan'],['thu-thang','thu-thang.html','wallet','Thu tháng'],['thu-phat','thu-phat.html','cup','Quỹ bia'],['chi-tieu','chi-tieu.html','receipt','Chi tiêu'],['thanh-vien','thanh-vien.html','users','Thành viên']];
  function sidebar(p) { return `<div class="sidebar-brand"><img src="assets/logo-1024.png"><div><b>FC Sunday</b><span>Quỹ đội bóng ${currentYear()}</span></div></div><nav class="side-nav">${navs.map(n => `<a class="nav-item ${p === n[0] ? 'active' : ''}" href="${n[1]}"><span data-icon="${n[2]}"></span><span>${n[3]}</span>${badge(n[0])}</a>`).join('')}</nav><div class="sidebar-footer"><a class="btn outline" href="share.html">Xem tổng quỹ nhanh</a><div class="install-box" id="installBox"><b>Cài app lên màn hình</b><p>Android: bấm nút cài nếu trình duyệt hỗ trợ. iPhone: Share → Add to Home Screen.</p><button class="btn gold small" id="installBtn">Thêm vào Android</button></div><button class="btn ghost small" data-action="export">Xuất JSON</button></div>`; }
  function bottomNav(p) { return `<nav class="bottom-nav">${navs.map(n => `<a class="nav-item ${p === n[0] ? 'active' : ''}" href="${n[1]}"><span data-icon="${n[2]}"></span><span>${n[3]}</span>${badge(n[0])}</a>`).join('')}</nav>`; }
  function badge(p) { const v = p === 'thu-thang' ? paidMonths().filter(x => x > 0).length : p === 'thu-phat' ? matchesOfYear().length : p === 'chi-tieu' ? expensesOfYear().length : p === 'thanh-vien' ? activeMembers().length : ''; return v ? `<span class="nav-badge">${v}</span>` : ''; }
  function loginModal() { return `<div class="modal-backdrop" id="loginModal"><div class="modal"><div class="modal-head"><h3 class="h3">Đăng nhập quản trị</h3><button class="icon-btn" type="button" data-action="close-login">×</button></div><form id="loginForm"><div class="form-row"><div class="field"><label>Email</label><div class="input-wrap"><input name="email" type="email" required placeholder="email admin Firebase"></div></div><div class="field"><label>Mật khẩu</label><div class="input-wrap"><input name="password" type="password" required placeholder="••••••••"></div></div></div><p class="caption">Ai cũng xem được dữ liệu. Chỉ tài khoản Firebase Authentication mới sửa và đồng bộ được.</p><p class="caption" id="loginError" style="color:var(--danger)"></p><div class="modal-actions"><button class="btn ghost" type="button" data-action="close-login">Huỷ</button><button class="btn primary">Đăng nhập</button></div></form></div></div>`; }
  function openLogin() { document.getElementById('loginModal')?.classList.add('open'); document.getElementById('loginError').textContent = ''; }
  function closeLogin() { document.getElementById('loginModal')?.classList.remove('open'); }
  function toast(msg) { const t = document.getElementById('toast'); if (!t) return; t.textContent = msg; t.classList.add('show'); clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200); }
  function isPWA() { return matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }
  function exportJSON() { const blob = new Blob([JSON.stringify(S, null, 2)], { type: 'application/json' }); const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: 'fc-sunday-data.json' }); a.click(); URL.revokeObjectURL(a.href); }
  function setupPWA() { if ('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js').catch(() => {}); let deferred; window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferred = e; const b = document.getElementById('installBtn'); if (b) b.onclick = async () => { deferred.prompt(); deferred = null; }; }); if (isPWA()) document.getElementById('installBox')?.classList.add('hidden'); }
  function setupPull() { let y = 0, pulling = false; window.addEventListener('touchstart', e => { if (scrollY === 0) y = e.touches[0].clientY; }, { passive: true }); window.addEventListener('touchmove', e => { if (scrollY === 0 && e.touches[0].clientY - y > 80) { pulling = true; document.getElementById('pullIndicator')?.classList.add('show'); } }, { passive: true }); window.addEventListener('touchend', () => { if (pulling) { pulling = false; document.getElementById('pullIndicator')?.classList.remove('show'); fetchRemote(false); } }); }
  function hydrateIcons() { document.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon)); }
  function updateAuthUI() { const b = document.getElementById('adminBtn'); if (b) b.textContent = isAdmin() ? 'Đăng xuất' : 'Admin'; document.body.classList.toggle('is-admin', isAdmin()); }
  function syncText() { return dataSrc === 'firebase' ? 'Đã đồng bộ' : dataSrc === 'cache' ? 'Cache' : 'Local'; }
  function updateSyncBadge() { const el = document.getElementById('syncBadge'); if (el) el.textContent = syncText(); }
  function adminGuard() { if (!isAdmin()) { openLogin(); toast('Vui lòng đăng nhập admin để sửa dữ liệu'); return false; } return true; }
  function viAuthError(m) { if (m.includes('INVALID_LOGIN_CREDENTIALS') || m.includes('INVALID_PASSWORD')) return 'Email hoặc mật khẩu không đúng.'; if (m.includes('EMAIL_NOT_FOUND')) return 'Email admin chưa tồn tại trong Firebase Authentication.'; return 'Không đăng nhập được. Vui lòng kiểm tra email/mật khẩu.'; }

  function renderCurrent() {
    if (currentPage === 'index') renderDashboard();
    if (currentPage === 'thu-thang') renderMonthly();
    if (currentPage === 'thu-phat') renderFines();
    if (currentPage === 'chi-tieu') renderExpenses();
    if (currentPage === 'thanh-vien') renderMembers();
    if (currentPage === 'share') renderShare();
    updateAuthUI();
    hydrateIcons();
  }

  const monthFee = (i, year = currentYear()) => paidMonthsForYear(year)[i] * FEE;
  const monthFine = (i, year = currentYear()) => matchesOfYear(year).filter(g => monthIndexOf(g) === i)
    .reduce((sum, g) => sum + (g.losers || []).filter(l => l.paid).length * FINE + Number(g.thuThem || 0), 0);
  const monthFinePaidOnly = (i, year = currentYear()) => matchesOfYear(year).filter(g => monthIndexOf(g) === i)
    .reduce((sum, g) => sum + (g.losers || []).filter(l => l.paid).length * FINE, 0);
  const monthExtra = (i, year = currentYear()) => matchesOfYear(year).filter(g => monthIndexOf(g) === i)
    .reduce((sum, g) => sum + Number(g.thuThem || 0), 0);
  const monthExpense = (i, year = currentYear()) => expensesOfYear(year).filter(e => monthIndexOf(e) === i)
    .reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const monthMatchCount = (i, year = currentYear()) => matchesOfYear(year).filter(g => monthIndexOf(g) === i).length;
  const monthlyDueMonthIndexesForYear = (year = currentYear()) => months
    .map((_, i) => i)
    .filter(i => activeMembers().some(m => {
      const arr = rawMonthlyArrForYear(m.id, year);
      const v = arr ? arr[i] : 0;
      return v === 1 || v === 2;
    }));
  const monthlyParticipantMembersForYear = (year = currentYear()) => {
    const due = monthlyDueMonthIndexesForYear(year);
    return activeMembers().filter(m => {
      const arr = rawMonthlyArrForYear(m.id, year);
      if (!arr) return false;
      return due.some(i => arr[i] === 1 || arr[i] === 2);
    });
  };
  const monthlyDebtForMemberYear = (mid, year = currentYear()) => {
    const arr = rawMonthlyArrForYear(mid, year);
    if (!arr) return 0;
    const due = monthlyDueMonthIndexesForYear(year);
    const hasJoinedMonthlyFee = due.some(i => arr[i] === 1 || arr[i] === 2);
    if (!hasJoinedMonthlyFee) return 0;
    return due.filter(i => arr[i] === 0).length * FEE;
  };
  const monthlyDebtForYear = (year = currentYear()) => monthlyParticipantMembersForYear(year).reduce((sum, m) => sum + monthlyDebtForMemberYear(m.id, year), 0);
  const monthlyDebt = () => monthlyDebtForYear(currentYear());
  const totalExtraForYear = (year = currentYear()) => months.reduce((sum, _, i) => sum + monthExtra(i, year), 0);
  const totalExtra = () => totalExtraForYear(currentYear());

  function renderDashboard() {
    const root = document.getElementById('dashboard'); if (!root) return;
    const paid = totalMonthly();
    const fine = totalFine();
    const exp = totalExpenses();
    const expMonth = totalExpenses('thang');
    const expBeer = totalExpenses('bia');
    const beerDebt = activeMembers().reduce((a, m) => a + debtFine(m.id), 0);
    const teamBalance = paid + fine - exp;
    const monthFund = paid - expMonth;
    const beerFund = fine - expBeer;
    const topLosers = activeMembers().map(m => ({
      ...m,
      loses: matchesOfYear().reduce((a, g) => a + (g.losers || []).filter(l => String(l.memberId) === String(m.id)).length, 0)
    })).filter(m => m.loses > 0).sort((a, b) => b.loses - a.loses || a.name.localeCompare(b.name, 'vi')).slice(0, 5);
    let running = 0;
    const rows = months.map((m, i) => {
      const fee = monthFee(i), beer = monthFine(i), income = fee + beer, expense = monthExpense(i), games = monthMatchCount(i);
      running += income - expense;
      return { i, fee, beer, income, expense, running, games };
    });
    const maxIncome = Math.max(1, ...rows.map(r => r.income));
    root.innerHTML = `
      <section class="hero-fund hero-total card">
        <div class="hero-bg-logo"><img src="assets/logo-1024.png" alt=""></div>
        <div class="kpi-label">Tổng quỹ hiện tại</div>
        <div class="hero-money">${money(teamBalance)}</div>
        <div class="muted">Quỹ hàng tháng + Quỹ bia · Năm ${currentYear()}</div>
      </section>

      <section class="fund-detail-grid">
        <div class="card fund-box fund-card-month">
          <div class="fund-title"><span class="ds-icon gold">${icon('coin')}</span> Quỹ tháng</div>
          <div class="fund-amount ${monthFund < 0 ? 'amount-minus' : ''}">${money(monthFund)}</div>
          <div class="fund-lines"><span>Thu <b>${money(paid)}</b></span><span>Chi <b>${money(expMonth)}</b></span><span>Còn nợ <b class="gold-text">${money(monthlyDebt())}</b></span></div>
        </div>
        <div class="card fund-box fund-card-beer">
          <div class="fund-title"><span class="ds-icon orange">${icon('beer')}</span> Quỹ bia</div>
          <div class="fund-amount ${beerFund < 0 ? 'amount-minus' : ''}">${money(beerFund)}</div>
          <div class="fund-lines"><span>Thu <b>${money(fine)}</b></span><span>Chi <b>${money(expBeer)}</b></span><span>Còn nợ <b class="gold-text">${money(beerDebt)}</b></span></div>
        </div>
      </section>

      <section class="fund-extra-grid">
        <div class="card fund-mini-card"><span>Thu thêm</span><b>${money(totalExtra())}</b></div>
        <div class="card fund-mini-card"><span>Tổng chi tiêu</span><b>${money(exp)}</b></div>
      </section>

      <section class="kpi-grid">
        <div class="card kpi-card accent-green"><div class="kpi-label">Tổng thu</div><div class="kpi-value">${money(paid + fine)}</div><div class="caption">Phí tháng + Quỹ bia</div></div>
        <div class="card kpi-card accent-red"><div class="kpi-label">Số trận đã đá</div><div class="kpi-value">${matchesOfYear().length} trận</div><div class="caption">Cả năm ${currentYear()}</div></div>
        <div class="card kpi-card accent-blue"><div class="kpi-label">Thành viên hoạt động</div><div class="kpi-value">${activeMembers().length}</div><div class="caption">Đang thi đấu</div></div>
        <div class="card kpi-card accent-orange"><div class="kpi-label">Tháng có thu phí</div><div class="kpi-value">${paidMonths().filter(n => n > 0).length} / 12</div><div class="caption">/ 12 tháng</div></div>
      </section>

      <section class="card pad top-loser-card">
        <div class="card-head"><h2 class="h3 title-with-icon"><span class="ds-icon danger">${icon('bomb')}</span>Top quả tạ</h2><span class="muted">›</span></div>
        ${topLosers.length ? `<div class="podium">${topLosers.slice(0,3).map((m, idx) => `<div class="podium-item rank-${idx + 1}"><div class="medal">${idx + 1}</div><b>${esc(m.name)}</b><span>${m.loses} trận</span></div>`).join('')}</div><div class="rank-list">${topLosers.slice(3).map((m, idx) => `<div class="rank-row"><span>${idx + 4}</span><b>${esc(m.name)}</b><em>${m.loses} trận</em></div>`).join('')}</div>` : `<div class="empty">Chưa có dữ liệu trận thua.</div>`}
      </section>

      <section class="card pad chart-card">
        <h2 class="h3">Thu nhập theo tháng</h2>
        <div class="bar-chart">${rows.map(r => `<div class="bar-col"><div class="bar-stack" title="${months[r.i]}: ${money(r.income)}"><span class="bar-fee" style="height:${Math.max(0, r.fee / maxIncome * 100)}%"></span><span class="bar-beer" style="height:${Math.max(0, r.beer / maxIncome * 100)}%"></span></div><small>${months[r.i]}</small></div>`).join('')}</div>
      </section>

      <section class="table-card card">
        <div class="table-title"><h2 class="h2">Bảng tổng hợp 12 tháng</h2><span class="year-pill">${currentYear()}</span></div>
        <div class="table-wrap dashboard-table-wrap"><table class="dashboard-table"><thead><tr><th>Tháng</th><th class="right">Thu phí</th><th class="right">Quỹ bia</th><th class="right">Tổng thu</th><th class="right">Chi tiêu</th><th class="right">Tồn lũy kế</th><th class="right">Số trận</th></tr></thead><tbody>${rows.map(r => `<tr><td><strong>Tháng ${r.i + 1}</strong></td><td class="right">${r.fee ? money(r.fee).replace('đ','') : '—'}</td><td class="right">${r.beer ? money(r.beer).replace('đ','') : '—'}</td><td class="right"><b>${r.income ? money(r.income).replace('đ','') : '—'}</b></td><td class="right amount-minus">${r.expense ? money(r.expense).replace('đ','') : '—'}</td><td class="right amount-plus">${money(r.running).replace('đ','')}</td><td class="right">${r.games ? `<span class="chip neutral">${r.games}</span>` : '—'}</td></tr>`).join('')}</tbody><tfoot><tr><td><b>Tổng</b></td><td class="right"><b>${money(rows.reduce((a,r)=>a+r.fee,0)).replace('đ','')}</b></td><td class="right"><b>${money(rows.reduce((a,r)=>a+r.beer,0)).replace('đ','')}</b></td><td class="right"><b>${money(rows.reduce((a,r)=>a+r.income,0)).replace('đ','')}</b></td><td class="right"><b>${money(rows.reduce((a,r)=>a+r.expense,0)).replace('đ','')}</b></td><td class="right"><b>${money(teamBalance).replace('đ','')}</b></td><td class="right"><b>${matchesOfYear().length}</b></td></tr></tfoot></table></div>
      </section>`;
  }

  function renderMonthly() {
    const root = document.getElementById('monthly'); if (!root) return;
    root.innerHTML = `<section class="toolbar"><div><div class="overline">Thu hàng tháng</div><h1 class="h1">Đóng quỹ thành viên</h1></div>${isAdmin() ? `<button class="btn primary" id="markAll">${icon('plus')}Đóng tháng này</button>` : ''}</section><div class="table-wrap"><table><thead><tr><th class="sticky-col">Thành viên</th>${months.map(m => `<th>${m}</th>`).join('')}<th>Nợ</th></tr></thead><tbody>${activeMembers().map(m => `<tr><td class="sticky-col"><strong>${esc(m.name)}</strong><div class="caption">${esc(m.status)}</div></td>${months.map((mo, i) => cellMonthly(m, i)).join('')}<td>${money(monthlyDebtForMemberYear(m.id))}</td></tr>`).join('')}</tbody></table></div>`;
    root.querySelectorAll('[data-mid]').forEach(td => td.onclick = async () => { if (!adminGuard()) return; const arr = monthlyArrForWrite(td.dataset.mid); arr[+td.dataset.mi] = (arr[+td.dataset.mi] + 1) % 3; await save(); renderMonthly(); });
    const mark = root.querySelector('#markAll'); if (mark) mark.onclick = async () => { if (!adminGuard()) return; const mi = new Date().getMonth(); activeMembers().forEach(m => { const a = monthlyArrForWrite(m.id); if (a[mi] === 0) a[mi] = 1; }); await save(); renderMonthly(); };
  }
  function cellMonthly(m, i) { const v = monthlyArr(m.id)[i] || 0; return `<td data-mid="${m.id}" data-mi="${i}">${v === 1 ? '<span class="chip success">Đã đóng</span>' : v === 2 ? '<span class="chip neutral">Miễn</span>' : '<span class="chip danger">Chưa đóng</span>'}</td>`; }

  function renderFines() {
    const root = document.getElementById('fines'); if (!root) return;
    const games = matchesOfYear();
    root.innerHTML = `<section class="toolbar"><div><div class="overline">Quỹ bia</div><h1 class="h1">Phạt đội thua</h1></div>${isAdmin() ? `<button class="btn primary" id="addMatch">${icon('plus')}Thêm trận</button>` : ''}</section><div class="grid two">${games.map(g => `<div class="card pad"><div class="card-head"><div><h3 class="h3">${esc(g.note || 'Trận đấu')}</h3><div class="caption">${esc(g.date)}</div></div><span class="chip gold">${money((g.losers || []).length * FINE + Number(g.thuThem || 0))}</span></div><div class="list">${(g.losers || []).map(l => { const m = S.members.find(x => String(x.id) === String(l.memberId)) || {}; return `<div class="list-row"><div class="avatar">${initials(m.name)}</div><div class="grow"><b>${esc(m.name)}</b><div class="caption">${money(FINE)}</div></div><button class="chip ${l.paid ? 'success' : 'danger'}" data-game="${g.id}" data-loser="${l.memberId}">${l.paid ? 'Đã nộp' : 'Chưa nộp'}</button></div>`; }).join('')}${g.thuThem ? `<div class="list-row"><div class="avatar">+</div><div class="grow"><b>Thu thêm</b><div class="caption">${esc(g.ghiChuThem || '')}</div></div><div class="amount-plus">+${money(g.thuThem)}</div></div>` : ''}</div></div>`).join('')}</div>`;
    root.querySelectorAll('[data-game]').forEach(b => b.onclick = async () => { if (!adminGuard()) return; const g = S.matches.find(x => String(x.id) === String(b.dataset.game)); const l = g.losers.find(x => String(x.memberId) === String(b.dataset.loser)); l.paid = !l.paid; await save(); renderFines(); });
    const add = root.querySelector('#addMatch'); if (add) add.onclick = async () => { if (!adminGuard()) return; S.matches.push({ id: S.nextMaid++, date: dateInCurrentYear(), monthIdx: new Date().getMonth(), note: 'Trận mới', losers: activeMembers().slice(0,2).map(m => ({ memberId: m.id, paid: false })), thuThem: 0, ghiChuThem: '' }); await save(); renderFines(); };
  }

  function renderExpenses() {
    const root = document.getElementById('expenses'); if (!root) return;
    root.innerHTML = `<section class="toolbar"><div><div class="overline">Chi tiêu</div><h1 class="h1">Lịch sử chi</h1></div>${isAdmin() ? `<button class="btn primary" id="addExpense">${icon('plus')}Thêm chi</button>` : ''}</section><div class="table-wrap"><table><thead><tr><th>Ngày</th><th>Nội dung</th><th>Danh mục</th><th>Quỹ</th><th class="right">Số tiền</th></tr></thead><tbody>${expensesOfYear().map(e => `<tr><td>${esc(e.date)}</td><td><strong>${esc(e.note)}</strong></td><td>${esc(e.cat)}</td><td><span class="chip neutral">${esc(e.fund || 'chung')}</span></td><td class="right amount-minus">−${money(e.amount)}</td></tr>`).join('')}</tbody></table></div>`;
    const add = root.querySelector('#addExpense'); if (add) add.onclick = async () => { if (!adminGuard()) return; S.chiTieu.push({ id: S.nextCid++, date: dateInCurrentYear(), amount: 500000, cat: cats[5], fund: 'thang', note: 'Khoản chi mới' }); await save(); renderExpenses(); };
  }

  function renderMembers() {
    const root = document.getElementById('members'); if (!root) return;
    root.innerHTML = `<section class="toolbar"><div><div class="overline">Đội hình</div><h1 class="h1">Thành viên</h1></div>${isAdmin() ? `<button class="btn primary" id="addMember">${icon('plus')}Thêm thành viên</button>` : ''}</section><div class="grid two">${S.members.map(m => `<div class="card pad"><div class="list-row"><div class="avatar">${initials(m.name)}</div><div class="grow"><b>${esc(m.name)}</b><div class="caption">${esc(m.phone || 'Chưa có số điện thoại')}</div></div><span class="chip ${m.status === 'active' ? 'success' : m.status === 'left' ? 'danger' : 'warn'}">${esc(m.status)}</span></div><div style="display:flex;gap:10px;margin-top:12px;flex-wrap:wrap"><span class="chip gold">Nợ phạt ${money(debtFine(m.id))}</span>${isAdmin() ? `<button class="btn small" data-status="${m.id}">Đổi trạng thái</button>` : ''}</div></div>`).join('')}</div>`;
    const add = root.querySelector('#addMember'); if (add) add.onclick = async () => { if (!adminGuard()) return; const name = prompt('Tên thành viên mới?'); if (name) { const id = S.nextMid++; S.members.push({ id, name, phone: '', status: 'active', note: '' }); S.thuThang[monthlyKey(id)] = Array(12).fill(0); await save(); renderMembers(); } };
    root.querySelectorAll('[data-status]').forEach(b => b.onclick = async () => { if (!adminGuard()) return; const m = S.members.find(x => String(x.id) === String(b.dataset.status)); m.status = m.status === 'active' ? 'inactive' : m.status === 'inactive' ? 'left' : 'active'; await save(); renderMembers(); });
  }

  function renderShare() {
    const root = document.getElementById('share'); if (!root) return;
    const paid = totalMonthly(), fine = totalFine(), exp = totalExpenses();
    root.innerHTML = `<section class="section" style="text-align:center"><img src="assets/logo-1024.png" style="width:96px;height:96px;border-radius:24px"><div class="overline" style="margin-top:18px">FC Sunday</div><h1 class="h1">Xem tổng quỹ nhanh</h1><p class="muted">Bản chỉ xem dành cho thành viên đội bóng.</p></section><section class="grid two"><div class="card pad gold-card"><div class="kpi-label">Số dư hiện tại</div><div class="money">${money(paid + fine - exp)}</div></div><div class="card pad"><div class="grid"><div><div class="kpi-label">Tồn quỹ tháng</div><h2 class="h2">${money(paid - totalExpenses('thang'))}</h2></div><div><div class="kpi-label">Tồn quỹ bia</div><h2 class="h2">${money(fine - totalExpenses('bia'))}</h2></div><div><div class="kpi-label">Nợ phạt chưa thu</div><h2 class="h2">${money(activeMembers().reduce((a, m) => a + debtFine(m.id), 0))}</h2></div></div></div></section>`;
  }

  return { boot, setCurrentYear, currentYear, renderDashboard, renderMonthly, renderFines, renderExpenses, renderMembers, renderShare, money, icon };
})();

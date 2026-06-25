/**
 * FC Sunday V2 — Components Loader
 * Loads HTML fragment components into [data-component] placeholders.
 * Must be included with defer at end of <body>.
 */

(function () {
  'use strict';

  // ── PWA detection ──────────────────────────────────────────
  const isPWA = () =>
    window.matchMedia('(display-mode: standalone)').matches ||
    window.navigator.standalone === true;

  // ── Component map ─────────────────────────────────────────
  const COMPONENTS_PATH = 'components/';

  // ── Inject HTML into placeholder ──────────────────────────
  async function loadComponent(el) {
    const name = el.getAttribute('data-component');
    if (!name) return;
    try {
      const res = await fetch(`${COMPONENTS_PATH}${name}.html?v=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const html = await res.text();
      el.insertAdjacentHTML('afterend', html);
      el.remove();
    } catch (e) {
      console.warn(`[FC Sunday] Component "${name}" failed to load:`, e.message);
    }
  }

  // ── Update active nav item ─────────────────────────────────
  function updateActiveNav(activeKey) {
    if (!activeKey) return;
    // Sidebar nav
    document.querySelectorAll('.sidebar-nav-item[data-nav]').forEach(item => {
      item.classList.toggle('active', item.dataset.nav === activeKey);
    });
    // Bottom nav
    document.querySelectorAll('.bottom-nav-item[data-nav]').forEach(item => {
      item.classList.toggle('active', item.dataset.nav === activeKey);
    });
  }

  // ── Update topbar title ────────────────────────────────────
  function updateTopbarTitle(title) {
    const el = document.getElementById('topbar-title');
    if (el && title) el.textContent = title;
  }

  // ── Sync badge ─────────────────────────────────────────────
  window.updateSyncBadge = function (status) {
    const badge = document.getElementById('sync-badge');
    const text  = document.getElementById('sync-text');
    if (!badge) return;
    const map = {
      firebase: { cls: 'firebase', icon: 'solar:cloud-check-linear', label: 'Đã đồng bộ' },
      local:    { cls: 'local',    icon: 'solar:cloud-upload-linear', label: 'Cache' },
      offline:  { cls: 'offline',  icon: 'solar:cloud-cross-linear',  label: 'Offline' },
      default:  { cls: '',         icon: 'solar:cloud-linear',         label: 'Mặc định' },
    };
    const s = map[status] || map['default'];
    badge.className = `sync-badge ${s.cls}`;
    badge.querySelector('iconify-icon')?.setAttribute('icon', s.icon);
    if (text) text.textContent = s.label;
  };

  // ── Update nav badges ──────────────────────────────────────
  window.updateNavBadges = function ({ thuThang, thuPhat, chiTieu, thanhVien }) {
    // Sidebar
    setSidebarBadge('badge-thu-thang', thuThang);
    setSidebarBadge('badge-thu-phat',  thuPhat);
    setSidebarBadge('badge-chi-tieu',  chiTieu);
    setSidebarBadge('badge-thanh-vien', thanhVien);
    // Bottom nav
    setBottomBadge('bnav-badge-thu-thang', thuThang);
    setBottomBadge('bnav-badge-thu-phat',  thuPhat);
    setBottomBadge('bnav-badge-chi-tieu',  chiTieu);
    setBottomBadge('bnav-badge-thanh-vien', thanhVien);
  };

  function setSidebarBadge(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val !== undefined ? val : '—';
  }
  function setBottomBadge(id, val) {
    const el = document.getElementById(id);
    if (!el) return;
    if (val && val > 0) { el.textContent = val; el.style.display = 'flex'; }
    else { el.style.display = 'none'; }
  }

  // ── Update auth UI ─────────────────────────────────────────
  window.updateAuthUI = function (isLoggedIn) {
    const btnLogin   = document.getElementById('btn-login');
    const btnSetting = document.getElementById('btn-setting');
    const btnAvatar  = document.getElementById('btn-avatar');
    const authEls    = document.querySelectorAll('.auth-only');

    if (btnLogin)   btnLogin.style.display   = isLoggedIn ? 'none' : 'inline-flex';
    if (btnSetting) btnSetting.style.display = isLoggedIn ? 'inline-flex' : 'none';
    if (btnAvatar)  btnAvatar.style.display  = isLoggedIn ? 'inline-flex' : 'none';
    authEls.forEach(el => {
      if (el.id !== 'btn-setting' && el.id !== 'btn-avatar') {
        el.style.display = isLoggedIn ? '' : 'none';
      }
    });
  };

  // ── Install prompt (Android) ───────────────────────────────
  let _deferredPrompt = null;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    _deferredPrompt = e;
    if (!isPWA()) {
      const btn = document.getElementById('btn-install-android');
      const sec = document.getElementById('sidebar-install');
      if (btn) { btn.style.display = 'flex'; }
      if (sec) { sec.style.display = 'block'; }
    }
  });

  // ── iOS install hint ───────────────────────────────────────
  function showIOSHint() {
    const isIOS = /iPhone|iPad|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isIOS && !isPWA()) {
      const hint = document.getElementById('ios-install-hint');
      const sec  = document.getElementById('sidebar-install');
      if (hint) { hint.style.display = 'block'; }
      if (sec)  { sec.style.display = 'block'; }
    }
  }

  // ── Login modal logic ──────────────────────────────────────
  function initLoginModal() {
    const modal     = document.getElementById('login-modal');
    const btnLogin  = document.getElementById('btn-login');
    const btnAvatar = document.getElementById('btn-avatar');
    const btnCancel = document.getElementById('btn-login-cancel');
    const btnSubmit = document.getElementById('btn-login-submit');
    const errBox    = document.getElementById('login-error');
    const errMsg    = document.getElementById('login-error-msg');

    if (!modal) return;

    function openModal() {
      modal.style.display = 'flex';
      document.getElementById('login-email')?.focus();
      if (errBox) errBox.style.display = 'none';
    }
    function closeModal() { modal.style.display = 'none'; }

    btnLogin?.addEventListener('click', openModal);
    btnCancel?.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    // Avatar → logout
    btnAvatar?.addEventListener('click', async () => {
      const orig = btnAvatar.textContent;
      btnAvatar.textContent = '…';
      btnAvatar.disabled = true;
      try {
        await window._logout?.();
      } finally {
        btnAvatar.textContent = orig;
        btnAvatar.disabled = false;
      }
    });

    btnSubmit?.addEventListener('click', async () => {
      const email = document.getElementById('login-email')?.value?.trim();
      const pass  = document.getElementById('login-password')?.value;
      if (!email || !pass) {
        if (errBox) { errBox.style.display = 'block'; errMsg.textContent = 'Vui lòng nhập đủ thông tin.'; }
        return;
      }
      btnSubmit.disabled = true;
      btnSubmit.innerHTML = '<iconify-icon icon="solar:spinner-linear" style="font-size:18px"></iconify-icon>Đang xử lý…';
      try {
        await window._login?.(email, pass);
        closeModal();
      } catch (err) {
        if (errBox) { errBox.style.display = 'block'; errMsg.textContent = err.message || 'Email hoặc mật khẩu không đúng.'; }
      } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = '<iconify-icon icon="solar:lock-unlocked-linear" style="font-size:18px"></iconify-icon>Đăng nhập';
      }
    });

    document.getElementById('login-password')?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') btnSubmit?.click();
    });
  }

  // ── Refresh button ─────────────────────────────────────────
  function initRefreshBtn() {
    const btn = document.getElementById('btn-refresh');
    if (!btn) return;
    btn.addEventListener('click', () => {
      btn.querySelector('iconify-icon')?.classList.add('spin');
      window._refreshData?.().finally(() => {
        btn.querySelector('iconify-icon')?.classList.remove('spin');
      });
    });
  }

  // ── Install button ─────────────────────────────────────────
  function initInstallBtn() {
    const btn = document.getElementById('btn-install-android');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      if (!_deferredPrompt) return;
      _deferredPrompt.prompt();
      const { outcome } = await _deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        btn.style.display = 'none';
      }
      _deferredPrompt = null;
    });
  }

  // ── Sidebar year ────────────────────────────────────────────
  function updateSidebarYear() {
    const el = document.getElementById('sidebar-year');
    if (el) el.textContent = window._currentYear || new Date().getFullYear();
  }

  // ── Main init ──────────────────────────────────────────────
  async function init() {
    // Find all component placeholders
    const placeholders = document.querySelectorAll('[data-component]');
    const activeKey  = placeholders[0]?.closest('[data-active]')?.dataset.active
                    || document.querySelector('[data-active]')?.dataset.active
                    || null;

    // Get active nav key from body data attr
    const bodyActive = document.body.dataset.active || activeKey;

    // Load all components in parallel
    await Promise.all(Array.from(placeholders).map(loadComponent));

    // After injection — initialize behaviors
    const titleEl = document.querySelector('[data-title]');
    const titleVal = titleEl?.dataset.title;
    if (titleVal) updateTopbarTitle(titleVal);

    updateActiveNav(bodyActive);
    updateSidebarYear();
    showIOSHint();
    initLoginModal();
    initInstallBtn();

    // Hide install section in PWA mode
    if (isPWA()) {
      document.querySelectorAll('.install-section').forEach(el => el.style.display = 'none');
    }

    // Notify page that components are ready
    window.onComponentsReady?.();
  }

  // Run on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

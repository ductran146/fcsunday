/**
 * FC Sunday V2 — app.js
 * Data layer: Firebase Auth (Email/Password) + Realtime Database
 * localStorage cache key: 'fc2026'
 */

(function () {
  'use strict';

  // ── Firebase Config ────────────────────────────────────────
  // Replace with your actual config from Firebase Console
  const FIREBASE_CONFIG = {
    apiKey:            "AIzaSyBi2JPD56s_vrUkEj-BovpnFWlz9MBNwj8",
    authDomain:        "fc-sunday-8f932.firebaseapp.com",
    databaseURL:       "https://fc-sunday-8f932-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId:         "fc-sunday-8f932",
    storageBucket:     "fc-sunday-8f932.firebasestorage.app",
    messagingSenderId: "801708335980",
    appId:             "1:801708335980:web:7d60e25e440d414c674949",
  };

  const CACHE_KEY = 'fc2026';

  // ── State ─────────────────────────────────────────────────
  let _app, _auth, _db;
  let _S = null;           // current data object
  let _user = null;        // firebase user
  let _dataSrc = 'none';

  // ── Init Firebase ──────────────────────────────────────────
  function initFirebase() {
    if (!window.firebase) return;
    try {
      _app  = firebase.initializeApp(FIREBASE_CONFIG);
      _auth = firebase.auth();
      _db   = firebase.database();
    } catch (e) {
      console.warn('[FC Sunday] Firebase init failed:', e.message);
    }
  }

  // ── Default data structure ─────────────────────────────────
  function mkInit() {
    return {
      _meta:     { version: '2.0', lastUpdated: new Date().toISOString().slice(0,10), updatedBy: '' },
      members:   [],
      nextMid:   1,
      thuThang:  {},
      matches:   [],
      nextMaid:  1,
      chiTieu:   [],
      nextCid:   1,
      settings:  { openingBalances: { thang: 0, bia: 0 } },
    };
  }

  // ── Load data ──────────────────────────────────────────────
  async function loadData() {
    // 1. Try Firebase
    if (_db) {
      try {
        const snap = await _db.ref('/').once('value');
        const data = snap.val();
        if (data) {
          _S = data;
          _dataSrc = 'firebase';
          localStorage.setItem(CACHE_KEY, JSON.stringify(_S));
          notifyDataReady();
          updateSyncBadge('firebase');
          return;
        }
      } catch (e) {
        console.warn('[FC Sunday] Firebase read failed:', e.message);
      }
    }

    // 2. Try static data.json
    try {
      const res = await fetch(`./data.json?t=${Date.now()}`);
      if (res.ok) {
        const data = await res.json();
        _S = data;
        _dataSrc = 'static';
        localStorage.setItem(CACHE_KEY, JSON.stringify(_S));
        notifyDataReady();
        updateSyncBadge('offline');
        return;
      }
    } catch (e) {
      // ignore
    }

    // 3. Try localStorage
    const cached = localStorage.getItem(CACHE_KEY);
    if (cached) {
      try {
        _S = JSON.parse(cached);
        _dataSrc = 'local';
        notifyDataReady();
        updateSyncBadge('local');
        return;
      } catch (e) {
        // ignore
      }
    }

    // 4. Default empty
    _S = mkInit();
    _dataSrc = 'none';
    notifyDataReady();
    updateSyncBadge('local');
  }

  // ── Save data ──────────────────────────────────────────────
  async function saveData(S) {
    if (!S._meta) S._meta = {};
    S._meta.lastUpdated = new Date().toISOString().slice(0,10);
    S._meta.updatedBy   = _user?.email || 'admin';
    _S = S;

    // Save to localStorage immediately
    localStorage.setItem(CACHE_KEY, JSON.stringify(_S));
    updateSyncBadge('local');

    // Save to Firebase
    if (_db && _user) {
      try {
        await _db.ref('/').set(_S);
        updateSyncBadge('firebase');
      } catch (e) {
        console.warn('[FC Sunday] Firebase write failed:', e.message);
        updateSyncBadge('local');
      }
    }
  }

  // ── Auth ───────────────────────────────────────────────────
  async function login(email, password) {
    // Chờ Firebase sẵn sàng tối đa 3 giây
    if (!_auth) {
      await new Promise((resolve, reject) => {
        let waited = 0;
        const t = setInterval(() => {
          waited += 100;
          if (_auth) { clearInterval(t); resolve(); }
          else if (waited >= 3000) { clearInterval(t); reject(new Error('Không kết nối được Firebase. Vui lòng thử lại.')); }
        }, 100);
      });
    }
    await _auth.signInWithEmailAndPassword(email, password);
  }

  async function logout() {
    try { localStorage.setItem('fc_auth_state', '0'); } catch(e) {}
    if (_auth) await _auth.signOut();
  }

  function isLoggedIn() { return !!_user; }

  // ── Notify page ────────────────────────────────────────────
  function notifyDataReady() {
    if (_S && window._onDataReady) window._onDataReady(_S);
  }

  function notifyAuthChange() {
    if (window._onAuthChange) window._onAuthChange(_user);
  }

  function updateSyncBadge(status) {
    window.updateSyncBadge?.(status);
  }

  // ── Refresh ────────────────────────────────────────────────
  async function refreshData() {
    return loadData();
  }

  // ── Expose to window sớm (trước khi Firebase boot) ────────
  window._login     = login;
  window._logout    = logout;
  window._isLoggedIn = isLoggedIn;
  window._getS      = () => _S;
  window._saveS     = saveData;
  window._refreshData = refreshData;
  window._currentYear = new Date().getFullYear();

  // ── Bootstrap ──────────────────────────────────────────────
  function boot() {
    initFirebase();

    // Listen for auth state
    if (_auth) {
      _auth.onAuthStateChanged((user) => {
        _user = user;
        window.updateAuthUI?.(!!user);
        notifyAuthChange();
      });
    }

    // Load data
    loadData();
  }

  // Wait for Firebase SDKs to be available
  if (window.firebase) {
    boot();
  } else {
    // Firebase loaded with defer, poll briefly
    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if (window.firebase || attempts > 20) {
        clearInterval(interval);
        boot();
      }
    }, 150);
  }

})();

// ── Money Input Helper ─────────────────────────────────────
// Dùng chung cho tất cả input số tiền trong dự án
(function() {
  'use strict';

  function formatMoney(raw) {
    // Bỏ mọi ký tự không phải số và dấu trừ đầu
    const isNeg = raw.startsWith('-');
    const digits = raw.replace(/[^\d]/g, '');
    if (!digits) return isNeg ? '-' : '';
    // Format với dấu chấm mỗi 3 chữ số
    const formatted = parseInt(digits, 10).toLocaleString('vi-VN');
    return (isNeg ? '-' : '') + formatted;
  }

  function parseMoney(formatted) {
    if (!formatted) return NaN;
    // Bỏ dấu chấm, giữ dấu trừ
    return parseFloat(formatted.replace(/\./g, '').replace(/,/g, '')) || 0;
  }

  function attachMoneyInput(el) {
    if (!el || el.dataset.moneyInput) return;
    el.dataset.moneyInput = '1';
    el.addEventListener('input', function() {
      const pos = this.selectionStart;
      const oldLen = this.value.length;
      this.value = formatMoney(this.value);
      // Giữ cursor position
      const diff = this.value.length - oldLen;
      this.setSelectionRange(pos + diff, pos + diff);
    });
    el.addEventListener('blur', function() {
      this.value = formatMoney(this.value);
    });
  }

  // Expose globally
  window._moneyInput = { attach: attachMoneyInput, parse: parseMoney, format: formatMoney };

  // Auto-attach khi DOM ready
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-money]').forEach(attachMoneyInput);
  });
})();


// ── Theme (Light / Dark) ───────────────────────────────────
(function initTheme() {
  const STORAGE_KEY = 'fc-sunday-theme';
  const root = document.documentElement;

  function getTheme() {
    return localStorage.getItem(STORAGE_KEY) || 'dark';
  }

  function applyTheme(theme) {
    if (theme === 'light') {
      root.setAttribute('data-theme', 'light');
    } else {
      root.removeAttribute('data-theme');
    }
    // Update icon nếu button đã mount
    const icon = document.getElementById('theme-toggle-icon');
    if (icon) {
      icon.setAttribute('icon', theme === 'light' ? 'solar:moon-linear' : 'solar:sun-linear');
    }
    // Update meta theme-color
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (metaTheme) {
      metaTheme.content = theme === 'light' ? '#F2F1EE' : '#0C0C0F';
    }
  }

  function toggleTheme() {
    const current = getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    localStorage.setItem(STORAGE_KEY, next);
    applyTheme(next);
  }

  // Áp dụng ngay khi load (trước khi render)
  applyTheme(getTheme());

  window._toggleTheme = toggleTheme;
  window._getTheme = getTheme;
})();

// ── Pull-to-refresh ────────────────────────────────────────
(function initPullToRefresh() {
  const THRESHOLD  = 72;   // px kéo xuống để trigger
  const MAX_PULL   = 100;  // px tối đa hiệu ứng
  let startY = 0, pulling = false, triggered = false;

  // Tạo indicator DOM
  const indicator = document.createElement('div');
  indicator.id = 'ptr-indicator';
  indicator.innerHTML = `
    <div class="ptr-inner">
      <svg class="ptr-spinner" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
          stroke-dasharray="28.27" stroke-dashoffset="28.27"/>
      </svg>
    </div>`;
  document.body.prepend(indicator);

  const page = () => document.querySelector('.main-content') || document.body;

  function setProgress(ratio) {
    const deg = ratio * 360;
    const offset = 28.27 * (1 - Math.min(ratio, 1));
    const circle = indicator.querySelector('circle');
    if (circle) {
      circle.style.strokeDashoffset = offset;
      circle.style.transform = `rotate(${deg * 2}deg)`;
      circle.style.transformOrigin = '12px 12px';
    }
    indicator.style.setProperty('--ptr-progress', Math.min(ratio, 1));
    const translateY = Math.min(ratio * THRESHOLD, MAX_PULL);
    indicator.style.transform = `translateX(-50%) translateY(${translateY - 48}px)`;
    indicator.style.opacity = Math.min(ratio * 2, 1);
  }

  function trigger() {
    triggered = true;
    indicator.classList.add('ptr-loading');
    // Spin animation
    const circle = indicator.querySelector('circle');
    if (circle) circle.style.strokeDashoffset = '8';
    // Gọi refresh
    Promise.resolve(window._refreshData?.()).finally(() => {
      setTimeout(reset, 400);
    });
  }

  function reset() {
    triggered = false;
    pulling = false;
    indicator.classList.remove('ptr-loading', 'ptr-triggered');
    indicator.style.transform = 'translateX(-50%) translateY(-48px)';
    indicator.style.opacity = '0';
    page().style.transform = '';
    page().style.transition = 'transform .25s ease';
    setTimeout(() => { page().style.transition = ''; }, 260);
  }

  document.addEventListener('touchstart', e => {
    // Chỉ kéo khi đang ở top của trang, không có modal đang mở
    const scrollTop = page().scrollTop || window.scrollY;
    if (scrollTop > 2) return;
    if (document.querySelector('.modal-backdrop[style*="flex"], .sheet-backdrop[style*="flex"]')) return;
    startY = e.touches[0].clientY;
    pulling = true;
    triggered = false;
  }, { passive: true });

  document.addEventListener('touchmove', e => {
    if (!pulling || triggered) return;
    const dy = e.touches[0].clientY - startY;
    if (dy <= 0) { pulling = false; return; }
    // Damping: kéo càng xa càng chậm
    const pull = Math.pow(dy, 0.75);
    const ratio = pull / THRESHOLD;
    setProgress(ratio);
    // Đẩy content xuống theo
    const shift = Math.min(pull * 0.4, 32);
    page().style.transform = `translateY(${shift}px)`;
    page().style.transition = 'none';
    if (ratio >= 1 && !indicator.classList.contains('ptr-triggered')) {
      indicator.classList.add('ptr-triggered');
    }
  }, { passive: true });

  document.addEventListener('touchend', () => {
    if (!pulling) return;
    const isTriggered = indicator.classList.contains('ptr-triggered');
    if (isTriggered) {
      trigger();
    } else {
      reset();
    }
  });
})();


// ── Scroll Lock: khoá scroll khi có sheet/modal hiện ────────
(function initScrollLock() {
  let _scrollY = 0;
  let _locked = false;

  function lock() {
    if (_locked) return;
    _locked = true;
    _scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${_scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.overflowY = 'scroll';
  }

  function unlock() {
    if (!_locked) return;
    _locked = false;
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.overflowY = '';
    window.scrollTo(0, _scrollY);
  }

  function check() {
    const anyOpen = Array.from(
      document.querySelectorAll('.sheet-backdrop, .modal-backdrop')
    ).some(el => {
      const d = el.style.display;
      return d && d !== 'none';
    });
    anyOpen ? lock() : unlock();
  }

  // Observe DOM changes: style changes + new elements added
  const observer = new MutationObserver(check);

  function startObserving() {
    observer.observe(document.body, {
      subtree: true,
      attributes: true,
      attributeFilter: ['style'],
      childList: true,   // detect khi append modal mới vào body
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserving);
  } else {
    startObserving();
  }
})();

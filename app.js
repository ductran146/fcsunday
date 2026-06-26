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

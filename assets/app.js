(function () {
  'use strict';

  const STORAGE_KEY = 'boarddeck_hsc_v1';
  const LEGACY_KEYS = ['hsc_cs_trainer_v3', 'hsc_cs_trainer_v2'];

  const ICONS = {
    sun: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
    moon: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sidebar: '<svg class="icon-svg" viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18"/></svg>',
    home: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M3 10.5L12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/></svg>',
    cloud: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M17.5 19a4.5 4.5 0 0 0 .5-8.97A6 6 0 0 0 6.26 8.3 4.5 4.5 0 0 0 6.5 19Z"/></svg>',
    search: '<svg class="icon-svg" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    arrow: '<span class="m-arrow" aria-hidden="true">-&gt;</span>',
    overview: '<svg class="icon-svg" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    mock: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 12h6M9 16h4"/></svg>',
    review: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>',
    archive: '<svg class="icon-svg" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8"/><path d="M10 12h4"/></svg>',
    book: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>',
    download: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    upload: '<svg class="icon-svg" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
  };

  // Interactive sample questions for homepage SaaS hero widget
  const HERO_SAMPLES = [
    {
      id: 'phy',
      tab: 'Physics Q.1',
      tag: '2026 March · Rotational · 1M',
      isMath: false,
      prompt: 'The kinetic energy of a rotating body of moment of inertia <i>I</i> and angular velocity &omega; is:',
      options: ['&frac12; <i>I</i>&omega;', '&frac12; <i>I</i>&omega;&sup2;', '<i>I</i>&omega;&sup2;', '2<i>I</i>&omega;&sup2;'],
      correct: 1,
      explain: 'Rotational kinetic energy is <i>K</i> = &frac12; <i>I</i>&omega;&sup2;, analogous to translational &frac12; <i>mv</i>&sup2;.'
    },
    {
      id: 'chem',
      tab: 'Chemistry',
      tag: '2025 March · Thermodynamics · 1M',
      isMath: false,
      prompt: 'For an isothermal reversible expansion of 1 mole of an ideal gas, which quantity equals zero?',
      options: ['&Delta;<i>U</i>', '<i>W</i>', '<i>q</i>', '&Delta;<i>S</i>'],
      correct: 0,
      explain: 'In an isothermal process on an ideal gas, &Delta;<i>T</i> = 0, so internal energy change &Delta;<i>U</i> = 0.'
    },
    {
      id: 'cs',
      tab: 'CS1 Slot',
      tag: '2024 March · Paper I · 5M Rule',
      isMath: false,
      prompt: 'Q.5 gives 2 C++ programs and 1 HTML program (attempt any 2). Picking the HTML slot secures 5M with predictable tag structure:',
      options: ['Skip Q.5 & lose 10M', 'Attempt C++ dry run only', 'Pair HTML (5M) + 1 standard C++ class', 'Attempt all 3 options'],
      correct: 2,
      explain: 'From 2015–2026 papers: 24/24 HTML Q.5 slots ask a standard table, form, or list page.'
    }
  ];

  let MANIFEST = null;
  const STREAM_CACHE = {};
  let ACTIVE_STREAM = null;

  /* ── Zero-Lag Optional liquidGL Multi-Lens Refractor (Desktop Home Only) ── */
  let liquidGLLoadPromise = null;
  let activeGlassLenses = [];
  let glassMountTimer = null;
  let glassResizeTimer = null;
  let glassResizeBound = false;

  function glassTintForTheme() {
    return document.body.classList.contains('light')
      ? 'rgba(255, 255, 255, 0.56)'
      : 'rgba(14, 16, 22, 0.44)';
  }

  function canRunLiquidGL() {
    if (typeof window === 'undefined') return false;
    if (window.innerWidth < 900) return false;
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
    if (navigator.connection && navigator.connection.saveData) return false;
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 2) return false;
    return true;
  }

  function destroyHomeGlass() {
    if (glassMountTimer) {
      clearTimeout(glassMountTimer);
      glassMountTimer = null;
    }
    if (activeGlassLenses.length) {
      for (const lens of activeGlassLenses) {
        try {
          if (Array.isArray(lens)) {
            lens.forEach((l) => l && typeof l.destroy === 'function' && l.destroy());
          } else if (lens && typeof lens.destroy === 'function') {
            lens.destroy();
          }
        } catch (_) {}
      }
      activeGlassLenses = [];
    }
  }

  function loadLiquidGLOnce() {
    if (typeof window.liquidGL === 'function') return Promise.resolve();
    if (liquidGLLoadPromise) return liquidGLLoadPromise;
    liquidGLLoadPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'assets/liquidGL.js';
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        liquidGLLoadPromise = null;
        reject(new Error('liquidGL failed to load'));
      };
      document.head.appendChild(s);
    });
    return liquidGLLoadPromise;
  }

  function mountHomeGlass() {
    destroyHomeGlass();
    if (!glassResizeBound) {
      glassResizeBound = true;
      window.addEventListener('resize', () => {
        if (!canRunLiquidGL() || view !== 'home') {
          destroyHomeGlass();
          return;
        }
        clearTimeout(glassResizeTimer);
        glassResizeTimer = setTimeout(() => {
          if (view === 'home' && canRunLiquidGL() && !activeGlassLenses.length) mountHomeGlass();
        }, 220);
      }, { passive: true });
    }
    if (view !== 'home' || !canRunLiquidGL()) return;

    const scheduleMount = () => {
      glassMountTimer = setTimeout(async () => {
        glassMountTimer = null;
        if (view !== 'home' || !canRunLiquidGL()) return;
        const headerPane = document.querySelector('.liquid-gl-pane');
        const cardPane = document.querySelector('.hero-demo-glass');
        const dockPane = document.querySelector('.home-dock-glass');
        const stage = document.querySelector('.home-stage');
        if (!stage || (!headerPane && !cardPane && !dockPane)) return;
        try {
          await loadLiquidGLOnce();
          if (view !== 'home' || !canRunLiquidGL() || typeof window.liquidGL !== 'function') return;
          const tint = glassTintForTheme();
          if (headerPane && document.body.contains(headerPane)) {
            const headerLens = window.liquidGL({
              target: '.liquid-gl-pane',
              snapshot: '.home-stage',
              zIndex: 1,
              resolution: 1.0,
              refraction: 0.026,
              aberration: 0.012,
              bevelDepth: 0.095,
              bevelWidth: 0.24,
              frost: 1.6,
              shadow: true,
              specular: true,
              reveal: 'fade',
              tilt: false,
              interaction: 'none',
              tint,
            });
            if (headerLens) activeGlassLenses.push(headerLens);
          }
          if (cardPane && document.body.contains(cardPane)) {
            const cardLens = window.liquidGL({
              target: '.hero-demo-glass',
              snapshot: '.home-stage',
              zIndex: 1,
              resolution: 1.0,
              refraction: 0.030,
              aberration: 0.016,
              bevelDepth: 0.125,
              bevelWidth: 0.26,
              frost: 2.0,
              shadow: true,
              specular: true,
              reveal: 'fade',
              tilt: false,
              interaction: 'none',
              tint,
            });
            if (cardLens) activeGlassLenses.push(cardLens);
          }
          if (dockPane && document.body.contains(dockPane)) {
            const dockLens = window.liquidGL({
              target: '.home-dock-glass',
              snapshot: '.home-stage',
              zIndex: 1,
              resolution: 1.0,
              refraction: 0.028,
              aberration: 0.014,
              bevelDepth: 0.105,
              bevelWidth: 0.24,
              frost: 1.8,
              shadow: true,
              specular: true,
              reveal: 'fade',
              tilt: false,
              interaction: 'none',
              tint,
            });
            if (dockLens) activeGlassLenses.push(dockLens);
          }
        } catch (_) {
          // Graceful fallback: specular CSS backdrop-filter remains active
        }
      }, 120);
    };

    if (typeof window.requestIdleCallback === 'function') {
      window.requestIdleCallback(scheduleMount, { timeout: 600 });
    } else {
      scheduleMount();
    }
  }
  let routeStream = null;
  let view = 'home';
  let currentSubj = 'phy';
  let currentChapter = 'phy-01';
  let currentMockSubj = 'phy';
  let currentMockYear = '';
  let lastSavedText = 'Local Ready';
  let toastTimer = null;
  let mathJaxTimer = null;
  let confirmResetArmed = false;

  // Interactive hero demo state
  let heroTabIdx = 0;
  let heroDemoAnswer = null;

  // Cloud Sync UI state
  let syncModeTab = 'signin';
  let syncStatus = { mode: 'guest', label: 'Guest · Local Only', email: null, lastSyncedAt: null, error: null, configured: false };

  const filters = {
    search: '',
    year: 'all',
    section: 'all',
    status: 'all',
    repeatsOnly: false,
    mcqOnly: false
  };

  let mockTimer = { running: false, seconds: 10800, intervalId: null };
  let focusedIdx = -1;
  const openEditors = new Set();

  function loadState() {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      for (const k of LEGACY_KEYS) {
        const legacy = localStorage.getItem(k);
        if (legacy) {
          raw = legacy;
          localStorage.setItem(STORAGE_KEY, legacy);
          break;
        }
      }
    }
    try {
      const parsed = raw ? JSON.parse(raw) : {};
      return {
        mastery: parsed.mastery || {},
        attempts: parsed.attempts || {},
        revealed: parsed.revealed || {},
        notes: parsed.notes || {},
        mockAttempts: parsed.mockAttempts || {},
        mockRevealed: parsed.mockRevealed || {},
        theme: parsed.theme || 'dark',
        sidebarCollapsed: !!parsed.sidebarCollapsed,
        lastActive: parsed.lastActive || null,
        updatedAt: parsed.updatedAt || 0
      };
    } catch (e) {
      return {
        mastery: {}, attempts: {}, revealed: {}, notes: {},
        mockAttempts: {}, mockRevealed: {}, theme: 'dark',
        sidebarCollapsed: false, lastActive: null, updatedAt: 0
      };
    }
  }

  let state = loadState();

  function showToast(msg, kind) {
    const el = document.getElementById('toast');
    if (!el) return;
    el.textContent = msg;
    el.className = 'toast show' + (kind === 'ok' ? ' ok' : kind === 'err' ? ' err' : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { el.className = 'toast'; }, 2800);
  }

  function saveState(opts) {
    state.updatedAt = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      const now = new Date();
      lastSavedText = 'Saved ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      lastSavedText = 'Storage quota issue';
      showToast('Browser storage is full. Sign in to Cloud Sync or export backup.', 'err');
    }
    updateSaveStatusDom();
    if (!opts || !opts.skipCloud) {
      if (window.BoardDeckSync && window.BoardDeckSync.schedulePush) {
        window.BoardDeckSync.schedulePush();
      }
    }
  }

  function updateSaveStatusDom() {
    const el = document.getElementById('saveStatus');
    const dot = document.getElementById('mobileSyncDot');
    const homeBtn = document.getElementById('homeSyncBtn');
    const mode = syncStatus.mode || 'guest';
    const dotCls = 'sync-dot ' + (mode === 'connected' ? 'connected' : mode === 'syncing' ? 'syncing' : mode === 'error' ? 'error' : '');
    if (el) {
      el.innerHTML = `<span style="display:inline-flex;align-items:center;gap:6px;"><span class="${dotCls}"></span><span>${escapeHtml(syncStatus.label || lastSavedText)}</span></span><span>${escapeHtml(lastSavedText.replace(/^Saved /, ''))}</span>`;
    }
    if (dot) dot.className = dotCls;
    if (homeBtn) {
      const lbl = mode === 'connected' ? (syncStatus.email ? syncStatus.email.split('@')[0] : 'Synced') : (syncStatus.configured ? 'Sign In' : 'Cloud Sync');
      homeBtn.innerHTML = `<span class="${dotCls}"></span><span>${escapeHtml(lbl)}</span>`;
    }
  }

  // Expose Cloud Sync hooks for assets/sync.js
  window.__getBoardDeckState = () => state;
  window.__applyMergedCloudState = (merged) => {
    state = { ...loadState(), ...merged };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    applyTheme(state.theme);
    render();
  };

  function applyTheme(t) {
    state.theme = t;
    document.body.classList.toggle('light', t === 'light');
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = t === 'light' ? '#f8f8f6' : '#09090b';
  }

  function escapeHtml(s) {
    return String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getStreamAllQs(streamData) {
    if (!streamData || !streamData.subjects) return [];
    const arr = [];
    for (const key of Object.keys(streamData.subjects)) {
      const sub = streamData.subjects[key];
      if (sub && sub.questions) arr.push(...sub.questions);
    }
    return arr;
  }

  function romanToNum(r) {
    const map = { i: 1, v: 5, x: 10, l: 50 };
    let val = 0;
    const s = String(r || '').toLowerCase();
    for (let i = 0; i < s.length; i++) {
      const cur = map[s[i]] || 0;
      const nxt = map[s[i + 1]] || 0;
      val += cur < nxt ? -cur : cur;
    }
    return val;
  }

  function extractQSortKey(qNum) {
    const parts = [];
    const tokens = String(qNum || '').match(/[a-zA-Z]+|\d+/g) || [];
    for (const tok of tokens) {
      if (/^\d+$/.test(tok)) {
        parts.push(String(parseInt(tok, 10)).padStart(4, '0'));
      } else if (/^[ivxl]+$/i.test(tok) && tok.length <= 4 && tok.toLowerCase() !== 'c') {
        parts.push('r' + String(romanToNum(tok)).padStart(4, '0'));
      } else {
        parts.push('a' + tok.toLowerCase().padStart(3, ' '));
      }
    }
    return parts.join('.');
  }

  function getMockConfig(streamId) {
    if (streamId === 'phy' || streamId === 'chem') return { marks: '70M · 3h 00m', secs: 10800 };
    if (streamId === 'math' || streamId === 'eng') return { marks: '80M · 3h 00m', secs: 10800 };
    return { marks: '50M · 3h 00m', secs: 10800 };
  }

  function getActivePaperList(subjKey) {
    if (!ACTIVE_STREAM || !ACTIVE_STREAM.subjects[subjKey]) return [];
    const seen = new Map();
    for (const q of ACTIVE_STREAM.subjects[subjKey].questions) {
      if (!seen.has(q.year)) {
        const m = q.year.match(/\d{4}/);
        const yr = m ? parseInt(m[0], 10) : 0;
        const term = q.year.includes('July') ? 1 : 2;
        seen.set(q.year, { year: q.year, sort: yr * 10 + term, url: q.paper_url });
      }
    }
    return Array.from(seen.values()).sort((a, b) => b.sort - a.sort);
  }

  function getFilteredQuestions(subjKey, chId) {
    if (!ACTIVE_STREAM || !ACTIVE_STREAM.subjects[subjKey]) return [];
    let list = ACTIVE_STREAM.subjects[subjKey].questions.filter(q => q.chapter_id === chId);
    if (filters.year !== 'all') list = list.filter(q => q.year === filters.year);
    if (filters.section !== 'all') list = list.filter(q => q.section_id === filters.section);
    if (filters.status !== 'all') {
      list = list.filter(q => {
        const st = state.mastery[q.uid] || 'unattempted';
        return st === filters.status;
      });
    }
    if (filters.repeatsOnly) list = list.filter(q => (q.repeat_count || 1) >= 2);
    if (filters.mcqOnly) list = list.filter(q => q.is_mcq);
    if (filters.search.trim()) {
      const s = filters.search.trim().toLowerCase();
      list = list.filter(q =>
        (q.prompt_text || '').toLowerCase().includes(s) ||
        (q.year || '').toLowerCase().includes(s) ||
        (q.q_num || '').toLowerCase().includes(s) ||
        (q.options || []).some(o => o.toLowerCase().includes(s))
      );
    }
    return list;
  }

  function scheduleMathJax(attempt) {
    const tries = attempt || 0;
    clearTimeout(mathJaxTimer);
    mathJaxTimer = setTimeout(() => {
      if (!window.MathJax || !window.MathJax.typesetPromise) {
        if (tries < 15) scheduleMathJax(tries + 1);
        return;
      }
      const targets = document.querySelectorAll('.tex2jax_process');
      if (!targets.length) return;
      try {
        window.MathJax.typesetClear && window.MathJax.typesetClear(Array.from(targets));
        window.MathJax.typesetPromise(Array.from(targets)).catch(() => {});
      } catch (e) {}
    }, tries ? 200 : 30);
  }

  function updateTabIndicators() {
    document.querySelectorAll('.seg-tabs').forEach(wrap => {
      const active = wrap.querySelector('.seg-tab[aria-selected="true"]');
      const ind = wrap.querySelector('.seg-ind');
      if (active && ind) {
        ind.style.width = active.offsetWidth + 'px';
        ind.style.transform = 'translateX(' + active.offsetLeft + 'px)';
      }
    });
  }

  function streamAllowsMathJax(streamId) {
    return streamId === 'phy' || streamId === 'chem' || streamId === 'math';
  }

  async function ensureStreamLoaded(streamId) {
    if (STREAM_CACHE[streamId]) {
      ACTIVE_STREAM = STREAM_CACHE[streamId];
      return ACTIVE_STREAM;
    }
    const meta = MANIFEST && MANIFEST.streams.find(s => s.id === streamId);
    if (!meta) throw new Error('Unknown stream: ' + streamId);
    const resp = await fetch(meta.dataUrl);
    if (!resp.ok) throw new Error('Failed to load stream data (' + resp.status + ')');
    const data = await resp.json();
    STREAM_CACHE[streamId] = data;
    ACTIVE_STREAM = data;
    return data;
  }

  async function openStream(streamId, targetView, optSubj, optCh) {
    routeStream = streamId;
    document.getElementById('shell').classList.remove('is-home');
    document.body.classList.toggle('sidebar-collapsed', !!state.sidebarCollapsed);

    // Show layout-matched loading skeleton immediately if not cached
    if (!STREAM_CACHE[streamId]) {
      ACTIVE_STREAM = null;
      renderSidebar();
      document.getElementById('main').innerHTML = `
        <div class="topbar">
          <div>
            <h1 class="page-title">Loading ${escapeHtml(streamId.toUpperCase())}...</h1>
            <div class="page-meta">Fetching chapter-mapped board archive</div>
          </div>
          <div style="display:flex;gap:8px;">
            <div class="skel-block skel-pill" style="width:110px;height:36px;"></div>
            <div class="skel-block skel-pill" style="width:96px;height:36px;"></div>
          </div>
        </div>
        <div class="stat-row">
          <div class="skel-card" style="padding:16px 18px;"><div class="skel-block" style="width:55%;height:12px;margin-bottom:12px;"></div><div class="skel-block" style="width:45%;height:28px;"></div></div>
          <div class="skel-card" style="padding:16px 18px;"><div class="skel-block" style="width:55%;height:12px;margin-bottom:12px;"></div><div class="skel-block" style="width:40%;height:28px;"></div></div>
          <div class="skel-card" style="padding:16px 18px;"><div class="skel-block" style="width:55%;height:12px;margin-bottom:12px;"></div><div class="skel-block" style="width:35%;height:28px;"></div></div>
          <div class="skel-card" style="padding:16px 18px;"><div class="skel-block" style="width:55%;height:12px;margin-bottom:12px;"></div><div class="skel-block" style="width:30%;height:28px;"></div></div>
        </div>
        <div class="skel-card" style="margin-top:16px;">
          <div class="skel-block" style="width:32%;height:16px;margin-bottom:18px;"></div>
          <div class="skel-block" style="width:100%;height:38px;margin-bottom:10px;"></div>
          <div class="skel-block" style="width:100%;height:38px;margin-bottom:10px;"></div>
          <div class="skel-block" style="width:100%;height:38px;"></div>
        </div>
      `;
    }

    try {
      const st = await ensureStreamLoaded(streamId);
      currentSubj = optSubj && st.subjects[optSubj] ? optSubj : st.defaultSubj;
      const firstCh = st.subjects[currentSubj].meta[0]?.id || st.defaultCh;
      currentChapter = optCh || st.subjects[currentSubj].meta.find(m => m.id === st.defaultCh)?.id || firstCh;
      currentMockSubj = currentSubj;
      const pList = getActivePaperList(currentMockSubj);
      currentMockYear = pList[0]?.year || '';
      view = targetView || 'overview';
      state.lastActive = { stream: streamId, view, subj: currentSubj, ch: currentChapter };
      saveState({ skipCloud: true });
      syncHash();
      render();
      window.scrollTo({ top: 0, behavior: 'instant' });
    } catch (err) {
      showToast('Failed to load subject dataset. Check connection.', 'err');
      goHome();
    }
  }

  function goHome() {
    routeStream = null;
    view = 'home';
    document.getElementById('shell').classList.add('is-home');
    closeDrawer();
    syncHash();
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function syncHash() {
    if (!routeStream || view === 'home') {
      if (location.hash && location.hash !== '#home') history.replaceState(null, '', '#home');
      return;
    }
    let h = '#' + routeStream + '/' + view;
    if (view === 'chapter') h += '/' + currentSubj + '/' + currentChapter;
    if (h !== location.hash) history.replaceState(null, '', h);
  }

  async function applyHash() {
    if (!MANIFEST) return;
    const raw = (location.hash || '').replace(/^#/, '');
    const isOAuthCallback = /^(access_token=|refresh_token=|error=|error_description=|type=)/.test(raw);
    if (!raw || raw === 'home' || isOAuthCallback) {
      routeStream = null;
      view = 'home';
      render();
      return;
    }
    const parts = raw.split('/');
    const sid = parts[0];
    if (MANIFEST.streams.some(s => s.id === sid)) {
      await openStream(sid, parts[1] || 'overview', parts[2], parts[3]);
    } else {
      goHome();
    }
  }

  function navTo(newView, subj, chId) {
    view = newView;
    if (subj && ACTIVE_STREAM && ACTIVE_STREAM.subjects[subj]) currentSubj = subj;
    if (chId) currentChapter = chId;
    if (newView === 'mock') {
      const papers = getActivePaperList(currentMockSubj);
      if (!papers.some(p => p.year === currentMockYear)) currentMockYear = papers[0]?.year || '';
    }
    focusedIdx = -1;
    confirmResetArmed = false;
    closeDrawer();
    if (routeStream) {
      state.lastActive = { stream: routeStream, view, subj: currentSubj, ch: currentChapter };
      saveState({ skipCloud: true });
    }
    syncHash();
    render();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function toggleSidebarCollapse() {
    state.sidebarCollapsed = !state.sidebarCollapsed;
    document.body.classList.toggle('sidebar-collapsed', state.sidebarCollapsed);
    saveState();
  }

  function toggleDrawer() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('drawerBackdrop').classList.toggle('open');
  }

  function closeDrawer() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('drawerBackdrop').classList.remove('open');
  }

  function renderSidebar() {
    const sb = document.getElementById('sidebar');
    if (!routeStream || view === 'home') {
      sb.innerHTML = '';
      return;
    }
    const stMeta = MANIFEST.streams.find(s => s.id === routeStream);
    const titleName = stMeta ? stMeta.name : routeStream.toUpperCase();
    const mTitle = document.getElementById('mobileTitle');
    if (mTitle) mTitle.textContent = 'BoardDeck · ' + titleName;

    if (!ACTIVE_STREAM) {
      sb.innerHTML = `
        <div class="brand">
          <button class="brand-mark" onclick="goHome()"><span class="brand-dot"></span><span>BoardDeck</span></button>
          <button class="btn sm" onclick="goHome()">Subjects</button>
        </div>
        <div style="padding:12px;color:var(--muted);font-size:13px;">Loading ${escapeHtml(titleName)}...</div>
      `;
      return;
    }

    const allQ = getStreamAllQs(ACTIVE_STREAM);
    const reviewCount = allQ.filter(q => state.mastery[q.uid] === 'review').length;

    let chHtml = '';
    for (const sk of Object.keys(ACTIVE_STREAM.subjects)) {
      const sub = ACTIVE_STREAM.subjects[sk];
      chHtml += `<div class="nav-label">${escapeHtml(sub.navTitle)}</div>`;
      for (const ch of sub.meta) {
        const qs = sub.questions.filter(q => q.chapter_id === ch.id);
        const mCnt = qs.filter(q => state.mastery[q.uid] === 'mastered').length;
        const active = view === 'chapter' && currentSubj === sk && currentChapter === ch.id ? 'active' : '';
        chHtml += `<button class="nav-item ${active}" onclick="navTo('chapter','${sk}','${ch.id}')">
          <span class="nav-title">${escapeHtml(ch.title)}</span>
          <span class="nav-count">${mCnt}/${qs.length}</span>
        </button>`;
      }
    }

    sb.innerHTML = `
      <div class="brand">
        <button class="brand-mark" onclick="goHome()" title="All subjects">
          <span class="brand-dot"></span><span>BoardDeck</span>
        </button>
        <button class="btn sm" onclick="toggleSidebarCollapse()" title="Collapse sidebar" style="height:26px;padding:0 7px;">${ICONS.sidebar}</button>
      </div>
      <div class="stream-switcher">
        <span style="display:inline-flex;align-items:center;gap:6px;min-width:0;">
          <span class="stream-pill">${escapeHtml(ACTIVE_STREAM.short)}</span>
          <span style="font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(ACTIVE_STREAM.name)}</span>
        </span>
        <div style="display:flex;gap:4px;">
          <button class="btn sm" onclick="openCmdModal()" title="Quick Jump (Ctrl+K)" style="height:24px;padding:0 6px;">${ICONS.search}</button>
          <button class="btn sm" onclick="goHome()" style="height:24px;padding:0 8px;">Switch</button>
        </div>
      </div>

      <button class="nav-item ${view === 'overview' ? 'active' : ''}" onclick="navTo('overview')">
        <span class="nav-title">${ICONS.overview} Overview &amp; Strategy</span>
      </button>
      <button class="nav-item ${view === 'mock' ? 'active' : ''}" onclick="navTo('mock')">
        <span class="nav-title">${ICONS.mock} Mock Papers</span>
        <span class="nav-count">${ACTIVE_STREAM.papersCount}</span>
      </button>
      <button class="nav-item ${view === 'review' ? 'active' : ''}" onclick="navTo('review')">
        <span class="nav-title">${ICONS.review} Review Queue</span>
        <span class="nav-count">${reviewCount}</span>
      </button>
      <button class="nav-item ${view === 'archive' ? 'active' : ''}" onclick="navTo('archive')">
        <span class="nav-title">${ICONS.archive} Syllabus &amp; Archive</span>
      </button>

      ${chHtml}

      <div class="sidebar-footer">
        <button class="btn sm" onclick="openSyncModal()" style="width:100%;justify-content:space-between;">
          <span style="display:inline-flex;align-items:center;gap:6px;">${ICONS.cloud} Cloud Sync</span>
          <span class="mono" style="font-size:11px;color:var(--muted);">${syncStatus.mode === 'connected' ? 'On' : 'Guest'}</span>
        </button>
        <div class="sidebar-row">
          <div class="theme-seg">
            <button class="${state.theme === 'dark' ? 'active' : ''}" onclick="setTheme('dark')">${ICONS.moon} Dark</button>
            <button class="${state.theme === 'light' ? 'active' : ''}" onclick="setTheme('light')">${ICONS.sun} Light</button>
          </div>
          <button class="btn sm" onclick="exportProgress()" title="Export JSON backup">${ICONS.download}</button>
        </div>
        <div class="save-status" id="saveStatus"></div>
      </div>
    `;
    updateSaveStatusDom();
  }

  function renderHome() {
    const m = document.getElementById('main');
    const core = MANIFEST.streams.filter(s => s.group === 'core');
    const elective = MANIFEST.streams.filter(s => s.group === 'elective');
    const totalQs = MANIFEST.streams.reduce((acc, s) => acc + s.questionCount, 0);

    let resumeHtml = '';
    if (state.lastActive && MANIFEST.streams.some(s => s.id === state.lastActive.stream)) {
      const la = state.lastActive;
      const st = MANIFEST.streams.find(s => s.id === la.stream);
      resumeHtml = `
        <div class="resume-strip" data-enter="4">
          <span>Continue where you left off: <strong>${escapeHtml(st.name)}</strong> (${escapeHtml(la.ch || la.view)})</span>
          <button class="btn sm accent" onclick="openStream('${la.stream}','${la.view || 'overview'}','${la.subj || ''}','${la.ch || ''}')">
            Resume Session ${ICONS.arrow}
          </button>
        </div>
      `;
    }

    const renderStreamCard = (st) => {
      const mCnt = st.uids.filter(id => state.mastery[id] === 'mastered').length;
      const pct = st.questionCount ? Math.round(100 * mCnt / st.questionCount) : 0;
      const mcqAtt = Object.keys(st.mcqUids).filter(id => state.attempts[id] !== undefined);
      const mcqOk = mcqAtt.filter(id => state.attempts[id] === st.mcqUids[id]).length;
      const mcqStr = mcqAtt.length ? `${mcqOk}/${mcqAtt.length}` : `${st.mcqCount} MCQs`;

      return `
        <div class="subj-card" onclick="openStream('${st.id}','overview')" role="button" tabindex="0" onkeydown="if(event.key==='Enter')openStream('${st.id}','overview')">
          <div>
            <div class="subj-top">
              <span class="stream-pill">HSC · ${escapeHtml(st.code)}</span>
              <span class="tag">${escapeHtml(st.yearRange)}</span>
            </div>
            <h3 class="subj-title">${escapeHtml(st.name)}</h3>
            <p class="subj-desc">${escapeHtml(st.tagline)}</p>
          </div>
          <div class="subj-metrics">
            <div><div class="subj-metric-val">${st.questionCount}</div><div class="subj-metric-lbl">${st.repeatCount} repeated</div></div>
            <div><div class="subj-metric-val">${pct}%</div><div class="subj-metric-lbl">${mCnt} mastered</div></div>
            <div><div class="subj-metric-val">${mcqStr}</div><div class="subj-metric-lbl">Objective</div></div>
          </div>
          <div class="subj-actions" onclick="event.stopPropagation()">
            <button class="btn" onclick="openStream('${st.id}','overview')">Open ${escapeHtml(st.short)} ${ICONS.arrow}</button>
            <div style="display:flex;gap:8px;">
              <button class="btn sm" onclick="openStream('${st.id}','mock')">Mock (${st.papersCount})</button>
              <button class="btn sm" onclick="openStream('${st.id}','chapter')">Drill</button>
            </div>
          </div>
        </div>
      `;
    };

    function buildHeroDemoInner() {
      const sample = HERO_SAMPLES[heroTabIdx] || HERO_SAMPLES[0];
      return `
        <div class="hero-demo-top">
          <div class="seg-tabs" role="tablist">
            <div class="seg-ind"></div>
            ${HERO_SAMPLES.map((s, idx) => `<button class="seg-tab" role="tab" aria-selected="${idx === heroTabIdx}" onclick="setHeroTab(${idx})">${escapeHtml(s.tab)}</button>`).join('')}
          </div>
          <span class="tag mono" style="font-size:11px;">${escapeHtml(sample.tag)}</span>
        </div>
        <div class="demo-q">${sample.prompt}</div>
        <div class="demo-opts">
          ${sample.options.map((opt, idx) => {
            let cls = 'demo-opt';
            if (heroDemoAnswer !== null) {
              if (idx === sample.correct) cls += ' correct';
              else if (idx === heroDemoAnswer) cls += ' wrong';
            }
            return `<button class="${cls}" onclick="pickHeroOpt(${idx})"><span class="mono" style="margin-right:6px;opacity:.65;">${idx + 1}.</span>${opt}</button>`;
          }).join('')}
        </div>
        <div class="demo-foot">
          <span>${heroDemoAnswer === null ? 'Select an option to check solution' : sample.explain}</span>
          <span class="mono" style="flex-shrink:0;opacity:.75;">1–4</span>
        </div>
      `;
    }
    window._buildHeroDemoInner = buildHeroDemoInner;

    const syncBtnLabel = syncStatus.mode === 'connected'
      ? `${syncStatus.email ? syncStatus.email.split('@')[0] : 'Synced'}`
      : 'Sign In';

    const repeatTotal = MANIFEST.streams.reduce((a, s) => a + s.repeatCount, 0);
    const repeatPct = totalQs ? Math.round((100 * repeatTotal) / totalQs) : 0;
    const masteredTotal = MANIFEST.streams.reduce((acc, st) => acc + st.uids.filter(id => state.mastery[id] === 'mastered').length, 0);
    const masteredPct = totalQs ? Math.round((100 * masteredTotal) / totalQs) : 0;
    const maxQ = Math.max(...MANIFEST.streams.map(s => s.questionCount), 1);
    const coreQCount = core.reduce((a, s) => a + s.questionCount, 0);
    const elecQCount = elective.reduce((a, s) => a + s.questionCount, 0);
    const circumference = 2 * Math.PI * 26;
    const strokeDashoffset = (circumference * (1 - masteredPct / 100)).toFixed(1);

    m.innerHTML = `
      <header class="home-header" data-enter="1" data-liquid-ignore>
        <div class="liquid-gl-pane" aria-hidden="true"></div>
        <div class="home-header-inner">
          <div class="home-brand">
            <span class="brand-dot"></span>
            <span class="home-brand-title">BoardDeck</span>
            <span class="tag mono">HSC 12</span>
          </div>
          <div class="home-header-actions">
            <button class="btn sm" onclick="openCmdModal()" aria-label="Search subjects or chapters">${ICONS.search} <span class="hide-xs">Jump</span> <span class="kbd">Ctrl+K</span></button>
            <button class="btn sm" id="homeSyncBtn" onclick="openSyncModal()">
              <span class="sync-dot ${syncStatus.mode === 'connected' ? 'connected' : syncStatus.mode === 'syncing' ? 'syncing' : ''}"></span>
              <span>${escapeHtml(syncBtnLabel)}</span>
            </button>
            <div class="theme-seg">
              <button class="${state.theme === 'dark' ? 'active' : ''}" onclick="setTheme('dark')" aria-label="Dark theme">${ICONS.moon}</button>
              <button class="${state.theme === 'light' ? 'active' : ''}" onclick="setTheme('light')" aria-label="Light theme">${ICONS.sun}</button>
            </div>
          </div>
        </div>
      </header>

      <div class="home-stage">
        <section class="hero-screen">
          <div class="hero-optical-bg" aria-hidden="true">
            <div class="hero-optical-grid"></div>
            <svg class="hero-optical-beam" viewBox="0 0 680 520" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="beamLineA" x1="0" y1="60" x2="680" y2="340" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#d4ff00" stop-opacity="0"/>
                  <stop offset="48%" stop-color="#d4ff00" stop-opacity="0.88"/>
                  <stop offset="100%" stop-color="#d4ff00" stop-opacity="0"/>
                </linearGradient>
                <linearGradient id="beamLineB" x1="40" y1="420" x2="640" y2="110" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#ffffff" stop-opacity="0"/>
                  <stop offset="52%" stop-color="#d4ff00" stop-opacity="0.58"/>
                  <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
                </linearGradient>
                <radialGradient id="prismCore" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stop-color="#d4ff00" stop-opacity="0.22"/>
                  <stop offset="60%" stop-color="#d4ff00" stop-opacity="0.06"/>
                  <stop offset="100%" stop-color="#d4ff00" stop-opacity="0"/>
                </radialGradient>
              </defs>
              <circle cx="360" cy="240" r="210" fill="url(#prismCore)"/>
              <path d="M 30 130 C 210 130, 320 290, 650 220" stroke="url(#beamLineA)" stroke-width="2.2"/>
              <path d="M 10 310 C 220 260, 390 120, 670 165" stroke="url(#beamLineB)" stroke-width="1.6"/>
              <path d="M 60 400 L 640 70" stroke="url(#beamLineA)" stroke-width="1.2" stroke-dasharray="5 6"/>
              <circle cx="360" cy="230" r="108" stroke="#d4ff00" stroke-opacity="0.34" stroke-width="1.3"/>
              <circle cx="360" cy="230" r="182" stroke="#d4ff00" stroke-opacity="0.16" stroke-width="1"/>
            </svg>
          </div>

          <div class="hero-split">
            <div class="home-hero">
              <div class="hero-eyebrow" data-enter="1">
                <span class="dot"></span>
                <span>Maharashtra HSC · Class 12 Science &amp; Bifocal</span>
              </div>
              <h1 data-enter="2">HSC boards, engineered to the mark.</h1>
              <p data-enter="3">Chapter-mapped PYQs, verified repeat patterns, and 3-hour timed mocks across six isolated exam streams.</p>
              <div class="hero-cta-row" data-enter="4">
                <button class="btn primary" onclick="document.getElementById('subjectsDirectory')?.scrollIntoView({behavior:'smooth'})">Explore Subjects ${ICONS.arrow}</button>
                <button class="btn" onclick="openSyncModal()">${ICONS.cloud} ${syncStatus.user ? 'Cloud Synced' : 'Sign In & Sync'}</button>
              </div>
              <div class="hero-proof" data-enter="5">
                <div><div class="hero-proof-val mono">${totalQs.toLocaleString()}</div><div class="hero-proof-lbl">Board questions</div></div>
                <div><div class="hero-proof-val mono">6</div><div class="hero-proof-lbl">Exam streams</div></div>
                <div><div class="hero-proof-val mono">${repeatTotal.toLocaleString()}</div><div class="hero-proof-lbl">Repeat flags</div></div>
                <div><div class="hero-proof-val mono">2015–26</div><div class="hero-proof-lbl">Official papers</div></div>
              </div>
            </div>

            <div class="hero-bento" data-enter="3">
              <div class="hero-demo" data-liquid-ignore>
                <div class="hero-demo-glass" aria-hidden="true"></div>
                <div class="hero-demo-inner tex2jax_ignore" id="heroDemoInner">
                  ${buildHeroDemoInner()}
                </div>
              </div>

              <div class="bento-tile bento-lime">
                <div class="bento-head">
                  <span class="bento-kicker">Repeat Density</span>
                  <span class="bento-pill-dark mono">${repeatTotal} FLAGS</span>
                </div>
                <div>
                  <div class="bento-big mono">${repeatPct}%</div>
                  <div class="bento-sub">${totalQs.toLocaleString()} archived MSBSHSE PYQs</div>
                </div>
                <div class="bento-bars">
                  ${MANIFEST.streams.map((st) => {
                    const h = Math.max(22, Math.round((100 * st.questionCount) / maxQ));
                    return `
                      <button type="button" class="bento-bar-btn" onclick="openStream('${st.id}','overview')" title="${escapeHtml(st.name)} (${st.questionCount} PYQs)">
                        <span class="bento-bar-track"><span class="bento-bar-fill" style="height:${h}%"></span></span>
                        <span>${escapeHtml(st.short.slice(0, 3).toUpperCase())}</span>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>

              <div class="bento-tile bento-gauge">
                <div class="bento-head">
                  <span class="bento-kicker" style="color:var(--muted);">Syllabus Mastery</span>
                  <span class="tag mono">${masteredTotal}/${totalQs}</span>
                </div>
                <div class="bento-gauge-body">
                  <div class="gauge-ring">
                    <svg viewBox="0 0 66 66">
                      <circle class="gauge-ring-bg" cx="33" cy="33" r="26"></circle>
                      <circle class="gauge-ring-fg" cx="33" cy="33" r="26" stroke-dasharray="${circumference.toFixed(1)}" stroke-dashoffset="${strokeDashoffset}"></circle>
                    </svg>
                    <div class="gauge-val mono">${masteredPct}%</div>
                  </div>
                  <div class="gauge-meta">
                    <div class="gauge-row"><span>Core PCM+Eng</span><strong class="mono">${coreQCount}</strong></div>
                    <div class="gauge-row"><span>Bifocal CS/EL</span><strong class="mono">${elecQCount}</strong></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <nav class="home-dock" aria-label="Quick stream switcher" data-liquid-ignore>
          <div class="home-dock-glass" aria-hidden="true"></div>
          <div class="home-dock-inner">
            <span class="dock-label">Streams</span>
            ${MANIFEST.streams.map((st, idx) => `<button type="button" class="dock-pill ${idx === 0 ? 'lime' : ''}" onclick="openStream('${st.id}','overview')">${escapeHtml(st.short)}</button>`).join('')}
            <button type="button" class="dock-pill" onclick="document.getElementById('subjectsDirectory')?.scrollIntoView({behavior:'smooth'})">Directory ↓</button>
          </div>
        </nav>

        <section class="subjects-section" id="subjectsDirectory">
          ${resumeHtml}

          <div class="group-head">
            <h2>Compulsory Core · Physics, Chemistry, Mathematics &amp; English</h2>
            <span>2022–2026 Revised MSBSHSE Official Papers</span>
          </div>
          <div class="subject-grid">
            ${core.map(renderStreamCard).join('')}
          </div>

          <div class="group-head">
            <h2>Bifocal Electives · 200-Mark Vocational Subjects</h2>
            <span>Strict stream separation · 2015–2026 Archive</span>
          </div>
          <div class="subject-grid">
            ${elective.map(renderStreamCard).join('')}
          </div>
        </section>
      </div>
    `;
    setTimeout(updateTabIndicators, 15);
    scheduleMathJax();
    mountHomeGlass();
  }

  window.setHeroTab = function (idx) {
    heroTabIdx = idx;
    heroDemoAnswer = null;
    const box = document.getElementById('heroDemoInner');
    if (box && typeof window._buildHeroDemoInner === 'function') {
      box.innerHTML = window._buildHeroDemoInner();
      setTimeout(updateTabIndicators, 10);
      return;
    }
    renderHome();
  };

  window.pickHeroOpt = function (idx) {
    heroDemoAnswer = idx;
    const box = document.getElementById('heroDemoInner');
    if (box && typeof window._buildHeroDemoInner === 'function') {
      box.innerHTML = window._buildHeroDemoInner();
      setTimeout(updateTabIndicators, 10);
      return;
    }
    renderHome();
  };

  function renderOverview() {
    const m = document.getElementById('main');
    const allQ = getStreamAllQs(ACTIVE_STREAM);
    const total = allQ.length;
    const mastered = allQ.filter(q => state.mastery[q.uid] === 'mastered').length;
    const review = allQ.filter(q => state.mastery[q.uid] === 'review').length;
    const repeated = allQ.filter(q => (q.repeat_count || 1) >= 2).length;
    const mcqs = allQ.filter(q => q.is_mcq && q.correct_idx >= 0);
    const mcqDone = mcqs.filter(q => state.attempts[q.uid] !== undefined);
    const mcqOk = mcqDone.filter(q => state.attempts[q.uid] === q.correct_idx).length;
    const pct = total ? Math.round(100 * mastered / total) : 0;

    let tablesHtml = '';
    for (const sk of Object.keys(ACTIVE_STREAM.subjects)) {
      const sub = ACTIVE_STREAM.subjects[sk];
      let rows = '';
      for (const ch of sub.meta) {
        const qs = sub.questions.filter(q => q.chapter_id === ch.id);
        const chRep = qs.filter(q => (q.repeat_count || 1) >= 2).length;
        const chMast = qs.filter(q => state.mastery[q.uid] === 'mastered').length;
        const p = qs.length ? Math.round(100 * chMast / qs.length) : 0;
        rows += `
          <tr data-nav="chapter" style="cursor:pointer" onclick="navTo('chapter','${sk}','${ch.id}')">
            <td><strong>${escapeHtml(ch.title)}</strong><div style="font-size:12px;color:var(--muted);margin-top:2px;">${escapeHtml(ch.roi || '')}</div></td>
            <td class="mono">${escapeHtml(ch.marks || '')}</td>
            <td class="mono">${qs.length} <span style="color:var(--warn);font-size:11.5px;">(${chRep} rep)</span></td>
            <td style="min-width:140px;">
              <div style="display:flex;align-items:center;gap:8px;">
                <div class="bar-track"><div class="bar-fill" style="width:${p}%"></div></div>
                <span class="mono" style="font-size:12px;width:44px;text-align:right;">${chMast}/${qs.length}</span>
              </div>
            </td>
          </tr>
        `;
      }
      tablesHtml += `
        <div class="panel">
          <h3>${escapeHtml(sub.title)} — Chapters &amp; Board Weightage</h3>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Chapter / Scoring ROI</th><th>Board Marks</th><th>PYQs (Repeats)</th><th>Progress</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      `;
    }

    let stratRows = (ACTIVE_STREAM.slotStrategy || []).map(s => `
      <tr>
        <td class="mono" style="font-weight:600;white-space:nowrap;">${escapeHtml(s.slot)}</td>
        <td>${escapeHtml(s.dist)}</td>
        <td style="color:var(--ink-2);">${escapeHtml(s.tip)}</td>
      </tr>
    `).join('');

    const subKeys = Object.keys(ACTIVE_STREAM.subjects);
    const quickBtns = subKeys.map(sk => {
      const sub = ACTIVE_STREAM.subjects[sk];
      return `<button class="btn primary" onclick="navTo('chapter','${sk}','${sub.meta[0].id}')">Drill ${escapeHtml(sub.code)} ${ICONS.arrow}</button>`;
    }).join('');

    m.innerHTML = `
      <div class="view-enter">
        <div class="topbar">
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="btn sm sidebar-expand-btn" onclick="toggleSidebarCollapse()" title="Expand sidebar">${ICONS.sidebar}</button>
            <div>
              <h1 class="page-title">${escapeHtml(ACTIVE_STREAM.name)} Workspace</h1>
              <div class="page-meta">${total} questions · ${ACTIVE_STREAM.papersCount} official papers (${escapeHtml(ACTIVE_STREAM.yearRange)}) · ${repeated} repeat flags</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            ${quickBtns}
            <button class="btn" onclick="navTo('mock')">Mock Paper</button>
          </div>
        </div>

        <div class="stat-row">
          <div class="stat-card"><div class="stat-label">Questions Solved</div><div class="stat-val">${mastered}/${total}</div><div class="stat-sub">${pct}% syllabus complete</div></div>
          <div class="stat-card"><div class="stat-label">MCQ Accuracy</div><div class="stat-val">${mcqDone.length ? Math.round(100 * mcqOk / mcqDone.length) + '%' : '—'}</div><div class="stat-sub">${mcqOk} / ${mcqDone.length} tested (${mcqs.length} total)</div></div>
          <div class="stat-card"><div class="stat-label">High-Repeat Pool</div><div class="stat-val">${repeated}</div><div class="stat-sub">Appeared 2+ times</div></div>
          <div class="stat-card"><div class="stat-label">Review Queue</div><div class="stat-val">${review}</div><div class="stat-sub">${Object.keys(state.notes).filter(id => id.startsWith(routeStream)).length} personal notes</div></div>
        </div>

        <div class="panel">
          <h3>Paper Slot Strategy (Weightage Tilt)</h3>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Slot</th><th>Distribution</th><th>Prep Shortcut</th></tr></thead>
              <tbody>${stratRows}</tbody>
            </table>
          </div>
        </div>

        ${tablesHtml}

        <div class="panel" style="display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:12px;">
          <div>
            <strong>Cloud Sync &amp; Local Export</strong>
            <div style="font-size:13px;color:var(--muted);">Sign in with Supabase Cloud Sync across devices or save a JSON backup file.</div>
          </div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button class="btn sm accent" onclick="openSyncModal()">${ICONS.cloud} Cloud Sync</button>
            <button class="btn sm" onclick="exportProgress()">${ICONS.download} Export JSON</button>
            <label class="btn sm" style="cursor:pointer;">${ICONS.upload} Import JSON<input type="file" accept=".json" onchange="importProgress(event)" style="display:none;"></label>
            <button class="btn sm" onclick="resetAllProgress()" style="color:var(--neg);">${confirmResetArmed ? 'Click again to wipe' : 'Reset Data'}</button>
          </div>
        </div>
      </div>
    `;
  }

  function renderQuestionCard(q, idx, totalInList, isMock) {
    const uid = q.uid;
    const mast = isMock ? '' : (state.mastery[uid] || '');
    const cardCls = ['q-card'];
    cardCls.push(streamAllowsMathJax(routeStream) ? 'tex2jax_process' : 'tex2jax_ignore');
    if (mast === 'mastered') cardCls.push('state-mastered');
    if (mast === 'review') cardCls.push('state-review');
    if (idx === focusedIdx) cardCls.push('focused');

    const attMap = isMock ? state.mockAttempts : state.attempts;
    const revMap = isMock ? state.mockRevealed : state.revealed;
    const att = attMap[uid];
    const isRev = !!revMap[uid];

    let mcqHtml = '';
    if (q.is_mcq && q.options && q.options.length > 0) {
      const opts = q.options.map((o, oi) => {
        const optBody = (q.options_html && q.options_html[oi]) ? q.options_html[oi] : escapeHtml(o);
        let cls = 'mcq-opt';
        if (att !== undefined) {
          if (q.correct_idx >= 0) {
            if (oi === q.correct_idx) cls += ' correct';
            else if (oi === att) cls += ' wrong';
          } else if (oi === att) {
            cls += ' selected';
          }
        }
        return `<button class="${cls}" onclick="pickMcq('${uid}',${oi},${isMock ? 1 : 0})"><span class="kbd">${oi + 1}</span><span class="opt-body">${optBody}</span></button>`;
      }).join('');

      let fb = '';
      if (att !== undefined) {
        if (q.correct_idx >= 0) {
          fb = att === q.correct_idx
            ? `<div class="mcq-feedback ok">Correct — Option ${q.correct_idx + 1} matches official key.</div>`
            : `<div class="mcq-feedback bad">Incorrect — Official key is Option ${q.correct_idx + 1}. Marked for review.</div>`;
        } else {
          fb = `<div class="mcq-feedback">Option ${att + 1} selected. Open full solution below to verify.</div>`;
        }
      }
      mcqHtml = `<div class="mcq-grid">${opts}</div>${fb}`;
    }

    const repTag = (!isMock && (q.repeat_count || 1) >= 2)
      ? `<span class="tag repeat">Asked ${q.repeat_count}x · ${escapeHtml((q.repeat_years || []).join(', '))}</span>`
      : '';

    const noteVal = state.notes[uid] || '';
    const notePreview = !isMock && noteVal ? `<div class="note-box"><strong>Personal Note:</strong> ${escapeHtml(noteVal)}</div>` : '';
    const editorOpen = !isMock && openEditors.has(uid);
    const noteEditor = editorOpen ? `
      <div class="note-editor">
        <textarea id="note-ta-${uid}" placeholder="Save the crisp board format, mnemonic, or textbook keywords...">${escapeHtml(noteVal)}</textarea>
        <div style="display:flex;gap:8px;justify-content:flex-end;">
          <button class="btn sm" onclick="toggleNote('${uid}')">Cancel</button>
          <button class="btn sm primary" onclick="saveNote('${uid}')">Save Note</button>
        </div>
      </div>
    ` : '';

    const confHtml = isMock ? '' : `
      <div class="conf-group">
        <button class="btn sm conf-btn ${mast === 'review' ? 'active-neg' : ''}" onclick="setMastery('${uid}','review')">Review Again</button>
        <button class="btn sm conf-btn ${mast === 'mastered' ? 'active-pos' : ''}" onclick="setMastery('${uid}','mastered')">Mastered</button>
      </div>
    `;

    const srcName = escapeHtml(q.source_name || 'Shaalaa');
    const marksLabel = Number.isInteger(q.marks) ? q.marks + 'M' : q.marks + 'M';

    return `
      <article class="${cardCls.join(' ')}" id="q-${uid}" data-idx="${idx}" onclick="focusCard(${idx})">
        <div class="q-head">
          <div class="q-meta">
            <span class="tag">${escapeHtml(q.paper_label || q.year)}</span>
            <span class="tag mono">${escapeHtml(q.q_num)}</span>
            <span class="tag marks">${marksLabel}</span>
            ${repTag}
          </div>
          ${confHtml}
        </div>
        <div class="q-prompt">${q.prompt_html || `<p>${escapeHtml(q.prompt_text)}</p>`}</div>
        ${mcqHtml}
        ${notePreview}
        ${noteEditor}
        <div class="q-actions">
          <div style="display:flex;gap:8px;align-items:center;">
            <button class="btn sm ${isRev ? '' : 'accent'}" onclick="toggleReveal('${uid}',${isMock ? 1 : 0})">
              ${isRev ? 'Hide Solution' : 'Reveal Solution'} <span class="kbd" style="border-color:rgba(255,255,255,0.2);">R</span>
            </button>
            ${isMock ? '' : `<button class="btn sm" onclick="toggleNote('${uid}')">${noteVal ? 'Edit Note' : 'My Note'}</button>`}
          </div>
          <a class="u-link" href="${escapeHtml(q.solution_url || q.paper_url)}" target="_blank" rel="noopener" style="font-size:12.5px;color:var(--muted);">Source (${srcName})</a>
        </div>
        <div class="sol-box ${isRev ? '' : 'hidden'}">
          <div class="sol-label">${q.correct_idx >= 0 ? 'Option ' + (q.correct_idx + 1) + ' · Solution' : 'Board Solution'}</div>
          ${q.solution_html || `<p>No inline solution cached. Check the source link.</p>`}
        </div>
      </article>
    `;
  }

  function renderChapter() {
    const m = document.getElementById('main');
    const sub = ACTIVE_STREAM.subjects[currentSubj];
    const ch = sub.meta.find(x => x.id === currentChapter) || sub.meta[0];
    const chQsAll = sub.questions.filter(q => q.chapter_id === ch.id);
    const years = Array.from(new Set(chQsAll.map(q => q.year)));
    const filtered = getFilteredQuestions(currentSubj, ch.id);
    const mast = chQsAll.filter(q => state.mastery[q.uid] === 'mastered').length;

    const yearOpts = `<option value="all">All Papers (${years.length})</option>` +
      years.map(y => `<option value="${escapeHtml(y)}" ${filters.year === y ? 'selected' : ''}>${escapeHtml(y)}</option>`).join('');

    const secOpts = `<option value="all">All Question Types</option>` +
      ACTIVE_STREAM.sections.map(([sid, sTitle]) => `<option value="${sid}" ${filters.section === sid ? 'selected' : ''}>${escapeHtml(sTitle)}</option>`).join('');

    let bodyHtml = '';
    if (!filtered.length) {
      bodyHtml = `<div class="panel" style="text-align:center;padding:36px;">No questions match these filters. <button class="btn sm" onclick="clearFilters()" style="margin-left:8px;">Reset Filters</button></div>`;
    } else {
      let globalIdx = 0;
      for (const [sid, sTitle, sHint] of ACTIVE_STREAM.sections) {
        const sQs = filtered.filter(q => q.section_id === sid);
        if (!sQs.length) continue;
        bodyHtml += `<div class="sec-head"><span>${escapeHtml(sTitle)} <span style="color:var(--muted);font-weight:400;">· ${sQs.length} Qs</span></span><span class="mono" style="font-size:12px;color:var(--muted);">${escapeHtml(sHint)}</span></div>`;
        for (const q of sQs) {
          bodyHtml += renderQuestionCard(q, globalIdx++, filtered.length, false);
        }
      }
      // Catch-all for any unmapped section
      const knownIds = new Set(ACTIVE_STREAM.sections.map(s => s[0]));
      const extraQs = filtered.filter(q => !knownIds.has(q.section_id));
      if (extraQs.length) {
        bodyHtml += `<div class="sec-head"><span>Additional Questions</span><span class="mono" style="font-size:12px;color:var(--muted);">${extraQs.length} Qs</span></div>`;
        for (const q of extraQs) {
          bodyHtml += renderQuestionCard(q, globalIdx++, filtered.length, false);
        }
      }
    }

    m.innerHTML = `
      <div class="view-enter">
        <div class="topbar">
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="btn sm sidebar-expand-btn" onclick="toggleSidebarCollapse()" title="Expand sidebar">${ICONS.sidebar}</button>
            <div>
              <h1 class="page-title">${escapeHtml(ch.title)}</h1>
              <div class="page-meta">${escapeHtml(sub.code)} · ${escapeHtml(ch.marks || '')} · ${mast}/${chQsAll.length} mastered · <span class="mono">J/K</span> next · <span class="mono">R</span> reveal · <span class="mono">1-4</span> MCQ · <span class="mono">M</span> mastered</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;">
            <button class="btn sm" onclick="navTo('overview')">Overview</button>
            <button class="btn sm" onclick="resetChapterReveal('${currentSubj}','${ch.id}')">Hide All Answers</button>
          </div>
        </div>

        <div class="toolbar">
          <input type="text" placeholder="Search questions, equations, years..." value="${escapeHtml(filters.search)}" oninput="setChapterFilter('search', this.value)" />
          <select onchange="setChapterFilter('year', this.value)">${yearOpts}</select>
          <select onchange="setChapterFilter('section', this.value)">${secOpts}</select>
          <select onchange="setChapterFilter('status', this.value)">
            <option value="all" ${filters.status === 'all' ? 'selected' : ''}>All Progress</option>
            <option value="unattempted" ${filters.status === 'unattempted' ? 'selected' : ''}>Unattempted</option>
            <option value="review" ${filters.status === 'review' ? 'selected' : ''}>Review Again</option>
            <option value="mastered" ${filters.status === 'mastered' ? 'selected' : ''}>Mastered</option>
          </select>
          <button class="btn ${filters.repeatsOnly ? 'active-filter' : ''}" onclick="toggleChapterFilter('repeatsOnly')">Repeats 2x+</button>
          <button class="btn ${filters.mcqOnly ? 'active-filter' : ''}" onclick="toggleChapterFilter('mcqOnly')">MCQs Only</button>
        </div>

        <div id="chapterBody">${bodyHtml}</div>
      </div>
    `;
    scheduleMathJax();
  }

  window.renderChapterBody = function () {
    const chBody = document.getElementById('chapterBody');
    if (!chBody) return;
    const sub = ACTIVE_STREAM.subjects[currentSubj];
    const ch = sub.meta.find(x => x.id === currentChapter) || sub.meta[0];
    const filtered = getFilteredQuestions(currentSubj, ch.id);
    if (!filtered.length) {
      chBody.innerHTML = `<div class="panel" style="text-align:center;padding:36px;">No questions match these filters. <button class="btn sm" onclick="clearFilters()" style="margin-left:8px;">Reset Filters</button></div>`;
      return;
    }
    let html = '';
    let globalIdx = 0;
    for (const [sid, sTitle, sHint] of ACTIVE_STREAM.sections) {
      const sQs = filtered.filter(q => q.section_id === sid);
      if (!sQs.length) continue;
      html += `<div class="sec-head"><span>${escapeHtml(sTitle)} <span style="color:var(--muted);font-weight:400;">· ${sQs.length} Qs</span></span><span class="mono" style="font-size:12px;color:var(--muted);">${escapeHtml(sHint)}</span></div>`;
      for (const q of sQs) html += renderQuestionCard(q, globalIdx++, filtered.length, false);
    }
    chBody.innerHTML = html;
    scheduleMathJax();
  };

  function renderMock() {
    const m = document.getElementById('main');
    const subKeys = Object.keys(ACTIVE_STREAM.subjects);
    if (!ACTIVE_STREAM.subjects[currentMockSubj]) currentMockSubj = subKeys[0];
    const papers = getActivePaperList(currentMockSubj);
    if (!papers.some(p => p.year === currentMockYear)) currentMockYear = papers[0]?.year || '';

    const sub = ACTIVE_STREAM.subjects[currentMockSubj];
    const paperQs = sub.questions
      .filter(q => q.year === currentMockYear)
      .slice()
      .sort((a, b) => extractQSortKey(a.q_num).localeCompare(extractQSortKey(b.q_num)));

    const cfg = getMockConfig(routeStream);
    const hrs = String(Math.floor(mockTimer.seconds / 3600)).padStart(2, '0');
    const mins = String(Math.floor((mockTimer.seconds % 3600) / 60)).padStart(2, '0');
    const secs = String(mockTimer.seconds % 60).padStart(2, '0');

    const mcqsInPaper = paperQs.filter(q => q.is_mcq && q.correct_idx >= 0);
    const mcqTried = mcqsInPaper.filter(q => state.mockAttempts[q.uid] !== undefined);
    const mcqScore = mcqTried.filter(q => state.mockAttempts[q.uid] === q.correct_idx).length;
    const revCount = paperQs.filter(q => !!state.mockRevealed[q.uid]).length;

    const subSwitch = subKeys.length > 1
      ? `<select onchange="setMockSubj(this.value)">${subKeys.map(sk => `<option value="${sk}" ${currentMockSubj === sk ? 'selected' : ''}>${escapeHtml(ACTIVE_STREAM.subjects[sk].code)} — ${escapeHtml(ACTIVE_STREAM.subjects[sk].title)}</option>`).join('')}</select>`
      : '';

    m.innerHTML = `
      <div class="view-enter">
        <div class="topbar">
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="btn sm sidebar-expand-btn" onclick="toggleSidebarCollapse()">${ICONS.sidebar}</button>
            <div>
              <h1 class="page-title">Mock Paper · ${escapeHtml(sub.code)} (${escapeHtml(currentMockYear)})</h1>
              <div class="page-meta">${paperQs.length} questions in paper order · ${escapeHtml(cfg.marks)} · Isolated from chapter progress</div>
            </div>
          </div>
          <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
            <div class="timer-pill">
              <span>${hrs}:${mins}:${secs}</span>
              <button class="btn sm" onclick="toggleTimer()" style="height:24px;padding:0 8px;">${mockTimer.running ? 'Pause' : 'Start'}</button>
              <button class="btn sm" onclick="resetTimer()" style="height:24px;padding:0 8px;">Reset</button>
            </div>
            <button class="btn sm" onclick="clearCurrentMock()">Fresh Start</button>
          </div>
        </div>

        <div class="toolbar">
          ${subSwitch}
          <select onchange="setMockYear(this.value)">
            ${papers.map(p => `<option value="${escapeHtml(p.year)}" ${currentMockYear === p.year ? 'selected' : ''}>${escapeHtml(p.year)}</option>`).join('')}
          </select>
          <span class="tag">MCQ Score: ${mcqScore}/${mcqsInPaper.length}</span>
          <span class="tag">Solutions Revealed: ${revCount}/${paperQs.length}</span>
          ${papers.find(p => p.year === currentMockYear)?.url ? `<a class="btn sm" href="${escapeHtml(papers.find(p => p.year === currentMockYear).url)}" target="_blank" rel="noopener">Original Paper PDF/Web</a>` : ''}
        </div>

        ${paperQs.map((q, idx) => renderQuestionCard(q, idx, paperQs.length, true)).join('')}
      </div>
    `;
    scheduleMathJax();
  }

  function renderReview() {
    const m = document.getElementById('main');
    const allQ = getStreamAllQs(ACTIVE_STREAM);
    const list = allQ.filter(q => state.mastery[q.uid] === 'review');

    m.innerHTML = `
      <div class="view-enter">
        <div class="topbar">
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="btn sm sidebar-expand-btn" onclick="toggleSidebarCollapse()">${ICONS.sidebar}</button>
            <div>
              <h1 class="page-title">${escapeHtml(ACTIVE_STREAM.name)} Review Queue</h1>
              <div class="page-meta">${list.length} flagged questions · Strictly scoped to ${escapeHtml(ACTIVE_STREAM.name)}</div>
            </div>
          </div>
        </div>
        ${list.length ? list.map((q, idx) => renderQuestionCard(q, idx, list.length, false)).join('') : `<div class="panel" style="text-align:center;padding:42px;color:var(--muted);">Your ${escapeHtml(ACTIVE_STREAM.name)} review queue is empty. Any wrong MCQ or question marked "Review Again" appears here.</div>`}
      </div>
    `;
    scheduleMathJax();
  }

  function renderArchive() {
    const m = document.getElementById('main');
    const rows = (ACTIVE_STREAM.archiveRows || []).map(r => `
      <tr>
        <td><strong>${escapeHtml(r.paper)}</strong></td>
        <td class="mono">${escapeHtml(r.year)}</td>
        <td style="color:var(--ink-2);">${escapeHtml(r.format)}</td>
        <td><a class="btn sm" href="${escapeHtml(r.url)}" target="_blank" rel="noopener">Open Source</a></td>
      </tr>
    `).join('');

    m.innerHTML = `
      <div class="view-enter">
        <div class="topbar">
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="btn sm sidebar-expand-btn" onclick="toggleSidebarCollapse()">${ICONS.sidebar}</button>
            <div>
              <h1 class="page-title">${escapeHtml(ACTIVE_STREAM.archiveTitle || 'Syllabus & Source Archive')}</h1>
              <div class="page-meta">${escapeHtml(ACTIVE_STREAM.archiveSub || '')}</div>
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>Source</th><th>Years / Code</th><th>Details</th><th>Link</th></tr></thead>
              <tbody>${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    `;
  }

  function updateMobileBottomNav() {
    const nav = document.getElementById('appBottomNav');
    if (!nav) return;
    if (view === 'home' || !routeStream || !ACTIVE_STREAM) {
      nav.innerHTML = '';
      return;
    }
    nav.innerHTML = `
      <button type="button" class="app-nav-item ${view === 'overview' ? 'active' : ''}" onclick="navTo('overview')">Overview</button>
      <button type="button" class="app-nav-item ${view === 'chapter' ? 'active' : ''}" onclick="navTo('chapter','${escapeHtml(currentSubj)}','${escapeHtml(currentChapter)}')">Drill</button>
      <button type="button" class="app-nav-item ${view === 'mock' ? 'active' : ''}" onclick="navTo('mock')">Mock</button>
      <button type="button" class="app-nav-item ${view === 'review' ? 'active' : ''}" onclick="navTo('review')">Review</button>
      <button type="button" class="app-nav-item" onclick="toggleDrawer()">Chapters</button>
    `;
  }

  function render() {
    const shell = document.getElementById('shell');
    if (view === 'home' || !routeStream) {
      shell.classList.add('is-home');
      renderSidebar();
      renderHome();
      updateMobileBottomNav();
      return;
    }
    destroyHomeGlass();
    shell.classList.remove('is-home');
    renderSidebar();
    updateMobileBottomNav();
    if (!ACTIVE_STREAM) return;
    if (view === 'overview') renderOverview();
    else if (view === 'chapter') renderChapter();
    else if (view === 'mock') renderMock();
    else if (view === 'review') renderReview();
    else if (view === 'archive') renderArchive();
  }

  // User Actions
  window.openStream = openStream;
  window.goHome = goHome;
  window.navTo = navTo;
  window.toggleSidebarCollapse = toggleSidebarCollapse;
  window.toggleDrawer = toggleDrawer;
  window.closeDrawer = closeDrawer;

  window.setTheme = function (t) {
    applyTheme(t);
    saveState();
    render();
  };

  window.pickMcq = function (uid, optIdx, isMock) {
    const q = getStreamAllQs(ACTIVE_STREAM).find(x => x.uid === uid);
    if (!q) return;
    if (isMock) {
      state.mockAttempts[uid] = optIdx;
    } else {
      state.attempts[uid] = optIdx;
      if (q.correct_idx >= 0) {
        state.mastery[uid] = optIdx === q.correct_idx ? 'mastered' : 'review';
      }
    }
    saveState();
    render();
  };

  window.toggleReveal = function (uid, isMock) {
    if (isMock) {
      state.mockRevealed[uid] = !state.mockRevealed[uid];
    } else {
      state.revealed[uid] = !state.revealed[uid];
    }
    saveState();
    render();
  };

  window.setMastery = function (uid, val) {
    state.mastery[uid] = state.mastery[uid] === val ? '' : val;
    if (!state.mastery[uid]) delete state.mastery[uid];
    saveState();
    render();
  };

  window.toggleNote = function (uid) {
    if (openEditors.has(uid)) openEditors.delete(uid);
    else openEditors.add(uid);
    render();
    setTimeout(() => {
      const ta = document.getElementById('note-ta-' + uid);
      if (ta) ta.focus();
    }, 20);
  };

  window.saveNote = function (uid) {
    const ta = document.getElementById('note-ta-' + uid);
    if (!ta) return;
    const v = ta.value.trim();
    if (v) state.notes[uid] = v;
    else delete state.notes[uid];
    openEditors.delete(uid);
    saveState();
    render();
    showToast('Personal note saved.', 'ok');
  };

  window.focusCard = function (idx) {
    focusedIdx = idx;
  };

  window.setChapterFilter = function (key, val) {
    filters[key] = val;
    if (key === 'search') renderChapterBody();
    else render();
  };

  window.toggleChapterFilter = function (key) {
    filters[key] = !filters[key];
    render();
  };

  window.setMockSubj = function (val) {
    currentMockSubj = val;
    currentMockYear = '';
    render();
  };

  window.setMockYear = function (val) {
    currentMockYear = val;
    render();
  };

  window.clearFilters = function () {
    filters.search = '';
    filters.year = 'all';
    filters.section = 'all';
    filters.status = 'all';
    filters.repeatsOnly = false;
    filters.mcqOnly = false;
    render();
  };

  window.resetChapterReveal = function (sk, chId) {
    const sub = ACTIVE_STREAM.subjects[sk];
    if (!sub) return;
    for (const q of sub.questions) {
      if (q.chapter_id === chId) delete state.revealed[q.uid];
    }
    saveState();
    render();
    showToast('Answers hidden for this chapter.', 'ok');
  };

  window.clearCurrentMock = function () {
    const sub = ACTIVE_STREAM.subjects[currentMockSubj];
    if (!sub) return;
    for (const q of sub.questions) {
      if (q.year === currentMockYear) {
        delete state.mockAttempts[q.uid];
        delete state.mockRevealed[q.uid];
      }
    }
    saveState();
    render();
    showToast('Mock paper cleared for a fresh attempt.', 'ok');
  };

  window.toggleTimer = function () {
    if (mockTimer.running) {
      clearInterval(mockTimer.intervalId);
      mockTimer.running = false;
      render();
      return;
    }
    mockTimer.running = true;
    mockTimer.intervalId = setInterval(() => {
      if (mockTimer.seconds > 0) mockTimer.seconds--;
      else { clearInterval(mockTimer.intervalId); mockTimer.running = false; }
      const pill = document.querySelector('.timer-pill span');
      if (pill) {
        const hrs = String(Math.floor(mockTimer.seconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((mockTimer.seconds % 3600) / 60)).padStart(2, '0');
        const secs = String(mockTimer.seconds % 60).padStart(2, '0');
        pill.textContent = `${hrs}:${mins}:${secs}`;
      }
    }, 1000);
    render();
  };

  window.resetTimer = function () {
    clearInterval(mockTimer.intervalId);
    mockTimer.running = false;
    mockTimer.seconds = getMockConfig(routeStream).secs;
    render();
  };

  window.exportProgress = function () {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'boarddeck-hsc-backup.json';
    a.click();
    showToast('Backup JSON downloaded.', 'ok');
  };

  window.importProgress = function (evt) {
    const f = evt.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        state = { ...loadState(), ...parsed };
        applyTheme(state.theme);
        saveState();
        render();
        showToast('Backup restored successfully.', 'ok');
      } catch (e) {
        showToast('Could not read backup JSON.', 'err');
      }
    };
    reader.readAsText(f);
  };

  window.resetAllProgress = function () {
    if (!confirmResetArmed) {
      confirmResetArmed = true;
      render();
      setTimeout(() => { confirmResetArmed = false; render(); }, 4000);
      return;
    }
    confirmResetArmed = false;
    localStorage.removeItem(STORAGE_KEY);
    state = loadState();
    applyTheme(state.theme);
    saveState();
    render();
    showToast('All local progress cleared.', 'ok');
  };

  // Cloud Sync Modal
  window.openSyncModal = function () {
    document.getElementById('syncModalBackdrop').classList.add('open');
    if (window.BoardDeckSync && window.BoardDeckSync.refreshProviders) {
      window.BoardDeckSync.refreshProviders();
    }
    renderSyncModal();
  };

  window.closeSyncModal = function () {
    document.getElementById('syncModalBackdrop').classList.remove('open');
  };

  function renderSyncModal() {
    const body = document.getElementById('syncModalBody');
    const st = window.BoardDeckSync ? window.BoardDeckSync.getStatus() : syncStatus;

    if (st.user) {
      body.innerHTML = `
        <div class="panel" style="margin-bottom:14px;padding:14px 16px;">
          <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
            <div>
              <div style="font-size:12px;color:var(--muted);">Signed in account</div>
              <div style="font-weight:600;">${escapeHtml(st.user.email)}</div>
            </div>
            <span class="tag" style="background:var(--pos-soft);color:var(--pos);border-color:var(--pos);">${escapeHtml(st.label)}</span>
          </div>
          ${st.lastSyncedAt ? `<div style="font-size:12px;color:var(--muted);margin-top:8px;">Last synced at ${escapeHtml(st.lastSyncedAt)}</div>` : ''}
          ${st.error ? `<div style="font-size:12px;color:var(--neg);margin-top:8px;">${escapeHtml(st.error)}</div>` : ''}
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;justify-content:space-between;">
          <button class="btn primary" onclick="handleSyncNow()">Sync Now</button>
          <button class="btn" onclick="handleSignOut()" style="color:var(--neg);">Sign Out</button>
        </div>
      `;
      return;
    }

    const googleReady = !(st.providers && st.providers.google === false);
    const emailReady = !(st.providers && st.providers.email === false);

    const googleBlock = `
      <button type="button" class="oauth-btn ${googleReady ? '' : 'is-disabled'}" style="height:44px;" onclick="handleGoogleSignIn()">
        <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        <span>${googleReady ? 'Continue with Google' : 'Google Sign-In unavailable yet'}</span>
      </button>
    `;

    const emailBlock = emailReady ? `
      <div class="auth-divider"><span>or with email</span></div>
      <div class="seg-tabs" style="margin-bottom:14px;" role="tablist">
        <div class="seg-ind"></div>
        <button class="seg-tab" role="tab" aria-selected="${syncModeTab === 'signin'}" onclick="syncModeTab='signin';renderSyncModal();">Sign In</button>
        <button class="seg-tab" role="tab" aria-selected="${syncModeTab === 'signup'}" onclick="syncModeTab='signup';renderSyncModal();">Create Account</button>
        <button class="seg-tab" role="tab" aria-selected="${syncModeTab === 'magic'}" onclick="syncModeTab='magic';renderSyncModal();">Magic Link</button>
      </div>
      <div class="field-group">
        <label for="syncEmail">Email address</label>
        <input id="syncEmail" type="email" placeholder="you@example.com" onkeydown="if(event.key==='Enter')handleAuthSubmit()" />
      </div>
      ${syncModeTab !== 'magic' ? `
      <div class="field-group">
        <div style="display:flex;align-items:center;justify-content:space-between;">
          <label for="syncPass">Password</label>
          ${syncModeTab === 'signin' ? `<button type="button" onclick="handleResetPassword()" style="background:none;border:none;color:var(--action);font-size:12px;cursor:pointer;padding:0;">Forgot password?</button>` : ''}
        </div>
        <input id="syncPass" type="password" placeholder="Minimum 6 characters" onkeydown="if(event.key==='Enter')handleAuthSubmit()" />
      </div>` : ''}
      <div id="syncInfoMsg" style="font-size:12.5px;color:var(--pos);margin-bottom:10px;display:none;"></div>
      <div id="syncErrMsg" style="font-size:12.5px;color:var(--neg);margin-bottom:10px;display:none;"></div>
      <button class="btn primary" style="width:100%;height:42px;" onclick="handleAuthSubmit()">
        ${syncModeTab === 'signin' ? 'Sign In' : syncModeTab === 'signup' ? 'Create Account' : 'Send Magic Link'}
      </button>
    ` : `
      <div id="syncErrMsg" style="font-size:12.5px;color:var(--neg);margin-top:10px;display:none;"></div>
      <div style="font-size:12px;color:var(--muted);margin-top:12px;text-align:center;">
        Your existing browser progress merges automatically when you sign in.
      </div>
    `;

    body.innerHTML = `
      <p style="margin:0 0 16px;font-size:13.5px;color:var(--ink-2);line-height:1.5;">
        Keep your solved papers, confidence flags, exam timers, and notes synced across desktop and phone.
      </p>
      ${googleBlock}
      ${emailBlock}
    `;
    setTimeout(updateTabIndicators, 15);
  }
  window.renderSyncModal = renderSyncModal;

  window.handleGoogleSignIn = async function () {
    const errBox = document.getElementById('syncErrMsg');
    if (errBox) errBox.style.display = 'none';
    try {
      await window.BoardDeckSync.signInGoogle();
    } catch (e) {
      if (errBox) {
        errBox.textContent = e.message || String(e);
        errBox.style.display = 'block';
      }
    }
  };

  window.handleAuthSubmit = async function () {
    const email = document.getElementById('syncEmail')?.value || '';
    const pass = document.getElementById('syncPass')?.value || '';
    const errBox = document.getElementById('syncErrMsg');
    const infoBox = document.getElementById('syncInfoMsg');
    if (errBox) errBox.style.display = 'none';
    if (infoBox) infoBox.style.display = 'none';
    try {
      if (syncModeTab === 'signin') {
        await window.BoardDeckSync.signInPassword(email, pass);
        showToast('Signed in & progress synced.', 'ok');
      } else if (syncModeTab === 'signup') {
        const res = await window.BoardDeckSync.signUpPassword(email, pass);
        if (res && res.needsConfirmation) {
          if (infoBox) {
            infoBox.textContent = 'Account created. Check your inbox to verify your email before signing in.';
            infoBox.style.display = 'block';
          }
          showToast('Confirmation email sent.', 'ok');
          return;
        }
        showToast('Account created & synced.', 'ok');
      } else {
        await window.BoardDeckSync.sendMagicLink(email);
        if (infoBox) {
          infoBox.textContent = 'Magic sign-in link sent to your inbox.';
          infoBox.style.display = 'block';
        }
        showToast('Magic link sent to your email.', 'ok');
        return;
      }
      renderSyncModal();
    } catch (e) {
      if (errBox) {
        errBox.textContent = e.message || String(e);
        errBox.style.display = 'block';
      }
    }
  };

  window.handleResetPassword = async function () {
    const email = (document.getElementById('syncEmail')?.value || '').trim();
    const errBox = document.getElementById('syncErrMsg');
    const infoBox = document.getElementById('syncInfoMsg');
    if (errBox) errBox.style.display = 'none';
    if (infoBox) infoBox.style.display = 'none';
    if (!email) {
      if (errBox) { errBox.textContent = 'Enter your email address first.'; errBox.style.display = 'block'; }
      return;
    }
    try {
      await window.BoardDeckSync.resetPassword(email);
      if (infoBox) { infoBox.textContent = 'Password reset link sent to ' + email; infoBox.style.display = 'block'; }
      showToast('Password reset email sent.', 'ok');
    } catch (e) {
      if (errBox) { errBox.textContent = e.message || String(e); errBox.style.display = 'block'; }
    }
  };

  window.handleSyncNow = async function () {
    await window.BoardDeckSync.pullAndMerge();
    showToast('Cloud progress synced.', 'ok');
    renderSyncModal();
  };

  window.handleSignOut = async function () {
    await window.BoardDeckSync.signOut();
    showToast('Signed out of cloud sync.', 'ok');
    renderSyncModal();
  };

  // Command Palette Modal (Ctrl+K)
  window.openCmdModal = function () {
    document.getElementById('cmdModalBackdrop').classList.add('open');
    const inp = document.getElementById('cmdInput');
    if (inp) { inp.value = ''; inp.focus(); }
    renderCmdResults();
  };

  window.closeCmdModal = function () {
    document.getElementById('cmdModalBackdrop').classList.remove('open');
  };

  window.renderCmdResults = function () {
    const q = (document.getElementById('cmdInput')?.value || '').trim().toLowerCase();
    const list = document.getElementById('cmdList');
    if (!list || !MANIFEST) return;

    const items = [];
    for (const s of MANIFEST.streams) {
      items.push({
        label: `${s.name} (${s.code})`,
        sub: `${s.questionCount} questions · Overview & Mock`,
        action: () => { closeCmdModal(); openStream(s.id, 'overview'); }
      });
    }
    if (ACTIVE_STREAM) {
      for (const sk of Object.keys(ACTIVE_STREAM.subjects)) {
        const sub = ACTIVE_STREAM.subjects[sk];
        for (const ch of sub.meta) {
          items.push({
            label: ch.title,
            sub: `${ACTIVE_STREAM.name} · ${sub.code} · ${ch.marks}`,
            action: () => { closeCmdModal(); navTo('chapter', sk, ch.id); }
          });
        }
      }
    }
    const hits = items.filter(it => !q || it.label.toLowerCase().includes(q) || it.sub.toLowerCase().includes(q)).slice(0, 14);
    list.innerHTML = hits.length
      ? hits.map((h, i) => `<button class="cmd-row" data-cmd="${i}"><span>${escapeHtml(h.label)}</span><span class="mono" style="font-size:11.5px;color:var(--muted);">${escapeHtml(h.sub)}</span></button>`).join('')
      : `<div style="padding:14px;text-align:center;color:var(--muted);font-size:13px;">No matching stream or chapter.</div>`;

    list.querySelectorAll('.cmd-row').forEach(btn => {
      btn.addEventListener('click', () => hits[parseInt(btn.dataset.cmd, 10)].action());
    });
  };

  // Global keyboard shortcuts
  document.addEventListener('keydown', e => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      openCmdModal();
      return;
    }
    if (e.key === 'Escape') {
      closeSyncModal();
      closeCmdModal();
      closeDrawer();
      return;
    }
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
    if (view !== 'chapter' && view !== 'mock' && view !== 'review') return;

    const cards = Array.from(document.querySelectorAll('.q-card'));
    if (!cards.length) return;
    if (e.key === 'j' || e.key === 'J') {
      focusedIdx = Math.min(cards.length - 1, focusedIdx + 1);
      cards.forEach((c, i) => c.classList.toggle('focused', i === focusedIdx));
      cards[focusedIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (e.key === 'k' || e.key === 'K') {
      focusedIdx = Math.max(0, focusedIdx <= 0 ? 0 : focusedIdx - 1);
      cards.forEach((c, i) => c.classList.toggle('focused', i === focusedIdx));
      cards[focusedIdx].scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (focusedIdx >= 0 && cards[focusedIdx]) {
      const uid = cards[focusedIdx].id.replace('q-', '');
      const isMock = view === 'mock';
      if (e.key === 'r' || e.key === 'R') toggleReveal(uid, isMock ? 1 : 0);
      else if (e.key === 'm' || e.key === 'M') { if (!isMock) setMastery(uid, 'mastered'); }
      else if (e.key === 'f' || e.key === 'F') { if (!isMock) setMastery(uid, 'review'); }
      else if (['1', '2', '3', '4'].includes(e.key)) {
        const opts = cards[focusedIdx].querySelectorAll('.mcq-opt');
        const idx = parseInt(e.key, 10) - 1;
        if (opts[idx]) pickMcq(uid, idx, isMock ? 1 : 0);
      }
    }
  });

  // Boot
  async function boot() {
    applyTheme(state.theme);
    try {
      const qs = new URLSearchParams(window.location.search);
      const hs = new URLSearchParams((window.location.hash || '').replace(/^#/, ''));
      const authErr = qs.get('error_description') || hs.get('error_description');
      if (authErr) {
        setTimeout(() => showToast(authErr, 'err'), 250);
        window.history.replaceState({}, document.title, window.location.pathname + '#home');
      }
    } catch (_) {}
    if (window.BoardDeckSync) {
      window.BoardDeckSync.onChange(st => {
        syncStatus = st;
        updateSaveStatusDom();
        if (document.getElementById('syncModalBackdrop')?.classList.contains('open')) {
          renderSyncModal();
        }
      });
      window.BoardDeckSync.init().catch(() => {});
    }

    try {
      const resp = await fetch('data/manifest.json');
      if (!resp.ok) throw new Error('Manifest load error');
      MANIFEST = await resp.json();
      window.addEventListener('hashchange', () => applyHash());
      await applyHash();
    } catch (err) {
      document.getElementById('main').innerHTML = `
        <div class="panel" style="margin-top:40px;text-align:center;">
          <h3>Unable to load BoardDeck data</h3>
          <p style="color:var(--muted);">Serve this folder over HTTP/HTTPS (e.g. Vercel or <code>python -m http.server</code>) so JSON datasets load properly.</p>
        </div>
      `;
    }
  }

  boot();
})();

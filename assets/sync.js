// BoardDeck Cloud Sync Layer (Supabase Auth + Postgres JSONB + Local Fallback)
(function () {
  const CFG_KEY = 'boarddeck_supabase_cfg';

  function getStoredConfig() {
    try {
      if (window.BOARDDECK_CONFIG && window.BOARDDECK_CONFIG.supabaseUrl && window.BOARDDECK_CONFIG.supabaseAnonKey) {
        return {
          url: window.BOARDDECK_CONFIG.supabaseUrl,
          anonKey: window.BOARDDECK_CONFIG.supabaseAnonKey,
          source: 'env'
        };
      }
      const raw = localStorage.getItem(CFG_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.url && parsed.anonKey) return { ...parsed, source: 'local' };
      }
    } catch (e) {}
    return null;
  }

  let client = null;
  let sessionUser = null;
  let syncStatus = { mode: 'guest', label: 'Local Only', email: null, lastSyncedAt: null, error: null };
  let pushTimer = null;
  let listeners = new Set();

  function emit() {
    listeners.forEach(fn => { try { fn({ ...syncStatus, user: sessionUser, configured: !!getStoredConfig() }); } catch (e) {} });
  }

  function mergeProgress(localState, cloudData) {
    if (!cloudData || typeof cloudData !== 'object') return localState;
    const merged = {
      conf: { ...(cloudData.conf || {}), ...(localState.conf || {}) },
      mcqPick: { ...(cloudData.mcqPick || {}), ...(localState.mcqPick || {}) },
      notes: { ...(cloudData.notes || {}), ...(localState.notes || {}) },
      lastView: localState.lastView || cloudData.lastView || null,
      lastFilters: localState.lastFilters || cloudData.lastFilters || null,
      lastStreamViews: { ...(cloudData.lastStreamViews || {}), ...(localState.lastStreamViews || {}) }
    };
    return merged;
  }

  async function initClient() {
    const cfg = getStoredConfig();
    if (!cfg) {
      client = null;
      sessionUser = null;
      syncStatus = { mode: 'guest', label: 'Guest · Local Only', email: null, lastSyncedAt: null, error: null };
      emit();
      return null;
    }
    try {
      if (!client) {
        const mod = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm');
        client = mod.createClient(cfg.url.trim(), cfg.anonKey.trim());
        client.auth.onAuthStateChange((_ev, session) => {
          sessionUser = session?.user || null;
          if (sessionUser) {
            syncStatus = { mode: 'connected', label: 'Cloud Ready', email: sessionUser.email, lastSyncedAt: syncStatus.lastSyncedAt, error: null };
            window.BoardDeckSync.pullAndMerge();
          } else {
            syncStatus = { mode: 'signed_out', label: 'Sign in to Sync', email: null, lastSyncedAt: null, error: null };
            emit();
          }
        });
      }
      const { data } = await client.auth.getSession();
      sessionUser = data?.session?.user || null;
      if (sessionUser) {
        syncStatus = { mode: 'connected', label: 'Synced', email: sessionUser.email, lastSyncedAt: null, error: null };
      } else {
        syncStatus = { mode: 'signed_out', label: 'Sign in to Sync', email: null, lastSyncedAt: null, error: null };
      }
      emit();
      return client;
    } catch (err) {
      syncStatus = { mode: 'error', label: 'Config Error', email: null, lastSyncedAt: null, error: String(err.message || err) };
      emit();
      return null;
    }
  }

  window.BoardDeckSync = {
    onChange(fn) { listeners.add(fn); return () => listeners.delete(fn); },
    getStatus() { return { ...syncStatus, user: sessionUser, configured: !!getStoredConfig(), config: getStoredConfig() }; },

    async init() {
      await initClient();
      if (sessionUser) await this.pullAndMerge();
    },

    async saveConfig(url, anonKey) {
      if (!url || !anonKey) {
        localStorage.removeItem(CFG_KEY);
      } else {
        localStorage.setItem(CFG_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
      }
      client = null;
      await this.init();
    },

    async signInPassword(email, password) {
      const c = await initClient();
      if (!c) throw new Error('Supabase is not configured yet.');
      const { data, error } = await c.auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      sessionUser = data.user;
      await this.pullAndMerge();
      return data;
    },

    async signUpPassword(email, password) {
      const c = await initClient();
      if (!c) throw new Error('Supabase is not configured yet.');
      const { data, error } = await c.auth.signUp({ email: email.trim(), password });
      if (error) throw error;
      sessionUser = data.user;
      if (sessionUser) await this.pullAndMerge();
      return data;
    },

    async sendMagicLink(email) {
      const c = await initClient();
      if (!c) throw new Error('Supabase is not configured yet.');
      const { error } = await c.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: window.location.origin + window.location.pathname }
      });
      if (error) throw error;
    },

    async signOut() {
      if (client) await client.auth.signOut();
      sessionUser = null;
      syncStatus = { mode: getStoredConfig() ? 'signed_out' : 'guest', label: getStoredConfig() ? 'Sign in to Sync' : 'Guest · Local Only', email: null, lastSyncedAt: null, error: null };
      emit();
    },

    async pullAndMerge() {
      if (!client || !sessionUser || !window.__getBoardDeckState) return;
      syncStatus = { ...syncStatus, mode: 'syncing', label: 'Syncing...', error: null };
      emit();
      try {
        const { data, error } = await client
          .from('boarddeck_profiles')
          .select('progress_data, updated_at')
          .eq('user_id', sessionUser.id)
          .maybeSingle();
        if (error) throw error;

        const localState = window.__getBoardDeckState();
        const merged = mergeProgress(localState, data?.progress_data || {});
        if (window.__applyMergedCloudState) window.__applyMergedCloudState(merged);

        const { error: upErr } = await client
          .from('boarddeck_profiles')
          .upsert({ user_id: sessionUser.id, email: sessionUser.email, progress_data: merged }, { onConflict: 'user_id' });
        if (upErr) throw upErr;

        syncStatus = { mode: 'connected', label: 'Cloud Synced', email: sessionUser.email, lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), error: null };
        emit();
      } catch (err) {
        syncStatus = { mode: 'error', label: 'Sync Error', email: sessionUser.email, lastSyncedAt: syncStatus.lastSyncedAt, error: String(err.message || err) };
        emit();
      }
    },

    schedulePush() {
      if (!client || !sessionUser || !window.__getBoardDeckState) return;
      clearTimeout(pushTimer);
      syncStatus = { ...syncStatus, mode: 'syncing', label: 'Saving...' };
      emit();
      pushTimer = setTimeout(async () => {
        try {
          const payload = window.__getBoardDeckState();
          const { error } = await client
            .from('boarddeck_profiles')
            .upsert({ user_id: sessionUser.id, email: sessionUser.email, progress_data: payload }, { onConflict: 'user_id' });
          if (error) throw error;
          syncStatus = { mode: 'connected', label: 'Cloud Synced', email: sessionUser.email, lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), error: null };
          emit();
        } catch (err) {
          syncStatus = { mode: 'error', label: 'Sync Error', email: sessionUser.email, lastSyncedAt: syncStatus.lastSyncedAt, error: String(err.message || err) };
          emit();
        }
      }, 900);
    }
  };
})();

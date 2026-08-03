import { showToast } from '../utils/storage.js';
import { getUser } from '../pages/auth.js';
import { getActiveProfile, DEFAULT_AVATARS } from '../utils/profiles.js';

export function getAppSettings() {
  const defaults = {
    quality: '4k',
    autoplayNext: true,
    autoplayPreviews: true,
    subtitleLang: 'en',
    subtitleStyle: 'yellow',
    audioLang: 'original',
    tmdbKey: localStorage.getItem('tmdb_api_key') || '',
    geminiKey: localStorage.getItem('gemini_api_key') || '',
    googleClientId: localStorage.getItem('google_client_id') || ''
  };
  try {
    return { ...defaults, ...JSON.parse(localStorage.getItem('cineverse_settings') || '{}') };
  } catch {
    return defaults;
  }
}

export function saveAppSettings(newSettings) {
  const current = getAppSettings();
  const updated = { ...current, ...newSettings };
  localStorage.setItem('cineverse_settings', JSON.stringify(updated));
  if (updated.tmdbKey !== undefined) localStorage.setItem('tmdb_api_key', updated.tmdbKey);
  if (updated.geminiKey !== undefined) localStorage.setItem('gemini_api_key', updated.geminiKey);
  if (updated.googleClientId !== undefined) localStorage.setItem('google_client_id', updated.googleClientId);
  return updated;
}

export function initSettings() {
  window.addEventListener('open-settings', openSettings);
}

export function openSettings(tab = 'account') {
  let container = document.getElementById('settings-modal-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'settings-modal-container';
    document.body.appendChild(container);
  }

  const user = getUser();
  const profile = getActiveProfile();
  const settings = getAppSettings();

  container.innerHTML = `
    <div class="settings-backdrop" id="settings-backdrop">
      <div class="settings-dialog">
        <!-- Sidebar Header / Tabs -->
        <div class="settings-header">
          <div class="settings-title-wrap">
            <span class="settings-title-icon">⚙️</span>
            <div>
              <h2 class="settings-title">CineVerse Settings</h2>
              <p class="settings-subtitle">Manage preferences, accounts & API connections</p>
            </div>
          </div>
          <button class="settings-close-btn" id="settings-close" title="Close Settings">✕</button>
        </div>

        <div class="settings-body">
          <div class="settings-nav">
            <button class="settings-nav-item active" data-tab="account">
              <span class="nav-icon">👤</span> Account & Profile
            </button>
            <button class="settings-nav-item" data-tab="playback">
              <span class="nav-icon">🎬</span> Playback & Quality
            </button>
            <button class="settings-nav-item" data-tab="api">
              <span class="nav-icon">🔑</span> API Keys & AI
            </button>
            <button class="settings-nav-item" data-tab="storage">
              <span class="nav-icon">🧹</span> App Data & Storage
            </button>
          </div>

          <div class="settings-content">
            <!-- TAB 1: ACCOUNT -->
            <div class="settings-tab-panel active" id="tab-account">
              <div class="settings-section">
                <h3 class="settings-section-title">Current Subscription</h3>
                <div class="plan-card">
                  <div class="plan-badge">PRO ULTRA 4K</div>
                  <div class="plan-info">
                    <h4>CineVerse Premium Account</h4>
                    <p>Unlimited Movies, TV Shows, Dolby Atmos audio & 4K Streaming</p>
                  </div>
                  <div class="plan-status">ACTIVE</div>
                </div>
              </div>

              <div class="settings-section">
                <h3 class="settings-section-title">User Information</h3>
                <div class="settings-field">
                  <label>Full Name</label>
                  <input type="text" id="settings-user-name" value="${user?.name || 'CineVerse User'}" placeholder="Enter name" />
                </div>
                <div class="settings-field">
                  <label>Email Address</label>
                  <input type="email" id="settings-user-email" value="${user?.email || 'user@cineverse.com'}" placeholder="Enter email" />
                </div>
                <div class="settings-field">
                  <label>Auth Provider</label>
                  <div class="settings-static-val">
                    ${user?.provider === 'google' 
                      ? `<span class="google-pill"><svg width="14" height="14" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg> Signed in with Google Direct</span>`
                      : '🔑 Standard Password Account'}
                  </div>
                </div>
              </div>
            </div>

            <!-- TAB 2: PLAYBACK & QUALITY -->
            <div class="settings-tab-panel" id="tab-playback">
              <div class="settings-section">
                <h3 class="settings-section-title">Video Quality</h3>
                <div class="quality-grid">
                  <label class="quality-option ${settings.quality === '4k' ? 'selected' : ''}">
                    <input type="radio" name="quality" value="4k" ${settings.quality === '4k' ? 'checked' : ''} />
                    <div class="option-content">
                      <span class="option-title">4K Ultra HD</span>
                      <span class="option-desc">Best video quality. Uses up to 7 GB per hour.</span>
                    </div>
                  </label>
                  <label class="quality-option ${settings.quality === '1080p' ? 'selected' : ''}">
                    <input type="radio" name="quality" value="1080p" ${settings.quality === '1080p' ? 'checked' : ''} />
                    <div class="option-content">
                      <span class="option-title">1080p Full HD</span>
                      <span class="option-desc">Great quality. Uses up to 3 GB per hour.</span>
                    </div>
                  </label>
                  <label class="quality-option ${settings.quality === '720p' ? 'selected' : ''}">
                    <input type="radio" name="quality" value="720p" ${settings.quality === '720p' ? 'checked' : ''} />
                    <div class="option-content">
                      <span class="option-title">720p HD</span>
                      <span class="option-desc">Standard HD quality. Uses up to 1 GB per hour.</span>
                    </div>
                  </label>
                </div>
              </div>

              <div class="settings-section">
                <h3 class="settings-section-title">Playback Controls</h3>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-title">Autoplay Next Episode</span>
                    <span class="toggle-desc">Automatically start playing the next episode in a series</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" id="setting-autoplay-next" ${settings.autoplayNext ? 'checked' : ''} />
                    <span class="slider round"></span>
                  </label>
                </div>
                <div class="toggle-row">
                  <div class="toggle-info">
                    <span class="toggle-title">Autoplay Previews on Hover</span>
                    <span class="toggle-desc">Show video trailers automatically while browsing cards</span>
                  </div>
                  <label class="switch">
                    <input type="checkbox" id="setting-autoplay-previews" ${settings.autoplayPreviews ? 'checked' : ''} />
                    <span class="slider round"></span>
                  </label>
                </div>
              </div>

              <div class="settings-section">
                <h3 class="settings-section-title">Subtitles & Audio</h3>
                <div class="settings-field">
                  <label>Default Subtitle Language</label>
                  <select id="setting-subtitle-lang" class="settings-select">
                    <option value="en" ${settings.subtitleLang === 'en' ? 'selected' : ''}>English</option>
                    <option value="es" ${settings.subtitleLang === 'es' ? 'selected' : ''}>Spanish</option>
                    <option value="fr" ${settings.subtitleLang === 'fr' ? 'selected' : ''}>French</option>
                    <option value="de" ${settings.subtitleLang === 'de' ? 'selected' : ''}>German</option>
                    <option value="off" ${settings.subtitleLang === 'off' ? 'selected' : ''}>Subtitles Off</option>
                  </select>
                </div>
              </div>
            </div>

            <!-- TAB 3: API KEYS & AI -->
            <div class="settings-tab-panel" id="tab-api">
              <div class="settings-section">
                <h3 class="settings-section-title">TMDB API Key</h3>
                <p class="settings-desc">Powers live movie metadata, trending titles, trailers & posters.</p>
                <div class="settings-field">
                  <div class="input-with-badge">
                    <input type="text" id="tmdb-key-input" value="${settings.tmdbKey}" placeholder="e.g. 1a2b3c4d5e..." />
                    <span class="api-status-badge ${settings.tmdbKey ? 'active' : ''}">
                      ${settings.tmdbKey ? '✓ Key Configured' : '⚠️ Missing Key'}
                    </span>
                  </div>
                  <a href="https://www.themoviedb.org/settings/api" target="_blank" class="api-link">🔑 Get Free TMDB API Key →</a>
                </div>
              </div>

              <div class="settings-section">
                <h3 class="settings-section-title">Gemini AI API Key</h3>
                <p class="settings-desc">Enables CineBot AI conversational recommendations & movie analysis.</p>
                <div class="settings-field">
                  <div class="input-with-badge">
                    <input type="text" id="gemini-key-input" value="${settings.geminiKey}" placeholder="e.g. AIzaSy..." />
                    <span class="api-status-badge ${settings.geminiKey ? 'active' : ''}">
                      ${settings.geminiKey ? '✓ AI Enabled' : '⚠️ Demo Mode'}
                    </span>
                  </div>
                  <a href="https://aistudio.google.com/apikey" target="_blank" class="api-link">🤖 Get Free Gemini API Key →</a>
                </div>
              </div>

              <div class="settings-section">
                <h3 class="settings-section-title">Google Sign-In Client ID</h3>
                <p class="settings-desc">Optional Google OAuth Client ID for real One-Tap Google authentication.</p>
                <div class="settings-field">
                  <input type="text" id="google-client-id-input" value="${settings.googleClientId}" placeholder="e.g. xxxxx.apps.googleusercontent.com" />
                </div>
              </div>

              <button type="button" class="btn btn-outline" id="btn-test-apis">🧪 Test API Connections</button>
            </div>

            <!-- TAB 4: APP DATA & STORAGE -->
            <div class="settings-tab-panel" id="tab-storage">
              <div class="settings-section">
                <h3 class="settings-section-title">Storage & History</h3>
                <div class="storage-action-row">
                  <div>
                    <strong>Clear Watch History</strong>
                    <p>Remove saved progress for watched titles</p>
                  </div>
                  <button class="btn btn-secondary btn-sm" id="btn-clear-history">Clear History</button>
                </div>
                <div class="storage-action-row">
                  <div>
                    <strong>Clear My List</strong>
                    <p>Empty your saved watchlist movies</p>
                  </div>
                  <button class="btn btn-secondary btn-sm" id="btn-clear-mylist">Clear Watchlist</button>
                </div>
                <div class="storage-action-row danger">
                  <div>
                    <strong>Reset All App Data</strong>
                    <p>Wipe local cache, preferences & saved logins</p>
                  </div>
                  <button class="btn btn-red btn-sm" id="btn-reset-all">Reset Everything</button>
                </div>
              </div>
            </div>

          </div>
        </div>

        <div class="settings-footer">
          <div class="settings-status" id="settings-status"></div>
          <div class="settings-footer-btns">
            <button class="btn btn-info" id="settings-cancel">Cancel</button>
            <button class="btn btn-red" id="settings-save-all">Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  `;

  attachSettingsListeners();
}

function attachSettingsListeners() {
  const backdrop = document.getElementById('settings-backdrop');
  const closeBtn = document.getElementById('settings-close');
  const cancelBtn = document.getElementById('settings-cancel');
  const saveBtn = document.getElementById('settings-save-all');

  // Close handlers
  backdrop?.addEventListener('click', e => { if (e.target === backdrop) closeSettings(); });
  closeBtn?.addEventListener('click', closeSettings);
  cancelBtn?.addEventListener('click', closeSettings);

  // Tab switcher
  document.querySelectorAll('.settings-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.settings-nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.settings-tab-panel').forEach(p => p.classList.remove('active'));
      
      btn.classList.add('active');
      const tabId = btn.dataset.tab;
      document.getElementById(`tab-${tabId}`)?.classList.add('active');
    });
  });

  // Quality selector UI sync
  document.querySelectorAll('input[name="quality"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      document.querySelectorAll('.quality-option').forEach(opt => opt.classList.remove('selected'));
      e.target.closest('.quality-option')?.classList.add('selected');
    });
  });

  // Test APIs button
  document.getElementById('btn-test-apis')?.addEventListener('click', async () => {
    const tmdbKey = document.getElementById('tmdb-key-input').value.trim();
    const geminiKey = document.getElementById('gemini-key-input').value.trim();
    const status = document.getElementById('settings-status');

    status.className = 'settings-status info';
    status.textContent = '⏳ Testing API connections...';

    let tmdbOk = false;
    if (tmdbKey) {
      try {
        const res = await fetch(`https://api.themoviedb.org/3/configuration?api_key=${tmdbKey}`);
        if (res.ok) tmdbOk = true;
      } catch {}
    }

    if (tmdbKey && tmdbOk) {
      status.className = 'settings-status success';
      status.textContent = '✅ TMDB API Key is valid and working!';
      showToast('TMDB API Connection Successful!', 'success');
    } else if (tmdbKey && !tmdbOk) {
      status.className = 'settings-status error';
      status.textContent = '❌ TMDB API Key test failed. Please check key.';
      showToast('TMDB API Key Invalid', 'error');
    } else {
      status.className = 'settings-status success';
      status.textContent = 'ℹ️ Default demo configuration ready.';
    }
  });

  // Storage actions
  document.getElementById('btn-clear-history')?.addEventListener('click', () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cv_continue_')) localStorage.removeItem(key);
    });
    showToast('Watch history cleared!', 'success');
  });

  document.getElementById('btn-clear-mylist')?.addEventListener('click', () => {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cv_mylist_') || key === 'netfilx_mylist') localStorage.removeItem(key);
    });
    showToast('My List cleared!', 'success');
  });

  document.getElementById('btn-reset-all')?.addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all data and sign out?')) {
      localStorage.clear();
      showToast('App data reset complete!', 'success');
      setTimeout(() => {
        window.location.hash = '#/login';
        window.location.reload();
      }, 800);
    }
  });

  // Save Settings
  saveBtn?.addEventListener('click', () => {
    const userName = document.getElementById('settings-user-name')?.value.trim();
    const userEmail = document.getElementById('settings-user-email')?.value.trim();

    // Update user if changed
    const user = getUser();
    if (user && (userName || userEmail)) {
      const updatedUser = { ...user };
      if (userName) updatedUser.name = userName;
      if (userEmail) updatedUser.email = userEmail;
      localStorage.setItem('cineverse_user', JSON.stringify(updatedUser));
    }

    const quality = document.querySelector('input[name="quality"]:checked')?.value || '4k';
    const autoplayNext = document.getElementById('setting-autoplay-next')?.checked ?? true;
    const autoplayPreviews = document.getElementById('setting-autoplay-previews')?.checked ?? true;
    const subtitleLang = document.getElementById('setting-subtitle-lang')?.value || 'en';
    const tmdbKey = document.getElementById('tmdb-key-input')?.value.trim() || '';
    const geminiKey = document.getElementById('gemini-key-input')?.value.trim() || '';
    const googleClientId = document.getElementById('google-client-id-input')?.value.trim() || '';

    saveAppSettings({
      quality,
      autoplayNext,
      autoplayPreviews,
      subtitleLang,
      tmdbKey,
      geminiKey,
      googleClientId
    });

    const status = document.getElementById('settings-status');
    status.className = 'settings-status success';
    status.textContent = '✓ Settings saved successfully!';
    showToast('Settings saved!', 'success');

    setTimeout(() => {
      closeSettings();
      window.location.reload();
    }, 600);
  });
}

export function closeSettings() {
  const container = document.getElementById('settings-modal-container');
  if (container) container.innerHTML = '';
}

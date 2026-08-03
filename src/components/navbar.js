import { navigate } from '../utils/router.js';
import { getUser, logout } from '../pages/auth.js';
import { getActiveProfile, getAvatar, clearActiveProfile } from '../utils/profiles.js';

export function renderNavbar() {
  const el = document.getElementById('navbar');
  const user = getUser();
  const profile = getActiveProfile();
  const avatarData = profile ? getAvatar(profile.avatarIndex) : null;
  const avatarEmoji = avatarData ? avatarData.emoji : (user?.avatar || 'U');
  const avatarBg = avatarData ? avatarData.color : 'linear-gradient(135deg,var(--red),var(--accent))';
  const profileName = profile?.name || user?.name || 'User';

  el.innerHTML = `
    <nav class="navbar" id="main-navbar">
      <div class="navbar-bg"></div>
      <a href="#/" class="nav-logo">CINEVERSE</a>
      <ul class="nav-links">
        <li><a href="#/" data-nav="home">Home</a></li>
        <li><a href="#/browse" data-nav="browse">Browse</a></li>
        <li><a href="#/mylist" data-nav="mylist">My List</a></li>
      </ul>
      <div class="nav-right">
        <button class="nav-search-btn" id="nav-search-btn" title="Search">🔍</button>
        <button class="nav-settings-btn" id="nav-settings-btn" title="Settings">⚙️</button>
        <div class="nav-profile-wrap" id="nav-profile-wrap">
          <div class="nav-profile" id="nav-profile-btn" style="background:${avatarBg}">${avatarEmoji}</div>
          <div class="nav-dropdown" id="nav-dropdown">
            <div class="nav-dropdown-user">
              <div class="nav-dropdown-avatar" style="background:${avatarBg}">${avatarEmoji}</div>
              <div>
                <div class="nav-dropdown-name">${profileName}</div>
                <div class="nav-dropdown-email">${user?.email || ''}</div>
              </div>
            </div>
            <hr class="nav-dropdown-divider" />
            <button class="nav-dropdown-item" id="nav-switch-profile">🔄 Switch Profile</button>
            <button class="nav-dropdown-item" id="nav-manage-profile">👤 Manage Profile</button>
            <button class="nav-dropdown-item" id="nav-settings-dropdown">⚙️ Settings</button>
            <hr class="nav-dropdown-divider" />
            <button class="nav-dropdown-item nav-dropdown-logout" id="nav-logout">🚪 Sign Out</button>
          </div>
        </div>
      </div>
    </nav>`;

  document.getElementById('nav-search-btn').addEventListener('click', () => navigate('/search'));
  document.getElementById('nav-settings-btn').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-settings'));
  });
  document.getElementById('nav-settings-dropdown').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('open-settings'));
    document.getElementById('nav-dropdown').classList.remove('open');
  });

  // Switch profile
  document.getElementById('nav-switch-profile').addEventListener('click', () => {
    clearActiveProfile();
    window.location.hash = '#/profiles';
    window.location.reload();
  });

  // Manage profile
  document.getElementById('nav-manage-profile')?.addEventListener('click', () => {
    document.getElementById('nav-dropdown')?.classList.remove('open');
    window.location.hash = '#/profiles';
  });

  // Profile dropdown
  document.getElementById('nav-profile-btn').addEventListener('click', (e) => {
    e.stopPropagation();
    document.getElementById('nav-dropdown').classList.toggle('open');
  });
  document.addEventListener('click', () => {
    document.getElementById('nav-dropdown')?.classList.remove('open');
  });

  // Logout
  document.getElementById('nav-logout').addEventListener('click', () => {
    clearActiveProfile();
    logout();
  });

  window.addEventListener('scroll', () => {
    document.getElementById('main-navbar')?.classList.toggle('scrolled', window.scrollY > 50);
  });
}

export function updateActiveNav(path) {
  document.querySelectorAll('.nav-links a').forEach(a => {
    const nav = a.dataset.nav;
    const isActive = (path === '/' && nav === 'home') || path === '/' + nav;
    a.classList.toggle('active', isActive);
  });
}

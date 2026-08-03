import '../style.css';
import { renderNavbar, updateActiveNav } from './components/navbar.js';
import { renderAIChat } from './components/ai-chat.js';
import { initSettings } from './components/settings.js';
import { onRouteChange, getRoute } from './utils/router.js';
import { renderBrowse } from './pages/browse.js';
import { renderSearch } from './pages/search.js';
import { renderMyList } from './pages/mylist.js';
import { renderPlayer } from './pages/player.js';
import { renderAuth, isLoggedIn } from './pages/auth.js';
import { renderProfiles } from './pages/profiles.js';
import { getActiveProfile, hasProfiles } from './utils/profiles.js';

function init() {
  onRouteChange(handleRoute);
  handleRoute(getRoute());
}

async function handleRoute(route) {
  const main = document.getElementById('main-content');
  const navbar = document.getElementById('navbar');
  const chatWidget = document.getElementById('ai-chat');
  const modal = document.getElementById('modal-container');

  // Auth routes — no login required
  if (route.path === '/login' || route.path === '/signup') {
    navbar.innerHTML = '';
    if (chatWidget) chatWidget.innerHTML = '';
    if (modal) modal.innerHTML = '';
    renderAuth(main, route.path === '/signup' ? 'signup' : 'login');
    return;
  }

  // Protected routes — require login
  if (!isLoggedIn()) {
    window.location.hash = '#/login';
    return;
  }

  // Profile selection gate
  if (route.path === '/profiles') {
    navbar.innerHTML = '';
    if (chatWidget) chatWidget.innerHTML = '';
    if (modal) modal.innerHTML = '';
    renderProfiles(main);
    return;
  }

  // If logged in but no active profile, redirect to profiles
  if (!getActiveProfile()) {
    window.location.hash = '#/profiles';
    return;
  }

  // Initialize app chrome once (navbar, chat, settings)
  if (!navbar.children.length) {
    renderNavbar();
    renderAIChat();
    initSettings();
  }

  updateActiveNav(route.path);
  window.scrollTo(0, 0);

  switch (route.path) {
    case '/settings':
      await renderBrowse(main);
      window.dispatchEvent(new CustomEvent('open-settings'));
      break;
    case '/search':
      renderSearch(main);
      break;
    case '/mylist':
      renderMyList(main);
      break;
    case '/watch':
      await renderPlayer(main, route.params);
      break;
    case '/':
    case '/browse':
    default:
      await renderBrowse(main);
      break;
  }
}

init();

import { getActiveProfile } from './profiles.js';

function getKey() {
  const profile = getActiveProfile();
  return profile ? `cv_mylist_${profile.id}` : 'netfilx_mylist';
}

export function getMyList() {
  try { return JSON.parse(localStorage.getItem(getKey())) || []; }
  catch { return []; }
}

export function addToList(item) {
  const list = getMyList();
  if (!list.find(i => i.id === item.id)) {
    list.push({ id: item.id, title: item.title || item.name, poster_path: item.poster_path, vote_average: item.vote_average, media_type: item.media_type || 'movie', release_date: item.release_date || item.first_air_date });
    localStorage.setItem(getKey(), JSON.stringify(list));
  }
}

export function removeFromList(id) {
  const list = getMyList().filter(i => i.id !== id);
  localStorage.setItem(getKey(), JSON.stringify(list));
}

export function isInList(id) {
  return getMyList().some(i => i.id === id);
}

export function showToast(msg, type = '') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 3000);
}

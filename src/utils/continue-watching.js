// Continue Watching — tracks watch progress per profile
import { getActiveProfile } from './profiles.js';

function getKey() {
  const profile = getActiveProfile();
  return profile ? `cv_continue_${profile.id}` : 'cv_continue_default';
}

export function getContinueWatching() {
  try { return JSON.parse(localStorage.getItem(getKey())) || []; }
  catch { return []; }
}

export function addToContinueWatching(item) {
  const list = getContinueWatching();
  // Remove if already exists (we'll re-add at front)
  const filtered = list.filter(i => !(i.id === item.id && i.type === item.type));
  filtered.unshift({
    id: item.id,
    type: item.type || 'movie',
    title: item.title || item.name,
    poster_path: item.poster_path,
    backdrop_path: item.backdrop_path,
    vote_average: item.vote_average,
    season: item.season || null,
    episode: item.episode || null,
    progress: item.progress || 0,
    lastWatched: Date.now()
  });
  // Keep max 20 items
  localStorage.setItem(getKey(), JSON.stringify(filtered.slice(0, 20)));
}

export function removeFromContinueWatching(id) {
  const list = getContinueWatching().filter(i => i.id !== id);
  localStorage.setItem(getKey(), JSON.stringify(list));
}

export function updateProgress(id, progress) {
  const list = getContinueWatching();
  const item = list.find(i => i.id === id);
  if (item) {
    item.progress = progress;
    item.lastWatched = Date.now();
    localStorage.setItem(getKey(), JSON.stringify(list));
  }
}

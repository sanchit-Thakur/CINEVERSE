import { tmdb } from '../api/tmdb.js';
import { isInList } from '../utils/storage.js';

export function renderCard(item) {
  const img = item.poster_path?.startsWith('http') ? item.poster_path : tmdb.img(item.poster_path, 'w342');
  const title = item.title || item.name || 'Untitled';
  const rating = item.vote_average?.toFixed(1) || '?';
  const year = (item.release_date || item.first_air_date || '').slice(0, 4);
  const type = item.media_type || (item.first_air_date ? 'tv' : 'movie');
  const inList = isInList(item.id);

  return `
    <div class="movie-card" data-id="${item.id}" data-type="${type}">
      <img src="${img}" alt="${title}" loading="lazy" />
      <div class="card-overlay">
        <div class="card-title">${title}</div>
        <div class="card-meta">
          <span class="card-rating">⭐ ${rating}</span>
          <span>${year}</span>
        </div>
        <div class="card-buttons">
          <button class="card-btn card-btn-play" data-id="${item.id}" data-type="${type}" title="Play">▶</button>
          <button class="card-btn card-btn-list" data-id="${item.id}" title="${inList ? 'Remove' : 'Add to List'}">${inList ? '✓' : '+'}</button>
        </div>
      </div>
    </div>`;
}

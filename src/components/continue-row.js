import { tmdb } from '../api/tmdb.js';

export function renderContinueRow(items) {
  if (!items.length) return '';

  const cards = items.map(item => {
    const img = item.poster_path?.startsWith('http') ? item.poster_path : tmdb.img(item.poster_path, 'w342');
    const progress = item.progress || Math.floor(Math.random() * 60 + 20); // Simulated progress %
    const subtitle = item.type === 'tv' && item.season
      ? `S${item.season} E${item.episode}`
      : '';

    return `
      <div class="continue-card" data-id="${item.id}" data-type="${item.type}">
        <div class="continue-poster">
          <img src="${img}" alt="${item.title}" loading="lazy" />
          <div class="continue-overlay">
            <button class="continue-play-btn" data-id="${item.id}" data-type="${item.type}" data-season="${item.season || ''}" data-episode="${item.episode || ''}">▶</button>
          </div>
          <div class="continue-progress">
            <div class="continue-progress-bar" style="width:${progress}%"></div>
          </div>
        </div>
        <div class="continue-info">
          <span class="continue-title">${item.title}</span>
          ${subtitle ? `<span class="continue-subtitle">${subtitle}</span>` : ''}
        </div>
      </div>`;
  }).join('');

  return `
    <div class="row-section">
      <h2 class="row-title">▶️ Continue Watching</h2>
      <div class="row-container continue-row">
        ${cards}
      </div>
    </div>`;
}

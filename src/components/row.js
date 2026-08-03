import { renderCard } from './card.js';

export function renderRow(title, items, id) {
  if (!items?.length) return '';
  const cards = items.filter(i => i.poster_path).slice(0, 20).map(i => renderCard(i)).join('');
  return `
    <div class="row-section" id="row-${id}">
      <h2 class="row-title">${title}</h2>
      <div class="row-container">${cards}</div>
    </div>`;
}

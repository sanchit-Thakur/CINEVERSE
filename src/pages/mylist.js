import { renderCard } from '../components/card.js';
import { renderFooter } from '../components/footer.js';
import { getMyList, removeFromList, showToast } from '../utils/storage.js';
import { openModal } from '../components/modal.js';

export function renderMyList(container) {
  const list = getMyList();

  if (!list.length) {
    container.innerHTML = `
      <div class="mylist-page">
        <h1>My List</h1>
        <div class="mylist-empty">
          <div class="mylist-empty-icon">📋</div>
          <p>Your list is empty.</p>
          <p style="font-size:.9rem;margin-top:.5rem">Browse movies and click + to add them here.</p>
          <a href="#/browse" class="btn btn-red" style="margin-top:1rem;display:inline-flex">Browse Movies</a>
        </div>
      </div>`;
    return;
  }

  container.innerHTML = `
    <div class="mylist-page">
      <h1>My List <span style="color:var(--text-muted);font-size:1rem;font-weight:400">(${list.length} titles)</span></h1>
      <div class="mylist-grid">${list.map(i => renderCard(i)).join('')}</div>
    </div>
    ${renderFooter()}`;

  container.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.card-btn')) return;
      openModal(parseInt(card.dataset.id), card.dataset.type);
    });
  });
  container.querySelectorAll('.card-btn-play').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const type = btn.dataset.type;
      window.location.hash = `#/watch/${type}/${id}${type === 'tv' ? '/1/1' : ''}`;
    });
  });
  container.querySelectorAll('.card-btn-list').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromList(parseInt(btn.dataset.id));
      showToast('Removed from list');
      renderMyList(container);
    });
  });
}

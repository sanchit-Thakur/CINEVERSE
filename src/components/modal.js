import { tmdb } from '../api/tmdb.js';
import { getSampleDetails } from '../api/sample-data.js';
import { renderCard } from './card.js';
import { addToList, removeFromList, isInList, showToast } from '../utils/storage.js';
import { navigate } from '../utils/router.js';
import { getRating, rateMovie, getGlobalAverage } from '../utils/ratings.js';

export async function openModal(id, type = 'movie') {
  const container = document.getElementById('modal-container');
  document.body.classList.add('modal-open');
  container.innerHTML = `<div class="modal-backdrop"><div class="modal-content"><div class="loading-spinner"><div class="spinner"></div></div></div></div>`;
  container.querySelector('.modal-backdrop').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.addEventListener('keydown', handleEsc);

  try {
    const data = await tmdb.details(id, type);
    renderModalContent(container, data, type);
  } catch (err) {
    container.querySelector('.modal-content').innerHTML = `<div style="padding:3rem;text-align:center"><p style="margin-bottom:1rem">Failed to load details</p><button class="btn btn-info" id="modal-close-btn">Close</button></div>`;
    container.querySelector('#modal-close-btn').addEventListener('click', closeModal);
  }
}

export function openSampleModal(id) {
  const container = document.getElementById('modal-container');
  const data = getSampleDetails(id);
  if (!data) return;
  document.body.classList.add('modal-open');
  container.innerHTML = `<div class="modal-backdrop"><div class="modal-content"></div></div>`;
  container.querySelector('.modal-backdrop').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
  document.addEventListener('keydown', handleEsc);
  renderModalContent(container, data, data.media_type || 'movie');
}

function handleEsc(e) {
  if (e.key === 'Escape') closeModal();
}

function renderStarWidget(movieId) {
  const existing = getRating(movieId);
  const globalAvg = getGlobalAverage(movieId);
  const stars = existing ? existing.stars : 0;

  return `
    <div class="rating-section">
      <div class="rating-widget" data-movie-id="${movieId}">
        <span class="rating-label">Your Rating:</span>
        <div class="star-row">
          ${[1,2,3,4,5].map(i => `<button class="star-btn ${i <= stars ? 'active' : ''}" data-star="${i}">★</button>`).join('')}
        </div>
        ${globalAvg ? `<span class="rating-global">Community: ⭐ ${globalAvg.average} (${globalAvg.count} ratings)</span>` : ''}
      </div>
      ${existing?.review ? `<div class="rating-review-display">"${existing.review}"</div>` : ''}
      <div class="rating-review-wrap" style="display:${existing ? 'block' : 'none'}">
        <textarea class="rating-review-input" id="review-input-${movieId}" placeholder="Write a short review (optional)..." maxlength="300">${existing?.review || ''}</textarea>
      </div>
    </div>`;
}

function renderModalContent(container, data, type) {
  const trailerKey = data.videos ? tmdb.getTrailerKey(data.videos) : null;
  const title = data.title || data.name;
  const year = (data.release_date || data.first_air_date || '').slice(0, 4);
  const runtime = data.runtime ? `${Math.floor(data.runtime / 60)}h ${data.runtime % 60}m` : data.number_of_seasons ? `${data.number_of_seasons} Season${data.number_of_seasons > 1 ? 's' : ''}` : '';
  const rating = data.vote_average?.toFixed(1) || 'N/A';
  const inList = isInList(data.id);
  const genres = (data.genres || []).map(g => `<span class="genre-tag">${g.name}</span>`).join('');
  const cast = (data.credits?.cast || []).slice(0, 8).map(c => c.name).join(', ');
  const similar = (data.similar?.results || data.recommendations?.results || []).filter(i => i.poster_path).slice(0, 6);

  const bgImg = data.backdrop_path?.startsWith('http') ? data.backdrop_path : tmdb.backdrop(data.backdrop_path);

  // Trailer with AUDIO enabled and controls visible
  const heroContent = trailerKey
    ? `<iframe src="https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1&rel=0&modestbranding=1" frameborder="0" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>`
    : `<img src="${bgImg}" alt="${title}" onerror="this.src='https://via.placeholder.com/850x480/141414/666?text=No+Image'" />`;

  const modalContent = container.querySelector('.modal-content');
  modalContent.innerHTML = `
    <div class="modal-hero">
      ${heroContent}
      <div class="modal-hero-gradient"></div>
      <button class="modal-close" id="modal-close-btn">✕</button>
    </div>
    <div class="modal-body">
      <h2 class="modal-title">${title}</h2>
      <div class="modal-meta">
        <span class="modal-match">⭐ ${rating}</span>
        <span>${year}</span>
        ${runtime ? `<span>${runtime}</span>` : ''}
        ${data.adult ? '<span class="modal-badge-adult">18+</span>' : ''}
      </div>

      <div class="modal-actions">
        <button class="btn btn-red modal-watch-btn" data-id="${data.id}" data-type="${type}">▶ Watch Now</button>
        ${trailerKey ? `<button class="btn btn-play modal-play" data-trailer="${trailerKey}">🎬 Trailer</button>` : ''}
        <button class="btn btn-info modal-list-btn" data-id="${data.id}">${inList ? '✓ In List' : '+ My List'}</button>
      </div>

      <p class="modal-overview">${data.overview || 'No description available.'}</p>
      ${genres ? `<div class="modal-genres">${genres}</div>` : ''}
      ${cast ? `<p class="modal-cast"><strong>Cast:</strong> ${cast}</p>` : ''}

      ${renderStarWidget(data.id)}

      ${similar.length ? `
        <h3 class="modal-section-title">More Like This</h3>
        <div class="similar-grid">${similar.map(i => renderCard(i)).join('')}</div>
      ` : ''}
    </div>`;

  // Scroll modal to top
  const backdrop = container.querySelector('.modal-backdrop');
  if (backdrop) backdrop.scrollTop = 0;

  // Close button
  container.querySelector('#modal-close-btn').addEventListener('click', closeModal);

  // My List toggle
  container.querySelector('.modal-list-btn')?.addEventListener('click', e => {
    const mid = parseInt(e.target.dataset.id);
    if (isInList(mid)) {
      removeFromList(mid);
      e.target.textContent = '+ My List';
      showToast('Removed from list');
    } else {
      addToList({ ...data, media_type: type });
      e.target.textContent = '✓ In List';
      showToast('Added to list', 'success');
    }
  });

  // Watch Now button
  container.querySelector('.modal-watch-btn')?.addEventListener('click', e => {
    const wid = e.target.dataset.id;
    const wtype = e.target.dataset.type;
    closeModal();
    navigate(`/watch/${wtype}/${wid}${wtype === 'tv' ? '/1/1' : ''}`);
  });

  // Trailer button - opens full YouTube with audio
  container.querySelector('.modal-play')?.addEventListener('click', e => {
    const key = e.target.dataset.trailer;
    if (key) window.open(`https://www.youtube.com/watch?v=${key}`, '_blank');
  });

  // Star rating interactivity
  container.querySelectorAll('.star-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const star = parseInt(btn.dataset.star);
      const widget = btn.closest('.rating-widget');
      const movieId = parseInt(widget.dataset.movieId);
      // Update visual
      widget.querySelectorAll('.star-btn').forEach((s, i) => {
        s.classList.toggle('active', i < star);
      });
      // Show review input
      const reviewWrap = widget.closest('.rating-section').querySelector('.rating-review-wrap');
      if (reviewWrap) reviewWrap.style.display = 'block';
      // Save after a short delay for review
      setTimeout(() => {
        const reviewInput = document.getElementById(`review-input-${movieId}`);
        const review = reviewInput ? reviewInput.value.trim() : '';
        rateMovie(movieId, star, review);
        showToast(`Rated ${star} star${star > 1 ? 's' : ''}`, 'success');
      }, 100);
    });
    // Hover preview
    btn.addEventListener('mouseenter', () => {
      const star = parseInt(btn.dataset.star);
      btn.closest('.star-row').querySelectorAll('.star-btn').forEach((s, i) => {
        s.classList.toggle('hover', i < star);
      });
    });
    btn.addEventListener('mouseleave', () => {
      btn.closest('.star-row').querySelectorAll('.star-btn').forEach(s => s.classList.remove('hover'));
    });
  });

  // Similar movie cards - clickable
  container.querySelectorAll('.similar-grid .movie-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.card-btn')) return;
      const sid = parseInt(card.dataset.id);
      const stype = card.dataset.type || 'movie';
      container.innerHTML = '';
      openModal(sid, stype);
    });
  });
}

export function closeModal() {
  const container = document.getElementById('modal-container');
  // Stop any playing video before removing
  const iframe = container.querySelector('iframe');
  if (iframe) iframe.src = '';
  container.innerHTML = '';
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', handleEsc);
}

import { tmdb } from '../api/tmdb.js';

export function renderHero(movie) {
  if (!movie) return '';
  const bg = movie.backdrop_path?.startsWith('http') ? movie.backdrop_path : tmdb.backdrop(movie.backdrop_path);
  const title = movie.title || movie.name || 'Untitled';
  const overview = movie.overview || '';
  const rating = movie.vote_average?.toFixed(1) || 'N/A';
  const year = (movie.release_date || movie.first_air_date || '').slice(0, 4);

  return `
    <section class="hero" id="hero-section">
      <div class="hero-bg" style="background-image:url('${bg}')"></div>
      <div class="hero-gradient"></div>
      <div class="hero-content">
        <h1 class="hero-title">${title}</h1>
        <div class="hero-meta">
          <span class="hero-rating">⭐ ${rating}</span>
          <span>${year}</span>
          <span>${movie.media_type === 'tv' ? 'TV Series' : 'Movie'}</span>
        </div>
        <p class="hero-overview">${overview}</p>
        <div class="hero-buttons">
          <button class="btn btn-play" data-id="${movie.id}" data-type="${movie.media_type || 'movie'}" id="hero-play-btn">▶ Play</button>
          <button class="btn btn-info" data-id="${movie.id}" data-type="${movie.media_type || 'movie'}" id="hero-info-btn">ℹ More Info</button>
        </div>
      </div>
    </section>`;
}

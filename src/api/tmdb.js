const BASE = 'https://api.themoviedb.org/3';
const IMG = 'https://image.tmdb.org/t/p/';
const DEFAULT_KEY = 'b6f525302f76535eafd958ce62675ad3';

function getKey() {
  return localStorage.getItem('tmdb_api_key') || DEFAULT_KEY;
}

async function tmdbFetch(endpoint, params = {}) {
  const key = getKey();
  if (!key) throw new Error('TMDB API key not set');
  const url = new URL(`${BASE}${endpoint}`);
  url.searchParams.set('api_key', key);
  url.searchParams.set('language', 'en-US');
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url);
  if (!res.ok) throw new Error(`TMDB error: ${res.status}`);
  return res.json();
}

export const tmdb = {
  img: (path, size = 'w500') => path ? `${IMG}${size}${path}` : '',
  backdrop: (path) => path ? `${IMG}original${path}` : '',

  trending: () => tmdbFetch('/trending/all/week'),
  popular: () => tmdbFetch('/movie/popular'),
  topRated: () => tmdbFetch('/movie/top_rated'),
  upcoming: () => tmdbFetch('/movie/upcoming'),
  nowPlaying: () => tmdbFetch('/movie/now_playing'),

  genre: (id, page = 1) => tmdbFetch('/discover/movie', { with_genres: id, page, sort_by: 'popularity.desc' }),
  tvPopular: () => tmdbFetch('/tv/popular'),
  tvTopRated: () => tmdbFetch('/tv/top_rated'),

  details: (id, type = 'movie') => tmdbFetch(`/${type}/${id}`, { append_to_response: 'credits,videos,similar,recommendations' }),
  seasonDetails: (tvId, season) => tmdbFetch(`/tv/${tvId}/season/${season}`),
  search: (query, page = 1) => tmdbFetch('/search/multi', { query, page }),
  genres: () => tmdbFetch('/genre/movie/list'),

  getTrailerKey(videos) {
    if (!videos?.results?.length) return null;
    const trailer = videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    return trailer?.key || videos.results[0]?.key || null;
  }
};

export const GENRES = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
  14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
  9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 53: 'Thriller',
  10752: 'War', 37: 'Western'
};

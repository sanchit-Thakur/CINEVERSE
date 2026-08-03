// Ratings & Reviews — 5-star system per profile
import { getActiveProfile } from './profiles.js';

function getKey() {
  const profile = getActiveProfile();
  return profile ? `cv_ratings_${profile.id}` : 'cv_ratings_default';
}

export function getAllRatings() {
  try { return JSON.parse(localStorage.getItem(getKey())) || {}; }
  catch { return {}; }
}

export function getRating(movieId) {
  return getAllRatings()[movieId] || null;
}

export function rateMovie(movieId, stars, review = '') {
  const ratings = getAllRatings();
  ratings[movieId] = {
    stars, // 1-5
    review,
    ratedAt: Date.now()
  };
  localStorage.setItem(getKey(), JSON.stringify(ratings));
}

export function removeRating(movieId) {
  const ratings = getAllRatings();
  delete ratings[movieId];
  localStorage.setItem(getKey(), JSON.stringify(ratings));
}

// Get global average across ALL profiles on this device
export function getGlobalAverage(movieId) {
  const allKeys = Object.keys(localStorage).filter(k => k.startsWith('cv_ratings_'));
  let total = 0, count = 0;
  allKeys.forEach(key => {
    try {
      const ratings = JSON.parse(localStorage.getItem(key)) || {};
      if (ratings[movieId]) {
        total += ratings[movieId].stars;
        count++;
      }
    } catch {}
  });
  return count > 0 ? { average: (total / count).toFixed(1), count } : null;
}

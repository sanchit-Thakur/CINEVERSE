import { tmdb } from '../api/tmdb.js';
import { getAISearchTerms, askGemini } from '../api/gemini.js';
import { renderCard } from '../components/card.js';
import { renderFooter } from '../components/footer.js';
import { openModal } from '../components/modal.js';
import { attachCardListeners } from './browse.js';

const RECENT_KEY = 'cv_recent_searches';

function getRecentSearches() {
  try { return JSON.parse(localStorage.getItem(RECENT_KEY)) || []; } catch { return []; }
}

function saveRecentSearch(query) {
  const recent = getRecentSearches().filter(r => r !== query);
  recent.unshift(query);
  localStorage.setItem(RECENT_KEY, JSON.stringify(recent.slice(0, 8)));
}

export function renderSearch(container) {
  container.innerHTML = `
    <div class="search-page">
      <div class="search-header">
        <h1 style="font-size:1.5rem;margin-bottom:1rem">🔍 Search</h1>
        <div class="search-input-wrap">
          <span class="search-icon">🔍</span>
          <input class="search-input" id="search-input" placeholder="Search movies, shows, or ask AI..." autofocus />
          <div class="search-suggestions" id="search-suggestions"></div>
          <p class="search-hint">💡 Try: "scary movies like Hereditary" or "feel-good romcoms"</p>
        </div>
      </div>
      <div id="ai-answer-container"></div>
      <div id="search-results" class="search-results"></div>
    </div>
    ${renderFooter()}`;

  let debounceTimer;
  let fullSearchTimer;
  const input = document.getElementById('search-input');

  input.addEventListener('input', e => {
    const q = e.target.value.trim();
    clearTimeout(debounceTimer);
    clearTimeout(fullSearchTimer);

    if (!q) {
      document.getElementById('search-suggestions').innerHTML = '';
      document.getElementById('search-results').innerHTML = '';
      document.getElementById('ai-answer-container').innerHTML = '';
      showRecentSearches();
      return;
    }

    // Fast suggestions (300ms debounce)
    debounceTimer = setTimeout(() => fetchSuggestions(q), 300);
    // Full search (800ms debounce)
    fullSearchTimer = setTimeout(() => { doSearch(q); saveRecentSearch(q); }, 800);
  });

  input.addEventListener('focus', () => {
    const q = input.value.trim();
    if (!q) showRecentSearches();
  });

  // Close suggestions on click outside
  document.addEventListener('click', e => {
    if (!e.target.closest('.search-input-wrap')) {
      document.getElementById('search-suggestions').innerHTML = '';
    }
  });

  showRecentSearches();
}

function showRecentSearches() {
  const recent = getRecentSearches();
  const el = document.getElementById('search-suggestions');
  if (!recent.length || !el) return;
  el.innerHTML = `
    <div class="suggestions-header">Recent Searches</div>
    ${recent.map(r => `<div class="suggestion-item recent-search" data-query="${r}"><span class="suggestion-icon">🕒</span><span>${r}</span></div>`).join('')}`;
  el.querySelectorAll('.recent-search').forEach(item => {
    item.addEventListener('click', () => {
      const q = item.dataset.query;
      document.getElementById('search-input').value = q;
      el.innerHTML = '';
      doSearch(q);
    });
  });
}

async function fetchSuggestions(query) {
  const el = document.getElementById('search-suggestions');
  if (!el) return;

  try {
    const data = await tmdb.search(query);
    const results = (data.results || []).filter(i => i.poster_path || i.profile_path).slice(0, 6);

    if (!results.length) { el.innerHTML = ''; return; }

    el.innerHTML = results.map(item => {
      const title = item.title || item.name;
      const type = item.media_type || 'movie';
      const year = (item.release_date || item.first_air_date || '').slice(0, 4);
      const badge = type === 'tv' ? '📺' : type === 'person' ? '👤' : '🎬';
      const img = item.poster_path
        ? tmdb.img(item.poster_path, 'w92')
        : item.profile_path
          ? tmdb.img(item.profile_path, 'w92')
          : '';

      return `
        <div class="suggestion-item" data-id="${item.id}" data-type="${type}">
          ${img ? `<img class="suggestion-thumb" src="${img}" alt="" />` : `<span class="suggestion-icon">${badge}</span>`}
          <div class="suggestion-info">
            <span class="suggestion-title">${title}</span>
            <span class="suggestion-meta">${badge} ${type === 'tv' ? 'TV Series' : type === 'person' ? 'Person' : 'Movie'} ${year ? `· ${year}` : ''}</span>
          </div>
        </div>`;
    }).join('');

    el.querySelectorAll('.suggestion-item:not(.recent-search)').forEach(item => {
      item.addEventListener('click', () => {
        const id = parseInt(item.dataset.id);
        const type = item.dataset.type;
        el.innerHTML = '';
        if (type !== 'person') openModal(id, type);
      });
    });
  } catch {
    el.innerHTML = '';
  }
}

async function doSearch(query) {
  if (!query) { document.getElementById('search-results').innerHTML = ''; document.getElementById('ai-answer-container').innerHTML = ''; return; }
  const resultsEl = document.getElementById('search-results');
  const aiEl = document.getElementById('ai-answer-container');
  const suggestionsEl = document.getElementById('search-suggestions');
  if (suggestionsEl) suggestionsEl.innerHTML = '';
  resultsEl.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  const isAIQuery = /like|similar|mood|feel|vibe|suggest|recommend/i.test(query);

  try {
    let results = [];
    if (isAIQuery) {
      try {
        const [terms, aiReply] = await Promise.all([
          getAISearchTerms(query),
          askGemini(`User is searching for: "${query}". Give a brief, helpful 2-sentence response about what you'd recommend and why.`)
        ]);
        aiEl.innerHTML = `<div class="ai-answer"><div class="ai-answer-label">🤖 AI Assistant</div><div class="ai-answer-text">${aiReply}</div></div>`;
        const searchResults = await Promise.all(terms.map(t => tmdb.search(t)));
        const seen = new Set();
        searchResults.forEach(r => r.results?.forEach(item => { if (!seen.has(item.id) && item.poster_path) { seen.add(item.id); results.push(item); } }));
      } catch {
        aiEl.innerHTML = '';
        const data = await tmdb.search(query);
        results = data.results || [];
      }
    } else {
      aiEl.innerHTML = '';
      const data = await tmdb.search(query);
      results = data.results || [];
    }

    results = results.filter(i => i.poster_path);
    if (!results.length) { resultsEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">No results found</p>'; return; }
    resultsEl.innerHTML = results.map(i => renderCard(i)).join('');
    attachCardListeners(resultsEl);
  } catch {
    resultsEl.innerHTML = '<p style="text-align:center;color:var(--text-muted);padding:2rem">Search failed. Check your API key.</p>';
  }
}

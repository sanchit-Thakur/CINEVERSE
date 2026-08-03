import { tmdb } from '../api/tmdb.js';
import { getSampleData, getSampleDetails, hasTMDBKey } from '../api/sample-data.js';
import { renderHero } from '../components/hero.js';
import { renderRow } from '../components/row.js';
import { renderFooter } from '../components/footer.js';
import { openModal, openSampleModal } from '../components/modal.js';
import { addToList, removeFromList, isInList, showToast } from '../utils/storage.js';
import { navigate } from '../utils/router.js';
import { getContinueWatching } from '../utils/continue-watching.js';
import { renderContinueRow } from '../components/continue-row.js';

export async function renderBrowse(container) {
  container.innerHTML = '<div class="loading-spinner"><div class="spinner"></div></div>';

  try {
    let trending, popular, topRated, action, comedy, horror, scifi, tvPop;

    if (hasTMDBKey()) {
      const results = await Promise.all([
        tmdb.trending(), tmdb.popular(), tmdb.topRated(),
        tmdb.genre(28), tmdb.genre(35), tmdb.genre(27), tmdb.genre(878),
        tmdb.tvPopular()
      ]);
      [trending, popular, topRated, action, comedy, horror, scifi, tvPop] = results;
    } else {
      trending = getSampleData('trending');
      popular = getSampleData('topRated');
      topRated = getSampleData('topRated');
      action = getSampleData('action');
      comedy = getSampleData('comedy');
      horror = getSampleData('horror');
      scifi = getSampleData('scifi');
      tvPop = getSampleData('tvPopular');
    }

    const heroMovie = trending.results[Math.floor(Math.random() * Math.min(5, trending.results.length))];
    const hero = renderHero(heroMovie);

    const banner = !hasTMDBKey() ? `<div style="background:linear-gradient(135deg,rgba(229,9,20,.15),rgba(229,9,20,.05));border:1px solid rgba(229,9,20,.3);border-radius:8px;padding:12px 20px;margin:0 4% 1rem;display:flex;align-items:center;gap:12px;font-size:.9rem">
      <span>🎬</span><span>Showing sample data. <button onclick="window.dispatchEvent(new CustomEvent('open-settings'))" style="color:var(--red);background:none;border:none;cursor:pointer;font-size:.9rem;text-decoration:underline">Add free TMDB API key</button> for 500,000+ real movies & shows!</span></div>` : '';

    // Continue Watching row
    const continueItems = getContinueWatching();
    const continueRow = continueItems.length > 0 ? renderContinueRow(continueItems) : '';

    // "Because You Watched" recommendations
    let becauseRows = '';
    if (hasTMDBKey() && continueItems.length > 0) {
      try {
        const recentTwo = continueItems.slice(0, 2);
        const recPromises = recentTwo.map(item =>
          tmdb.details(item.id, item.type).then(d => ({
            title: d.title || d.name,
            results: (d.recommendations?.results || d.similar?.results || []).filter(r => r.poster_path).slice(0, 20)
          })).catch(() => null)
        );
        const recResults = await Promise.all(recPromises);
        recResults.forEach(rec => {
          if (rec && rec.results.length > 0) {
            becauseRows += renderRow(`💡 Because you watched ${rec.title}`, rec.results, `rec-${rec.title.replace(/\s/g, '')}`);
          }
        });
      } catch {}
    }

    container.innerHTML = `
      ${hero}
      <div class="content-rows">
        ${banner}
        ${continueRow}
        ${becauseRows}
        ${renderRow('🔥 Trending Now', trending.results, 'trending')}
        ${renderRow('🎬 Popular Movies', popular.results, 'popular')}
        ${renderRow('⭐ Top Rated', topRated.results, 'toprated')}
        ${renderRow('📺 Popular TV Shows', tvPop.results, 'tvpop')}
        ${renderRow('💥 Action', action.results, 'action')}
        ${renderRow('😂 Comedy', comedy.results, 'comedy')}
        ${renderRow('👻 Horror', horror.results, 'horror')}
        ${renderRow('🚀 Sci-Fi', scifi.results, 'scifi')}
      </div>
      ${renderFooter()}`;

    attachCardListeners(container);
  } catch (err) {
    // Fallback to sample data on any error
    const trending = getSampleData('trending');
    const heroMovie = trending.results[0];
    container.innerHTML = `
      ${renderHero(heroMovie)}
      <div class="content-rows">
        <div style="background:rgba(229,9,20,.1);border:1px solid rgba(229,9,20,.3);border-radius:8px;padding:12px 20px;margin:0 4% 1rem;font-size:.9rem">⚠️ Using sample data. Add TMDB key in ⚙️ Settings for live movies.</div>
        ${renderRow('🔥 Trending Now', trending.results, 'trending')}
        ${renderRow('💥 Action', getSampleData('action').results, 'action')}
        ${renderRow('😂 Comedy', getSampleData('comedy').results, 'comedy')}
        ${renderRow('👻 Horror', getSampleData('horror').results, 'horror')}
        ${renderRow('🚀 Sci-Fi', getSampleData('scifi').results, 'scifi')}
        ${renderRow('📺 TV Shows', getSampleData('tvPopular').results, 'tv')}
      </div>
      ${renderFooter()}`;
    attachCardListeners(container, true);
  }
}

export function attachCardListeners(container, forceSample = false) {
  const useSample = forceSample || !hasTMDBKey();
  container.querySelectorAll('.movie-card').forEach(card => {
    card.addEventListener('click', e => {
      if (e.target.closest('.card-btn')) return;
      const id = parseInt(card.dataset.id);
      const type = card.dataset.type;
      if (useSample) openSampleModal(id);
      else openModal(id, type);
    });
  });
  container.querySelectorAll('.card-btn-play').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const type = btn.dataset.type;
      navigate(`/watch/${type}/${id}${type === 'tv' ? '/1/1' : ''}`);
    });
  });
  container.querySelectorAll('.card-btn-list').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = parseInt(btn.dataset.id);
      if (isInList(id)) { removeFromList(id); btn.textContent = '+'; showToast('Removed from list'); }
      else {
        try {
          let data;
          if (useSample) { data = getSampleDetails(id); data.media_type = data.media_type || 'movie'; }
          else { data = await tmdb.details(id); data.media_type = 'movie'; }
          if (data) { addToList(data); btn.textContent = '✓'; showToast('Added to list', 'success'); }
        } catch { showToast('Failed to add', 'error'); }
      }
    });
  });

  // Continue watching cards & play buttons
  container.querySelectorAll('.continue-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = card.dataset.id;
      const type = card.dataset.type;
      const btn = card.querySelector('.continue-play-btn');
      const season = btn?.dataset.season || 1;
      const episode = btn?.dataset.episode || 1;
      navigate(`/watch/${type}/${id}${type === 'tv' ? `/${season}/${episode}` : ''}`);
    });
  });

  container.querySelector('#hero-play-btn')?.addEventListener('click', e => {
    const id = e.target.dataset.id;
    const type = e.target.dataset.type;
    navigate(`/watch/${type}/${id}${type === 'tv' ? '/1/1' : ''}`);
  });
  container.querySelector('#hero-info-btn')?.addEventListener('click', e => {
    const id = parseInt(e.target.dataset.id);
    if (useSample) openSampleModal(id);
    else openModal(id, e.target.dataset.type);
  });
}

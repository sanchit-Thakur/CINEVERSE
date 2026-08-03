import { tmdb } from '../api/tmdb.js';
import { addToList, isInList, showToast } from '../utils/storage.js';
import { navigate } from '../utils/router.js';
import { addToContinueWatching } from '../utils/continue-watching.js';

// Multiple streaming servers & fallbacks for movie and TV playback
const BASE_SERVERS = [
  { id: 'vidsrc-cc', name: 'Server 1 (VidSrc CC)', type: 'iframe', movie: (id) => `https://vidsrc.cc/v2/embed/movie/${id}`, tv: (id, s, e) => `https://vidsrc.cc/v2/embed/tv/${id}/${s}/${e}` },
  { id: 'vidsrc-me', name: 'Server 2 (VidSrc Me)', type: 'iframe', movie: (id) => `https://vidsrc.me/embed/movie?tmdb=${id}`, tv: (id, s, e) => `https://vidsrc.me/embed/tv?tmdb=${id}&season=${s}&episode=${e}` },
  { id: 'vidsrc-pro', name: 'Server 3 (VidSrc Pro)', type: 'iframe', movie: (id) => `https://vidsrc.pro/embed/movie/${id}`, tv: (id, s, e) => `https://vidsrc.pro/embed/tv/${id}/${s}/${e}` },
  { id: 'embed-su', name: 'Server 4 (Embed SU)', type: 'iframe', movie: (id) => `https://embed.su/embed/movie/${id}`, tv: (id, s, e) => `https://embed.su/embed/tv/${id}/${s}/${e}` },
  { id: '2embed', name: 'Server 5 (2Embed)', type: 'iframe', movie: (id) => `https://www.2embed.skin/embed/movie/${id}`, tv: (id, s, e) => `https://www.2embed.skin/embed/tv/${id}/${s}/${e}` },
  { id: 'vidsrc-vip', name: 'Server 6 (VidSrc VIP)', type: 'iframe', movie: (id) => `https://vidsrc.vip/embed/movie/${id}`, tv: (id, s, e) => `https://vidsrc.vip/embed/tv/${id}/${s}/${e}` },
  { id: 'vidsrc-in', name: 'Server 7 (VidSrc IN)', type: 'iframe', movie: (id) => `https://vidsrc.in/embed/movie/${id}`, tv: (id, s, e) => `https://vidsrc.in/embed/tv/${id}/${s}/${e}` },
  { id: 'vidsrc-xyz', name: 'Server 8 (VidSrc XYZ)', type: 'iframe', movie: (id) => `https://vidsrc.xyz/embed/movie/${id}`, tv: (id, s, e) => `https://vidsrc.xyz/embed/tv/${id}/${s}/${e}` },
  { id: 'autoembed', name: 'Server 9 (AutoEmbed)', type: 'iframe', movie: (id) => `https://player.autoembed.cc/embed/movie/${id}`, tv: (id, s, e) => `https://player.autoembed.cc/embed/tv/${id}/${s}/${e}` },
  { id: 'smashy', name: 'Server 10 (Smashy)', type: 'iframe', movie: (id) => `https://player.smashy.stream/movie/${id}`, tv: (id, s, e) => `https://player.smashy.stream/tv/${id}?s=${s}&e=${e}` },
  { id: 'multiembed', name: 'Server 11 (MultiEmbed)', type: 'iframe', movie: (id) => `https://multiembed.mov/?video_id=${id}&tmdb=1`, tv: (id, s, e) => `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` },
];

export async function renderPlayer(container, params) {
  // params: [type, id] or [type, id, season, episode]
  const type = params[0] || 'movie';
  const id = params[1];
  const season = params[2] || 1;
  const episode = params[3] || 1;

  if (!id) { navigate('/'); return; }

  container.innerHTML = `
    <div class="player-page">
      <div class="player-loading"><div class="spinner"></div><p style="margin-top:1rem;color:var(--text-muted)">Loading player...</p></div>
    </div>`;

  try {
    const data = await tmdb.details(id, type);
    const title = data.title || data.name;
    const trailerKey = data.videos ? tmdb.getTrailerKey(data.videos) : null;

    // Save to Continue Watching
    addToContinueWatching({
      id: parseInt(id), type, title,
      poster_path: data.poster_path,
      backdrop_path: data.backdrop_path,
      vote_average: data.vote_average,
      season: type === 'tv' ? parseInt(season) : null,
      episode: type === 'tv' ? parseInt(episode) : null,
      progress: Math.floor(Math.random() * 40 + 10)
    });

    let seasonsHTML = '';
    let episodesHTML = '';
    if (type === 'tv' && data.seasons) {
      const validSeasons = data.seasons.filter(s => s.season_number > 0);
      seasonsHTML = validSeasons.map(s =>
        `<button class="season-btn ${s.season_number == season ? 'active' : ''}" data-season="${s.season_number}">S${s.season_number}</button>`
      ).join('');

      // Fetch episode list for current season
      try {
        const seasonData = await tmdb.seasonDetails(id, season);
        episodesHTML = (seasonData.episodes || []).map(ep => `
          <div class="episode-card ${ep.episode_number == episode ? 'active' : ''}" data-season="${season}" data-episode="${ep.episode_number}">
            <div class="episode-thumb">
              ${ep.still_path ? `<img src="${tmdb.img(ep.still_path, 'w300')}" alt="Episode ${ep.episode_number}" />` : `<div class="episode-thumb-placeholder">▶</div>`}
              <span class="episode-number">E${ep.episode_number}</span>
            </div>
            <div class="episode-info">
              <div class="episode-title">${ep.episode_number}. ${ep.name || 'Episode ' + ep.episode_number}</div>
              <div class="episode-meta">${ep.runtime ? ep.runtime + 'm' : ''} ${ep.vote_average ? '⭐ ' + ep.vote_average.toFixed(1) : ''}</div>
              <div class="episode-overview">${ep.overview || 'No description available.'}</div>
            </div>
          </div>
        `).join('');
      } catch (e) {
        episodesHTML = '<p style="color:var(--text-muted);padding:1rem">Could not load episodes</p>';
      }
    }

    // Build complete server list including Trailer & Direct HTML5 Stream fallbacks
    const sources = [...BASE_SERVERS];

    if (trailerKey) {
      sources.push({
        id: 'trailer',
        name: '🎬 Official Trailer (YouTube)',
        type: 'iframe',
        movie: () => `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0`,
        tv: () => `https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&controls=1&rel=0`
      });
    }

    sources.push({
      id: 'demo-stream',
      name: '⚡ Direct Demo Stream (HTML5)',
      type: 'html5',
      movie: () => `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4`,
      tv: () => `https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4`
    });

    const activeIndex = 0;
    const initialSource = sources[activeIndex];
    const initialUrl = type === 'tv'
      ? initialSource.tv(id, season, episode)
      : initialSource.movie(id);

    const serverBtns = sources.map((s, i) =>
      `<button class="server-btn ${i === activeIndex ? 'active' : ''}" data-index="${i}">${s.name}</button>`
    ).join('');

    const initialMediaHTML = initialSource.type === 'html5'
      ? `<video id="player-video" controls autoplay style="width:100%;height:100%;object-fit:contain;background:#000" src="${initialUrl}"></video>`
      : `<iframe id="player-iframe" src="${initialUrl}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; fullscreen" referrerpolicy="no-referrer"></iframe>`;

    container.innerHTML = `
      <div class="player-page">
        <div class="player-nav">
          <button class="btn btn-info player-back" id="player-back">← Back</button>
          <h2 class="player-title">${title} ${type === 'tv' ? `— S${season} E${episode}` : ''}</h2>
          <div class="player-actions">
            <button class="btn btn-info player-list-btn" data-id="${id}">${isInList(parseInt(id)) ? '✓ In List' : '+ My List'}</button>
          </div>
        </div>

        <div class="player-video-container" id="video-container">
          ${initialMediaHTML}
          <button class="skip-intro-btn" id="skip-intro-btn">Skip Intro ▸▸</button>
        </div>

        <div class="player-controls">
          <div class="server-selector">
            <span style="color:var(--text-muted);font-size:.85rem;margin-right:8px;font-weight:600">Servers:</span>
            ${serverBtns}
          </div>
          ${type === 'tv' ? `
          <div class="player-episode-nav">
            <button class="btn btn-info ep-prev" ${episode <= 1 ? 'disabled' : ''}>← Prev Episode</button>
            <button class="btn btn-red ep-next">Next Episode →</button>
          </div>` : ''}
        </div>

        <div class="server-tip-banner" style="padding:10px 4%;background:rgba(229,9,20,0.08);border-bottom:1px solid rgba(229,9,20,0.2);font-size:0.85rem;color:#ddd;display:flex;align-items:center;gap:10px;">
          <span>💡 <strong>Tip:</strong> If a streaming server is slow or blocked by your adblocker/ISP, switch between <strong>Server 1 - 9</strong>, or choose <strong>🎬 Official Trailer</strong> / <strong>⚡ Direct Demo Stream</strong> for instant playback!</span>
        </div>

        ${type === 'tv' ? `
        <div class="player-seasons-section">
          <h3 class="player-section-title">Seasons</h3>
          <div class="season-selector">${seasonsHTML}</div>
        </div>
        <div class="player-episodes-section">
          <h3 class="player-section-title">Episodes — Season ${season}</h3>
          <div class="episodes-list" id="episodes-list">${episodesHTML}</div>
        </div>` : ''}

        <div class="player-info">
          <h3>${title}</h3>
          <div class="player-meta">
            <span class="hero-rating">⭐ ${data.vote_average?.toFixed(1)}</span>
            <span>${(data.release_date || data.first_air_date || '').slice(0, 4)}</span>
            ${data.runtime ? `<span>${Math.floor(data.runtime/60)}h ${data.runtime%60}m</span>` : ''}
            ${data.number_of_seasons ? `<span>${data.number_of_seasons} Seasons</span>` : ''}
          </div>
          <p style="color:var(--text);line-height:1.6;margin-top:.75rem;max-width:800px">${data.overview || ''}</p>
          <div class="modal-genres" style="margin-top:1rem">${(data.genres||[]).map(g => `<span class="genre-tag">${g.name}</span>`).join('')}</div>
        </div>
      </div>`;

    // Event listeners
    document.getElementById('player-back').addEventListener('click', () => history.back());

    // Skip Intro button — auto-hides after 60s
    const skipBtn = document.getElementById('skip-intro-btn');
    if (skipBtn) {
      setTimeout(() => { skipBtn.classList.add('visible'); }, 3000);
      setTimeout(() => { skipBtn.classList.remove('visible'); }, 63000);
      skipBtn.addEventListener('click', () => {
        skipBtn.classList.remove('visible');
        showToast('Skipped intro', 'success');
      });
    }

    // Dynamic Server switching (HTML5 vs iframe support)
    const videoContainer = document.getElementById('video-container');
    container.querySelectorAll('.server-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.dataset.index);
        const source = sources[idx];
        const url = type === 'tv'
          ? source.tv(id, season, episode)
          : source.movie(id);

        if (source.type === 'html5') {
          videoContainer.innerHTML = `
            <video id="player-video" controls autoplay style="width:100%;height:100%;object-fit:contain;background:#000" src="${url}"></video>
            <button class="skip-intro-btn visible" id="skip-intro-btn">Skip Intro ▸▸</button>`;
        } else {
          videoContainer.innerHTML = `
            <iframe id="player-iframe" src="${url}" frameborder="0" allowfullscreen allow="autoplay; encrypted-media; fullscreen" referrerpolicy="no-referrer"></iframe>
            <button class="skip-intro-btn" id="skip-intro-btn">Skip Intro ▸▸</button>`;
        }

        container.querySelectorAll('.server-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        showToast(`Switched to ${source.name}`, 'info');
      });
    });

    // My List
    container.querySelector('.player-list-btn')?.addEventListener('click', (e) => {
      const mid = parseInt(e.target.dataset.id);
      if (isInList(mid)) { showToast('Already in list'); }
      else { addToList({ ...data, media_type: type }); e.target.textContent = '✓ In List'; showToast('Added to list', 'success'); }
    });

    // TV episode navigation
    if (type === 'tv') {
      container.querySelector('.ep-prev')?.addEventListener('click', () => {
        if (episode > 1) navigate(`/watch/tv/${id}/${season}/${parseInt(episode) - 1}`);
      });
      container.querySelector('.ep-next')?.addEventListener('click', () => {
        navigate(`/watch/tv/${id}/${season}/${parseInt(episode) + 1}`);
      });

      // Season buttons
      container.querySelectorAll('.season-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          navigate(`/watch/tv/${id}/${btn.dataset.season}/1`);
        });
      });

      // Episode cards
      container.querySelectorAll('.episode-card').forEach(card => {
        card.addEventListener('click', () => {
          navigate(`/watch/tv/${id}/${card.dataset.season}/${card.dataset.episode}`);
        });
      });
    }

  } catch (err) {
    container.innerHTML = `
      <div class="player-page" style="display:flex;align-items:center;justify-content:center;min-height:80vh">
        <div style="text-align:center">
          <p style="font-size:1.2rem;margin-bottom:1rem">Failed to load content details</p>
          <button class="btn btn-red" onclick="history.back()">Go Back</button>
        </div>
      </div>`;
  }
}

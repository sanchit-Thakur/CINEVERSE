import { getProfiles, createProfile, deleteProfile, setActiveProfile, getAvatar, DEFAULT_AVATARS } from '../utils/profiles.js';
import { getUser } from './auth.js';

export function renderProfiles(container) {
  const profiles = getProfiles();
  const user = getUser();

  // If no profiles, auto-create one from user account
  if (profiles.length === 0 && user) {
    createProfile(user.name || 'User', 0, false);
  }

  const updatedProfiles = getProfiles();

  container.innerHTML = `
    <div class="profiles-page">
      <div class="profiles-bg"></div>
      <div class="profiles-container">
        <h1 class="profiles-title">Who's Watching?</h1>
        <div class="profiles-grid">
          ${updatedProfiles.map((p, i) => {
            const avatar = getAvatar(p.avatarIndex);
            return `
              <div class="profile-item" data-id="${p.id}">
                <div class="profile-avatar" style="background:${avatar.color}">
                  <span class="profile-avatar-emoji">${avatar.emoji}</span>
                  ${p.isKids ? '<span class="profile-kids-badge">KIDS</span>' : ''}
                </div>
                <span class="profile-name">${p.name}</span>
                <button class="profile-delete-btn" data-id="${p.id}" title="Delete profile">✕</button>
              </div>`;
          }).join('')}
          ${updatedProfiles.length < 5 ? `
            <div class="profile-item profile-add" id="add-profile-btn">
              <div class="profile-avatar profile-avatar-add">
                <span>＋</span>
              </div>
              <span class="profile-name">Add Profile</span>
            </div>` : ''}
        </div>
        <button class="btn btn-info profiles-manage-btn" id="manage-profiles-btn">✏️ Manage Profiles</button>
      </div>

      <!-- Add Profile Modal -->
      <div class="profile-modal-backdrop" id="add-profile-modal" style="display:none">
        <div class="profile-modal">
          <h2>Add Profile</h2>
          <div class="profile-modal-avatars" id="avatar-picker">
            ${DEFAULT_AVATARS.map((a, i) => `
              <button class="avatar-pick-btn ${i === 0 ? 'selected' : ''}" data-index="${i}" style="background:${a.color}">
                <span>${a.emoji}</span>
              </button>`).join('')}
          </div>
          <div class="auth-field" style="margin-top:1rem">
            <input type="text" id="new-profile-name" placeholder=" " maxlength="20" />
            <label for="new-profile-name">Profile Name</label>
          </div>
          <label class="profile-kids-toggle">
            <input type="checkbox" id="new-profile-kids" />
            <span>Kids Profile</span>
            <small>Only shows family-friendly content</small>
          </label>
          <div class="profile-modal-actions">
            <button class="btn btn-red" id="save-profile-btn">Create</button>
            <button class="btn btn-info" id="cancel-profile-btn">Cancel</button>
          </div>
        </div>
      </div>
    </div>`;

  attachProfileListeners(container);
}

function attachProfileListeners(container) {
  let isManaging = false;

  // Click profile to select
  container.querySelectorAll('.profile-item:not(.profile-add)').forEach(item => {
    item.addEventListener('click', e => {
      if (e.target.closest('.profile-delete-btn')) return;
      if (isManaging) return;
      const id = item.dataset.id;
      const profiles = getProfiles();
      const profile = profiles.find(p => p.id === id);
      if (profile) {
        // Add selection animation
        item.querySelector('.profile-avatar').classList.add('profile-selected-anim');
        setActiveProfile(profile);
        setTimeout(() => {
          window.location.hash = '#/';
          window.location.reload();
        }, 400);
      }
    });
  });

  // Delete profile buttons
  container.querySelectorAll('.profile-delete-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.id;
      const profiles = getProfiles();
      if (profiles.length <= 1) {
        alert('You must have at least one profile.');
        return;
      }
      if (confirm('Delete this profile? All watch history and ratings will be lost.')) {
        deleteProfile(id);
        renderProfiles(container);
      }
    });
  });

  // Add profile button
  document.getElementById('add-profile-btn')?.addEventListener('click', () => {
    document.getElementById('add-profile-modal').style.display = 'flex';
    document.getElementById('new-profile-name').focus();
  });

  // Avatar picker
  let selectedAvatar = 0;
  document.querySelectorAll('.avatar-pick-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.avatar-pick-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectedAvatar = parseInt(btn.dataset.index);
    });
  });

  // Save new profile
  document.getElementById('save-profile-btn')?.addEventListener('click', () => {
    const name = document.getElementById('new-profile-name').value.trim();
    const isKids = document.getElementById('new-profile-kids').checked;
    if (!name) { document.getElementById('new-profile-name').focus(); return; }
    createProfile(name, selectedAvatar, isKids);
    document.getElementById('add-profile-modal').style.display = 'none';
    renderProfiles(container);
  });

  // Cancel
  document.getElementById('cancel-profile-btn')?.addEventListener('click', () => {
    document.getElementById('add-profile-modal').style.display = 'none';
  });

  // Manage profiles toggle
  document.getElementById('manage-profiles-btn')?.addEventListener('click', () => {
    isManaging = !isManaging;
    container.querySelectorAll('.profile-delete-btn').forEach(btn => {
      btn.style.display = isManaging ? 'flex' : 'none';
    });
    document.getElementById('manage-profiles-btn').textContent = isManaging ? '✓ Done' : '✏️ Manage Profiles';
  });
}

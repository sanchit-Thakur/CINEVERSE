// Profile management — supports multiple profiles per account
const PROFILES_KEY = 'cineverse_profiles';
const ACTIVE_KEY = 'cineverse_active_profile';

const DEFAULT_AVATARS = [
  { emoji: '😎', color: 'linear-gradient(135deg,#E50914,#b20710)' },
  { emoji: '👶', color: 'linear-gradient(135deg,#00d4ff,#0090ff)' },
  { emoji: '🦊', color: 'linear-gradient(135deg,#f5c518,#ff8c00)' },
  { emoji: '🐱', color: 'linear-gradient(135deg,#7b2ff7,#c471f5)' },
  { emoji: '🌸', color: 'linear-gradient(135deg,#ff6b9d,#c850c0)' },
  { emoji: '🎮', color: 'linear-gradient(135deg,#46d369,#00b894)' },
  { emoji: '🎵', color: 'linear-gradient(135deg,#fd79a8,#e84393)' },
  { emoji: '🚀', color: 'linear-gradient(135deg,#00cec9,#0984e3)' },
];

export function getProfiles() {
  try { return JSON.parse(localStorage.getItem(PROFILES_KEY)) || []; }
  catch { return []; }
}

export function saveProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles));
}

export function createProfile(name, avatarIndex = 0, isKids = false) {
  const profiles = getProfiles();
  if (profiles.length >= 5) return null;
  const profile = {
    id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    avatarIndex,
    isKids,
    createdAt: Date.now()
  };
  profiles.push(profile);
  saveProfiles(profiles);
  return profile;
}

export function deleteProfile(id) {
  const profiles = getProfiles().filter(p => p.id !== id);
  saveProfiles(profiles);
  // Clean up profile-specific data
  localStorage.removeItem(`cv_mylist_${id}`);
  localStorage.removeItem(`cv_ratings_${id}`);
  localStorage.removeItem(`cv_continue_${id}`);
  if (getActiveProfile()?.id === id) {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export function getActiveProfile() {
  try { return JSON.parse(localStorage.getItem(ACTIVE_KEY)); }
  catch { return null; }
}

export function setActiveProfile(profile) {
  localStorage.setItem(ACTIVE_KEY, JSON.stringify(profile));
}

export function clearActiveProfile() {
  localStorage.removeItem(ACTIVE_KEY);
}

export function hasProfiles() {
  return getProfiles().length > 0;
}

export function getAvatar(index) {
  return DEFAULT_AVATARS[index % DEFAULT_AVATARS.length];
}

export { DEFAULT_AVATARS };

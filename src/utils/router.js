const listeners = [];

export function navigate(hash) {
  window.location.hash = hash;
}

export function getRoute() {
  const hash = window.location.hash.slice(1) || '/';
  const [path, ...rest] = hash.split('/').filter(Boolean);
  return { path: '/' + (path || ''), params: rest, full: hash };
}

export function onRouteChange(cb) {
  listeners.push(cb);
}

window.addEventListener('hashchange', () => {
  const route = getRoute();
  listeners.forEach(cb => cb(route));
});

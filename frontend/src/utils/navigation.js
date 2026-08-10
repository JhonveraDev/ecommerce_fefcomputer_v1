export function navigate(to, options = {}) {
  const target = to.startsWith('/') ? to : `/${to}`;
  window.history[options.replace ? 'replaceState' : 'pushState']({}, '', target);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: options.behavior ?? 'smooth' });
}
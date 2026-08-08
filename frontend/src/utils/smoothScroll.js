/** Smooth-scroll to a page section, accounting for the sticky guest nav. */
export function scrollToSection(hashOrId) {
  if (!hashOrId) return false;

  const id = String(hashOrId).replace(/^#/, '');
  const target = document.getElementById(id);
  if (!target) return false;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav = document.querySelector('.guest-nav');
  const offset = (nav?.offsetHeight ?? 72) + 12;
  const top = target.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(0, top),
    behavior: prefersReducedMotion ? 'auto' : 'smooth',
  });

  if (window.history?.replaceState) {
    window.history.replaceState(null, '', `#${id}`);
  }

  return true;
}

/** Click handler for in-page hash links (#home, #about, …). */
export function handleHashLinkClick(event) {
  const href = event.currentTarget.getAttribute('href');
  if (!href?.startsWith('#')) return;

  event.preventDefault();
  scrollToSection(href);
}

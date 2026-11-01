/* One-time, restrained section entrances. Content stays visible without JavaScript. */
(() => {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  if (motion.matches || !('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      observer.unobserve(entry.target);
      if (!motion.matches && entry.boundingClientRect.top > 40) {
        entry.target.animate([
          { opacity: .35, transform: 'translateY(18px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ], { duration: 600, easing: 'cubic-bezier(.2,.65,.3,1)' });
      }
    });
  }, { threshold: .12 });
  document.querySelectorAll('.deepa-purpose-intro,.deepa-purpose-grid,.section-heading,.founder-photo,.learning-title,.community-portrait').forEach(element => observer.observe(element));
  motion.addEventListener('change', () => { if (motion.matches) observer.disconnect(); });
})();

(() => {
  const bar = document.querySelector('.academy-navigation');
  if (!bar) return;
  const links = [...bar.querySelectorAll('nav a[href^="#"]')];
  const sections = links.map(link => document.querySelector(link.getAttribute('href')));
  let frame = 0;
  function update() {
    frame = 0;
    const height = bar.getBoundingClientRect().height;
    bar.classList.toggle('is-scrolled', scrollY > 32);
    let active = 0;
    sections.forEach((section, index) => {
      if (section && section.getBoundingClientRect().top <= height + 80) active = index;
    });
    links.forEach((link, index) => {
      if (index === active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  new ResizeObserver(() => {
    document.documentElement.style.setProperty('--academy-nav-height', `${bar.getBoundingClientRect().height}px`);
    schedule();
  }).observe(bar);
  addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', schedule, {passive:true});
  addEventListener('pageshow', schedule);
  update();
})();

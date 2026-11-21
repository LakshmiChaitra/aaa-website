(() => {
 const dock = document.querySelector('.quick-contact');
 const hero = document.querySelector('#home');
 if (!dock || !hero) return;
 // Keep the opening clear; contact remains one tap away throughout the rest of the page.
 new IntersectionObserver(entries => {
   dock.hidden = entries[0].isIntersecting;
 }, {threshold:0}).observe(hero);
})();

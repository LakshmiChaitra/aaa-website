(() => {
 const config = window.AAA_CONTENT || {};
 const url = (value) => { try { const parsed = new URL(value); return parsed.protocol === 'https:' ? parsed : null; } catch { return null; } };
 const review = document.querySelector('#google-reviews-link');
 const reviewUrl = url(config.googleReviewsUrl);
 if (reviewUrl) {
   review.href = reviewUrl.href; review.target = '_blank'; review.rel = 'noopener noreferrer';
   review.removeAttribute('aria-disabled'); review.setAttribute('aria-label','Read our Google reviews'); review.title = 'Google reviews';
 } else review.addEventListener('click', event => event.preventDefault());
 const invitation = document.querySelector('.upcoming-invitation');
 new IntersectionObserver(entries => { invitation.hidden = entries[0].isIntersecting; }, {threshold:0}).observe(document.querySelector('#home'));
})();

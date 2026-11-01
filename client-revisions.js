(() => {
 const config = window.AAA_CONTENT || {};
 const url = (value) => { try { const parsed = new URL(value); return parsed.protocol === 'https:' ? parsed : null; } catch { return null; } };
 const review = document.querySelector('#google-reviews-link');
 const reviewUrl = url(config.googleReviewsUrl);
 if (reviewUrl) {
   review.href = reviewUrl.href; review.target = '_blank'; review.rel = 'noopener noreferrer';
   review.removeAttribute('aria-disabled'); review.setAttribute('aria-label','Read our Google reviews'); review.title = 'Google reviews';
 } else review.addEventListener('click', event => event.preventDefault());
 const teachers = (config.teachers || []).filter(person => person.name && person.subject);
 if (teachers.length) {
   const grid = document.querySelector('#faculty-grid'); grid.replaceChildren();
   teachers.forEach(person => {
     const card = document.createElement('article'); card.className = 'faculty-card';
     if (person.photo) { const image = document.createElement('img'); image.src = person.photo; image.alt = person.name; image.loading = 'lazy'; image.width = 480; image.height = 600; card.append(image); }
     const name = document.createElement('h3'); name.textContent = person.name;
     const subject = document.createElement('span'); subject.className = 'faculty-subject'; subject.textContent = person.subject;
     card.append(name, subject);
     if (person.bio) { const bio = document.createElement('p'); bio.textContent = person.bio; card.append(bio); }
     grid.append(card);
   });
 }
 const invitation = document.querySelector('.upcoming-invitation');
 new IntersectionObserver(entries => { invitation.hidden = entries[0].isIntersecting; }, {threshold:0}).observe(document.querySelector('#home'));
})();

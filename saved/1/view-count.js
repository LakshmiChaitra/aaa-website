(() => {
 const count = document.querySelector('#website-view-count');
 if (!count) return;
 const controller = new AbortController();
 const timer = setTimeout(() => controller.abort(), 8000);
 fetch('/api/views', {method:'POST', credentials:'omit', signal:controller.signal})
  .then(response => { if (!response.ok) throw new Error(); return response.json(); })
  .then(data => {
   if (!Number.isSafeInteger(data.views) || data.views < 0) throw new Error();
   count.textContent = new Intl.NumberFormat('en-IN').format(data.views);
  })
  .catch(() => { count.textContent = 'Unavailable'; })
  .finally(() => clearTimeout(timer));
})();

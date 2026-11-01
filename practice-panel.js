function detailObjectMarkup(item,shape){
 const decoration=shape==='hand'?'<div class="hand-crown" aria-hidden="true"><img src="assets/objects/mudra-crown.svg" alt=""></div>':shape==='palette'?'<div class="palette-paints" aria-hidden="true"><i></i><i></i><i></i><i></i></div>':shape==='movement'?'<img class="movement-crown" src="assets/objects/movement.svg" alt="" aria-hidden="true">':'';
 return `<div class="sculpture-object shape-${shape}">${decoration}<div class="sculpture-surface"><div class="sculpture-copy"><p class="eyebrow">${item.tag}</p><h3 id="practice-title" tabindex="-1">${item.name}</h3><p class="sculpture-description">${item.description}</p><div class="sculpture-schedule"><span>${item.workshop?'WORKSHOP DETAILS':'YOUR WEEKLY PRACTICE'}</span>${item.slots.map(([day,time])=>`<div><span>${day}</span><strong>${time}</strong></div>`).join('')}</div>${item.note?`<p class="sculpture-note">${item.note}</p>`:''}<a class="button course-enquiry practice-enquire" href="#registration" data-course="${item.enquiry||item.name}" ${item.workshop?`data-workshop="${item.name}"`:''}>${item.workshop?'Register for this workshop':'Register for this class'} <span>↗</span></a><small>ANUSHA ART ACADEMY · PERSONAL ATTENTION</small></div></div>${shape==='mic'?'<div class="mic-cradle" aria-hidden="true"></div><div class="mic-stand" aria-hidden="true"></div>':''}${shape==='mat'?'<span class="mat-roll" aria-hidden="true"></span>':''}</div>`;
}

/* One reusable details panel: alongside the directory on desktop, a modal on phones. */
(() => {
  const directory = document.querySelector('#class-list');
  const workspace = document.querySelector('#practice-workspace');
  const panel = document.querySelector('#practice-panel');
  const content = document.querySelector('#practice-content');
  const closeButton = panel.querySelector('.practice-close');
  const compact = matchMedia('(max-width: 850px)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  let selected = null;
  let trigger = null;
  let restoreFocus = true;

  function renderDetails(item) {
    const shape = item.shape || (item.name.includes('Zumba') ? 'fitness' : ({mic:'mic',mudra:'hand',book:'book',movement:'movement',brush:'palette',mat:'mat'}[item.icon]));
    panel.dataset.shape = shape;
    content.innerHTML = detailObjectMarkup(item, shape);
  }

  function showPanel() {
    workspace.classList.add('has-detail');
    document.body.classList.toggle('practice-modal-open', compact.matches);
    panel.setAttribute('aria-modal', String(compact.matches));
    if (!panel.open) compact.matches ? panel.showModal() : panel.show();
  }

  function openDetails(item, button) {
    const wasOpen = panel.open;
    selected = item;
    trigger = button;
    restoreFocus = true;
    directory.querySelectorAll('[aria-expanded]').forEach(card => card.setAttribute('aria-expanded', String(card === button)));
    renderDetails(item);
    showPanel();
    panel.scrollTop = 0;
    content.querySelector('h3').focus({preventScroll:true});
    if (!reduced.matches) {
      content.getAnimations().forEach(animation => animation.cancel());
      content.animate([
        {opacity:0, transform:'perspective(900px) rotateY(-18deg) translateY(8px)'},
        {opacity:1, transform:'translateY(0)'}
      ], {duration:450, easing:'cubic-bezier(.2,.7,.2,1)'});
    }
  }

  function closePanel(shouldRestore = true) {
    restoreFocus = shouldRestore;
    if (panel.open) panel.close();
  }

  panel.addEventListener('close', () => {
    // A viewport change can close and immediately reopen the same dialog in another mode.
    if (panel.open) return;
    workspace.classList.remove('has-detail');
    document.body.classList.remove('practice-modal-open');
    directory.querySelectorAll('[aria-expanded]').forEach(card => card.setAttribute('aria-expanded','false'));
    if (restoreFocus && trigger?.isConnected && !trigger.hidden) trigger.focus({preventScroll:true});
    selected = null;
  });

  directory.addEventListener('click', event => {
    const card = event.target.closest('[data-class-index],[data-workshop-index]');
    if (!card) return;
    if (panel.open && trigger === card) { closePanel(); return; }
    const item = card.hasAttribute('data-class-index')
      ? courses[Number(card.dataset.classIndex)]
      : workshops[Number(card.dataset.workshopIndex)];
    openDetails(item, card);
  });
  closeButton.addEventListener('click', () => closePanel());
  panel.addEventListener('click', event => {
    if (event.target.closest('.practice-enquire')) closePanel(false);
    if (!compact.matches || event.target !== panel) return;
    const bounds = panel.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) closePanel();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && panel.open) { event.preventDefault(); closePanel(); }
  });

  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(item => item.setAttribute('aria-pressed',String(item === button)));
    let count = 0;
    directory.querySelectorAll('.course-card').forEach(card => {
      card.hidden = filter !== 'all' && card.dataset.category !== filter;
      if (!card.hidden) count++;
    });
    if (selected && filter !== 'all' && (selected.workshop ? 'workshop' : selected.category) !== filter) closePanel(false);
    document.querySelector('#class-count').textContent = `Showing ${count} ${count === 1 ? 'practice' : 'practices'}.`;
  }));

  compact.addEventListener('change', () => {
    if (!panel.open) return;
    panel.close();
    showPanel();
    content.querySelector('h3').focus({preventScroll:true});
  });
})();

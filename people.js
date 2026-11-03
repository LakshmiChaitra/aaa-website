(() => {
 const grid=document.querySelector('#faculty-grid');
 const previous=document.querySelector('#tutor-prev'),next=document.querySelector('#tutor-next'),position=document.querySelector('#tutor-position');
 const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
 const dots=document.querySelector('#tutor-dots');
 let activeIndex=0;
 function updateControls(){
  const cards=Array.from(grid.children);if(!cards.length)return;
  const gap=parseFloat(getComputedStyle(grid).columnGap)||0;
  activeIndex=Math.min(cards.length-1,Math.max(0,Math.round(grid.scrollLeft/(cards[0].getBoundingClientRect().width+gap))));
  previous.disabled=activeIndex===0;next.disabled=activeIndex===cards.length-1;
  const label=`${String(activeIndex+1).padStart(2,'0')} / ${String(cards.length).padStart(2,'0')}`;
  if(position.textContent!==label)position.textContent=label;
  cards.forEach((card,index)=>{card.inert=index!==activeIndex;});
  Array.from(dots.children).forEach((dot,index)=>{dot.setAttribute('aria-current',String(index===activeIndex));});
 }
 function goTo(index){const card=grid.firstElementChild;if(!card)return;const gap=parseFloat(getComputedStyle(grid).columnGap)||0;grid.scrollTo({left:index*(card.getBoundingClientRect().width+gap),behavior:reduced.matches?'instant':'smooth'});}
 function advance(direction){goTo(Math.min(grid.children.length-1,Math.max(0,activeIndex+direction)));}
 previous.addEventListener('click',()=>advance(-1));next.addEventListener('click',()=>advance(1));
 let frame=0;grid.addEventListener('scroll',()=>{if(!frame)frame=requestAnimationFrame(()=>{frame=0;updateControls();});},{passive:true});
 grid.addEventListener('keydown',event=>{if(event.target!==grid)return;if(event.key==='ArrowRight'||event.key==='ArrowLeft'){event.preventDefault();advance(event.key==='ArrowRight'?1:-1);}});
 new ResizeObserver(updateControls).observe(grid);
 const teachers=(window.AAA_CONTENT?.teachers||[]).filter(person=>person.name&&person.subject);
 function text(tag,value,className){const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;}
 function render(filter='all'){
  grid.replaceChildren();dots.replaceChildren();
  for(const person of teachers.filter(p=>filter==='all'||p.category===filter)){
   const card=document.createElement('article');card.className='faculty-card';if(person.name==='Anusha Suryas')card.classList.add('founder-tutor-card');
   if(person.photo){const figure=document.createElement('div');figure.className='tutor-portrait';const image=document.createElement('img');image.src=person.photo;image.alt=person.name+' · '+person.subject;image.loading='lazy';image.width=600;image.height=700;image.style.objectPosition=person.position||'center';if(person.zoom){image.style.transform=`scale(${person.zoom})`;image.style.transformOrigin=person.position||'center';}figure.append(image);card.append(figure);}
   if(person.name==='Anusha Suryas')card.append(text('span','Founder','tutor-founder-ribbon'));
   const copy=document.createElement('div');copy.className='tutor-copy';
   copy.append(text('span',person.subject,'faculty-subject'),text('h3',person.name));
   if(person.experience)copy.append(text('span',person.experience,'tutor-experience'));
   copy.append(text('p',person.bio));
   if(person.highlights?.length){const details=document.createElement('details');details.className='tutor-details';details.append(text('summary','Training & highlights'));const ul=document.createElement('ul');for(const line of person.highlights)ul.append(text('li',line));details.append(ul);copy.append(details);}
   card.append(copy);grid.append(card);
   const index=grid.children.length-1;card.setAttribute('role','group');card.setAttribute('aria-roledescription','slide');card.setAttribute('aria-label',person.name+' · '+person.subject);
   const dot=document.createElement('button');dot.type='button';dot.setAttribute('aria-label','Show '+person.name+' · '+person.subject);dot.addEventListener('click',()=>goTo(index));dots.append(dot);
  }
  grid.scrollLeft=0;updateControls();
 }
 document.querySelectorAll('[data-tutor-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-tutor-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));render(button.dataset.tutorFilter);}));
 render();
 const dialog=document.querySelector('#people-photo-dialog');let opener=null;
 document.querySelectorAll('[data-people-photo]').forEach(button=>button.addEventListener('click',()=>{opener=button;const image=dialog.querySelector('img');image.src=button.dataset.peoplePhoto;image.alt=button.dataset.caption;dialog.querySelector('p').textContent=button.dataset.caption;dialog.showModal();}));
 dialog.querySelector('button').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
})();

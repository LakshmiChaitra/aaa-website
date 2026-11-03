(() => {
 const grid=document.querySelector('#faculty-grid');
 const teachers=(window.AAA_CONTENT?.teachers||[]).filter(person=>person.name&&person.subject);
 function text(tag,value,className){const el=document.createElement(tag);el.textContent=value;if(className)el.className=className;return el;}
 function render(filter='all'){
  grid.replaceChildren();
  for(const person of teachers.filter(p=>filter==='all'||p.category===filter)){
   const card=document.createElement('article');card.className='faculty-card';
   if(person.photo){const figure=document.createElement('div');figure.className='tutor-portrait';const image=document.createElement('img');image.src=person.photo;image.alt=person.name+' · '+person.subject;image.loading='lazy';image.width=600;image.height=700;image.style.objectPosition=person.position||'center';if(person.zoom){image.style.transform=`scale(${person.zoom})`;image.style.transformOrigin=person.position||'center';}figure.append(image);card.append(figure);}
   const copy=document.createElement('div');copy.className='tutor-copy';
   copy.append(text('span',person.subject,'faculty-subject'),text('h3',person.name));
   if(person.experience)copy.append(text('span',person.experience,'tutor-experience'));
   copy.append(text('p',person.bio));
   if(person.highlights?.length){const details=document.createElement('details');details.className='tutor-details';details.append(text('summary','Training & highlights'));const ul=document.createElement('ul');for(const line of person.highlights)ul.append(text('li',line));details.append(ul);copy.append(details);}
   card.append(copy);grid.append(card);
  }
 }
 document.querySelectorAll('[data-tutor-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-tutor-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));render(button.dataset.tutorFilter);}));
 render();
 const dialog=document.querySelector('#people-photo-dialog');let opener=null;
 document.querySelectorAll('[data-people-photo]').forEach(button=>button.addEventListener('click',()=>{opener=button;const image=dialog.querySelector('img');image.src=button.dataset.peoplePhoto;image.alt=button.dataset.caption;dialog.querySelector('p').textContent=button.dataset.caption;dialog.showModal();}));
 dialog.querySelector('button').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>opener?.focus({preventScroll:true}));
})();

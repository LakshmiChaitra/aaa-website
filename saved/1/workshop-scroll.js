(() => {
 const trigger=document.querySelector('.upcoming-invitation');
 const dialog=document.querySelector('#weekly-workshops');
 const list=dialog.querySelector('.weekly-plan');
 trigger.addEventListener('click',event=>{event.preventDefault();dialog.showModal();document.body.classList.add('workshops-open');refreshDocument();});
 dialog.querySelector('.weekly-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{document.body.classList.remove('workshops-open');trigger.focus({preventScroll:true});});
 function emptyState(){list.replaceChildren();const title=document.createElement('h3');title.textContent='New workshops will be announced here';const p=document.createElement('p');p.textContent='Ask us about Sunday music, dance and art workshops. Dates and batches are confirmed based on enrolments.';const link=document.createElement('a');link.className='text-link';link.href='https://wa.me/919000129402?text=Hello%2C%20I%E2%80%99d%20like%20to%20know%20about%20upcoming%20workshops.';link.target='_blank';link.rel='noopener noreferrer';link.textContent='Enquire about workshops ↗';list.append(title,p,link);}
 function render(items){list.replaceChildren();for(const item of items){if(!item.title)continue;const row=document.createElement('article');const title=document.createElement('h3');title.textContent=item.title;row.append(title);for(const key of ['when','details']){if(item[key]){const p=document.createElement('p');p.textContent=item[key];row.append(p);}}list.append(row);}if(!list.childElementCount)emptyState();}
 render(window.AAA_CONTENT?.weeklyWorkshops||[]);
 let refreshing=false;
 async function refreshDocument(){
  const url=window.AAA_CONTENT?.eventsDocumentUrl;
  if(!url||refreshing)return;
  refreshing=true;
  try{
   const response=await fetch(url,{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(10000)});
   if(!response.ok||!(response.headers.get('content-type')||'').includes('text/plain'))throw Error();
   const text=(await response.text()).replace(/^\uFEFF/,'').trim();
   list.replaceChildren();
   const draftLines=new Set(['hi','hello welcome demo','hello welcome demo i am anush a']);
   const onlyDraft=text.split(/\r?\n/).filter(line=>line.trim()).every(line=>draftLines.has(line.trim().toLowerCase().replace(/\s+/g,' ')));
   if(text&&!onlyDraft){const paragraph=document.createElement('p');paragraph.className='events-document-copy';paragraph.textContent=text;list.append(paragraph);}else emptyState();
  }catch{if(!list.textContent.trim()){const message=document.createElement('p');message.textContent='Updates are temporarily unavailable. Please try again shortly.';list.replaceChildren(message);}}
  finally{refreshing=false;}
 }
 setInterval(()=>{if(dialog.open&&!document.hidden)refreshDocument();},60000);
 const endpoint=window.AAA_CONTENT?.workshopsEndpoint;
 if(endpoint && new URL(endpoint,location.href).protocol==='https:')fetch(endpoint,{signal:AbortSignal.timeout(8000)}).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json();}).then(data=>{if(Array.isArray(data.workshops))render(data.workshops);}).catch(()=>{});
})();

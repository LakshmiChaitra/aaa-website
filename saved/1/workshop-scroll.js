(() => {
 const trigger=document.querySelector('.upcoming-invitation');
 const dialog=document.querySelector('#weekly-workshops');
 const list=dialog.querySelector('.weekly-plan');
 trigger.addEventListener('click',event=>{event.preventDefault();dialog.showModal();document.body.classList.add('workshops-open');refreshDocument();});
 dialog.querySelector('.weekly-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
 dialog.addEventListener('close',()=>{document.body.classList.remove('workshops-open');trigger.focus({preventScroll:true});});
 function render(items){list.replaceChildren();for(const item of items){if(!item.title)continue;const row=document.createElement('article');const title=document.createElement('h3');title.textContent=item.title;row.append(title);for(const key of ['when','details']){if(item[key]){const p=document.createElement('p');p.textContent=item[key];row.append(p);}}list.append(row);}}
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
   if(text){const paragraph=document.createElement('p');paragraph.className='events-document-copy';paragraph.textContent=text;list.append(paragraph);}
  }catch{if(!list.textContent.trim()){const message=document.createElement('p');message.textContent='Updates are temporarily unavailable. Please try again shortly.';list.replaceChildren(message);}}
  finally{refreshing=false;}
 }
 setInterval(()=>{if(dialog.open&&!document.hidden)refreshDocument();},60000);
 const endpoint=window.AAA_CONTENT?.workshopsEndpoint;
 if(endpoint && new URL(endpoint,location.href).protocol==='https:')fetch(endpoint,{signal:AbortSignal.timeout(8000)}).then(r=>{if(!r.ok)throw Error('Unavailable');return r.json();}).then(data=>{if(Array.isArray(data.workshops))render(data.workshops);}).catch(()=>{});
})();

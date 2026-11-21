/* Public Slides renders use the same-origin image endpoint, without Google cookies. */
(() => {
 let busy=false,lastFetch=0;
 async function refreshAlbum(){
  const source=window.AAA_CONTENT?.albumSlidesUrl;
  if(!source||busy||Date.now()-lastFetch<60000||albumDialog.open)return;
  busy=true;
  try{
   const response=await fetch(source,{credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(12000)});
   if(!response.ok)throw Error('Album unavailable');
   const view=new DOMParser().parseFromString(await response.text(),'text/html');
   const slides=[...view.querySelectorAll('.slide-content')];
   if(!slides.length)throw Error('No slides');
   const incoming=[];
   for(const [index,slide] of slides.entries()){
    const match=(slide.getAttribute('style')||'').match(/background-image:\s*url\(([^)]+)\)/);
    if(!match)continue;
    const url=new URL(match[1].replace(/^["']|["']$/g,''));
    if(url.origin!=='https://docs.google.com'||!url.pathname.endsWith('/viewpage'))continue;
    if(slides.length===1&&url.searchParams.get('rev')==='2')continue;
    incoming.push({src:`/api/album-image?url=${encodeURIComponent(url.href)}`,category:'academy',title:`Academy album · ${index+1}`,detail:'From the academy’s photo presentation',fromSlides:true});
   }
   for(let i=albumPhotos.length-1;i>=0;i--)if(albumPhotos[i].fromSlides)albumPhotos.splice(i,1);
   albumPhotos.unshift(...incoming.reverse());
   renderAlbum();lastFetch=Date.now();
  }catch{console.warn('Slides album refresh unavailable; existing photographs remain.');}
  finally{busy=false;}
 }
 const section=document.querySelector('#album');
 new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting))refreshAlbum();},{rootMargin:'300px'}).observe(section);
 setInterval(()=>{if(!document.hidden){const rect=section.getBoundingClientRect();if(rect.top<innerHeight&&rect.bottom>0)refreshAlbum();}},60000);
})();

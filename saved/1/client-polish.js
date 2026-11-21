document.querySelector('#guide-kids')?.addEventListener('click',()=>{
 document.querySelector('[data-filter="kids"]').click();
 document.querySelector('#classes').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
});
if(new URLSearchParams(location.search).get('classes')==='kids'){
 document.querySelector('[data-filter="kids"]')?.click();
}

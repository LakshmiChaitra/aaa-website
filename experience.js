// One player, many stories. Empty sources remain clearly labelled placeholders.
const filmList=document.querySelector('#film-list'),video=document.querySelector('#academy-video'),embed=document.querySelector('#academy-embed');
filmList.innerHTML=ACADEMY_VIDEOS.map((film,index)=>`<button class="film-choice" type="button" data-film="${index}" aria-pressed="${index===0}"><span class="film-thumb"><img src="${film.poster}" alt="" loading="lazy"><span aria-hidden="true">▷</span></span><span><small>0${index+1} / ${film.category}</small><strong>${film.label}</strong><em>${film.src?'Watch video':'Video to be added'}</em></span><span class="film-choice-arrow" aria-hidden="true">↗</span></button>`).join('');
function selectFilm(index){const film=ACADEMY_VIDEOS[index];video.pause();video.removeAttribute('src');video.load();embed.removeAttribute('src');embed.hidden=true;video.hidden=true;const poster=document.querySelector('#film-poster'),placeholder=document.querySelector('#film-placeholder'),wash=document.querySelector('.film-wash');poster.src=film.poster;poster.alt=film.label+' video poster';poster.hidden=Boolean(film.src);placeholder.hidden=Boolean(film.src);wash.hidden=Boolean(film.src);document.querySelector('#film-placeholder-title').textContent=film.label;document.querySelector('#film-category').textContent=film.category;document.querySelector('#film-title').textContent=film.title;document.querySelector('#film-subtitle').textContent=film.subtitle;filmList.querySelectorAll('button').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));if(film.src){if(film.type==='embed'){embed.src=film.src;embed.hidden=false;}else{video.src=film.src;video.poster=film.poster;video.hidden=false;video.load();}}}
filmList.addEventListener('click',event=>{const choice=event.target.closest('[data-film]');if(choice)selectFilm(Number(choice.dataset.film));});
selectFilm(0);
const albumPhotos=[
 {file:'p13-01',category:'dance',title:'Together on the Shilparamam stage',detail:'Shilparamam programme · January 2026'},
 {file:'p11-01',category:'dance',title:'An academy gathering to remember',detail:'Music and dance · 2025'},
 {file:'p01-03',category:'music',title:'A voice, a microphone, a moment',detail:'Anusha Suryas · Music performance'},
 {file:'p10-02',category:'dance',title:'Learning to tell a story together',detail:'Kuchipudi · Student performers'},
 {file:'p09-02',category:'recognition',title:'A moment of recognition',detail:'From Anusha’s collection'},
 {file:'p11-02',category:'dance',title:'An evening of shared celebration',detail:'Academy performance · 2025'},
 {file:'p09-01',category:'dance',title:'Tradition, carried forward',detail:'Kuchipudi · Academy performers'},
 {file:'p10-01',category:'music',title:'Music, with feeling',detail:'Anusha Suryas · Singing'},
 {file:'p09-04',category:'dance',title:'Finding our rhythm',detail:'Dance · Young performers'},
 {file:'p09-03',category:'recognition',title:'Celebrating our young artists',detail:'Students and their achievements'},
 {file:'p10-04',category:'dance',title:'Every gesture has a story',detail:'Kuchipudi · Student performers'},
 {file:'p12-02',category:'recognition',title:'Honouring a journey in the arts',detail:'From Anusha’s collection'},
 {file:'p01-04',category:'dance',title:'Expression in every movement',detail:'Anusha Suryas · Classical dance'},
 {file:'p07-01',category:'music',title:'Memories from music and television',detail:'A collage from Anusha’s profile'},
 {file:'p04-01',category:'recognition',title:'With gratitude to our mentors',detail:'From Anusha’s collection'},
 {file:'p10-03',category:'recognition',title:'A shared moment of appreciation',detail:'From the academy’s collection'},
 {file:'p12-01',category:'dance',title:'A moment before the memories',detail:'From Anusha’s collection'},
 {file:'anusha-art-1',ext:'jpg',category:'art',title:'Colourful floral mandala',detail:'Artwork by Anusha Suryas'},
 {file:'anusha-art-2',ext:'jpg',category:'art',title:'Radiating mandala',detail:'Artwork by Anusha Suryas'},
 {file:'anusha-art-3',ext:'jpg',category:'art',title:'Lotus mandala',detail:'Artwork by Anusha Suryas'},
 {file:'anusha-art-4',ext:'jpg',category:'art',title:'Ornamental floral design',detail:'Artwork by Anusha Suryas'},
 {file:'anusha-art-5',ext:'jpg',category:'art',title:'Swans beside a flowering tree',detail:'Artwork by Anusha Suryas'},
 {file:'anusha-art-6',ext:'jpg',category:'art',title:'Flowers in a colourful vase',detail:'Artwork by Anusha Suryas'},
 {file:'anusha-art-7',ext:'jpg',category:'art',title:'Birds and flowers pencil drawing',detail:'Artwork by Anusha Suryas'}
];
const albumGrid=document.querySelector('#album-grid'),more=document.querySelector('#album-more');let albumFilter='all',showAllPhotos=false,albumIndex=0,albumTrigger=null;
const categoryLabels={art:'ART BY ANUSHA',dance:'DANCE & PERFORMANCE',music:'MUSIC',recognition:'RECOGNITION & MENTORS'};
function filteredAlbum(){return albumPhotos.map((photo,index)=>({...photo,index})).filter(photo=>albumFilter==='all'||photo.category===albumFilter);}
function renderAlbum(){const filtered=filteredAlbum(),shown=showAllPhotos?filtered:filtered.slice(0,9);albumGrid.innerHTML=shown.map(photo=>`<figure><button class="album-photo ${photo.category==='art'?'album-artwork':''}" type="button" data-album-index="${photo.index}" aria-label="Open photograph: ${photo.title}"><img src="assets/album/${photo.file}.${photo.ext||'webp'}" alt="${photo.title}" loading="lazy" width="1200" height="800"><span class="album-photo-overlay" aria-hidden="true"><b>↗</b></span></button></figure>`).join('');document.querySelector('#album-count').textContent=`${String(shown.length).padStart(2,'0')} / ${String(filtered.length).padStart(2,'0')} images`;more.hidden=shown.length===filtered.length;}
document.querySelectorAll('[data-album-filter]').forEach(button=>button.addEventListener('click',()=>{albumFilter=button.dataset.albumFilter;showAllPhotos=false;document.querySelectorAll('[data-album-filter]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));renderAlbum();}));more.addEventListener('click',()=>{showAllPhotos=true;renderAlbum();});
const albumDialog=document.querySelector('#album-dialog');function showAlbumPhoto(index){albumIndex=index;const photo=albumPhotos[index];document.querySelector('#album-large').src=`assets/album/${photo.file}.${photo.ext||'webp'}`;document.querySelector('#album-large').alt=photo.title+'. '+photo.detail;document.querySelector('#album-large-caption').textContent=photo.title;document.querySelector('#album-large-category').textContent=photo.detail;const filtered=filteredAlbum();document.querySelector('#album-position').textContent=`${String(filtered.findIndex(photo=>photo.index===index)+1).padStart(2,'0')} / ${String(filtered.length).padStart(2,'0')} · ANUSHA ART ACADEMY`;}
function albumStep(direction){const filtered=filteredAlbum(),position=filtered.findIndex(photo=>photo.index===albumIndex);showAlbumPhoto(filtered[(position+direction+filtered.length)%filtered.length].index);}
albumGrid.addEventListener('click',event=>{const button=event.target.closest('[data-album-index]');if(!button)return;albumTrigger=button;showAlbumPhoto(Number(button.dataset.albumIndex));albumDialog.showModal();document.body.classList.add('album-is-open');});document.querySelector('.album-prev').addEventListener('click',()=>albumStep(-1));document.querySelector('.album-next').addEventListener('click',()=>albumStep(1));document.querySelector('.album-close').addEventListener('click',()=>albumDialog.close());albumDialog.addEventListener('keydown',event=>{if(event.key==='ArrowRight'){event.preventDefault();albumStep(1);}if(event.key==='ArrowLeft'){event.preventDefault();albumStep(-1);}});albumDialog.addEventListener('close',()=>{document.body.classList.remove('album-is-open');albumTrigger?.focus({preventScroll:true});});albumDialog.addEventListener('click',event=>{if(event.target===albumDialog)albumDialog.close();});
renderAlbum();

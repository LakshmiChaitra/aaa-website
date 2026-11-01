// Cycle photographs while the homepage is visible; resume automatically on return.
(()=>{
 const hero=document.querySelector('.photographic-hero');
 if(!hero)return;
 const scenes=[...hero.querySelectorAll('.hero-scene')];
 const buttons=[...hero.querySelectorAll('[data-scene]')];
 const caption=hero.querySelector('#scene-caption');
 const labels=['Our academy community','The art of Kuchipudi','Our Dasara workshop'];
 let current=0,timer=null,inView=false;
 function show(index){current=index;scenes.forEach((scene,i)=>scene.classList.toggle('is-current',i===index));buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));caption.textContent=`0${index+1} / ${labels[index]}`;}
 function schedule(){clearInterval(timer);timer=null;if(inView&&!document.hidden)timer=setInterval(()=>show((current+1)%scenes.length),8500);}
 buttons.forEach((button,index)=>button.addEventListener('click',()=>{show(index);schedule();}));
 document.addEventListener('visibilitychange',schedule);
 const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting&&entries[0].intersectionRatio>=0.05;schedule();},{threshold:[0,0.05]});observer.observe(hero);
})();

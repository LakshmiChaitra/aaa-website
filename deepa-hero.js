/* Hero-local lighting, no dependencies. One interpolated position drives flame and mask. */
(()=>{
  const hero=document.querySelector('.deepa-hero');
  if(!hero)return;
  const art=hero.querySelector('.deepa-art');
  const lit=hero.querySelector('.deepa-lit');
  const ambient=hero.querySelector('.deepa-ambient');
  const diya=hero.querySelector('.deepa-diya');
  const fine=matchMedia('(hover: hover) and (pointer: fine)');
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const masks=CSS.supports('mask-image','radial-gradient(black,transparent)')||CSS.supports('-webkit-mask-image','radial-gradient(black,transparent)');
  if(!masks)return; // Static, illuminated sculpture if masks are unavailable.
  hero.classList.add('deepa-ready');
  let activated=false;
  const hint=hero.querySelector('.deepa-discover');
  function activate(){activated=true;art.setAttribute('aria-pressed','true');if(hint)hint.textContent=fine.matches?'Move the diya to explore':'Touch and explore the light';}
  let bounds,stage,x=0,y=0,tx=0,ty=0,light=0,goal=0;
  let frame=0,lastTime=0,phase=0,visible=false,mouse=false,touch=false,keyboard=false;
  const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));
  function measure(){
    bounds=hero.getBoundingClientRect();
    const rect=art.getBoundingClientRect();
    stage={x:rect.left-bounds.left,y:rect.top-bounds.top,width:rect.width,height:rect.height};
  }
  function center(){tx=stage.x+stage.width*.5;ty=stage.y+stage.height*.43;x=tx;y=ty;}
  function paint(){
    art.style.setProperty('--light-x',`${(x-stage.x).toFixed(2)}px`);
    art.style.setProperty('--light-y',`${(y-stage.y).toFixed(2)}px`);
    lit.style.opacity=light.toFixed(3);
    ambient.style.opacity=light.toFixed(3);
    // Flame centre in the 44px SVG is (22,12), also the radial-light origin.
    diya.style.transform=`translate3d(${(x-22).toFixed(2)}px,${(y-12).toFixed(2)}px,0)`;
    diya.style.opacity=mouse?light.toFixed(3):'0';
  }
  function wake(){if(!frame&&visible&&!document.hidden)frame=requestAnimationFrame(tick);}
  function tick(now){
    frame=0;
    if(!visible||document.hidden)return;
    const dt=Math.min(48,lastTime?now-lastTime:16);lastTime=now;
    const automatic=activated&&!fine.matches&&!touch&&!keyboard;
    if(automatic){
      goal=.95;
      if(!reduced.matches){
        phase+=dt*.00023;
        tx=stage.x+stage.width*(.5+Math.sin(phase)*.16);
        ty=stage.y+stage.height*(.43+Math.cos(phase*.8)*.13);
      }
    }
    const follow=reduced.matches?1:1-Math.exp(-dt/42);
    const fade=reduced.matches?1:1-Math.exp(-dt/125);
    x+=(tx-x)*follow;y+=(ty-y)*follow;light+=(goal-light)*fade;
    if(Math.abs(goal-light)<.002)light=goal;
    paint();
    const unsettled=Math.abs(tx-x)+Math.abs(ty-y)>.05||Math.abs(goal-light)>.002;
    if(unsettled||(automatic&&!reduced.matches))wake();
  }
  function mousePosition(event){
    if(!activated||event.pointerType!=='mouse'||!fine.matches)return;
    const first=!mouse;
    if(first)measure();
    mouse=true;keyboard=false;goal=1;hero.dataset.pointer='true';
    tx=event.clientX-bounds.left;ty=event.clientY-bounds.top;
    if(first){x=tx;y=ty;}
    wake();
  }
  function leave(){mouse=false;hero.dataset.pointer='false';if(fine.matches&&!keyboard)goal=0;wake();}
  hero.addEventListener('pointerenter',mousePosition,{passive:true});
  hero.addEventListener('pointermove',mousePosition,{passive:true});
  hero.addEventListener('pointerleave',leave,{passive:true});
  function touchPosition(event){
    if(event.pointerType==='mouse')return;
    if(event.type==='pointerdown'){activate();touch=true;keyboard=false;measure();}
    if(!touch)return;
    tx=clamp(event.clientX-bounds.left,stage.x,stage.x+stage.width);
    ty=clamp(event.clientY-bounds.top,stage.y,stage.y+stage.height);
    goal=1;wake();
  }
  art.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'){activate();mousePosition(event);}else touchPosition(event);},{passive:true});
  art.addEventListener('pointermove',touchPosition,{passive:true});
  function touchEnd(){touch=false;if(reduced.matches)center();wake();}
  window.addEventListener('pointerup',touchEnd,{passive:true});
  window.addEventListener('pointercancel',touchEnd,{passive:true});
  art.addEventListener('focus',()=>{
    if(!activated||mouse||touch)return;
    measure();keyboard=true;goal=1;center();wake();
  });
  art.addEventListener('keydown',event=>{
    if(event.key==='Enter'||event.key===' '){event.preventDefault();activate();measure();center();keyboard=true;goal=1;wake();return;}
    const directions={ArrowLeft:[-30,0],ArrowRight:[30,0],ArrowUp:[0,-30],ArrowDown:[0,30]};
    if(event.key==='Escape'){activated=false;art.setAttribute('aria-pressed','false');if(hint)hint.textContent='Click or tap to illuminate';mouse=false;hero.dataset.pointer='false';goal=0;keyboard=true;wake();return;}
    if(!activated||!directions[event.key])return;
    event.preventDefault();
    if(!keyboard){measure();center();}
    mouse=false;hero.dataset.pointer='false';keyboard=true;goal=1;
    const [dx,dy]=directions[event.key];
    tx=clamp(tx+dx,stage.x,stage.x+stage.width);ty=clamp(ty+dy,stage.y,stage.y+stage.height);wake();
  });
  art.addEventListener('blur',()=>{keyboard=false;if(fine.matches&&!mouse)goal=0;wake();});
  hero.addEventListener('focusin',event=>{if(event.target!==art){mouse=false;hero.dataset.pointer='false';if(fine.matches){goal=0;wake();}}});
  function resetMode(){measure();center();mouse=false;touch=false;keyboard=false;hero.dataset.pointer='false';goal=activated&&!fine.matches?1:0;lastTime=0;wake();}
  fine.addEventListener('change',resetMode);reduced.addEventListener('change',resetMode);
  new ResizeObserver(()=>{measure();if(!mouse&&!touch&&!keyboard)center();wake();}).observe(hero);
  new IntersectionObserver(entries=>{
    visible=entries[0].isIntersecting;
    if(visible){measure();lastTime=0;wake();}
    else{cancelAnimationFrame(frame);frame=0;leave();}
  },{threshold:0}).observe(hero);
  // Cached geometry is refreshed on scroll, never repeatedly read in animation frames.
  window.addEventListener('scroll',()=>{if(visible){measure();if(mouse){leave();}}},{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){cancelAnimationFrame(frame);frame=0;leave();}
    else{lastTime=0;wake();}
  });
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(frame);frame=0;});
  measure();center();paint();
})();

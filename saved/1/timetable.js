(() => {
 const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
 const schedule = [
  {name:'Yoga',kind:'wellbeing',label:'ONLINE & OFFLINE · 3 BATCHES',days:{0:'6–7 a.m. / 7–8 a.m. / 8–9 a.m.',1:'6–7 a.m. / 7–8 a.m. / 8–9 a.m.',2:'6–7 a.m. / 7–8 a.m. / 8–9 a.m.',3:'6–7 a.m. / 7–8 a.m. / 8–9 a.m.',4:'6–7 a.m. / 7–8 a.m. / 8–9 a.m.'}},
  {name:'Carnatic music',kind:'music',days:{0:'5–6 p.m.',2:'5–6 p.m.',5:'11 a.m.–12 noon'}},
  {name:'Kuchipudi dance',kind:'dance',days:{0:'6–7 p.m.',2:'6–7 p.m.',5:'12 noon–1 p.m.'}},
  {name:'Shloka classes',kind:'music',days:{4:'4:30–5:30 p.m.',5:'10:30–11 a.m.'}},
  {name:'Western dance',kind:'dance',days:{1:'5–6 p.m.',3:'5–6 p.m.',5:'5:45–7 p.m.'}},
  {name:'Art classes',kind:'art',days:{0:'5–6 p.m.',2:'5–6 p.m.'}},
  {name:'Zumba fitness',kind:'wellbeing',label:'ADULTS',days:{1:'6–7 p.m.',3:'6–7 p.m.',4:'6–7 p.m.'}},
  {name:'Keyboard classes',kind:'music',days:{0:'6–7 p.m.',2:'6–7 p.m.'}},
  {name:'Sankeertanas workshop',kind:'workshop',label:'BASED ON ENROLMENTS',days:{0:'10:30 a.m.–12 noon',1:'10:30 a.m.–12 noon',2:'10:30 a.m.–12 noon',3:'10:30 a.m.–12 noon'}},
  
 ];
 schedule.forEach(item=>{if(item.name!=='Keyboard classes')item.days[6]='Sunday workshop · On enrolment';});
 const body = document.querySelector('#week-table-body');
 const head = document.querySelector('.week-table thead tr');
 const agenda = document.querySelector('#day-agenda');
 const table = document.querySelector('.timetable-scroll');
 const phone = matchMedia('(max-width:700px)');
 const grid = document.querySelector('.week-table');
 const stage = document.createElement('div');
 stage.className = 'timetable-rotation-stage';
 grid.before(stage); stage.append(grid);
 function sizeRotation(){
  if(!phone.matches){stage.style.width='';stage.style.height='';grid.style.transform='';return;}
  const width=grid.offsetWidth,height=grid.offsetHeight;
  if(!width||!height||!table.clientWidth)return;
  const navHeight=document.querySelector('.academy-navigation')?.getBoundingClientRect().height||80;
  const availableHeight=Math.max(240,innerHeight-navHeight-24);
  const scale=Math.min((table.clientWidth-2)/height,availableHeight/width);
  stage.style.width=`${height*scale}px`;
  stage.style.height=`${width*scale}px`;
  grid.style.transform=`translateX(${height*scale}px) rotate(90deg) scale(${scale})`;
 }
 new ResizeObserver(sizeRotation).observe(table);
 const visibleSchedules=new Map();
 const scheduleObserver=new IntersectionObserver(entries=>{for(const entry of entries)visibleSchedules.set(entry.target,entry.isIntersecting);document.body.classList.toggle('timetable-reading',phone.matches&&[...visibleSchedules.values()].some(Boolean));},{threshold:0.2});
 scheduleObserver.observe(table);scheduleObserver.observe(agenda);
 document.fonts.ready.then(sizeRotation);
 let selectedDay = 'all';
 const timeCell = value => phone.matches && value === 'Sunday workshop · On enrolment' ? '<span class="schedule-time" aria-label="Sunday workshop, based on enrolments">Workshop*</span>' : value ? `<span class="schedule-time">${value.replaceAll(' / ','<br>')}</span>` : '<span class="schedule-empty" aria-label="No scheduled class">—</span>';
 function render(){
  table.setAttribute('aria-label',phone.matches?'Weekly timetable rotated 90 degrees':'Weekly timetable');
  if(phone.matches){
   head.innerHTML = '<th scope="col">Your practice</th>'+weekdays.map(day=>`<th scope="col">${day}</th>`).join('');
   body.innerHTML = schedule.map(item=>`<tr><th scope="row"><i class="schedule-dot ${item.kind}" aria-hidden="true"></i><span>${item.name}${item.label?`<small>${item.label}</small>`:''}</span></th>${weekdays.map((_,day)=>`<td>${timeCell(item.days[day])}</td>`).join('')}</tr>`).join('');
   table.hidden=selectedDay!=='all';agenda.hidden=selectedDay==='all';
   const column=selectedDay==='all'?-1:Number(selectedDay)+1;
   document.querySelectorAll('.week-table tr').forEach(row=>[...row.children].forEach((cell,index)=>cell.classList.toggle('selected-day',index===column)));

  }else{
   head.innerHTML = '<th scope="col">Your practice</th>'+weekdays.map(day=>`<th scope="col">${day}</th>`).join('');
   body.innerHTML = schedule.map(item=>`<tr><th scope="row"><i class="schedule-dot ${item.kind}" aria-hidden="true"></i><span>${item.name}${item.label?`<small>${item.label}</small>`:''}</span></th>${weekdays.map((_,day)=>`<td>${timeCell(item.days[day])}</td>`).join('')}</tr>`).join('');
   table.hidden=selectedDay!=='all';agenda.hidden=selectedDay==='all';
   if(selectedDay!=='all'){
    const day=Number(selectedDay);
    agenda.innerHTML=`<h3>${weekdays[day]} at the academy</h3><div class="day-agenda-grid">${schedule.filter(item=>item.days[day]).map(item=>`<article><i class="schedule-dot ${item.kind}" aria-hidden="true"></i><div><h4>${item.name}</h4><p>${item.days[day].replaceAll(' / ','<br>')}</p>${item.label?`<small>${item.label}</small>`:''}</div></article>`).join('')}</div>`;
   }
  }
  if(selectedDay!=='all'){
   const day=Number(selectedDay);
   const dayItems=day===6?[]:schedule.filter(item=>item.days[day]);
   agenda.innerHTML=`<h3>${weekdays[day]} at the academy</h3>${day===6?'<p>Sunday music, dance and art workshops run based on enrolments. Contact the academy for the next dates and timings.</p><a class="text-link" href="#registration">Ask about a Sunday workshop ↗</a>':`<div class="day-agenda-grid">${dayItems.map(item=>`<article><i class="schedule-dot ${item.kind}" aria-hidden="true"></i><div><h4>${item.name}</h4><p>${item.days[day].replaceAll(' / ','<br>')}</p><small>${['Yoga','Carnatic music'].includes(item.name)?'ONLINE & OFFLINE':'AT THE ACADEMY'}${item.label?' · '+item.label.replace('ONLINE & OFFLINE · ',''):''}</small></div></article>`).join('')}</div>`}`;
  }
  document.querySelector('#timetable-swipe-hint').textContent=selectedDay==='all'?'Turn your phone to read the full timetable, or tap a day for an upright list.':'Timings in IST · choose Full week to return to the complete timetable.';
  sizeRotation();
 }
 document.querySelectorAll('[data-day]').forEach(button=>button.addEventListener('click',()=>{
  selectedDay=button.dataset.day;
  document.querySelectorAll('[data-day]').forEach(other=>other.setAttribute('aria-pressed',String(other===button)));
  render();
 }));
 phone.addEventListener('change',()=>{render();sizeRotation();});
 addEventListener('resize',sizeRotation);
 render();
})();

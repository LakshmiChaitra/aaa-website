(() => {
 const weekdays = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
 const schedule = [
  {name:'Yoga',kind:'wellbeing',label:'THREE MORNING BATCHES',days:{0:'6–7 a.m. / 7–8 a.m. / 8–9 a.m.',1:'6–7 a.m. / 7–8 a.m. / 8–9 a.m.',2:'6–7 a.m. / 7–8 a.m. / 8–9 a.m.',3:'6–7 a.m. / 7–8 a.m. / 8–9 a.m.',4:'6–7 a.m. / 7–8 a.m. / 8–9 a.m.'}},
  {name:'Carnatic music',kind:'music',days:{0:'5–6 p.m.',2:'5–6 p.m.',5:'11 a.m.–12 noon'}},
  {name:'Kuchipudi dance',kind:'dance',days:{0:'6–7 p.m.',2:'6–7 p.m.',5:'12 noon–1 p.m.'}},
  {name:'Shloka classes',kind:'music',days:{4:'4:30–5:30 p.m.',5:'10:30–11 a.m.'}},
  {name:'Western dance',kind:'dance',days:{1:'5–6 p.m.',3:'5–6 p.m.',5:'5:45–7 p.m.'}},
  {name:'Art classes',kind:'art',days:{0:'5–6 p.m.',2:'5–6 p.m.'}},
  {name:'Zumba fitness',kind:'wellbeing',label:'ADULTS · FLEXIBLE',days:{1:'6–7 p.m.',3:'6–7 p.m.',5:'6–7 p.m.'}},
  {name:'Sankeertanas workshop',kind:'workshop',label:'BASED ON ENROLMENTS',days:{0:'10:30 a.m.–12 noon',1:'10:30 a.m.–12 noon',2:'10:30 a.m.–12 noon',3:'10:30 a.m.–12 noon'}},
  {name:'Music / dance / art workshops',kind:'workshop',label:'BASED ON ENROLMENTS',days:{6:'Dates & timings on enquiry'}}
 ];
 const body = document.querySelector('#week-table-body');
 body.innerHTML = schedule.map(item => `<tr><th scope="row"><i class="schedule-dot ${item.kind}" aria-hidden="true"></i><span>${item.name}${item.label ? `<small>${item.label}</small>` : ''}</span></th>${weekdays.map((_,day) => `<td>${item.days[day] ? `<span class="schedule-time">${item.days[day].replaceAll(' / ','<br>')}</span>` : '<span class="schedule-empty" aria-label="No scheduled class">—</span>'}</td>`).join('')}</tr>`).join('');
 const agenda = document.querySelector('#day-agenda');
 const table = document.querySelector('.timetable-scroll');
 document.querySelectorAll('[data-day]').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('[data-day]').forEach(other => other.setAttribute('aria-pressed',String(other===button)));
  const all = button.dataset.day === 'all'; table.hidden = !all; agenda.hidden = all;
  if (all) return;
  const day = Number(button.dataset.day);
  agenda.innerHTML = `<h3>${weekdays[day]} at the academy</h3><div class="day-agenda-grid">${schedule.filter(item=>item.days[day]).map(item=>`<article><i class="schedule-dot ${item.kind}" aria-hidden="true"></i><div><h4>${item.name}</h4><p>${item.days[day].replaceAll(' / ','<br>')}</p>${item.label ? `<small>${item.label}</small>` : ''}</div></article>`).join('')}</div>`;
 }));
})();

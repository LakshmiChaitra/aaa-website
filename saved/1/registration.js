(() => {
 const form = document.querySelector('#academy-registration');
 if (!form) return;
 // Downloaded HTML cannot call the website's server endpoints.
 if (location.protocol === 'file:') {
  form.hidden = true;
  const notice = document.createElement('div');
  notice.className = 'registration-offline-notice';
  const message = document.createElement('p');
  message.textContent = 'You’re viewing a downloaded preview. Open the live website to register and save your details.';
  const live = document.createElement('a');
  live.className = 'button registration-submit';
  live.href = 'https://anusha-art-academy.onrender.com/#registration';
  live.textContent = 'Open live registration ↗';
  notice.append(message,live);
  form.before(notice);
  return;
 }
 const receipt = document.querySelector('#registration-receipt');
 form.after(receipt);
 new IntersectionObserver(entries=>{
  document.body.classList.toggle('registration-reading',entries.some(entry=>entry.isIntersecting));
 }).observe(document.querySelector('#registration'));
 const endpoint = (window.AAA_CONTENT?.registrationEndpoint || '').trim();
 const submitLabel = document.querySelector('#registration-submit-label');
 let requestId = crypto.randomUUID();
 let submitting = false;
 let completed = false;
 function startAnother() {
  receipt.hidden=true; form.hidden=false; completed=false;
  requestId=crypto.randomUUID(); form.reset();
  form.querySelector('[type="submit"]').disabled=false;
 }
 const select = document.querySelector('#reg-course');
 const mode = document.querySelector('#reg-mode');
 function updateModes() {
  const previous = mode.value;
  const online = courses.some(course => course.name === select.value && course.online);
  const values = !select.value ? [['','Choose a class first']] : online
   ? [['','Choose online or offline'],['Online','Online'],['Offline','Offline (at the academy)']]
   : [['Offline','Offline (at the academy)']];
  mode.replaceChildren(...values.map(([value,label]) => new Option(label,value)));
  if (values.some(([value]) => value === previous)) mode.value = previous;
  mode.disabled = !select.value;
  document.querySelector('#reg-mode-help').textContent = !select.value
   ? 'Online and offline options are available for Carnatic Music and Yoga.'
   : online ? 'Learn online from home or offline at our Kondapur academy.' : 'This class or workshop is held offline at the academy.';
 }
 select.addEventListener('change',updateModes);
 form.addEventListener('reset',()=>setTimeout(updateModes,0));
 updateModes();
 [['Regular classes', courses], ['Workshops', workshops]].forEach(([label, items]) => {
  const group = document.createElement('optgroup'); group.label = label;
  items.forEach(item => { const option = document.createElement('option'); option.value = item.name; option.textContent = item.name; group.append(option); });
  select.append(group);
 });
 document.addEventListener('click', event => {
  const link = event.target.closest('.course-enquiry'); if (!link) return;
  if (completed) startAnother();
  const preferred = link.dataset.workshop || link.dataset.course;
  if ([...select.options].some(option => option.value === preferred)) select.value = preferred;
  updateModes();
  const notes = form.querySelector('#reg-message');
  if (link.dataset.workshop && !notes.value.trim()) notes.value = `I’m interested in the ${link.dataset.workshop}.`;
  receipt.hidden = true; document.querySelector('#registration-error').hidden = true;
 });
 const details = document.querySelector('#registration-receipt-details');
 function renderReceipt(data, registrationId) {
  details.replaceChildren();
  const fields = [['Learner',data.studentName],['Age',data.age],['Parent / guardian',data.guardianName],['Contact',data.phone],['Address',data.address],['Class / workshop',data.course],['Learning mode',data.learningMode],['Preferred batch',data.preferredBatch],['Notes',data.message]];
  if (registrationId) fields.unshift(['Registration reference',registrationId]);
  const followUp=document.querySelector('#registration-followup');
  followUp.href='https://wa.me/919000129402?text='+encodeURIComponent(`Hello, I have completed my registration on the academy website. My reference is ${registrationId}. Please share the fees and payment instructions for my chosen class.`);
  fields.forEach(([label,value]) => { if (!value) return; const row = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = label; const dd = document.createElement('dd'); dd.textContent = value; row.append(dt,dd); details.append(row); });
  document.querySelector('#registration-receipt-next').hidden = false;
  document.querySelector('#registration-receipt-message').textContent='Your registration is saved. Keep your reference. Contact the academy on WhatsApp for fees, payment instructions and final batch confirmation.';
  if(window.AAA_LOCAL_DEMO){
   document.querySelector('#registration-receipt-label').textContent='LOCAL DEMO CONFIRMATION';
   document.querySelector('#registration-receipt-message').textContent='Preview complete. On the live website, this confirms your registration and saves it in the academy’s register. WhatsApp is the next step only for fees and payment details.';
  }
  form.hidden = true;
  receipt.hidden = false; receipt.focus({preventScroll:true}); receipt.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 }
 form.addEventListener('submit', async event => {
  event.preventDefault(); if (submitting || completed || !form.reportValidity()) return;
  const data = Object.fromEntries([...new FormData(form)].map(([key,value]) => [key,String(value).trim()]));
  if (!data.studentName) { form.querySelector('#reg-student').focus(); return; }
  const phoneDigits = data.phone.replace(/\D/g,'');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) { const phone = form.querySelector('#reg-phone'); phone.setCustomValidity('Enter a valid contact number, including the country code if needed.'); phone.reportValidity(); phone.addEventListener('input',()=>phone.setCustomValidity(''),{once:true}); return; }
  const error = document.querySelector('#registration-error'); error.hidden = true;
  submitting = true;
  const button = form.querySelector('[type="submit"]'); button.disabled = true; submitLabel.textContent = 'Submitting…';
  // Render Free may need about a minute to wake after inactivity.
  const controller = new AbortController(); const timeout = setTimeout(()=>controller.abort(),120000);
  try {
   const target = new URL(endpoint,window.AAA_API_BASE || location.origin);
   if (target.protocol !== 'https:' && target.origin !== location.origin) throw new Error('Registration connection is unavailable.');
   const response = await fetch(target.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...data,requestId}),signal:controller.signal,credentials:'omit'});
   const result = await response.json();
   if (!response.ok || result.ok !== true || typeof result.registrationId !== 'string' || !result.registrationId.trim()) {
    error.textContent = result.error || 'Your registration could not be confirmed. Please contact the academy before submitting again.';
    error.hidden = false;
    return;
   }
   completed = true;
   renderReceipt(data,result.registrationId);
  } catch {
   error.textContent = 'Your registration could not be confirmed. Your details are still in the form. Please contact the academy before submitting again.'; error.hidden = false;
  } finally { clearTimeout(timeout); submitting = false; button.disabled = completed; submitLabel.textContent = 'Submit registration'; }
 });
 document.querySelector('#registration-edit').addEventListener('click',()=>{startAnother();form.querySelector('input').focus();});
})();

(() => {
 const form = document.querySelector('#academy-registration');
 if (!form) return;
 const receipt = document.querySelector('#registration-receipt');
 const endpoint = (window.AAA_CONTENT?.registrationEndpoint || '').trim();
 const preview = !endpoint;
 const submitLabel = document.querySelector('#registration-submit-label');
 document.querySelector('#registration-demo-note').hidden = !preview;
 submitLabel.textContent = preview ? 'Preview registration' : 'Submit registration';
 const select = document.querySelector('#reg-course');
 [['Regular classes', courses], ['Workshops', workshops]].forEach(([label, items]) => {
  const group = document.createElement('optgroup'); group.label = label;
  items.forEach(item => { const option = document.createElement('option'); option.value = item.name; option.textContent = item.name; group.append(option); });
  select.append(group);
 });
 const future = document.createElement('optgroup'); future.label = 'Upcoming activities · register interest';
 ['Keyboard classes (upcoming)','Martial arts / self-defence (upcoming)','Handwriting classes (upcoming)','Public speaking (upcoming)'].forEach(name => { const option = document.createElement('option'); option.value = name; option.textContent = name; future.append(option); });
 select.append(future);
 document.addEventListener('click', event => {
  const link = event.target.closest('.course-enquiry'); if (!link) return;
  const preferred = link.dataset.workshop || link.dataset.course;
  if ([...select.options].some(option => option.value === preferred)) select.value = preferred;
  const notes = form.querySelector('#reg-message');
  if (link.dataset.workshop && !notes.value.trim()) notes.value = `I’m interested in the ${link.dataset.workshop}.`;
  receipt.hidden = true; document.querySelector('#registration-error').hidden = true;
 });
 const details = document.querySelector('#registration-receipt-details');
 function renderReceipt(data, registrationId) {
  details.replaceChildren();
  const fields = [['Learner',data.studentName],['Age',data.age],['Parent / guardian',data.guardianName],['Contact',data.phone],['Class / workshop',data.course],['Preferred batch',data.preferredBatch],['Notes',data.message]];
  if (registrationId) fields.unshift(['Registration reference',registrationId]);
  fields.forEach(([label,value]) => { if (!value) return; const row = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = label; const dd = document.createElement('dd'); dd.textContent = value; row.append(dt,dd); details.append(row); });
  document.querySelector('#registration-receipt-label').textContent = preview ? 'REGISTRATION PREVIEW · NOT SUBMITTED' : 'REGISTRATION RECEIVED';
  document.querySelector('#registration-receipt-title').textContent = preview ? 'Your details, in one place.' : 'Your next beginning starts here.';
  document.querySelector('#registration-receipt-message').textContent = preview ? 'This is a preview. Your details have not been sent or saved to the academy’s records.' : 'Your registration has been received. The academy will confirm batch availability and payment details.';
  document.querySelector('#registration-receipt-next').hidden = preview;
  receipt.hidden = false; receipt.focus({preventScroll:true}); receipt.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 }
 form.addEventListener('submit', async event => {
  event.preventDefault(); if (!form.reportValidity()) return;
  const data = Object.fromEntries([...new FormData(form)].map(([key,value]) => [key,String(value).trim()]));
  if (!data.studentName) { form.querySelector('#reg-student').focus(); return; }
  const phoneDigits = data.phone.replace(/\D/g,'');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) { const phone = form.querySelector('#reg-phone'); phone.setCustomValidity('Enter a valid contact number, including the country code if needed.'); phone.reportValidity(); phone.addEventListener('input',()=>phone.setCustomValidity(''),{once:true}); return; }
  const error = document.querySelector('#registration-error'); error.hidden = true;
  if (preview) { renderReceipt(data); return; }
  const button = form.querySelector('[type="submit"]'); button.disabled = true; submitLabel.textContent = 'Submitting…';
  const controller = new AbortController(); const timeout = setTimeout(()=>controller.abort(),20000);
  try {
   const target = new URL(endpoint,location.href);
   if (target.protocol !== 'https:' && target.origin !== location.origin) throw new Error('Registration connection is unavailable.');
   const response = await fetch(target.href,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data),signal:controller.signal,credentials:'omit'});
   const result = await response.json();
   if (!response.ok || result.ok !== true || typeof result.registrationId !== 'string' || !result.registrationId.trim()) throw new Error('The registration could not be confirmed. Please try again or contact the academy.');
   renderReceipt(data,result.registrationId);
  } catch {
   error.textContent = 'Your registration could not be confirmed. Your details are still in the form. Please try again or contact the academy before submitting again.'; error.hidden = false;
  } finally { clearTimeout(timeout); button.disabled = false; submitLabel.textContent = 'Submit registration'; }
 });
 document.querySelector('#registration-edit').addEventListener('click',()=>{receipt.hidden=true;form.querySelector('input').focus();});
})();

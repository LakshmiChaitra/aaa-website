(() => {
 const form = document.querySelector('#academy-registration');
 if (!form) return;
 const receipt = document.querySelector('#registration-receipt');
 const endpoint = (window.AAA_CONTENT?.registrationEndpoint || '').trim();
 const suppliedForm = window.AAA_CONTENT?.registrationFormUrl || '';
 let googleFormUrl = '';
 try {
  const source = new URL(suppliedForm);
  if (source.origin === 'https://docs.google.com' && /^\/forms\/d\/e\/[^/]+\/viewform$/.test(source.pathname)) googleFormUrl = source.href;
 } catch {}
 const googleReview = !endpoint && !!googleFormUrl;
 const preview = !endpoint && !googleReview;
 function googleRegistrationUrl(data) {
  const url = new URL(googleFormUrl);
  url.searchParams.set('embedded','true');
  url.searchParams.set('usp','pp_url');
  url.searchParams.set('srd','true');
  const activities = {
   'Carnatic music':'1. Carnatic Music (Kids & Adults)',
   'Sankeertanas workshop':'2.Sankeertanas (Adults)',
   'Kuchipudi dance':'3. Kuchipudi Dance',
   'Western dance':'4. Western dance (Kids)',
   'Zumba fitness':'5. Zumba Dance (Adults)',
   'Art classes':'6. Art Activities  (Drawing, Sketching, Painting, craft activities etc.,)',
   'Yoga':'7. Yoga (Kids & Adults)',
   'Shloka classes':'8. Bhagawadgeeta shlokas & Nitya prarthana (Kids)'
  };
  const fields = {
   'entry.1899802182':data.studentName,
   'entry.1446880981':data.age,
   'entry.1537575661':data.phone,
   'entry.459943467':activities[data.course] || '__other_option__',
   'entry.1109204689':[
    `Class / workshop: ${data.course}`,
    `Learning mode: ${data.learningMode}`,
    data.guardianName && `Parent / guardian: ${data.guardianName}`,
    data.preferredBatch && `Preferred batch: ${data.preferredBatch}`,
    data.message && `Notes: ${data.message}`
   ].filter(Boolean).join('\n')
  };
  if (!activities[data.course]) fields['entry.459943467.other_option_response'] = data.course;
  Object.entries(fields).forEach(([name,value])=>url.searchParams.set(name,value));
  return url.href;
 }
 const submitLabel = document.querySelector('#registration-submit-label');
 const connectionNote = document.querySelector('#registration-demo-note');
 connectionNote.hidden = !preview && !googleReview;
 if (googleReview) connectionNote.textContent = 'Complete your details here, then review and press Submit in the Google Form below. Your registration is saved only after that final step.';
 submitLabel.textContent = googleReview ? 'Continue to final submission' : preview ? 'Preview registration' : 'Submit registration';
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
  const fields = [['Learner',data.studentName],['Age',data.age],['Parent / guardian',data.guardianName],['Contact',data.phone],['Class / workshop',data.course],['Learning mode',data.learningMode],['Preferred batch',data.preferredBatch],['Notes',data.message]];
  if (registrationId) fields.unshift(['Registration reference',registrationId]);
  fields.forEach(([label,value]) => { if (!value) return; const row = document.createElement('div'); const dt = document.createElement('dt'); dt.textContent = label; const dd = document.createElement('dd'); dd.textContent = value; row.append(dt,dd); details.append(row); });
  document.querySelector('#registration-receipt-label').textContent = googleReview ? 'FINAL STEP · REVIEW & SUBMIT' : preview ? 'REGISTRATION PREVIEW · NOT SUBMITTED' : 'REGISTRATION RECEIVED';
  document.querySelector('#registration-receipt-title').textContent = googleReview ? 'Finish your registration' : preview ? 'Your details, in one place.' : 'Your next beginning starts here.';
  document.querySelector('#registration-receipt-message').textContent = googleReview ? 'Your details are filled in below. Add your address, check your choices and press Submit in the Google Form. Wait for Google’s confirmation before sharing a screenshot with the academy.' : preview ? 'This is a preview. Your details have not been sent or saved to the academy’s records.' : 'Your registration has been received. The academy will confirm batch availability and payment details.';
  document.querySelector('#registration-receipt-next').hidden = preview || googleReview;
  if (googleReview) {
   document.querySelector('#registration-google-review')?.remove();
   const review = document.createElement('div'); review.id = 'registration-google-review';
   const url = googleRegistrationUrl(data);
   const link = document.createElement('a'); link.className = 'text-link'; link.href = url; link.target = '_blank'; link.rel = 'noopener noreferrer'; link.referrerPolicy = 'no-referrer'; link.textContent = 'Open final form in a new tab ↗';
   const frame = document.createElement('iframe'); frame.title = 'Final academy registration — review and submit'; frame.src = url; frame.referrerPolicy = 'no-referrer';
   const help = document.createElement('p'); help.textContent = 'After Google confirms your response, take a screenshot and send it to the academy on WhatsApp. The academy will confirm fees, payment and batch availability.';
   const whatsapp = document.createElement('a'); whatsapp.className = 'text-link'; whatsapp.href = 'https://wa.me/919000129402'; whatsapp.target = '_blank'; whatsapp.rel = 'noopener noreferrer'; whatsapp.textContent = 'Share confirmation on WhatsApp ↗';
   review.append(link,frame,help,whatsapp); details.after(review);
  }
  receipt.hidden = false; receipt.focus({preventScroll:true}); receipt.scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'instant':'smooth'});
 }
 form.addEventListener('submit', async event => {
  event.preventDefault(); if (!form.reportValidity()) return;
  const data = Object.fromEntries([...new FormData(form)].map(([key,value]) => [key,String(value).trim()]));
  if (!data.studentName) { form.querySelector('#reg-student').focus(); return; }
  const phoneDigits = data.phone.replace(/\D/g,'');
  if (phoneDigits.length < 10 || phoneDigits.length > 15) { const phone = form.querySelector('#reg-phone'); phone.setCustomValidity('Enter a valid contact number, including the country code if needed.'); phone.reportValidity(); phone.addEventListener('input',()=>phone.setCustomValidity(''),{once:true}); return; }
  const error = document.querySelector('#registration-error'); error.hidden = true;
  if (preview || googleReview) { renderReceipt(data); return; }
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
 document.querySelector('#registration-edit').addEventListener('click',()=>{receipt.hidden=true;document.querySelector('#registration-google-review')?.remove();form.querySelector('input').focus();});
})();

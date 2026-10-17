
const toggle=document.querySelector('.menu-toggle');
const nav=document.querySelector('.navlinks');
if(toggle&&nav){toggle.addEventListener('click',()=>{const open=nav.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));});}
document.querySelectorAll('[data-year]').forEach(el=>el.textContent=new Date().getFullYear());
const form=document.querySelector('#contact-form');
const countryCode=document.querySelector('#country-code');
const customCountryCode=document.querySelector('#custom-country-code');
if(countryCode&&customCountryCode){countryCode.addEventListener('change',()=>{const show=countryCode.value==='other';customCountryCode.hidden=!show;customCountryCode.required=show;if(!show)customCountryCode.value='';});}
if(form){form.addEventListener('submit',async e=>{e.preventDefault();const status=document.querySelector('#contact-form-status');const button=form.querySelector('button[type="submit"]');const d=new FormData(form);const name=String(d.get('name')||'').trim();const email=String(d.get('email')||'').trim();const phone=String(d.get('phone')||'').trim();const selectedCode=String(d.get('country-code')||'+91');const customCode=String(d.get('custom-country-code')||'').trim();const dialCode=selectedCode==='other'?customCode:selectedCode;const fullPhone=phone?(dialCode+' '+phone):'Not provided';const message=String(d.get('message')||'').trim();if(status)status.textContent='Sending your enquiry…';if(button)button.disabled=true;try{const response=await fetch('https://formsubmit.co/ajax/enquiry@foundrysphere.com',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify({name:name,email:email,phone:fullPhone,message:message,_subject:'Website enquiry - FoundrySphere',_template:'table'})});const result=await response.json();if(!response.ok||result.success===false)throw new Error('Submission was not accepted');if(status)status.textContent='Thank you! Your enquiry has been submitted successfully.';form.reset();if(customCountryCode){customCountryCode.hidden=true;customCountryCode.required=false;}}catch(error){if(status)status.textContent='Sorry, your enquiry could not be sent. Please email enquiry@foundrysphere.com or contact us on WhatsApp.';}finally{if(button)button.disabled=false;}});}

// V5: compact WhatsApp brand-icon action; preserves the existing official chat destination.
if(!document.querySelector('.whatsapp-float')){
  const wa=document.createElement('a');
  wa.className='whatsapp-float';
  wa.href='https://wa.me/919822539394';
  wa.target='_blank';
  wa.rel='noopener';
  wa.setAttribute('aria-label','Chat with FoundrySphere on WhatsApp');
  wa.title='Chat with FoundrySphere on WhatsApp';
  wa.innerHTML='<span class="wa-icon" aria-hidden="true"><svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 3.2A12.1 12.1 0 0 0 5.6 21.5L4 28l6.7-1.7A12.1 12.1 0 1 0 16 3.2Z" stroke="white" stroke-width="2.2" stroke-linejoin="round"/><path d="M12.1 10.2c-.4-.8-.8-.8-1.2-.8h-.9c-.3 0-.8.1-1.2.6-.4.5-1.5 1.5-1.5 3.6s1.5 4.1 1.7 4.4c.2.3 2.9 4.6 7.1 6.2 3.5 1.4 4.2 1.1 5 .9.8-.1 2.6-1.1 3-2.1.4-1 .4-1.9.3-2.1-.1-.2-.4-.3-.9-.6s-2.6-1.3-3-1.5c-.4-.1-.7-.2-1 .3-.3.5-1.1 1.5-1.4 1.8-.3.3-.5.4-1 .1-.5-.2-2-.7-3.8-2.3-1.4-1.2-2.3-2.7-2.6-3.2-.3-.5 0-.7.2-.9.2-.2.5-.6.7-.8.2-.3.3-.5.5-.8.2-.3.1-.6 0-.8-.1-.2-1-2.3-1.4-3.1Z" fill="white" transform="translate(3 0) scale(.82)"/></svg></span><span class="wa-label">Chat on WhatsApp</span>';
  document.body.appendChild(wa);
}


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


// Official-colour social brand marks in the shared footer.
if (!document.querySelector('.footer-social')) {
  const footer = document.querySelector('.footer');
  const footerGrid = footer?.querySelector('.footer-grid');
  const footerBottom = footer?.querySelector('.footer-bottom');
  if (footer && footerGrid && footerBottom) {
    const social = document.createElement('nav');
    social.className = 'footer-social';
    social.setAttribute('aria-label', 'Follow FoundrySphere');
    social.innerHTML = `
      <span class="footer-social-label">Follow FoundrySphere</span>
      <a href="https://www.facebook.com/profile.php?id=61594331415491" target="_blank" rel="noopener noreferrer" aria-label="FoundrySphere on Facebook" title="Facebook">
        <svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="20" fill="#1877F2"/><path fill="#fff" d="M22.8 34V21.8h4.1l.6-4.8h-4.7v-3.1c0-1.4.4-2.3 2.4-2.3h2.5V7.3c-.4-.1-2-.2-3.8-.2-3.8 0-6.4 2.3-6.4 6.6V17h-4.3v4.8h4.3V34h5.3Z"/></svg>
      </a>
      <a href="https://www.instagram.com/foundrysphere/" target="_blank" rel="noopener noreferrer" aria-label="FoundrySphere on Instagram" title="Instagram">
        <svg viewBox="0 0 40 40" aria-hidden="true"><defs><linearGradient id="ig-brand-gradient" x1="4" y1="36" x2="36" y2="4" gradientUnits="userSpaceOnUse"><stop stop-color="#FFDC80"/><stop offset=".35" stop-color="#F77737"/><stop offset=".68" stop-color="#C13584"/><stop offset="1" stop-color="#5851DB"/></linearGradient></defs><rect x="1" y="1" width="38" height="38" rx="11" fill="url(#ig-brand-gradient)"/><rect x="9" y="9" width="22" height="22" rx="6" fill="none" stroke="#fff" stroke-width="2.8"/><circle cx="20" cy="20" r="5.2" fill="none" stroke="#fff" stroke-width="2.8"/><circle cx="27.2" cy="12.9" r="1.8" fill="#fff"/></svg>
      </a>
      <a href="https://www.linkedin.com/company/foundrysphere/" target="_blank" rel="noopener noreferrer" aria-label="FoundrySphere on LinkedIn" title="LinkedIn">
        <svg viewBox="0 0 40 40" aria-hidden="true"><rect width="40" height="40" rx="5" fill="#0A66C2"/><path fill="#fff" d="M11.2 15.2h5.1v16.3h-5.1V15.2Zm2.6-7.1a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm5.5 7.1h4.9v2.2h.1c.7-1.3 2.4-2.7 4.9-2.7 5.2 0 6.2 3.4 6.2 7.8v9h-5.1v-8c0-1.9 0-4.3-2.7-4.3s-3.1 2.1-3.1 4.2v8.1h-5.1V15.2Z"/></svg>
      </a>
      <a href="https://www.youtube.com/@FoundrySphere" target="_blank" rel="noopener noreferrer" aria-label="FoundrySphere on YouTube" title="YouTube">
        <svg viewBox="0 0 40 40" aria-hidden="true"><rect x="1" y="7" width="38" height="26" rx="8" fill="#FF0033"/><path fill="#fff" d="M16.5 13.7 27 20l-10.5 6.3V13.7Z"/></svg>
      </a>`;
    footerGrid.insertAdjacentElement('afterend', social);
  }
}

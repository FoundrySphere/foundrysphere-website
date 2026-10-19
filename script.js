
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


// Official FoundrySphere social links in the footer of every page using this shared script.
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
      <a href="https://www.facebook.com/profile.php?id=61594331415491" target="_blank" rel="noopener noreferrer" aria-label="FoundrySphere on Facebook">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.3-1.5 1.6-1.5h1.7V3.7c-.3 0-1.3-.1-2.5-.1-2.5 0-4.2 1.5-4.2 4.3v2H7.3V13h2.8v8h3.4Z"/></svg>
      </a>
      <a href="https://www.instagram.com/foundrysphere/" target="_blank" rel="noopener noreferrer" aria-label="FoundrySphere on Instagram">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.2 2h9.6A5.2 5.2 0 0 1 22 7.2v9.6a5.2 5.2 0 0 1-5.2 5.2H7.2A5.2 5.2 0 0 1 2 16.8V7.2A5.2 5.2 0 0 1 7.2 2Zm0 2A3.2 3.2 0 0 0 4 7.2v9.6A3.2 3.2 0 0 0 7.2 20h9.6a3.2 3.2 0 0 0 3.2-3.2V7.2A3.2 3.2 0 0 0 16.8 4H7.2ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 2a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm5.2-3.4a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4Z"/></svg>
      </a>
      <a href="https://www.linkedin.com/company/foundrysphere/" target="_blank" rel="noopener noreferrer" aria-label="FoundrySphere on LinkedIn">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.2 3A2.2 2.2 0 1 1 5.2 7.4 2.2 2.2 0 0 1 5.2 3ZM3.3 9h3.8v12H3.3V9Zm6.1 0H13v1.6h.1A4.1 4.1 0 0 1 16.8 8.7c4 0 4.7 2.6 4.7 6V21h-3.8v-5.6c0-1.3 0-3.1-1.9-3.1s-2.2 1.5-2.2 3V21H9.4V9Z"/></svg>
      </a>
      <a href="https://www.youtube.com/@FoundrySphere" target="_blank" rel="noopener noreferrer" aria-label="FoundrySphere on YouTube">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2 31 31 0 0 0 0 12a31 31 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1A31 31 0 0 0 24 12a31 31 0 0 0-.5-5.8ZM9.6 15.7V8.3l6.3 3.7-6.3 3.7Z"/></svg>
      </a>`;
    footerGrid.insertAdjacentElement('afterend', social);
  }
}

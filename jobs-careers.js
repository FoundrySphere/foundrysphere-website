var API_BASE="https://foundrysphere-backend.onrender.com";
(function(){ "use strict";
function $(id){return document.getElementById(id)}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
async function api(url){var r=await fetch(url,{headers:{"Accept":"application/json"},cache:"no-store"}),d=await r.json();if(!r.ok||d.success===false)throw Error(d.message||"Unable to load job vacancies.");return d}
function status(msg){$("status").textContent=msg;$("status").classList.remove("hidden");$("status").scrollIntoView({behavior:"smooth",block:"nearest"})}
var currentPage=0,currentVacancy=null,applicationPollTimer=null,applicationToken=null;
function appliedStorageKey(id){return "foundrysphere:public-job-applied:"+String(id)}
function isApplied(id){try{return window.localStorage.getItem(appliedStorageKey(id))==="1"}catch(e){return false}}
function markApplied(id){if(!id)return;try{window.localStorage.setItem(appliedStorageKey(id),"1")}catch(e){};Array.from(document.querySelectorAll("[data-apply]")).forEach(function(button){if(button.dataset.apply===String(id)){button.textContent="Applied";button.disabled=true;button.setAttribute("aria-label","Application submitted")}});if(String(currentVacancy)===String(id)&&$("applyInfo")){$("applyInfo").textContent="Applied";$("applyInfo").disabled=true}}
async function loadCategories(){try{var d=await api(API_BASE+"/api/job-vacancies/categories");d.categories.forEach(function(c){var o=document.createElement("option");o.value=c.name;o.textContent=c.name;$("jobCategory").appendChild(o)})}catch(e){status(e.message)}}
function addLocationOptions(select,items,placeholder,selectedValue){select.innerHTML="";var first=document.createElement("option");first.value="";first.textContent=placeholder;select.appendChild(first);(items||[]).forEach(function(item){var o=document.createElement("option");o.value=item.name;o.textContent=item.name;if(item.isoCode)o.dataset.code=item.isoCode;if(selectedValue&&item.name===selectedValue)o.selected=true;select.appendChild(o)});}
async function loadJobCountries(){
 var country=$("jobCountry");
 try{
  var d=await api(API_BASE+"/api/register/locations/countries");
  var list=d.countries||[];
  country.innerHTML="";
  list.forEach(function(item){var o=document.createElement("option");o.value=item.name;o.textContent=item.name;o.dataset.code=item.isoCode;country.appendChild(o)});
  var india=Array.from(country.options).find(function(o){return o.value.toLowerCase()==="india"});
  if(india)country.value=india.value;
 }catch(e){console.error("Job search country list unavailable",e);if(!Array.from(country.options).some(function(o){return o.value==="India"})){var india=document.createElement("option");india.value="India";india.textContent="India";india.dataset.code="IN";country.appendChild(india)}country.value="India"}
 await loadJobStates();
}
async function loadJobStates(selectedState){
 var country=$("jobCountry"),chosen=country.options[country.selectedIndex],state=$("jobState"),city=$("jobCity");
 addLocationOptions(state,[],"All States");addLocationOptions(city,[],"All Cities");
 if(!chosen)return;
 try{
  var d=await api(API_BASE+"/api/register/locations/states?countryCode="+encodeURIComponent(chosen.dataset.code||"IN"));
  addLocationOptions(state,d.states||[],"All States",selectedState||"");
 }catch(e){console.error("Job search state list unavailable",e)}
}
async function loadJobCities(selectedCity){
 var country=$("jobCountry"),chosenCountry=country.options[country.selectedIndex],state=$("jobState"),chosenState=state.options[state.selectedIndex],city=$("jobCity");
 addLocationOptions(city,[],"All Cities");
 if(!chosenCountry||!chosenState||!state.value)return;
 try{
  var d=await api(API_BASE+"/api/register/locations/cities?countryCode="+encodeURIComponent(chosenCountry.dataset.code||"IN")+"&stateCode="+encodeURIComponent(chosenState.dataset.code||""));
  addLocationOptions(city,d.cities||[],"All Cities",selectedCity||"");
 }catch(e){console.error("Job search city list unavailable",e)}
}
function showResultsPage(){ $("searchPage").classList.add("hidden");$("resultsPage").classList.remove("hidden"); }
function showSearchPage(){ $("resultsPage").classList.add("hidden");$("searchPage").classList.remove("hidden");$("detailPanel").classList.add("hidden"); }
function renderResults(d){
 $("resultCount").textContent=d.total+" matching vacanc"+(d.total===1?"y":"ies");
 if(!d.results.length){$("results").innerHTML='<div class="empty">No approved open vacancies match these filters. Try another job title, category or location.</div>';$("pager").innerHTML="";return}
 $("results").innerHTML=d.results.map(function(v){return'<article class="result"><h3>'+esc(v.title||"Job Vacancy")+'</h3><div class="meta">'+esc(v.company||"Company details available on request")+' · '+esc(v.location||"Location not specified")+'</div><div class="meta">'+esc(v.category||"Category not specified")+' · '+esc(v.qualification||"Qualification not specified")+' · '+esc(v.experience||"Experience not specified")+' · '+Number(v.openings||1)+' opening(s)'+(v.salary?' · '+esc(v.salary):'')+'</div><div class="actions"><button type="button" class="btn primary" data-view="'+esc(v.id)+'">View More</button><button type="button" class="btn" data-apply="'+esc(v.id)+'">Apply for Job</button></div></article>'}).join("");
 $("results").querySelectorAll("[data-apply]").forEach(function(button){if(isApplied(button.dataset.apply)){button.textContent="Applied";button.disabled=true;button.setAttribute("aria-label","Application submitted")}});
 $("results").querySelectorAll("[data-view]").forEach(function(b){b.onclick=function(){openDetail(b.dataset.view)}});
 $("results").querySelectorAll("[data-apply]").forEach(function(b){b.onclick=function(){currentVacancy=b.dataset.apply;applyForJob()}});
 $("pager").innerHTML='<span>Page '+(d.page+1)+' · '+d.total+' vacancies · 5 per page</span><span>'+(d.hasPrevious?'<button class="btn" id="prevPage" type="button">← Previous</button> ':'')+(d.hasNext?'<button class="btn primary" id="nextPage" type="button">Next →</button>':'')+'</span>';
 if($("prevPage"))$("prevPage").onclick=function(){search(currentPage-1)};
 if($("nextPage"))$("nextPage").onclick=function(){search(currentPage+1)};
}
async function search(page){
 currentPage=Math.max(0,page||0);
 var values={q:$("jobKeyword").value.trim(),category:$("jobCategory").value,country:$("jobCountry").value.trim(),state:$("jobState").value.trim(),city:$("jobCity").value.trim()};
 showResultsPage();$("resultsTitle").textContent="Search Results";$("results").innerHTML='<div class="empty">Searching approved vacancies…</div>';$("pager").innerHTML="";$("resultCount").textContent="";$("detailPanel").classList.add("hidden");$("status").classList.add("hidden");
 var p=new URLSearchParams({...values,page:String(currentPage)});
 try{var d=await api(API_BASE+"/api/job-vacancies/search?"+p.toString());currentPage=d.page;renderResults(d)}catch(e){$("results").innerHTML='<div class="empty">'+esc(e.message)+'</div>'}
}
async function openDetail(id){
 currentVacancy=id;
 var viewButton=Array.from($("results").querySelectorAll("[data-view]")).find(function(b){return b.dataset.view===String(id)});
 var resultCard=viewButton&&viewButton.closest(".result");
 if(resultCard)resultCard.insertAdjacentElement("afterend",$("detailPanel"));
 $("detailPanel").classList.remove("hidden");$("detail").textContent="Loading vacancy details…";
 $("detailPanel").scrollIntoView({behavior:"smooth",block:"start"});
 try{var d=await api(API_BASE+"/api/job-vacancies/vacancies/"+encodeURIComponent(id)),v=d.vacancy;
 $("applyInfo").textContent=isApplied(id)?"Applied":"Apply for Job";$("applyInfo").disabled=isApplied(id);
 $("detail").innerHTML='<p><b>Vacancy ID:</b> '+esc(v.code||"Not available")+'</p><p><b>Job Title:</b> '+esc(v.title)+'</p><p><b>Company:</b> '+esc(v.company||"Company details available on request")+'</p><p><b>Category:</b> '+esc(v.category)+'</p><p><b>Location:</b> '+esc(v.location||"Not specified")+'</p><p><b>Employment Type:</b> '+esc(v.employmentType||"Not specified")+'</p><p><b>Openings:</b> '+Number(v.openings||1)+'</p><p><b>Qualification / Eligibility:</b> '+esc(v.qualification||"Please review the job description")+'</p><p><b>Experience:</b> '+esc(v.experience||"Not specified")+'</p><p><b>Skills:</b> '+esc(v.skills||"Not specified")+'</p>'+(v.salary?'<p><b>Salary / CTC:</b> '+esc(v.salary)+'</p>':'')+(v.description?'<p><b>Job Description:</b> '+esc(v.description)+'</p>':'')+(v.responsibilities?'<p><b>Responsibilities:</b> '+esc(v.responsibilities)+'</p>':'')+(v.benefits?'<p><b>Benefits:</b> '+esc(v.benefits)+'</p>':'')+(v.accommodation?'<p><b>Accommodation / Facilities:</b> '+esc(v.accommodation)+'</p>':'')+(v.closingDate?'<p><b>Apply before:</b> '+esc(String(v.closingDate).slice(0,10))+'</p>':'')+'<p><b>Employer contact:</b> Hidden on the public search page</p>';
 }catch(e){$("detail").textContent=e.message}
}
function renderApplicationConfirmation(a){
 markApplied(currentVacancy);
 var rawId=String(a.applicationId||a.applicationReference||"").trim();
 var reference=rawId.startsWith("FS-JA-")?rawId:(rawId?"FS-JA-"+rawId:"Not available");
 $("applicationHeading").textContent="Application Submitted Successfully!";
 $("applicationStatus").classList.add("hidden");
 $("applicationInstruction").textContent="Your job application has been submitted successfully to FoundrySphere.";
 $("applicationId").textContent=reference;
 $("applicationMemberId").textContent=a.memberId||"Not available";
 $("applicationReviewStatus").textContent="Pending Review";
 $("applicationDetails").classList.remove("hidden");
 $("applicationSuccessMessage").textContent="You will receive a WhatsApp notification when your application status is updated.";
 $("openApplicationWhatsApp").classList.add("hidden");
 $("checkApplicationAgain").classList.add("hidden");
 $("backToResultsFromApplication").classList.add("hidden");
 $("homepageActions").classList.remove("hidden");
 $("goToHomepage").onclick=function(){window.location.href="https://www.foundrysphere.com/";};
}
function startApplicationPolling(){
 if(applicationPollTimer)clearInterval(applicationPollTimer);
 var started=Date.now();
 applicationPollTimer=setInterval(async function(){
  try{
   var d=await api(API_BASE+"/api/job-vacancies/applications/status?token="+encodeURIComponent(applicationToken));
   if(d.application){clearInterval(applicationPollTimer);applicationPollTimer=null;renderApplicationConfirmation(d.application);return;}
  }catch(e){}
  if(Date.now()-started>180000){
   clearInterval(applicationPollTimer);applicationPollTimer=null;
   $("applicationInstruction").textContent="No application has been recorded. Check that you pressed Send in WhatsApp from your registered Job Seeker number. If WhatsApp did not reply, the application was not confirmed; try again later or contact FoundrySphere support.";
  }
 },3000);
}
async function applyForJob(){
 if(!currentVacancy){status("Please select a vacancy first.");return}
 try{
  var d=await api(API_BASE+"/api/job-vacancies/vacancies/"+encodeURIComponent(currentVacancy));
  var v=d.vacancy||{};
  if(!v.code)throw Error("The vacancy reference is unavailable. Please try again or contact FoundrySphere support.");
  var tokenBytes=new Uint8Array(18);if(window.crypto&&typeof window.crypto.getRandomValues==="function"){window.crypto.getRandomValues(tokenBytes)}else{for(var ti=0;ti<tokenBytes.length;ti++)tokenBytes[ti]=Math.floor(Math.random()*256)}applicationToken="FSREF"+Array.from(tokenBytes).map(function(x){return x.toString(16).padStart(2,"0")}).join("").toUpperCase();
  $("searchPage").classList.add("hidden");$("resultsPage").classList.add("hidden");$("applicationPage").classList.remove("hidden");
  $("applicationJobTitle").textContent=v.title||"Selected vacancy";$("applicationVacancyCode").textContent=v.code;
  $("applicationHeading").textContent="Page 3 — Submit Application";$("applicationStatus").classList.remove("hidden");$("applicationStatus").textContent="Not submitted yet — WhatsApp message required";$("applicationDetails").classList.add("hidden");$("homepageActions").classList.add("hidden");$("openApplicationWhatsApp").classList.remove("hidden");$("checkApplicationAgain").classList.remove("hidden");$("backToResultsFromApplication").classList.remove("hidden");
  $("applicationInstruction").textContent="This button opens FoundrySphere WhatsApp with your application message ready. In WhatsApp, press Send. Use the WhatsApp number registered to your FoundrySphere Job Seeker account. This page cannot send the WhatsApp message for you. Keep this page open; your Application ID appears only after the backend records your application.";
  $("openApplicationWhatsApp").href="https://wa.me/919822539394?text="+encodeURIComponent("APPLY "+v.code+" "+applicationToken);
  $("applicationPage").scrollIntoView({behavior:"smooth",block:"start"});
  startApplicationPolling();
 }catch(e){$("searchPage").classList.add("hidden");$("resultsPage").classList.add("hidden");$("applicationPage").classList.remove("hidden");$("applicationStatus").textContent="Unable to start application";$("applicationInstruction").textContent=(e.message||"Unable to continue to WhatsApp.")+" Please use Back to Results and try again.";$("applicationPage").scrollIntoView({behavior:"smooth",block:"start"})}
}
$("checkApplicationAgain").onclick=async function(){
 if(!applicationToken)return;
 $("applicationInstruction").textContent="Checking for your submitted application…";
 try{var d=await api(API_BASE+"/api/job-vacancies/applications/status?token="+encodeURIComponent(applicationToken));if(d.application){if(applicationPollTimer)clearInterval(applicationPollTimer);applicationPollTimer=null;renderApplicationConfirmation(d.application)}else $("applicationInstruction").textContent="Application not found yet. Confirm you pressed Send in WhatsApp from your registered Job Seeker number. If the bot did not reply, your application is not confirmed."}
 catch(e){$("applicationInstruction").textContent="Could not check the application record right now. Please try again. Do not treat the application as submitted until an Application ID appears."}
};
$("backToResultsFromApplication").onclick=function(){if(applicationPollTimer)clearInterval(applicationPollTimer);applicationPollTimer=null;$("applicationPage").classList.add("hidden");showResultsPage()};
$("jobCountry").addEventListener("change",async function(){await loadJobStates()});
$("jobState").addEventListener("change",function(){loadJobCities()});
$("searchForm").addEventListener("submit",function(e){e.preventDefault();search(0)});
$("clearSearch").onclick=function(){
 $("jobKeyword").value="";$("jobCategory").value="All Categories";$("jobCountry").value="India";loadJobStates();
 currentPage=0;$("resultsTitle").textContent="Search Results";$("resultCount").textContent="";$("results").innerHTML='<div class="empty">Enter your search criteria, then select Search Jobs.</div>';$("pager").innerHTML="";$("detailPanel").classList.add("hidden");$("status").classList.add("hidden");showSearchPage();
};
$("backToSearch").onclick=showSearchPage;
$("closeDetail").onclick=function(){$("detailPanel").classList.add("hidden")};
$("applyInfo").onclick=applyForJob;
loadCategories();loadJobCountries();
})();
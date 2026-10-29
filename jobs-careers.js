var API_BASE="https://foundrysphere-backend.onrender.com";
(function(){ "use strict";
function $(id){return document.getElementById(id)}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
async function api(url){var r=await fetch(url,{headers:{"Accept":"application/json"},cache:"no-store"}),d=await r.json();if(!r.ok||d.success===false)throw Error(d.message||"Unable to load job vacancies.");return d}
function status(msg){$("status").textContent=msg;$("status").classList.remove("hidden");$("status").scrollIntoView({behavior:"smooth",block:"nearest"})}
var currentPage=0,currentVacancy=null,savedJobsChecked=false,savedJobsEnabled=false,savedJobIds=new Set();
async function loadSavedJobContext(){if(savedJobsChecked)return;savedJobsChecked=true;try{var d=await api(API_BASE+"/api/job-seeker-saved-jobs/");savedJobsEnabled=true;$("saveInfo").classList.remove("hidden");savedJobIds=new Set((d.items||[]).map(function(x){return String(x.vacancy_id)}));}catch(e){savedJobsEnabled=false;savedJobIds=new Set();}}
async function saveJob(id,button){if(!savedJobsEnabled){status("To save jobs, open Search Jobs & Careers from your active Premium Job Seeker WhatsApp menu.");return;}if(savedJobIds.has(String(id))){status("This job is already in your Saved Jobs list.");return;}if(button)button.disabled=true;try{var r=await fetch(API_BASE+"/api/job-seeker-saved-jobs/save/"+encodeURIComponent(id),{method:"POST",credentials:"include",headers:{"Accept":"application/json","Content-Type":"application/json"}});var d=await r.json();if(!r.ok||d.success!==true)throw Error(d.message||"Unable to save this job.");savedJobIds.add(String(id));status(d.alreadySaved?"This job is already in your Saved Jobs list.":"Job saved successfully. Open Saved Jobs from WhatsApp to view it.");document.querySelectorAll("[data-save]").forEach(function(b){if(String(b.dataset.save)===String(id)){b.textContent="Saved ✓";b.disabled=true;}});if(String(currentVacancy)===String(id)&&$("saveInfo")){$("saveInfo").textContent="Saved ✓";$("saveInfo").disabled=true;}}catch(e){status(e.message);if(button)button.disabled=false;}}
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
 $("results").innerHTML=d.results.map(function(v){var saved=savedJobIds.has(String(v.id));return '<article class="result"><h3>'+esc(v.title||"Job Vacancy")+'</h3><div class="meta">'+esc(v.company||"Company details available on request")+' · '+esc(v.location||"Location not specified")+'</div><div class="meta">'+esc(v.category||"Category not specified")+' · '+esc(v.qualification||"Qualification not specified")+' · '+esc(v.experience||"Experience not specified")+' · '+Number(v.openings||1)+' opening(s)'+(v.salary?' · '+esc(v.salary):'')+'</div><div class="actions"><button type="button" class="btn primary" data-view="'+esc(v.id)+'">View More</button>'+(savedJobsEnabled?'<button type="button" class="btn" data-save="'+esc(v.id)+'" '+(saved?'disabled':'')+'>'+(saved?'Saved ✓':'Save Job')+'</button>':'')+'<button type="button" class="btn" data-apply="'+esc(v.id)+'">Apply for Job</button></div></article>'}).join("");
 $("results").querySelectorAll("[data-view]").forEach(function(b){b.onclick=function(){openDetail(b.dataset.view)}});
 $("results").querySelectorAll("[data-save]").forEach(function(b){b.onclick=function(){saveJob(b.dataset.save,b)}});
 $("results").querySelectorAll("[data-apply]").forEach(function(b){b.onclick=function(){currentVacancy=b.dataset.apply;applyForJob()}});
 $("pager").innerHTML='<span>Page '+(d.page+1)+' · '+d.total+' vacancies · 5 per page</span><span>'+(d.hasPrevious?'<button class="btn" id="prevPage" type="button">← Previous</button> ':'')+(d.hasNext?'<button class="btn primary" id="nextPage" type="button">Next →</button>':'')+'</span>';
 if($("prevPage"))$("prevPage").onclick=function(){search(currentPage-1)};
 if($("nextPage"))$("nextPage").onclick=function(){search(currentPage+1)};
}
async function search(page){
 await loadSavedJobContext();
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
 $("detail").innerHTML='<p><b>Vacancy ID:</b> '+esc(v.code||"Not available")+'</p><p><b>Job Title:</b> '+esc(v.title)+'</p><p><b>Company:</b> '+esc(v.company||"Company details available on request")+'</p><p><b>Category:</b> '+esc(v.category)+'</p><p><b>Location:</b> '+esc(v.location||"Not specified")+'</p><p><b>Employment Type:</b> '+esc(v.employmentType||"Not specified")+'</p><p><b>Openings:</b> '+Number(v.openings||1)+'</p><p><b>Qualification / Eligibility:</b> '+esc(v.qualification||"Please review the job description")+'</p><p><b>Experience:</b> '+esc(v.experience||"Not specified")+'</p><p><b>Skills:</b> '+esc(v.skills||"Not specified")+'</p>'+(v.salary?'<p><b>Salary / CTC:</b> '+esc(v.salary)+'</p>':'')+(v.description?'<p><b>Job Description:</b> '+esc(v.description)+'</p>':'')+(v.responsibilities?'<p><b>Responsibilities:</b> '+esc(v.responsibilities)+'</p>':'')+(v.benefits?'<p><b>Benefits:</b> '+esc(v.benefits)+'</p>':'')+(v.accommodation?'<p><b>Accommodation / Facilities:</b> '+esc(v.accommodation)+'</p>':'')+(v.closingDate?'<p><b>Apply before:</b> '+esc(String(v.closingDate).slice(0,10))+'</p>':'')+'<p><b>Employer contact:</b> Hidden on the public search page</p>';
 }catch(e){$("detail").textContent=e.message}
}
async function applyForJob(){
 if(!currentVacancy){status("Please select a vacancy first.");return}
 var applyButtons=Array.from(document.querySelectorAll("[data-apply],#applyInfo"));
 applyButtons.forEach(function(b){b.disabled=true});
 try{
  var vacancyData=await api(API_BASE+"/api/job-vacancies/vacancies/"+encodeURIComponent(currentVacancy));
  var v=vacancyData.vacancy||{};
  $("applicationJobTitle").textContent=v.title||"Selected vacancy";
  $("applicationVacancyCode").textContent=v.code||"Not available";
  $("applicationStatus").textContent="Verifying your Job Seeker account…";
  $("applicationInstruction").textContent="Applications are recorded only for a verified, active Job Seeker account.";
  $("applicationDetails").classList.add("hidden");
  $("openApplicationWhatsApp").classList.add("hidden");
  $("searchPage").classList.add("hidden");$("resultsPage").classList.add("hidden");$("applicationPage").classList.remove("hidden");
  $("applicationPage").scrollIntoView({behavior:"smooth",block:"start"});
  var response=await fetch(API_BASE+"/api/directory-web-handoff/matching-jobs/apply",{
   method:"POST",credentials:"include",headers:{"Accept":"application/json","Content-Type":"application/json"},
   body:JSON.stringify({vacancyId:currentVacancy})
  });
  var data=await response.json();
  if(response.status===401){
   $("applicationStatus").textContent="Job Seeker sign-in required";
   $("applicationInstruction").textContent="No verified FoundrySphere session was found. No application has been submitted. Open FoundrySphere in WhatsApp, choose Matching Jobs, and follow its secure link to apply. This public page cannot submit an application without verifying your Job Seeker account.";
   $("openApplicationWhatsApp").classList.remove("hidden");
   $("openApplicationWhatsApp").href="https://wa.me/919822539394?text="+encodeURIComponent("Matching Jobs");
   $("openApplicationWhatsApp").textContent="Open Matching Jobs in WhatsApp";
   return;
  }
  if(!response.ok||data.success!==true) throw Error(data.message||"Unable to submit your application.");
  $("applicationStatus").textContent=data.alreadyApplied?"You have already applied for this vacancy.":"Application submitted successfully.";
  $("applicationStatus").style.color="#176b52";
  $("applicationInstruction").textContent=data.message||"Your application is recorded in FoundrySphere.";
  $("applicationId").textContent=data.application&& (data.application.applicationCode||data.application.id)||"Not available";
  $("applicationMemberId").textContent="Verified Job Seeker account";
  $("applicationSubmittedAt").textContent=new Date().toLocaleString();
  $("applicationJobTitleConfirmed").textContent=v.title||"Job Vacancy";
  $("applicationDetails").classList.remove("hidden");
 }catch(e){
  $("applicationStatus").textContent="Application not submitted";
  $("applicationStatus").style.color="";
  $("applicationInstruction").textContent=(e.message||"Unable to submit your application.")+" Please try again.";
  $("openApplicationWhatsApp").classList.add("hidden");
 }finally{applyButtons.forEach(function(b){b.disabled=false})}
}
$("backToResultsFromApplication").onclick=function(){$("applicationPage").classList.add("hidden");showResultsPage()};
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
$("saveInfo").onclick=function(){if(currentVacancy)saveJob(currentVacancy,$("saveInfo"))};
loadCategories();loadJobCountries();loadSavedJobContext();
})();
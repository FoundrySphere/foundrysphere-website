var API_BASE="https://foundrysphere-backend.onrender.com";
(function(){ "use strict";
function $(id){return document.getElementById(id)}
function esc(v){return String(v==null?"":v).replace(/[&<>"']/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]})}
async function api(url){var r=await fetch(url,{headers:{"Accept":"application/json"},cache:"no-store"}),d=await r.json();if(!r.ok||d.success===false)throw Error(d.message||"Unable to load job vacancies.");return d}
function status(msg){$("status").textContent=msg;$("status").classList.remove("hidden");$("status").scrollIntoView({behavior:"smooth",block:"nearest"})}
var currentPage=0,currentVacancy=null,applicationPollTimer=null,applicationToken=null;
async function loadCategories(){try{var d=await api(API_BASE+"/api/job-vacancies/categories");d.categories.forEach(function(c){var o=document.createElement("option");o.value=c.name;o.textContent=c.name;$("jobCategory").appendChild(o)})}catch(e){status(e.message)}}
function showResultsPage(){ $("searchPage").classList.add("hidden");$("resultsPage").classList.remove("hidden"); }
function showSearchPage(){ $("resultsPage").classList.add("hidden");$("searchPage").classList.remove("hidden");$("detailPanel").classList.add("hidden"); }
function renderResults(d){
 $("resultCount").textContent=d.total+" matching vacanc"+(d.total===1?"y":"ies");
 if(!d.results.length){$("results").innerHTML='<div class="empty">No approved open vacancies match these filters. Try another job title, category or location.</div>';$("pager").innerHTML="";return}
 $("results").innerHTML=d.results.map(function(v){return'<article class="result"><h3>'+esc(v.title||"Job Vacancy")+'</h3><div class="meta">'+esc(v.company||"Company details available on request")+' · '+esc(v.location||"Location not specified")+'</div><div class="meta">'+esc(v.category||"Category not specified")+' · '+esc(v.qualification||"Qualification not specified")+' · '+esc(v.experience||"Experience not specified")+' · '+Number(v.openings||1)+' opening(s)'+(v.salary?' · '+esc(v.salary):'')+'</div><div class="actions"><button type="button" class="btn primary" data-view="'+esc(v.id)+'">View More</button><button type="button" class="btn" data-apply="'+esc(v.id)+'">Apply for Job</button></div></article>'}).join("");
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
 currentVacancy=id;$("detailPanel").classList.remove("hidden");$("detail").textContent="Loading vacancy details…";$("detailPanel").scrollIntoView({behavior:"smooth",block:"start"});
 try{var d=await api(API_BASE+"/api/job-vacancies/vacancies/"+encodeURIComponent(id)),v=d.vacancy;
 $("detail").innerHTML='<p><b>Vacancy ID:</b> '+esc(v.code||"Not available")+'</p><p><b>Job Title:</b> '+esc(v.title)+'</p><p><b>Company:</b> '+esc(v.company||"Company details available on request")+'</p><p><b>Category:</b> '+esc(v.category)+'</p><p><b>Location:</b> '+esc(v.location||"Not specified")+'</p><p><b>Employment Type:</b> '+esc(v.employmentType||"Not specified")+'</p><p><b>Openings:</b> '+Number(v.openings||1)+'</p><p><b>Qualification / Eligibility:</b> '+esc(v.qualification||"Please review the job description")+'</p><p><b>Experience:</b> '+esc(v.experience||"Not specified")+'</p><p><b>Skills:</b> '+esc(v.skills||"Not specified")+'</p>'+(v.salary?'<p><b>Salary / CTC:</b> '+esc(v.salary)+'</p>':'')+(v.description?'<p><b>Job Description:</b> '+esc(v.description)+'</p>':'')+(v.responsibilities?'<p><b>Responsibilities:</b> '+esc(v.responsibilities)+'</p>':'')+(v.benefits?'<p><b>Benefits:</b> '+esc(v.benefits)+'</p>':'')+(v.accommodation?'<p><b>Accommodation / Facilities:</b> '+esc(v.accommodation)+'</p>':'')+(v.closingDate?'<p><b>Apply before:</b> '+esc(String(v.closingDate).slice(0,10))+'</p>':'')+'<p><b>Employer contact:</b> Hidden on the public search page</p>';
 }catch(e){$("detail").textContent=e.message}
}
function renderApplicationConfirmation(a){
 $("applicationStatus").textContent="Application recorded — "+(a.status||"Submitted");
 $("applicationId").textContent=a.applicationId||"Not available";
 $("applicationMemberId").textContent=a.memberId||"Not available";
 $("applicationSubmittedAt").textContent=a.submittedAt?new Date(a.submittedAt).toLocaleString():"Not available";
 $("applicationJobTitleConfirmed").textContent=a.jobTitle||"Job Vacancy";
 $("applicationDetails").classList.remove("hidden");
 $("applicationInstruction").textContent="Your application is recorded in FoundrySphere. Keep your Application ID for future reference.";
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
   $("applicationInstruction").textContent="No application was found yet. Confirm you pressed Send in WhatsApp, then select Check Again.";
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
  $("applicationStatus").textContent="Waiting for WhatsApp submission";$("applicationDetails").classList.add("hidden");
  $("applicationInstruction").textContent="Open WhatsApp below and press Send on the prefilled APPLY message. Keep this page open; confirmation appears only after FoundrySphere records your application.";
  $("openApplicationWhatsApp").href="https://wa.me/919822539394?text="+encodeURIComponent("APPLY "+v.code+" "+applicationToken);
  $("applicationPage").scrollIntoView({behavior:"smooth",block:"start"});
  startApplicationPolling();
 }catch(e){$("searchPage").classList.add("hidden");$("resultsPage").classList.add("hidden");$("applicationPage").classList.remove("hidden");$("applicationStatus").textContent="Unable to start application";$("applicationInstruction").textContent=(e.message||"Unable to continue to WhatsApp.")+" Please use Back to Results and try again.";$("applicationPage").scrollIntoView({behavior:"smooth",block:"start"})}
}
$("checkApplicationAgain").onclick=async function(){
 if(!applicationToken)return;
 $("applicationInstruction").textContent="Checking for your submitted application…";
 try{var d=await api(API_BASE+"/api/job-vacancies/applications/status?token="+encodeURIComponent(applicationToken));if(d.application){if(applicationPollTimer)clearInterval(applicationPollTimer);applicationPollTimer=null;renderApplicationConfirmation(d.application)}else $("applicationInstruction").textContent="Application not found yet. Open WhatsApp and press Send, then check again."}
 catch(e){$("applicationInstruction").textContent="Could not check right now. Please try again."}
};
$("backToResultsFromApplication").onclick=function(){if(applicationPollTimer)clearInterval(applicationPollTimer);applicationPollTimer=null;$("applicationPage").classList.add("hidden");showResultsPage()};
$("searchForm").addEventListener("submit",function(e){e.preventDefault();search(0)});
$("clearSearch").onclick=function(){
 $("jobKeyword").value="";$("jobCategory").value="All Categories";$("jobCountry").value="";$("jobState").value="";$("jobCity").value="";
 currentPage=0;$("resultsTitle").textContent="Search Results";$("resultCount").textContent="";$("results").innerHTML='<div class="empty">Enter your search criteria, then select Search Jobs.</div>';$("pager").innerHTML="";$("detailPanel").classList.add("hidden");$("status").classList.add("hidden");showSearchPage();
};
$("backToSearch").onclick=showSearchPage;
$("closeDetail").onclick=function(){$("detailPanel").classList.add("hidden")};
$("applyInfo").onclick=applyForJob;
loadCategories();
})();
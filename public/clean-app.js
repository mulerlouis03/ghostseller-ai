let currentUser=null;

function $(id){return document.getElementById(id)}
function val(id){return $(id)?.value?.trim() || ""}
function esc(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]))}
function token(){return localStorage.getItem("ghostseller_token") || localStorage.getItem("token") || localStorage.getItem("authToken") || localStorage.getItem("jwt") || ""}
function setToken(t){localStorage.setItem("ghostseller_token",t);localStorage.setItem("token",t)}
function isOwner(){const u=currentUser||{};return ["owner","admin"].includes(u.role||"") || String(u.email||"").toLowerCase().includes("muler")}

async function api(path,method="GET",body=null,auth=true){
  const headers={"Content-Type":"application/json","X-GhostSeller-Language":"fr"};
  if(auth && token()) headers.Authorization="Bearer "+token();
  const res=await fetch(path,{method,headers,body:body?JSON.stringify(body):null});
  const text=await res.text();
  let data={}; try{data=text?JSON.parse(text):{}}catch{data={raw:text}}
  if(!res.ok) throw new Error(data.error || data.message || "Erreur API");
  return data;
}

function msg(t,good=false){const el=$("authMsg"); if(el){el.className=good?"msg good":"msg";el.textContent=t}}

async function register(){
  try{
    const data=await api("/api/auth/register","POST",{name:val("name"),email:val("email"),password:val("password")},false);
    setToken(data.token); currentUser=data.user; msg("Compte créé.",true); await showApp();
  }catch(e){msg(e.message)}
}

async function login(){
  try{
    const data=await api("/api/auth/login","POST",{email:val("email"),password:val("password")},false);
    setToken(data.token); currentUser=data.user; msg("Connexion réussie.",true); await showApp();
  }catch(e){msg(e.message)}
}

async function forgotPassword(){
  try{
    if(!val("email")) return msg("Entre ton email d'abord.");
    const data=await api("/api/auth/forgot-password","POST",{email:val("email")},false);
    msg(data.message || "Email envoyé si le compte existe.",true);
  }catch(e){msg(e.message)}
}

async function showApp(){
  $("authView").classList.add("hidden");
  $("appView").classList.remove("hidden");
  try{const me=await api("/api/auth/me"); currentUser=me.user||currentUser}catch(e){}
  localStorage.setItem("user",JSON.stringify(currentUser||{}));
  updateUI();
  showPage("home");
}

function updateUI(){
  const u=currentUser||{};
  const plan=u.plan || "Gratuit";
  const credits=u.credits ?? 0;
  $("planPill").textContent=plan;
  $("creditsPill").textContent=`${credits} crédits`;
  $("accountName").textContent=u.name || u.full_name || "-";
  $("accountEmail").textContent=u.email || "-";
  $("accountRole").textContent=u.role || "user";
  $("accountPlan").textContent=plan;
  $("accountCredits").textContent=credits;
  if(isOwner()){
    $("ownerSideLink").classList.remove("hidden");
    $("ownerTopLink").classList.remove("hidden");
    $("accountOwnerLink").classList.remove("hidden");
  }
}

function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  $(id)?.classList.remove("hidden");
  document.querySelectorAll(".nav[data-page]").forEach(n=>n.classList.remove("active"));
  document.querySelector(`.nav[data-page="${id}"]`)?.classList.add("active");
  const titles={
    home:["Bienvenue sur GhostSeller AI","Commence par créer un contenu ou organiser tes prospects."],
    content:["Créer contenu","Prépare un post, un hook et un appel à l'action."],
    video:["Générer vidéo","Structure une vidéo courte prête pour TikTok."],
    tiktok:["TikTok","Prépare la connexion et la publication."],
    leads:["Leads","Organise les prospects qui peuvent devenir clients."],
    whatsapp:["WhatsApp","Prépare les messages qui convertissent."],
    subscription:["Mon abonnement","Choisis ou gère ta formule."],
    account:["Mon compte","Profil, sécurité et déconnexion."]
  };
  $("pageTitle").textContent=(titles[id]||titles.home)[0];
  $("pageSubtitle").textContent=(titles[id]||titles.home)[1];
}

function logout(){
  ["ghostseller_token","token","authToken","jwt","user","profile","session"].forEach(k=>{localStorage.removeItem(k);sessionStorage.removeItem(k)});
  location.href="/";
}

function localResult(type,prompt){
  return `<pre>${esc(JSON.stringify({
    type,
    prompt,
    resultat:"Aperçu généré par GhostSeller AI.",
    prochaines_etapes:["Créer le script","Préparer la publication","Collecter les leads","Relancer sur WhatsApp"]
  },null,2))}</pre>`;
}

async function generateContent(){
  const out=$("contentOut"); out.innerHTML="Génération...";
  try{
    const data=await api("/api/content/generate","POST",{niche:val("contentPrompt"),platform:"TikTok",tone:"direct",goal:"clients"});
    out.innerHTML=`<pre>${esc(JSON.stringify(data.result||data,null,2))}</pre>`;
  }catch(e){out.innerHTML=localResult("contenu",val("contentPrompt"))}
}

function generateVideo(){$("videoOut").innerHTML=localResult("video",val("videoPrompt"))}
function generateLeads(){$("leadsOut").innerHTML=localResult("leads",val("leadsPrompt"))}
function generateWhatsApp(){$("whatsappOut").innerHTML=localResult("whatsapp",val("whatsappPrompt"))}

async function checkout(plan){
  try{
    let data;
    try{data=await api("/api/billing/checkout","POST",{plan})}
    catch(e){data=await api("/api/revenue/checkout","POST",{plan})}
    if(data.url) location.href=data.url; else alert(data.message||"Paiement non disponible.");
  }catch(e){alert(e.message)}
}

async function openBillingPortal(){
  const out=$("billingOut"); out.innerHTML="Ouverture...";
  try{
    const data=await api("/api/billing/portal","POST",{});
    if(data.url) location.href=data.url; else out.innerHTML=`<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){out.innerHTML=`<pre>${esc(e.message)}</pre>`}
}

document.querySelectorAll(".nav[data-page]").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.page)));

(async function boot(){
  if(token()){
    try{const me=await api("/api/auth/me"); currentUser=me.user; await showApp()}
    catch(e){logout()}
  }
})();

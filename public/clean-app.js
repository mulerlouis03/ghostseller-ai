let currentUser=null;
const $=(id)=>document.getElementById(id);
const val=(id)=>$(id)?.value?.trim()||"";
const esc=(s)=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
const token=()=>localStorage.getItem("ghostseller_token")||localStorage.getItem("token")||localStorage.getItem("authToken")||localStorage.getItem("jwt")||"";
function setToken(t){localStorage.setItem("ghostseller_token",t);localStorage.setItem("token",t)}
function isOwnerUser(u=currentUser){
  const email=String(u?.email||"").toLowerCase();
  const role=String(u?.role||"").toLowerCase();
  return role==="owner"||role==="admin"||email.includes("muler");
}
function redirectOwnerIfNeeded(){
  if(isOwnerUser() && !location.pathname.startsWith("/owner") && !location.pathname.startsWith("/admin")){
    document.body.classList.add("ghost-owner-mode");
    location.href="/owner/";
    return true;
  }
  return false;
}
async function api(path,method="GET",body=null,auth=true){
  const headers={"Content-Type":"application/json","X-GhostSeller-Language":"fr"};
  if(auth&&token()) headers.Authorization="Bearer "+token();
  const res=await fetch(path,{method,headers,body:body?JSON.stringify(body):null});
  const text=await res.text(); let data={}; try{data=text?JSON.parse(text):{}}catch{data={raw:text}}
  if(!res.ok) throw new Error(data.error||data.message||"Erreur API");
  return data;
}
function msg(t,good=false){const el=$("authMsg"); if(el){el.className=good?"msg good":"msg";el.textContent=t}}
async function register(){
  try{const data=await api("/api/auth/register","POST",{name:val("name"),email:val("email"),password:val("password")},false);setToken(data.token);currentUser=data.user;localStorage.setItem("user",JSON.stringify(currentUser||{}));if(redirectOwnerIfNeeded())return;msg("Compte créé.",true);await showApp()}catch(e){msg(e.message)}
}
async function login(){
  try{const data=await api("/api/auth/login","POST",{email:val("email"),password:val("password")},false);setToken(data.token);currentUser=data.user;localStorage.setItem("user",JSON.stringify(currentUser||{}));if(redirectOwnerIfNeeded())return;msg("Connexion réussie.",true);await showApp()}catch(e){msg(e.message)}
}
async function forgotPassword(){
  try{if(!val("email"))return msg("Entre ton email d'abord.");const data=await api("/api/auth/forgot-password","POST",{email:val("email")},false);msg(data.message||"Email envoyé si le compte existe.",true)}catch(e){msg(e.message)}
}
async function showApp(){
  $("authView").classList.add("hidden");$("appView").classList.remove("hidden");
  try{const me=await api("/api/auth/me");currentUser=me.user||currentUser}catch(e){}
  localStorage.setItem("user",JSON.stringify(currentUser||{}));
  if(redirectOwnerIfNeeded())return;
  updateUI(); showPage("home");
}
function updateUI(){
  const u=currentUser||{}, plan=u.plan||"Gratuit", credits=u.credits??0;
  $("planPill").textContent=plan; $("creditsPill").textContent=`${credits} crédits`;
  $("accountName").textContent=u.name||u.full_name||"-"; $("accountEmail").textContent=u.email||"-";
  $("accountRole").textContent=u.role||"user"; $("accountPlan").textContent=plan; $("accountCredits").textContent=credits;
  if(isOwnerUser()){ $("ownerSideLink")?.classList.remove("hidden"); $("accountOwnerLink")?.classList.remove("hidden"); }
  else { $("ownerSideLink")?.remove(); $("ownerTopLink")?.remove(); $("accountOwnerLink")?.remove(); }
}
function showPage(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden")); $(id)?.classList.remove("hidden");
  document.querySelectorAll(".nav[data-page]").forEach(n=>n.classList.remove("active"));
  document.querySelector(`.nav[data-page="${id}"]`)?.classList.add("active");
  const titles={home:["Bienvenue sur GhostSeller AI","Commence par créer un contenu ou organiser tes prospects."],content:["Créer contenu","Prépare un post, un hook et un appel à l'action."],video:["Générer vidéo","Structure une vidéo courte prête pour TikTok."],tiktok:["TikTok","Prépare la connexion et la publication."],leads:["Leads","Organise les prospects qui peuvent devenir clients."],whatsapp:["WhatsApp","Prépare les messages qui convertissent."],subscription:["Mon abonnement","Choisis ou gère ta formule."],account:["Mon compte","Profil, sécurité et déconnexion."]};
  $("pageTitle").textContent=(titles[id]||titles.home)[0]; $("pageSubtitle").textContent=(titles[id]||titles.home)[1];
}
function logout(){["ghostseller_token","token","authToken","jwt","user","profile","session"].forEach(k=>{try{localStorage.removeItem(k)}catch(e){};try{sessionStorage.removeItem(k)}catch(e){}});location.href="/"}
function localResult(type,prompt){return `<pre>${esc(JSON.stringify({type,prompt,resultat:"Aperçu généré par GhostSeller AI.",prochaines_etapes:["Créer le script","Préparer la publication","Collecter les leads","Relancer sur WhatsApp"]},null,2))}</pre>`}
async function generateContent(){const out=$("contentOut");out.innerHTML="Génération...";try{const data=await api("/api/content/generate","POST",{niche:val("contentPrompt"),platform:"TikTok",tone:"direct",goal:"clients"});out.innerHTML=`<pre>${esc(JSON.stringify(data.result||data,null,2))}</pre>`}catch(e){out.innerHTML=localResult("contenu",val("contentPrompt"))}}
function generateVideo(){$("videoOut").innerHTML=localResult("video",val("videoPrompt"))}
function generateLeads(){$("leadsOut").innerHTML=localResult("leads",val("leadsPrompt"))}
function generateWhatsApp(){$("whatsappOut").innerHTML=localResult("whatsapp",val("whatsappPrompt"))}
async function checkout(plan){try{let data;try{data=await api("/api/billing/checkout","POST",{plan})}catch(e){data=await api("/api/revenue/checkout","POST",{plan})}if(data.url)location.href=data.url;else alert(data.message||"Paiement non disponible.")}catch(e){alert(e.message)}}
async function openBillingPortal(){const out=$("billingOut");out.innerHTML="Ouverture...";try{const data=await api("/api/billing/portal","POST",{});if(data.url)location.href=data.url;else out.innerHTML=`<pre>${esc(JSON.stringify(data,null,2))}</pre>`}catch(e){out.innerHTML=`<pre>${esc(e.message)}</pre>`}}
document.querySelectorAll(".nav[data-page]").forEach(btn=>btn.addEventListener("click",()=>showPage(btn.dataset.page)));
(async function boot(){
  try{const cached=JSON.parse(localStorage.getItem("user")||"{}");if(cached?.email){currentUser=cached;if(redirectOwnerIfNeeded())return}}catch(e){}
  if(token()){try{const me=await api("/api/auth/me");currentUser=me.user;localStorage.setItem("user",JSON.stringify(currentUser||{}));if(redirectOwnerIfNeeded())return;await showApp()}catch(e){logout()}}
})();

async function sendTesterFeedback(){
  const out=document.getElementById("accountFeedbackOut");
  if(out) out.innerHTML="Envoi...";
  try{
    const u=currentUser||{};
    const message=document.getElementById("accountFeedback")?.value||"";
    const rating=document.getElementById("accountFeedbackType")?.value||"Retour général";
    const res=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:u.name||u.full_name||"",email:u.email||"",rating,message,page:"account"})});
    const data=await res.json();
    if(!res.ok) throw new Error(data.error||"Erreur");
    if(out) out.innerHTML="Merci, ton retour a été envoyé.";
  }catch(e){ if(out) out.innerHTML="Impossible d'envoyer le retour pour le moment."; }
}

window.addEventListener('load',()=>{
 try{
  if(!localStorage.getItem('ghostseller_beta_seen')){
   alert('Bienvenue dans GhostSeller AI. Vous participez actuellement à la phase bêta. Certaines fonctions sont encore en construction.');
   localStorage.setItem('ghostseller_beta_seen','1');
  }
 }catch(e){}
});


function openFeedbackFromBeta(){
  if(typeof showPage === "function"){
    showPage("account");
  }
  setTimeout(function(){
    const type = document.getElementById("accountFeedbackType");
    const box = document.getElementById("accountFeedback");
    if(type) type.value = "Retour général";
    if(box){
      box.focus();
      box.scrollIntoView({behavior:"smooth",block:"center"});
    }
  },250);
}


/* V107 mobile menu */
function toggleMobileMenu(){
  document.body.classList.toggle("mobileMenuOpen");
}
function closeMobileMenu(){
  document.body.classList.remove("mobileMenuOpen");
}
document.addEventListener("click", function(e){
  const nav = e.target.closest && e.target.closest(".nav[data-page]");
  if(nav) closeMobileMenu();
});

/* V107 reliable feedback sender */
async function sendTesterFeedback(){
  const out=document.getElementById("accountFeedbackOut");
  const box=document.getElementById("accountFeedback");
  const type=document.getElementById("accountFeedbackType");
  const message=(box?.value||"").trim();

  if(out) out.innerHTML="";
  if(!message || message.length < 3){
    if(out) out.innerHTML="Écris un petit message avant d'envoyer.";
    if(box) box.focus();
    return;
  }

  if(out) out.innerHTML="Envoi du retour...";
  try{
    const u=currentUser||JSON.parse(localStorage.getItem("user")||"{}")||{};
    const res=await fetch("/api/feedback",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({
        name:u.name||u.full_name||"",
        email:u.email||"",
        rating:type?.value||"Retour général",
        message,
        page:"account"
      })
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error||"Erreur serveur");
    if(out) out.innerHTML="Merci, ton retour a été envoyé.";
    if(box) box.value="";
  }catch(e){
    if(out) out.innerHTML="Impossible d'envoyer le retour pour le moment. Tu peux aussi l'envoyer directement à Muler sur WhatsApp.";
  }
}


async function sendFeedbackPayload(payload, outId){
  const out = document.getElementById(outId);
  if(out) out.innerHTML = "Envoi du retour...";
  try{
    const res = await fetch("/api/feedback",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    const text = await res.text();
    let data = {};
    try{ data = JSON.parse(text); }catch(e){ data = { raw:text }; }
    if(!res.ok) throw new Error(data.error || "Erreur serveur");
    if(out) out.innerHTML = "Merci, ton retour a été envoyé.";
    return data;
  }catch(e){
    if(out) out.innerHTML = "Le retour n'a pas pu partir automatiquement. Copie ton message et envoie-le à Muler sur WhatsApp.";
    throw e;
  }
}

async function sendDashboardFeedback(){
  const box = document.getElementById("dashboardFeedbackMessage");
  const type = document.getElementById("dashboardFeedbackType");
  const message = (box?.value || "").trim();

  if(!message || message.length < 3){
    const out = document.getElementById("dashboardFeedbackOut");
    if(out) out.innerHTML = "Écris un petit message avant d'envoyer.";
    if(box) box.focus();
    return;
  }

  const u = currentUser || JSON.parse(localStorage.getItem("user") || "{}") || {};
  try{
    await sendFeedbackPayload({
      name:u.name || u.full_name || "",
      email:u.email || "",
      rating:type?.value || "Retour général",
      message,
      page:"dashboard"
    }, "dashboardFeedbackOut");
    if(box) box.value = "";
  }catch(e){}
}

async function sendTesterFeedback(){
  const box=document.getElementById("accountFeedback");
  const type=document.getElementById("accountFeedbackType");
  const message=(box?.value||"").trim();

  if(!message || message.length < 3){
    const out=document.getElementById("accountFeedbackOut");
    if(out) out.innerHTML="Écris un petit message avant d'envoyer.";
    if(box) box.focus();
    return;
  }

  const u=currentUser||JSON.parse(localStorage.getItem("user")||"{}")||{};
  try{
    await sendFeedbackPayload({
      name:u.name||u.full_name||"",
      email:u.email||"",
      rating:type?.value||"Retour général",
      message,
      page:"account"
    }, "accountFeedbackOut");
    if(box) box.value="";
  }catch(e){}
}


/* V109 reliable feedback + WhatsApp fallback */
const GHOSTSELLER_WHATSAPP = "33782267983";

function buildWhatsAppFeedback(message, type, source){
  const u = currentUser || JSON.parse(localStorage.getItem("user") || "{}") || {};
  const name = u.name || u.full_name || "Utilisateur";
  const email = u.email || "";
  const text =
`Retour GhostSeller AI
Source: ${source}
Type: ${type || "Retour général"}
Nom: ${name}
Email: ${email}

Message:
${message || ""}`;
  return "https://wa.me/" + GHOSTSELLER_WHATSAPP + "?text=" + encodeURIComponent(text);
}

function openWhatsAppFeedback(message, type, source){
  const url = buildWhatsAppFeedback(message, type, source);
  window.open(url, "_blank");
}

async function sendFeedbackPayload(payload, outId){
  const out = document.getElementById(outId);
  if(out) out.innerHTML = "Envoi du retour...";
  try{
    const res = await fetch("/api/feedback",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify(payload)
    });
    const text = await res.text();
    let data = {};
    try{ data = JSON.parse(text); }catch(e){ data = { raw:text }; }
    if(!res.ok) throw new Error(data.error || "Erreur serveur");
    if(out) out.innerHTML = "Merci, ton retour a été envoyé.";
    return data;
  }catch(e){
    if(out) out.innerHTML = "L'envoi automatique bloque. Clique sur “Envoyer sur WhatsApp” juste en dessous.";
    throw e;
  }
}

async function sendDashboardFeedback(){
  const box = document.getElementById("dashboardFeedbackMessage");
  const type = document.getElementById("dashboardFeedbackType");
  const message = (box?.value || "").trim();

  if(!message || message.length < 1){
    const out = document.getElementById("dashboardFeedbackOut");
    if(out) out.innerHTML = "Écris ton retour avant d'envoyer.";
    if(box) box.focus();
    return;
  }

  const u = currentUser || JSON.parse(localStorage.getItem("user") || "{}") || {};
  try{
    await sendFeedbackPayload({
      name:u.name || u.full_name || "",
      email:u.email || "",
      rating:type?.value || "Retour général",
      message,
      page:"dashboard"
    }, "dashboardFeedbackOut");
    if(box) box.value = "";
  }catch(e){}
}

function sendDashboardFeedbackWhatsApp(){
  const box = document.getElementById("dashboardFeedbackMessage");
  const type = document.getElementById("dashboardFeedbackType");
  const message = (box?.value || "").trim();
  if(!message){
    const out = document.getElementById("dashboardFeedbackOut");
    if(out) out.innerHTML = "Écris ton retour avant d'ouvrir WhatsApp.";
    if(box) box.focus();
    return;
  }
  openWhatsAppFeedback(message, type?.value || "Retour général", "Dashboard utilisateur");
}

async function sendTesterFeedback(){
  const box=document.getElementById("accountFeedback");
  const type=document.getElementById("accountFeedbackType");
  const message=(box?.value||"").trim();

  if(!message || message.length < 1){
    const out=document.getElementById("accountFeedbackOut");
    if(out) out.innerHTML="Écris ton retour avant d'envoyer.";
    if(box) box.focus();
    return;
  }

  const u=currentUser||JSON.parse(localStorage.getItem("user")||"{}")||{};
  try{
    await sendFeedbackPayload({
      name:u.name||u.full_name||"",
      email:u.email||"",
      rating:type?.value||"Retour général",
      message,
      page:"account"
    }, "accountFeedbackOut");
    if(box) box.value="";
  }catch(e){}
}

function sendAccountFeedbackWhatsApp(){
  const box=document.getElementById("accountFeedback");
  const type=document.getElementById("accountFeedbackType");
  const message=(box?.value||"").trim();
  if(!message){
    const out=document.getElementById("accountFeedbackOut");
    if(out) out.innerHTML="Écris ton retour avant d'ouvrir WhatsApp.";
    if(box) box.focus();
    return;
  }
  openWhatsAppFeedback(message, type?.value || "Retour général", "Mon compte");
}

/* V112 feedback guard */
async function sendDashboardFeedback(){
  const box=document.getElementById("dashboardFeedbackMessage");
  const type=document.getElementById("dashboardFeedbackType");
  const out=document.getElementById("dashboardFeedbackOut");
  const message=(box?.value||"").trim();
  if(!message){ if(out) out.innerHTML="Écris ton retour avant d'envoyer."; if(box) box.focus(); return; }
  if(out) out.innerHTML="Envoi du retour...";
  try{
    const u=currentUser||JSON.parse(localStorage.getItem("user")||"{}")||{};
    const res=await fetch("/api/feedback",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name:u.name||u.full_name||"",email:u.email||"",rating:type?.value||"Retour général",message,page:"dashboard"})});
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error||"Erreur");
    if(out) out.innerHTML="Merci, ton retour a été envoyé.";
    if(box) box.value="";
  }catch(e){ if(out) out.innerHTML="Impossible d'envoyer automatiquement. Tu peux aussi envoyer ton retour sur WhatsApp à Muler."; }
}


/* V116 Feedback modal */
function openFeedbackModal(){
  const modal = document.getElementById("feedbackModal");
  if(modal) modal.classList.remove("hidden");
  setTimeout(()=>document.getElementById("dashboardFeedbackMessage")?.focus(),80);
}
function closeFeedbackModal(){
  const modal = document.getElementById("feedbackModal");
  if(modal) modal.classList.add("hidden");
}
document.addEventListener("keydown", function(e){
  if(e.key === "Escape") closeFeedbackModal();
});


/* V117: readable user results, no raw JSON */
function gsUser(){
  try{return currentUser || JSON.parse(localStorage.getItem("user")||"{}") || {}}catch(e){return {}}
}
function gsName(){
  const u=gsUser();
  return u.full_name || u.name || u.username || (u.email?u.email.split("@")[0]:"Utilisateur");
}
function updateProfileIdentity(){
  const u=gsUser();
  const name=gsName();
  const email=u.email || "Compte connecté";
  const n1=document.getElementById("profileFullNameLabel");
  const e1=document.getElementById("profileEmailLabel");
  const s1=document.getElementById("sidebarUserName");
  const s2=document.getElementById("mobileUserName");
  if(n1) n1.textContent=name;
  if(e1) e1.textContent=email;
  if(s1) s1.textContent=name;
  if(s2) s2.textContent=name;
  const saved=localStorage.getItem("ghostseller_avatar");
  const avatar=document.getElementById("profileAvatarPreview");
  if(avatar){
    if(saved) avatar.innerHTML='<img src="'+saved+'" alt="Photo profil">';
    else avatar.textContent=(name||"G").slice(0,1).toUpperCase();
  }
}
function saveProfileAvatar(event){
  const file=event.target.files && event.target.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=function(){
    localStorage.setItem("ghostseller_avatar", reader.result);
    updateProfileIdentity();
  };
  reader.readAsDataURL(file);
}
setInterval(updateProfileIdentity,1200);
document.addEventListener("DOMContentLoaded",updateProfileIdentity);

function copyText(text){
  navigator.clipboard?.writeText(text).then(()=>alert("Copié !")).catch(()=>{});
}
function cleanPromptText(v){
  return String(v||"").trim();
}
function makeContentResult(prompt){
  const niche = cleanPromptText(prompt) || "ton offre";
  const script = `Hook : Tu veux attirer plus de clients sans passer ta journée à chercher quoi poster ?

Post :
${niche}

Le problème, ce n’est pas seulement le produit. C’est la façon de le présenter.
Montre le résultat, crée une émotion, puis donne une action simple.

CTA :
Écris “INFO” en commentaire ou envoie un message pour recevoir l’offre.`;
  return `
    <div class="generatedResult">
      <h2>🤖 Contenu généré</h2>
      <div class="resultGrid">
        <div class="resultMiniCard"><b>Angle</b><p>Curiosité + bénéfice client</p></div>
        <div class="resultMiniCard"><b>Format</b><p>Post court / TikTok / Reels</p></div>
        <div class="resultMiniCard"><b>Objectif</b><p>Attirer des prospects</p></div>
      </div>
      <div class="scriptBlock">${script}</div>
      <button class="copyBtn" onclick='copyText(${JSON.stringify(script)})'>Copier le contenu</button>
    </div>`;
}
function makeVideoResult(prompt){
  const topic=cleanPromptText(prompt)||"ton produit";
  const script=`Scène 1 — Hook
Plan serré sur le produit.
Texte écran : “Tu cherches quelque chose qui attire vraiment l’attention ?”

Scène 2 — Problème
Montre une situation simple : les gens passent devant sans réagir.
Voix off : “Le problème, ce n’est pas ton offre, c’est la présentation.”

Scène 3 — Solution
Présente ${topic} avec un angle premium et émotionnel.
Texte écran : “Design. Désir. Confiance.”

Scène 4 — Preuve / bénéfice
Montre le produit en utilisation ou en situation.
Voix off : “Une bonne vidéo doit donner envie en quelques secondes.”

Scène 5 — CTA
Texte écran : “Écris INFO pour recevoir l’offre.”
Bouton / message : “Contacte-nous maintenant.”`;
  return `
    <div class="generatedResult">
      <h2>🎬 Script vidéo généré</h2>
      <div class="resultGrid">
        <div class="resultMiniCard"><b>Durée conseillée</b><p>15 à 25 secondes</p></div>
        <div class="resultMiniCard"><b>Format</b><p>TikTok, Reels, Shorts</p></div>
        <div class="resultMiniCard"><b>Style</b><p>Rapide, visuel, premium</p></div>
      </div>
      <div class="scriptBlock">${script}</div>
      <button class="copyBtn" onclick='copyText(${JSON.stringify(script)})'>Copier le script</button>
    </div>`;
}
function makeLeadsResult(prompt){
  const q=cleanPromptText(prompt)||"clients potentiels";
  return `
    <div class="generatedResult">
      <h2>👥 Recherche de leads préparée</h2>
      <p class="mutedLine">GhostSeller prépare une stratégie de recherche. La collecte automatique sera renforcée dans une prochaine version.</p>
      <div class="resultGrid">
        <div class="resultMiniCard"><b>Cible</b><p>${q}</p></div>
        <div class="resultMiniCard"><b>Où chercher</b><p>Facebook Groups, TikTok comments, Instagram, Google Maps, LinkedIn</p></div>
        <div class="resultMiniCard"><b>Message d’approche</b><p>Proposer une aide simple, pas vendre directement.</p></div>
      </div>
      <div class="scriptBlock">Message type :
Bonjour, j’ai vu votre activité et je pense qu’un contenu court pourrait vous aider à attirer plus de clients. Je peux vous montrer une idée simple adaptée à votre business.</div>
    </div>`;
}
function makeWhatsappResult(prompt){
  const topic=cleanPromptText(prompt)||"ton offre";
  const msg=`Message 1 :
Bonjour, j’ai vu votre activité et je pense que ${topic} peut intéresser vos clients. Je peux vous envoyer une idée simple ?

Message 2 :
L’objectif est de vous aider à attirer plus de personnes avec un message clair et facile à comprendre.

Message 3 :
Si vous voulez, je peux vous préparer un exemple adapté à votre business.`;
  return `
    <div class="generatedResult">
      <h2>💬 Séquence WhatsApp générée</h2>
      <div class="resultGrid">
        <div class="resultMiniCard"><b>Ton</b><p>Simple, direct, humain</p></div>
        <div class="resultMiniCard"><b>Objectif</b><p>Obtenir une réponse</p></div>
      </div>
      <div class="scriptBlock">${msg}</div>
      <button class="copyBtn" onclick='copyText(${JSON.stringify(msg)})'>Copier les messages</button>
    </div>`;
}

function findNearestTextarea(btn){
  const section=btn.closest("section") || document;
  return section.querySelector("textarea");
}
function placeResult(btn, html){
  const section=btn.closest("section") || document;
  let out=section.querySelector(".generatedResult");
  if(out) out.remove();
  btn.insertAdjacentHTML("afterend", html);
}

/* Capture old buttons and replace visible result after original action */
document.addEventListener("click", function(e){
  const btn=e.target.closest("button");
  if(!btn) return;
  const label=(btn.textContent||"").toLowerCase();
  const section=btn.closest("section");
  if(!section) return;
  const pageId=section.id || "";
  if(label.includes("générer contenu") || (pageId==="content" && label.includes("générer"))){
    setTimeout(()=>placeResult(btn, makeContentResult(findNearestTextarea(btn)?.value)), 350);
  }
  if(label.includes("script vidéo") || pageId==="video"){
    setTimeout(()=>placeResult(btn, makeVideoResult(findNearestTextarea(btn)?.value)), 350);
  }
  if(label.includes("préparer une recherche") || pageId==="leads"){
    setTimeout(()=>placeResult(btn, makeLeadsResult(findNearestTextarea(btn)?.value)), 350);
  }
  if(label.includes("générer messages") || pageId==="whatsapp"){
    setTimeout(()=>placeResult(btn, makeWhatsappResult(findNearestTextarea(btn)?.value)), 350);
  }
}, true);

/* Hide raw JSON pre blocks after generation */
setInterval(()=>{
  document.querySelectorAll("pre").forEach(pre=>{
    const t=pre.textContent.trim();
    if(t.startsWith("{") && (t.includes('"type"') || t.includes('"result"') || t.includes('"prochaines_etapes"'))){
      pre.setAttribute("data-raw-json","true");
      pre.style.display="none";
    }
  });
},500);

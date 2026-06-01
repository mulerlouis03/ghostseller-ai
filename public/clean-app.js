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


/* V120 AI EMPLOYEE ENGINE — final deliverables, not advice */
function gsEscapeHtml(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function gsInput(v){
  return String(v || "").trim().replace(/\s+/g," ");
}
function gsKeyword(prompt){
  const p = gsInput(prompt);
  if(!p) return "votre offre";
  return p.length > 90 ? p.slice(0,90) + "..." : p;
}
function gsHas(word, text){
  return String(text||"").toLowerCase().includes(word);
}
function gsProductName(prompt){
  const p = gsInput(prompt);
  const low = p.toLowerCase();
  if(low.includes("basket")) return "baskets";
  if(low.includes("parfum")) return "parfum";
  if(low.includes("recharge")) return "service de recharge";
  if(low.includes("coiff")) return "service coiffure";
  if(low.includes("restaurant")) return "restaurant";
  if(low.includes("immobilier")) return "service immobilier";
  return "offre";
}
function gsAudience(prompt){
  const p = gsInput(prompt);
  const m = p.match(/(\d{2}\s*(?:à|a|-)\s*\d{2}\s*ans)/i);
  if(m) return m[1];
  if(p.toLowerCase().includes("jeune")) return "jeunes actifs";
  return "clients potentiels";
}
function gsCopy(text){
  navigator.clipboard?.writeText(text).then(()=>alert("Copié !")).catch(()=>alert("Copie impossible sur ce navigateur."));
}
function gsSaveHistory(type, title, text){
  try{
    const list = JSON.parse(localStorage.getItem("ghostseller_history") || "[]");
    list.unshift({type,title,text,created_at:new Date().toISOString()});
    localStorage.setItem("ghostseller_history", JSON.stringify(list.slice(0,50)));
  }catch(e){}
}
function gsResultShell(title, body, copyText, badge="Travail terminé"){
  return `
    <div class="employeeResult">
      <div class="employeeHeader">
        <div><span class="employeeBadge">✅ ${badge}</span><h2>${title}</h2></div>
        <button class="copyBtn" onclick='gsCopy(${JSON.stringify(copyText)})'>Copier tout</button>
      </div>
      ${body}
    </div>`;
}
function gsContentEmployee(prompt){
  const product = gsProductName(prompt);
  const audience = gsAudience(prompt);
  const base = gsKeyword(prompt);

  const facebook = `🔥 Vous cherchez une offre qui attire vraiment l’attention ?

${base}

Ce qui fait la différence aujourd’hui, ce n’est pas seulement le produit : c’est la façon de le présenter.

✅ Style clair
✅ Message direct
✅ Offre facile à comprendre
✅ Action simple pour passer à l’étape suivante

📩 Écrivez “INFO” en commentaire ou envoyez un message privé pour recevoir les détails.`;

  const instagram = `✨ ${product.charAt(0).toUpperCase()+product.slice(1)} pour ${audience}

Tu veux quelque chose qui se remarque vite ?
Cette offre est pensée pour créer l’effet “je veux en savoir plus”.

🔥 Look / valeur / confiance
📌 Message simple
📩 DM “INFO” pour recevoir les détails

#business #marketing #vente #tiktokbusiness #reels #entrepreneur`;

  const tiktok = `🎬 SCRIPT TIKTOK — prêt à publier

HOOK :
“Tu passes à côté de cette offre et tu ne le sais même pas.”

PLAN 1 :
Montre le produit ou l’offre en gros plan.

PLAN 2 :
Texte écran : “Pensé pour ${audience}.”

PLAN 3 :
Montre le bénéfice principal en situation réelle.

PLAN 4 :
Texte écran : “Simple. Rapide. Efficace.”

CTA :
“Écris INFO pour recevoir les détails.”`;

  const hashtags = `#business #vente #marketingdigital #tiktokfrance #reelsfrance #entrepreneur #offre #clients`;

  const all = `PUBLICATION FACEBOOK\n\n${facebook}\n\n---\n\nPUBLICATION INSTAGRAM\n\n${instagram}\n\n---\n\nSCRIPT TIKTOK\n\n${tiktok}\n\n---\n\nHASHTAGS\n${hashtags}`;

  gsSaveHistory("content","Contenus prêts à publier",all);

  return gsResultShell("🤖 Contenus prêts à publier", `
    <div class="deliverableGrid">
      <div class="deliverableCard"><h3>Facebook</h3><div class="deliverableText">${gsEscapeHtml(facebook)}</div><button onclick='gsCopy(${JSON.stringify(facebook)})'>Copier Facebook</button></div>
      <div class="deliverableCard"><h3>Instagram</h3><div class="deliverableText">${gsEscapeHtml(instagram)}</div><button onclick='gsCopy(${JSON.stringify(instagram)})'>Copier Instagram</button></div>
      <div class="deliverableCard"><h3>TikTok</h3><div class="deliverableText">${gsEscapeHtml(tiktok)}</div><button onclick='gsCopy(${JSON.stringify(tiktok)})'>Copier TikTok</button></div>
    </div>
    <div class="employeeSection"><b>Hashtags prêts :</b><p>${gsEscapeHtml(hashtags)}</p></div>
  `, all);
}
function gsVideoEmployee(prompt){
  const product = gsProductName(prompt);
  const audience = gsAudience(prompt);
  const topic = gsKeyword(prompt);

  const script = `🎬 SCRIPT VIDÉO COMPLET — 20 secondes

SCÈNE 1 — HOOK (0-3s)
Plan : gros plan rapide sur ${product}.
Texte écran : “Tu veux attirer l’attention en quelques secondes ?”
Voix off : “Regarde bien ça.”

SCÈNE 2 — DÉSIR (3-7s)
Plan : montrer le produit / l’offre en situation.
Texte écran : “Pensé pour ${audience}.”
Voix off : “Le bon message peut transformer une simple offre en vraie envie.”

SCÈNE 3 — PREUVE (7-12s)
Plan : zoom sur détail, bénéfice, résultat ou usage.
Texte écran : “Simple. Visuel. Direct.”
Voix off : “On comprend tout de suite pourquoi ça donne envie.”

SCÈNE 4 — OFFRE (12-17s)
Plan : montrer clairement l’offre.
Texte écran : “Disponible maintenant.”
Voix off : “Si tu veux les infos, c’est le moment.”

SCÈNE 5 — CTA (17-20s)
Plan : écran final avec contact.
Texte écran : “Écris INFO maintenant.”
Voix off : “Envoie INFO et je t’envoie les détails.”

DESCRIPTION TIKTOK :
${topic}
Une offre claire, un message simple, une action directe. Écris INFO pour recevoir les détails.

HASHTAGS :
#tiktokbusiness #reels #shorts #vente #marketing #entrepreneur #clients`;

  gsSaveHistory("video","Script vidéo complet",script);

  return gsResultShell("🎬 Script vidéo complet prêt à tourner", `
    <div class="resultGrid">
      <div class="resultMiniCard"><b>Durée</b><p>20 secondes</p></div>
      <div class="resultMiniCard"><b>Format</b><p>TikTok / Reels / Shorts</p></div>
      <div class="resultMiniCard"><b>Objectif</b><p>Faire répondre “INFO”</p></div>
    </div>
    <div class="scriptBlock employeeScript">${gsEscapeHtml(script)}</div>
  `, script);
}
function gsLeadsEmployee(prompt){
  const target = gsKeyword(prompt);
  const pack = `👥 PLAN DE PROSPECTION PRÊT À UTILISER

CIBLE :
${target}

PROFILS À CONTACTER :
1. Petits commerces qui publient peu sur les réseaux
2. Entrepreneurs avec une offre claire mais peu de contenu
3. Boutiques locales avec Instagram/Facebook actifs
4. Prestataires qui dépendent du bouche-à-oreille
5. Créateurs qui vendent déjà mais sans système régulier

OÙ LES TROUVER :
- Facebook Groups locaux
- Commentaires TikTok sous vidéos business
- Instagram avec hashtags de niche
- Google Maps commerces locaux
- LinkedIn pour services B2B

MOTS-CLÉS À CHERCHER :
business local, boutique, entrepreneur, service, promotion, lancement, offre, client, vente, marketing

MESSAGE D’APPROCHE :
Bonjour, j’ai vu votre activité et je pense qu’un contenu court pourrait vous aider à attirer plus de clients.
Je peux vous montrer une idée simple adaptée à votre business. Vous voulez que je vous envoie un exemple ?

RELANCE 24H :
Je me permets de relancer. L’idée serait de vous proposer un exemple concret, sans engagement, pour voir si ça peut vous aider à obtenir plus de visibilité.

RELANCE 72H :
Dernière relance de ma part. Si vous voulez tester une idée de contenu pour votre activité, je peux vous préparer un exemple rapide.`;

  gsSaveHistory("leads","Plan de prospection",pack);

  return gsResultShell("👥 Plan de prospection prêt", `
    <div class="deliverableGrid three">
      <div class="deliverableCard"><h3>Cibles</h3><div class="deliverableText">Petits commerces<br>Entrepreneurs<br>Boutiques locales<br>Prestataires<br>Créateurs vendeurs</div></div>
      <div class="deliverableCard"><h3>Canaux</h3><div class="deliverableText">Facebook Groups<br>TikTok comments<br>Instagram<br>Google Maps<br>LinkedIn</div></div>
      <div class="deliverableCard"><h3>Action</h3><div class="deliverableText">Contacter 20 profils<br>Envoyer le message<br>Relancer J+1<br>Relancer J+3</div></div>
    </div>
    <div class="scriptBlock employeeScript">${gsEscapeHtml(pack)}</div>
  `, pack);
}
function gsWhatsAppEmployee(prompt){
  const offer = gsKeyword(prompt);
  const seq = `💬 SÉQUENCE WHATSAPP PRÊTE À ENVOYER

MESSAGE 1 — Premier contact
Bonjour 👋
J’ai vu votre activité et je pense que ${offer} peut être présenté de manière plus claire pour attirer plus de clients.
Je peux vous envoyer une idée simple adaptée à votre business ?

MESSAGE 2 — Si la personne répond “oui”
Parfait. L’idée est de créer un contenu court qui montre votre offre, donne envie rapidement et pousse les gens à vous contacter.
Je peux vous préparer un exemple avec un hook + un message + un appel à l’action.

MESSAGE 3 — Relance 24h
Bonjour, je me permets de relancer rapidement.
Je pense vraiment qu’un contenu simple pourrait vous aider à rendre votre offre plus visible.
Vous voulez que je vous montre un exemple ?

MESSAGE 4 — Relance 72h
Dernière relance de ma part.
Si ce n’est pas le bon moment, aucun souci.
Mais si vous voulez tester une idée de contenu pour votre business, je peux vous préparer un exemple rapide.

MESSAGE 5 — Closing
Super. Envoyez-moi juste :
1. le nom de votre activité
2. ce que vous vendez
3. le type de client que vous voulez attirer
et je vous prépare une première idée.`;

  gsSaveHistory("whatsapp","Séquence WhatsApp",seq);

  return gsResultShell("💬 Séquence WhatsApp prête à envoyer", `
    <div class="resultGrid">
      <div class="resultMiniCard"><b>Nombre de messages</b><p>5</p></div>
      <div class="resultMiniCard"><b>Objectif</b><p>Obtenir une réponse</p></div>
      <div class="resultMiniCard"><b>Ton</b><p>Humain, clair, direct</p></div>
    </div>
    <div class="scriptBlock employeeScript">${gsEscapeHtml(seq)}</div>
  `, seq);
}

/* Strong override of core functions */
async function generateContent(){
  const out=document.getElementById("contentOut");
  const prompt=(document.getElementById("contentPrompt")?.value||"").trim();
  if(!prompt){out.innerHTML="<div class='generatedResult'>Décris ton offre avant de lancer GhostSeller.</div>";return;}
  out.innerHTML="GhostSeller travaille...";
  setTimeout(()=>{out.innerHTML=gsContentEmployee(prompt);},500);
}
function generateVideo(){
  const out=document.getElementById("videoOut");
  const prompt=(document.getElementById("videoPrompt")?.value||"").trim();
  if(!prompt){out.innerHTML="<div class='generatedResult'>Décris le sujet de la vidéo avant de lancer GhostSeller.</div>";return;}
  out.innerHTML="GhostSeller prépare le script complet...";
  setTimeout(()=>{out.innerHTML=gsVideoEmployee(prompt);},500);
}
function generateLeads(){
  const out=document.getElementById("leadsOut");
  const prompt=(document.getElementById("leadsPrompt")?.value||"").trim();
  if(!prompt){out.innerHTML="<div class='generatedResult'>Décris les clients que tu veux cibler.</div>";return;}
  out.innerHTML="GhostSeller prépare le plan de prospection...";
  setTimeout(()=>{out.innerHTML=gsLeadsEmployee(prompt);},500);
}
function generateWhatsApp(){
  const out=document.getElementById("whatsappOut");
  const prompt=(document.getElementById("whatsappPrompt")?.value||"").trim();
  if(!prompt){out.innerHTML="<div class='generatedResult'>Décris ton offre avant de générer les messages.</div>";return;}
  out.innerHTML="GhostSeller rédige la séquence...";
  setTimeout(()=>{out.innerHTML=gsWhatsAppEmployee(prompt);},500);
}

function placeResult(btn, html){ /* V120 disables old preview injector */ }


/* V121 Product Upload */
function handleProductImage(event){
  const file = event.target.files && event.target.files[0];
  if(!file) return;
  if(!file.type.startsWith("image/")){
    alert("Merci de choisir une image.");
    return;
  }
  const reader = new FileReader();
  reader.onload = function(){
    localStorage.setItem("ghostseller_product_image", reader.result);
    localStorage.setItem("ghostseller_product_image_name", file.name || "image-produit");
    renderProductImagePreview();
  };
  reader.readAsDataURL(file);
}
function removeProductImage(){
  localStorage.removeItem("ghostseller_product_image");
  localStorage.removeItem("ghostseller_product_image_name");
  const input = document.getElementById("productImageInput");
  if(input) input.value = "";
  renderProductImagePreview();
}
function renderProductImagePreview(){
  const box = document.getElementById("productImagePreview");
  if(!box) return;
  const img = localStorage.getItem("ghostseller_product_image");
  const name = localStorage.getItem("ghostseller_product_image_name") || "Image produit";
  if(!img){
    box.classList.add("hidden");
    box.innerHTML = "";
    return;
  }
  box.classList.remove("hidden");
  box.innerHTML = `
    <img src="${img}" alt="Image produit">
    <div>
      <b>${name}</b>
      <span>Cette image sera utilisée comme contexte visuel pour préparer le contenu.</span>
    </div>
    <button class="removeImageBtn" onclick="removeProductImage()">Supprimer</button>
  `;
}
document.addEventListener("DOMContentLoaded", renderProductImagePreview);
setInterval(renderProductImagePreview, 1500);

function productVisualNote(){
  const img = localStorage.getItem("ghostseller_product_image");
  if(!img) return "";
  return `<div class="productVisualNote">📎 Image produit ajoutée : GhostSeller adapte le contenu au visuel fourni.</div>`;
}

/* V121 override content generator to include image context notice */
const gsContentEmployeeV120 = typeof gsContentEmployee === "function" ? gsContentEmployee : null;
function gsContentEmployee(prompt){
  if(gsContentEmployeeV120){
    const html = gsContentEmployeeV120(prompt);
    return html.replace('<div class="deliverableGrid">', productVisualNote() + '<div class="deliverableGrid">');
  }
  return `<div class="generatedResult">Contenu généré avec contexte produit.</div>`;
}

/* V122 compact product upload preview override */
function renderProductImagePreview(){
  const box=document.getElementById("productImagePreview");
  if(!box) return;
  const img=localStorage.getItem("ghostseller_product_image");
  const name=localStorage.getItem("ghostseller_product_image_name") || "Image produit";
  if(!img){ box.classList.add("hidden"); box.innerHTML=""; return; }
  box.classList.remove("hidden");
  box.innerHTML=`<img src="${img}" alt="Image produit"><div><b>${name}</b><span>Image ajoutée au brief.</span></div><button class="removeImageBtn" onclick="removeProductImage()">Retirer</button>`;
}


/* V123 put attachment button inside textarea */
function setupInlineAttachment(){
  const content = document.getElementById("content");
  if(!content || content.querySelector(".workspaceInputWrap")) return;
  const ta = content.querySelector("textarea");
  if(!ta) return;
  const wrapper = document.createElement("div");
  wrapper.className = "workspaceInputWrap";
  ta.parentNode.insertBefore(wrapper, ta);
  wrapper.appendChild(ta);
  const label = document.createElement("label");
  label.className = "inlineAttachBtn";
  label.title = "Ajouter une image";
  label.innerHTML = `📎<input type="file" id="productImageInput" accept="image/*" onchange="handleProductImage(event)">`;
  wrapper.appendChild(label);
}
document.addEventListener("DOMContentLoaded", setupInlineAttachment);
setInterval(setupInlineAttachment, 1000);


/* V125 MODE EMPLOYE IA — GhostSeller livre le travail fini */
function empEsc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}
function empClean(v){
  return String(v || "").trim().replace(/\s+/g," ");
}
function empShort(v){
  const s=empClean(v);
  return s.length>120?s.slice(0,120)+"...":s;
}
function empDetectBusiness(prompt){
  const p=empClean(prompt).toLowerCase();
  if(p.includes("kartayiti") || (p.includes("recharge") && (p.includes("digicel") || p.includes("natcom")))){
    return {
      name:"Kartayiti",
      product:"plateforme de recharge Digicel et Natcom",
      audience:"diaspora haïtienne",
      benefit:"envoyer du crédit à ses proches en Haïti rapidement",
      keyword:"RECHARGE"
    };
  }
  if(p.includes("basket") || p.includes("nike")){
    return {name:"votre boutique",product:"baskets tendance",audience:"jeunes actifs",benefit:"porter un style qui attire les regards",keyword:"BASKET"};
  }
  if(p.includes("parfum")){
    return {name:"votre marque",product:"parfum",audience:"clients qui aiment se démarquer",benefit:"laisser une impression mémorable",keyword:"PARFUM"};
  }
  if(p.includes("coiff")){
    return {name:"votre salon",product:"service de coiffure",audience:"personnes qui veulent changer de style",benefit:"obtenir une coiffure propre et professionnelle",keyword:"COIFFURE"};
  }
  return {name:"votre business",product:empShort(prompt)||"votre offre",audience:"clients potentiels",benefit:"obtenir une solution simple et utile",keyword:"INFO"};
}
function empHasImage(){
  try{return !!localStorage.getItem("ghostseller_product_image")}catch(e){return false}
}
function empImageNote(){
  return empHasImage() ? `<div class="employeeImageNote">📎 Image ajoutée : GhostSeller adapte le message au visuel du produit.</div>` : "";
}
function empCopy(text){
  navigator.clipboard?.writeText(text).then(()=>alert("Copié !")).catch(()=>alert("Copie impossible."));
}
function empSave(type,title,text){
  try{
    const list=JSON.parse(localStorage.getItem("ghostseller_history")||"[]");
    list.unshift({type,title,text,created_at:new Date().toISOString()});
    localStorage.setItem("ghostseller_history", JSON.stringify(list.slice(0,80)));
  }catch(e){}
}
function empShell(title, body, copyText){
  return `<div class="employeeResult v125Result">
    <div class="employeeHeader">
      <div><span class="employeeBadge">✅ Travail terminé</span><h2>${title}</h2></div>
      <button class="copyBtn" onclick='empCopy(${JSON.stringify(copyText)})'>Copier tout</button>
    </div>
    ${empImageNote()}
    ${body}
  </div>`;
}
function empContent(prompt){
  const b=empDetectBusiness(prompt);
  const facebook=`🇭🇹 ${b.name} est lancé !

Vous voulez ${b.benefit} ?

Avec ${b.name}, vous pouvez utiliser une ${b.product} simple, rapide et pensée pour ${b.audience}.

✅ Service simple à utiliser
✅ Pensé pour Haïti
✅ Digicel & Natcom
✅ Accessible depuis votre téléphone
✅ Idéal pour aider vos proches rapidement

🎁 Offre de lancement disponible maintenant.

👉 Essayez ${b.name} aujourd’hui.
📩 Écrivez “${b.keyword}” pour recevoir les détails.`;

  const instagram=`✨ Nouveau pour ${b.audience}

${b.name} simplifie la vie de ceux qui veulent ${b.benefit}.

Pourquoi tester maintenant ?
✅ Simple
✅ Rapide
✅ Pratique
✅ Pensé pour les besoins réels

📲 Disponible maintenant.
Écris “${b.keyword}” en message pour recevoir les infos.

#haiti #diaspora #digicel #natcom #recharge #business #service #entrepreneur`;

  const tiktok=`🎬 SCRIPT TIKTOK PRÊT À TOURNER

SCÈNE 1 — HOOK
Texte écran : “Tu veux aider tes proches en Haïti plus facilement ?”
Voix off : “Regarde cette solution.”

SCÈNE 2 — PROBLÈME
Texte écran : “Recharger Digicel ou Natcom peut être compliqué.”
Voix off : “Quand on vit à l’étranger, on veut que ce soit simple et rapide.”

SCÈNE 3 — SOLUTION
Texte écran : “${b.name}”
Voix off : “Une plateforme pensée pour envoyer de la recharge vers Haïti.”

SCÈNE 4 — BÉNÉFICES
Texte écran : “Digicel • Natcom • Simple • Rapide”
Voix off : “Tu choisis, tu paies, et la recharge part.”

SCÈNE 5 — CTA
Texte écran : “Écris ${b.keyword}”
Voix off : “Écris ${b.keyword} pour recevoir le lien et tester.”`;

  const whatsapp=`🇭🇹 Bonjour 👋

Bonne nouvelle : ${b.name} est disponible.

Vous pouvez maintenant ${b.benefit} grâce à une ${b.product} pensée pour ${b.audience}.

✅ Digicel
✅ Natcom
✅ Simple à utiliser
✅ Pratique pour aider vos proches

🎁 Offre de lancement disponible.

Répondez “${b.keyword}” et je vous envoie les détails.`;

  const all=`FACEBOOK\n\n${facebook}\n\n---\nINSTAGRAM\n\n${instagram}\n\n---\nTIKTOK\n\n${tiktok}\n\n---\nWHATSAPP\n\n${whatsapp}`;
  empSave("content","Pack contenu prêt à publier",all);

  return empShell("Pack marketing prêt à publier", `
    <div class="deliverableGrid">
      <div class="deliverableCard"><h3>Facebook</h3><div class="deliverableText">${empEsc(facebook)}</div><button onclick='empCopy(${JSON.stringify(facebook)})'>Copier Facebook</button></div>
      <div class="deliverableCard"><h3>Instagram</h3><div class="deliverableText">${empEsc(instagram)}</div><button onclick='empCopy(${JSON.stringify(instagram)})'>Copier Instagram</button></div>
      <div class="deliverableCard"><h3>TikTok</h3><div class="deliverableText">${empEsc(tiktok)}</div><button onclick='empCopy(${JSON.stringify(tiktok)})'>Copier TikTok</button></div>
      <div class="deliverableCard"><h3>WhatsApp</h3><div class="deliverableText">${empEsc(whatsapp)}</div><button onclick='empCopy(${JSON.stringify(whatsapp)})'>Copier WhatsApp</button></div>
    </div>`, all);
}
function empVideo(prompt){
  const b=empDetectBusiness(prompt);
  const script=`🎬 SCRIPT VIDÉO COMPLET — PRÊT À TOURNER

FORMAT : TikTok / Reels / Shorts
DURÉE : 20 à 25 secondes
OBJECTIF : obtenir des messages “${b.keyword}”

SCÈNE 1 — HOOK
Plan : visage ou téléphone en main.
Texte écran : “Tu veux aider tes proches en Haïti sans complication ?”
Voix off : “Voici une solution simple.”

SCÈNE 2 — PROBLÈME
Plan : écran téléphone / recherche de recharge.
Texte écran : “Digicel ? Natcom ? Pas toujours simple.”
Voix off : “Quand on vit à l’étranger, envoyer de la recharge doit être rapide.”

SCÈNE 3 — SOLUTION
Plan : montrer le logo ou l’image produit.
Texte écran : “${b.name}”
Voix off : “${b.name} te permet de ${b.benefit}.”

SCÈNE 4 — BÉNÉFICES
Plan : succession rapide de mots à l’écran.
Texte écran : “Simple • Rapide • Digicel • Natcom”
Voix off : “Tu choisis l’opérateur, tu valides, et c’est parti.”

SCÈNE 5 — APPEL À L’ACTION
Plan : écran final avec lien / WhatsApp.
Texte écran : “Écris ${b.keyword}”
Voix off : “Écris ${b.keyword} maintenant et reçois les détails.”

DESCRIPTION À PUBLIER :
${b.name} facilite la recharge Digicel et Natcom pour Haïti. Écris ${b.keyword} pour recevoir les infos.

HASHTAGS :
#haiti #digicel #natcom #diaspora #recharge #tiktokhaiti #business`;

  empSave("video","Script vidéo prêt à tourner",script);
  return empShell("Script vidéo prêt à tourner", `<div class="scriptBlock employeeScript">${empEsc(script)}</div>`, script);
}
function empLeads(prompt){
  const b=empDetectBusiness(prompt);
  const pack=`👥 PLAN DE PROSPECTION PRÊT À EXÉCUTER

OBJECTIF :
Trouver des personnes intéressées par ${b.product}.

CIBLES PRIORITAIRES :
1. Diaspora haïtienne en France
2. Diaspora haïtienne au Canada
3. Diaspora haïtienne aux États-Unis
4. Groupes Facebook “Haïtiens en France”
5. Personnes qui envoient régulièrement de l’aide à leurs proches en Haïti

OÙ PROSPECTER :
- Groupes Facebook : Haïtiens en France, Haïtiens à Paris, Haïtiens au Canada
- Commentaires TikTok sur vidéos Haïti / diaspora
- Pages Instagram communautaires haïtiennes
- WhatsApp groups diaspora
- Associations haïtiennes locales

MOTS-CLÉS À CHERCHER :
Haïti, diaspora haïtienne, Digicel, Natcom, recharge Haïti, envoyer crédit Haïti, famille Haïti

MESSAGE D’APPROCHE :
Bonjour 👋
J’ai vu que vous êtes lié(e) à la communauté haïtienne.
Je teste actuellement ${b.name}, une solution pour ${b.benefit}.
Si vous voulez, je peux vous envoyer le lien pour découvrir le service.

RELANCE J+1 :
Bonjour, je me permets de vous relancer.
Le service peut être utile si vous avez des proches en Haïti chez Digicel ou Natcom.
Je vous envoie les infos ?

RELANCE J+3 :
Dernière relance de ma part.
Si vous voulez tester ${b.name}, répondez “${b.keyword}” et je vous envoie le lien.`;

  empSave("leads","Plan de prospection prêt",pack);
  return empShell("Plan de prospection prêt à exécuter", `<div class="scriptBlock employeeScript">${empEsc(pack)}</div>`, pack);
}
function empWhatsApp(prompt){
  const b=empDetectBusiness(prompt);
  const seq=`💬 CAMPAGNE WHATSAPP PRÊTE À ENVOYER

MESSAGE 1 — PUB DE LANCEMENT
🇭🇹 Bonjour 👋
${b.name} est lancé !

Vous pouvez maintenant ${b.benefit} avec une ${b.product} simple et pratique.

✅ Digicel
✅ Natcom
✅ Service rapide
✅ Pensé pour ${b.audience}

Répondez “${b.keyword}” et je vous envoie les détails.

MESSAGE 2 — RELANCE 24H
Bonjour 👋
Je reviens vers vous concernant ${b.name}.
Si vous avez des proches en Haïti, ce service peut vraiment vous simplifier la vie.
Je vous envoie le lien ?

MESSAGE 3 — PREUVE / CONFIANCE
Le but de ${b.name} est simple :
permettre à la diaspora de soutenir ses proches en Haïti plus facilement avec Digicel et Natcom.

Répondez “${b.keyword}” pour recevoir les infos.

MESSAGE 4 — URGENCE DOUCE
L’offre de lancement est disponible maintenant.
Si vous voulez tester, c’est le bon moment.

MESSAGE 5 — CLOSING
Je vous envoie le lien maintenant ?
Répondez simplement “OUI” ou “${b.keyword}”.`;

  empSave("whatsapp","Campagne WhatsApp prête",seq);
  return empShell("Campagne WhatsApp prête à envoyer", `<div class="scriptBlock employeeScript">${empEsc(seq)}</div>`, seq);
}
function empSet(outId, html){
  const out=document.getElementById(outId);
  if(out) out.innerHTML=html;
}
function empPrompt(id){return (document.getElementById(id)?.value||"").trim();}
async function generateContent(){
  const prompt=empPrompt("contentPrompt");
  if(!prompt){empSet("contentOut","<div class='employeeResult'>Donne un ordre à GhostSeller avant de lancer.</div>");return;}
  empSet("contentOut","<div class='employeeResult'>GhostSeller travaille sur les livrables...</div>");
  setTimeout(()=>empSet("contentOut", empContent(prompt)),450);
}
function generateVideo(){
  const prompt=empPrompt("videoPrompt");
  if(!prompt){empSet("videoOut","<div class='employeeResult'>Décris le produit ou l’offre à transformer en vidéo.</div>");return;}
  empSet("videoOut","<div class='employeeResult'>GhostSeller prépare le script vidéo prêt à tourner...</div>");
  setTimeout(()=>empSet("videoOut", empVideo(prompt)),450);
}
function generateLeads(){
  const prompt=empPrompt("leadsPrompt");
  if(!prompt){empSet("leadsOut","<div class='employeeResult'>Décris les clients que tu veux cibler.</div>");return;}
  empSet("leadsOut","<div class='employeeResult'>GhostSeller prépare le plan de prospection...</div>");
  setTimeout(()=>empSet("leadsOut", empLeads(prompt)),450);
}
function generateWhatsApp(){
  const prompt=empPrompt("whatsappPrompt");
  if(!prompt){empSet("whatsappOut","<div class='employeeResult'>Décris l’offre à vendre sur WhatsApp.</div>");return;}
  empSet("whatsappOut","<div class='employeeResult'>GhostSeller rédige la campagne WhatsApp...</div>");
  setTimeout(()=>empSet("whatsappOut", empWhatsApp(prompt)),450);
}
function placeResult(btn, html){ /* V125 disables old preview injector */ }


/* V126 PROMPT INTELLIGENCE FIX */
function v126esc(s){return String(s??"").replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function v126clean(s){return String(s||"").trim().replace(/\s+/g," ")}
function v126copy(t){navigator.clipboard?.writeText(t).then(()=>alert("Copié !")).catch(()=>alert("Copie impossible."))}
function v126biz(prompt){
  const p=v126clean(prompt), l=p.toLowerCase();
  const days=["lundi","mardi","mercredi","jeudi","vendredi","samedi","dimanche"];
  const day=days.find(d=>l.includes(d))||"jour prévu";
  const route=p.match(/(?:de|depuis)?\s*([A-Za-zÀ-ÿ\-\s]+?)\s+(?:vers|à|a|pour)\s+([A-Za-zÀ-ÿ\-\s]+?)(?:\s+(?:le|la|ce|lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche|$))/i);
  if(l.includes("covoiturage")||l.includes("covoit")||l.includes("trajet")||l.includes("transport")){
    return {cat:"transport",name:"Covoiturage",from:route?route[1].trim():"Saint-Laurent",to:route?route[2].trim():"Cayenne",day,kw:"PLACE"};
  }
  if(l.includes("kartayiti")||l.includes("digicel")||l.includes("natcom")||(l.includes("recharge")&&(l.includes("haiti")||l.includes("haïti")))){
    return {cat:"recharge",name:l.includes("kartayiti")?"Kartayiti":"plateforme de recharge",kw:"RECHARGE"};
  }
  if(l.includes("basket")||l.includes("nike")||l.includes("chaussure")) return {cat:"basket",name:"baskets",kw:"BASKET"};
  if(l.includes("parfum")) return {cat:"parfum",name:"parfum",kw:"PARFUM"};
  if(l.includes("coiff")) return {cat:"coiffure",name:"service coiffure",kw:"COIFFURE"};
  return {cat:"general",name:p||"votre offre",kw:"INFO"};
}
function v126pack(prompt){
  const b=v126biz(prompt);
  if(b.cat==="transport"){
    const fb=`🚗 Covoiturage ${b.from} → ${b.to}\n\nDépart : ${b.day}\n\nPlaces disponibles pour un trajet simple, confortable et organisé.\n\n✅ Départ : ${b.from}\n✅ Arrivée : ${b.to}\n✅ Jour : ${b.day}\n✅ Places limitées\n\n📩 Écris “${b.kw}” pour réserver.`;
    const ig=`🚘 Direction ${b.to} ${b.day}\n\nCovoiturage disponible :\n📍 ${b.from} → ${b.to}\n📅 ${b.day}\n\nPlaces limitées.\nDM “${b.kw}” pour réserver.\n\n#covoiturage #guyane #transport #saintlaurent #cayenne`;
    const tk=`🎬 SCRIPT TIKTOK\n\nSCÈNE 1 — HOOK\nTexte écran : “Tu vas à ${b.to} ${b.day} ?”\n\nSCÈNE 2 — TRAJET\nTexte écran : “${b.from} → ${b.to}”\n\nSCÈNE 3 — CONFIANCE\nTexte écran : “Places limitées • trajet organisé”\n\nSCÈNE 4 — CTA\nTexte écran : “Écris ${b.kw} pour réserver.”`;
    const wa=`🚗 Bonjour 👋\n\nJe propose un covoiturage ${b.from} → ${b.to} ${b.day}.\n\nIl reste des places disponibles.\n\n✅ Départ : ${b.from}\n✅ Arrivée : ${b.to}\n✅ Jour : ${b.day}\n\nRéponds “${b.kw}” pour réserver.`;
    return {fb,ig,tk,wa,b};
  }
  if(b.cat==="recharge"){
    const fb=`🇭🇹 ${b.name} est disponible !\n\nEnvoyez une recharge Digicel ou Natcom à vos proches en Haïti plus simplement.\n\n✅ Digicel\n✅ Natcom\n✅ Pratique\n✅ Pensé pour la diaspora\n\n📩 Écrivez “${b.kw}” pour recevoir les détails.`;
    const ig=`🇭🇹 Recharge Haïti simplifiée\n\nDigicel & Natcom disponibles.\nSimple, rapide et pratique pour aider vos proches.\n\nDM “${b.kw}” pour les infos.\n\n#haiti #digicel #natcom #diaspora #recharge`;
    const tk=`🎬 SCRIPT TIKTOK\n\nSCÈNE 1 — “Tu veux envoyer du crédit en Haïti ?”\nSCÈNE 2 — “Digicel ou Natcom ?”\nSCÈNE 3 — “Une solution simple pour la diaspora.”\nSCÈNE 4 — “Écris ${b.kw} pour recevoir le lien.”`;
    const wa=`🇭🇹 Bonjour 👋\n\nVous pouvez envoyer une recharge Digicel ou Natcom à vos proches en Haïti.\n\n✅ Simple\n✅ Pratique\n✅ Digicel & Natcom\n\nRépondez “${b.kw}” pour recevoir les détails.`;
    return {fb,ig,tk,wa,b};
  }
  const title=b.name;
  const fb=`🔥 Offre disponible\n\n${title}\n\nUne proposition claire pour attirer l’attention et donner envie d’agir.\n\n✅ Simple\n✅ Direct\n✅ Disponible maintenant\n\n📩 Écrivez “${b.kw}” pour recevoir les détails.`;
  const ig=`✨ ${title}\n\nUne offre simple, claire et prête à découvrir.\n\nDM “${b.kw}” pour recevoir les infos.\n\n#business #vente #offre #marketing`;
  const tk=`🎬 SCRIPT TIKTOK\n\nSCÈNE 1 — “Tu cherches une solution simple ?”\nSCÈNE 2 — Présenter : ${title}\nSCÈNE 3 — Montrer le bénéfice.\nSCÈNE 4 — CTA : “Écris ${b.kw}.”`;
  const wa=`Bonjour 👋\n\nJe vous partage cette offre : ${title}\n\n✅ Simple\n✅ Clair\n✅ Disponible maintenant\n\nRépondez “${b.kw}” pour recevoir les détails.`;
  return {fb,ig,tk,wa,b};
}
function v126shell(title,body,all){return `<div class="employeeResult v125Result"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail terminé</span><h2>${title}</h2></div><button class="copyBtn" onclick='v126copy(${JSON.stringify(all)})'>Copier tout</button></div>${body}</div>`}
function v126content(prompt){
  const p=v126pack(prompt);
  const all=`FACEBOOK\n\n${p.fb}\n\n---\nINSTAGRAM\n\n${p.ig}\n\n---\nTIKTOK\n\n${p.tk}\n\n---\nWHATSAPP\n\n${p.wa}`;
  return v126shell("Pack marketing prêt à publier",`<div class="deliverableGrid"><div class="deliverableCard"><h3>Facebook</h3><div class="deliverableText">${v126esc(p.fb)}</div><button onclick='v126copy(${JSON.stringify(p.fb)})'>Copier Facebook</button></div><div class="deliverableCard"><h3>Instagram</h3><div class="deliverableText">${v126esc(p.ig)}</div><button onclick='v126copy(${JSON.stringify(p.ig)})'>Copier Instagram</button></div><div class="deliverableCard"><h3>TikTok</h3><div class="deliverableText">${v126esc(p.tk)}</div><button onclick='v126copy(${JSON.stringify(p.tk)})'>Copier TikTok</button></div><div class="deliverableCard"><h3>WhatsApp</h3><div class="deliverableText">${v126esc(p.wa)}</div><button onclick='v126copy(${JSON.stringify(p.wa)})'>Copier WhatsApp</button></div></div>`,all);
}
async function generateContent(){const prompt=document.getElementById("contentPrompt")?.value||"";document.getElementById("contentOut").innerHTML="<div class='employeeResult'>GhostSeller analyse ta demande...</div>";setTimeout(()=>document.getElementById("contentOut").innerHTML=v126content(prompt),350)}
function generateVideo(){const prompt=document.getElementById("videoPrompt")?.value||"";const p=v126pack(prompt);document.getElementById("videoOut").innerHTML=v126shell("Script vidéo prêt à tourner",`<div class="scriptBlock employeeScript">${v126esc(p.tk)}</div>`,p.tk)}
function generateWhatsApp(){const prompt=document.getElementById("whatsappPrompt")?.value||"";const p=v126pack(prompt);let seq=p.wa+`\n\nRELANCE 1 :\nBonjour, je reviens vers vous. Voulez-vous recevoir les détails ?\n\nRELANCE 2 :\nDernière relance. Répondez “${p.b.kw}” si vous voulez les infos.`;document.getElementById("whatsappOut").innerHTML=v126shell("Campagne WhatsApp prête à envoyer",`<div class="scriptBlock employeeScript">${v126esc(seq)}</div>`,seq)}
function generateLeads(){const prompt=document.getElementById("leadsPrompt")?.value||"";const p=v126pack(prompt);let plan=`👥 PLAN DE PROSPECTION PRÊT\n\nCIBLE : ${p.b.cat==="transport"?"personnes qui voyagent sur ce trajet":"clients intéressés par l’offre"}\n\nOÙ PUBLIER :\n- Groupes Facebook\n- Statut WhatsApp\n- Instagram stories\n- Commentaires TikTok\n\nMESSAGE :\n${p.wa}`;document.getElementById("leadsOut").innerHTML=v126shell("Plan de prospection prêt",`<div class="scriptBlock employeeScript">${v126esc(plan)}</div>`,plan)}
function placeResult(btn, html){}

/* V128 MARKETING VARIANTS ENGINE — regeneration automatique */
(function(){
  const angles = {
    ideas: { label:"🔄 Générer d'autres idées", title:"5 nouvelles variantes marketing", badge:"Variantes générées" },
    viral: { label:"🔥 Version virale", title:"Version virale TikTok", badge:"Angle viral" },
    emotion: { label:"❤️ Version émotionnelle", title:"Version émotionnelle", badge:"Angle émotion" },
    premium: { label:"💎 Version premium", title:"Version premium", badge:"Angle premium" },
    aggressive: { label:"⚡ Version agressive", title:"Version directe / agressive", badge:"Angle agressif" },
    hooks: { label:"🎣 20 Hooks", title:"20 hooks prêts à tester", badge:"Hooks" },
    cta: { label:"📢 10 CTA", title:"10 appels à l'action", badge:"CTA" },
    hashtags: { label:"#️⃣ 30 Hashtags", title:"30 hashtags prêts", badge:"Hashtags" }
  };

  function safeText(v){ return String(v || "").trim(); }
  function offerName(prompt){
    const p = safeText(prompt);
    if(!p) return "votre offre";
    return p.length > 110 ? p.slice(0,110) + "..." : p;
  }
  function audienceFromPrompt(prompt){
    const p = safeText(prompt).toLowerCase();
    const age = safeText(prompt).match(/\d{2}\s*(?:à|a|-|–)\s*\d{2}\s*ans/i);
    if(age) return age[0];
    if(p.includes("jeune")) return "jeunes clients";
    if(p.includes("diaspora")) return "diaspora";
    if(p.includes("business") || p.includes("entrepreneur")) return "entrepreneurs";
    return "clients potentiels";
  }
  function productType(prompt){
    const p=safeText(prompt).toLowerCase();
    if(p.includes("nike") || p.includes("basket") || p.includes("chaussure")) return "baskets";
    if(p.includes("recharge") || p.includes("digicel") || p.includes("natcom")) return "recharge Haïti";
    if(p.includes("coiff")) return "coiffure";
    if(p.includes("parfum")) return "parfum";
    if(p.includes("restaurant")) return "restaurant";
    return "offre";
  }
  function block(title, text){
    return `<div class="deliverableCard"><h3>${gsEscapeHtml(title)}</h3><div class="deliverableText">${gsEscapeHtml(text)}</div><button onclick='gsCopy(${JSON.stringify(text)})'>Copier</button></div>`;
  }
  function variantActions(prompt){
    const encoded = JSON.stringify(prompt);
    return `<div class="v128Actions">
      <button onclick='v128GenerateVariant("ideas", ${encoded})'>🔄 Générer d'autres idées</button>
      <button onclick='v128GenerateVariant("viral", ${encoded})'>🔥 Version virale</button>
      <button onclick='v128GenerateVariant("emotion", ${encoded})'>❤️ Version émotionnelle</button>
      <button onclick='v128GenerateVariant("premium", ${encoded})'>💎 Version premium</button>
      <button onclick='v128GenerateVariant("aggressive", ${encoded})'>⚡ Version agressive</button>
      <button onclick='v128GenerateVariant("hooks", ${encoded})'>🎣 20 Hooks</button>
      <button onclick='v128GenerateVariant("cta", ${encoded})'>📢 10 CTA</button>
      <button onclick='v128GenerateVariant("hashtags", ${encoded})'>#️⃣ 30 Hashtags</button>
    </div><div id="v128VariantOut" class="v128VariantOut"></div>`;
  }
  function withActions(html, prompt){
    return html.replace("</div>", `${variantActions(prompt)}</div>`);
  }
  function makeIdeas(prompt){
    const offer=offerName(prompt), aud=audienceFromPrompt(prompt), type=productType(prompt);
    return [
      `ANGLE 1 — Urgence\n${offer}\nMessage : “Les personnes qui attendent ratent souvent les meilleures opportunités.”\nCTA : Écris INFO maintenant.`,
      `ANGLE 2 — Storytelling\nAvant : le client hésite.\nAprès : il découvre ${type} et comprend pourquoi c’est fait pour ${aud}.\nCTA : Envoie “DETAILS”.`,
      `ANGLE 3 — Preuve sociale\n“Tout le monde cherche une solution simple, mais peu trouvent une offre claire comme celle-ci.”\nCTA : Demande les infos en privé.`,
      `ANGLE 4 — Lifestyle\nNe vends pas seulement ${type}. Vends le style, la confiance et l’envie que ça crée.\nCTA : DM “STYLE”.`,
      `ANGLE 5 — FOMO\n“Quand l’offre sera partout, il sera déjà trop tard.”\nCTA : Écris “GO” pour recevoir les détails.`
    ];
  }
  function makeViral(prompt){
    const offer=offerName(prompt), aud=audienceFromPrompt(prompt);
    return `🎬 SCRIPT TIKTOK VIRAL\n\nHOOK 0-2s\n“Attends… pourquoi personne ne parle de ça ?”\n\nSCÈNE 1\nMontre rapidement l’offre : ${offer}\nTexte écran : “Pensé pour ${aud}.”\n\nSCÈNE 2\n“Le problème, ce n’est pas le produit. C’est la façon de le présenter.”\n\nSCÈNE 3\nMontre le bénéfice principal en 1 phrase claire.\n\nSCÈNE 4\n“Si tu veux les détails, écris INFO maintenant.”\n\nCAPTION\nJ’ai trouvé une offre qui mérite plus d’attention. Qui veut les infos ?\n\nCTA\nCommente INFO ou envoie un DM.`;
  }
  function makeEmotion(prompt){
    const offer=offerName(prompt);
    return `❤️ VERSION ÉMOTIONNELLE\n\nParfois, ce n’est pas une grande chose qui change tout.\nC’est juste une bonne solution au bon moment.\n\n${offer}\n\nCette offre est faite pour les personnes qui veulent avancer simplement, sans perdre du temps à chercher partout.\n\nSi tu connais quelqu’un que ça peut aider, partage-lui ce message.\n\n📩 Écris INFO pour recevoir les détails.`;
  }
  function makePremium(prompt){
    const offer=offerName(prompt);
    return `💎 VERSION PREMIUM\n\nUne offre claire. Une présentation propre. Une expérience plus sérieuse.\n\n${offer}\n\nPensé pour ceux qui veulent quelque chose de fiable, simple et bien présenté.\n\n✅ Message professionnel\n✅ Offre facile à comprendre\n✅ Action rapide\n\n📩 Contactez-nous pour recevoir les détails.`;
  }
  function makeAggressive(prompt){
    const offer=offerName(prompt);
    return `⚡ VERSION DIRECTE\n\nArrête de passer à côté des bonnes offres.\n\n${offer}\n\nTu veux les détails ? Demande-les maintenant.\nTu hésites trop ? Quelqu’un d’autre va passer avant toi.\n\n📩 Écris INFO maintenant.`;
  }
  function makeHooks(prompt){
    const type=productType(prompt);
    return Array.from({length:20}).map((_,i)=>`${i+1}. ${[
      `Tu cherches ${type} ? Regarde ça.`,
      `Personne ne présente ${type} comme ça.`,
      `Stop, cette offre peut t’intéresser.`,
      `Avant d’acheter ailleurs, regarde ceci.`,
      `Le détail que beaucoup de clients oublient.`,
      `Cette offre est plus simple que tu penses.`,
      `POV : tu découvres une meilleure option.`,
      `Tu vas comprendre en 10 secondes.`,
      `Voici pourquoi ça attire l’attention.`,
      `Ne fais pas cette erreur avant de choisir.`,
      `Une offre claire vaut mieux qu’un long discours.`,
      `Ça, c’est le genre d’offre qui se partage.`,
      `Tu veux économiser du temps ? Commence ici.`,
      `Le bon choix commence par une bonne info.`,
      `Regarde jusqu’à la fin avant de décider.`,
      `Si tu hésites encore, lis ça.`,
      `Ce message est pour les personnes qui veulent du concret.`,
      `Simple, direct, efficace.`,
      `Pourquoi attendre si c’est disponible ?`,
      `Écris INFO et je t’envoie les détails.`
    ][i]}`).join("\n");
  }
  function makeCTA(){
    return ["Écris INFO pour recevoir les détails.","Envoie-moi un DM maintenant.","Commente GO si tu veux le lien.","Réserve ta place aujourd’hui.","Clique et demande les infos.","Partage à quelqu’un que ça peut aider.","Contacte-nous avant la fin de l’offre.","Dis-moi ‘oui’ et je t’envoie tout.","Passe à l’action maintenant.","Demande la version complète en privé."].map((x,i)=>`${i+1}. ${x}`).join("\n");
  }
  function makeHashtags(prompt){
    const p=safeText(prompt).toLowerCase();
    let base=["#business","#marketing","#vente","#offre","#clients","#tiktokfrance","#reelsfrance","#entrepreneur","#promotion","#shopping"];
    if(p.includes("haiti")||p.includes("haïti")||p.includes("digicel")||p.includes("natcom")) base.push("#haiti","#diaspora","#digicel","#natcom","#recharge");
    if(p.includes("nike")||p.includes("basket")||p.includes("chaussure")) base.push("#nike","#sneakers","#baskets","#style","#streetwear");
    if(p.includes("coiff")) base.push("#coiffure","#beauty","#hair","#salon","#look");
    while(base.length<30) base.push(`#idee${base.length+1}`);
    return base.slice(0,30).join(" ");
  }
  window.v128GenerateVariant = function(type, prompt){
    const out=document.getElementById("v128VariantOut");
    if(!out) return;
    const meta=angles[type] || angles.ideas;
    out.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ ${meta.badge}</span><h2>${meta.title}</h2></div></div><div class="deliverableGrid"></div></div>`;
    let text="";
    let body="";
    if(type==="ideas"){
      const ideas=makeIdeas(prompt); text=ideas.join("\n\n---\n\n"); body=ideas.map((x,i)=>block(`Variante ${i+1}`,x)).join("");
    }else if(type==="viral") { text=makeViral(prompt); body=block("TikTok viral", text); }
    else if(type==="emotion") { text=makeEmotion(prompt); body=block("Émotion", text); }
    else if(type==="premium") { text=makePremium(prompt); body=block("Premium", text); }
    else if(type==="aggressive") { text=makeAggressive(prompt); body=block("Direct", text); }
    else if(type==="hooks") { text=makeHooks(prompt); body=block("20 hooks", text); }
    else if(type==="cta") { text=makeCTA(prompt); body=block("10 CTA", text); }
    else if(type==="hashtags") { text=makeHashtags(prompt); body=block("30 hashtags", text); }
    out.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ ${meta.badge}</span><h2>${meta.title}</h2></div><button class="copyBtn" onclick='gsCopy(${JSON.stringify(text)})'>Copier tout</button></div><div class="deliverableGrid">${body}</div></div>`;
    gsSaveHistory("variant", meta.title, text);
  };

  const oldContent = typeof window.generateContent === "function" ? window.generateContent : null;
  window.generateContent = function(){
    const out=document.getElementById("contentOut");
    const prompt=(document.getElementById("contentPrompt")?.value||"").trim();
    if(!prompt){ out.innerHTML="<div class='generatedResult'>Décris ton offre avant de lancer GhostSeller.</div>"; return; }
    out.innerHTML="<div class='employeeResult'>GhostSeller prépare le pack + les boutons de régénération...</div>";
    setTimeout(()=>{
      let html="";
      try{ html = gsContentEmployee(prompt); }
      catch(e){ html = oldContent ? "" : `<div class='employeeResult'>Erreur génération : ${gsEscapeHtml(e.message)}</div>`; }
      if(!html){ html = `<div class='employeeResult'><div class='employeeHeader'><div><span class='employeeBadge'>✅ Travail terminé</span><h2>Pack marketing prêt</h2></div></div></div>`; }
      out.innerHTML = withActions(html, prompt);
    }, 400);
  };
})();

/* V129 — SOCIAL PACK REGENERATION + MOBILE COMPACT FIX */
(function(){
  function E(s){ return (typeof gsEscapeHtml === 'function' ? gsEscapeHtml(s) : String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))); }
  function C(text){ if(typeof gsCopy === 'function') return gsCopy(text); navigator.clipboard?.writeText(text || ''); }
  window.v129Copy = C;
  function prompt(){ return (document.getElementById('contentPrompt')?.value || '').trim(); }
  function shortOffer(p){ p=String(p||'').trim(); return p ? (p.length>140 ? p.slice(0,140)+'...' : p) : 'votre offre'; }
  function audience(p){
    const s=String(p||'').toLowerCase();
    if(s.includes('fille')) return 'les jeunes filles';
    if(s.includes('jeune')) return 'les jeunes';
    if(s.includes('diaspora')) return 'la diaspora';
    if(s.includes('maman') || s.includes('femme')) return 'les femmes actives';
    if(s.includes('business') || s.includes('entrepreneur')) return 'les entrepreneurs';
    return 'les clients intéressés';
  }
  function product(p){
    const s=String(p||'').toLowerCase();
    if(s.includes('sac')) return 'ce sac tendance';
    if(s.includes('nike')||s.includes('basket')||s.includes('chaussure')) return 'ces baskets';
    if(s.includes('recharge')||s.includes('digicel')||s.includes('natcom')) return 'la recharge Haïti';
    if(s.includes('coiff')) return 'cette offre coiffure';
    return 'cette offre';
  }
  function keyword(p){ return 'INFO'; }
  function makePack(kind, p){
    const offer=shortOffer(p), aud=audience(p), prod=product(p), kw=keyword(p);
    const styles={
      base:['🔥 Offre disponible','simple, utile et facile à comprendre','Découvre cette offre'],
      ideas:['💡 Nouvelle idée marketing','avec un angle différent','Voici une autre façon de présenter cette offre'],
      viral:['🔥 Angle viral','qui attire l’attention dès les 2 premières secondes','POV : tu trouves enfin une offre qui colle à ton style'],
      emotion:['❤️ Angle émotionnel','qui parle au besoin réel du client','Parfois, une petite chose change tout'],
      premium:['💎 Angle premium','plus propre, plus sérieux, plus désirable','Une offre présentée avec plus de valeur'],
      aggressive:['⚡ Angle direct','clair, rapide, sans tourner autour','Arrête de chercher partout'],
      promo:['🏷️ Angle promotion','qui donne envie d’agir maintenant','Disponible maintenant, mais pas à ignorer']
    };
    const st=styles[kind]||styles.base;
    const facebook=`${st[0]}\n\n${offer}\n\n${st[2]}.\n\nCette proposition est pensée pour ${aud}. Le but est simple : montrer ${prod} de façon claire, directe et attirante.\n\n✅ Facile à comprendre\n✅ Prêt à utiliser\n✅ Message qui donne envie d’en savoir plus\n\n📩 Écris “${kw}” en commentaire ou en message privé pour recevoir les détails.`;
    const instagram=`✨ ${prod.charAt(0).toUpperCase()+prod.slice(1)} pour ${aud}\n\n${offer}\n\n${st[1]}.\n\nLe bon style, le bon message, la bonne envie.\n\n📩 DM “${kw}” pour recevoir les détails.\n\n#tendance #style #shopping #marketing #vente #offre #instagramfrance #reelsfrance`;
    const tiktok=`🎬 SCRIPT TIKTOK / REELS\n\nSCÈNE 1 — HOOK (0-2s)\nTexte écran : “${kind==='viral'?'POV : tu découvres le sac que tout le monde va demander':'Tu cherchais quelque chose de tendance ?'}”\n\nSCÈNE 2 — PRODUIT (2-6s)\nMontre ${prod} en gros plan.\nTexte écran : “Pensé pour ${aud}.”\n\nSCÈNE 3 — DÉSIR (6-12s)\nMontre le produit porté / utilisé / mis en valeur.\nVoix off : “Simple, beau, pratique et facile à aimer.”\n\nSCÈNE 4 — PREUVE (12-17s)\nMontre 2 ou 3 détails qui donnent envie.\nTexte écran : “Tendance maintenant.”\n\nSCÈNE 5 — CTA (17-22s)\nTexte écran : “Écris ${kw} pour les infos.”\n\nCAPTION : ${offer}\nCTA : Commente ${kw} ou envoie un DM.`;
    const whatsapp=`Bonjour 👋\n\nJe te partage une offre qui peut t’intéresser :\n\n${offer}\n\nC’est pensé pour ${aud}, avec un message simple et clair.\n\n✅ Tendance\n✅ Facile à comprendre\n✅ Disponible maintenant\n\nRéponds “${kw}” et je t’envoie les détails.`;
    const story=`📱 STORY / STATUT\n\n${prod.toUpperCase()}\n${offer}\n\nTu veux les détails ?\nRéponds “${kw}” maintenant.`;
    const hashtags=['#tendance','#shopping','#sac','#style','#mode','#jeunesfilles','#offre','#vente','#marketing','#tiktokfrance','#reels','#instagramfrance','#business','#clients','#promotion'];
    return {facebook, instagram, tiktok, whatsapp, story, hashtags:hashtags.join(' ')};
  }
  function allText(pack){
    return `FACEBOOK\n\n${pack.facebook}\n\n---\nINSTAGRAM\n\n${pack.instagram}\n\n---\nTIKTOK / REELS\n\n${pack.tiktok}\n\n---\nWHATSAPP\n\n${pack.whatsapp}\n\n---\nSTORY / STATUT\n\n${pack.story}\n\n---\nHASHTAGS\n\n${pack.hashtags}`;
  }
  function safeArg(v){ return encodeURIComponent(String(v||'')); }
  function readArg(v){ try{return decodeURIComponent(String(v||''));}catch(e){return String(v||'');} }
  function card(title,text){ const arg=safeArg(text); return `<div class="deliverableCard v129SocialCard"><h3>${E(title)}</h3><div class="deliverableText">${E(text)}</div><button type="button" onclick="v129Copy(decodeURIComponent('${arg}'))">Copier</button></div>`; }
  function actionButtons(p){ const q=safeArg(p); return `<div class="v129Actions"><button type="button" onclick="v129Regen('ideas','${q}')">🔄 Générer d'autres idées</button><button type="button" onclick="v129Regen('viral','${q}')">🔥 Version virale</button><button type="button" onclick="v129Regen('emotion','${q}')">❤️ Émotionnelle</button><button type="button" onclick="v129Regen('premium','${q}')">💎 Premium</button><button type="button" onclick="v129Regen('aggressive','${q}')">⚡ Agressive</button><button type="button" onclick="v129Regen('promo','${q}')">🏷️ Promotion</button><button type="button" onclick="v129Hooks('${q}')">🎣 20 Hooks</button><button type="button" onclick="v129CTA('${q}')">📢 10 CTA</button><button type="button" onclick="v129Hashtags('${q}')">#️⃣ 30 Hashtags</button><button type="button" onclick="v132Background('${q}')">🖼️ Fond IA</button></div>`; }
  function backgroundPrompt(p){
    const s=String(p||'').toLowerCase(); let theme='premium product marketing';
    if(s.includes('café')||s.includes('cafe')||s.includes('coffee')) theme='premium roasted coffee beans, steaming coffee cup, subtle tropical plantation mood';
    else if(s.includes('haiti')||s.includes('haïti')||s.includes('haitien')) theme='subtle Haitian atmosphere, distant tropical beach, mountain silhouette, discreet Haiti flag colors as soft accents';
    else if(s.includes('nike')||s.includes('adidas')||s.includes('basket')||s.includes('chaussure')) theme='dark urban sneaker campaign, wet asphalt, neon city reflections, dynamic sport energy';
    else if(s.includes('montre')||s.includes('luxe')||s.includes('bijou')) theme='luxury black marble, elegant watch display, gold reflections, mysterious premium shadows';
    else if(s.includes('parfum')||s.includes('cosm')||s.includes('beaut')) theme='abstract luxury perfume and cosmetic background, smooth dark glass, soft mist, elegant reflections';
    else if(s.includes('sac')) theme='fashion handbag campaign, dark studio background, soft spotlight, premium retail atmosphere';
    return `Photorealistic 8K cinematic dark background for a marketing ad, ${theme}, deep black gradient overlay, high contrast, soft cinematic lighting, clean negative space in the center for readable advertising text, no text, no watermark, vertical composition, social media ad background, --ar 9:16`;
  }
  function renderBackgroundPanel(p){ const bp=backgroundPrompt(p); const arg=safeArg(bp); return `<div class="employeeResult v132BgPanel"><div class="employeeHeader"><div><span class="employeeBadge">🖼️ Prompt prêt</span><h2>Fond IA recommandé</h2><p class="muted">Copie ce prompt dans DALL‑E/Midjourney pour créer un fond sombre adapté à ton produit.</p></div><button class="copyBtn" type="button" onclick="v129Copy(decodeURIComponent('${arg}'))">Copier le prompt</button></div><div class="scriptBlock employeeScript">${E(bp)}</div></div>`; }
  function render(kind,p,title){
    p=readArg(p); const pack=makePack(kind,p); const all=allText(pack); const allArg=safeArg(all);
    return `<div class="employeeResult v129Result"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail terminé</span><h2>${E(title||'Pack réseaux sociaux prêt')}</h2><p class="muted">Facebook, Instagram, TikTok/Reels, WhatsApp, Story et hashtags.</p></div><button class="copyBtn" type="button" onclick="v129Copy(decodeURIComponent('${allArg}'))">Copier tout</button></div>${actionButtons(p)}<div class="deliverableGrid v129Grid">${card('Facebook',pack.facebook)}${card('Instagram',pack.instagram)}${card('TikTok / Reels',pack.tiktok)}${card('WhatsApp',pack.whatsapp)}${card('Story / Statut',pack.story)}${card('Hashtags',pack.hashtags)}</div><div id="v129ExtraOut"></div>${renderBackgroundPanel(p)}</div>`;
  }
  window.v129Regen=function(kind,p){ p=readArg(p); const out=document.getElementById('contentOut'); if(out) out.innerHTML=render(kind,p, kind==='ideas'?'Nouveau pack avec autre angle':'Pack '+kind+' pour tous les réseaux'); };
  window.v132Background=function(p){ p=readArg(p); const extra=document.getElementById('v129ExtraOut')||document.getElementById('contentOut'); if(extra) extra.innerHTML=renderBackgroundPanel(p); };
  window.v129Hooks=function(p){ p=readArg(p);
    const prod=product(p); const arr=[`Stop, ce ${prod} va te plaire.`,`POV : tu trouves enfin un accessoire tendance.`,`Les jeunes filles vont adorer ça.`,`Tu cherchais un sac simple mais stylé ?`,`Regarde ce détail avant de choisir ton sac.`,`Une offre qui mérite plus d’attention.`,`Ce n’est pas juste un sac, c’est le détail qui change le look.`,`Tu veux un style plus propre ? Commence ici.`,`Avant d’acheter ailleurs, regarde ça.`,`Ce sac peut compléter ton look en 2 secondes.`,`Le genre d’accessoire qu’on remarque vite.`,`Simple, tendance, efficace.`,`Tu vas comprendre pourquoi il attire l’œil.`,`Une idée cadeau qui marche toujours.`,`Le style commence souvent par les détails.`,`Si tu aimes les sacs tendance, regarde ça.`,`Ce modèle peut vite partir.`,`Tu veux les infos ? Écris INFO.`,`Le sac à main qui donne envie de sortir.`,`Garde cette idée pour ton prochain look.`];
    const text=arr.map((x,i)=>`${i+1}. ${x}`).join('\n'); const extra=document.getElementById('v129ExtraOut')||document.getElementById('contentOut'); extra.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ Hooks prêts</span><h2>20 hooks à tester</h2></div><button class="copyBtn" onclick='v129Copy(${JSON.stringify(text)})'>Copier tout</button></div><div class="scriptBlock employeeScript">${E(text)}</div></div>`;
  };
  window.v129CTA=function(p){ p=readArg(p); const arr=['Écris INFO pour recevoir les détails.','Envoie-moi un DM maintenant.','Commente SAC si tu veux les infos.','Réserve avant que ça parte.','Clique et demande la disponibilité.','Partage à une amie qui aime ce style.','Demande le prix en privé.','Réponds OUI et je t’envoie tout.','Passe commande maintenant.','Garde cette offre avant de l’oublier.']; const text=arr.map((x,i)=>`${i+1}. ${x}`).join('\n'); const extra=document.getElementById('v129ExtraOut')||document.getElementById('contentOut'); extra.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ CTA prêts</span><h2>10 CTA</h2></div><button class="copyBtn" onclick='v129Copy(${JSON.stringify(text)})'>Copier tout</button></div><div class="scriptBlock employeeScript">${E(text)}</div></div>`; };
  window.v129Hashtags=function(p){ p=readArg(p); const text=['#sac','#sacmain','#sactendance','#modefemme','#jeunesfilles','#stylefemme','#lookdujour','#shopping','#accessoire','#fashion','#outfit','#tendance','#boutique','#vente','#promotion','#instashop','#tiktokshop','#reelsfrance','#tiktokfrance','#ideecadeau','#sacfashion','#mode2026','#business','#clients','#offre','#nouveaute','#style','#fille','#beauty','#viral'].join(' '); const extra=document.getElementById('v129ExtraOut')||document.getElementById('contentOut'); extra.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ Hashtags prêts</span><h2>30 hashtags</h2></div><button class="copyBtn" onclick='v129Copy(${JSON.stringify(text)})'>Copier tout</button></div><div class="scriptBlock employeeScript">${E(text)}</div></div>`; };
  window.generateContent=function(){ const out=document.getElementById('contentOut'); const p=prompt(); if(!out) return; if(!p){ out.innerHTML='<div class="employeeResult">Décris ton offre avant de générer.</div>'; return; } out.innerHTML='<div class="employeeResult">GhostSeller prépare le pack complet réseaux sociaux...</div>'; setTimeout(()=>{ out.innerHTML=render('base',p,'Pack réseaux sociaux prêt'); try{ if(typeof gsSaveHistory==='function') gsSaveHistory('content','Pack réseaux sociaux prêt',allText(makePack('base',p))); }catch(e){} },250); };
})();

/* V133 REAL EXECUTION FIX — active buttons call backend, real background image, clean logout */
(function(){
  function V133_E(s){
    return String(s ?? '').replace(/[&<>"']/g, function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m];});
  }
  function V133_offer(){
    return (document.getElementById('contentPrompt')?.value || document.getElementById('contentNiche')?.value || '').trim();
  }
  function V133_arg(v){ return encodeURIComponent(String(v || '')); }
  function V133_decode(v){ try{return decodeURIComponent(String(v || ''));}catch(e){return String(v || '');} }
  function V133_copy(text){
    if(navigator.clipboard) navigator.clipboard.writeText(String(text||''));
  }
  window.v129Copy = window.gsCopy = window.v133Copy = V133_copy;
  function V134_text(value){
    if(value == null) return '';
    if(Array.isArray(value)) return value.map(V134_text).filter(Boolean).join('\n');
    if(typeof value === 'object'){
      if(value.content) return V134_text(value.content);
      if(value.text) return V134_text(value.text);
      if(value.body) return V134_text(value.body);
      if(value.caption) return V134_text(value.caption);
      if(value.message) return V134_text(value.message);
      if(value.script) return V134_text(value.script);
      if(value.items) return V134_text(value.items);
      return Object.entries(value).map(([k,v])=>{
        const txt=V134_text(v);
        return txt ? `${k.toUpperCase()}\n${txt}` : '';
      }).filter(Boolean).join('\n\n');
    }
    return String(value);
  }
  function V134_normalizePack(raw){
    const pack=raw && typeof raw==='object' ? raw : {};
    return {
      facebook: V134_text(pack.facebook || pack.fb || pack.facebook_post),
      instagram: V134_text(pack.instagram || pack.instagram_post || pack.ig),
      tiktok: V134_text(pack.tiktok || pack.tiktok_reels || pack.reels || pack.video_script),
      whatsapp: V134_text(pack.whatsapp || pack.whatsapp_message),
      story: V134_text(pack.story || pack.statut || pack.status),
      hashtags: V134_text(pack.hashtags),
      hooks: V134_text(pack.hooks),
      cta: V134_text(pack.cta || pack.ctas)
    };
  }
  function V133_card(title, text){
    text=V134_text(text);
    const arg=V133_arg(text);
    return `<div class="deliverableCard v133SocialCard"><h3>${V133_E(title)}</h3><div class="deliverableText">${V133_E(text)}</div><button type="button" onclick="v133Copy(decodeURIComponent('${arg}'))">Copier</button></div>`;
  }
  function V133_all(pack){
    pack=V134_normalizePack(pack);
    return `FACEBOOK\n\n${pack.facebook||''}\n\n---\nINSTAGRAM\n\n${pack.instagram||''}\n\n---\nTIKTOK / REELS\n\n${pack.tiktok||''}\n\n---\nWHATSAPP\n\n${pack.whatsapp||''}\n\n---\nSTORY / STATUT\n\n${pack.story||''}\n\n---\nHASHTAGS\n\n${pack.hashtags||''}`;
  }
  function V133_actions(offer){
    const q=V133_arg(offer);
    return `<div class="v133Actions">
      <button type="button" onclick="v133Run('ideas','${q}')">🔄 Générer d'autres idées</button>
      <button type="button" onclick="v133Run('viral','${q}')">🔥 Version virale</button>
      <button type="button" onclick="v133Run('emotion','${q}')">❤️ Émotionnelle</button>
      <button type="button" onclick="v133Run('premium','${q}')">💎 Premium</button>
      <button type="button" onclick="v133Run('aggressive','${q}')">⚡ Agressive</button>
      <button type="button" onclick="v133Run('promo','${q}')">🏷️ Promotion</button>
      <button type="button" onclick="v133Extra('hooks','${q}')">🎣 20 Hooks</button>
      <button type="button" onclick="v133Extra('cta','${q}')">📢 10 CTA</button>
      <button type="button" onclick="v133Extra('hashtags','${q}')">#️⃣ 30 Hashtags</button>
      <button type="button" onclick="v133GenerateBackground('${q}')">🖼️ Créer fond IA</button>
    </div>`;
  }
  function V133_renderPack(pack, offer, title){
    pack=V134_normalizePack(pack);
    const all=V133_all(pack); const allArg=V133_arg(all);
    return `<div class="employeeResult v133Result"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail exécuté</span><h2>${V133_E(title||'Pack réseaux sociaux prêt')}</h2><p class="muted">Contenu directement prêt à publier : Facebook, Instagram, TikTok/Reels, WhatsApp, Story et hashtags.</p></div><button class="copyBtn" type="button" onclick="v133Copy(decodeURIComponent('${allArg}'))">Copier tout</button></div>${V133_actions(offer)}<div class="deliverableGrid v133Grid">${V133_card('Facebook',pack.facebook)}${V133_card('Instagram',pack.instagram)}${V133_card('TikTok / Reels',pack.tiktok)}${V133_card('WhatsApp',pack.whatsapp)}${V133_card('Story / Statut',pack.story)}${V133_card('Hashtags',pack.hashtags)}</div><div id="v133ExtraOut"></div></div>`;
  }
  async function V133_post(path, body){
    if(typeof api === 'function') return await api(path,'POST',body,true);
    const headers={'Content-Type':'application/json'};
    const t=localStorage.getItem('ghostseller_token'); if(t) headers.Authorization='Bearer '+t;
    const res=await fetch(path,{method:'POST',headers,body:JSON.stringify(body)});
    const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error||'Erreur API');
    return data;
  }
  window.v133Run = async function(angle, encodedOffer){
    const offer=V133_decode(encodedOffer) || V133_offer();
    const out=document.getElementById('contentOut'); if(!out) return;
    if(!offer){ out.innerHTML='<div class="employeeResult">Décris ton offre avant de générer.</div>'; return; }
    out.innerHTML=`<div class="employeeResult"><span class="employeeBadge">🤖 IA en action</span><h2>GhostSeller écrit vraiment le pack...</h2><p class="muted">Je ne donne pas des conseils : je prépare les textes directement publiables.</p></div>`;
    try{
      const data=await V133_post('/api/content/social-pack',{offer,angle});
      out.innerHTML=V133_renderPack(data.pack||{}, offer, angle==='ideas'?'Nouveau pack avec autres angles':'Pack '+angle+' exécuté');
    }catch(e){
      out.innerHTML=`<div class="employeeResult error">${V133_E(e.message||'Erreur génération')}</div>`;
    }
  };
  window.v133Extra = async function(type, encodedOffer){
    const offer=V133_decode(encodedOffer) || V133_offer();
    const extra=document.getElementById('v133ExtraOut') || document.getElementById('v129ExtraOut') || document.getElementById('contentOut'); if(!extra) return;
    extra.innerHTML='<div class="employeeResult"><span class="employeeBadge">🤖 Travail en cours</span><h2>Génération...</h2></div>';
    try{
      const data=await V133_post('/api/content/social-pack',{offer,angle:type});
      const pack=V134_normalizePack(data.pack||{});
      const title=type==='hooks'?'20 hooks prêts à tester':type==='cta'?'10 CTA prêts à utiliser':'30 hashtags prêts';
      const text=V134_text(type==='hooks'?pack.hooks:type==='cta'?pack.cta:pack.hashtags);
      extra.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ Exécuté</span><h2>${V133_E(title)}</h2></div><button class="copyBtn" onclick="v133Copy(decodeURIComponent('${V133_arg(text)}'))">Copier tout</button></div><div class="scriptBlock employeeScript">${V133_E(text)}</div></div>`;
    }catch(e){ extra.innerHTML=`<div class="employeeResult error">${V133_E(e.message)}</div>`; }
  };
  window.v133GenerateBackground = async function(encodedOffer){
    const offer=V133_decode(encodedOffer) || V133_offer();
    const extra=document.getElementById('v133ExtraOut') || document.getElementById('v129ExtraOut') || document.getElementById('contentOut'); if(!extra) return;
    extra.innerHTML='<div class="employeeResult"><span class="employeeBadge">🖼️ IA image en action</span><h2>Création du fond sombre...</h2><p class="muted">GhostSeller génère un vrai visuel utilisable, pas seulement un prompt.</p></div>';
    try{
      const data=await V133_post('/api/content/background-image',{offer});
      const promptArg=V133_arg(data.prompt||'');
      extra.innerHTML=`<div class="employeeResult v133BgDone"><div class="employeeHeader"><div><span class="employeeBadge">✅ Fond créé</span><h2>Fond IA prêt à publier</h2><p class="muted">Image sombre générée automatiquement selon ton produit. Tu peux mettre le texte blanc par-dessus.</p></div><button class="copyBtn" onclick="v133Copy(decodeURIComponent('${promptArg}'))">Copier prompt technique</button></div><div class="v133GeneratedImageWrap"><img src="${V133_E(data.imageUrl)}" alt="Fond IA généré pour publicité"/></div></div>`;
    }catch(e){ extra.innerHTML=`<div class="employeeResult error">${V133_E(e.message)}</div>`; }
  };
  window.v129Regen = function(kind,p){ window.v133Run(kind,p); };
  window.v129Hooks = function(p){ window.v133Extra('hooks',p); };
  window.v129CTA = function(p){ window.v133Extra('cta',p); };
  window.v129Hashtags = function(p){ window.v133Extra('hashtags',p); };
  window.v132Background = function(p){ window.v133GenerateBackground(p); };
  window.generateContent = function(){ window.v133Run('base', V133_arg(V133_offer())); };

  window.logout = window.v133Logout = function(){
    try{
      ['ghostseller_token','token','authToken','supabase.auth.token'].forEach(k=>localStorage.removeItem(k));
      sessionStorage.clear();
    }catch(e){}
    location.href='/';
  };
  function fixAccountLogout(){
    try{
      document.querySelectorAll('aside .logout, #v91LogoutBtn, [onclick*=\"logout\"]').forEach(el=>{
        if(el.closest('aside') || el.id==='v91LogoutBtn') el.remove();
      });
      const panel=document.querySelector('.securityPanelV131');
      if(panel){
        panel.innerHTML = '<div class="securityLogoutBoxV132 securityLogoutBoxV133 securityLogoutBoxV134"><div><b>Déconnexion</b><span>Se déconnecter immédiatement de ton compte sur cet appareil.</span></div><button type="button" class="logoutAccountBtn logoutAccountBtnV131 logoutAccountBtnV133">⎋ Se déconnecter</button></div>';
      }
      document.querySelectorAll('.logoutAccountBtn,.logoutAccountBtnV133').forEach(btn=>{btn.onclick=window.v133Logout;});
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded', fixAccountLogout);
  setTimeout(fixAccountLogout,400); setTimeout(fixAccountLogout,1500); setTimeout(fixAccountLogout,3000);
})();

/* V134: normalized AI objects, direct logout, cleaner account security, background image executes without showing instructions */

/* V135 — REAL EXECUTION UX FIX: no useless loader text, active buttons, auto background image, clean account logout */
(function(){
  function E(s){return String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function offer(){return (document.getElementById('contentPrompt')?.value || document.getElementById('contentNiche')?.value || '').trim();}
  function enc(v){return encodeURIComponent(String(v||''));}
  function dec(v){try{return decodeURIComponent(String(v||''));}catch(e){return String(v||'');}}
  function copy(t){navigator.clipboard?.writeText(String(t||''));}
  window.v135Copy = window.v133Copy = window.v129Copy = window.gsCopy = copy;
  function text(v){
    if(v==null) return '';
    if(Array.isArray(v)) return v.map(text).filter(Boolean).join('\n');
    if(typeof v==='object'){
      const preferred = v.content ?? v.text ?? v.body ?? v.caption ?? v.message ?? v.script ?? v.value;
      if(preferred!=null) return text(preferred);
      return Object.entries(v).map(([k,val])=>{const t=text(val);return t?`${k.toUpperCase()}\n${t}`:'';}).filter(Boolean).join('\n\n');
    }
    return String(v);
  }
  function normalize(raw){
    raw = raw && typeof raw==='object' ? raw : {};
    return {
      facebook: text(raw.facebook || raw.fb || raw.facebook_post),
      instagram: text(raw.instagram || raw.instagram_post || raw.ig),
      tiktok: text(raw.tiktok || raw.tiktok_reels || raw.reels || raw.video_script),
      whatsapp: text(raw.whatsapp || raw.whatsapp_message),
      story: text(raw.story || raw.statut || raw.status),
      hashtags: text(raw.hashtags),
      hooks: text(raw.hooks),
      cta: text(raw.cta || raw.ctas)
    };
  }
  function meta(p){
    const s=String(p||'').toLowerCase();
    if(s.includes('café')||s.includes('cafe')||s.includes('coffee')) return {product:'café premium',kw:'CAFÉ',tags:['#KafeLakay','#Cafe','#Haiti','#Gourmandise','#CafeHaitien','#CafeArtisanal','#CafeLover']};
    if(s.includes('haiti')||s.includes('haïti')) return {product:'produit venant d’Haïti',kw:'INFO',tags:['#Haiti','#MadeInHaiti','#DiasporaHaitienne','#Lakou','#CaribbeanBusiness']};
    if(s.includes('nike')||s.includes('adidas')||s.includes('basket')||s.includes('chaussure')) return {product:'baskets tendance',kw:'BASKET',tags:['#Sneakers','#Nike','#Adidas','#Streetwear','#Mode']};
    if(s.includes('sac')) return {product:'sac tendance',kw:'INFO',tags:['#Sac','#ModeFemme','#Shopping','#Tendance']};
    if(s.includes('parfum')||s.includes('cosm')||s.includes('beaut')) return {product:'cosmétique premium',kw:'BEAUTÉ',tags:['#Parfum','#Beaute','#Cosmetique','#Luxe']};
    if(s.includes('montre')||s.includes('bijou')||s.includes('luxe')) return {product:'produit luxe',kw:'LUXE',tags:['#Luxe','#Montre','#Bijoux','#Premium']};
    return {product:'offre',kw:'INFO',tags:['#Business','#Marketing','#Vente','#Offre']};
  }
  function fallbackPack(p,angle='base'){
    const m=meta(p); const prod=m.product; const kw=m.kw;
    const name = angle==='viral'?'🔥 Angle viral':angle==='emotion'?'❤️ Angle émotionnel':angle==='premium'?'💎 Angle premium':angle==='aggressive'?'⚡ Angle direct':angle==='promo'?'🏷️ Angle promotion':'✨ Offre disponible';
    const facebook=`${name}\n\n${p}\n\nDécouvre ${prod} avec une présentation claire, simple et prête à publier.\n\n✅ Facile à comprendre\n✅ Donne envie d’essayer\n✅ Disponible maintenant\n\n📩 Écris “${kw}” pour recevoir les détails.`;
    const instagram=`${name}\n\n${p}\n\nUn contenu propre pour attirer l’attention et donner envie de passer à l’action.\n\nDM “${kw}” pour recevoir les infos.\n\n${m.tags.concat(['#Reels','#TikTokFrance','#InstagramFrance','#Clients']).join(' ')}`;
    const tiktok=`🎬 SCRIPT TIKTOK / REELS\n\nSCÈNE 1 — HOOK (0-2s)\nTexte écran : “Tu cherchais une offre qui attire vraiment ?”\n\nSCÈNE 2 — PRODUIT (2-6s)\nMontrer ${prod} en gros plan.\nTexte écran : “${p}”\n\nSCÈNE 3 — DÉSIR (6-12s)\nMontrer les détails, la texture, l’ambiance et le bénéfice.\nVoix off : “Simple, beau et disponible maintenant.”\n\nSCÈNE 4 — PREUVE (12-17s)\nAfficher 2 bénéfices clairs.\nTexte écran : “Prêt à commander.”\n\nSCÈNE 5 — CTA (17-22s)\nTexte écran : “Écris ${kw} pour les infos.”\n\nCAPTION : ${p}\nCTA : Commente ${kw} ou envoie un DM.`;
    const whatsapp=`Bonjour 👋\n\nJe te partage cette offre :\n\n${p}\n\nC’est simple, clair et disponible maintenant.\n\n✅ Infos rapides\n✅ Offre facile à comprendre\n✅ Prêt à commander\n\nRéponds “${kw}” et je t’envoie les détails.`;
    const story=`📱 STORY / STATUT\n\n${prod.toUpperCase()}\n${p}\n\nTu veux les détails ?\nRéponds “${kw}” maintenant.`;
    const hooks=Array.from({length:20},(_,i)=>`${i+1}. ${['Stop, cette offre peut t’intéresser.','POV : tu découvres le produit au bon moment.','Avant d’acheter ailleurs, regarde ça.','Tu veux les détails ? Écris '+kw+'.'][i%4]}`).join('\n');
    const cta=['Écris '+kw+' pour recevoir les détails.','Envoie-moi un DM maintenant.','Commente '+kw+'.','Demande la disponibilité.','Réserve avant que ça parte.','Partage à quelqu’un que ça peut aider.','Clique pour en savoir plus.','Réponds OUI et je t’envoie tout.','Garde cette offre.','Passe commande maintenant.'].map((x,i)=>`${i+1}. ${x}`).join('\n');
    const hashtags=m.tags.concat(['#Offre','#Promotion','#Business','#Vente','#Marketing','#ReelsFrance','#Tendance','#Nouveaute','#Clients','#Achat']).slice(0,30).join(' ');
    return {facebook,instagram,tiktok,whatsapp,story,hashtags,hooks,cta};
  }
  function all(pack){pack=normalize(pack);return `FACEBOOK\n\n${pack.facebook}\n\n---\nINSTAGRAM\n\n${pack.instagram}\n\n---\nTIKTOK / REELS\n\n${pack.tiktok}\n\n---\nWHATSAPP\n\n${pack.whatsapp}\n\n---\nSTORY / STATUT\n\n${pack.story}\n\n---\nHASHTAGS\n\n${pack.hashtags}`;}
  function card(title,body){body=text(body); return `<div class="deliverableCard v133SocialCard"><h3>${E(title)}</h3><div class="deliverableText">${E(body)}</div><button type="button" onclick="v135Copy(decodeURIComponent('${enc(body)}'))">Copier</button></div>`;}
  function actions(p){const q=enc(p);return `<div class="v133Actions v135Actions">
    <button type="button" onclick="v135Run('ideas','${q}')">🔄 Générer d'autres idées</button>
    <button type="button" onclick="v135Run('viral','${q}')">🔥 Version virale</button>
    <button type="button" onclick="v135Run('emotion','${q}')">❤️ Émotionnelle</button>
    <button type="button" onclick="v135Run('premium','${q}')">💎 Premium</button>
    <button type="button" onclick="v135Run('aggressive','${q}')">⚡ Agressive</button>
    <button type="button" onclick="v135Run('promo','${q}')">🏷️ Promotion</button>
    <button type="button" onclick="v135Extra('hooks','${q}')">🎣 20 Hooks</button>
    <button type="button" onclick="v135Extra('cta','${q}')">📢 10 CTA</button>
    <button type="button" onclick="v135Extra('hashtags','${q}')">#️⃣ 30 Hashtags</button>
    <button type="button" onclick="v135Background('${q}')">🖼️ Créer fond IA</button>
  </div>`;}
  function render(pack,p,title){pack=normalize(pack); const a=all(pack); return `<div class="employeeResult v133Result v135Result"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail terminé</span><h2>${E(title||'Pack réseaux sociaux prêt')}</h2><p class="muted">Facebook, Instagram, TikTok/Reels, WhatsApp, Story et hashtags prêts à publier.</p></div><button class="copyBtn" type="button" onclick="v135Copy(decodeURIComponent('${enc(a)}'))">Copier tout</button></div>${actions(p)}<div class="deliverableGrid v133Grid">${card('Facebook',pack.facebook)}${card('Instagram',pack.instagram)}${card('TikTok / Reels',pack.tiktok)}${card('WhatsApp',pack.whatsapp)}${card('Story / Statut',pack.story)}${card('Hashtags',pack.hashtags)}</div><div id="v135BgOut"></div><div id="v133ExtraOut"></div></div>`;}
  async function post(path,body){
    const headers={'Content-Type':'application/json'}; const t=localStorage.getItem('ghostseller_token'); if(t) headers.Authorization='Bearer '+t;
    const res=await fetch(path,{method:'POST',headers,body:JSON.stringify(body)}); const data=await res.json().catch(()=>({}));
    if(!res.ok) throw new Error(data.error||data.message||'Erreur API'); return data;
  }
  function setButtonsBusy(busy){document.querySelectorAll('.v135Actions button,.v133Actions button').forEach(b=>{b.disabled=!!busy; b.style.opacity=busy?'.65':'';});}
  window.v135Run = async function(angle,ep){
    const p=dec(ep)||offer(); const out=document.getElementById('contentOut'); if(!out) return;
    if(!p){out.innerHTML='<div class="employeeResult">Décris ton offre avant de générer.</div>';return;}
    // Render immediately so buttons never look frozen.
    out.innerHTML=render(fallbackPack(p,angle),p,angle==='base'?'Pack réseaux sociaux prêt':'Pack '+angle+' prêt');
    setButtonsBusy(true);
    try{
      const data=await post('/api/content/social-pack',{offer:p,angle});
      const pack=normalize(data.pack||{});
      out.innerHTML=render(pack.facebook||pack.instagram||pack.tiktok?pack:fallbackPack(p,angle),p,angle==='base'?'Pack réseaux sociaux prêt':'Pack '+angle+' prêt');
    }catch(e){
      // Keep already rendered pack instead of blocking the screen.
      const x=document.getElementById('v133ExtraOut'); if(x) x.innerHTML=`<div class="employeeResult error">API indisponible, pack local affiché. ${E(e.message||'')}</div>`;
    }finally{setButtonsBusy(false);}
  };
  window.v135Extra = async function(type,ep){
    const p=dec(ep)||offer(); const box=document.getElementById('v133ExtraOut')||document.getElementById('contentOut'); if(!box) return;
    const local=fallbackPack(p,type); let body=type==='hooks'?local.hooks:type==='cta'?local.cta:local.hashtags;
    box.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail terminé</span><h2>${type==='hooks'?'20 Hooks':type==='cta'?'10 CTA':'30 Hashtags'}</h2></div><button class="copyBtn" onclick="v135Copy(decodeURIComponent('${enc(body)}'))">Copier tout</button></div><div class="scriptBlock employeeScript">${E(body)}</div></div>`;
    try{const data=await post('/api/content/social-pack',{offer:p,angle:type}); const pack=normalize(data.pack||{}); const remote=text(type==='hooks'?pack.hooks:type==='cta'?pack.cta:pack.hashtags); if(remote){body=remote; box.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail terminé</span><h2>${type==='hooks'?'20 Hooks':type==='cta'?'10 CTA':'30 Hashtags'}</h2></div><button class="copyBtn" onclick="v135Copy(decodeURIComponent('${enc(body)}'))">Copier tout</button></div><div class="scriptBlock employeeScript">${E(body)}</div></div>`;}}catch(e){}
  };
  function clientSvg(p){
    const m=meta(p); const emoji=m.product.includes('café')?'☕':m.product.includes('Haïti')?'🇭🇹':m.product.includes('basket')?'👟':m.product.includes('sac')?'👜':m.product.includes('luxe')?'💎':'✨';
    const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='720' height='1280'><defs><linearGradient id='a' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#030712'/><stop offset='.45' stop-color='#0b1735'/><stop offset='1' stop-color='#230b3d'/></linearGradient><radialGradient id='b' cx='25%' cy='20%'><stop stop-color='#38bdf8' stop-opacity='.35'/><stop offset='1' stop-color='#000' stop-opacity='0'/></radialGradient><radialGradient id='c' cx='80%' cy='70%'><stop stop-color='#a855f7' stop-opacity='.32'/><stop offset='1' stop-color='#000' stop-opacity='0'/></radialGradient></defs><rect width='720' height='1280' fill='url(#a)'/><rect width='720' height='1280' fill='url(#b)'/><rect width='720' height='1280' fill='url(#c)'/><text x='360' y='570' font-size='148' text-anchor='middle' opacity='.22'>${emoji}</text><rect x='70' y='760' width='580' height='210' rx='34' fill='#000' opacity='.28' stroke='#fff' stroke-opacity='.10'/></svg>`;
    return 'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));
  }
  window.v135Background = async function(ep){
    const p=dec(ep)||offer(); const box=document.getElementById('v135BgOut')||document.getElementById('v133ExtraOut')||document.getElementById('contentOut'); if(!box) return;
    const local=clientSvg(p);
    box.innerHTML=`<div class="employeeResult v133BgDone"><div class="employeeHeader"><div><span class="employeeBadge">🖼️ Fond IA</span><h2>Fond sombre prêt</h2><p class="muted">Visuel généré automatiquement pour ton offre.</p></div></div><div class="v133GeneratedImageWrap"><img src="${local}" alt="Fond IA"/></div></div>`;
    try{const data=await post('/api/content/background-image',{offer:p}); if(data.imageUrl){box.innerHTML=`<div class="employeeResult v133BgDone"><div class="employeeHeader"><div><span class="employeeBadge">✅ Fond créé</span><h2>Fond IA prêt</h2><p class="muted">Image sombre générée automatiquement.</p></div></div><div class="v133GeneratedImageWrap"><img src="${E(data.imageUrl)}" alt="Fond IA généré"/></div></div>`;}}catch(e){}
  };
  window.generateContent=function(){window.v135Run('base',enc(offer()));};
  window.v133Run=window.v129Regen=window.v135Run;
  window.v133Extra=window.v135Extra; window.v129Hooks=p=>window.v135Extra('hooks',p); window.v129CTA=p=>window.v135Extra('cta',p); window.v129Hashtags=p=>window.v135Extra('hashtags',p); window.v133GenerateBackground=window.v132Background=window.v135Background;
  window.logout=window.v133Logout=window.v135Logout=function(){try{['ghostseller_token','token','authToken','supabase.auth.token'].forEach(k=>localStorage.removeItem(k));sessionStorage.clear();}catch(e){} location.href='/';};
  function cleanAccount(){
    document.querySelectorAll('aside .logout,#v91LogoutBtn').forEach(el=>el.remove());
    document.querySelectorAll('.securityPanelV131,.securityLogoutBoxV132').forEach(el=>{
      el.innerHTML='<div class="securityLogoutBoxV132 securityLogoutBoxV133 securityLogoutBoxV134"><div><b>Déconnexion</b><span>Se déconnecter de ton compte sur cet appareil.</span></div><button type="button" class="logoutAccountBtn logoutAccountBtnV131 logoutAccountBtnV133">⎋ Se déconnecter</button></div>';
    });
    document.querySelectorAll('.logoutAccountBtn,.logoutAccountBtnV133,[onclick*="logout"]').forEach(btn=>{btn.onclick=function(ev){ev.preventDefault();window.v135Logout();};});
  }
  document.addEventListener('DOMContentLoaded',cleanAccount); setInterval(cleanAccount,1500);
})();

/* V136 — Restore strong copy + visible dark background + buttons that really change content */
(function(){
  function E(s){return String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function enc(v){return encodeURIComponent(String(v||''));}
  function dec(v){try{return decodeURIComponent(String(v||''));}catch(e){return String(v||'');}}
  function offer(){return (document.getElementById('contentPrompt')?.value || document.getElementById('contentNiche')?.value || '').trim();}
  function copy(t){try{navigator.clipboard?.writeText(String(t||''));}catch(e){}}
  window.v135Copy = window.v133Copy = window.v129Copy = window.gsCopy = copy;
  function text(v){
    if(v==null) return '';
    if(Array.isArray(v)) return v.map(text).filter(Boolean).join('\n');
    if(typeof v==='object'){
      const preferred=v.content ?? v.text ?? v.body ?? v.caption ?? v.message ?? v.script ?? v.value;
      if(preferred!=null) return text(preferred);
      return Object.entries(v).map(([k,val])=>{const t=text(val); return t?`${k.toUpperCase()}\n${t}`:'';}).filter(Boolean).join('\n\n');
    }
    return String(v);
  }
  function normalize(raw){raw=raw&&typeof raw==='object'?raw:{}; return {
    facebook:text(raw.facebook||raw.fb||raw.facebook_post), instagram:text(raw.instagram||raw.instagram_post||raw.ig),
    tiktok:text(raw.tiktok||raw.tiktok_reels||raw.reels||raw.video_script), whatsapp:text(raw.whatsapp||raw.whatsapp_message),
    story:text(raw.story||raw.statut||raw.status), hashtags:text(raw.hashtags), hooks:text(raw.hooks), cta:text(raw.cta||raw.ctas)
  };}
  function brand(p){
    const s=String(p||'');
    const q=s.match(/["'“”‘’]([^"'“”‘’]{3,40})["'“”‘’]/); if(q) return q[1].trim();
    const m=s.match(/marque\s+(?:de\s+)?(?:café|cafe|coffee)?\s*([A-Z0-9][A-Z0-9\s-]{3,35})/i); if(m) return m[1].replace(/venant.*$/i,'').trim();
    return '';
  }
  function meta(p){
    const s=String(p||'').toLowerCase(); const b=brand(p);
    if(s.includes('café')||s.includes('cafe')||s.includes('coffee')) return {kind:'coffee', product:'café haïtien premium', brand:b||'KAFE LAKAY', kw:'CAFÉ', tags:['#KafeLakay','#CafeHaitien','#Haiti','#CoffeeLovers','#MadeInHaiti','#DiasporaHaitienne','#CafeArtisanal']};
    if(s.includes('nike')||s.includes('adidas')||s.includes('basket')||s.includes('sneaker')||s.includes('chaussure')) return {kind:'sport', product:'baskets tendance', brand:b||'Sneakers', kw:'BASKET', tags:['#Sneakers','#Streetwear','#Nike','#Adidas','#ModeUrbaine','#FootLocker']};
    if(s.includes('montre')||s.includes('bijou')||s.includes('luxe')) return {kind:'luxury', product:'pièce de luxe', brand:b||'Collection premium', kw:'LUXE', tags:['#Luxe','#Montre','#Bijoux','#Premium','#ElegantStyle']};
    if(s.includes('parfum')||s.includes('cosm')||s.includes('beaut')) return {kind:'beauty', product:'parfum / cosmétique', brand:b||'Beauté premium', kw:'BEAUTÉ', tags:['#Parfum','#Cosmetique','#Beaute','#LuxuryBeauty','#Glow']};
    if(s.includes('sac')) return {kind:'fashion', product:'sac tendance', brand:b||'Sac tendance', kw:'INFO', tags:['#Sac','#ModeFemme','#Shopping','#Tendance','#Style']};
    return {kind:'generic', product:'offre', brand:b||'Offre spéciale', kw:'INFO', tags:['#Business','#Vente','#Marketing','#Offre','#Clients']};
  }
  function angleName(angle){return ({base:'',ideas:'nouvelle idée',viral:'viral',emotion:'émotionnel',premium:'premium',aggressive:'direct',promo:'promotion'}[angle]||'');}
  function opening(m,angle){
    if(m.kind==='coffee'){
      if(angle==='viral') return `🔥 Le café d’Haïti qui peut faire parler de lui : ${m.brand}`;
      if(angle==='premium') return `☕ ${m.brand} — l’élégance d’un café haïtien authentique`;
      if(angle==='emotion') return `🇭🇹 Un goût qui rappelle Haïti, la famille et les bons matins`;
      if(angle==='aggressive') return `⚡ Tu aimes le vrai café ? Découvre ${m.brand} maintenant.`;
      if(angle==='promo') return `🏷️ Offre spéciale sur ${m.brand}, café haïtien premium`;
      return `☕ ${m.brand} — café premium venu d’Haïti`;
    }
    if(m.kind==='sport') return angle==='viral'?`🔥 Les baskets qui attirent les regards cette saison`:`👟 ${m.brand} — style urbain prêt à porter`;
    if(m.kind==='luxury') return angle==='premium'?`💎 Une présence élégante, pensée pour ceux qui aiment le détail`:`💎 ${m.brand} — style luxe et caractère`;
    if(m.kind==='beauty') return angle==='emotion'?`✨ Un parfum, une sensation, une signature`:`✨ ${m.brand} — beauté premium à découvrir`;
    return `✨ ${m.brand}`;
  }
  function localPack(p,angle='base'){
    const m=meta(p); const head=opening(m,angle); const specific = m.kind==='coffee' ? 'grains sélectionnés, arôme intense, inspiration haïtienne et présentation premium' : m.kind==='sport' ? 'style, confort et énergie urbaine' : m.kind==='luxury' ? 'élégance, détail et finition premium' : m.kind==='beauty' ? 'douceur, sensation et image soignée' : 'présentation claire, désir et passage à l’action';
    const benefit = angle==='viral' ? 'un angle qui capte l’attention dès la première seconde' : angle==='emotion' ? 'une approche plus humaine, chaude et mémorable' : angle==='premium' ? 'une image plus haut de gamme et rassurante' : angle==='aggressive' ? 'un message direct qui pousse à demander les infos' : angle==='promo' ? 'une offre simple à comprendre et facile à commander' : 'un message prêt à publier';
    const facebook=`${head}\n\n${m.kind==='coffee'?`${m.brand}, c’est le goût du café haïtien dans une version propre, moderne et prête à séduire les amateurs de bon café.`:`${p}`}\n\nCe contenu met en avant ${specific}.\n\n✅ ${benefit}\n✅ Facile à comprendre\n✅ Donne envie d’essayer\n✅ Disponible maintenant\n\n📩 Écris “${m.kw}” pour recevoir les détails.`;
    const instagram=`${head}\n\n${m.kind==='coffee'?`Un café qui porte une histoire, une origine et une vraie identité : Haïti.`:p}\n\nVisuel sombre, message clair, produit mis en valeur : parfait pour attirer l’œil et donner envie de passer en DM.\n\nDM “${m.kw}” pour les infos.\n\n${m.tags.concat(['#Reels','#TikTokFrance','#InstagramFrance','#SmallBusiness']).join(' ')}`;
    const tiktok=`🎬 SCRIPT TIKTOK / REELS\n\nSCÈNE 1 — HOOK (0-2s)\nTexte écran : “Tu connais ${m.brand} ?”\nPlan : gros plan sombre, produit au centre, lumière cinématique.\n\nSCÈNE 2 — ORIGINE (2-6s)\nTexte écran : “${m.kind==='coffee'?'Un café venu d’Haïti':'Une offre à découvrir'}”\nPlan : détails du produit, texture, ambiance premium.\n\nSCÈNE 3 — DÉSIR (6-12s)\nTexte écran : “${m.kind==='coffee'?'Arôme intense. Goût authentique. Présentation premium.':'Simple, beau, disponible maintenant.'}”\nVoix off : “Une offre faite pour attirer l’attention et donner envie d’essayer.”\n\nSCÈNE 4 — PREUVE (12-17s)\nTexte écran : “Prêt à publier / prêt à commander”\nPlan : 2 bénéfices qui apparaissent à l’écran.\n\nSCÈNE 5 — CTA (17-22s)\nTexte écran : “Écris ${m.kw} pour recevoir les infos”\nCaption : ${head}\nCTA : Commente ${m.kw} ou envoie un DM.`;
    const whatsapp=`Bonjour 👋\n\nJe te partage cette offre :\n\n${head}\n\n${m.kind==='coffee'?`${m.brand} met en avant un café haïtien premium, avec une image propre et un message simple à comprendre.`:p}\n\n✅ Infos rapides\n✅ Offre claire\n✅ Disponible maintenant\n\nRéponds “${m.kw}” et je t’envoie les détails.`;
    const story=`📱 STORY / STATUT\n\n${head}\n\n${m.kind==='coffee'?'Café haïtien premium à découvrir.':'Offre disponible maintenant.'}\n\nTu veux les détails ?\nRéponds “${m.kw}”.`;
    const hooks=Array.from({length:20},(_,i)=>{
      const arr=[`Tu connais ${m.brand} ?`,`${m.kind==='coffee'?'Le café haïtien mérite plus de visibilité.':'Cette offre mérite ton attention.'}`,`POV : tu découvres ${m.product} au bon moment.`,`Écris ${m.kw} si tu veux les infos.`,`Stop, regarde cette offre avant de scroller.`]; return `${i+1}. ${arr[i%arr.length]}`;}).join('\n');
    const cta=[`Écris ${m.kw} pour recevoir les détails.`,`Envoie-moi un DM maintenant.`,`Commente ${m.kw}.`,`Demande la disponibilité.`,`Réserve avant que ça parte.`,`Partage à quelqu’un que ça peut intéresser.`,`Clique pour en savoir plus.`,`Réponds OUI et je t’envoie tout.`,`Garde cette offre pour plus tard.`,`Passe commande maintenant.`].map((x,i)=>`${i+1}. ${x}`).join('\n');
    const hashtags=m.tags.concat(['#Offre','#Promotion','#Marketing','#Vente','#Clients','#Business','#Tendance','#Nouveaute','#France','#Diaspora']).slice(0,30).join(' ');
    return {facebook,instagram,tiktok,whatsapp,story,hashtags,hooks,cta};
  }
  function all(pack){pack=normalize(pack); return `FACEBOOK\n\n${pack.facebook}\n\n---\nINSTAGRAM\n\n${pack.instagram}\n\n---\nTIKTOK / REELS\n\n${pack.tiktok}\n\n---\nWHATSAPP\n\n${pack.whatsapp}\n\n---\nSTORY / STATUT\n\n${pack.story}\n\n---\nHASHTAGS\n\n${pack.hashtags}`;}
  function card(t,b){b=text(b); return `<div class="deliverableCard v133SocialCard"><h3>${E(t)}</h3><div class="deliverableText">${E(b)}</div><button type="button" onclick="v136Copy(decodeURIComponent('${enc(b)}'))">Copier</button></div>`;}
  function bgSvg(p){
    const m=meta(p); const emoji=m.kind==='coffee'?'☕':m.kind==='sport'?'👟':m.kind==='luxury'?'💎':m.kind==='beauty'?'✨':m.kind==='fashion'?'👜':'✦';
    const label=m.kind==='coffee'?'Café Haïti premium':m.kind==='sport'?'Urban sport night':m.kind==='luxury'?'Luxury dark marble':m.kind==='beauty'?'Beauty soft smoke':'Dark premium background';
    const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='720' height='1280' viewBox='0 0 720 1280'><defs><linearGradient id='bg' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#020617'/><stop offset='.45' stop-color='#0b1735'/><stop offset='1' stop-color='#210b35'/></linearGradient><filter id='f'><feGaussianBlur stdDeviation='38'/></filter></defs><rect width='720' height='1280' fill='url(#bg)'/><circle cx='120' cy='180' r='190' fill='#38bdf8' opacity='.23' filter='url(#f)'/><circle cx='590' cy='980' r='260' fill='#a855f7' opacity='.28' filter='url(#f)'/><circle cx='500' cy='260' r='130' fill='#f59e0b' opacity='.12' filter='url(#f)'/><g opacity='.12' fill='#fff'>${Array.from({length:38},(_,i)=>`<circle cx='${(i*97)%720}' cy='${100+(i*181)%1080}' r='${2+(i%5)}'/>`).join('')}</g><text x='360' y='520' font-size='150' text-anchor='middle' opacity='.23'>${emoji}</text><rect x='70' y='780' width='580' height='230' rx='36' fill='#000' opacity='.30' stroke='#fff' stroke-opacity='.10'/><text x='360' y='900' font-family='Arial' font-size='38' font-weight='700' text-anchor='middle' fill='#fff' opacity='.50'>${label}</text></svg>`;
    return 'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));
  }
  function bgPanel(p){const img=bgSvg(p);return `<div id="v136BgStatus" class="v137BgStatus"><span>🖼️ Fond sombre intégré aux pubs</span><button class="copyBtn" type="button" onclick="v136Background('${enc(p)}')">Régénérer fond</button></div>`;}
  function actions(p){const q=enc(p); return `<div class="v133Actions v136Actions"><button type="button" onclick="v136Run('ideas','${q}')">🔄 Générer d'autres idées</button><button type="button" onclick="v136Run('viral','${q}')">🔥 Version virale</button><button type="button" onclick="v136Run('emotion','${q}')">❤️ Émotionnelle</button><button type="button" onclick="v136Run('premium','${q}')">💎 Premium</button><button type="button" onclick="v136Run('aggressive','${q}')">⚡ Agressive</button><button type="button" onclick="v136Run('promo','${q}')">🏷️ Promotion</button><button type="button" onclick="v136Extra('hooks','${q}')">🎣 20 Hooks</button><button type="button" onclick="v136Extra('cta','${q}')">📢 10 CTA</button><button type="button" onclick="v136Extra('hashtags','${q}')">#️⃣ 30 Hashtags</button><button type="button" onclick="v136Background('${q}')">🖼️ Créer fond IA</button></div>`;}
  function render(pack,p,title){pack=normalize(pack); const a=all(pack); const bg=bgSvg(p); return `<div class="employeeResult v133Result v136Result v137BgIntegrated" style="--gs-bg-image:url('${bg}')"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail terminé</span><h2>${E(title||'Pack réseaux sociaux prêt')}</h2><p class="muted">Facebook, Instagram, TikTok/Reels, WhatsApp, Story et hashtags prêts à publier.</p></div><button class="copyBtn" type="button" onclick="v136Copy(decodeURIComponent('${enc(a)}'))">Copier tout</button></div>${actions(p)}${bgPanel(p)}<div class="deliverableGrid v133Grid">${card('Facebook',pack.facebook)}${card('Instagram',pack.instagram)}${card('TikTok / Reels',pack.tiktok)}${card('WhatsApp',pack.whatsapp)}${card('Story / Statut',pack.story)}${card('Hashtags',pack.hashtags)}</div><div id="v133ExtraOut"></div></div>`;}
  async function post(path,body){const headers={'Content-Type':'application/json'}; const t=localStorage.getItem('ghostseller_token'); if(t) headers.Authorization='Bearer '+t; const r=await fetch(path,{method:'POST',headers,body:JSON.stringify(body)}); const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(d.error||d.message||'Erreur API'); return d;}
  window.v136Copy=copy;
  window.v136Run=async function(angle,ep){
    const p=dec(ep)||offer(); const out=document.getElementById('contentOut'); if(!out) return; if(!p){out.innerHTML='<div class="employeeResult">Décris ton offre avant de générer.</div>';return;}
    out.innerHTML=render(localPack(p,angle),p,angle==='base'?'Pack réseaux sociaux prêt':'Pack '+angleName(angle)+' prêt');
    try{const data=await post('/api/content/social-pack',{offer:p,angle}); if(data.provider==='openai'){const pack=normalize(data.pack||{}); if(pack.facebook&&pack.instagram&&pack.tiktok) out.innerHTML=render(pack,p,angle==='base'?'Pack réseaux sociaux prêt':'Pack '+angleName(angle)+' prêt');}}catch(e){}
  };
  window.v136Extra=async function(type,ep){const p=dec(ep)||offer(); const box=document.getElementById('v133ExtraOut')||document.getElementById('contentOut'); if(!box) return; const pack=localPack(p,type); let body=type==='hooks'?pack.hooks:type==='cta'?pack.cta:pack.hashtags; box.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail terminé</span><h2>${type==='hooks'?'20 Hooks':type==='cta'?'10 CTA':'30 Hashtags'}</h2></div><button class="copyBtn" onclick="v136Copy(decodeURIComponent('${enc(body)}'))">Copier tout</button></div><div class="scriptBlock employeeScript">${E(body)}</div></div>`; try{const data=await post('/api/content/social-pack',{offer:p,angle:type}); if(data.provider==='openai'){const remote=normalize(data.pack||{}); const rb=text(type==='hooks'?remote.hooks:type==='cta'?remote.cta:remote.hashtags); if(rb){body=rb; box.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail terminé</span><h2>${type==='hooks'?'20 Hooks':type==='cta'?'10 CTA':'30 Hashtags'}</h2></div><button class="copyBtn" onclick="v136Copy(decodeURIComponent('${enc(body)}'))">Copier tout</button></div><div class="scriptBlock employeeScript">${E(body)}</div></div>`;}}}catch(e){} };
  window.v136Background=async function(ep){
    const p=dec(ep)||offer();
    const root=document.querySelector('.v136Result')||document.getElementById('contentOut');
    const status=document.getElementById('v136BgStatus');
    if(status) status.innerHTML='<span>🖼️ Génération du fond en cours...</span><button class="copyBtn" type="button" disabled>...</button>';
    const local=bgSvg(p);
    if(root && root.style) root.style.setProperty('--gs-bg-image', `url('${local}')`);
    if(status) status.innerHTML=`<span>✅ Fond sombre intégré aux cartes</span><button class="copyBtn" type="button" onclick="v136Background('${enc(p)}')">Régénérer fond</button>`;
    try{
      const data=await post('/api/content/background-image',{offer:p});
      if(data && data.imageUrl){
        const img=String(data.imageUrl).replace(/'/g,'%27');
        if(root && root.style) root.style.setProperty('--gs-bg-image', `url('${img}')`);
        const st=document.getElementById('v136BgStatus');
        if(st) st.innerHTML=`<span>✅ Fond IA intégré aux pubs</span><button class="copyBtn" type="button" onclick="v136Background('${enc(p)}')">Régénérer fond</button>`;
      }
    }catch(e){
      const st=document.getElementById('v136BgStatus');
      if(st) st.innerHTML=`<span>✅ Fond sombre local intégré aux pubs</span><button class="copyBtn" type="button" onclick="v136Background('${enc(p)}')">Régénérer fond</button>`;
    }
  };
  window.generateContent=function(){window.v136Run('base',enc(offer()));};
  window.v135Run=window.v133Run=window.v129Regen=window.v136Run; window.v135Extra=window.v133Extra=window.v136Extra; window.v135Background=window.v133GenerateBackground=window.v132Background=window.v136Background;
  window.logout=window.v133Logout=window.v135Logout=window.v136Logout=function(){try{['ghostseller_token','token','authToken','supabase.auth.token'].forEach(k=>localStorage.removeItem(k));sessionStorage.clear();}catch(e){} location.href='/';};
  function cleanAccount(){
    document.querySelectorAll('aside .logout,#v91LogoutBtn').forEach(el=>el.remove());
    document.querySelectorAll('.securityPanelV131,.securityLogoutBoxV132,.securityLogoutBoxV133,.securityLogoutBoxV134').forEach(el=>{el.innerHTML='<div class="securityLogoutBoxV132 securityLogoutBoxV136"><div><b>Déconnexion</b><span>Se déconnecter de ton compte sur cet appareil.</span></div><button type="button" class="logoutAccountBtn logoutAccountBtnV136">⎋ Se déconnecter</button></div>';});
    document.querySelectorAll('.logoutAccountBtn,.logoutAccountBtnV136,[onclick*="logout"]').forEach(btn=>{btn.onclick=function(ev){ev.preventDefault(); window.v136Logout();};});
  }
  document.addEventListener('DOMContentLoaded',cleanAccount); setTimeout(cleanAccount,500); setTimeout(cleanAccount,1800);
})();

/* V140 — Sidebar UX + real background card placement */
(function(){
  function ready(fn){ if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', fn); else fn(); }
  function esc(s){return String(s||'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));}
  function enc(s){return encodeURIComponent(String(s||''));}
  function dec(s){try{return decodeURIComponent(String(s||''));}catch(e){return s||'';}}
  function offer(){return document.getElementById('contentPrompt')?.value?.trim()||'';}
  function setTitles(){
    if(!window.__v140TitlePatched && typeof window.showPage==='function'){
      const old=window.showPage;
      window.showPage=function(id){ old(id); const t={home:['Accueil','Vue d’ensemble de ton espace GhostSeller.'],content:['Nouvelle Création','Crée un pack complet puis choisis les réseaux à afficher.'],leads:['Leads','Gestion des prospects.'],account:['Mon compte','Profil, abonnement et réglages.'],history:['Mes Contenus','Historique de tes générations.']}; if(t[id]){const h=document.getElementById('pageTitle'),p=document.getElementById('pageSubtitle'); if(h) h.textContent=t[id][0]; if(p) p.textContent=t[id][1];}}
      window.__v140TitlePatched=true;
    }
  }
  function buildSidebar(){
    const side=document.querySelector('aside.sidebar'); if(!side) return;
    const brand=side.querySelector('.brand')?.outerHTML||'';
    side.innerHTML=brand+`\n<button class="nav" data-page="home">🏠 Accueil</button>\n<button class="nav v140PrimaryNav" data-page="content">✨ Nouvelle Création</button>\n<button class="nav" data-page="history">📁 Mes Contenus</button>\n<button class="nav" data-page="leads">👥 Leads</button>\n<button class="nav" data-page="account">👤 Mon Compte</button>\n<a id="ownerSideLink" class="nav owner hidden" href="/owner/">👑 Owner Console</a>`;
    side.querySelectorAll('.nav[data-page]').forEach(btn=>btn.addEventListener('click',()=>{ if(typeof window.showPage==='function') window.showPage(btn.dataset.page); if(typeof window.closeMobileMenu==='function') window.closeMobileMenu(); }));
  }
  function ensureHistoryPage(){
    if(document.getElementById('history')) return;
    const main=document.querySelector('main.main'); if(!main) return;
    const sec=document.createElement('section'); sec.id='history'; sec.className='page hidden workspacePage'; sec.innerHTML=`<div class="card"><h2>Mes Contenus</h2><p>Retrouve les derniers packs générés dans ce navigateur.</p><div id="v140HistoryList" class="v140HistoryList"></div></div>`;
    main.appendChild(sec);
  }
  function renderHistory(){
    const box=document.getElementById('v140HistoryList'); if(!box) return;
    let arr=[]; try{arr=JSON.parse(localStorage.getItem('ghostseller_v140_history')||'[]')}catch(e){}
    box.innerHTML=arr.length?arr.slice(0,20).map(x=>`<div class="v140HistoryItem"><b>${esc(x.title||'Pack généré')}</b><span>${esc(x.date||'')}</span><p>${esc((x.offer||'').slice(0,120))}</p><button onclick="document.getElementById('contentPrompt').value=decodeURIComponent('${enc(x.offer||'')}');showPage('content')">Réouvrir</button></div>`).join(''):`<div class="v140Empty">Aucun contenu sauvegardé pour le moment. Génère ton premier pack dans Nouvelle Création.</div>`;
  }
  function saveHistory(title, of){
    let arr=[]; try{arr=JSON.parse(localStorage.getItem('ghostseller_v140_history')||'[]')}catch(e){}
    arr.unshift({title:title||'Pack réseaux sociaux',offer:of||offer(),date:new Date().toLocaleString('fr-FR')}); localStorage.setItem('ghostseller_v140_history',JSON.stringify(arr.slice(0,50)));
  }
  function tabs(){
    const card=document.querySelector('#content .card'); if(!card || document.getElementById('v140NetworkTabs')) return;
    const t=document.createElement('div'); t.id='v140NetworkTabs'; t.className='v140NetworkTabs'; t.innerHTML=`<button class="active" data-filter="all">Tous</button><button data-filter="facebook">Facebook</button><button data-filter="instagram">Instagram</button><button data-filter="tiktok">TikTok/Reels</button><button data-filter="whatsapp">WhatsApp</button><button data-filter="story">Story</button><button data-filter="hashtags">Hashtags</button>`;
    const p=card.querySelector('p'); p?.after(t);
    t.addEventListener('click',e=>{const b=e.target.closest('button[data-filter]'); if(!b) return; t.querySelectorAll('button').forEach(x=>x.classList.remove('active')); b.classList.add('active'); filterCards(b.dataset.filter);});
  }
  function filterCards(f){
    document.querySelectorAll('#contentOut .deliverableCard').forEach(c=>{const h=(c.querySelector('h3')?.textContent||'').toLowerCase(); let show=f==='all'||h.includes(f)|| (f==='tiktok'&&h.includes('tiktok')) || (f==='story'&&h.includes('story')) || (f==='hashtags'&&h.includes('hashtag')); c.style.display=show?'':'none';});
  }
  function applyBg(img){
    if(!img) return;
    document.querySelectorAll('.v137BgIntegrated,.v136Result,.v133Result').forEach(root=>{ root.style.setProperty('--gs-bg-image',`url("${img}")`); root.classList.add('v140HasBg'); });
    document.querySelectorAll('#contentOut .deliverableCard').forEach(card=>{ card.style.setProperty('--gs-card-bg',`url("${img}")`); card.classList.add('v140CardWithBg'); });
  }
  const oldBg=window.v136Background||window.v135Background||window.v133GenerateBackground;
  window.v136Background=window.v135Background=window.v133GenerateBackground=async function(ep){
    const p=dec(ep)||offer(); const status=document.getElementById('v136BgStatus');
    if(status) status.innerHTML='<span>🖼️ Génération du fond IA en cours...</span><button class="copyBtn" disabled>...</button>';
    // local instant background, visible immediately
    let local=''; try{ if(typeof oldBg==='function') await oldBg(ep); }catch(e){}
    const root=document.querySelector('.v137BgIntegrated,.v136Result,.v133Result');
    const computed=root?getComputedStyle(root).getPropertyValue('--gs-bg-image').trim():'';
    if(computed && computed.startsWith('url(')){ local=computed.slice(4,-1).replace(/^['"]|['"]$/g,''); applyBg(local); }
    try{
      const r=await fetch('/api/content/background-image',{method:'POST',headers:{'Content-Type':'application/json',...(localStorage.getItem('ghostseller_token')?{Authorization:'Bearer '+localStorage.getItem('ghostseller_token')}: {})},body:JSON.stringify({offer:p})});
      const d=await r.json().catch(()=>({})); if(d.imageUrl){applyBg(d.imageUrl);}
      if(status) status.innerHTML='<span>✅ Fond IA placé derrière les pubs</span><button class="copyBtn" type="button" onclick="v136Background(\''+enc(p)+'\')">Régénérer fond</button>';
    }catch(e){ if(status) status.innerHTML='<span>✅ Fond sombre local placé derrière les pubs</span><button class="copyBtn" type="button" onclick="v136Background(\''+enc(p)+'\')">Régénérer fond</button>'; }
  };
  const oldGen=window.generateContent;
  window.generateContent=function(){ const p=offer(); saveHistory('Pack réseaux sociaux',p); if(typeof oldGen==='function') return oldGen(); };
  ready(()=>{ buildSidebar(); ensureHistoryPage(); setTitles(); tabs(); renderHistory(); document.addEventListener('click',()=>setTimeout(()=>{const active=document.querySelector('#v140NetworkTabs button.active')?.dataset.filter; if(active) filterCards(active);},200)); if(typeof window.showPage==='function') window.showPage('home'); });
})();


/* V141 — Sidebar finale claire + réseaux dans Nouvelle Création */
(function(){
  function ready(fn){ document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn(); }
  function qs(s){ return document.querySelector(s); }
  function qsa(s){ return Array.from(document.querySelectorAll(s)); }
  function esc(s){return String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
  const titles={
    home:['Accueil','Vue d’ensemble de ton espace GhostSeller.'],
    content:['Nouvelle Création','Décris ton offre. GhostSeller prépare un pack complet, puis tu choisis les réseaux à afficher.'],
    history:['Mes Contenus','Retrouve les anciennes générations sauvegardées dans ce navigateur.'],
    leads:['Leads','Gestion des prospects.'],
    account:['Mon Compte','Profil, abonnement et réglages.']
  };
  function rebuildSidebar(){
    const side=qs('aside.sidebar'); if(!side) return;
    const brand=side.querySelector('.brand')?.outerHTML || '<div class="brand compact"><div class="logo">G</div><div><strong>GhostSeller AI</strong><span>Espace membre</span></div></div>';
    const owner=qs('#ownerSideLink')?.classList.contains('hidden') ? 'hidden' : '';
    side.innerHTML = brand + `
      <button class="nav" data-page="home">🏠 Accueil</button>
      <button class="nav nav-primary v141MainCreate" data-page="content">✨ Nouvelle Création</button>
      <button class="nav" data-page="history">📁 Mes Contenus</button>
      <button class="nav" data-page="leads">👥 Leads</button>
      <button class="nav" data-page="account">👤 Mon Compte</button>
      <a id="ownerSideLink" class="nav owner ${owner}" href="/owner/">👑 Owner Console</a>`;
    qsa('aside.sidebar .nav[data-page]').forEach(btn=>{
      btn.addEventListener('click',()=>{ if(typeof window.showPage==='function') window.showPage(btn.dataset.page); closeMobile(); });
    });
  }
  function closeMobile(){ try{ document.body.classList.remove('menuOpen','mobileMenuOpen'); qs('.sidebar')?.classList.remove('open'); qs('.mobileOverlay')?.classList.remove('show'); }catch(e){} }
  function patchShowPage(){
    if(window.__v141ShowPagePatched || typeof window.showPage!=='function') return;
    window.__v141ShowPagePatched=true;
    const old=window.showPage;
    window.showPage=function(id){
      old(id==='subscription'?'account':id);
      const real=id==='subscription'?'account':id;
      qsa('aside.sidebar .nav[data-page]').forEach(b=>b.classList.toggle('active', b.dataset.page===real));
      const t=titles[real]; if(t){ const h=qs('#pageTitle'), p=qs('#pageSubtitle'); if(h) h.textContent=t[0]; if(p) p.textContent=t[1]; }
      if(real==='history') renderHistoryPage();
      if(real==='content') ensureNetworkTabs();
      closeMobile();
    };
  }
  function ensureHistoryPage(){
    const main=qs('main.main'); if(!main || qs('#history')) return;
    const sec=document.createElement('section'); sec.id='history'; sec.className='page hidden';
    sec.innerHTML='<div class="card premiumCard"><h2>📁 Mes Contenus</h2><p class="muted">Tes générations récentes apparaîtront ici automatiquement.</p><div id="v141HistoryList" class="v141HistoryList"></div></div>';
    main.appendChild(sec);
  }
  function renderHistoryPage(){
    ensureHistoryPage(); const box=qs('#v141HistoryList'); if(!box) return;
    let arr=[]; try{ arr=JSON.parse(localStorage.getItem('ghostseller_history')||'[]'); }catch(e){}
    if(!arr.length){ box.innerHTML='<div class="v141Empty">Aucun contenu sauvegardé pour le moment. Va dans Nouvelle Création pour générer ton premier pack.</div>'; return; }
    box.innerHTML=arr.slice(0,24).map((x,i)=>`<div class="v141HistoryItem"><b>${esc(x.title||'Pack généré')}</b><span>${esc(x.date||'')}</span><p>${esc((x.offer||x.prompt||'').slice(0,140))}</p><button type="button" data-offer="${encodeURIComponent(x.offer||x.prompt||'')}">Réouvrir</button></div>`).join('');
    box.querySelectorAll('button[data-offer]').forEach(btn=>btn.onclick=()=>{ const ta=qs('#contentPrompt'); if(ta) ta.value=decodeURIComponent(btn.dataset.offer||''); window.showPage('content'); });
  }
  function ensureNetworkTabs(){
    const page=qs('#content'); if(!page || qs('#v141NetworkTabs')) return;
    const target=qs('#contentOut') || page.querySelector('.card') || page.firstElementChild;
    const tabs=document.createElement('div'); tabs.id='v141NetworkTabs'; tabs.className='v141NetworkTabs';
    tabs.innerHTML='<button class="active" data-filter="all">Tous</button><button data-filter="facebook">Facebook</button><button data-filter="instagram">Instagram</button><button data-filter="tiktok">TikTok/Reels</button><button data-filter="whatsapp">WhatsApp</button><button data-filter="story">Story</button><button data-filter="hashtags">Hashtags</button>';
    if(target) target.parentNode.insertBefore(tabs, target); else page.prepend(tabs);
    tabs.querySelectorAll('button').forEach(btn=>btn.onclick=()=>{ tabs.querySelectorAll('button').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); filterCards(btn.dataset.filter); });
  }
  function filterCards(filter){
    qsa('.deliverableCard,.v133SocialCard').forEach(card=>{
      const title=(card.querySelector('h3')?.textContent||'').toLowerCase();
      let show=filter==='all' || title.includes(filter);
      if(filter==='tiktok') show=title.includes('tiktok') || title.includes('reels');
      if(filter==='story') show=title.includes('story') || title.includes('statut');
      card.style.display=show?'':'none';
    });
  }
  function observeResults(){
    const out=qs('#contentOut'); if(!out || window.__v141Observer) return; window.__v141Observer=true;
    new MutationObserver(()=>{ const active=qs('#v141NetworkTabs button.active')?.dataset.filter || 'all'; filterCards(active); }).observe(out,{childList:true,subtree:true});
  }
  ready(()=>{ rebuildSidebar(); patchShowPage(); ensureHistoryPage(); ensureNetworkTabs(); observeResults(); setTimeout(()=>{ rebuildSidebar(); patchShowPage(); ensureNetworkTabs(); observeResults(); },700); });
})();

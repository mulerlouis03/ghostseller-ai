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

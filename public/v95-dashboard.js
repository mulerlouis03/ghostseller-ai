(function(){
  const $=(id)=>document.getElementById(id);
  const esc=(s)=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const token=()=>localStorage.getItem("token")||localStorage.getItem("authToken")||localStorage.getItem("ghostseller_token")||localStorage.getItem("jwt")||"";
  async function api(url,method="GET",body){
    const headers={"Content-Type":"application/json"};
    if(token()) headers.Authorization="Bearer "+token();
    const res=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined});
    const text=await res.text(); let data;
    try{data=JSON.parse(text)}catch(e){data={raw:text}}
    if(!res.ok) throw new Error(data.error||data.message||text||"API error");
    return data;
  }
  window.v95Logout=function(){
    try{["token","authToken","ghostseller_token","jwt"].forEach(k=>localStorage.removeItem(k));sessionStorage.clear()}catch(e){}
    location.href="/";
  };
  window.v95Show=function(page){
    document.querySelectorAll(".v95-page").forEach(p=>p.classList.add("v95-hidden"));
    const el=$("v95-"+page); if(el) el.classList.remove("v95-hidden");
    if(page==="billing") v95LoadBilling();
    if(page==="admin") v95LoadAdmin();
  };
  window.v95LoadBilling=async function(){
    const out=$("v95-billing-out"); if(!out)return; out.innerHTML="Chargement abonnement...";
    try{out.innerHTML="<pre>"+esc(JSON.stringify(await api("/api/billing/status"),null,2))+"</pre>"}catch(e){out.innerHTML="<pre>"+esc(e.message)+"</pre>"}
  };
  window.v95Checkout=async function(plan){
    const out=$("v95-billing-action"); if(out)out.innerHTML="Ouverture checkout Stripe...";
    try{const data=await api("/api/billing/checkout","POST",{plan}); if(data.url) location.href=data.url; else if(out)out.innerHTML="<pre>"+esc(JSON.stringify(data,null,2))+"</pre>"}catch(e){if(out)out.innerHTML="<pre>"+esc(e.message)+"</pre>"; alert(e.message)}
  };
  window.v95Portal=async function(){
    const out=$("v95-billing-action"); if(out)out.innerHTML="Ouverture portail Stripe...";
    try{const data=await api("/api/billing/portal","POST",{}); if(data.url) location.href=data.url; else if(out)out.innerHTML="<pre>"+esc(JSON.stringify(data,null,2))+"</pre>"}catch(e){if(out)out.innerHTML="<pre>"+esc(e.message)+"</pre>"; alert(e.message)}
  };
  window.v95LoadAdmin=async function(){
    const out=$("v95-admin-out"); if(!out)return; out.innerHTML="Chargement admin...";
    try{const health=await api("/api/health"); const plans=await api("/api/billing/plans"); out.innerHTML="<pre>"+esc(JSON.stringify({health,plans},null,2))+"</pre>"}catch(e){out.innerHTML="<pre>"+esc(e.message)+"</pre>"}
  };
  function build(){
    if($("v95-shell"))return;
    const wrap=document.createElement("div");
    wrap.id="v95-shell"; wrap.className="v95-shell";
    wrap.innerHTML=`
    <aside class="v95-sidebar">
      <div class="v95-brand"><div class="v95-logo">G</div><div><strong>GhostSeller AI</strong><span> Clean SaaS</span></div></div>
      <div class="v95-nav-title">Utilisateur</div>
      <button class="v95-nav-btn primary" onclick="v95Show('dashboard')">🏠 Dashboard</button>
      <button class="v95-nav-btn" onclick="v95Show('content')">🤖 IA Content</button>
      <button class="v95-nav-btn" onclick="v95Show('tiktok')">🎵 TikTok Planner</button>
      <button class="v95-nav-btn" onclick="v95Show('leads')">👥 Leads</button>
      <button class="v95-nav-btn" onclick="v95Show('whatsapp')">📱 WhatsApp</button>
      <div class="v95-nav-title">Paiement</div>
      <button class="v95-nav-btn primary" onclick="v95Show('billing')">💳 Abonnement</button>
      <button class="v95-nav-btn" onclick="v95Portal()">🧾 Facturation Stripe</button>
      <div class="v95-nav-title">Compte</div>
      <button class="v95-nav-btn" onclick="v95Show('settings')">⚙️ Paramètres</button>
      <div class="v95-nav-title">Owner</div>
      <button class="v95-nav-btn admin" onclick="v95Show('admin')">👑 Dashboard Admin</button>
      <div class="v95-sidebar-footer">
        <button class="v95-logout" onclick="v95Logout()">⎋ Déconnexion sécurisée</button>
        <div style="display:flex;gap:10px;margin-top:14px;font-size:12px"><a href="/privacy" style="color:#9eadcf">Privacy</a><a href="/terms" style="color:#9eadcf">Terms</a><a href="/contact" style="color:#9eadcf">Contact</a></div>
      </div>
    </aside>
    <main class="v95-main">
      <section class="v95-page" id="v95-dashboard">
        <div class="v95-topbar"><div><h1>Dashboard utilisateur</h1><p>Les fonctions essentielles sont visibles directement.</p></div><div class="v95-pill">SaaS prêt au lancement</div></div>
        <div class="v95-grid">
          <div class="v95-card"><h2>🎵 TikTok</h2><p>App TikTok en review. Connexion Connexion préparée.</p><button class="v95-cta v95-secondary" onclick="v95Show('tiktok')">Ouvrir TikTok</button></div>
          <div class="v95-card"><h2>💳 Abonnement</h2><p>Starter, Pro et Agency branchés à Stripe.</p><button class="v95-cta" onclick="v95Show('billing')">Gérer abonnement</button></div>
          <div class="v95-card"><h2>🤖 IA Content</h2><p>Création de posts, scripts et campagnes.</p><button class="v95-cta v95-secondary" onclick="v95Show('content')">Créer contenu</button></div>
          <div class="v95-card"><h2>👥 Leads</h2><p>Prospects et workflows WhatsApp.</p><button class="v95-cta v95-secondary" onclick="v95Show('leads')">Voir leads</button></div>
        </div>
      </section>
      <section class="v95-page v95-hidden" id="v95-billing">
        <div class="v95-topbar"><div><h1>Abonnement</h1><p>Choisis ton plan. Les boutons ouvrent Paiement sécurisé.</p></div><button class="v95-cta v95-secondary" onclick="v95LoadBilling()">Rafraîchir</button></div>
        <div class="v95-grid">
          <div class="v95-card"><h2>Starter</h2><div class="v95-price">9,99€</div><p>300 crédits/mois, 100 posts IA, 5 projets.</p><button class="v95-cta" onclick="v95Checkout('starter')">S'abonner Starter</button></div>
          <div class="v95-card"><h2>Pro</h2><div class="v95-price">29,99€</div><p>1500 crédits/mois, 500 posts IA, 25 projets.</p><button class="v95-cta" onclick="v95Checkout('pro')">S'abonner Pro</button></div>
          <div class="v95-card"><h2>Agency</h2><div class="v95-price">79,99€</div><p>5000 crédits/mois, 2000 posts IA, 100 projets.</p><button class="v95-cta" onclick="v95Checkout('agency')">S'abonner Agency</button></div>
        </div>
        <div class="v95-card v95-output" style="margin-top:14px"><h2>Statut abonnement</h2><button class="v95-cta v95-secondary" onclick="v95Portal()">Portail client Stripe</button><div id="v95-billing-action" style="margin-top:12px"></div><div id="v95-billing-out" style="margin-top:12px"></div></div>
      </section>
      <section class="v95-page v95-hidden" id="v95-admin"><div class="v95-topbar"><div><h1>Dashboard Admin</h1><p>Zone owner pour vérifier l'état du SaaS.</p></div><span class="v95-admin-badge">OWNER</span></div><div class="v95-grid"><div class="v95-card"><h2>✅ Santé SaaS</h2><p>API health et modules actifs.</p></div><div class="v95-card"><h2>💳 Stripe</h2><p>Plans configurés et endpoints actifs.</p></div><div class="v95-card"><h2>🎵 TikTok</h2><p>App soumise en review.</p></div></div><div class="v95-card v95-output" style="margin-top:14px"><h2>Diagnostic</h2><div id="v95-admin-out"></div></div></section>
      <section class="v95-page v95-hidden" id="v95-content"><div class="v95-topbar"><div><h1>IA Content</h1><p>Création de contenu marketing.</p></div></div><div class="v95-card"><p>Module prêt à connecter aux générateurs existants.</p></div></section>
      <section class="v95-page v95-hidden" id="v95-tiktok"><div class="v95-topbar"><div><h1>TikTok Planner</h1><p>Connexion TikTok et workflows de contenu.</p></div></div><div class="v95-card"><button class="v95-cta">Connecter TikTok</button><p>En attente de validation TikTok Developer.</p></div></section>
      <section class="v95-page v95-hidden" id="v95-leads"><div class="v95-topbar"><div><h1>Leads</h1><p>Gestion des prospects.</p></div></div><div class="v95-card"><p>Module leads prêt pour WhatsApp et acquisition.</p></div></section>
      <section class="v95-page v95-hidden" id="v95-whatsapp"><div class="v95-topbar"><div><h1>WhatsApp</h1><p>Préparation commerciale.</p></div></div><div class="v95-card"><p>Module WhatsApp à brancher après validation des workflows.</p></div></section>
      <section class="v95-page v95-hidden" id="v95-settings"><div class="v95-topbar"><div><h1>Paramètres</h1><p>Compte, sécurité et préférences.</p></div></div><div class="v95-card"><button class="v95-logout" onclick="v95Logout()">Déconnexion sécurisée</button></div></section>
    </main>`;
    document.body.innerHTML=""; document.body.appendChild(wrap);
  }
  function shouldActivate(){
    const body=document.body.innerText||"";
    const login=body.includes("Connexion")&&body.includes("Créer un compte");
    const dash=body.includes("Business Command Center")||body.includes("Dashboard")||body.includes("owner")||body.includes("Revenue")||body.includes("Abonnement");
    return dash&&!login;
  }
  document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{if(shouldActivate())build()},800));
  setTimeout(()=>{if(shouldActivate())build()},2200);
})();

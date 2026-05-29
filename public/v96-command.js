(function(){
  const $=(id)=>document.getElementById(id);
  const esc=(s)=>String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
  const getToken=()=>localStorage.getItem("token")||localStorage.getItem("authToken")||localStorage.getItem("ghostseller_token")||localStorage.getItem("jwt")||"";
  async function api(url,method="GET",body){
    const headers={"Content-Type":"application/json"};
    if(getToken()) headers.Authorization="Bearer "+getToken();
    const res=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined});
    const text=await res.text(); let data;
    try{data=JSON.parse(text)}catch(e){data={raw:text}}
    if(!res.ok) throw new Error(data.error||data.message||text||"API error");
    return data;
  }

  window.v96Logout=function(){
    try{
      ["token","authToken","ghostseller_token","jwt","user","profile"].forEach(k=>localStorage.removeItem(k));
      sessionStorage.clear();
    }catch(e){}
    location.href="/";
  };

  window.v96Show=function(page){
    document.querySelectorAll(".v96-page").forEach(p=>p.classList.add("v96-hidden"));
    const el=$("v96-"+page);
    if(el) el.classList.remove("v96-hidden");
    document.querySelectorAll(".v96-nav").forEach(b=>b.classList.remove("active"));
    const btn=document.querySelector(`[data-v96-nav="${page}"]`);
    if(btn) btn.classList.add("active");
    if(page==="subscription") v96LoadBilling();
    if(page==="owner") v96LoadOwner();
  };

  window.v96LoadBilling=async function(){
    const out=$("v96-billing-status");
    if(!out) return;
    out.innerHTML="Chargement abonnement...";
    try{
      const data=await api("/api/billing/status");
      out.innerHTML="<pre>"+esc(JSON.stringify(data,null,2))+"</pre>";
    }catch(e){ out.innerHTML="<pre>"+esc(e.message)+"</pre>"; }
  };

  window.v96Checkout=async function(plan){
    const out=$("v96-checkout-out");
    if(out) out.innerHTML="Ouverture Paiement sécurisé...";
    try{
      const data=await api("/api/billing/checkout","POST",{plan});
      if(data.url) location.href=data.url;
      else if(out) out.innerHTML="<pre>"+esc(JSON.stringify(data,null,2))+"</pre>";
    }catch(e){
      if(out) out.innerHTML="<pre>"+esc(e.message)+"</pre>";
      alert(e.message);
    }
  };

  window.v96Portal=async function(){
    const out=$("v96-checkout-out")||$("v96-billing-status");
    if(out) out.innerHTML="Ouverture portail client Stripe...";
    try{
      const data=await api("/api/billing/portal","POST",{});
      if(data.url) location.href=data.url;
      else if(out) out.innerHTML="<pre>"+esc(JSON.stringify(data,null,2))+"</pre>";
    }catch(e){
      if(out) out.innerHTML="<pre>"+esc(e.message)+"</pre>";
      alert(e.message);
    }
  };

  window.v96LoadOwner=async function(){
    const out=$("v96-owner-out");
    if(!out) return;
    out.innerHTML="Diagnostic owner...";
    try{
      const health=await api("/api/health");
      const plans=await api("/api/billing/plans");
      out.innerHTML="<pre>"+esc(JSON.stringify({health,plans},null,2))+"</pre>";
    }catch(e){ out.innerHTML="<pre>"+esc(e.message)+"</pre>"; }
  };

  window.v96FakeGenerate=function(type){
    const out=$("v96-generator-output");
    if(!out) return;
    const prompt=($("v96-main-prompt")||{}).value || "Créer une campagne TikTok pour vendre un service.";
    const result={
      type,
      prompt,
      script:"Hook: Stop de poster au hasard. GhostSeller AI transforme tes idées en contenus et prospects.",
      scenes:[
        "Problème: pas de contenu régulier",
        "Solution: générateur IA",
        "Preuve: posts + leads + WhatsApp",
        "CTA: teste GhostSeller AI"
      ],
      cta:"Commencer maintenant"
    };
    out.innerHTML="<pre>"+esc(JSON.stringify(result,null,2))+"</pre>";
  };

  function userInfo(){
    let email="", name="Utilisateur";
    try{
      const u=JSON.parse(localStorage.getItem("user")||"{}");
      email=u.email||u.user?.email||"";
      name=u.name||u.full_name||u.email||"Utilisateur";
    }catch(e){}
    return {name,email};
  }

  function build(){
    if($("v96-shell")) return;
    const u=userInfo();
    const shell=document.createElement("div");
    shell.id="v96-shell";
    shell.className="v96-shell";
    shell.innerHTML=`
      <aside class="v96-sidebar">
        <div class="v96-brand">
          <div class="v96-logo">G</div>
          <div><strong>GhostSeller AI</strong><span> Command Center</span></div>
        </div>

        <div class="v96-userbox">
          <div class="name">👤 ${esc(u.name)}</div>
          <div class="email">${esc(u.email || "Compte connecté")}</div>
        </div>

        <div class="v96-section-title">Créer</div>
        <button class="v96-nav critical active" data-v96-nav="home" onclick="v96Show('home')">🚪 Porte d'entrée</button>
        <button class="v96-nav" data-v96-nav="content" onclick="v96Show('content')">🤖 Créer contenu</button>
        <button class="v96-nav" data-v96-nav="video" onclick="v96Show('video')">🎬 Vidéo TikTok</button>
        <button class="v96-nav" data-v96-nav="tiktok" onclick="v96Show('tiktok')">🎵 Connecter TikTok</button>

        <div class="v96-section-title">Vendre</div>
        <button class="v96-nav" data-v96-nav="leads" onclick="v96Show('leads')">👥 Leads</button>
        <button class="v96-nav" data-v96-nav="whatsapp" onclick="v96Show('whatsapp')">📱 WhatsApp</button>

        <div class="v96-section-title">Compte</div>
        <button class="v96-nav critical" data-v96-nav="subscription" onclick="v96Show('subscription')">💳 Abonnement</button>
        <button class="v96-nav" onclick="v96Portal()">🧾 Facturation Stripe</button>
        <button class="v96-nav" data-v96-nav="settings" onclick="v96Show('settings')">⚙️ Paramètres</button>

        <div class="v96-section-title">Owner</div>
        <button class="v96-nav owner" data-v96-nav="owner" onclick="v96Show('owner')">👑 Dashboard Owner</button>

        <button class="v96-logout" onclick="v96Logout()">⎋ Déconnexion sécurisée</button>
        <div style="display:flex;gap:10px;margin-top:14px;font-size:12px">
          <a href="/privacy" style="color:#9eadcf">Privacy</a>
          <a href="/terms" style="color:#9eadcf">Terms</a>
          <a href="/contact" style="color:#9eadcf">Contact</a>
        </div>
      </aside>

      <main class="v96-main">
        <section class="v96-page" id="v96-home">
          <div class="v96-topbar">
            <div>
              <h1>Business Command Center</h1>
              <p>La porte d'entrée claire : créer, publier, trouver des clients et gérer l'abonnement.</p>
            </div>
            <div class="v96-profile-actions">
              <span class="v96-pill">Plan: Starter</span>
              <span class="v96-pill">Crédits: 300</span>
              <button class="v96-cta secondary" onclick="v96Logout()">Déconnexion</button>
            </div>
          </div>

          <div class="v96-stats">
            <div class="v96-stat"><div class="num">300</div><div class="label">Crédits disponibles</div></div>
            <div class="v96-stat"><div class="num">100</div><div class="label">Posts IA/mois</div></div>
            <div class="v96-stat"><div class="num">5</div><div class="label">Projets</div></div>
            <div class="v96-stat"><div class="num">Review</div><div class="label">TikTok Developer</div></div>
          </div>

          <div class="v96-card big">
            <h2>Que veux-tu faire maintenant ?</h2>
            <p>Les actions importantes sont au centre. L'utilisateur ne doit plus chercher dans des menus cachés.</p>
            <textarea id="v96-main-prompt" class="v96-textarea" placeholder="Exemple : Crée une campagne TikTok pour vendre mon service à des entrepreneurs..."></textarea>
            <div class="v96-hero-actions">
              <button class="v96-action" onclick="v96Show('content')">🤖 Générer un post TikTok<small>Hook, script, CTA</small></button>
              <button class="v96-action" onclick="v96Show('video')">🎬 Générer une vidéo<small>5 scènes + sous-titres</small></button>
              <button class="v96-action" onclick="v96Show('tiktok')">🎵 Connecter TikTok<small>Connexion prêt, app en review</small></button>
              <button class="v96-action" onclick="v96Show('leads')">👥 Trouver des leads<small>Prospects et opportunités</small></button>
              <button class="v96-action" onclick="v96Show('whatsapp')">📱 WhatsApp Automation<small>Réponses et suivi</small></button>
              <button class="v96-action" onclick="v96Show('subscription')">💳 Gérer abonnement<small>Starter, Pro, Agency</small></button>
            </div>
          </div>
        </section>

        <section class="v96-page v96-hidden" id="v96-content">
          <div class="v96-topbar"><div><h1>Créer contenu</h1><p>Génère des posts TikTok, scripts et campagnes.</p></div></div>
          <div class="v96-card"><textarea id="v96-content-prompt" class="v96-textarea" placeholder="Décris ton produit ou ton idée..."></textarea><br><br><button class="v96-cta" onclick="v96FakeGenerate('content')">Générer contenu</button><div id="v96-generator-output" class="v96-output" style="margin-top:14px"></div></div>
        </section>

        <section class="v96-page v96-hidden" id="v96-video">
          <div class="v96-topbar"><div><h1>Vidéo TikTok</h1><p>Structure une vidéo courte en scènes.</p></div></div>
          <div class="v96-card"><button class="v96-cta" onclick="v96FakeGenerate('video')">Générer script vidéo 5 scènes</button><div class="v96-output" id="v96-generator-output-video" style="margin-top:14px"></div></div>
        </section>

        <section class="v96-page v96-hidden" id="v96-tiktok">
          <div class="v96-topbar"><div><h1>TikTok</h1><p>Connexion officielle TikTok. App actuellement en review.</p></div><span class="v96-pill">TikTok: In Review</span></div>
          <div class="v96-card"><h2>Connecter TikTok</h2><p>Quand TikTok valide l'application, ce bouton ouvrira le flux Connexion réel.</p><button class="v96-cta">Connecter TikTok</button></div>
        </section>

        <section class="v96-page v96-hidden" id="v96-leads">
          <div class="v96-topbar"><div><h1>Leads</h1><p>Créer une liste de prospects depuis une niche.</p></div></div>
          <div class="v96-card"><textarea class="v96-textarea" placeholder="Exemple : restaurants haïtiens à Paris, salons de coiffure, agences de voyage..."></textarea><br><br><button class="v96-cta">Trouver des leads</button></div>
        </section>

        <section class="v96-page v96-hidden" id="v96-whatsapp">
          <div class="v96-topbar"><div><h1>WhatsApp</h1><p>Prépare les messages de conversion.</p></div></div>
          <div class="v96-card"><button class="v96-cta">Générer séquence WhatsApp</button><p>Module à brancher sur les leads.</p></div>
        </section>

        <section class="v96-page v96-hidden" id="v96-subscription">
          <div class="v96-topbar"><div><h1>Abonnement</h1><p>Paiement sécurisé visible pour les utilisateurs.</p></div><button class="v96-cta secondary" onclick="v96LoadBilling()">Rafraîchir</button></div>
          <div class="v96-grid">
            <div class="v96-card"><h2>Starter</h2><div class="v96-price">9,99€</div><p>300 crédits/mois, 100 posts IA, 5 projets.</p><button class="v96-cta" onclick="v96Checkout('starter')">S'abonner Starter</button></div>
            <div class="v96-card"><h2>Pro</h2><div class="v96-price">29,99€</div><p>1500 crédits/mois, 500 posts IA, 25 projets.</p><button class="v96-cta" onclick="v96Checkout('pro')">S'abonner Pro</button></div>
            <div class="v96-card"><h2>Agency</h2><div class="v96-price">79,99€</div><p>5000 crédits/mois, 2000 posts IA, 100 projets.</p><button class="v96-cta" onclick="v96Checkout('agency')">S'abonner Agency</button></div>
          </div>
          <div class="v96-card v96-output" style="margin-top:14px"><h2>Statut</h2><button class="v96-cta secondary" onclick="v96Portal()">Portail client Stripe</button><div id="v96-checkout-out" style="margin-top:12px"></div><div id="v96-billing-status" style="margin-top:12px"></div></div>
        </section>

        <section class="v96-page v96-hidden" id="v96-settings">
          <div class="v96-topbar"><div><h1>Paramètres</h1><p>Sécurité, profil et préférences.</p></div></div>
          <div class="v96-card"><button class="v96-logout" onclick="v96Logout()">Déconnexion sécurisée</button></div>
        </section>

        <section class="v96-page v96-hidden" id="v96-owner">
          <div class="v96-topbar"><div><h1>Dashboard Owner</h1><p>Vue réservée au propriétaire du SaaS.</p></div><span class="v96-pill">OWNER</span></div>
          <div class="v96-grid">
            <div class="v96-card"><h2>💰 Revenus</h2><p>MRR, abonnements actifs et paiements Stripe.</p></div>
            <div class="v96-card"><h2>👥 Utilisateurs</h2><p>Comptes, plans et activité.</p></div>
            <div class="v96-card"><h2>🎵 TikTok</h2><p>App en review, scopes soumis.</p></div>
            <div class="v96-card"><h2>⚙️ Système</h2><p>Espace sécurisé, IA Marketing, Stripe, logs.</p></div>
          </div>
          <div class="v96-card v96-output" style="margin-top:14px"><h2>Diagnostic</h2><button class="v96-cta secondary" onclick="v96LoadOwner()">Charger diagnostic</button><div id="v96-owner-out" style="margin-top:12px"></div></div>
        </section>
      </main>
    `;
    document.body.innerHTML="";
    document.body.appendChild(shell);
  }

  function shouldActivate(){
    const body=document.body.innerText||"";
    const login=body.includes("Connexion")&&body.includes("Créer un compte");
    const dash=body.includes("Business Command Center")||body.includes("Dashboard")||body.includes("owner")||body.includes("Abonnement")||body.includes("Revenue");
    return dash && !login;
  }

  document.addEventListener("DOMContentLoaded",()=>setTimeout(()=>{if(shouldActivate())build()},700));
  setTimeout(()=>{if(shouldActivate())build()},1800);
})();

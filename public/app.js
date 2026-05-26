let token=localStorage.getItem("ghost_v28_token");
let dashboard={projects:[],posts:[],leads:[],videos:[]};

async function api(url,method="GET",body=null,auth=true){
  const headers={"Content-Type":"application/json"};
  if(auth&&token) headers.Authorization=`Bearer ${token}`;
  const res=await fetch(url,{method,headers,body:body?JSON.stringify(body):undefined});
  const data=await res.json();
  if(!res.ok){ alert(data.error||"Erreur"); throw new Error(data.error||"Erreur"); }
  return data;
}
function val(id){return document.getElementById(id).value.trim();}
function esc(s){return String(s||"").replace(/[&<>'"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#039;",'"':"&quot;"}[m]));}

async function register(){
  const data=await api("/api/auth/register","POST",{name:val("name"),email:val("email"),password:val("password")},false);
  token=data.token; localStorage.setItem("ghost_v28_token",token); await boot();
}
async function login(){
  const data=await api("/api/auth/login","POST",{email:val("email"),password:val("password")},false);
  token=data.token; localStorage.setItem("ghost_v28_token",token); await boot();
}
async function resetPassword(){
  const email=val("email"), newPassword=prompt("Nouveau mot de passe");
  if(!email||!newPassword) return;
  const data=await api("/api/auth/reset-password","POST",{email,newPassword},false);
  alert(data.message);
}
function logout(){localStorage.removeItem("ghost_v28_token");location.reload();}
function show(id){document.querySelectorAll("main section").forEach(s=>s.classList.add("hidden"));document.getElementById(id).classList.remove("hidden");}

async function boot(){
  try{
    const me=await api("/api/auth/me");
    document.getElementById("auth").classList.add("hidden");
    document.getElementById("app").classList.remove("hidden");
    document.getElementById("welcome").innerText=`Bienvenue ${me.user.name} • ${me.user.email} • rôle: ${me.user.role}`;
    await loadDashboard();
    await health();
  }catch(e){localStorage.removeItem("ghost_v28_token");}
}
async function loadDashboard(){
  dashboard=await api("/api/projects/dashboard");
  document.getElementById("projectsCount").innerText=dashboard.projects.length;
  document.getElementById("postsCount").innerText=dashboard.posts.length;
  document.getElementById("leadsCount").innerText=dashboard.leads.length;
  document.getElementById("videosCount").innerText=dashboard.videos.length;
  renderProjects(); fillProjectSelects();
}
async function createProject(){
  await api("/api/projects","POST",{name:val("projectName"),description:val("projectDescription")});
  document.getElementById("projectName").value="";
  document.getElementById("projectDescription").value="";
  await loadDashboard();
  show("projects");
}
function renderProjects(){
  document.getElementById("projectList").innerHTML=dashboard.projects.length
    ? dashboard.projects.map(p=>`<div class="item"><h3>${esc(p.name)}</h3><p>${esc(p.description)}</p></div>`).join("")
    : "<p>Aucun projet.</p>";
}
async function health(){
  const data=await api("/api/health","GET",null,false);
  document.getElementById("healthOut").textContent=JSON.stringify(data,null,2);
}
async function loadAdmin(){
  const data=await api("/api/admin/stats");
  document.getElementById("adminOut").textContent=JSON.stringify(data,null,2);
}
async function loadUsers(){
  const data=await api("/api/admin/users");
  document.getElementById("usersList").innerHTML=data.users.map(u=>`<div class="item"><b>${esc(u.name)}</b><p>${esc(u.email)} • ${esc(u.role)} • ${esc(u.plan)} • ${esc(u.credits)} crédits</p></div>`).join("");
}
if(token) boot();

async function loadBilling(){
  try{
    const data = await api("/api/billing/plans");
    document.getElementById("billingStatus").innerHTML =
      `<h2>Plan actuel</h2><p>${esc(data.currentPlan)} • ${esc(data.credits)} crédits</p><p>Stripe: ${data.stripeConfigured ? "connecté" : "non configuré"}</p>`;

    document.getElementById("plans").innerHTML = Object.values(data.plans).map(p => `
      <div class="plan ${p.name==="Starter" ? "best" : ""}">
        <h2>${esc(p.name)}</h2>
        <div class="price">${esc(p.price)}</div>
        <p>${esc(p.description || "")}</p>
        <p><b>${esc(p.credits)}</b> crédits / mois</p>
        ${p.name==="Free"
          ? `<button onclick="demoUpgrade('Free')">Activer Free</button>`
          : `<button onclick="checkout('${p.name}')">Payer avec Stripe</button><button onclick="demoUpgrade('${p.name}')">Mode test ${p.name}</button>`
        }
      </div>
    `).join("");
  }catch(e){}
}

async function checkout(plan){
  const data = await api("/api/billing/checkout","POST",{plan});
  if(data.url) window.location.href = data.url;
}

async function demoUpgrade(plan){
  const data = await api("/api/billing/demo-upgrade","POST",{plan});
  alert(data.message);
  await boot();
  show("billing");
  await loadBilling();
}

function fillProjectSelects(){
  const select = document.getElementById("tiktokProject");
  if(!select) return;
  select.innerHTML = dashboard.projects.length
    ? dashboard.projects.map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join("")
    : `<option value="">Crée un projet d'abord</option>`;
}

async function generateTikTok(){
  const btn = document.getElementById("tiktokBtn");
  btn.disabled = true;
  btn.innerText = "Génération IA...";
  try{
    const data = await api("/api/tiktok/generate","POST",{
      projectId: val("tiktokProject"),
      product: val("tiktokProduct"),
      audience: val("tiktokAudience"),
      offer: val("tiktokOffer"),
      days: Number(val("tiktokDays")),
      style: val("tiktokStyle")
    });

    await loadDashboard();
    document.getElementById("tiktokOutput").innerHTML = data.posts.map(p=>`
      <div class="item">
        <h3>${esc(p.title)}</h3>
        <p><b>${esc(p.date)} • ${esc(p.time)}</b></p>
        <p><b>Hook:</b> ${esc(p.hook)}</p>
        <p><b>Caption:</b> ${esc(p.caption)}</p>
        <pre>${esc(p.script)}</pre>
        <p>${esc(p.hashtags)}</p>
      </div>
    `).join("");
  }finally{
    btn.disabled = false;
    btn.innerText = "Générer posts TikTok";
  }
}

async function scanTrends(){
  const btn = document.getElementById("trendBtn");
  btn.disabled = true;
  btn.innerText = "Scan IA...";
  try{
    const data = await api("/api/trends/scan","POST",{
      niche: val("trendNiche"),
      country: val("trendCountry"),
      audience: val("trendAudience"),
      goal: val("trendGoal")
    });

    await loadDashboard();

    document.getElementById("trendOutput").innerHTML = data.trends.map(t=>`
      <div class="item">
        <h3>${esc(t.title)}</h3>
        <p><b>Score viral:</b> ${esc(t.viral_score)}/100</p>
        <p><b>Pourquoi:</b> ${esc(t.reason)}</p>
        <p><b>Angle vidéo:</b> ${esc(t.content_angle)}</p>
        <p><b>CTA:</b> ${esc(t.cta)}</p>
        <p>${esc(t.hashtags)}</p>
      </div>
    `).join("");
  }finally{
    btn.disabled = false;
    btn.innerText = "Scanner les tendances";
  }
}

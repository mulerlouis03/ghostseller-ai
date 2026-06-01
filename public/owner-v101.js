let OWNER_DATA={users:[],billing:[],feedback:[],summary:{}};

function getToken(){
  return localStorage.getItem("token") || localStorage.getItem("authToken") ||
    localStorage.getItem("ghostseller_token") || localStorage.getItem("jwt") || "";
}

function esc(s){
  return String(s ?? "").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[m]));
}

async function api(url){
  const headers={"Content-Type":"application/json"};
  const token=getToken();
  if(token) headers.Authorization="Bearer "+token;
  const res=await fetch(url,{headers});
  const text=await res.text();
  let data;
  try{data=JSON.parse(text)}catch(e){data={raw:text}}
  if(!res.ok) throw new Error(data.error||data.message||text);
  return data;
}

function setTab(id){
  document.querySelectorAll(".page").forEach(p=>p.classList.add("hidden"));
  document.getElementById(id)?.classList.remove("hidden");
  document.querySelectorAll(".nav").forEach(n=>n.classList.remove("active"));
  document.querySelector(`.nav[data-tab="${id}"]`)?.classList.add("active");
  if(id==="users") renderUsers();
}

function niceDate(v){
  if(!v) return "";
  try{
    const d=new Date(v);
    if(isNaN(d.getTime())) return v;
    return d.toLocaleString("fr-FR");
  }catch(e){return v}
}

function renderUsers(){
  const q=(document.getElementById("userSearch")?.value || "").toLowerCase().trim();
  let users=OWNER_DATA.users || [];
  if(q){
    users=users.filter(u => String(u.name||"").toLowerCase().includes(q) || String(u.email||"").toLowerCase().includes(q));
  }
  const target=document.getElementById("usersTable");
  if(!target) return;
  if(!users.length){
    target.innerHTML="<p style='padding:14px;color:#9caed2'>Aucun utilisateur trouvé.</p>";
    return;
  }
  target.innerHTML=`<table>
    <thead><tr><th>Nom</th><th>Email</th><th>Plan</th><th>Statut</th><th>Rôle</th><th>Inscription</th><th>Dernière activité</th></tr></thead>
    <tbody>${users.map(u=>`<tr>
      <td><b>${esc(u.name||"Utilisateur")}</b></td>
      <td>${esc(u.email||"")}</td>
      <td><span class="badgePlan">${esc(u.plan||"Gratuit")}</span></td>
      <td>${esc(u.status||"Actif")}</td>
      <td>${esc(u.role||"user")}</td>
      <td>${esc(niceDate(u.created_at))}</td>
      <td>${esc(niceDate(u.last_login))}</td>
    </tr>`).join("")}</tbody></table>`;
}

function makeTable(rows, cols){
  if(!rows || !rows.length) return "<p style='padding:14px;color:#9caed2'>Aucune donnée.</p>";
  return `<table><thead><tr>${cols.map(c=>`<th>${esc(c.label)}</th>`).join("")}</tr></thead><tbody>${
    rows.map(r=>`<tr>${cols.map(c=>`<td>${esc(r[c.key]||"")}</td>`).join("")}</tr>`).join("")
  }</tbody></table>`;
}

async function loadOwner(){
  const diag=document.getElementById("diagOut");
  diag.textContent="Chargement...";
  try{
    const data=await api("/api/owner-console/overview");
    OWNER_DATA=data;
    document.getElementById("totalUsers").textContent=data.summary?.total_users ?? 0;
    document.getElementById("newToday").textContent=data.summary?.new_today ?? 0;
    document.getElementById("activeSubs").textContent=data.summary?.active_subscriptions ?? 0;
    document.getElementById("feedbackCount").textContent=data.summary?.feedback_count ?? 0;

    renderUsers();

    document.getElementById("billingTable").innerHTML=makeTable(data.billing||[],[
      {key:"email",label:"Email"},{key:"plan",label:"Plan"},{key:"status",label:"Statut"},{key:"updated_at",label:"Mise à jour"}
    ]);
    document.getElementById("feedbackTable").innerHTML=makeTable(data.feedback||[],[
      {key:"name",label:"Nom"},{key:"email",label:"Email"},{key:"rating",label:"Type"},{key:"message",label:"Message"},{key:"created_at",label:"Date"}
    ]);
    diag.textContent=JSON.stringify(data.summary,null,2);
  }catch(e){
    diag.textContent=e.message + "\\n\\nSi tu vois 'Owner only', vérifie OWNER_EMAIL dans Vercel.";
  }
}

function logout(){
  ["token","authToken","ghostseller_token","jwt","user","profile","session"].forEach(k=>{
    try{localStorage.removeItem(k)}catch(e){}
    try{sessionStorage.removeItem(k)}catch(e){}
  });
  location.href="/";
}

document.querySelectorAll(".nav[data-tab]").forEach(btn=>btn.addEventListener("click",()=>setTab(btn.dataset.tab)));
document.querySelectorAll("[data-open]").forEach(btn=>btn.addEventListener("click",()=>setTab(btn.dataset.open)));
document.getElementById("openUsersBtn")?.addEventListener("click",()=>setTab("users"));
document.getElementById("refreshBtn")?.addEventListener("click",loadOwner);
document.getElementById("logoutBtn")?.addEventListener("click",logout);
document.getElementById("topLogoutBtn")?.addEventListener("click",logout);
document.getElementById("userSearch")?.addEventListener("input",renderUsers);

loadOwner();


/* V118 Owner identity display */
function renderOwnerIdentityV118(){
  try{
    const data = window.OWNER_DATA || OWNER_DATA || {};
    const owner = (data.owner_accounts && data.owner_accounts[0]) || {
      name:"Muler Louis",
      email:"mulerlouis03@gmail.com",
      role:"owner",
      plan:"Owner",
      credits:"Illimités",
      stripe_status:"Exempt"
    };
    const emailEl=document.getElementById("ownerEmailText");
    if(emailEl) emailEl.textContent=owner.email || "mulerlouis03@gmail.com";
  }catch(e){}
}
setInterval(renderOwnerIdentityV118,1200);

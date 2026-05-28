let currentUser = null;

function qs(id){ return document.getElementById(id); }
function val(id){ return qs(id)?.value?.trim() || ""; }
function esc(s){
  return String(s ?? "").replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"
  }[m]));
}
function token(){ return localStorage.getItem("ghostseller_token"); }
function setMsg(msg, good=false){
  const el = qs("authMsg");
  if(!el) return;
  el.className = good ? "msg good" : "msg bad";
  el.textContent = msg;
}

async function api(path, method="GET", body=null, auth=true){
  const headers = {"Content-Type":"application/json"};
  if(auth && token()) headers.Authorization = "Bearer " + token();

  const res = await fetch(path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null
  });

  const text = await res.text();
  let data = {};
  try { data = text ? JSON.parse(text) : {}; } catch { data = { raw:text }; }

  if(!res.ok){
    throw new Error(data.error || data.message || "Erreur API");
  }

  return data;
}

async function register(){
  try{
    const data = await api("/api/auth/register","POST",{
      name: val("name"),
      email: val("email"),
      password: val("password")
    }, false);

    localStorage.setItem("ghostseller_token", data.token);
    currentUser = data.user;
    setMsg("Compte créé.", true);
    showApp();
  }catch(e){
    setMsg(e.message);
  }
}

async function login(){
  try{
    const data = await api("/api/auth/login","POST",{
      email: val("email"),
      password: val("password")
    }, false);

    localStorage.setItem("ghostseller_token", data.token);
    currentUser = data.user;
    setMsg("Connexion réussie.", true);
    showApp();
  }catch(e){
    setMsg(e.message);
  }
}

async function forgotPassword(){
  try{
    const email = val("email");
    if(!email) return setMsg("Entre ton email d'abord.");
    const data = await api("/api/auth/forgot-password","POST",{email},false);
    setMsg(data.message || "Email envoyé si le compte existe.", true);
  }catch(e){
    setMsg(e.message);
  }
}

async function showApp(){
  qs("authView").classList.add("hidden");
  qs("appView").classList.remove("hidden");

  try{
    const data = await api("/api/auth/me");
    currentUser = data.user || currentUser;
  }catch(e){}

  updateUserUI();
  if(!currentUser?.onboarding_completed && !["owner","admin"].includes(currentUser?.role || "user")) show("onboarding");
  else show("dashboard");
}

function updateUserUI(){
  const u = currentUser || {};
  qs("userLine").textContent = `Bienvenue ${u.name || ""} • ${u.email || ""} • rôle: ${u.role || "user"}`;
  qs("statPlan").textContent = u.plan || "Free";
  qs("statCredits").textContent = u.credits ?? 0;
  qs("statRole").textContent = u.role || "user";
  qs("statStatus").textContent = "stable";
}

function show(id){
  document.querySelectorAll(".page").forEach(p => p.classList.add("hidden"));
  qs(id)?.classList.remove("hidden");
}

function logout(){
  localStorage.removeItem("ghostseller_token");
  location.reload();
}

async function generateContent(){
  const out = qs("contentOut");
  out.innerHTML = "<div class='card'>Génération...</div>";

  try{
    const data = await api("/api/content/generate","POST",{
      niche: val("contentNiche"),
      platform: val("contentPlatform"),
      tone: val("contentTone"),
      goal: val("contentGoal")
    });

    const r = data.result || data;

    out.innerHTML = `
      <div class="card">
        <span class="badge">Viral Score ${esc(r.viral_score || "-")}</span>
        <h2>${esc(r.hook || "Generated content")}</h2>

        <div class="grid2">
          <div class="item">
            <h3>Psychology</h3>
            <p><b>Angle:</b> ${esc(r.psychological_angle || "-")}</p>
            <p><b>Emotion:</b> ${esc(r.dominant_emotion || "-")}</p>
          </div>

          <div class="item">
            <h3>CTA</h3>
            <p>${esc(r.cta || "-")}</p>
            <p><b>Thumbnail:</b> ${esc(r.thumbnail_idea || "-")}</p>
          </div>
        </div>

        <div class="item">
          <h3>TikTok Script</h3>
          <pre>${esc(JSON.stringify(r.tiktok_version || {}, null, 2))}</pre>
        </div>

        <div class="item">
          <h3>Instagram Version</h3>
          <pre>${esc(JSON.stringify(r.instagram_version || {}, null, 2))}</pre>
        </div>

        <div class="item">
          <h3>WhatsApp Version</h3>
          <pre>${esc(JSON.stringify(r.whatsapp_version || {}, null, 2))}</pre>
        </div>

        <div class="item">
          <h3>Hashtags</h3>
          <pre>${esc(JSON.stringify(r.hashtags || [], null, 2))}</pre>
        </div>
      </div>
    `;
  }catch(e){
    out.innerHTML = `<div class="card error">${esc(e.message)}</div>`;
  }
}

async function checkout(plan){
  try{
    const data = await api("/api/billing/checkout","POST",{plan});
    if(data.url) location.href = data.url;
    else alert("Checkout non disponible.");
  }catch(e){
    alert(e.message);
  }
}

async function loadLaunch(){
  try{
    const data = await api("/api/analytics/launch");
    qs("launchOut").innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    qs("launchOut").innerHTML = `<p class="error">${esc(e.message)}. Vérifie que ton compte est owner.</p>`;
  }
}

async function loadSecurity(){
  try{
    const data = await api("/api/security/status");
    qs("securityOut").innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    qs("securityOut").innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadHealth(){
  try{
    const data = await api("/api/health","GET",null,false);
    qs("healthOut").innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    qs("healthOut").innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

(async function boot(){
  if(token()){
    try{
      const data = await api("/api/auth/me");
      currentUser = data.user;
      showApp();
    }catch(e){
      localStorage.removeItem("ghostseller_token");
      qs("authView").classList.remove("hidden");
      qs("appView").classList.add("hidden");
    }
  }
})();


async function completeOnboarding(){
  const out = qs("onboardingMsg");
  out.className = "msg";
  out.textContent = "Sauvegarde...";

  try{
    const data = await api("/api/onboarding/complete","POST",{
      business_type: val("businessType"),
      main_goal: val("mainGoal"),
      main_platform: val("mainPlatform")
    });

    currentUser = data.user || currentUser;
    out.className = "msg good";
    out.textContent = "Onboarding terminé.";
    updateUserUI();
    setTimeout(()=>show("dashboard"),600);
  }catch(e){
    out.className = "msg bad";
    out.textContent = e.message;
  }
}


async function loadNiches(){
  const out = qs("nichesOut");
  out.innerHTML = "<div class='card'>Chargement...</div>";

  try{
    const data = await api("/api/niches/global","GET",null,false);

    out.innerHTML = `
      <div class="card">
        <pre>${esc(JSON.stringify(data,null,2))}</pre>
      </div>
    `;
  }catch(e){
    out.innerHTML = `<div class="card error">${esc(e.message)}</div>`;
  }
}

async function detectNiche(){
  const out = qs("detectOut");
  out.innerHTML = "<div class='card'>Analyse...</div>";

  try{
    const data = await api("/api/niches/detect","POST",{
      business: val("detectBusiness"),
      keywords: val("detectKeywords")
    }, false);

    out.innerHTML = `
      <div class="card">
        <pre>${esc(JSON.stringify(data,null,2))}</pre>
      </div>
    `;
  }catch(e){
    out.innerHTML = `<div class="card error">${esc(e.message)}</div>`;
  }
}

async function loadBrain(){
  try{
    const profileData=await api("/api/brain/profile");
    const historyData=await api("/api/brain/history");
    const profile=profileData.profile||{};
    qs("brainTotal").textContent=profile.total_generations??0;
    qs("brainFav").textContent=profile.favorite_count??0;
    qs("brainNiche").textContent=profile.top_niches?.[0]?.[0]||"-";
    qs("brainPlatform").textContent=profile.top_platforms?.[0]?.[0]||"-";
    qs("brainProfile").innerHTML=`<pre>${esc(JSON.stringify(profile,null,2))}</pre>`;
    const history=historyData.history||[];
    qs("brainHistory").innerHTML=history.length?history.map(item=>`
      <div class="item">
        <h3>${esc(item.niche||"Sans niche")} • ${esc(item.platform||"Global")}</h3>
        <p>${esc(item.type||"content")} • ${new Date(item.created_at).toLocaleString()}</p>
        <pre>${esc(JSON.stringify(item.result||item.prompt||{},null,2))}</pre>
        <button onclick="favoriteBrain('${item.id}', ${!item.favorite})">${item.favorite?"Retirer favori":"Mettre en favori"}</button>
      </div>`).join(""):"<p>Aucun historique pour l'instant.</p>";
  }catch(e){qs("brainHistory").innerHTML=`<p class="error">${esc(e.message)}</p>`;}
}
async function saveBrainNote(){
  const msg=qs("brainSaveMsg"); msg.textContent="Sauvegarde...";
  try{
    await api("/api/brain/save","POST",{type:"manual_note",niche:val("brainNicheInput"),platform:val("brainPlatformInput"),prompt:"manual",result:{text:val("brainResultInput")},favorite:false});
    msg.className="msg good"; msg.textContent="Sauvegardé."; await loadBrain();
  }catch(e){msg.className="msg bad";msg.textContent=e.message;}
}
async function favoriteBrain(id,favorite){
  await api(`/api/brain/favorite/${id}`,"POST",{favorite});
  await loadBrain();
}


async function analyzeCreative(){
  const out = qs("creativeConcepts");
  out.innerHTML = "<div class='card'>Analyzing...</div>";

  try{
    const data = await api("/api/creative/analyze","POST",{
      description: val("creativeDescription")
    }, false);

    const concepts = data.concepts || [];

    out.innerHTML = concepts.map(c => `
      <div class="item">
        <h3>${esc(c.style)}</h3>
        <p><b>Mood:</b> ${esc(c.mood)}</p>
        <p><b>Editing:</b> ${esc(c.editing)}</p>
        <p><b>Music:</b> ${esc(c.music)}</p>
        <p><b>Hook:</b> ${esc(c.hook)}</p>
        <button onclick="selectCreativeStyle('${esc(c.style)}')">Select style</button>
      </div>
    `).join("");

  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

function selectCreativeStyle(style){
  qs("selectedCreativeStyle").value = style;
}

async function generateCreative(){
  const out = qs("creativeResult");
  out.innerHTML = "<div class='card'>Generating...</div>";

  try{
    const data = await api("/api/creative/generate","POST",{
      description: val("creativeDescription"),
      selected_style: val("selectedCreativeStyle"),
      platform: val("creativePlatform")
    }, false);

    out.innerHTML = `
      <div class="card">
        <span class="badge">${esc(data.result.selected_style)}</span>
        <h2>${esc(data.result.hook)}</h2>

        <div class="item">
          <h3>Scenes</h3>
          <pre>${esc(JSON.stringify(data.result.scenes,null,2))}</pre>
        </div>

        <div class="item">
          <h3>Transitions</h3>
          <pre>${esc(JSON.stringify(data.result.transitions,null,2))}</pre>
        </div>

        <div class="item">
          <h3>Voice Over</h3>
          <pre>${esc(JSON.stringify(data.result.voice_over,null,2))}</pre>
        </div>

        <div class="item">
          <h3>Video Prompt</h3>
          <pre>${esc(data.result.video_prompt)}</pre>
        </div>

        <div class="item">
          <h3>CTA</h3>
          <p>${esc(data.result.cta)}</p>
        </div>
      </div>
    `;

  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function generateVideoPipeline(){
  const out = qs("videoResult");
  out.innerHTML = "<div class='card'>Generating video pipeline...</div>";

  try{
    const data = await api("/api/video/pipeline","POST",{
      idea: val("videoIdea"),
      platform: val("videoPlatform"),
      style: val("videoStyle"),
      audience: val("videoAudience"),
      goal: val("videoGoal"),
      duration: val("videoDuration") || 30
    }, false);

    const r = data.result;

    out.innerHTML = `
      <div class="card">
        <span class="badge">${esc(r.platform)} • ${esc(r.format)}</span>
        <h2>${esc(r.production_summary)}</h2>

        <div class="item">
          <h3>Storyboard</h3>
          <pre>${esc(JSON.stringify(r.storyboard,null,2))}</pre>
        </div>

        <div class="grid2">
          <div class="item">
            <h3>Voice Direction</h3>
            <pre>${esc(JSON.stringify(r.voice_direction,null,2))}</pre>
          </div>

          <div class="item">
            <h3>Music Direction</h3>
            <pre>${esc(JSON.stringify(r.music_direction,null,2))}</pre>
          </div>
        </div>

        <div class="item">
          <h3>Subtitles</h3>
          <pre>${esc(JSON.stringify(r.subtitles,null,2))}</pre>
        </div>

        <div class="item">
          <h3>Editing Notes</h3>
          <pre>${esc(JSON.stringify(r.editing_notes,null,2))}</pre>
        </div>

        <div class="item">
          <h3>Export Pack</h3>
          <pre>${esc(JSON.stringify(r.export_pack,null,2))}</pre>
        </div>
      </div>
    `;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function buildGrowthPlan(){
  const out = qs("growthPlanOut");
  out.innerHTML = "<div class='card'>Building growth plan...</div>";

  try{
    const data = await api("/api/growth/plan","POST",{
      product: val("growthProduct"),
      target: val("growthTarget"),
      goal: val("growthGoal"),
      market: val("growthMarket")
    });

    out.innerHTML = `
      <div class="card">
        <span class="badge">Autopilot Growth Plan</span>
        <h2>${esc(data.plan.positioning)}</h2>
        <div class="item"><h3>Best Channels</h3><pre>${esc(JSON.stringify(data.plan.best_channels,null,2))}</pre></div>
        <div class="item"><h3>Campaign Angles</h3><pre>${esc(JSON.stringify(data.plan.campaign_angles,null,2))}</pre></div>
        <div class="item"><h3>7-Day Launch Plan</h3><pre>${esc(JSON.stringify(data.plan.seven_day_launch_plan,null,2))}</pre></div>
        <div class="item"><h3>DM Templates</h3><pre>${esc(JSON.stringify(data.plan.dm_templates,null,2))}</pre></div>
        <div class="item"><h3>Self-Promo Posts</h3><pre>${esc(JSON.stringify(data.plan.self_promo_posts,null,2))}</pre></div>
      </div>
    `;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadDailyGrowth(){
  const out = qs("dailyGrowthOut");
  out.innerHTML = "Loading...";

  try{
    const data = await api("/api/growth/daily");
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function scoreProspect(){
  const out = qs("prospectOut");
  out.innerHTML = "Scoring...";

  try{
    const data = await api("/api/growth/prospect-score","POST",{
      business: val("prospectBusiness"),
      audience: val("prospectAudience"),
      activity: val("prospectActivity")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadOSDashboard(){
  const out = qs("osDashboardOut");
  out.innerHTML = "Loading...";

  try{
    const data = await api("/api/os/dashboard");

    qs("osGrowthScore").textContent = data.dashboard.growth_score;
    qs("osContentCount").textContent = data.dashboard.generated_content;
    qs("osCampaigns").textContent = data.dashboard.campaigns;
    qs("osLeads").textContent = data.dashboard.leads_estimation;

    out.innerHTML = `<pre>${esc(JSON.stringify(data.dashboard,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function generateCalendar(){
  const out = qs("osCalendarOut");
  out.innerHTML = "Generating...";

  try{
    const data = await api("/api/os/calendar","POST",{
      niche: val("osNiche"),
      platform: val("osPlatform"),
      days: val("osDays")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.calendar,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function generatePipeline(){
  const out = qs("pipelineOut");
  out.innerHTML = "Generating...";

  try{
    const data = await api("/api/os/lead-pipeline","POST",{
      niche: val("pipelineNiche")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.pipeline,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function createAITask(){
  const out = qs("taskOut");
  out.innerHTML = "Creating...";

  try{
    const data = await api("/api/os/task","POST",{
      title: val("taskTitle"),
      priority: val("taskPriority")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.task,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadRecommendations(){
  const out = qs("recommendationsOut");
  out.innerHTML = "Loading...";

  try{
    const data = await api("/api/os/recommendations");

    out.innerHTML = `<pre>${esc(JSON.stringify(data.recommendations,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

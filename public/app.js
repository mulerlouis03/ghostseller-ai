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
  const headers = {"Content-Type":"application/json","X-GhostSeller-Language":localStorage.getItem("ghostseller_language") || "fr"};
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
    try{ await api("/api/emails/welcome","POST",{language:localStorage.getItem("ghostseller_language") || "fr"}); }catch(_e){}
  }catch(e){
    setMsg(e.message || "Erreur API détaillée indisponible.");
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
    setMsg(e.message || "Erreur API détaillée indisponible.");
  }
}

async function forgotPassword(){
  try{
    const email = val("email");
    if(!email) return setMsg("Entre ton email d'abord.");
    const data = await api("/api/auth/forgot-password","POST",{email},false);
    setMsg(data.message || "Email envoyé si le compte existe.", true);
  }catch(e){
    setMsg(e.message || "Erreur API détaillée indisponible.");
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
  try{ loadUsage(); }catch(e){}
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
    const data = await api("/api/revenue/checkout","POST",{plan});
    if(data.url) location.href = data.url;
    else alert(data.message || "Checkout non disponible.");
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
  try{ loadUsage(); }catch(e){}
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


async function saveCMOGoal(){
  const out = qs("cmoGoalsOut");
  out.innerHTML = "Saving...";
  try{
    const data = await api("/api/cmo/goal","POST",{
      goal: val("cmoGoal"),
      niche: val("cmoNiche"),
      platform: val("cmoPlatform"),
      budget: val("cmoBudget")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.goal,null,2))}</pre>`;
  }catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}

async function loadCMOGoals(){
  const out = qs("cmoGoalsOut");
  out.innerHTML = "Loading...";
  try{
    const data = await api("/api/cmo/goals");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.goals,null,2))}</pre>`;
  }catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}

async function generateDailyPlan(){
  const out = qs("dailyPlanOut");
  out.innerHTML = "Generating...";
  try{
    const data = await api("/api/cmo/daily-plan","POST",{
      goal: val("cmoGoal"),
      niche: val("cmoNiche"),
      platform: val("cmoPlatform")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.plan,null,2))}</pre>`;
  }catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}

async function createRecurringCampaign(){
  const out = qs("campaignOut");
  out.innerHTML = "Creating...";
  try{
    const data = await api("/api/cmo/recurring-campaign","POST",{
      campaign_name: val("campaignName"),
      niche: val("campaignNiche"),
      platform: val("campaignPlatform"),
      frequency: val("campaignFrequency")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.campaign,null,2))}</pre>`;
  }catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}

async function scoreContent(){
  const out = qs("scoreOut");
  out.innerHTML = "Scoring...";
  try{
    const data = await api("/api/cmo/score-content","POST",{
      hook: val("scoreHook"),
      cta: val("scoreCTA"),
      platform: val("scorePlatform")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}

async function loadNextActions(){
  const out = qs("nextActionsOut");
  out.innerHTML = "Loading...";
  try{
    const data = await api("/api/cmo/next-actions");
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}


async function loadConnectors(){
  const out = qs("connectorsOut");
  out.innerHTML = "Loading connectors...";

  try{
    const data = await api("/api/connectors/status");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.connectors,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function queueExternalAction(){
  const out = qs("actionOut");
  out.innerHTML = "Queueing...";

  let payload = { notes: val("actionPayload") };

  try{
    const data = await api("/api/connectors/action","POST",{
      connector: val("actionConnector"),
      action: val("actionName") || "draft",
      payload
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadExternalActions(){
  const out = qs("logsOut");
  out.innerHTML = "Loading actions...";

  try{
    const data = await api("/api/connectors/actions");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.actions,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function createSchedule(){
  const out = qs("scheduleOut");
  out.innerHTML = "Creating schedule...";

  try{
    const data = await api("/api/connectors/schedule","POST",{
      title: val("scheduleTitle"),
      connector: val("scheduleConnector"),
      frequency: val("scheduleFrequency"),
      task:{ note:"scheduled by GhostSeller" }
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.schedule,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadSchedules(){
  const out = qs("logsOut");
  out.innerHTML = "Loading schedules...";

  try{
    const data = await api("/api/connectors/schedules");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.schedules,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadAgents(){
  const out = qs("agentsListOut"); out.innerHTML = "Loading agents...";
  try{ const data = await api("/api/agents/list"); out.innerHTML = `<pre>${esc(JSON.stringify(data.agents,null,2))}</pre>`; }
  catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}
async function orchestrateAgent(){
  const out = qs("orchestratorOut"); out.innerHTML = "Thinking...";
  try{ const data = await api("/api/agents/orchestrate","POST",{task:val("agentTask"),context:{user:currentUser?.email||""}}); out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`; }
  catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}
async function runAgentTeam(){
  const out = qs("teamOut"); out.innerHTML = "Running...";
  try{ const data = await api("/api/agents/team","POST",{objective:val("teamObjective"),context:{product:"GhostSeller AI",market:"global"}}); out.innerHTML = `<pre>${esc(JSON.stringify(data.team_plan,null,2))}</pre>`; }
  catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}
async function loadAgentRuns(){
  const out = qs("agentRunsOut"); out.innerHTML = "Loading...";
  try{ const data = await api("/api/agents/runs"); out.innerHTML = `<pre>${esc(JSON.stringify(data.runs,null,2))}</pre>`; }
  catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}


async function loadUnifiedBrain(){
  const out = qs("ubOverviewOut");
  out.innerHTML = "Loading Unified Brain...";

  try{
    const data = await api("/api/brain/unified/overview");
    const b = data.brain || {};

    qs("ubScore").textContent = b.score ?? 0;
    qs("ubContent").textContent = b.summary?.total_content ?? 0;
    qs("ubAgents").textContent = b.summary?.total_agent_runs ?? 0;
    qs("ubStatus").textContent = b.status || "-";

    out.innerHTML = `<pre>${esc(JSON.stringify(b,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function unifiedBrainThink(){
  const out = qs("ubThinkOut");
  out.innerHTML = "Brain thinking...";

  try{
    const data = await api("/api/brain/unified/think","POST",{
      objective: val("ubObjective"),
      context:{ user: currentUser?.email || "", product:"GhostSeller AI" }
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.decision,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function executeBrainPlan(){
  const out = qs("ubExecuteOut");
  out.innerHTML = "Queueing execution plan...";

  try{
    const data = await api("/api/brain/unified/execute-plan","POST",{
      objective: val("ubExecuteObjective")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadBrainRuns(){
  const out = qs("ubRunsOut");
  out.innerHTML = "Loading brain runs...";

  try{
    const data = await api("/api/brain/unified/runs");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.runs,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function createWorkflow(){
  const out = qs("workflowCreateOut");
  out.innerHTML = "Creating workflow...";

  try{
    const data = await api("/api/execution/workflow","POST",{
      objective: val("execObjective"),
      niche: val("execNiche"),
      platform: val("execPlatform")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.workflow,null,2))}</pre>`;
    await loadWorkflows();
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadWorkflows(){
  const out = qs("workflowsOut");
  if(out) out.innerHTML = "Loading workflows...";

  try{
    const data = await api("/api/execution/workflows");
    const workflows = data.workflows || [];

    if(qs("execTotal")) qs("execTotal").textContent = workflows.length;
    if(qs("execCompleted")) qs("execCompleted").textContent = workflows.filter(w=>w.status==="completed").length;
    if(qs("execDraft")) qs("execDraft").textContent = workflows.filter(w=>w.status==="draft").length;

    if(out){
      out.innerHTML = workflows.length ? workflows.map(w=>`
        <div class="item">
          <h3>${esc(w.objective)}</h3>
          <p>${esc(w.status)} • ${esc(w.platform)} • ${esc(w.niche)}</p>
          <button onclick="runWorkflow('${w.id}')">Run</button>
          <button onclick="retryWorkflow('${w.id}')">Retry</button>
          <pre>${esc(JSON.stringify(w.steps || [], null, 2))}</pre>
        </div>
      `).join("") : "<p>Aucun workflow.</p>";
    }
  }catch(e){
    if(out) out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function runWorkflow(id){
  await api(`/api/execution/run/${id}`,"POST",{});
  await loadWorkflows();
  await loadExecutionMonitor();
}

async function retryWorkflow(id){
  await api(`/api/execution/retry/${id}`,"POST",{});
  await loadWorkflows();
}

async function loadExecutionLogs(){
  const out = qs("executionLogsOut");
  out.innerHTML = "Loading logs...";

  try{
    const data = await api("/api/execution/logs");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.logs,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function createCampaignRunner(){
  const out = qs("runnerOut");
  out.innerHTML = "Creating campaign runner...";

  try{
    const data = await api("/api/execution/campaign-runner","POST",{
      campaign_name: val("runnerName"),
      objective: val("runnerObjective"),
      niche: val("runnerNiche"),
      platform: val("runnerPlatform")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.campaign,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadExecutionMonitor(){
  const out = qs("executionLogsOut");

  try{
    const data = await api("/api/execution/monitor");
    if(qs("execHealth")) qs("execHealth").textContent = data.monitor.health;
    if(out) out.innerHTML = `<pre>${esc(JSON.stringify(data.monitor,null,2))}</pre>`;
  }catch(e){
    if(out) out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function learnMemory(){
  const out = qs("memoryLearnOut");
  out.innerHTML = "Learning...";

  try{
    const data = await api("/api/memory/learn","POST",{
      niche: val("memNiche"),
      platform: val("memPlatform"),
      hook: val("memHook"),
      cta: val("memCTA"),
      strategy: val("memStrategy"),
      campaign_name: val("memCampaign"),
      metrics:{
        engagement:Number(val("memEngagement") || 0),
        clicks:Number(val("memClicks") || 0),
        conversions:Number(val("memConversions") || 0)
      }
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.memory,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadMemoryInsights(){
  const out = qs("memoryInsightsOut");
  out.innerHTML = "Loading insights...";

  try{
    const data = await api("/api/memory/insights");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.insights,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadBestStrategies(){
  const out = qs("memoryInsightsOut");
  out.innerHTML = "Loading best strategies...";

  try{
    const data = await api("/api/memory/best-strategies");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.best_strategies,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadRankedCampaigns(){
  const out = qs("memoryInsightsOut");
  out.innerHTML = "Loading ranked campaigns...";

  try{
    const data = await api("/api/memory/ranked-campaigns");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.ranked_campaigns,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadMemoryRecommendation(){
  const out = qs("memoryRecommendationOut");
  out.innerHTML = "Generating recommendation...";

  try{
    const data = await api("/api/memory/recommend","POST",{
      objective: val("memObjective")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.recommendation,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadMemoryTimeline(){
  const out = qs("memoryTimelineOut");
  out.innerHTML = "Loading timeline...";

  try{
    const data = await api("/api/memory/timeline");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.timeline,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function evaluateContent(){
  const out = qs("evalOut");
  out.innerHTML = "Evaluating...";

  try{
    const data = await api("/api/optimization/evaluate","POST",{
      hook: val("optHook"),
      cta: val("optCTA"),
      platform: val("optPlatform"),
      niche: val("optNiche"),
      strategy: val("optStrategy")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.evaluation,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function improveContent(){
  const out = qs("improveOut");
  out.innerHTML = "Improving...";

  try{
    const data = await api("/api/optimization/improve","POST",{
      hook: val("optHook"),
      cta: val("optCTA"),
      platform: val("optPlatform"),
      niche: val("optNiche")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.improvements,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function runABTest(){
  const out = qs("abOut");
  out.innerHTML = "Running A/B test...";

  const variants = val("abVariants").split("\\n").map(x=>x.trim()).filter(Boolean);

  try{
    const data = await api("/api/optimization/ab-test","POST",{
      variants,
      platform: val("optPlatform"),
      niche: val("optNiche")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data.test,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadOptimizationCycles(){
  const out = qs("cyclesOut");
  out.innerHTML = "Loading cycles...";

  try{
    const data = await api("/api/optimization/cycles");
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadOptimizationRecommendations(){
  const out = qs("cyclesOut");
  out.innerHTML = "Loading recommendations...";

  try{
    const data = await api("/api/optimization/recommendations");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.recommendations,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function scanOpportunities(){
  const out = qs("opportunityScanOut");
  out.innerHTML = "Scanning opportunities...";

  try{
    const data = await api("/api/opportunities/scan");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.opportunities,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadOpportunityRadar(){
  const out = qs("opportunityScanOut");
  out.innerHTML = "Loading money radar...";

  try{
    const data = await api("/api/opportunities/radar");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.radar,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function analyzeOpportunity(){
  const out = qs("opportunityAnalyzeOut");
  out.innerHTML = "Analyzing niche...";

  try{
    const data = await api("/api/opportunities/analyze","POST",{
      niche: val("oppNiche"),
      market: val("oppMarket")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.analysis,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function buildOpportunityCampaign(){
  const out = qs("opportunityAnalyzeOut");
  out.innerHTML = "Building campaign...";

  try{
    const data = await api("/api/opportunities/campaign","POST",{
      niche: val("oppNiche")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.campaign,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadOpportunityHistory(){
  const out = qs("opportunityHistoryOut");
  out.innerHTML = "Loading history...";

  try{
    const data = await api("/api/opportunities/history");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.history,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

window.addEventListener("ghostseller:languageChanged", ()=>{
  try { applyTranslations(); } catch(e) {}
});


window.addEventListener('error', (e)=>{
  console.error("[GhostSeller Frontend Error]", e.error || e.message);
});

window.addEventListener('unhandledrejection', (e)=>{
  console.error("[GhostSeller Promise Error]", e.reason);
});

async function safeApi(path, method="GET", body){
  try{
    return await api(path, method, body);
  }catch(err){
    console.error(err);
    return {
      ok:false,
      error: err.message || "Unknown API error"
    };
  }
}


async function loadPlans(){
  const out = qs("plansOut");
  out.innerHTML = "Loading pricing plans...";

  try{
    const data = await api("/api/billing/plans","GET",null,false);
    out.innerHTML = `<pre>${esc(JSON.stringify(data.plans,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadUsage(){
  const out = qs("usageOut");
  if(!out) return;
  out.innerHTML = "Loading usage...";
  try{
    const data = await api("/api/usage/me");
    out.innerHTML = `
      <div class="stats">
        <div class="stat"><span>${esc(data.remaining.credits)}</span><p>Credits left</p></div>
        <div class="stat"><span>${esc(data.remaining.posts)}</span><p>Posts left</p></div>
        <div class="stat"><span>${esc(data.remaining.leads)}</span><p>Leads left</p></div>
        <div class="stat"><span>${esc(data.remaining.projects)}</span><p>Projects left</p></div>
      </div>
      <pre>${esc(JSON.stringify(data,null,2))}</pre>
    `;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadBetaChecklist(){
  const out = qs("betaChecklistOut");
  if(!out) return;
  out.innerHTML = "Loading checklist...";
  try{
    const data = await api("/api/beta/checklist");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.checklist,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function sendWelcomeEmail(){
  const out = qs("betaChecklistOut");
  out.innerHTML = "Sending welcome email...";
  try{
    const data = await api("/api/emails/welcome","POST",{
      language:localStorage.getItem("ghostseller_language") || "fr"
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.result,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadEmailStatus(){
  const out = qs("emailStatusOut");
  out.innerHTML = "Loading email status...";
  try{
    const data = await api("/api/emails/status");
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function sendTestEmail(){
  const out = qs("emailStatusOut");
  out.innerHTML = "Sending test email...";
  try{
    const data = await api("/api/emails/send-test","POST",{
      to:val("testEmailTo"),
      subject:val("testEmailSubject"),
      message:val("testEmailMessage")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.result,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadNotifications(){
  const out = qs("notificationsOut");
  out.innerHTML = "Loading notifications...";
  try{
    const data = await api("/api/beta/notifications");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.notifications,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadAdminOverview(){
  const out = qs("adminOverviewOut");
  if(!out) return;
  out.innerHTML = "Loading admin overview...";

  try{
    const data = await api("/api/admin/overview");
    const o = data.overview || {};
    qs("adminTotalUsers").textContent = o.total_users ?? 0;
    qs("adminPaidUsers").textContent = o.paid_users ?? 0;
    qs("adminFreeUsers").textContent = o.free_users ?? 0;
    qs("adminUsedCredits").textContent = o.total_used_credits ?? 0;
    out.innerHTML = `<pre>${esc(JSON.stringify(o,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadAdminUsers(){
  const out = qs("adminUsersOut");
  out.innerHTML = "Loading users...";

  try{
    const data = await api("/api/admin/users");
    const users = data.users || [];
    out.innerHTML = users.length ? users.map(u=>`
      <div class="item">
        <h3>${esc(u.email)}</h3>
        <p>role: ${esc(u.role)} • plan: ${esc(u.plan)} • status: ${esc(u.access_status)} • credits: ${esc(u.credits)}</p>
        <button onclick="qs('adminUserEmail').value='${esc(u.email)}'; qs('adminUserCredits').value='${esc(u.credits ?? '')}'">Edit</button>
      </div>
    `).join("") : "<p>No users.</p>";
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function adminUpdateUser(){
  const out = qs("adminUserUpdateOut");
  out.innerHTML = "Updating user...";

  const payload = {
    email: val("adminUserEmail")
  };

  if(val("adminUserRole")) payload.role = val("adminUserRole");
  if(val("adminUserPlan")) payload.plan = val("adminUserPlan");
  if(val("adminUserCredits")) payload.credits = Number(val("adminUserCredits"));

  try{
    const data = await api("/api/admin/user/update","POST",payload);
    out.innerHTML = `<pre>${esc(JSON.stringify(data.user,null,2))}</pre>`;
    await loadAdminUsers();
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function adminApproveUser(){
  const out = qs("adminUserUpdateOut");
  out.innerHTML = "Approving user...";

  try{
    const data = await api("/api/admin/user/approve","POST",{email:val("adminUserEmail")});
    out.innerHTML = `<pre>${esc(JSON.stringify(data.user,null,2))}</pre>`;
    await loadAdminUsers();
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadAdminLogs(){
  const out = qs("adminLogsOut");
  out.innerHTML = "Loading logs...";

  try{
    const data = await api("/api/admin/logs");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.logs,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadBetaLaunchChecklist(){
  const out = qs("betaLaunchChecklistOut");
  if(!out) return;
  out.innerHTML = "Loading beta checklist...";
  try{
    const data = await api("/api/launch/checklist");
    qs("betaReadyScore").textContent = (data.beta_ready_score || 0) + "%";
    out.innerHTML = `<pre>${esc(JSON.stringify(data.checks,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadPublicBetaStatus(){
  const out = qs("betaLaunchChecklistOut");
  out.innerHTML = "Loading public status...";
  try{
    const data = await api("/api/launch/public-status","GET",null,false);
    qs("betaMode").textContent = data.mode || "-";
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function sendBetaFeedback(){
  const out = qs("betaFeedbackOut");
  out.innerHTML = "Sending feedback...";
  try{
    const data = await api("/api/launch/feedback","POST",{
      rating:val("betaFeedbackRating"),
      category:val("betaFeedbackCategory"),
      message:val("betaFeedbackMessage")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.feedback,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadBetaFeedback(){
  const out = qs("betaFeedbackAdminOut");
  out.innerHTML = "Loading feedback...";
  try{
    const data = await api("/api/launch/feedback");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.feedback,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function sendBetaInvite(){
  const out = qs("betaInviteOut");
  out.innerHTML = "Sending invite...";
  try{
    const data = await api("/api/launch/waitlist/invite","POST",{
      email:val("betaInviteEmail"),
      note:val("betaInviteNote")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.invite,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadAIStatus(){
  const out = qs("aiStatusOut");
  if(!out) return;
  out.innerHTML = "Checking AI status...";
  try{
    const data = await api("/api/ai/status");
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function generateRealAI(){
  const out = qs("realAIOut");
  out.innerHTML = "Generating with Real AI Engine...";
  try{
    const data = await api("/api/ai/generate","POST",{
      niche:val("aiNiche"),
      platform:val("aiPlatform"),
      goal:val("aiGoal"),
      tone:val("aiTone"),
      language:localStorage.getItem("ghostseller_language") || "fr"
    });

    out.innerHTML = `
      <div class="item">
        <span class="badge">${esc(data.provider || "ai")}</span>
        <pre>${esc(JSON.stringify(data.result,null,2))}</pre>
      </div>
    `;
    try{ loadUsage(); }catch(e){}
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function generateAIDirections(){
  const out = qs("aiDirectionsOut");
  out.innerHTML = "Generating creative directions...";
  try{
    const data = await api("/api/ai/creative-directions","POST",{
      description:val("aiCreativeDescription"),
      language:localStorage.getItem("ghostseller_language") || "fr"
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
    try{ loadUsage(); }catch(e){}
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadSocialStatus(){
  const out = qs("socialStatusOut");
  if(!out) return;
  out.innerHTML = "Loading social connectors...";
  try{
    const data = await api("/api/social/status");
    out.innerHTML = (data.connectors || []).map(c=>`
      <div class="item">
        <h3>${esc(c.name)}</h3>
        <p>env_ready: ${esc(c.env_ready)} • connected: ${esc(c.connected)} • mode: ${esc(c.mode)}</p>
        ${c.oauth_url ? `<button onclick="connectSocial('${esc(c.id)}')">Connect ${esc(c.id)}</button>` : ""}
        <pre>${esc(JSON.stringify(c.required_env,null,2))}</pre>
      </div>
    `).join("") + `<h3>Accounts</h3><pre>${esc(JSON.stringify(data.accounts || [],null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function connectSocial(provider){
  try{
    const data = await api(`/api/social/connect/${provider}`);
    if(data.url) location.href = data.url;
    else alert(data.message || data.error || "Connector not ready.");
  }catch(e){
    alert(e.message);
  }
}

async function manualSocialConnect(){
  const out = qs("socialConnectOut");
  out.innerHTML = "Saving connection...";
  try{
    const data = await api("/api/social/manual-connect","POST",{
      provider:val("socialProvider"),
      account_name:val("socialAccountName"),
      account_id:val("socialAccountId")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.account,null,2))}</pre>`;
    await loadSocialStatus();
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function queueSocialPost(){
  const out = qs("postQueueOut");
  out.innerHTML = "Queueing post...";
  try{
    const data = await api("/api/social/queue-post","POST",{
      provider:val("postProvider"),
      account_id:val("postAccountId"),
      caption:val("postCaption"),
      media_url:val("postMediaUrl"),
      scheduled_at:val("postScheduledAt") || null
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
    await loadSocialQueue();
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadSocialQueue(){
  const out = qs("socialQueueOut");
  out.innerHTML = "Loading queue...";
  try{
    const data = await api("/api/social/queue");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.queue,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadRevenueStatus(){
  const out = qs("revenueStatusOut");
  if(!out) return;
  out.innerHTML = "Loading revenue status...";
  try{
    const data = await api("/api/revenue/status");
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function openCustomerPortal(){
  try{
    const data = await api("/api/revenue/portal","POST",{});
    if(data.url) location.href = data.url;
    else alert("Customer portal unavailable.");
  }catch(e){
    alert(e.message);
  }
}

async function manualActivateRevenue(){
  const out = qs("manualRevenueOut");
  out.innerHTML = "Activating plan...";
  try{
    const data = await api("/api/revenue/manual-activate","POST",{
      email:val("revenueEmail"),
      plan:val("revenuePlan")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.user,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadRevenueEvents(){
  const out = qs("revenueEventsOut");
  out.innerHTML = "Loading billing events...";
  try{
    const data = await api("/api/revenue/events");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.events,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadAutoGrowthDashboard(){
  const out = qs("autoGrowthDashboardOut");
  if(!out) return;
  out.innerHTML = "Loading autonomous growth dashboard...";
  try{
    const data = await api("/api/autogrowth/dashboard");
    const d = data.dashboard || {};
    qs("agScore").textContent = d.growth_score ?? 0;
    qs("agContent").textContent = d.content_count ?? 0;
    qs("agCampaigns").textContent = d.campaign_count ?? 0;
    qs("agRevenue").textContent = d.revenue_events ?? 0;
    out.innerHTML = `<pre>${esc(JSON.stringify(d,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function generateAutoGrowthPlan(){
  const out = qs("autoGrowthDashboardOut");
  out.innerHTML = "Generating daily growth plan...";
  try{
    const data = await api("/api/autogrowth/daily-plan","POST",{});
    out.innerHTML = `<pre>${esc(JSON.stringify(data.plan,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function createGrowthLoop(){
  const out = qs("growthLoopOut");
  out.innerHTML = "Creating growth loop...";
  try{
    const data = await api("/api/autogrowth/launch-loop","POST",{
      target:val("agTarget"),
      niche:val("agNiche"),
      platform:val("agPlatform")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.loop,null,2))}</pre>`;
    await loadGrowthLoops();
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadGrowthLoops(){
  const out = qs("growthLoopsOut");
  out.innerHTML = "Loading growth loops...";
  try{
    const data = await api("/api/autogrowth/loops");
    const loops = data.loops || [];
    out.innerHTML = loops.length ? loops.map(l=>`
      <div class="item">
        <h3>${esc(l.target)}</h3>
        <p>${esc(l.status)} • ${esc(l.platform)} • ${esc(l.niche)}</p>
        <button onclick="executeGrowthLoop('${l.id}')">Execute loop</button>
        <pre>${esc(JSON.stringify(l.loop,null,2))}</pre>
      </div>
    `).join("") : "<p>No growth loops.</p>";
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function executeGrowthLoop(id){
  try{
    await api(`/api/autogrowth/execute-loop/${id}`,"POST",{});
    await loadGrowthLoops();
  }catch(e){
    alert(e.message);
  }
}

async function loadGrowthRuns(){
  const out = qs("growthRunsOut");
  out.innerHTML = "Loading growth runs...";
  try{
    const data = await api("/api/autogrowth/runs");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.runs,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadLaunchpadStatus(){
  const out = qs("launchChecklistOut");
  if(!out) return;
  out.innerHTML = "Loading launch status...";
  try{
    const data = await api("/api/launchpad/status","GET",null,false);
    qs("launchMode").textContent = data.launch_mode || "-";
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadProductionChecklist(){
  const out = qs("launchChecklistOut");
  out.innerHTML = "Loading production checklist...";
  try{
    const data = await api("/api/launchpad/production-checklist");
    qs("launchScore").textContent = (data.launch_score || 0) + "%";
    out.innerHTML = `<pre>${esc(JSON.stringify(data.checks,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function saveGoLiveNote(){
  const out = qs("goLiveOut");
  out.innerHTML = "Saving note...";
  try{
    const data = await api("/api/launchpad/go-live-note","POST",{ note:val("goLiveNote") });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.note,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadLaunchEvents(){
  const out = qs("launchEventsOut");
  out.innerHTML = "Loading launch events...";
  try{
    const data = await api("/api/launchpad/events");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.events,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function loadTikTokStatus(){
  const out = qs("tiktokStatusOut");
  if(!out) return;
  out.innerHTML = "Loading TikTok Engine status...";
  try{
    const data = await api("/api/tiktok/status");
    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}

async function generateTikTokEngine(){
  const out = qs("ttOut");
  out.innerHTML = "Generating TikTok content...";
  try{
    const data = await api("/api/tiktok/generate","POST",{
      niche:val("ttNiche"), topic:val("ttTopic"), audience:val("ttAudience"), mode:val("ttMode")
    });
    out.innerHTML = `<div class="item"><span class="badge">Viral Score: ${esc(data.result.viral_score)}</span><pre>${esc(JSON.stringify(data.result,null,2))}</pre></div>`;
  }catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}

async function loadTikTokHistory(){
  const out = qs("ttHistoryOut");
  out.innerHTML = "Loading TikTok history...";
  try{
    const data = await api("/api/tiktok/history");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.history,null,2))}</pre>`;
  }catch(e){ out.innerHTML = `<p class="error">${esc(e.message)}</p>`; }
}


async function loadAgentsDashboard(){
  const out = qs("agentsOut");
  out.innerHTML = "Loading AI Agents...";
  try{
    const data = await api("/api/agents/dashboard");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.command_center,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function createMission(){
  const out = qs("missionOut");
  out.innerHTML = "Creating mission...";
  try{
    const data = await api("/api/agents/mission","POST",{
      title:val("missionTitle"),
      objective:val("missionObjective"),
      target_platform:val("missionPlatform")
    });
    out.innerHTML = `<pre>${esc(JSON.stringify(data.mission,null,2))}</pre>`;
    await loadAgentsDashboard();
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadAgentMemory(){
  const out = qs("memoryOut");
  out.innerHTML = "Loading memory...";
  try{
    const data = await api("/api/agents/memory");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.memory,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}


async function joinWaitlist(){
  const out = qs("waitlistOut");
  out.innerHTML = "Joining waitlist...";

  try{
    const data = await api("/api/acquisition/waitlist","POST",{
      email:val("waitlistEmail"),
      source:val("waitlistSource")
    });

    out.innerHTML = `<pre>${esc(JSON.stringify(data,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadAcquisitionStats(){
  const out = qs("acquisitionOut");
  out.innerHTML = "Loading stats...";

  try{
    const data = await api("/api/acquisition/stats");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.stats,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

async function loadPlans(){
  const out = qs("plansOut");
  out.innerHTML = "Loading plans...";

  try{
    const data = await api("/api/acquisition/plans");
    out.innerHTML = `<pre>${esc(JSON.stringify(data.plans,null,2))}</pre>`;
  }catch(e){
    out.innerHTML = `<p class="error">${esc(e.message)}</p>`;
  }
}

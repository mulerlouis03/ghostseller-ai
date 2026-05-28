import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const socialRouter = express.Router();

const CONNECTORS = {
  meta:{
    name:"Meta / Instagram / Facebook",
    env:["META_APP_ID","META_APP_SECRET","META_REDIRECT_URI"],
    scopes:["pages_show_list","instagram_basic","instagram_content_publish","pages_read_engagement"],
    authBase:"https://www.facebook.com/v20.0/dialog/oauth"
  },
  tiktok:{
    name:"TikTok",
    env:["TIKTOK_CLIENT_KEY","TIKTOK_CLIENT_SECRET","TIKTOK_REDIRECT_URI"],
    scopes:["user.info.basic","video.upload","video.publish"],
    authBase:"https://www.tiktok.com/v2/auth/authorize/"
  },
  linkedin:{
    name:"LinkedIn",
    env:["LINKEDIN_CLIENT_ID","LINKEDIN_CLIENT_SECRET","LINKEDIN_REDIRECT_URI"],
    scopes:["openid","profile","email","w_member_social"],
    authBase:"https://www.linkedin.com/oauth/v2/authorization"
  },
  whatsapp:{
    name:"WhatsApp Business",
    env:["WHATSAPP_TOKEN","WHATSAPP_PHONE_NUMBER_ID","WHATSAPP_BUSINESS_ACCOUNT_ID"],
    scopes:["messages"],
    authBase:null
  }
};

function envReady(keys){
  return keys.every(k=>Boolean(process.env[k]));
}

function appUrl(){
  return process.env.APP_URL || "https://ghostseller-ai.vercel.app";
}

function buildOAuthUrl(provider, userId){
  const c = CONNECTORS[provider];
  if(!c || !c.authBase) return null;

  const state = Buffer.from(JSON.stringify({
    provider,
    user_id:userId,
    nonce:crypto.randomUUID()
  })).toString("base64url");

  if(provider === "meta"){
    const params = new URLSearchParams({
      client_id:process.env.META_APP_ID || "",
      redirect_uri:process.env.META_REDIRECT_URI || `${appUrl()}/api/social/callback/meta`,
      state,
      scope:c.scopes.join(",")
    });
    return `${c.authBase}?${params.toString()}`;
  }

  if(provider === "tiktok"){
    const params = new URLSearchParams({
      client_key:process.env.TIKTOK_CLIENT_KEY || "",
      redirect_uri:process.env.TIKTOK_REDIRECT_URI || `${appUrl()}/api/social/callback/tiktok`,
      response_type:"code",
      scope:c.scopes.join(","),
      state
    });
    return `${c.authBase}?${params.toString()}`;
  }

  if(provider === "linkedin"){
    const params = new URLSearchParams({
      response_type:"code",
      client_id:process.env.LINKEDIN_CLIENT_ID || "",
      redirect_uri:process.env.LINKEDIN_REDIRECT_URI || `${appUrl()}/api/social/callback/linkedin`,
      scope:c.scopes.join(" "),
      state
    });
    return `${c.authBase}?${params.toString()}`;
  }

  return null;
}

socialRouter.get("/status", requireAuth, async (req,res)=>{
  const { data:accounts=[] } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false});

  const status = Object.entries(CONNECTORS).map(([id,c])=>({
    id,
    name:c.name,
    env_ready:envReady(c.env),
    required_env:c.env,
    connected:accounts.some(a=>a.provider === id && a.status === "connected"),
    oauth_url:buildOAuthUrl(id, req.user.id),
    mode: envReady(c.env) ? "ready_for_official_connection" : "credentials_required"
  }));

  res.json({ ok:true, connectors:status, accounts });
});

socialRouter.get("/connect/:provider", requireAuth, async (req,res)=>{
  const provider = req.params.provider;
  const url = buildOAuthUrl(provider, req.user.id);

  if(!CONNECTORS[provider]){
    return res.status(404).json({ error:"Unknown provider." });
  }

  if(!url){
    return res.json({
      ok:true,
      provider,
      message:"This provider uses token configuration, not OAuth URL.",
      required_env:CONNECTORS[provider].env
    });
  }

  if(!envReady(CONNECTORS[provider].env)){
    return res.status(400).json({
      error:"Provider credentials missing.",
      provider,
      required_env:CONNECTORS[provider].env,
      oauth_url_preview:url
    });
  }

  res.json({ ok:true, provider, url });
});

socialRouter.get("/callback/:provider", async (req,res)=>{
  const provider = req.params.provider;
  const { code="", state="" } = req.query;

  // Safe placeholder callback. Real token exchange will be enabled after official app credentials.
  try{
    await supabase.from("social_oauth_events").insert({
      id:crypto.randomUUID(),
      provider,
      code_present:Boolean(code),
      state:String(state || ""),
      query:req.query || {},
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  res.send(`
    <html>
      <body style="font-family:Arial;padding:40px;background:#050816;color:white">
        <h1>GhostSeller ${provider} connection received</h1>
        <p>OAuth callback captured. Token exchange will be activated after official API approval.</p>
        <a style="color:#00d4ff" href="/">Return to GhostSeller</a>
      </body>
    </html>
  `);
});

socialRouter.post("/manual-connect", requireAuth, async (req,res)=>{
  const { provider="manual", account_name="", account_id="" } = req.body || {};

  if(!CONNECTORS[provider] && provider !== "manual"){
    return res.status(404).json({ error:"Unknown provider." });
  }

  const account = {
    id:crypto.randomUUID(),
    user_id:req.user.id,
    provider,
    account_name,
    account_id,
    status:"connected",
    metadata:{ manual:true },
    created_at:new Date().toISOString(),
    updated_at:new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("social_accounts")
    .insert(account)
    .select()
    .single();

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, account:data });
});

socialRouter.post("/queue-post", requireAuth, async (req,res)=>{
  const {
    provider="manual",
    account_id="",
    content_type="post",
    caption="",
    media_url="",
    scheduled_at=null
  } = req.body || {};

  const item = {
    id:crypto.randomUUID(),
    user_id:req.user.id,
    provider,
    account_id,
    content_type,
    caption,
    media_url,
    scheduled_at,
    status:"queued",
    result:{ note:"Real publishing requires official API credentials and platform approvals." },
    created_at:new Date().toISOString(),
    updated_at:new Date().toISOString()
  };

  const { data, error } = await supabase
    .from("social_publish_queue")
    .insert(item)
    .select()
    .single();

  if(error) return res.status(500).json({ error:error.message });

  res.json({
    ok:true,
    queued:data,
    message:"Post queued safely. Real publishing is disabled until APIs are approved."
  });
});

socialRouter.get("/queue", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("social_publish_queue")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(100);

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, queue:data });
});

import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const tiktokConnectRouter = express.Router();

const AUTH_URL = "https://www.tiktok.com/v2/auth/authorize/";
const TOKEN_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const REFRESH_URL = "https://open.tiktokapis.com/v2/oauth/token/";
const USER_INFO_URL = "https://open.tiktokapis.com/v2/user/info/";
const UPLOAD_INIT_URL = "https://open.tiktokapis.com/v2/post/publish/inbox/video/init/";

function appUrl(){
  return process.env.APP_URL || "https://ghostseller-ai.vercel.app";
}

function redirectUri(){
  return process.env.TIKTOK_REDIRECT_URI || `${appUrl()}/api/tiktok-connect/callback`;
}

function scopes(){
  return process.env.TIKTOK_SCOPES || "user.info.basic,video.upload";
}

function base64url(buffer){
  return buffer.toString("base64").replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}

function sha256(input){
  return crypto.createHash("sha256").update(input).digest();
}

function requireTikTokConfig(res){
  if(!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET){
    res.status(400).json({
      error:"TikTok not configured.",
      required:[
        "TIKTOK_CLIENT_KEY",
        "TIKTOK_CLIENT_SECRET",
        "TIKTOK_REDIRECT_URI",
        "TIKTOK_SCOPES"
      ]
    });
    return false;
  }
  return true;
}

async function getConnectedAccount(userId){
  const { data } = await supabase
    .from("tiktok_accounts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at",{ascending:false})
    .limit(1)
    .maybeSingle();

  return data;
}

async function saveState({ user_id, state, code_verifier }){
  try{
    await supabase.from("tiktok_oauth_states").insert({
      id:crypto.randomUUID(),
      user_id,
      state,
      code_verifier,
      created_at:new Date().toISOString()
    });
  }catch(_e){}
}

async function loadState(state){
  const { data } = await supabase
    .from("tiktok_oauth_states")
    .select("*")
    .eq("state", state)
    .maybeSingle();

  return data;
}

tiktokConnectRouter.get("/config", requireAuth, (_req,res)=>{
  res.json({
    ok:true,
    configured:Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),
    redirect_uri:redirectUri(),
    scopes:scopes(),
    required_approval:[
      "Login Kit for user.info.basic",
      "Content Posting API video.upload or video.publish for posting"
    ]
  });
});

tiktokConnectRouter.get("/start", requireAuth, async (req,res)=>{
  if(!requireTikTokConfig(res)) return;

  const state = crypto.randomBytes(16).toString("hex");
  const codeVerifier = base64url(crypto.randomBytes(64));
  const codeChallenge = base64url(sha256(codeVerifier));

  await saveState({
    user_id:req.user.id,
    state,
    code_verifier:codeVerifier
  });

  const url = new URL(AUTH_URL);
  url.searchParams.set("client_key", process.env.TIKTOK_CLIENT_KEY);
  url.searchParams.set("scope", scopes());
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri());
  url.searchParams.set("state", state);
  url.searchParams.set("code_challenge", codeChallenge);
  url.searchParams.set("code_challenge_method", "S256");

  res.json({ ok:true, url:url.toString() });
});

tiktokConnectRouter.get("/callback", async (req,res)=>{
  try{
    if(!process.env.TIKTOK_CLIENT_KEY || !process.env.TIKTOK_CLIENT_SECRET){
      return res.status(400).send("TikTok config missing.");
    }

    const { code, state, error, error_description } = req.query || {};

    if(error){
      return res.redirect(`${appUrl()}/?tiktok=error&message=${encodeURIComponent(error_description || error)}`);
    }

    if(!code || !state){
      return res.status(400).send("Missing code or state.");
    }

    const saved = await loadState(state);
    if(!saved){
      return res.status(400).send("Invalid OAuth state.");
    }

    const body = new URLSearchParams();
    body.set("client_key", process.env.TIKTOK_CLIENT_KEY);
    body.set("client_secret", process.env.TIKTOK_CLIENT_SECRET);
    body.set("code", String(code));
    body.set("grant_type", "authorization_code");
    body.set("redirect_uri", redirectUri());
    body.set("code_verifier", saved.code_verifier);

    const tokenResp = await fetch(TOKEN_URL, {
      method:"POST",
      headers:{ "Content-Type":"application/x-www-form-urlencoded" },
      body
    });

    const tokenJson = await tokenResp.json();

    if(!tokenResp.ok || tokenJson.error){
      return res.status(400).send(`TikTok token error: ${JSON.stringify(tokenJson)}`);
    }

    const accessToken = tokenJson.access_token;
    const refreshToken = tokenJson.refresh_token;
    const openId = tokenJson.open_id || "";
    const expiresIn = tokenJson.expires_in || 0;
    const refreshExpiresIn = tokenJson.refresh_expires_in || 0;

    let displayName = "";
    let avatarUrl = "";

    try{
      const userResp = await fetch(`${USER_INFO_URL}?fields=open_id,union_id,avatar_url,display_name`, {
        headers:{ Authorization:`Bearer ${accessToken}` }
      });
      const userJson = await userResp.json();
      displayName = userJson?.data?.user?.display_name || "";
      avatarUrl = userJson?.data?.user?.avatar_url || "";
    }catch(_e){}

    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn*1000).toISOString() : null;
    const refreshExpiresAt = refreshExpiresIn ? new Date(Date.now() + refreshExpiresIn*1000).toISOString() : null;

    await supabase.from("tiktok_accounts").upsert({
      user_id:saved.user_id,
      open_id:openId,
      display_name:displayName,
      avatar_url:avatarUrl,
      access_token:accessToken,
      refresh_token:refreshToken,
      expires_at:expiresAt,
      refresh_expires_at:refreshExpiresAt,
      scopes:scopes(),
      status:"connected",
      updated_at:new Date().toISOString()
    }, { onConflict:"user_id" });

    try{
      await supabase.from("tiktok_oauth_states").delete().eq("state", state);
    }catch(_e){}

    res.redirect(`${appUrl()}/?tiktok=connected`);
  }catch(error){
    res.status(500).send(`TikTok callback failed: ${error.message}`);
  }
});

tiktokConnectRouter.get("/status", requireAuth, async (req,res)=>{
  const account = await getConnectedAccount(req.user.id);

  res.json({
    ok:true,
    connected:Boolean(account?.access_token),
    account:account ? {
      open_id:account.open_id,
      display_name:account.display_name,
      avatar_url:account.avatar_url,
      scopes:account.scopes,
      status:account.status,
      expires_at:account.expires_at,
      refresh_expires_at:account.refresh_expires_at
    } : null,
    configured:Boolean(process.env.TIKTOK_CLIENT_KEY && process.env.TIKTOK_CLIENT_SECRET),
    redirect_uri:redirectUri()
  });
});

tiktokConnectRouter.post("/refresh", requireAuth, async (req,res)=>{
  try{
    if(!requireTikTokConfig(res)) return;

    const account = await getConnectedAccount(req.user.id);
    if(!account?.refresh_token){
      return res.status(400).json({ error:"No TikTok refresh token found." });
    }

    const body = new URLSearchParams();
    body.set("client_key", process.env.TIKTOK_CLIENT_KEY);
    body.set("client_secret", process.env.TIKTOK_CLIENT_SECRET);
    body.set("grant_type", "refresh_token");
    body.set("refresh_token", account.refresh_token);

    const refreshResp = await fetch(REFRESH_URL, {
      method:"POST",
      headers:{ "Content-Type":"application/x-www-form-urlencoded" },
      body
    });

    const data = await refreshResp.json();

    if(!refreshResp.ok || data.error){
      return res.status(400).json({ error:"TikTok refresh failed.", details:data });
    }

    const expiresAt = data.expires_in ? new Date(Date.now() + data.expires_in*1000).toISOString() : account.expires_at;
    const refreshExpiresAt = data.refresh_expires_in ? new Date(Date.now() + data.refresh_expires_in*1000).toISOString() : account.refresh_expires_at;

    await supabase.from("tiktok_accounts")
      .update({
        access_token:data.access_token,
        refresh_token:data.refresh_token || account.refresh_token,
        expires_at:expiresAt,
        refresh_expires_at:refreshExpiresAt,
        status:"connected",
        updated_at:new Date().toISOString()
      })
      .eq("user_id", req.user.id);

    res.json({ ok:true, refreshed:true, expires_at:expiresAt });
  }catch(error){
    res.status(500).json({ error:error.message || "TikTok refresh failed." });
  }
});

tiktokConnectRouter.post("/disconnect", requireAuth, async (req,res)=>{
  await supabase.from("tiktok_accounts")
    .update({
      status:"disconnected",
      access_token:"",
      refresh_token:"",
      updated_at:new Date().toISOString()
    })
    .eq("user_id", req.user.id);

  res.json({ ok:true, disconnected:true });
});

tiktokConnectRouter.post("/upload-draft-from-url", requireAuth, async (req,res)=>{
  try{
    const { video_url="", caption="" } = req.body || {};
    if(!video_url) return res.status(400).json({ error:"video_url required." });

    const account = await getConnectedAccount(req.user.id);
    if(!account?.access_token){
      return res.status(401).json({ error:"TikTok account not connected." });
    }

    const payload = {
      source_info:{
        source:"PULL_FROM_URL",
        video_url
      },
      post_info:{
        title:caption || "Created with GhostSeller AI",
        privacy_level:"SELF_ONLY",
        disable_duet:false,
        disable_comment:false,
        disable_stitch:false
      }
    };

    const resp = await fetch(UPLOAD_INIT_URL, {
      method:"POST",
      headers:{
        Authorization:`Bearer ${account.access_token}`,
        "Content-Type":"application/json; charset=UTF-8"
      },
      body:JSON.stringify(payload)
    });

    const data = await resp.json();

    await supabase.from("tiktok_publish_attempts").insert({
      id:crypto.randomUUID(),
      user_id:req.user.id,
      video_url,
      caption,
      mode:"upload_draft_from_url",
      status:resp.ok ? "sent_to_tiktok" : "failed",
      response:data,
      created_at:new Date().toISOString()
    });

    if(!resp.ok || data.error){
      return res.status(400).json({
        error:"TikTok upload draft failed.",
        details:data,
        note:"Your TikTok app may need video.upload approval and verified URL ownership."
      });
    }

    res.json({
      ok:true,
      sent:true,
      response:data,
      note:"User may need to complete posting inside TikTok inbox flow."
    });
  }catch(error){
    res.status(500).json({ error:error.message || "TikTok upload failed." });
  }
});

tiktokConnectRouter.get("/attempts", requireAuth, async (req,res)=>{
  const { data=[], error } = await supabase
    .from("tiktok_publish_attempts")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(50);

  if(error) return res.status(500).json({ error:error.message });
  res.json({ ok:true, attempts:data });
});

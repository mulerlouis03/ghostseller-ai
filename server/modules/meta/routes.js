import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";
import { requireAuth } from "../../lib/auth.js";
export const metaRouter=express.Router();

const META_APP_ID=process.env.META_APP_ID;
const META_APP_SECRET=process.env.META_APP_SECRET;
const META_REDIRECT_URI=process.env.META_REDIRECT_URI||"https://ghostseller-ai.vercel.app/api/meta/callback";
const SCOPES=["instagram_basic","instagram_content_publish","pages_show_list","pages_read_engagement","business_management"].join(",");

metaRouter.get("/status",requireAuth,async(req,res)=>{
 const {data}=await supabase.from("social_connections").select("id,provider,username,page_id,instagram_user_id,status,created_at,updated_at").eq("user_id",req.user.id).eq("provider","instagram").maybeSingle();
 res.json({configured:Boolean(META_APP_ID&&META_APP_SECRET&&META_REDIRECT_URI),connected:Boolean(data),connection:data||null,redirectUri:META_REDIRECT_URI});
});

metaRouter.get("/login",requireAuth,async(req,res)=>{
 if(!META_APP_ID||!META_REDIRECT_URI)return res.status(500).json({error:"Meta non configuré. Ajoute META_APP_ID, META_APP_SECRET, META_REDIRECT_URI dans Vercel."});
 const state=Buffer.from(JSON.stringify({userId:req.user.id,nonce:crypto.randomUUID()})).toString("base64url");
 const url=new URL("https://www.facebook.com/v20.0/dialog/oauth");
 url.searchParams.set("client_id",META_APP_ID);
 url.searchParams.set("redirect_uri",META_REDIRECT_URI);
 url.searchParams.set("scope",SCOPES);
 url.searchParams.set("response_type","code");
 url.searchParams.set("state",state);
 res.json({url:url.toString()});
});

metaRouter.get("/callback",async(req,res)=>{
 try{
  if(!META_APP_ID||!META_APP_SECRET)return res.status(500).send("Meta non configuré.");
  const {code,state}=req.query;
  if(!code||!state)return res.status(400).send("Code ou state manquant.");
  const parsed=JSON.parse(Buffer.from(String(state),"base64url").toString("utf8"));
  const tokenUrl=new URL("https://graph.facebook.com/v20.0/oauth/access_token");
  tokenUrl.searchParams.set("client_id",META_APP_ID);
  tokenUrl.searchParams.set("client_secret",META_APP_SECRET);
  tokenUrl.searchParams.set("redirect_uri",META_REDIRECT_URI);
  tokenUrl.searchParams.set("code",String(code));
  const tokenRes=await fetch(tokenUrl.toString());
  const tokenData=await tokenRes.json();
  if(!tokenRes.ok)return res.status(400).send("Erreur token Meta: "+JSON.stringify(tokenData));
  const accessToken=tokenData.access_token;

  const pagesRes=await fetch(`https://graph.facebook.com/v20.0/me/accounts?access_token=${accessToken}`);
  const pagesData=await pagesRes.json();
  const page=pagesData?.data?.[0]||null;
  let igId=null, username="Instagram connecté";

  if(page?.id){
   const igRes=await fetch(`https://graph.facebook.com/v20.0/${page.id}?fields=instagram_business_account&access_token=${page.access_token||accessToken}`);
   const igData=await igRes.json();
   igId=igData?.instagram_business_account?.id||null;
   if(igId){
    const pRes=await fetch(`https://graph.facebook.com/v20.0/${igId}?fields=username&access_token=${page.access_token||accessToken}`);
    const pData=await pRes.json();
    username=pData?.username||username;
   }
  }

  await supabase.from("social_connections").delete().eq("user_id",parsed.userId).eq("provider","instagram");
  const {error}=await supabase.from("social_connections").insert({
   id:crypto.randomUUID(),user_id:parsed.userId,provider:"instagram",username,page_id:page?.id||null,
   instagram_user_id:igId,access_token:accessToken,page_access_token:page?.access_token||null,
   status:igId?"connected":"facebook_connected_no_instagram",updated_at:new Date().toISOString()
  });
  if(error)return res.status(500).send("Erreur Supabase: "+error.message);
  res.redirect("/?meta=connected");
 }catch(e){res.status(500).send("Erreur callback Meta: "+(e.message||"inconnue"))}
});

metaRouter.post("/disconnect",requireAuth,async(req,res)=>{
 const {error}=await supabase.from("social_connections").delete().eq("user_id",req.user.id).eq("provider","instagram");
 if(error)return res.status(500).json({error:error.message});
 res.json({ok:true});
});

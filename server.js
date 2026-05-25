import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json({ limit: "2mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const APP_URL = process.env.APP_URL || "https://ghostseller-ai.vercel.app";

const supabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = supabaseConfigured ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.use(express.static(path.join(__dirname, "public")));

const PLANS = {
  Free: { name:"Free", price:"0€", credits:20, description:"Pour tester GhostSeller." },
  Starter: { name:"Starter", price:"19€/mois", credits:300, description:"Pour petits vendeurs TikTok/WhatsApp.", priceId:process.env.STRIPE_STARTER_PRICE_ID },
  Pro: { name:"Pro", price:"49€/mois", credits:1200, description:"Pour boutiques, agences et gros volume.", priceId:process.env.STRIPE_PRO_PRICE_ID }
};

function tokenFor(user){ return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" }); }
function safeUser(user){ return { id:user.id, name:user.name, email:user.email, plan:user.plan || "Free", credits:user.credits ?? 20, stripe_customer_id:user.stripe_customer_id || null }; }

async function requireAuth(req,res,next){
  try{
    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});
    const token=(req.headers.authorization||"").replace("Bearer ","");
    if(!token) return res.status(401).json({error:"Non connecté."});
    const decoded=jwt.verify(token, JWT_SECRET);
    const {data:user,error}=await supabase.from("users").select("*").eq("id", decoded.userId).single();
    if(error || !user) return res.status(401).json({error:"Session invalide."});
    req.user=user;
    next();
  }catch{
    res.status(401).json({error:"Session invalide."});
  }
}

app.get("/api/health",(req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V25",
  supabase:supabaseConfigured,
  openai:Boolean(openai),
  stripe:Boolean(stripe),
  engine:"Video Content Engine"
}));

app.post("/api/auth/register",async(req,res)=>{
  try{
    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});
    const {name,email,password}=req.body;
    if(!email||!password) return res.status(400).json({error:"Email et mot de passe obligatoires."});
    const cleanEmail=String(email).toLowerCase().trim();
    const {data:existing}=await supabase.from("users").select("id").eq("email",cleanEmail).maybeSingle();
    if(existing) return res.status(400).json({error:"Email déjà utilisé."});
    const user={id:crypto.randomUUID(),name:name||"Utilisateur",email:cleanEmail,password_hash:await bcrypt.hash(password,10),plan:"Free",credits:20};
    const {data,error}=await supabase.from("users").insert(user).select().single();
    if(error) return res.status(500).json({error:error.message});
    res.json({token:tokenFor(data),user:safeUser(data)});
  }catch{res.status(500).json({error:"Erreur inscription."});}
});

app.post("/api/auth/login",async(req,res)=>{
  try{
    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});
    const {email,password}=req.body;
    const cleanEmail=String(email||"").toLowerCase().trim();
    const {data:user}=await supabase.from("users").select("*").eq("email",cleanEmail).maybeSingle();
    if(!user || !(await bcrypt.compare(password||"", user.password_hash))) return res.status(400).json({error:"Identifiants invalides."});
    res.json({token:tokenFor(user),user:safeUser(user)});
  }catch{res.status(500).json({error:"Erreur connexion."});}
});

app.post("/api/auth/reset-password", async (req, res) => {
  try {
    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});
    const { email, newPassword } = req.body;
    if(!email || !newPassword) return res.status(400).json({error:"Email et nouveau mot de passe obligatoires."});
    if(String(newPassword).length < 6) return res.status(400).json({error:"Le mot de passe doit contenir au moins 6 caractères."});
    const cleanEmail = String(email).toLowerCase().trim();
    const { data: user } = await supabase.from("users").select("*").eq("email", cleanEmail).maybeSingle();
    if(!user) return res.status(404).json({error:"Aucun compte trouvé avec cet email."});
    const password_hash = await bcrypt.hash(newPassword, 10);
    const { error } = await supabase.from("users").update({ password_hash }).eq("id", user.id);
    if(error) return res.status(500).json({error:error.message});
    res.json({ ok:true, message:"Mot de passe réinitialisé. Tu peux te connecter." });
  } catch { res.status(500).json({error:"Erreur réinitialisation."});}
});

app.get("/api/me",requireAuth,(req,res)=>res.json({user:safeUser(req.user)}));

app.get("/api/dashboard",requireAuth,async(req,res)=>{
  const uid=req.user.id;
  const [projects,campaigns,posts,leads,trends,autoCampaigns,videos]=await Promise.all([
    supabase.from("projects").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
    supabase.from("campaigns").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
    supabase.from("posts").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
    supabase.from("leads").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
    supabase.from("trends").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
    supabase.from("auto_campaigns").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
    supabase.from("video_concepts").select("*").eq("user_id",uid).order("created_at",{ascending:false})
  ]);
  res.json({
    user:safeUser(req.user),
    projects:projects.data||[],
    campaigns:campaigns.data||[],
    posts:posts.data||[],
    leads:leads.data||[],
    trends:trends.data||[],
    autoCampaigns:autoCampaigns.data||[],
    videos:videos.data||[]
  });
});

app.post("/api/projects",requireAuth,async(req,res)=>{
  const {name,description}=req.body;
  if(!name) return res.status(400).json({error:"Nom du projet obligatoire."});
  const {data,error}=await supabase.from("projects").insert({id:crypto.randomUUID(),user_id:req.user.id,name,description:description||""}).select().single();
  if(error) return res.status(500).json({error:error.message});
  res.json({project:data});
});

app.post("/api/tiktok/schedule",requireAuth,async(req,res)=>{
  const {projectId,product,target,price,days,style}=req.body;
  if(!projectId||!product) return res.status(400).json({error:"Projet et produit obligatoires."});
  const count=Number(days)||7;
  const generated=openai ? await aiPosts({product,target,price,days:count,style}) : fallbackPosts({product,price,days:count});
  const rows=generated.map(p=>({id:crypto.randomUUID(),user_id:req.user.id,project_id:projectId,product,status:"à publier",...p}));
  const {data,error}=await supabase.from("posts").insert(rows).select();
  if(error) return res.status(500).json({error:error.message});
  await supabase.from("campaigns").insert({id:crypto.randomUUID(),user_id:req.user.id,project_id:projectId,product,type:"TikTok Planner",count:data.length});
  res.json({posts:data});
});

app.post("/api/leads",requireAuth,async(req,res)=>{
  const {projectId,name,phone,product,message}=req.body;
  if(!projectId||!name||!message) return res.status(400).json({error:"Projet, nom et message obligatoires."});
  const reply=openai ? await aiReply({name,product,message}) : `Bonjour ${name}, oui ${product||"le produit"} est disponible. Tu veux le prix et les détails ?`;
  const {data,error}=await supabase.from("leads").insert({id:crypto.randomUUID(),user_id:req.user.id,project_id:projectId,name,phone:phone||"",product:product||"",message,reply,status:"nouveau"}).select().single();
  if(error) return res.status(500).json({error:error.message});
  res.json({lead:data});
});

app.patch("/api/leads/:id",requireAuth,async(req,res)=>{
  const {data,error}=await supabase.from("leads").update({status:req.body.status,updated_at:new Date().toISOString()}).eq("id",req.params.id).eq("user_id",req.user.id).select().single();
  if(error) return res.status(404).json({error:"Lead introuvable."});
  res.json({lead:data});
});

app.post("/api/ai/trends", requireAuth, async (req,res)=>{
  const { niche, country, goal } = req.body;
  if(!niche) return res.status(400).json({error:"Niche obligatoire."});
  const result = openai ? await aiTrendScan({niche,country,goal}) : fallbackTrendScan({niche,country,goal});
  const rows = result.trends.map(t=>({
    id:crypto.randomUUID(),
    user_id:req.user.id,
    niche,
    country:country||"",
    goal:goal||"",
    title:t.title,
    reason:t.reason,
    hashtags:t.hashtags,
    viral_score:t.viral_score,
    content_angle:t.content_angle,
    cta:t.cta
  }));
  const {data,error}=await supabase.from("trends").insert(rows).select();
  if(error) return res.status(500).json({error:error.message});
  res.json({trends:data});
});

app.post("/api/ai/auto-campaign", requireAuth, async (req,res)=>{
  const { projectId, product, audience, offer, objective } = req.body;
  if(!projectId||!product) return res.status(400).json({error:"Projet et produit obligatoires."});
  const result = openai ? await aiAutoCampaign({product,audience,offer,objective}) : fallbackAutoCampaign({product,audience,offer,objective});
  const {data:campaign,error}=await supabase.from("auto_campaigns").insert({
    id:crypto.randomUUID(),
    user_id:req.user.id,
    project_id:projectId,
    product,
    audience:audience||"",
    offer:offer||"",
    objective:objective||"",
    strategy:result.strategy,
    whatsapp_cta:result.whatsapp_cta,
    viral_score:result.viral_score,
    hooks:result.hooks,
    content_plan:result.content_plan
  }).select().single();
  if(error) return res.status(500).json({error:error.message});
  res.json({campaign});
});


app.post("/api/ai/video-concept", requireAuth, async (req,res)=>{
  const {projectId, product, audience, offer, style, duration, goal} = req.body;
  if(!projectId || !product) return res.status(400).json({error:"Projet et produit obligatoires."});

  const result = openai
    ? await aiVideoConcept({product,audience,offer,style,duration,goal})
    : fallbackVideoConcept({product,audience,offer,style,duration,goal});

  const {data,error}=await supabase.from("video_concepts").insert({
    id:crypto.randomUUID(),
    user_id:req.user.id,
    project_id:projectId,
    product,
    audience:audience||"",
    offer:offer||"",
    style:style||"",
    duration:duration||"20s",
    goal:goal||"",
    viral_score:result.viral_score,
    title:result.title,
    hook:result.hook,
    storyboard:result.storyboard,
    subtitles:result.subtitles,
    voiceover:result.voiceover,
    caption:result.caption,
    hashtags:result.hashtags,
    whatsapp_cta:result.whatsapp_cta,
    template:result.template,
    production_notes:result.production_notes
  }).select().single();

  if(error) return res.status(500).json({error:error.message});
  res.json({video:data});
});

app.get("/api/billing/plans", requireAuth, async (req,res)=>res.json({plans:PLANS,currentPlan:req.user.plan||"Free",stripeConfigured:Boolean(stripe)}));

app.post("/api/billing/checkout", requireAuth, async (req,res)=>{
  try{
    const {plan}=req.body;
    if(!["Starter","Pro"].includes(plan)) return res.status(400).json({error:"Plan invalide."});
    const selected=PLANS[plan];
    if(!stripe || !selected.priceId) return res.status(400).json({error:"Stripe non configuré. Ajoute STRIPE_SECRET_KEY et le PRICE ID."});
    let customerId=req.user.stripe_customer_id;
    if(!customerId){
      const customer=await stripe.customers.create({email:req.user.email,name:req.user.name,metadata:{userId:req.user.id}});
      customerId=customer.id;
      await supabase.from("users").update({stripe_customer_id:customerId}).eq("id",req.user.id);
    }
    const session=await stripe.checkout.sessions.create({
      mode:"subscription",
      customer:customerId,
      line_items:[{price:selected.priceId,quantity:1}],
      success_url:`${APP_URL}?billing=success`,
      cancel_url:`${APP_URL}?billing=cancel`,
      metadata:{userId:req.user.id,plan}
    });
    res.json({url:session.url});
  }catch(error){res.status(500).json({error:error.message||"Erreur Stripe."});}
});

app.post("/api/billing/demo-upgrade", requireAuth, async (req,res)=>{
  const {plan}=req.body;
  if(!["Free","Starter","Pro"].includes(plan)) return res.status(400).json({error:"Plan invalide."});
  const credits = plan==="Pro" ? 1200 : plan==="Starter" ? 300 : 20;
  const {data,error}=await supabase.from("users").update({plan,credits}).eq("id",req.user.id).select().single();
  if(error) return res.status(500).json({error:error.message});
  res.json({user:safeUser(data),message:`Plan passé en ${plan}.`});
});

async function aiPosts(p){
  const prompt=`Crée ${p.days} posts TikTok pour vendre: ${p.product}. Audience: ${p.target||"grand public"}. Prix: ${p.price||"non précisé"}. Style: ${p.style||"TikTok viral"}. Retourne uniquement JSON valide {"posts":[{"date":"Jour 1","time":"18:30","title":"","hook":"","caption":"","script":"","hashtags":""}]}. CTA vers WhatsApp. Français simple.`;
  const completion=await openai.chat.completions.create({model:"gpt-4.1-mini",messages:[{role:"system",content:"JSON uniquement."},{role:"user",content:prompt}],temperature:.85});
  return JSON.parse(completion.choices[0].message.content).posts;
}

async function aiReply(p){
  const prompt=`Réponds comme vendeur WhatsApp. Client:${p.name}. Produit:${p.product||"non précisé"}. Message:${p.message}. Réponse française courte, naturelle, max 2 phrases.`;
  const completion=await openai.chat.completions.create({model:"gpt-4.1-mini",messages:[{role:"system",content:"Réponse WhatsApp uniquement."},{role:"user",content:prompt}],temperature:.75});
  return completion.choices[0].message.content;
}

async function aiTrendScan(p){
  const prompt=`Analyse la niche TikTok suivante et propose 5 tendances exploitables.
Niche: ${p.niche}
Pays/marché: ${p.country||"global"}
Objectif: ${p.goal||"générer clients WhatsApp"}
Retourne JSON valide:
{"trends":[{"title":"","reason":"","hashtags":"","viral_score":85,"content_angle":"","cta":""}]}
Score viral entre 0 et 100.`;
  const completion=await openai.chat.completions.create({model:"gpt-4.1-mini",messages:[{role:"system",content:"JSON uniquement."},{role:"user",content:prompt}],temperature:.8});
  return JSON.parse(completion.choices[0].message.content);
}

async function aiAutoCampaign(p){
  const prompt=`Crée une campagne semi-autonome TikTok -> WhatsApp.
Produit: ${p.product}
Audience: ${p.audience||"grand public"}
Offre: ${p.offer||"non précisée"}
Objectif: ${p.objective||"générer ventes"}
Retourne JSON:
{"strategy":"","whatsapp_cta":"","viral_score":88,"hooks":[""],"content_plan":[{"day":"Jour 1","video":"","caption":"","cta":""}]}`;
  const completion=await openai.chat.completions.create({model:"gpt-4.1-mini",messages:[{role:"system",content:"JSON uniquement."},{role:"user",content:prompt}],temperature:.85});
  return JSON.parse(completion.choices[0].message.content);
}


async function aiVideoConcept(p){
  const prompt=`Tu es GhostSeller AI V25, moteur de contenu TikTok.
Crée un concept vidéo TikTok très vendeur.
Produit: ${p.product}
Audience: ${p.audience||"grand public"}
Offre: ${p.offer||"non précisée"}
Style: ${p.style||"viral émotionnel"}
Durée: ${p.duration||"20s"}
Objectif: ${p.goal||"générer leads WhatsApp"}

Retourne uniquement JSON valide:
{
 "title":"",
 "hook":"",
 "viral_score":90,
 "template":"Problem/Solution|Storytelling|UGC|BeforeAfter|Urgence",
 "storyboard":[{"scene":1,"duration":"0-3s","visual":"","text_overlay":"","action":""}],
 "subtitles":[""],
 "voiceover":"",
 "caption":"",
 "hashtags":"",
 "whatsapp_cta":"",
 "production_notes":""
}
Règles: scènes très courtes, sous-titres puissants, CTA WhatsApp clair, langage simple.`;
  const completion=await openai.chat.completions.create({model:"gpt-4.1-mini",messages:[{role:"system",content:"JSON uniquement."},{role:"user",content:prompt}],temperature:.85});
  return JSON.parse(completion.choices[0].message.content);
}

function fallbackVideoConcept({product,audience,offer,style,duration,goal}){
  return {
    title:`Vidéo virale pour ${product}`,
    hook:`Tu dois voir ça avant de choisir ${product}`,
    viral_score:84,
    template:"Problem/Solution",
    storyboard:[
      {scene:1,duration:"0-3s",visual:`Plan rapide sur ${product}`,text_overlay:"Tu connais ce problème ?",action:"Zoom rapide"},
      {scene:2,duration:"3-10s",visual:"Montrer la solution",text_overlay:`${product} simplifie tout`,action:"Démonstration"},
      {scene:3,duration:"10-18s",visual:"Afficher offre",text_overlay:offer||"Offre disponible",action:"Preuve sociale"},
      {scene:4,duration:"18-22s",visual:"CTA WhatsApp",text_overlay:"Écris INFO maintenant",action:"Bouton WhatsApp"}
    ],
    subtitles:["Tu connais ce problème ?","Voici la solution simple.","Écris INFO sur WhatsApp."],
    voiceover:`Si tu as besoin de ${product}, regarde ça. ${offer||"Offre disponible"}. Écris INFO maintenant sur WhatsApp.`,
    caption:`${product} disponible. Écris INFO sur WhatsApp.`,
    hashtags:"#viral #tiktokbusiness #whatsapp #vente",
    whatsapp_cta:"Écris INFO sur WhatsApp maintenant.",
    production_notes:"Format vertical 9:16, sous-titres grands, rythme rapide."
  };
}

function fallbackPosts({product,price,days}){
  return Array.from({length:days}).map((_,i)=>({date:`Jour ${i+1}`,time:["12:30","18:00","20:30"][i%3],title:`Post ${i+1} - ${product}`,hook:`Tu dois voir ce ${product}`,caption:`${product} disponible maintenant. Écris INFO sur WhatsApp.`,script:`Scène 1: montre ${product}.\\nScène 2: montre le bénéfice.\\nScène 3: affiche ${price||"l’offre"}.\\nScène 4: CTA WhatsApp.`,hashtags:`#viral #tiktokbusiness #vente #whatsapp #${String(product).replaceAll(" ","")}`}));
}
function fallbackTrendScan({niche,country,goal}){return {trends:Array.from({length:5}).map((_,i)=>({title:`Tendance ${i+1} ${niche}`,reason:"Format court, émotionnel et facile à commenter.",hashtags:"#viral #tiktok #business #whatsapp",viral_score:75+i*3,content_angle:"Problème client + solution rapide",cta:"Écris INFO sur WhatsApp"}))};}
function fallbackAutoCampaign({product,audience,offer,objective}){return {strategy:`Publier 7 vidéos courtes autour de ${product}, capter commentaires puis pousser WhatsApp.`,whatsapp_cta:"Écris INFO maintenant sur WhatsApp.",viral_score:82,hooks:[`Tu savais que ${product} pouvait te sauver du temps ?`,`Personne ne parle assez de ${product}.`,`Si tu as besoin de ${product}, regarde ça.`],content_plan:[{day:"Jour 1",video:"Problème + solution",caption:"Tu veux les détails ? Écris INFO.",cta:"WhatsApp"}]};}

app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
export default app;

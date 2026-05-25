import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
app.use(express.json({ limit: "2mb" }));

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const JWT_SECRET = process.env.JWT_SECRET || "change_me";
const supabaseConfigured = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
const supabase = supabaseConfigured ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

app.use(express.static(path.join(__dirname, "public")));

function tokenFor(user){ return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" }); }
function safeUser(user){ return { id:user.id, name:user.name, email:user.email, plan:user.plan || "Free", credits:user.credits ?? 20 }; }

async function requireAuth(req,res,next){
  try{
    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});
    const token=(req.headers.authorization||"").replace("Bearer ","");
    if(!token) return res.status(401).json({error:"Non connecté."});
    const decoded=jwt.verify(token, JWT_SECRET);
    const {data:user,error}=await supabase.from("users").select("*").eq("id", decoded.userId).single();
    if(error || !user) return res.status(401).json({error:"Session invalide."});
    req.user=user; next();
  }catch{ res.status(401).json({error:"Session invalide."}); }
}

app.get("/api/health",(req,res)=>res.json({ok:true,version:"GhostSeller AI V22",supabase:supabaseConfigured,openai:Boolean(openai)}));

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
  }catch{ res.status(500).json({error:"Erreur inscription."}); }
});

app.post("/api/auth/login",async(req,res)=>{
  try{
    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});
    const {email,password}=req.body;
    const cleanEmail=String(email||"").toLowerCase().trim();
    const {data:user}=await supabase.from("users").select("*").eq("email",cleanEmail).maybeSingle();
    if(!user || !(await bcrypt.compare(password||"", user.password_hash))) return res.status(400).json({error:"Identifiants invalides."});
    res.json({token:tokenFor(user),user:safeUser(user)});
  }catch{ res.status(500).json({error:"Erreur connexion."}); }
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
  } catch {
    res.status(500).json({error:"Erreur réinitialisation."});
  }
});

app.get("/api/me",requireAuth,(req,res)=>res.json({user:safeUser(req.user)}));

app.get("/api/dashboard",requireAuth,async(req,res)=>{
  const uid=req.user.id;
  const [projects,campaigns,posts,leads]=await Promise.all([
    supabase.from("projects").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
    supabase.from("campaigns").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
    supabase.from("posts").select("*").eq("user_id",uid).order("created_at",{ascending:false}),
    supabase.from("leads").select("*").eq("user_id",uid).order("created_at",{ascending:false})
  ]);
  res.json({user:safeUser(req.user),projects:projects.data||[],campaigns:campaigns.data||[],posts:posts.data||[],leads:leads.data||[]});
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
function fallbackPosts({product,price,days}){
  return Array.from({length:days}).map((_,i)=>({date:`Jour ${i+1}`,time:["12:30","18:00","20:30"][i%3],title:`Post ${i+1} - ${product}`,hook:`Tu dois voir ce ${product}`,caption:`${product} disponible maintenant. Écris INFO sur WhatsApp.`,script:`Scène 1: montre ${product}.\nScène 2: montre le bénéfice.\nScène 3: affiche ${price||"l’offre"}.\nScène 4: CTA WhatsApp.`,hashtags:`#viral #tiktokbusiness #vente #whatsapp #${String(product).replaceAll(" ","")}`}));
}
app.get("*",(req,res)=>res.sendFile(path.join(__dirname,"public","index.html")));
export default app;

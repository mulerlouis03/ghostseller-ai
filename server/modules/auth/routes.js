import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabase } from "../../lib/supabase.js";
import { requireAuth, safeUser, tokenFor } from "../../lib/auth.js";
export const authRouter = express.Router();
authRouter.post("/register",async(req,res)=>{
 try{
  if(!supabase)return res.status(500).json({error:"Supabase non configuré."});
  const {name,email,password}=req.body;
  if(!email||!password)return res.status(400).json({error:"Email et mot de passe obligatoires."});
  const cleanEmail=String(email).toLowerCase().trim();
  const {data:existing}=await supabase.from("users").select("id").eq("email",cleanEmail).maybeSingle();
  if(existing)return res.status(400).json({error:"Email déjà utilisé."});
  const user={id:crypto.randomUUID(),name:name||"Utilisateur",email:cleanEmail,password_hash:await bcrypt.hash(password,10),plan:"Free",credits:20,role:"user"};
  const {data,error}=await supabase.from("users").insert(user).select().single();
  if(error)return res.status(500).json({error:error.message});
  res.json({token:tokenFor(data),user:safeUser(data)});
 }catch{res.status(500).json({error:"Erreur inscription."});}
});
authRouter.post("/login",async(req,res)=>{
 try{
  if(!supabase)return res.status(500).json({error:"Supabase non configuré."});
  const cleanEmail=String(req.body.email||"").toLowerCase().trim();
  const {data:user}=await supabase.from("users").select("*").eq("email",cleanEmail).maybeSingle();
  if(!user||!(await bcrypt.compare(req.body.password||"",user.password_hash)))return res.status(400).json({error:"Identifiants invalides."});
  res.json({token:tokenFor(user),user:safeUser(user)});
 }catch{res.status(500).json({error:"Erreur connexion."});}
});
authRouter.get("/me",requireAuth,(req,res)=>res.json({user:safeUser(req.user)}));

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email obligatoire." });
    if (!supabase) return res.status(500).json({ error: "Supabase non configuré." });

    const redirectTo = `${process.env.APP_URL || "https://ghostseller-ai.vercel.app"}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    if (error) return res.status(400).json({ error: error.message });

    res.json({ ok:true, message:"Si ce compte existe, un email de réinitialisation a été envoyé." });
  } catch (error) {
    res.status(500).json({ error:error.message || "Erreur recovery." });
  }
});

authRouter.post("/update-password", async (req, res) => {
  try {
    const { access_token, refresh_token, password } = req.body;
    if (!access_token || !refresh_token || !password) return res.status(400).json({ error:"Token et nouveau mot de passe obligatoires." });
    if (password.length < 8) return res.status(400).json({ error:"Le mot de passe doit contenir au moins 8 caractères." });
    if (!supabase) return res.status(500).json({ error:"Supabase non configuré." });

    const { error: sessionError } = await supabase.auth.setSession({ access_token, refresh_token });
    if (sessionError) return res.status(400).json({ error: sessionError.message });

    const { error } = await supabase.auth.updateUser({ password });
    if (error) return res.status(400).json({ error:error.message });

    res.json({ ok:true, message:"Mot de passe mis à jour." });
  } catch (error) {
    res.status(500).json({ error:error.message || "Erreur changement mot de passe." });
  }
});

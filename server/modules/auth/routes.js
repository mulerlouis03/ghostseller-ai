import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabase } from "../../lib/supabase.js";
import { requireAuth, safeUser, tokenFor } from "../../lib/auth.js";

export const authRouter = express.Router();

function cleanEmail(email){
  return String(email || "").toLowerCase().trim();
}

async function getPublicUserByEmail(email){
  const { data } = await supabase
    .from("users")
    .select("*")
    .eq("email", cleanEmail(email))
    .maybeSingle();

  return data || null;
}

async function ensurePublicUser({ id, name, email, password, role="user", plan="Free", credits=20 }){
  const existing = await getPublicUserByEmail(email);
  const password_hash = password ? await bcrypt.hash(password, 10) : existing?.password_hash;

  if(existing){
    const update = {
      name: existing.name || name || "Utilisateur",
      role: existing.role || role,
      plan: existing.plan || plan,
      credits: existing.credits ?? credits
    };

    if(password_hash) update.password_hash = password_hash;

    const { data, error } = await supabase
      .from("users")
      .update(update)
      .eq("id", existing.id)
      .select()
      .single();

    if(error) throw error;
    return data;
  }

  const user = {
    id: id || crypto.randomUUID(),
    name: name || "Utilisateur",
    email: cleanEmail(email),
    password_hash,
    plan,
    credits,
    role
  };

  const { data, error } = await supabase
    .from("users")
    .insert(user)
    .select()
    .single();

  if(error) throw error;
  return data;
}

authRouter.post("/register", async (req,res)=>{
  try{
    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});

    const { name, email, password } = req.body;
    const userEmail = cleanEmail(email);

    if(!userEmail || !password){
      return res.status(400).json({error:"Email et mot de passe obligatoires."});
    }

    if(password.length < 8){
      return res.status(400).json({error:"Le mot de passe doit contenir au moins 8 caractères."});
    }

    const existingPublic = await getPublicUserByEmail(userEmail);
    if(existingPublic){
      return res.status(400).json({error:"Email déjà utilisé."});
    }

    let authUserId = null;

    try{
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userEmail,
        password,
        email_confirm: true,
        user_metadata: { name: name || "Utilisateur" }
      });

      if(authError && !String(authError.message || "").toLowerCase().includes("already")){
        return res.status(400).json({error:authError.message});
      }

      authUserId = authData?.user?.id || null;
    }catch(e){
      // On continue en fallback table users si Supabase Auth admin refuse,
      // mais le login tentera quand même la table users.
      authUserId = null;
    }

    const user = await ensurePublicUser({
      id: authUserId || crypto.randomUUID(),
      name: name || "Utilisateur",
      email: userEmail,
      password,
      role:"user",
      plan:"Free",
      credits:20
    });

    res.json({ token: tokenFor(user), user: safeUser(user) });
  }catch(error){
    res.status(500).json({error:error.message || "Erreur inscription."});
  }
});

authRouter.post("/login", async (req,res)=>{
  try{
    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});

    const userEmail = cleanEmail(req.body.email);
    const password = String(req.body.password || "");

    if(!userEmail || !password){
      return res.status(400).json({error:"Email et mot de passe obligatoires."});
    }

    let publicUser = await getPublicUserByEmail(userEmail);

    // 1) Login historique GhostSeller : table users + bcrypt
    if(publicUser?.password_hash){
      const ok = await bcrypt.compare(password, publicUser.password_hash);
      if(ok){
        return res.json({ token: tokenFor(publicUser), user: safeUser(publicUser) });
      }
    }

    // 2) Fallback Supabase Auth : utile après reset password
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: userEmail,
      password
    });

    if(authError || !authData?.user){
      return res.status(400).json({error:"Identifiants invalides."});
    }

    // 3) Synchronise Supabase Auth -> table users
    publicUser = await ensurePublicUser({
      id: authData.user.id,
      name: authData.user.user_metadata?.name || publicUser?.name || "Utilisateur",
      email: userEmail,
      password,
      role: publicUser?.role || "user",
      plan: publicUser?.plan || "Free",
      credits: publicUser?.credits ?? 20
    });

    res.json({ token: tokenFor(publicUser), user: safeUser(publicUser) });
  }catch(error){
    res.status(500).json({error:error.message || "Erreur connexion."});
  }
});

authRouter.post("/forgot-password", async (req,res)=>{
  try{
    const email = cleanEmail(req.body.email);
    if(!email) return res.status(400).json({error:"Email obligatoire."});
    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});

    const redirectTo = `${process.env.APP_URL || "https://ghostseller-ai.vercel.app"}/reset-password`;

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });

    if(error) return res.status(400).json({error:error.message});

    res.json({
      ok:true,
      message:"Si ce compte existe, un email de réinitialisation a été envoyé."
    });
  }catch(error){
    res.status(500).json({error:error.message || "Erreur recovery."});
  }
});

authRouter.post("/update-password", async (req,res)=>{
  try{
    const { access_token, refresh_token, password } = req.body;

    if(!access_token || !refresh_token || !password){
      return res.status(400).json({error:"Token et nouveau mot de passe obligatoires."});
    }

    if(password.length < 8){
      return res.status(400).json({error:"Le mot de passe doit contenir au moins 8 caractères."});
    }

    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token,
      refresh_token
    });

    if(sessionError) return res.status(400).json({error:sessionError.message});

    const { error } = await supabase.auth.updateUser({ password });
    if(error) return res.status(400).json({error:error.message});

    const authUser = sessionData?.user;
    const email = cleanEmail(authUser?.email);

    if(email){
      await ensurePublicUser({
        id: authUser.id,
        name: authUser.user_metadata?.name || "Utilisateur",
        email,
        password,
        role:"user",
        plan:"Free",
        credits:20
      });
    }

    res.json({ok:true,message:"Mot de passe mis à jour."});
  }catch(error){
    res.status(500).json({error:error.message || "Erreur changement mot de passe."});
  }
});

authRouter.get("/me", requireAuth, (req,res)=>res.json({user:safeUser(req.user)}));

import express from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { supabase } from "../../lib/supabase.js";
import { requireAuth, safeUser, tokenFor } from "../../lib/auth.js";

export const authRouter = express.Router();

authRouter.post("/register", async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: "Supabase non configuré." });

    const { name, email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email et mot de passe obligatoires." });

    const cleanEmail = String(email).toLowerCase().trim();

    const { data: existing } = await supabase.from("users").select("id").eq("email", cleanEmail).maybeSingle();
    if (existing) return res.status(400).json({ error: "Email déjà utilisé." });

    const user = {
      id: crypto.randomUUID(),
      name: name || "Utilisateur",
      email: cleanEmail,
      password_hash: await bcrypt.hash(password, 10),
      plan: "Free",
      credits: 20,
      role: "user"
    };

    const { data, error } = await supabase.from("users").insert(user).select().single();
    if (error) return res.status(500).json({ error: error.message });

    res.json({ token: tokenFor(data), user: safeUser(data) });
  } catch {
    res.status(500).json({ error: "Erreur inscription." });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    if (!supabase) return res.status(500).json({ error: "Supabase non configuré." });

    const { email, password } = req.body;
    const cleanEmail = String(email || "").toLowerCase().trim();

    const { data: user } = await supabase.from("users").select("*").eq("email", cleanEmail).maybeSingle();

    if (!user || !(await bcrypt.compare(password || "", user.password_hash))) {
      return res.status(400).json({ error: "Identifiants invalides." });
    }

    res.json({ token: tokenFor(user), user: safeUser(user) });
  } catch {
    res.status(500).json({ error: "Erreur connexion." });
  }
});

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: safeUser(req.user) });
});

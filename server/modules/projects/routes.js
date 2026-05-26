import express from "express";
import crypto from "crypto";
import { supabase } from "../../lib/supabase.js";
import { requireAuth, safeUser } from "../../lib/auth.js";

export const projectRouter = express.Router();

projectRouter.get("/dashboard", requireAuth, async (req, res) => {
  const uid = req.user.id;

  const [projects, posts, leads, trends, autoCampaigns, videos] = await Promise.all([
    supabase.from("projects").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("posts").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("leads").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("trends").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("auto_campaigns").select("*").eq("user_id", uid).order("created_at", { ascending: false }),
    supabase.from("video_concepts").select("*").eq("user_id", uid).order("created_at", { ascending: false })
  ]);

  res.json({
    user: safeUser(req.user),
    projects: projects.data || [],
    posts: posts.data || [],
    leads: leads.data || [],
    trends: trends.data || [],
    autoCampaigns: autoCampaigns.data || [],
    videos: videos.data || []
  });
});

projectRouter.post("/", requireAuth, async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ error: "Nom du projet obligatoire." });

  const { data, error } = await supabase
    .from("projects")
    .insert({ id: crypto.randomUUID(), user_id: req.user.id, name, description: description || "" })
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ project: data });
});

import express from "express";
import { supabase } from "../../lib/supabase.js";
import { requireAuth, safeUser } from "../../lib/auth.js";

export const adminRouter = express.Router();

function requireAdmin(req, res, next) {
  if ((req.user.role || "user") !== "admin") {
    return res.status(403).json({ error: "Accès admin refusé." });
  }
  next();
}

adminRouter.get("/stats", requireAuth, requireAdmin, async (req, res) => {
  const [users, projects, posts, leads, trends, videos] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("posts").select("id", { count: "exact", head: true }),
    supabase.from("leads").select("id", { count: "exact", head: true }),
    supabase.from("trends").select("id", { count: "exact", head: true }),
    supabase.from("video_concepts").select("id", { count: "exact", head: true })
  ]);

  res.json({
    users: users.count || 0,
    projects: projects.count || 0,
    posts: posts.count || 0,
    leads: leads.count || 0,
    trends: trends.count || 0,
    videos: videos.count || 0
  });
});

adminRouter.get("/users", requireAuth, requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("users")
    .select("id,name,email,plan,credits,role,created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) return res.status(500).json({ error: error.message });

  res.json({ users: data.map(safeUser) });
});

adminRouter.patch("/users/:id", requireAuth, requireAdmin, async (req, res) => {
  const allowed = {};
  if (req.body.plan) allowed.plan = req.body.plan;
  if (typeof req.body.credits === "number") allowed.credits = req.body.credits;
  if (req.body.role) allowed.role = req.body.role;

  const { data, error } = await supabase
    .from("users")
    .update(allowed)
    .eq("id", req.params.id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.json({ user: safeUser(data) });
});
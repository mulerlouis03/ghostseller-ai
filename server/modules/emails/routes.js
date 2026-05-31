import express from "express";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";
import { sendSystemEmail, welcomeEmailTemplate, emailConfigured } from "../../lib/email.js";

export const emailsRouter = express.Router();

emailsRouter.get("/status", requireAuth, async (req,res)=>{
  const { data=[] } = await supabase
    .from("email_logs")
    .select("*")
    .eq("user_id", req.user.id)
    .order("created_at",{ascending:false})
    .limit(20);

  res.json({
    ok:true,
    configured:emailConfigured(),
    mode:emailConfigured() ? "real" : "simulation",
    recent:data
  });
});

emailsRouter.post("/welcome", requireAuth, async (req,res)=>{
  const language = req.headers["x-ghostseller-language"] || req.body?.language || "fr";
  const template = welcomeEmailTemplate({
    name:req.user.name || req.user.email,
    language
  });

  const result = await sendSystemEmail({
    user_id:req.user.id,
    to:req.user.email,
    subject:template.subject,
    html:template.html,
    type:"welcome"
  });

  res.json({
    ok:true,
    result
  });
});

emailsRouter.post("/send-test", requireAuth, async (req,res)=>{
  if(!["owner","admin"].includes(req.user.role || "")){
    return res.status(403).json({ error:"Owner/admin only." });
  }

  const { to=req.user.email, subject="GhostSeller AI test email", message="Test email from GhostSeller AI." } = req.body || {};

  const result = await sendSystemEmail({
    user_id:req.user.id,
    to,
    subject,
    html:`<h1>${subject}</h1><p>${message}</p>`,
    type:"test"
  });

  res.json({
    ok:true,
    result
  });
});

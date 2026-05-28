import { supabase } from "../lib/supabase.js";

export const PLAN_LIMITS = {
  Free: { credits:20, projects:1, posts:10, leads:10 },
  Starter: { credits:300, projects:5, posts:100, leads:100 },
  Pro: { credits:1200, projects:25, posts:500, leads:500 },
  Agency: { credits:5000, projects:100, posts:2500, leads:2500 },
  Owner: { credits:999999, projects:999999, posts:999999, leads:999999 }
};

export function getLimits(user){
  if(!user) return PLAN_LIMITS.Free;
  if(["owner","admin"].includes(user.role || "")) return PLAN_LIMITS.Owner;
  return PLAN_LIMITS[user.plan] || PLAN_LIMITS.Free;
}

export async function ensureUsageRow(userId){
  const { data } = await supabase.from("usage_counters").select("*").eq("user_id", userId).maybeSingle();
  if(data) return data;

  const { data:created, error } = await supabase.from("usage_counters").insert({
    user_id:userId,
    used_credits:0,
    used_posts:0,
    used_leads:0,
    used_projects:0,
    updated_at:new Date().toISOString()
  }).select().single();

  if(error) throw error;
  return created;
}

export function requireCredits(cost=1, usageType="posts"){
  return async (req,res,next)=>{
    try{
      if(!req.user) return res.status(401).json({ error:"Non connecté." });

      const limits = getLimits(req.user);
      const usage = await ensureUsageRow(req.user.id);

      if((usage.used_credits || 0) + cost > limits.credits){
        return res.status(402).json({
          error:"Crédits insuffisants.",
          code:"CREDITS_LIMIT_REACHED",
          plan:req.user.plan || "Free",
          used:usage.used_credits || 0,
          limit:limits.credits,
          upgrade_required:true
        });
      }

      if(usageType === "posts" && (usage.used_posts || 0) + 1 > limits.posts){
        return res.status(402).json({
          error:"Limite de posts IA atteinte.",
          code:"POST_LIMIT_REACHED",
          used:usage.used_posts || 0,
          limit:limits.posts,
          upgrade_required:true
        });
      }

      if(usageType === "leads" && (usage.used_leads || 0) + 1 > limits.leads){
        return res.status(402).json({
          error:"Limite de leads atteinte.",
          code:"LEAD_LIMIT_REACHED",
          used:usage.used_leads || 0,
          limit:limits.leads,
          upgrade_required:true
        });
      }

      req.usageCost = cost;
      req.usageType = usageType;
      next();
    }catch(error){
      res.status(500).json({ error:error.message || "Usage check failed." });
    }
  };
}

export async function consumeUsage(userId, cost=1, usageType="posts"){
  const usage = await ensureUsageRow(userId);
  const update = {
    used_credits:(usage.used_credits || 0) + cost,
    updated_at:new Date().toISOString()
  };
  if(usageType === "posts") update.used_posts = (usage.used_posts || 0) + 1;
  if(usageType === "leads") update.used_leads = (usage.used_leads || 0) + 1;
  if(usageType === "projects") update.used_projects = (usage.used_projects || 0) + 1;

  const { data, error } = await supabase.from("usage_counters").update(update).eq("user_id", userId).select().single();
  if(error) throw error;

  try{
    await supabase.from("usage_events").insert({
      user_id:userId,
      event_type:"consume",
      cost,
      usage_type:usageType,
      metadata:{},
      created_at:new Date().toISOString()
    });
  }catch(_e){}

  return data;
}

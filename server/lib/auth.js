import jwt from "jsonwebtoken";
import { supabase } from "./supabase.js";
const JWT_SECRET = process.env.JWT_SECRET || "change_me";
export function tokenFor(user){ return jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn:"7d" }); }
export function safeUser(user){ return { id:user.id, name:user.name, email:user.email, plan:user.plan||"Free", credits:user.credits??20, role:user.role||"user", stripe_customer_id:user.stripe_customer_id||null }; }
export async function requireAuth(req,res,next){
  try{
    if(!supabase) return res.status(500).json({error:"Supabase non configuré."});
    const token=(req.headers.authorization||"").replace("Bearer ","");
    if(!token) return res.status(401).json({error:"Non connecté."});
    const decoded=jwt.verify(token, JWT_SECRET);
    const {data:user,error}=await supabase.from("users").select("*").eq("id",decoded.userId).single();
    if(error||!user) return res.status(401).json({error:"Session invalide."});
    req.user=user; next();
  }catch{ res.status(401).json({error:"Session invalide."}); }
}


export function requireOwner(req, res, next) {
  if ((req.user?.role || "user") !== "owner") {
    return res.status(403).json({ error: "Accès propriétaire refusé." });
  }
  next();
}

export function requireAdminOrOwner(req, res, next) {
  const role = req.user?.role || "user";
  if (!["admin", "owner"].includes(role)) {
    return res.status(403).json({ error: "Accès admin refusé." });
  }
  next();
}

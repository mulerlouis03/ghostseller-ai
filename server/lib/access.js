export const DEFAULT_LIMITS = {
  Free: {
    credits: 20,
    max_projects: 1,
    max_posts: 10,
    max_leads: 10
  },
  Starter: {
    credits: 300,
    max_projects: 5,
    max_posts: 100,
    max_leads: 100
  },
  Pro: {
    credits: 1200,
    max_projects: 25,
    max_posts: 500,
    max_leads: 500
  },
  Owner: {
    credits: 9999,
    max_projects: 999,
    max_posts: 9999,
    max_leads: 9999
  }
};

export function canUseApp(user){
  if(!user) return false;
  if(["owner","admin"].includes(user.role || "user")) return true;
  return (user.access_status || "approved") === "approved";
}

export function requireApprovedAccess(req,res,next){
  if(!req.user) return res.status(401).json({error:"Non connecté."});

  if(["owner","admin"].includes(req.user.role || "user")){
    return next();
  }

  if((req.user.access_status || "approved") !== "approved"){
    return res.status(403).json({
      error:"Compte en attente d'approbation.",
      access_status:req.user.access_status || "pending"
    });
  }

  next();
}

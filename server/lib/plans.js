export const PLAN_LIMITS = {
 Free:{name:"Free",price:"0€",credits:20,projects:1,tiktokPosts:10,leads:10,autopilot:1,description:"Pour tester GhostSeller."},
 Starter:{name:"Starter",price:"9,99€/mois",credits:300,projects:5,tiktokPosts:150,leads:100,autopilot:10,description:"Prix lancement TikTok/WhatsApp.",priceId:process.env.STRIPE_STARTER_PRICE_ID},
 Pro:{name:"Pro",price:"29€/mois",credits:1200,projects:25,tiktokPosts:800,leads:500,autopilot:50,description:"Pour boutiques, agences et gros volume.",priceId:process.env.STRIPE_PRO_PRICE_ID}
};
export function getPlan(user){return PLAN_LIMITS[user?.plan||"Free"]||PLAN_LIMITS.Free}
export function requireCredits(req,res,next){
 const credits=Number(req.user?.credits||0);
 if(credits<=0) return res.status(402).json({error:"Crédits insuffisants. Passe au plan Starter ou Pro pour continuer."});
 next();
}
export async function spendCredits(supabase,userId,amount=1){
 const {data:user}=await supabase.from("users").select("credits").eq("id",userId).single();
 const nextCredits=Math.max(0,Number(user?.credits||0)-amount);
 await supabase.from("users").update({credits:nextCredits}).eq("id",userId);
 return nextCredits;
}

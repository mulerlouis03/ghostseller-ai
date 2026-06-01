export const PRICING_PLANS = {
  Free: {
    id:"free",
    name:"Free",
    price:0,
    currency:"eur",
    credits:20,
    projects:1,
    posts:10,
    leads:10,
    stripe_price_id:null,
    features:[
      "20 credits",
      "1 project",
      "Basic AI content",
      "Opportunity preview"
    ]
  },
  Starter: {
    id:"starter",
    name:"Starter",
    price:9.99,
    currency:"eur",
    credits:300,
    projects:5,
    posts:100,
    leads:100,
    stripe_price_id:process.env.STRIPE_PRICE_STARTER || "",
    features:[
      "300 credits / month",
      "5 projects",
      "TikTok/Reels content engine",
      "Ghost Brain history"
    ]
  },
  Pro: {
    id:"pro",
    name:"Pro",
    price:29,
    currency:"eur",
    credits:1200,
    projects:25,
    posts:500,
    leads:500,
    stripe_price_id:process.env.STRIPE_PRICE_PRO || "",
    features:[
      "1200 credits / month",
      "25 projects",
      "Creative Director AI",
      "AI CMO",
      "Autopilot workflows",
      "Persistent Memory"
    ]
  },
  Agency: {
    id:"agency",
    name:"Agency",
    price:79,
    currency:"eur",
    credits:5000,
    projects:100,
    posts:2500,
    leads:2500,
    stripe_price_id:process.env.STRIPE_PRICE_AGENCY || "",
    features:[
      "5000 credits / month",
      "100 projects",
      "Multi-agent intelligence",
      "Execution engine",
      "Priority growth workflows",
      "Client campaign templates"
    ]
  }
};

export function getPlanByName(name){
  return PRICING_PLANS[name] || PRICING_PLANS.Free;
}

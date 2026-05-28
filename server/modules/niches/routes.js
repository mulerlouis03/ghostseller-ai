import express from "express";

export const nichesRouter = express.Router();

const GLOBAL_NICHES = [
  "E-commerce",
  "Beauty & Cosmetics",
  "Fitness & Coaching",
  "Real Estate",
  "Restaurants",
  "Personal Brand",
  "AI Tools",
  "Finance",
  "Luxury",
  "Travel",
  "Local Business",
  "Education",
  "Fashion",
  "Automotive",
  "Gaming",
  "Music",
  "Content Creator",
  "Agency",
  "Tech Startup",
  "Health & Wellness"
];

nichesRouter.get("/global", (req,res)=>{
  res.json({
    ok:true,
    niches: GLOBAL_NICHES
  });
});

nichesRouter.post("/detect", (req,res)=>{
  const { business="", keywords="" } = req.body || {};
  const text = `${business} ${keywords}`.toLowerCase();

  let detected = "Local Business";

  if(text.includes("beauty")) detected = "Beauty & Cosmetics";
  else if(text.includes("coach")) detected = "Fitness & Coaching";
  else if(text.includes("real estate")) detected = "Real Estate";
  else if(text.includes("shop")) detected = "E-commerce";
  else if(text.includes("restaurant")) detected = "Restaurants";
  else if(text.includes("agency")) detected = "Agency";
  else if(text.includes("startup")) detected = "Tech Startup";

  res.json({
    ok:true,
    detected_niche: detected
  });
});

import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V65 PERSISTENT AUTONOMOUS MEMORY",
  phase:"Persistent Learning Intelligence",
  persistentMemory:true,
  strategyLearning:true,
  hookLearning:true,
  nicheLearning:true,
  campaignRanking:true,
  behavioralMemory:true,
  longTermUserMemory:true,
  autonomousExperienceAccumulation:true
}));

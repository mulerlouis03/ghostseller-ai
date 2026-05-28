import express from "express";

export const healthRouter = express.Router();

healthRouter.get("/", (req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V59 AI OPERATING SYSTEM",
  phase:"Business AI Operating System",
  aiOperatingSystem:true,
  growthScore:true,
  smartCalendar:true,
  leadPipeline:true,
  aiTasks:true,
  recommendations:true,
  memoryLongTerm:true,
  autopilotReady:true
}));

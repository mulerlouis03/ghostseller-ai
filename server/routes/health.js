import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V87 TIKTOK AUTOMATION STUDIO",
  phase:"TikTok Automation + Scheduling",
  basedOn:"V86 validated",
  unifiedBrainCrashFixed:true,
  tiktokAutomation:true,
  tiktokCalendar:true,
  scheduledPosts:true,
  videoScripts:true,
  safePublishingQueue:true
}));

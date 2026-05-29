import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V92 TIKTOK CONNECT OAUTH",
  phase:"Official TikTok Connection",
  basedOn:"V91 clean dashboard",
  tiktokOAuth:true,
  tokenStorage:true,
  refreshToken:true,
  accountStatus:true,
  safeUploadReady:true,
  note:"Real TikTok publishing requires TikTok Developer approval for video.upload or video.publish."
}));

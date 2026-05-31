import express from "express";
export const healthRouter = express.Router();
healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V122 WORKSPACE UX FIX",
  compactUpload:true,
  reducedEmptySpace:true,
  workspaceCards:true
}));

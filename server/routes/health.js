import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V121 PRODUCT UPLOAD",
  phase:"Product attachment upload for AI employee mode",
  productUpload:true,
  imagePreview:true,
  productContext:true,
  readyForVisionLater:true
}));

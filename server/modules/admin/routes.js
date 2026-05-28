import express from "express";
import { requireAuth } from "../../lib/auth.js";

export const adminRouter = express.Router();

adminRouter.get("/status", requireAuth, async (_req,res)=>{
  res.json({
    ok:true,
    admin:true,
    platform_status:"stable",
    version:"V70"
  });
});

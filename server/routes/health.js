import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V101 TRUE OWNER CONSOLE",
  phase:"Clean Independent Owner Dashboard",
  ownerConsoleStandalone:true,
  ownerRoute:"/owner",
  adminRoute:"/admin",
  cleanOwnerMenu:true,
  usersView:true,
  logoutFixed:true,
  oldAdminHidden:true
}));

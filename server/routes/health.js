import express from "express";
export const healthRouter = express.Router();

healthRouter.get("/", (_req,res)=>res.json({
  ok:true,
  version:"GhostSeller AI V103 OWNER USER MANAGEMENT",
  phase:"Owner Users Management",
  ownerUsersMenu:true,
  usersCounter:true,
  usersTable:true,
  usersSearch:true,
  latestUsers:true,
  cleanOwnerDashboard:true,
  logoutFixed:true
}));

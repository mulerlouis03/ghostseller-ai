import express from "express";
export const autoCampaignRouter=express.Router();
autoCampaignRouter.get("/",(req,res)=>res.json({module:"autocampaign",status:"ready"}));

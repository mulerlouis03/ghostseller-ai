import express from "express";
export const billingRouter=express.Router();
billingRouter.get("/plans",(req,res)=>res.json({plans:{Free:{name:"Free",price:"0€",credits:20},Starter:{name:"Starter",price:"9,99€/mois",credits:300},Pro:{name:"Pro",price:"29€/mois",credits:1200}}}));

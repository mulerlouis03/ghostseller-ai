import express from "express";
export const videoRouter=express.Router();
videoRouter.get("/",(req,res)=>res.json({module:"video",status:"ready"}));

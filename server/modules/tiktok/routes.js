import express from "express";
export const tiktokRouter = express.Router();
tiktokRouter.get("/", (req, res) => res.json({ module: "tiktok", status: "ready" }));

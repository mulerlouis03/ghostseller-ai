import express from "express";
export const leadsRouter = express.Router();
leadsRouter.get("/", (req, res) => res.json({ module: "leads", status: "ready" }));

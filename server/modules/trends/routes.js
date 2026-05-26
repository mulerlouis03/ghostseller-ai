import express from "express";
export const trendsRouter = express.Router();
trendsRouter.get("/", (req, res) => res.json({ module: "trends", status: "ready" }));

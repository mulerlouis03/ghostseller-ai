import Stripe from "stripe";
export const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
export const APP_URL = process.env.APP_URL || "https://ghostseller-ai.vercel.app";

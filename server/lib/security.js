const buckets = new Map();

export function securityHeaders(req, res, next) {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
  next();
}

export function apiRateLimit(limit = 120, windowMs = 60_000) {
  return function(req, res, next) {
    const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || "unknown";
    const key = `${ip}:${req.path}`;
    const now = Date.now();
    const record = buckets.get(key) || { count: 0, reset: now + windowMs };

    if (now > record.reset) {
      record.count = 0;
      record.reset = now + windowMs;
    }

    record.count += 1;
    buckets.set(key, record);

    if (record.count > limit) {
      return res.status(429).json({ error: "Trop de requêtes. Réessaie dans une minute." });
    }

    next();
  };
}

export function isProduction() {
  return process.env.NODE_ENV === "production" || process.env.VERCEL_ENV === "production";
}

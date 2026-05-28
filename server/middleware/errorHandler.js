export function errorHandler(err, req, res, _next){
  console.error("[GhostSeller Error]", err);

  return res.status(err?.status || 500).json({
    ok:false,
    error: err?.message || "Internal server error",
    route:req.originalUrl,
    timestamp:new Date().toISOString()
  });
}

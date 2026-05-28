const memory = new Map();

export function basicRateLimit(limit=120, windowMs=60000){
  return (req,res,next)=>{
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "unknown";
    const now = Date.now();

    if(!memory.has(ip)){
      memory.set(ip, []);
    }

    const requests = memory.get(ip).filter(ts => now - ts < windowMs);
    requests.push(now);
    memory.set(ip, requests);

    if(requests.length > limit){
      return res.status(429).json({
        error:"Too many requests",
        retry_after_seconds: Math.ceil(windowMs/1000)
      });
    }

    next();
  };
}

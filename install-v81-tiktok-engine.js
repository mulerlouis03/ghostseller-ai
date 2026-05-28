const fs = require("fs");

fs.mkdirSync("server/modules/tiktok", { recursive:true });

fs.writeFileSync(
"server/modules/tiktok/routes.js",
`
import express from "express";
import crypto from "crypto";
import { requireAuth } from "../../lib/auth.js";
import { supabase } from "../../lib/supabase.js";

export const tiktokRouter = express.Router();

const HOOKS = {
  curiosity:[
    "Nobody talks about this…",
    "This changes everything.",
    "Watch this before posting again.",
    "Most creators are doing this wrong.",
    "This AI strategy is insane."
  ]
};

function random(arr){
  return arr[Math.floor(Math.random()*arr.length)];
}

tiktokRouter.post("/generate", requireAuth, async (req,res)=>{
  try{
    const {
      niche="business",
      topic="AI Marketing"
    } = req.body || {};

    const payload = {
      id:crypto.randomUUID(),
      viral_score:90,
      hook:random(HOOKS.curiosity),
      series:[
        topic + " Part 1",
        topic + " Part 2",
        topic + " Part 3"
      ],
      storyboard:[
        {
          step:1,
          duration:"0-3s",
          text:"Hook"
        },
        {
          step:2,
          duration:"3-8s",
          text:"Problem"
        },
        {
          step:3,
          duration:"8-15s",
          text:"Solution"
        }
      ],
      hashtags:[
        "#tiktokmarketing",
        "#ghostsellerai"
      ]
    };

    try{
      await supabase.from("tiktok_generations").insert({
        id:payload.id,
        user_id:req.user.id,
        payload,
        created_at:new Date().toISOString()
      });
    }catch(_e){}

    res.json({
      ok:true,
      result:payload
    });

  }catch(error){
    res.status(500).json({
      error:error.message
    });
  }
});
`
);

let server = fs.readFileSync("server.js","utf8");

if(!server.includes('tiktokRouter')){

server =
server.replace(
'import { autoGrowthRouter } from "./server/modules/autogrowth/routes.js";',
'import { autoGrowthRouter } from "./server/modules/autogrowth/routes.js";\nimport { tiktokRouter } from "./server/modules/tiktok/routes.js";'
);

server =
server.replace(
'app.use("/api/autogrowth", autoGrowthRouter);',
'app.use("/api/autogrowth", autoGrowthRouter);\napp.use("/api/tiktok", tiktokRouter);'
);

fs.writeFileSync("server.js",server);

}

console.log("V81 INSTALLED");
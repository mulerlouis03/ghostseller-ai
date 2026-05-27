export default function handler(req,res){
  res.status(200).json({
    ok:true,
    version:"GhostSeller AI V40 AI CONTENT ENGINE",
    aiContent:true,
    hooks:true,
    captions:true,
    hashtags:true,
    scripts:true
  });
}

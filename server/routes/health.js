export default function handler(req,res){
  res.status(200).json({
    ok:true,
    version:"GhostSeller AI V41 WAITLIST LEADS",
    waitlist:true,
    leadCapture:true
  });
}

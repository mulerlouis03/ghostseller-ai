import { supabase } from "./supabase.js";

export function emailConfigured(){
  return Boolean(process.env.RESEND_API_KEY || process.env.SMTP_HOST);
}

export async function logEmail({ user_id=null, email="", subject="", type="system", status="queued", payload={} }){
  try{
    await supabase.from("email_logs").insert({
      user_id,
      email,
      subject,
      type,
      status,
      payload,
      created_at:new Date().toISOString()
    });
  }catch(_e){}
}

export async function sendSystemEmail({ user_id=null, to, subject, html, type="system" }){
  await logEmail({
    user_id,
    email:to,
    subject,
    type,
    status: emailConfigured() ? "queued" : "simulated",
    payload:{ html }
  });

  if(!emailConfigured()){
    return {
      ok:true,
      simulated:true,
      message:"Email logged in simulation mode. Add RESEND_API_KEY or SMTP config to send real emails."
    };
  }

  // Resend-ready implementation. Real sending can be enabled by adding RESEND_API_KEY.
  if(process.env.RESEND_API_KEY){
    const response = await fetch("https://api.resend.com/emails", {
      method:"POST",
      headers:{
        "Authorization":`Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        from:process.env.EMAIL_FROM || "GhostSeller AI <noreply@ghostseller.ai>",
        to,
        subject,
        html
      })
    });

    const data = await response.json().catch(()=>({}));

    await logEmail({
      user_id,
      email:to,
      subject,
      type,
      status: response.ok ? "sent" : "failed",
      payload:data
    });

    if(!response.ok){
      return { ok:false, error:data?.message || "Email send failed", provider:"resend" };
    }

    return { ok:true, provider:"resend", data };
  }

  return { ok:true, simulated:true };
}

export function welcomeEmailTemplate({ name="there", language="fr" }){
  if(language === "en"){
    return {
      subject:"Welcome to GhostSeller AI 🚀",
      html:`<h1>Welcome ${name}</h1><p>Your AI marketing command center is ready.</p><p>Start by choosing your niche, creating content, and checking your daily AI recommendations.</p>`
    };
  }

  if(language === "es"){
    return {
      subject:"Bienvenido a GhostSeller AI 🚀",
      html:`<h1>Bienvenido ${name}</h1><p>Tu centro de marketing IA está listo.</p><p>Empieza eligiendo un nicho y creando tu primera campaña.</p>`
    };
  }

  if(language === "pt"){
    return {
      subject:"Bem-vindo ao GhostSeller AI 🚀",
      html:`<h1>Bem-vindo ${name}</h1><p>Seu centro de marketing IA está pronto.</p><p>Comece escolhendo um nicho e criando sua primeira campanha.</p>`
    };
  }

  return {
    subject:"Bienvenue sur GhostSeller AI 🚀",
    html:`<h1>Bienvenue ${name}</h1><p>Ton centre de contrôle marketing IA est prêt.</p><p>Commence par choisir ta niche, créer du contenu et regarder les recommandations IA du jour.</p>`
  };
}

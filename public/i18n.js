const GHOST_LANG_KEY = "ghostseller_language";

const I18N = {
  fr: {
    lang_name:"Français",
    login_title:"Connexion",
    create_account:"Créer un compte",
    login:"Connexion",
    forgot:"Mot de passe oublié ?",
    hero_title:"Transforme ton contenu en clients.",
    hero_subtitle:"Crée des hooks viraux, reels, pubs, posts, messages WhatsApp et campagnes en quelques secondes.",
    dashboard:"Dashboard",
    content:"AI Content",
    niches:"Niches IA",
    brain:"Ghost Brain",
    creative:"Creative Director",
    video:"Auto Video Pipeline",
    growth:"Growth Agent",
    os:"AI Operating System",
    cmo:"AI CMO",
    agents:"Multi-Agent",
    apis:"External APIs",
    unified:"Unified Brain",
    execution:"Execution Engine",
    memory:"Persistent Memory",
    improve:"Self Improve",
    opportunities:"Opportunity Discovery",
    billing:"Abonnement",
    waitlist:"Waitlist",
    security:"Sécurité",
    system:"Système",
    choose_language:"Choisis ta langue",
    language_subtitle:"GhostSeller s’adapte à ton marché.",
    continue:"Continuer",
    language:"Langue"
  },
  en: {
    lang_name:"English",
    login_title:"Login",
    create_account:"Create account",
    login:"Login",
    forgot:"Forgot password?",
    hero_title:"Turn your content into customers.",
    hero_subtitle:"Create viral hooks, reels, ads, posts, WhatsApp messages and campaigns in seconds.",
    dashboard:"Dashboard",
    content:"AI Content",
    niches:"AI Niches",
    brain:"Ghost Brain",
    creative:"Creative Director",
    video:"Auto Video Pipeline",
    growth:"Growth Agent",
    os:"AI Operating System",
    cmo:"AI CMO",
    agents:"Multi-Agent",
    apis:"External APIs",
    unified:"Unified Brain",
    execution:"Execution Engine",
    memory:"Persistent Memory",
    improve:"Self Improve",
    opportunities:"Opportunity Discovery",
    billing:"Billing",
    waitlist:"Waitlist",
    security:"Security",
    system:"System",
    choose_language:"Choose your language",
    language_subtitle:"GhostSeller adapts to your market.",
    continue:"Continue",
    language:"Language"
  },
  es: {
    lang_name:"Español",
    login_title:"Iniciar sesión",
    create_account:"Crear cuenta",
    login:"Entrar",
    forgot:"¿Olvidaste tu contraseña?",
    hero_title:"Convierte tu contenido en clientes.",
    hero_subtitle:"Crea hooks virales, reels, anuncios, posts, mensajes de WhatsApp y campañas en segundos.",
    dashboard:"Panel",
    content:"Contenido IA",
    niches:"Nichos IA",
    brain:"Ghost Brain",
    creative:"Director Creativo",
    video:"Pipeline de Video",
    growth:"Agente de Crecimiento",
    os:"Sistema Operativo IA",
    cmo:"CMO IA",
    agents:"Multi-Agente",
    apis:"APIs Externas",
    unified:"Cerebro Unificado",
    execution:"Motor de Ejecución",
    memory:"Memoria Persistente",
    improve:"Auto-mejora",
    opportunities:"Descubrimiento de Oportunidades",
    billing:"Suscripción",
    waitlist:"Lista de espera",
    security:"Seguridad",
    system:"Sistema",
    choose_language:"Elige tu idioma",
    language_subtitle:"GhostSeller se adapta a tu mercado.",
    continue:"Continuar",
    language:"Idioma"
  },
  pt: {
    lang_name:"Português",
    login_title:"Entrar",
    create_account:"Criar conta",
    login:"Entrar",
    forgot:"Esqueceu a senha?",
    hero_title:"Transforme seu conteúdo em clientes.",
    hero_subtitle:"Crie hooks virais, reels, anúncios, posts, mensagens WhatsApp e campanhas em segundos.",
    dashboard:"Painel",
    content:"Conteúdo IA",
    niches:"Nichos IA",
    brain:"Ghost Brain",
    creative:"Diretor Criativo",
    video:"Pipeline de Vídeo",
    growth:"Agente de Crescimento",
    os:"Sistema Operacional IA",
    cmo:"CMO IA",
    agents:"Multi-Agente",
    apis:"APIs Externas",
    unified:"Cérebro Unificado",
    execution:"Motor de Execução",
    memory:"Memória Persistente",
    improve:"Auto-melhoria",
    opportunities:"Descoberta de Oportunidades",
    billing:"Assinatura",
    waitlist:"Lista de espera",
    security:"Segurança",
    system:"Sistema",
    choose_language:"Escolha seu idioma",
    language_subtitle:"GhostSeller se adapta ao seu mercado.",
    continue:"Continuar",
    language:"Idioma"
  }
};

function getLang(){
  return localStorage.getItem(GHOST_LANG_KEY) || "fr";
}

function t(key){
  const lang = getLang();
  return I18N[lang]?.[key] || I18N.fr[key] || key;
}

function setLang(lang){
  localStorage.setItem(GHOST_LANG_KEY, lang);
  applyTranslations();
}

function applyTranslations(){
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if(I18N[getLang()]?.[key]) el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
    const key = el.getAttribute("data-i18n-placeholder");
    if(I18N[getLang()]?.[key]) el.setAttribute("placeholder", t(key));
  });

  const btn = document.getElementById("languageBtn");
  if(btn) btn.textContent = "🌍 " + I18N[getLang()].lang_name;
}

function showLanguagePopup(){
  if(localStorage.getItem(GHOST_LANG_KEY)) return;

  const popup = document.createElement("div");
  popup.className = "language-modal";
  popup.innerHTML = `
    <div class="language-card">
      <span class="badge">🌍 Global SaaS</span>
      <h2 data-i18n="choose_language">${t("choose_language")}</h2>
      <p data-i18n="language_subtitle">${t("language_subtitle")}</p>

      <div class="language-grid">
        <button onclick="chooseLanguage('fr')">🇫🇷 Français</button>
        <button onclick="chooseLanguage('en')">🇬🇧 English</button>
        <button onclick="chooseLanguage('es')">🇪🇸 Español</button>
        <button onclick="chooseLanguage('pt')">🇵🇹 Português</button>
      </div>
    </div>
  `;
  document.body.appendChild(popup);
}

function chooseLanguage(lang){
  setLang(lang);
  document.querySelector(".language-modal")?.remove();
}

window.addEventListener("DOMContentLoaded", ()=>{
  applyTranslations();
  showLanguagePopup();
});

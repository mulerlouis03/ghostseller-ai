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
    language_subtitle:"Tu peux la changer à tout moment depuis le dashboard.",
    continue:"Continuer",
    language:"Langue",
    change_language:"Changer la langue",
    save_language:"Appliquer",
    reset_language:"Réinitialiser"
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
    language_subtitle:"You can change it anytime from the dashboard.",
    continue:"Continue",
    language:"Language",
    change_language:"Change language",
    save_language:"Apply",
    reset_language:"Reset"
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
    language_subtitle:"Puedes cambiarlo en cualquier momento desde el panel.",
    continue:"Continuar",
    language:"Idioma",
    change_language:"Cambiar idioma",
    save_language:"Aplicar",
    reset_language:"Reiniciar"
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
    language_subtitle:"Você pode mudar isso a qualquer momento no painel.",
    continue:"Continuar",
    language:"Idioma",
    change_language:"Alterar idioma",
    save_language:"Aplicar",
    reset_language:"Redefinir"
  }
};

function detectBrowserLang(){
  const raw = (navigator.language || navigator.userLanguage || "fr").toLowerCase();
  if(raw.startsWith("en")) return "en";
  if(raw.startsWith("es")) return "es";
  if(raw.startsWith("pt")) return "pt";
  return "fr";
}

function getLang(){
  const saved = localStorage.getItem(GHOST_LANG_KEY);
  if(saved && I18N[saved]) return saved;
  return detectBrowserLang();
}

function t(key){
  const lang = getLang();
  return I18N[lang]?.[key] || I18N.fr[key] || key;
}

function setLang(lang){
  if(!I18N[lang]) lang = "fr";
  localStorage.setItem(GHOST_LANG_KEY, lang);
  document.documentElement.setAttribute("lang", lang);
  applyTranslations();
  updateLanguageControls();
  window.dispatchEvent(new CustomEvent("ghostseller:languageChanged", { detail:{ lang }}));
}

function resetLang(){
  localStorage.removeItem(GHOST_LANG_KEY);
  setLang(detectBrowserLang());
}

function applyTranslations(){
  const lang = getLang();
  document.documentElement.setAttribute("lang", lang);

  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const key = el.getAttribute("data-i18n");
    if(I18N[lang]?.[key]) el.textContent = t(key);
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
    const key = el.getAttribute("data-i18n-placeholder");
    if(I18N[lang]?.[key]) el.setAttribute("placeholder", t(key));
  });

  updateLanguageControls();
}

function updateLanguageControls(){
  const lang = getLang();
  document.querySelectorAll("[data-language-label]").forEach(el=>{
    el.textContent = "🌍 " + I18N[lang].lang_name;
  });
  document.querySelectorAll("[data-language-select]").forEach(el=>{
    el.value = lang;
  });
}

function openLanguageModal(){
  document.querySelector(".language-modal")?.remove();

  const lang = getLang();
  const popup = document.createElement("div");
  popup.className = "language-modal";
  popup.innerHTML = `
    <div class="language-card">
      <span class="badge">🌍 Global SaaS</span>
      <h2 data-i18n="choose_language">${t("choose_language")}</h2>
      <p data-i18n="language_subtitle">${t("language_subtitle")}</p>

      <select class="language-select" data-language-select onchange="setLang(this.value)">
        <option value="fr">🇫🇷 Français</option>
        <option value="en">🇬🇧 English</option>
        <option value="es">🇪🇸 Español</option>
        <option value="pt">🇵🇹 Português</option>
      </select>

      <div class="language-grid">
        <button onclick="setLang('fr')">🇫🇷 Français</button>
        <button onclick="setLang('en')">🇬🇧 English</button>
        <button onclick="setLang('es')">🇪🇸 Español</button>
        <button onclick="setLang('pt')">🇵🇹 Português</button>
      </div>

      <div class="row language-actions">
        <button onclick="document.querySelector('.language-modal')?.remove()" data-i18n="continue">${t("continue")}</button>
        <button class="secondary" onclick="resetLang()" data-i18n="reset_language">${t("reset_language")}</button>
      </div>
    </div>
  `;

  document.body.appendChild(popup);
  popup.querySelector("[data-language-select]").value = lang;
  applyTranslations();
}

function showLanguagePopup(){
  if(localStorage.getItem(GHOST_LANG_KEY)) {
    applyTranslations();
    return;
  }
  openLanguageModal();
}

function chooseLanguage(lang){
  setLang(lang);
  document.querySelector(".language-modal")?.remove();
}

window.addEventListener("DOMContentLoaded", ()=>{
  applyTranslations();
  showLanguagePopup();
});


// V100.1 safe logout fallback
if (typeof window !== 'undefined' && window.ghostSellerLogout) { window.logout = window.ghostSellerLogout; }

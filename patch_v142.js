
/* V142 — FIX: Stop repeating the user prompt. Execute real publishable ads. */
(function(){
  function E(s){return String(s ?? '').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));}
  function enc(v){return encodeURIComponent(String(v||''));}
  function dec(v){try{return decodeURIComponent(String(v||''));}catch(e){return String(v||'');}}
  function getOffer(){return (document.getElementById('contentPrompt')?.value || document.getElementById('contentNiche')?.value || '').trim();}
  function copy(t){try{navigator.clipboard?.writeText(String(t||''));}catch(e){}}
  window.v142Copy = window.v136Copy = window.v135Copy = copy;

  function txt(v){
    if(v==null) return '';
    if(Array.isArray(v)) return v.map(txt).filter(Boolean).join('\n');
    if(typeof v==='object') return txt(v.content||v.text||v.body||v.caption||v.message||v.script||Object.values(v).map(txt).filter(Boolean).join('\n\n'));
    return String(v);
  }
  function cleanPromptEcho(s, offer){
    s = String(s||'').trim();
    // Block the most visible bug: copied brief / instructions instead of final ad.
    const bad = /cr[eé]e\s+une\s+campagne|je\s+veux\s+facebook|objectif\s*:|cible\s*:|points\s+forts\s*:|voici\s+une\s+campagne|tu\s+peux\s+publier/i;
    if(bad.test(s)) return '';
    return s;
  }
  function normalize(raw){raw=raw&&typeof raw==='object'?raw:{}; return {
    facebook:txt(raw.facebook||raw.fb||raw.facebook_post), instagram:txt(raw.instagram||raw.instagram_post||raw.ig),
    tiktok:txt(raw.tiktok||raw.tiktok_reels||raw.reels||raw.video_script), whatsapp:txt(raw.whatsapp||raw.whatsapp_message),
    story:txt(raw.story||raw.statut||raw.status), hashtags:txt(raw.hashtags), hooks:txt(raw.hooks), cta:txt(raw.cta||raw.ctas)
  };}

  function pickInfo(offer){
    const s=String(offer||''); const l=s.toLowerCase();
    const quoted=s.match(/["“”'‘’]([^"“”'‘’]{3,45})["“”'‘’]/);
    const brand=(quoted?quoted[1]:'').trim() || (l.includes('kafe')?'KAFE LAKAY':'');
    if(/covoiturage|trajet|transport|cayenne|saint[-\s]?laurent|saint[-\s]?laurent[-\s]?du[-\s]?maroni/.test(l)){
      const from=(s.match(/entre\s+([A-Za-zÀ-ÿ-]+)\s+et/i)||s.match(/de\s+([A-Za-zÀ-ÿ-]+)\s+(?:à|vers)/i)||[])[1] || 'Cayenne';
      const to=(s.match(/et\s+([A-Za-zÀ-ÿ-]+(?:-[A-Za-zÀ-ÿ]+)*(?:\s*du\s*Maroni)?)/i)||s.match(/(?:à|vers)\s+([A-Za-zÀ-ÿ-]+(?:-[A-Za-zÀ-ÿ]+)*(?:\s*du\s*Maroni)?)/i)||[])[1] || 'Saint-Laurent-du-Maroni';
      const day=(s.match(/(lundi|mardi|mercredi|jeudi|vendredi|samedi|dimanche)/i)||[])[1] || 'mardi';
      const hour=(s.match(/(\d{1,2}\s?h(?:\d{2})?)/i)||[])[1] || '7h';
      const seats=(s.match(/(\d+)\s+places?/i)||[])[1] || '4';
      return {kind:'transport', brand:`Trajet ${from} → ${to}`, product:'covoiturage', kw:'TRAJET', from, to, day, hour, seats, tags:['#CovoiturageGuyane','#Cayenne','#SaintLaurentDuMaroni','#Guyane','#TransportGuyane','#TrajetGuyane']};
    }
    if(/caf[eé]|coffee|kafe/.test(l)) return {kind:'coffee', brand:brand||'KAFE LAKAY', product:'café haïtien premium', kw:'CAFÉ', tags:['#KafeLakay','#CafeHaitien','#Cafe','#Haiti','#CoffeeLovers','#SaveurHaiti','#CafeArtisanal']};
    if(/basket|nike|adidas|sneaker|chaussure/.test(l)) return {kind:'sport', brand:brand||'Sneakers', product:'baskets tendance', kw:'BASKET', tags:['#Sneakers','#Streetwear','#ModeUrbaine','#Nike','#Adidas','#Style']};
    if(/sac|mode|fashion/.test(l)) return {kind:'fashion', brand:brand||'Collection tendance', product:'sac tendance', kw:'INFO', tags:['#ModeFemme','#Sac','#Tendance','#Shopping','#Style']};
    if(/montre|bijou|luxe/.test(l)) return {kind:'luxury', brand:brand||'Collection premium', product:'produit de luxe', kw:'LUXE', tags:['#Luxe','#Premium','#Elegance','#Style','#Bijoux']};
    if(/parfum|cosm|beaut/.test(l)) return {kind:'beauty', brand:brand||'Beauté premium', product:'parfum / cosmétique', kw:'BEAUTÉ', tags:['#Parfum','#Cosmetique','#Beaute','#Glow','#LuxuryBeauty']};
    return {kind:'generic', brand:brand||'Offre spéciale', product:'offre', kw:'INFO', tags:['#Offre','#Business','#Vente','#Marketing','#Clients']};
  }

  function packTransport(m, angle){
    const urgent = angle==='viral'||angle==='aggressive'||angle==='promo';
    const facebook=`🚗 ${m.from} ➜ ${m.to}\n\nDépart ${m.day} à ${m.hour}.\n${m.seats} places disponibles. Petit bagage accepté.\n\nVoyage simple, ponctuel et confortable pour rejoindre ${m.to} sans stress.\n\n✅ Départ tôt\n✅ Places limitées\n✅ Petit bagage OK\n✅ Réservation rapide\n\n📩 Écris “${m.kw}” en message privé pour réserver ta place.`;
    const instagram=`🌴 Route ${m.from} → ${m.to}\n\nTu dois partir ${m.day} matin ?\nIl reste ${m.seats} places pour un trajet à ${m.hour}.\n\nConfort, ponctualité et petit bagage accepté.\n\nDM “${m.kw}” pour réserver.\n\n${m.tags.concat(['#VoyageGuyane','#BonPlanGuyane']).join(' ')}`;
    const tiktok=`🎬 SCRIPT TIKTOK / REELS\n\nSCÈNE 1 — HOOK (0-2s)\nTexte écran : “Tu vas à ${m.to} cette semaine ?”\nPlan : clé de voiture, route, départ tôt le matin.\n\nSCÈNE 2 — INFO (2-6s)\nTexte écran : “${m.from} → ${m.to} • ${m.day} ${m.hour}”\nPlan : carte ou panneau de route.\n\nSCÈNE 3 — PLACES (6-10s)\nTexte écran : “${m.seats} places disponibles”\nPlan : intérieur propre du véhicule.\n\nSCÈNE 4 — RASSURANCE (10-15s)\nTexte écran : “Petit bagage accepté • trajet confortable”\nPlan : sac léger + voiture prête.\n\nSCÈNE 5 — CTA (15-20s)\nTexte écran : “Écris ${m.kw} pour réserver”\nVoix off : “Places limitées, réserve maintenant.”`;
    const whatsapp=`Bonjour 👋\n\nTrajet disponible : ${m.from} ➜ ${m.to}\n\n📅 Départ : ${m.day}\n🕖 Heure : ${m.hour}\n👥 Places : ${m.seats}\n🎒 Petit bagage accepté\n\nRéponds “${m.kw}” pour réserver ta place.`;
    const story=`🚗 ${m.from} ➜ ${m.to}\n${m.day} • ${m.hour}\n${m.seats} places disponibles\nPetit bagage accepté\n\nRéponds “${m.kw}” pour réserver.`;
    const hooks=[`Tu pars à ${m.to} cette semaine ?`,`Il reste ${m.seats} places pour ${m.to}.`,`Cayenne → Saint-Laurent sans stress.`,`Départ ${m.day} à ${m.hour}, tu viens ?`,`Petit bagage accepté, réservation rapide.`];
    const cta=[`Écris ${m.kw} pour réserver.`,`Envoie-moi un message maintenant.`,`Réponds OUI pour les détails.`,`Réserve ta place avant que ce soit complet.`,`Partage à quelqu’un qui va à ${m.to}.`,`Demande le point de départ.`,`Confirme ta place aujourd’hui.`,`DM ${m.kw}.`,`Garde cette annonce.`,`Contacte-moi maintenant.`];
    return {facebook,instagram,tiktok,whatsapp,story,hashtags:m.tags.concat(['#Covoiturage','#Transport','#BonPlan','#Voyage','#Route']).join(' '),hooks:hooks.concat(hooks,hooks,hooks).slice(0,20).map((x,i)=>`${i+1}. ${x}`).join('\n'),cta:cta.map((x,i)=>`${i+1}. ${x}`).join('\n')};
  }

  function packProduct(m, angle){
    const opener = angle==='viral'?`🔥 ${m.brand} fait parler de lui` : angle==='premium'?`💎 ${m.brand} — une expérience premium` : angle==='emotion'?`❤️ ${m.brand}, une histoire à ressentir` : angle==='aggressive'?`⚡ Découvre ${m.brand} maintenant` : angle==='promo'?`🏷️ Offre spéciale ${m.brand}` : `✨ ${m.brand} disponible`;
    const coffeeLine=m.kind==='coffee'?`${m.brand}, le café d’Haïti qui apporte arôme, chaleur et authenticité dans chaque tasse.`:`${m.product} prêt à attirer l’attention avec une présentation claire et désirable.`;
    const facebook=`${opener}\n\n${coffeeLine}\n\nUn produit pensé pour les personnes qui aiment la qualité, l’originalité et les belles découvertes.\n\n✅ Présentation claire\n✅ Donne envie d’essayer\n✅ Parfait pour offrir ou se faire plaisir\n✅ Disponible maintenant\n\n📩 Écris “${m.kw}” pour recevoir les détails.`;
    const instagram=`${opener}\n\n${coffeeLine}\n\nUn visuel propre, un message direct, une offre qui donne envie de passer à l’action.\n\nDM “${m.kw}” pour les infos.\n\n${m.tags.concat(['#Reels','#TikTokFrance','#InstagramFrance']).join(' ')}`;
    const tiktok=`🎬 SCRIPT TIKTOK / REELS\n\nSCÈNE 1 — HOOK (0-2s)\nTexte écran : “Tu connais ${m.brand} ?”\nPlan : gros plan sombre, produit au centre.\n\nSCÈNE 2 — PRODUIT (2-6s)\nTexte écran : “${m.product} à découvrir”\nPlan : détail du produit, texture, lumière cinématique.\n\nSCÈNE 3 — DÉSIR (6-12s)\nTexte écran : “Authentique. Beau. Disponible maintenant.”\nVoix off : “Une offre simple qui donne envie d’essayer.”\n\nSCÈNE 4 — PREUVE (12-17s)\nTexte écran : “Qualité + présentation premium”\nPlan : bénéfices à l’écran.\n\nSCÈNE 5 — CTA (17-22s)\nTexte écran : “Écris ${m.kw} pour recevoir les infos”`;
    const whatsapp=`Bonjour 👋\n\nJe te partage cette offre : ${m.brand}\n\n${coffeeLine}\n\n✅ Simple à comprendre\n✅ Disponible maintenant\n✅ Infos rapides\n\nRéponds “${m.kw}” et je t’envoie les détails.`;
    const story=`📱 STORY / STATUT\n\n${opener}\n\nTu veux les détails ?\nRéponds “${m.kw}”.`;
    const hooks=[`Tu connais ${m.brand} ?`,`Stop, cette offre peut t’intéresser.`,`POV : tu découvres ${m.product} au bon moment.`,`Avant d’acheter ailleurs, regarde ça.`,`Écris ${m.kw} pour les infos.`];
    const cta=[`Écris ${m.kw} pour recevoir les détails.`,`Envoie-moi un DM maintenant.`,`Commente ${m.kw}.`,`Demande la disponibilité.`,`Réserve avant que ça parte.`,`Partage à quelqu’un que ça peut intéresser.`,`Clique pour en savoir plus.`,`Réponds OUI et je t’envoie tout.`,`Garde cette offre.`,`Passe commande maintenant.`];
    return {facebook,instagram,tiktok,whatsapp,story,hashtags:m.tags.concat(['#Offre','#Promotion','#Business','#Marketing','#Vente','#Clients']).join(' '),hooks:hooks.concat(hooks,hooks,hooks).slice(0,20).map((x,i)=>`${i+1}. ${x}`).join('\n'),cta:cta.map((x,i)=>`${i+1}. ${x}`).join('\n')};
  }

  function makePack(offer, angle='base'){
    const m=pickInfo(offer); return m.kind==='transport'?packTransport(m,angle):packProduct(m,angle);
  }
  function all(pack){pack=normalize(pack);return `FACEBOOK\n\n${pack.facebook}\n\n---\nINSTAGRAM\n\n${pack.instagram}\n\n---\nTIKTOK / REELS\n\n${pack.tiktok}\n\n---\nWHATSAPP\n\n${pack.whatsapp}\n\n---\nSTORY / STATUT\n\n${pack.story}\n\n---\nHASHTAGS\n\n${pack.hashtags}`;}
  function card(t,b){b=txt(b);return `<div class="deliverableCard v133SocialCard"><h3>${E(t)}</h3><div class="deliverableText">${E(b)}</div><button type="button" onclick="v142Copy(decodeURIComponent('${enc(b)}'))">Copier</button></div>`;}
  function actions(p){const q=enc(p);return `<div class="v133Actions v136Actions"><button type="button" onclick="v142Run('ideas','${q}')">🔄 Générer d'autres idées</button><button type="button" onclick="v142Run('viral','${q}')">🔥 Version virale</button><button type="button" onclick="v142Run('emotion','${q}')">❤️ Émotionnelle</button><button type="button" onclick="v142Run('premium','${q}')">💎 Premium</button><button type="button" onclick="v142Run('aggressive','${q}')">⚡ Agressive</button><button type="button" onclick="v142Run('promo','${q}')">🏷️ Promotion</button><button type="button" onclick="v142Extra('hooks','${q}')">🎣 20 Hooks</button><button type="button" onclick="v142Extra('cta','${q}')">📢 10 CTA</button><button type="button" onclick="v142Extra('hashtags','${q}')">#️⃣ 30 Hashtags</button><button type="button" onclick="v142Background('${q}')">🖼️ Créer fond IA</button></div>`;}
  function bgSvg(offer){const m=pickInfo(offer);const emoji=m.kind==='transport'?'🚗':m.kind==='coffee'?'☕':m.kind==='sport'?'👟':m.kind==='luxury'?'💎':'✨';const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='1080' height='1920'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop stop-color='#020617'/><stop offset='.55' stop-color='#06172b'/><stop offset='1' stop-color='#28104a'/></linearGradient><filter id='b'><feGaussianBlur stdDeviation='42'/></filter></defs><rect width='1080' height='1920' fill='url(#g)'/><circle cx='240' cy='250' r='310' fill='#38bdf8' opacity='.20' filter='url(#b)'/><circle cx='870' cy='1450' r='390' fill='#a855f7' opacity='.26' filter='url(#b)'/><text x='540' y='790' font-size='230' text-anchor='middle' opacity='.20'>${emoji}</text></svg>`;return 'data:image/svg+xml;base64,'+btoa(unescape(encodeURIComponent(svg)));}
  function bgPanel(p){const img=bgSvg(p);return `<div id="v142BgOut" class="employeeResult v136BgPanel"><div class="employeeHeader"><div><span class="employeeBadge">🖼️ Fond prêt</span><h2>Fond sombre généré</h2></div><button class="copyBtn" type="button" onclick="v142Background('${enc(p)}')">Régénérer fond</button></div><div class="v133GeneratedImageWrap"><img src="${img}" alt="Fond"/></div></div>`;}
  function render(pack,p,title){pack=normalize(pack);const a=all(pack);return `<div class="employeeResult v133Result v136Result"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail terminé</span><h2>${E(title||'Pack réseaux sociaux prêt')}</h2><p class="muted">Facebook, Instagram, TikTok/Reels, WhatsApp, Story et hashtags prêts à publier.</p></div><button class="copyBtn" type="button" onclick="v142Copy(decodeURIComponent('${enc(a)}'))">Copier tout</button></div>${actions(p)}<div class="deliverableGrid v133Grid">${card('Facebook',pack.facebook)}${card('Instagram',pack.instagram)}${card('TikTok / Reels',pack.tiktok)}${card('WhatsApp',pack.whatsapp)}${card('Story / Statut',pack.story)}${card('Hashtags',pack.hashtags)}</div>${bgPanel(p)}<div id="v142ExtraOut"></div></div>`;}
  async function post(path,body){const headers={'Content-Type':'application/json'}; const t=localStorage.getItem('ghostseller_token'); if(t) headers.Authorization='Bearer '+t; const r=await fetch(path,{method:'POST',headers,body:JSON.stringify(body)}); const d=await r.json().catch(()=>({})); if(!r.ok) throw new Error(d.error||d.message||'Erreur API'); return d;}
  function valid(pack,offer){pack=normalize(pack);const f=cleanPromptEcho(pack.facebook,offer), i=cleanPromptEcho(pack.instagram,offer), t=cleanPromptEcho(pack.tiktok,offer);return f&&i&&t;}
  window.v142Run=async function(angle,ep){
    const p=dec(ep)||getOffer(); const out=document.getElementById('contentOut'); if(!out) return; if(!p){out.innerHTML='<div class="employeeResult">Décris ton offre avant de générer.</div>';return;}
    const local=makePack(p,angle); out.innerHTML=render(local,p,angle==='base'?'Pack réseaux sociaux prêt':'Pack '+angle+' prêt');
    try{const data=await post('/api/content/social-pack',{offer:p,angle}); const remote=normalize(data.pack||{}); if(valid(remote,p)){out.innerHTML=render(remote,p,angle==='base'?'Pack réseaux sociaux prêt':'Pack '+angle+' prêt');}}
    catch(e){}
  };
  window.v142Extra=async function(type,ep){const p=dec(ep)||getOffer(); const box=document.getElementById('v142ExtraOut')||document.getElementById('v133ExtraOut')||document.getElementById('contentOut'); if(!box)return; const pack=makePack(p,type); const body=type==='hooks'?pack.hooks:type==='cta'?pack.cta:pack.hashtags; box.innerHTML=`<div class="employeeResult"><div class="employeeHeader"><div><span class="employeeBadge">✅ Travail terminé</span><h2>${type==='hooks'?'20 Hooks':type==='cta'?'10 CTA':'30 Hashtags'}</h2></div><button class="copyBtn" onclick="v142Copy(decodeURIComponent('${enc(body)}'))">Copier tout</button></div><div class="scriptBlock employeeScript">${E(body)}</div></div>`;};
  window.v142Background=async function(ep){const p=dec(ep)||getOffer(); const box=document.getElementById('v142BgOut')||document.getElementById('v136BgOut')||document.getElementById('v133ExtraOut')||document.getElementById('contentOut'); if(!box)return; box.outerHTML=bgPanel(p);};
  window.generateContent=function(){window.v142Run('base',enc(getOffer()));};
  window.v136Run=window.v135Run=window.v133Run=window.v129Regen=window.v142Run;
  window.v136Extra=window.v135Extra=window.v133Extra=window.v142Extra;
  window.v136Background=window.v135Background=window.v133GenerateBackground=window.v132Background=window.v142Background;
})();

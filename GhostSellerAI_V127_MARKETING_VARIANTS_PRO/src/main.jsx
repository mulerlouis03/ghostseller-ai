import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Copy, Sparkles, Wand2, Flame, Heart, Gem, BadgePercent, Film, Megaphone, Hash, RefreshCcw, MessageCircle } from 'lucide-react';
import './style.css';

const empty = {
  title: 'Pack marketing prêt à publier',
  facebook: '', instagram: '', tiktok: '', whatsapp: '', hooks: '', ctas: '', hashtags: ''
};

function clean(v) { return typeof v === 'string' ? v : JSON.stringify(v, null, 2); }

function Card({ title, children, icon }) {
  return <div className="card"><div className="card-title">{icon}{title}</div><pre>{children}</pre><button className="copy-mini" onClick={() => navigator.clipboard.writeText(children || '')}><Copy size={13}/> Copier</button></div>;
}

function App() {
  const [offer, setOffer] = useState('offre de basket nike pour les jeunes de 18 à 25 ans, dans tous les magasins Foot Locker de France');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(empty);
  const [active, setActive] = useState('standard');
  const [error, setError] = useState('');

  const allText = useMemo(() => Object.entries(result).map(([k,v]) => `## ${k.toUpperCase()}\n${clean(v)}`).join('\n\n'), [result]);

  async function generate(mode = 'standard') {
    setLoading(true); setError(''); setActive(mode);
    try {
      const r = await fetch('/api/generate', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ offer, mode }) });
      const data = await r.json();
      if (data.error) throw new Error(data.error);
      setResult({ ...empty, ...data });
    } catch (e) {
      setError(e.message || 'Erreur génération');
    } finally { setLoading(false); }
  }

  const actions = [
    ['variants', 'Générer 5 nouvelles variantes', RefreshCcw],
    ['viral', 'Version virale TikTok', Flame],
    ['emotion', 'Version émotion', Heart],
    ['premium', 'Version premium', Gem],
    ['promo', 'Version promotion', BadgePercent],
    ['storytelling', 'Storytelling', MessageCircle],
    ['hooks', '20 Hooks', Megaphone],
    ['cta', '10 CTA', Wand2],
    ['hashtags', '30 Hashtags', Hash],
    ['video', 'Script vidéo TikTok', Film]
  ];

  return <main>
    <section className="hero">
      <div><h1>Créer contenu</h1><p>Prépare un post, un hook et un appel à l'action.</p></div>
      <div className="badges"><span>Free</span><span>20 crédits</span></div>
    </section>

    <section className="panel">
      <h2>Créer contenu</h2>
      <p className="hint">Décris ton offre. GhostSeller prépare plusieurs contenus prêts à publier.</p>
      <textarea value={offer} onChange={e=>setOffer(e.target.value)} />
      <button className="main-btn" onClick={()=>generate('standard')} disabled={loading}><Sparkles size={16}/>{loading ? 'Génération...' : 'Créer les contenus prêts'}</button>
      {error && <div className="error">{error}</div>}
    </section>

    {result.facebook && <section className="result">
      <div className="result-head"><span className="done">✅ Travail terminé</span><button className="copy-all" onClick={()=>navigator.clipboard.writeText(allText)}><Copy size={14}/> Copier tout</button></div>
      <h2>{result.title}</h2>

      <div className="advanced-actions">
        {actions.map(([mode,label,Icon]) => <button key={mode} className={active===mode?'active':''} onClick={()=>generate(mode)} disabled={loading}><Icon size={15}/>{label}</button>)}
      </div>

      <div className="grid">
        <Card title="Facebook" icon="🔥">{clean(result.facebook)}</Card>
        <Card title="Instagram" icon="✨">{clean(result.instagram)}</Card>
        <Card title="TikTok" icon="🎬">{clean(result.tiktok)}</Card>
        <Card title="WhatsApp" icon="💬">{clean(result.whatsapp)}</Card>
        <Card title="Hooks" icon="🎣">{clean(result.hooks)}</Card>
        <Card title="CTA" icon="📢">{clean(result.ctas)}</Card>
        <Card title="Hashtags" icon="#️⃣">{clean(result.hashtags)}</Card>
      </div>
    </section>}
  </main>;
}

createRoot(document.getElementById('root')).render(<App />);

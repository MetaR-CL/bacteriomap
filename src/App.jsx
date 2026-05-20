// App.jsx — Router, page transitions, and tweaks panel
import { useState, useEffect, useCallback } from 'react';
import React from 'react';
import { gramColor, MorphoSVG } from './modules/bacteriomap/shared.jsx';
import { useTweaks, TweaksPanel, TweakSection, TweakToggle, TweakColor, TweakButton } from './modules/bacteriomap/TweaksPanel.jsx';
import { useDarkMode } from './hooks/useDarkMode.js';
import HomeScreen  from './modules/bacteriomap/HomeScreen.jsx';
import ZoneScreen  from './modules/bacteriomap/ZoneScreen.jsx';
import SheetScreen from './modules/bacteriomap/SheetScreen.jsx';
import QuizScreen  from './modules/bacteriomap/QuizScreen.jsx';
import AdminScreen from './modules/bacteriomap/AdminScreen.jsx';

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "dark": false,
  "vivid": false,
  "accentColor": "#9a6b1f",
  "showImages": true,
  "morphoStyle": "rich"
}/*EDITMODE-END*/;

// localStorage helper for bacteria images
function getBactImage(name) {
  try { return localStorage.getItem('bm-img:' + name) || null; } catch (e) { return null; }
}
function setBactImage(name, dataUrl) {
  try {
    if (dataUrl) localStorage.setItem('bm-img:' + name, dataUrl);
    else localStorage.removeItem('bm-img:' + name);
    window.dispatchEvent(new Event('bm-img-updated'));
  } catch (e) {}
}
function useBactImage(name) {
  const [img, setImg] = useState(() => getBactImage(name));
  useEffect(() => {
    const fn = () => setImg(getBactImage(name));
    window.addEventListener('bm-img-updated', fn);
    return () => window.removeEventListener('bm-img-updated', fn);
  }, [name]);
  return [img, (d) => { setBactImage(name, d); setImg(d); }];
}

// Component used inside the bacteria figure preview area
function BactFigure({ bact, vivid, showImages, size = 90 }) {
  const c = gramColor(bact.gram);
  const [img] = useBactImage(bact.name);
  const fileRef = React.useRef(null);

  const onPick = (e) => {
    e.stopPropagation();
    fileRef.current && fileRef.current.click();
  };
  const onFile = (e) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = (ev) => setBactImage(bact.name, ev.target.result);
    reader.readAsDataURL(f);
    e.target.value = '';
  };
  const onClear = (e) => { e.stopPropagation(); setBactImage(bact.name, null); };

  if (showImages && img) {
    return (
      <div style={{ width:'100%', height:'100%', position:'relative' }}>
        <img src={img} alt={bact.name} style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
        <button onClick={onClear} title="Retirer l'image"
                style={{ position:'absolute', top:6, right:6, width:20, height:20, padding:0, border:'0.5px solid rgba(255,255,255,.5)', background:'rgba(0,0,0,.5)', color:'#fff', fontSize:11, cursor:'pointer', borderRadius:2 }}>×</button>
      </div>
    );
  }

  return (
    <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <MorphoSVG kind={bact.morpho} size={100} stroke={c.stroke} fill={c.fill} fillOpacity={0.22} strokeWidth={1.6} vivid={vivid}/>
      </svg>
      {showImages && (
        <button onClick={onPick} title="Ajouter une image"
                style={{ position:'absolute', bottom:6, right:6, width:22, height:22, padding:0, border:'0.5px solid var(--rule)', background:'var(--paper)', color:'var(--ink3)', fontSize:11, cursor:'pointer', opacity:0.6, borderRadius:2 }}>+</button>
      )}
      <input ref={fileRef} type="file" accept="image/*" onChange={onFile} style={{ display:'none' }}/>
    </div>
  );
}

// Sun icon (light mode active)
function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  );
}

// Moon icon (dark mode active)
function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

export default function App() {
  const [dark, setDark] = useDarkMode();
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [route, setRoute] = useState({ name: 'home', params: {} });
  const [phase, setPhase] = useState('active');
  const [pending, setPending] = useState(null);

  const navigate = useCallback((name, params = {}) => {
    setPending({ name, params });
    setPhase('exit');
  }, []);

  useEffect(() => {
    if (phase === 'exit' && pending) {
      const tm = setTimeout(() => {
        setRoute(pending);
        setPending(null);
        setPhase('enter');
        window.scrollTo(0, 0);
      }, 180);
      return () => clearTimeout(tm);
    }
    if (phase === 'enter') {
      const tm = setTimeout(() => setPhase('active'), 20);
      return () => clearTimeout(tm);
    }
  }, [phase, pending]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        if (route.name === 'sheet') navigate('zone', { systemId: 'orl' });
        else if (route.name === 'zone') navigate('home');
        else if (route.name === 'quiz' || route.name === 'admin') navigate('home');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [route.name, navigate]);

  const cls = phase === 'enter' ? 'page-enter' : phase === 'exit' ? 'page-exit' : 'page-active';
  const rootCls = `${dark ? 'dark' : ''} ${t.vivid ? 'vivid' : ''}`.trim();

  // Expose so ZoneScreen can access the live BactFigure component + dark state
  window.__bm = { vivid: t.vivid, showImages: t.showImages, BactFigure, dark };

  let screen;
  if (route.name === 'home')  screen = <HomeScreen  navigate={navigate} />;
  if (route.name === 'zone')  screen = <ZoneScreen  navigate={navigate} systemId={route.params.systemId} vivid={t.vivid} showImages={t.showImages} />;
  if (route.name === 'sheet') screen = <SheetScreen navigate={navigate} bacteriaId={route.params.bacteriaId} systemId={route.params.systemId || 'orl'} vivid={t.vivid} showImages={t.showImages} />;
  if (route.name === 'quiz')  screen = <QuizScreen  navigate={navigate} />;
  if (route.name === 'admin') screen = <AdminScreen navigate={navigate} />;

  return (
    <div id="app-root" className={rootCls} style={{ '--accent': t.accentColor, minHeight:'100vh' }}>
      {/* Floating dark mode toggle */}
      <button
        onClick={() => setDark(d => !d)}
        title={dark ? 'Passer en mode clair' : 'Passer en mode sombre'}
        style={{
          position: 'fixed', top: 12, right: 12, zIndex: 100,
          width: 34, height: 34, padding: 0, border: '1px solid var(--rule)',
          background: 'var(--paper)', color: 'var(--ink2)',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 2,
        }}
      >
        {dark ? <SunIcon /> : <MoonIcon />}
      </button>

      <div className={cls} style={{ minHeight:'100vh' }} data-screen-label={
        route.name === 'home' ? 'Accueil' : route.name === 'zone' ? `Zone ${route.params.systemId || 'orl'}` : route.name === 'quiz' ? 'Quiz' : route.name === 'admin' ? 'Admin' : 'Fiche bactérie'
      }>
        {screen}
      </div>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Apparence"/>
        <TweakToggle label="Mode sombre" value={dark} onChange={setDark}/>
        <TweakToggle label="Couleurs vives" value={t.vivid} onChange={(v)=>setTweak('vivid', v)}/>
        <TweakColor  label="Couleur accent" value={t.accentColor} onChange={(v)=>setTweak('accentColor', v)}/>
        <TweakSection label="Bactéries"/>
        <TweakToggle label="Images personnalisées" value={t.showImages} onChange={(v)=>setTweak('showImages', v)}/>
        <div style={{ fontSize:10, color:'rgba(41,38,27,.55)', lineHeight:1.4, marginTop:-2 }}>
          Active le bouton <b>+</b> sur chaque vignette pour téléverser une image. Stockée localement.
        </div>
        <TweakButton label="Effacer toutes les images" onClick={()=>{
          if (!confirm('Supprimer toutes les images téléversées ?')) return;
          Object.keys(localStorage).filter(k=>k.startsWith('bm-img:')).forEach(k=>localStorage.removeItem(k));
          window.dispatchEvent(new Event('bm-img-updated'));
        }}/>
      </TweaksPanel>
    </div>
  );
}

// QuizScreen.jsx — QCM depuis Supabase
import React from 'react';
import { T } from './data.js';
import { useQuiz } from '../../hooks/useQuiz.js';
import { useIsMobile } from '../../hooks/useIsMobile.js';
import TopBar from './TopBar.jsx';
import MarkdownView from './MarkdownView.jsx';

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];

const primaryBtn = {
  padding: '10px 24px', background: 'var(--accent)', color: 'var(--paper)', border: 'none',
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.14em', cursor: 'pointer',
  display: 'flex', alignItems: 'center', gap: 10,
};
const ghostBtn = {
  padding: '10px 18px', background: 'transparent', border: '1px solid var(--rule)',
  fontFamily: '"IBM Plex Mono", monospace', fontSize: 11, letterSpacing: '0.14em',
  color: 'var(--ink2)', cursor: 'pointer',
};

// ── Mode definitions ──────────────────────────────────────────────────────────
const MODES = [
  {
    id: 'qcm',
    label: 'QCM',
    title: 'Questions à choix multiples',
    desc: 'Sélectionne la bonne réponse parmi plusieurs propositions. Feedback immédiat après chaque choix.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    ),
  },
  {
    id: 'cas_clinique',
    label: 'Cas cliniques',
    title: 'Cas cliniques',
    desc: 'Un scénario narratif suivi de plusieurs sous-questions liées. Idéal pour entraîner le raisonnement clinique.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
        <rect x="9" y="3" width="6" height="4" rx="1"/>
        <path d="M9 12h6M9 16h4"/>
      </svg>
    ),
  },
  {
    id: 'theorique',
    label: 'Théorique',
    title: 'Questions ouvertes',
    desc: 'Formule ta réponse mentalement puis révèle la correction. Parfait pour réviser les mécanismes et définitions.',
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <path d="M4 19V6a2 2 0 0 1 2-2h7v15H6a2 2 0 0 0-2 2zM13 4h5a2 2 0 0 1 2 2v13"/>
        <path d="M9 8h3M9 12h3M9 16h2"/>
      </svg>
    ),
  },
];

const DIFFS = [
  { id: 'all', label: 'Toutes', stars: null },
  { id: '1',   label: 'Facile',    stars: '★' },
  { id: '2',   label: 'Moyen',     stars: '★★' },
  { id: '3',   label: 'Difficile', stars: '★★★' },
];

// ── Lobby ─────────────────────────────────────────────────────────────────────
function ModeCard({ m, onClick }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 24, padding: '22px 28px',
        background: hover ? T.bg : T.paper,
        border: `1px solid ${hover ? T.ink2 : T.rule}`,
        borderLeft: `4px solid ${hover ? 'var(--accent)' : T.rule}`,
        cursor: 'pointer',
        transform: hover ? 'translateX(3px)' : 'none',
        transition: 'all .18s ease',
      }}>
      <div style={{ color: hover ? 'var(--accent)' : T.ink3, flexShrink: 0, transition: 'color .18s' }}>{m.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.14em', color: T.ink2, marginBottom: 5 }}>{m.label}</div>
        <div style={{ fontFamily: T.serif, fontSize: 18, color: T.ink, marginBottom: 5 }}>{m.title}</div>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.ink3, lineHeight: 1.5 }}>{m.desc}</div>
      </div>
      <div style={{ color: T.ink3, opacity: hover ? 1 : 0, transition: 'opacity .18s', flexShrink: 0 }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M5 12h14M13 6l6 6-6 6"/></svg>
      </div>
    </div>
  );
}

function DiffCard({ d, selected, onClick }) {
  const [hover, setHover] = React.useState(false);
  const sel = selected;
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        padding: '20px 16px', textAlign: 'center', cursor: 'pointer',
        background: sel ? T.ink : hover ? T.bg : T.paper,
        border: `1px solid ${sel ? T.ink : hover ? T.ink2 : T.rule}`,
        transition: 'all .15s ease',
      }}>
      {d.stars && (
        <div style={{ fontFamily: T.mono, fontSize: 16, color: sel ? T.paper : T.ocre, marginBottom: 8, letterSpacing: '0.1em' }}>{d.stars}</div>
      )}
      {!d.stars && (
        <div style={{ fontFamily: T.mono, fontSize: 20, color: sel ? T.paper : T.ink3, marginBottom: 8 }}>∞</div>
      )}
      <div style={{ fontFamily: T.mono, fontSize: 10, letterSpacing: '0.12em', color: sel ? T.paper : T.ink2 }}>{d.label.toUpperCase()}</div>
    </div>
  );
}

function Lobby({ onStart, mobile = false }) {
  const [mode, setMode] = React.useState(null);
  const [diff, setDiff] = React.useState('all');
  const step = mode === null ? 1 : 2;

  return (
    <div style={{ flex: 1, padding: mobile ? '24px 16px 60px' : '48px 56px 80px', maxWidth: 860, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

      {/* Step indicator */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 40, fontFamily: T.mono, fontSize: 9, letterSpacing: '0.18em', color: T.ink3 }}>
        <span style={{ color: step === 1 ? T.ink : T.ink3 }}>01 · MODE</span>
        <span style={{ flex: 'none', width: 32, height: 1, background: T.rule }}/>
        <span style={{ color: step === 2 ? T.ink : T.ink3 }}>02 · DIFFICULTÉ</span>
        <span style={{ flex: 'none', width: 32, height: 1, background: T.rule }}/>
        <span style={{ opacity: 0.4 }}>03 · QUESTIONS</span>
      </div>

      {/* Step 1 — mode */}
      {step === 1 && (
        <div>
          <div style={{ fontFamily: T.serif, fontSize: 15, color: T.ink2, marginBottom: 28, fontStyle: 'italic' }}>
            Quel type d'entraînement ?
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {MODES.map(m => (
              <ModeCard key={m.id} m={m} onClick={() => setMode(m.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Step 2 — difficulty */}
      {step === 2 && (
        <div>
          <button onClick={() => setMode(null)} style={{ ...ghostBtn, padding: '6px 12px', fontSize: 10, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 6 }}>
            ← {MODES.find(m => m.id === mode)?.label}
          </button>
          <div style={{ fontFamily: T.serif, fontSize: 15, color: T.ink2, marginBottom: 28, fontStyle: 'italic' }}>
            Quel niveau de difficulté ?
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: mobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)', gap: 14, marginBottom: 40 }}>
            {DIFFS.map(d => (
              <DiffCard key={d.id} d={d} selected={diff === d.id} onClick={() => setDiff(d.id)} />
            ))}
          </div>
          <button onClick={() => onStart(mode, diff)} style={{ ...primaryBtn, padding: '13px 32px', fontSize: 12 }}>
            <span>COMMENCER</span>
            <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 16 }}>→</span>
          </button>
        </div>
      )}
    </div>
  );
}

// ── Question components ───────────────────────────────────────────────────────
function QuizImage({ url }) {
  if (!url) return null;
  return <img src={url} alt="" style={{ maxHeight: 320, width: '100%', objectFit: 'cover', marginBottom: 24, border: `0.5px solid ${T.rule}`, display: 'block' }}/>;
}

function FeedbackBlock({ children }) {
  return (
    <div style={{ padding: '18px 22px', background: T.paper, borderLeft: `4px solid ${T.ocre}`, marginBottom: 32, fontSize: 15, lineHeight: 1.65, color: T.ink2 }}>
      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 8 }}>EXPLICATION</div>
      {children}
    </div>
  );
}

function OptionList({ options, correct_index, answered, chosen, onChoose }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
      {(options || []).map((opt, i) => {
        const bg = !answered ? 'transparent'
          : i === correct_index ? 'rgba(76,175,80,0.12)'
          : i === chosen && chosen !== correct_index ? 'rgba(229,57,53,0.10)'
          : 'transparent';
        const border = !answered ? T.rule
          : i === correct_index ? '#4caf50'
          : i === chosen && chosen !== correct_index ? '#e53935'
          : T.ruleSoft;
        const opacity = !answered || i === correct_index || i === chosen ? 1 : 0.45;
        return (
          <button key={i} onClick={() => onChoose(i)} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
            border: `1px solid ${border}`, background: bg, opacity,
            cursor: answered ? 'default' : 'pointer',
            fontFamily: T.serif, fontSize: 15, lineHeight: 1.5, color: T.ink,
            transition: 'background 0.3s, border-color 0.3s, opacity 0.3s',
            textAlign: 'left', width: '100%',
          }}>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink3, letterSpacing: '0.1em', flexShrink: 0, paddingTop: 2 }}>{LETTERS[i]}</span>
            <span style={{ flex: 1 }}>{opt}</span>
            {answered && i === correct_index && <span style={{ fontFamily: T.mono, fontSize: 12, color: '#4caf50', flexShrink: 0, paddingTop: 2 }}>✓</span>}
            {answered && i === chosen && chosen !== correct_index && <span style={{ fontFamily: T.mono, fontSize: 12, color: '#e53935', flexShrink: 0, paddingTop: 2 }}>✗</span>}
          </button>
        );
      })}
    </div>
  );
}

function QcmQuestion({ q, onNext }) {
  const [chosen, setChosen] = React.useState(null);
  const [revealed, setRevealed] = React.useState(false);
  const answered = chosen !== null || revealed;
  return (
    <>
      <QuizImage url={q.image_url} />
      <div style={{ fontFamily: T.serif, fontSize: 22, lineHeight: 1.6, color: T.ink, marginBottom: 36, fontStyle: 'italic' }}>{q.question}</div>
      <OptionList options={q.options} correct_index={q.correct_index} answered={answered} chosen={chosen} onChoose={i => { if (!answered) setChosen(i); }}/>
      {answered && q.feedback && <FeedbackBlock><MarkdownView content={q.feedback} /></FeedbackBlock>}
      <div style={{ display: 'flex', gap: 12 }}>
        {!answered && <button onClick={() => setRevealed(true)} style={ghostBtn}>RÉVÉLER</button>}
        {answered && <button onClick={onNext} style={primaryBtn}><span>SUIVANT</span><span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15 }}>→</span></button>}
      </div>
    </>
  );
}

function TheoriqueQuestion({ q, onNext }) {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <>
      <QuizImage url={q.image_url} />
      <div style={{ fontFamily: T.serif, fontSize: 22, lineHeight: 1.6, color: T.ink, marginBottom: 36, fontStyle: 'italic' }}>{q.question}</div>
      {revealed && q.answer && <FeedbackBlock><MarkdownView content={q.answer} /></FeedbackBlock>}
      <div style={{ display: 'flex', gap: 12 }}>
        {!revealed && <button onClick={() => setRevealed(true)} style={ghostBtn}>RÉVÉLER LA RÉPONSE</button>}
        {revealed && <button onClick={onNext} style={primaryBtn}><span>SUIVANT</span><span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15 }}>→</span></button>}
      </div>
    </>
  );
}

function CasCliniqueQuestion({ q, onNext }) {
  const sqs = Array.isArray(q.sub_questions) ? q.sub_questions : [];
  const [sqIdx, setSqIdx] = React.useState(0);
  const [chosen, setChosen] = React.useState(null);
  const [revealed, setRevealed] = React.useState(false);
  const sq = sqs[sqIdx] || null;
  const answered = chosen !== null || revealed;
  const isLast = sqIdx >= sqs.length - 1;
  const nextSQ = () => {
    if (isLast) { onNext(); return; }
    setSqIdx(i => i + 1); setChosen(null); setRevealed(false);
  };
  return (
    <>
      <QuizImage url={q.image_url} />
      <div style={{ padding: '18px 22px', background: T.paper, borderLeft: `4px solid ${T.ocre}`, marginBottom: 32 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 8 }}>CONTEXTE CLINIQUE</div>
        <MarkdownView content={q.context} />
      </div>
      {sq ? (
        <>
          <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.16em', marginBottom: 14 }}>
            SOUS-QUESTION {sqIdx + 1} / {sqs.length}
          </div>
          <div style={{ fontFamily: T.serif, fontSize: 22, lineHeight: 1.6, color: T.ink, marginBottom: 36, fontStyle: 'italic' }}>{sq.question}</div>
          <OptionList options={sq.options} correct_index={sq.correct_index} answered={answered} chosen={chosen} onChoose={i => { if (!answered) setChosen(i); }}/>
          {answered && sq.feedback && <FeedbackBlock><MarkdownView content={sq.feedback} /></FeedbackBlock>}
          <div style={{ display: 'flex', gap: 12 }}>
            {!answered && <button onClick={() => setRevealed(true)} style={ghostBtn}>RÉVÉLER</button>}
            {answered && <button onClick={nextSQ} style={primaryBtn}><span>{isLast ? 'CAS SUIVANT' : 'SOUS-QUESTION SUIVANTE'}</span><span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15 }}>→</span></button>}
          </div>
        </>
      ) : (
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Aucune sous-question.</div>
      )}
    </>
  );
}

// ── Session (questions en cours) ──────────────────────────────────────────────
function Session({ mode, diff, onQuit, mobile = false }) {
  const { questions, loading } = useQuiz(null);
  const filtered = React.useMemo(() => {
    let q = questions.filter(x => (x.type || 'qcm') === mode);
    if (diff !== 'all') q = q.filter(x => String(x.difficulty || 1) === diff);
    return q;
  }, [questions, mode, diff]);

  const [idx, setIdx] = React.useState(0);
  const [key, setKey] = React.useState(0);

  const current = filtered[idx] || null;
  const next = () => { const ni = (idx + 1) % Math.max(filtered.length, 1); setIdx(ni); setKey(k => k + 1); };
  const diffLabel = (d) => d === 1 ? '★' : d === 2 ? '★★' : '★★★';
  const modeLabel = MODES.find(m => m.id === mode)?.label || mode;

  if (loading) return (
    <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Chargement…</div>
  );

  return (
    <div style={{ flex: 1, padding: mobile ? '24px 16px 48px' : '40px 56px 64px', maxWidth: 860, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

      {/* Session header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: T.mono, fontSize: 9, padding: '3px 8px', border: `1px solid ${T.rule}`, color: T.ink3, letterSpacing: '0.1em' }}>{modeLabel.toUpperCase()}</span>
          {diff !== 'all' && <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ocre }}>{DIFFS.find(d => d.id === diff)?.stars}</span>}
        </div>
        <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.14em' }}>
          {current ? `QUESTION ${idx + 1} / ${filtered.length}` : ''}
        </span>
        <button onClick={onQuit} style={{ ...ghostBtn, padding: '5px 12px', fontSize: 10 }}>← QUITTER</button>
      </div>

      {!current ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, paddingTop: 60 }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, color: T.ink3, textAlign: 'center' }}>
            Aucune question disponible pour ce mode et cette difficulté.
          </div>
          <button onClick={onQuit} style={ghostBtn}>← RETOUR</button>
        </div>
      ) : (
        <>
          {(current.type === 'qcm' || !current.type) && <QcmQuestion key={`q-${key}`} q={current} onNext={next} />}
          {current.type === 'theorique' && <TheoriqueQuestion key={`t-${key}`} q={current} onNext={next} />}
          {current.type === 'cas_clinique' && <CasCliniqueQuestion key={`c-${key}`} q={current} onNext={next} />}
        </>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function QuizScreen({ navigate }) {
  const [session, setSession] = React.useState(null); // null = lobby, {mode, diff} = playing
  const mobile = useIsMobile();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: T.serif, background: T.bg }}>
      <TopBar navigate={navigate} center="FORMATION" />

      {/* Header — compact */}
      <div style={{ padding: mobile ? '16px 16px 14px' : '24px 56px 20px', borderBottom: `1px solid ${T.rule}`, background: T.paper }}>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 13, color: T.ocre, marginBottom: 2 }}>Formation</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
          <h1 style={{ fontFamily: T.serif, fontSize: 36, fontWeight: 500, letterSpacing: '-0.02em', fontStyle: 'italic', margin: 0, lineHeight: 1 }}>
            Quiz
          </h1>
          {session && (
            <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15, color: T.ink3 }}>
              — {MODES.find(m => m.id === session.mode)?.title}
            </span>
          )}
        </div>
      </div>

      {session === null ? (
        <Lobby onStart={(mode, diff) => setSession({ mode, diff })} mobile={mobile} />
      ) : (
        <Session mode={session.mode} diff={session.diff} onQuit={() => setSession(null)} mobile={mobile} />
      )}
    </div>
  );
}

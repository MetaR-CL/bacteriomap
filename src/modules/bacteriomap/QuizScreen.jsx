// QuizScreen.jsx — QCM depuis Supabase
import React from 'react';
import { T } from './data.js';
import { useQuiz } from '../../hooks/useQuiz.js';
import { useSystems } from '../../hooks/useSystems.js';
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

function FilterBtn({ active, onClick, children, borderLeft }) {
  return (
    <button onClick={onClick} style={{
      padding: '4px 9px', fontFamily: T.mono, fontSize: 10, letterSpacing: '0.06em', cursor: 'pointer',
      background: active ? T.ink : 'transparent',
      color: active ? T.paper : T.ink2,
      border: `1px solid ${active ? T.ink : T.rule}`,
      borderLeft: borderLeft === false ? 'none' : undefined,
    }}>{children}</button>
  );
}

function QuizImage({ url }) {
  if (!url) return null;
  return (
    <img src={url} alt="" style={{ maxHeight: 320, width: '100%', objectFit: 'cover', marginBottom: 24, border: `0.5px solid ${T.rule}`, display: 'block' }}/>
  );
}

function FeedbackBlock({ children }) {
  return (
    <div style={{ padding: '18px 22px', background: T.paper, borderLeft: `4px solid ${T.ocre}`, marginBottom: 32, fontSize: 15, lineHeight: 1.65, color: T.ink2 }}>
      <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 8 }}>EXPLICATION</div>
      {children}
    </div>
  );
}

// ── QCM ──────────────────────────────────────────────────────────────────────
function QcmQuestion({ q, onNext }) {
  const [chosen, setChosen] = React.useState(null);
  const [revealed, setRevealed] = React.useState(false);
  const answered = chosen !== null || revealed;

  const optBg = (i) => {
    if (!answered) return 'transparent';
    if (i === q.correct_index) return 'rgba(76,175,80,0.12)';
    if (i === chosen && chosen !== q.correct_index) return 'rgba(229,57,53,0.10)';
    return 'transparent';
  };
  const optBorder = (i) => {
    if (!answered) return T.rule;
    if (i === q.correct_index) return '#4caf50';
    if (i === chosen && chosen !== q.correct_index) return '#e53935';
    return T.ruleSoft;
  };
  const optOpacity = (i) => {
    if (!answered) return 1;
    if (i === q.correct_index || i === chosen) return 1;
    return 0.45;
  };

  return (
    <>
      <QuizImage url={q.image_url} />
      <div style={{ fontFamily: T.serif, fontSize: 22, lineHeight: 1.6, color: T.ink, marginBottom: 36, fontStyle: 'italic' }}>
        {q.question}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
        {(q.options || []).map((opt, i) => (
          <button key={i} onClick={() => { if (!answered) setChosen(i); }} style={{
            display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
            border: `1px solid ${optBorder(i)}`,
            background: optBg(i), opacity: optOpacity(i),
            cursor: answered ? 'default' : 'pointer',
            fontFamily: T.serif, fontSize: 15, lineHeight: 1.5, color: T.ink,
            transition: 'background 0.3s, border-color 0.3s, opacity 0.3s',
            textAlign: 'left', width: '100%',
          }}>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink3, letterSpacing: '0.1em', flexShrink: 0, paddingTop: 2 }}>{LETTERS[i]}</span>
            <span style={{ flex: 1 }}>{opt}</span>
            {answered && i === q.correct_index && <span style={{ fontFamily: T.mono, fontSize: 12, color: '#4caf50', flexShrink: 0, paddingTop: 2 }}>✓</span>}
            {answered && i === chosen && chosen !== q.correct_index && <span style={{ fontFamily: T.mono, fontSize: 12, color: '#e53935', flexShrink: 0, paddingTop: 2 }}>✗</span>}
          </button>
        ))}
      </div>
      {answered && q.feedback && (
        <FeedbackBlock><MarkdownView content={q.feedback} /></FeedbackBlock>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        {!answered && <button onClick={() => setRevealed(true)} style={ghostBtn}>RÉVÉLER</button>}
        {answered && <button onClick={onNext} style={primaryBtn}><span>QUESTION SUIVANTE</span><span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15 }}>→</span></button>}
      </div>
    </>
  );
}

// ── THÉORIQUE ────────────────────────────────────────────────────────────────
function TheoriqueQuestion({ q, onNext }) {
  const [revealed, setRevealed] = React.useState(false);
  return (
    <>
      <QuizImage url={q.image_url} />
      <div style={{ fontFamily: T.serif, fontSize: 22, lineHeight: 1.6, color: T.ink, marginBottom: 36, fontStyle: 'italic' }}>
        {q.question}
      </div>
      {revealed && q.answer && (
        <FeedbackBlock><MarkdownView content={q.answer} /></FeedbackBlock>
      )}
      <div style={{ display: 'flex', gap: 12 }}>
        {!revealed && <button onClick={() => setRevealed(true)} style={ghostBtn}>RÉVÉLER LA RÉPONSE</button>}
        {revealed && <button onClick={onNext} style={primaryBtn}><span>QUESTION SUIVANTE</span><span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15 }}>→</span></button>}
      </div>
    </>
  );
}

// ── CAS CLINIQUE ─────────────────────────────────────────────────────────────
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
    setSqIdx(i => i + 1);
    setChosen(null);
    setRevealed(false);
  };

  const optBg = (i) => {
    if (!answered || !sq) return 'transparent';
    if (i === sq.correct_index) return 'rgba(76,175,80,0.12)';
    if (i === chosen && chosen !== sq.correct_index) return 'rgba(229,57,53,0.10)';
    return 'transparent';
  };
  const optBorder = (i) => {
    if (!answered || !sq) return T.rule;
    if (i === sq.correct_index) return '#4caf50';
    if (i === chosen && chosen !== sq.correct_index) return '#e53935';
    return T.ruleSoft;
  };
  const optOpacity = (i) => {
    if (!answered || !sq) return 1;
    if (i === sq.correct_index || i === chosen) return 1;
    return 0.45;
  };

  return (
    <>
      <QuizImage url={q.image_url} />
      {/* Context block */}
      <div style={{ padding: '18px 22px', background: T.paper, borderLeft: `4px solid ${T.ocre}`, marginBottom: 32 }}>
        <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 8 }}>CONTEXTE CLINIQUE</div>
        <MarkdownView content={q.context} />
      </div>

      {sq ? (
        <>
          <div style={{ fontFamily: T.serif, fontSize: 22, lineHeight: 1.6, color: T.ink, marginBottom: 36, fontStyle: 'italic' }}>
            {sq.question}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {(sq.options || []).map((opt, i) => (
              <button key={i} onClick={() => { if (!answered) setChosen(i); }} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
                border: `1px solid ${optBorder(i)}`,
                background: optBg(i), opacity: optOpacity(i),
                cursor: answered ? 'default' : 'pointer',
                fontFamily: T.serif, fontSize: 15, lineHeight: 1.5, color: T.ink,
                transition: 'background 0.3s, border-color 0.3s, opacity 0.3s',
                textAlign: 'left', width: '100%',
              }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink3, letterSpacing: '0.1em', flexShrink: 0, paddingTop: 2 }}>{LETTERS[i]}</span>
                <span style={{ flex: 1 }}>{opt}</span>
                {answered && i === sq.correct_index && <span style={{ fontFamily: T.mono, fontSize: 12, color: '#4caf50', flexShrink: 0, paddingTop: 2 }}>✓</span>}
                {answered && i === chosen && chosen !== sq.correct_index && <span style={{ fontFamily: T.mono, fontSize: 12, color: '#e53935', flexShrink: 0, paddingTop: 2 }}>✗</span>}
              </button>
            ))}
          </div>
          {answered && sq.feedback && (
            <FeedbackBlock><MarkdownView content={sq.feedback} /></FeedbackBlock>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            {!answered && <button onClick={() => setRevealed(true)} style={ghostBtn}>RÉVÉLER</button>}
            {answered && (
              <button onClick={nextSQ} style={primaryBtn}>
                <span>{isLast ? 'CAS SUIVANT' : 'SOUS-QUESTION SUIVANTE'}</span>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15 }}>→</span>
              </button>
            )}
          </div>
        </>
      ) : (
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', color: T.ink3 }}>Aucune sous-question.</div>
      )}
    </>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function QuizScreen({ navigate }) {
  const [filterDiff, setFilterDiff] = React.useState('all');
  const [filterSys,  setFilterSys]  = React.useState(null);
  const [filterType, setFilterType] = React.useState('all');
  const { questions, loading } = useQuiz(filterSys);
  const { systems } = useSystems();

  const filtered = React.useMemo(() => {
    let q = questions;
    if (filterDiff !== 'all') q = q.filter(x => String(x.difficulty || 1) === filterDiff);
    if (filterType !== 'all') q = q.filter(x => (x.type || 'qcm') === filterType);
    return q;
  }, [questions, filterDiff, filterType]);

  const [idx, setIdx] = React.useState(0);
  const [key, setKey] = React.useState(0); // forces remount on question change

  React.useEffect(() => { setIdx(0); setKey(k => k + 1); }, [filterDiff, filterSys, filterType]);

  const current = filtered[idx] || null;
  const diffLabel = (d) => d === 1 ? '★' : d === 2 ? '★★' : '★★★';

  const next = () => {
    if (!filtered.length) return;
    const nextIdx = (idx + 1) % filtered.length;
    setIdx(nextIdx);
    setKey(k => k + 1);
  };

  const typeLabel = (t) => t === 'cas_clinique' ? 'Cas · ' : t === 'theorique' ? 'Théorique · ' : '';

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: T.serif, fontStyle: 'italic', color: T.ink3, fontSize: 18 }}>
        Chargement…
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: T.serif, background: T.bg }}>

      <TopBar navigate={navigate} center="FORMATION" />

      {/* Title */}
      <div style={{ padding: '40px 56px 28px', borderBottom: `1.5px double ${T.rule}`, background: T.paper }}>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, color: T.ocre, marginBottom: 6 }}>Formation</div>
        <h1 style={{ fontFamily: T.serif, fontSize: 80, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 0.92, fontStyle: 'italic', margin: 0 }}>
          Quiz
        </h1>
        <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 18, color: T.ink2, marginTop: 14, maxWidth: 680, lineHeight: 1.5 }}>
          Questions à choix multiples — sélectionne la bonne réponse ou révèle-la directement.
        </div>
      </div>

      {/* Filters */}
      <div style={{ padding: '16px 56px', borderBottom: `1px solid ${T.rule}`, background: T.paper, display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', fontFamily: T.mono, fontSize: 10 }}>
        <span style={{ color: T.ink3, letterSpacing: '0.16em' }}>FILTRES</span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: T.ink3, letterSpacing: '0.12em' }}>TYPE</span>
          <div style={{ display: 'flex' }}>
            {[['all','Tous'],['qcm','QCM'],['cas_clinique','Cas cliniques'],['theorique','Théoriques']].map(([v, l], i) => (
              <FilterBtn key={v} active={filterType === v} onClick={() => setFilterType(v)} borderLeft={i > 0}>{l}</FilterBtn>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ color: T.ink3, letterSpacing: '0.12em' }}>DIFFICULTÉ</span>
          <div style={{ display: 'flex' }}>
            {[['all','Tous'],['1','★'],['2','★★'],['3','★★★']].map(([v, l], i) => (
              <FilterBtn key={v} active={filterDiff === v} onClick={() => setFilterDiff(v)} borderLeft={i > 0}>{l}</FilterBtn>
            ))}
          </div>
        </div>

        {systems.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: T.ink3, letterSpacing: '0.12em' }}>SYSTÈME</span>
            <div style={{ display: 'flex' }}>
              <FilterBtn active={filterSys === null} onClick={() => setFilterSys(null)}>Tous</FilterBtn>
              {systems.map(s => (
                <FilterBtn key={s.id} active={filterSys === s.id} onClick={() => setFilterSys(s.id)} borderLeft={false}>
                  {s.short || s.name}
                </FilterBtn>
              ))}
            </div>
          </div>
        )}

        <span style={{ flex: 1 }} />
        <span style={{ fontStyle: 'italic', fontFamily: T.serif, fontSize: 13, color: T.ink3 }}>
          {filtered.length} question{filtered.length !== 1 ? 's' : ''} dans le tirage
        </span>
      </div>

      {/* Body */}
      {!current ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16, padding: 40 }}>
          <div style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 22, color: T.ink3, textAlign: 'center' }}>
            Aucune question pour ces filtres.
          </div>
          <button onClick={() => { setFilterDiff('all'); setFilterSys(null); setFilterType('all'); }} style={ghostBtn}>
            RÉINITIALISER
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, padding: '40px 56px 64px', maxWidth: 860, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.14em' }}>
              {typeLabel(current.type || 'qcm')}QUESTION {idx + 1} / {filtered.length}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ocre, letterSpacing: '0.1em' }}>
              {diffLabel(current.difficulty || 1)}
            </span>
          </div>

          {/* Per-type rendering — key forces full remount on question change */}
          {(current.type === 'qcm' || !current.type) && (
            <QcmQuestion key={`qcm-${key}`} q={current} onNext={next} />
          )}
          {current.type === 'theorique' && (
            <TheoriqueQuestion key={`th-${key}`} q={current} onNext={next} />
          )}
          {current.type === 'cas_clinique' && (
            <CasCliniqueQuestion key={`cc-${key}`} q={current} onNext={next} />
          )}
        </div>
      )}
    </div>
  );
}

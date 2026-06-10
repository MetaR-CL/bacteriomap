// QuizScreen.jsx — QCM depuis Supabase
import React from 'react';
import { T } from './data.js';
import { useQuiz } from '../../hooks/useQuiz.js';
import { useSystems } from '../../hooks/useSystems.js';
import TopBar from './TopBar.jsx';

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

export default function QuizScreen({ navigate }) {
  const [filterDiff, setFilterDiff] = React.useState('all');
  const [filterSys,  setFilterSys]  = React.useState(null);
  const { questions, loading } = useQuiz(filterSys);
  const { systems } = useSystems();

  const filtered = React.useMemo(() => {
    if (filterDiff === 'all') return questions;
    return questions.filter(q => String(q.difficulty || 1) === filterDiff);
  }, [questions, filterDiff]);

  const [idx,      setIdx]      = React.useState(0);
  const [chosen,   setChosen]   = React.useState(null);
  const [revealed, setRevealed] = React.useState(false);

  React.useEffect(() => { setChosen(null); setRevealed(false); }, [idx]);
  React.useEffect(() => { setIdx(0); setChosen(null); setRevealed(false); }, [filterDiff, filterSys]);

  const current  = filtered[idx] || null;
  const answered = chosen !== null || revealed;

  const next = () => {
    if (!filtered.length) return;
    setIdx(i => (i + 1) % filtered.length);
  };

  const choose = (i) => { if (answered) return; setChosen(i); };
  const reveal = ()  => { if (answered) return; setRevealed(true); };

  const optBg = (i) => {
    if (!answered) return 'transparent';
    if (i === current.correct_index) return 'rgba(76,175,80,0.12)';
    if (i === chosen && chosen !== current.correct_index) return 'rgba(229,57,53,0.10)';
    return 'transparent';
  };
  const optBorder = (i) => {
    if (!answered) return T.rule;
    if (i === current.correct_index) return '#4caf50';
    if (i === chosen && chosen !== current.correct_index) return '#e53935';
    return T.ruleSoft;
  };
  const optOpacity = (i) => {
    if (!answered) return 1;
    if (i === current.correct_index || i === chosen) return 1;
    return 0.45;
  };

  const diffLabel = (d) => d === 1 ? '★' : d === 2 ? '★★' : '★★★';

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
          <button onClick={() => { setFilterDiff('all'); setFilterSys(null); }} style={ghostBtn}>
            RÉINITIALISER
          </button>
        </div>
      ) : (
        <div style={{ flex: 1, padding: '40px 56px 64px', maxWidth: 860, margin: '0 auto', width: '100%', boxSizing: 'border-box' }}>

          {/* Progress */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 32 }}>
            <span style={{ fontFamily: T.mono, fontSize: 10, color: T.ink3, letterSpacing: '0.14em' }}>
              QUESTION {idx + 1} / {filtered.length}
            </span>
            <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ocre, letterSpacing: '0.1em' }}>
              {diffLabel(current.difficulty || 1)}
            </span>
          </div>

          {/* Question text */}
          <div style={{ fontFamily: T.serif, fontSize: 22, lineHeight: 1.6, color: T.ink, marginBottom: 36, fontStyle: 'italic' }}>
            {current.question}
          </div>

          {/* Options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
            {(current.options || []).map((opt, i) => (
              <button key={i} onClick={() => choose(i)} style={{
                display: 'flex', alignItems: 'flex-start', gap: 14, padding: '14px 18px',
                border: `1px solid ${optBorder(i)}`,
                background: optBg(i),
                opacity: optOpacity(i),
                cursor: answered ? 'default' : 'pointer',
                fontFamily: T.serif, fontSize: 15, lineHeight: 1.5, color: T.ink,
                transition: 'background 0.3s, border-color 0.3s, opacity 0.3s',
                textAlign: 'left', width: '100%',
              }}>
                <span style={{ fontFamily: T.mono, fontSize: 11, color: T.ink3, letterSpacing: '0.1em', flexShrink: 0, paddingTop: 2 }}>
                  {LETTERS[i]}
                </span>
                <span style={{ flex: 1 }}>{opt}</span>
                {answered && i === current.correct_index && (
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: '#4caf50', flexShrink: 0, paddingTop: 2 }}>✓</span>
                )}
                {answered && i === chosen && chosen !== current.correct_index && (
                  <span style={{ fontFamily: T.mono, fontSize: 12, color: '#e53935', flexShrink: 0, paddingTop: 2 }}>✗</span>
                )}
              </button>
            ))}
          </div>

          {/* Feedback */}
          {answered && current.feedback && (
            <div style={{ padding: '18px 22px', background: T.paper, borderLeft: `4px solid ${T.ocre}`, marginBottom: 32, fontFamily: T.serif, fontSize: 15, lineHeight: 1.65, color: T.ink2 }}>
              <div style={{ fontFamily: T.mono, fontSize: 9, color: T.ink3, letterSpacing: '0.18em', marginBottom: 8 }}>EXPLICATION</div>
              {current.feedback}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            {!answered && (
              <button onClick={reveal} style={ghostBtn}>RÉVÉLER</button>
            )}
            {answered && (
              <button onClick={next} style={primaryBtn}>
                <span>QUESTION SUIVANTE</span>
                <span style={{ fontFamily: T.serif, fontStyle: 'italic', fontSize: 15 }}>→</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

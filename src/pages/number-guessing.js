import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';

// ─── WebSocket ────────────────────────────────────────────────────────────────
const WS_SERVER = 'ws://localhost:3001';
function uid(n = 8) { return Math.random().toString(36).slice(2, 2 + n).toUpperCase(); }

// ─── Game Helpers ─────────────────────────────────────────────────────────────
function countCorrect(secret, guess) {
  let n = 0;
  for (let i = 0; i < 3; i++) if (secret[i] === guess[i]) n++;
  return n;
}

function validateNum(s) {
  if (!/^\d{3}$/.test(s)) return 'Must be exactly 3 digits';
  const n = parseInt(s, 10);
  if (n < 100 || n > 999) return 'Must be between 100 and 999';
  return null;
}

// ─── Theme Hook ───────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const chk = () => setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    chk();
    const obs = new MutationObserver(chk);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

// ─── Guess Row ────────────────────────────────────────────────────────────────
function GuessRow({ g, color, dark, borderC, text, sub }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0.7rem', background: dark ? '#252545' : '#f0f2ff', borderRadius: 8, border: `1px solid ${borderC}` }}>
      <span style={{ fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.25rem', color: text, fontSize: '1.05rem' }}>{g.guess}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: g.correct === 3 ? '#22c55e' : g.correct === 0 ? sub : color }}>
        {g.correct} correct
      </span>
    </div>
  );
}

// ─── Game Component ───────────────────────────────────────────────────────────
function NumberGuessingGame() {
  const dark = useTheme();
  const [mode, setMode] = useState('computer');

  // ── Core game state ───────────────────────────────────────────────────────
  // phase: 'setup' | 'handoff' | 'p2setup' | 'game' | 'over'
  const [phase, setPhase] = useState('setup');
  const [turn, setTurn] = useState(1);        // 1 or 2 — whose turn to guess
  const [winner, setWinner] = useState(null); // 1 or 2

  // Secrets stored in both state (for display) and refs (for stable closures)
  const [p1Secret, setP1Secret] = useState('');
  const [p2Secret, setP2Secret] = useState('');
  const p1Ref = useRef('');
  const p2Ref = useRef('');
  function saveP1(s) { p1Ref.current = s; setP1Secret(s); }
  function saveP2(s) { p2Ref.current = s; setP2Secret(s); }

  const [p1Guesses, setP1Guesses] = useState([]); // [{guess, correct}]
  const [p2Guesses, setP2Guesses] = useState([]); // [{guess, correct}]

  const [revealMine, setRevealMine] = useState(false);

  const [secretDigits, setSecretDigits] = useState(['', '', '']);
  const sRef0 = useRef(null); const sRef1 = useRef(null); const sRef2 = useRef(null);
  const sRefs = [sRef0, sRef1, sRef2];
  const [guessInput,  setGuessInput]  = useState('');
  const [error, setError] = useState('');
  const [thinking, setThinking] = useState(false);

  // AI candidates (smart elimination)
  const candidatesRef = useRef(Array.from({ length: 900 }, (_, i) => String(i + 100)));

  // ── Online state ──────────────────────────────────────────────────────────
  const [conn, setConn]       = useState('idle');
  const [me, setMe]           = useState(null);
  const meRef                 = useRef(null);
  const turnRef               = useRef(1);
  const [gameId, setGameId]   = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied]   = useState(false);
  const wsRef                 = useRef(null);
  const tempSecretRef         = useRef(''); // holds secret until WS assigns player number

  // ── URL detection ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const gId = new URLSearchParams(window.location.search).get('game');
    if (gId && gId.startsWith('NG')) {
      setGameId(gId);
      setMode('online');
      setShareUrl(window.location.href);
    }
  }, []);

  // ── WS move handler (stable via refs) ─────────────────────────────────────
  function handleWsMove(msg) {
    const { action, player, guess, correct } = msg;
    const myNum = meRef.current;

    if (action === 'guess') {
      // Opponent guessed against MY secret → calculate & send result
      if (player !== myNum) {
        const myS = myNum === 1 ? p1Ref.current : p2Ref.current;
        const n = countCorrect(myS, guess);
        wsRef.current?.send(JSON.stringify({ type: 'move', action: 'result', player, guess, correct: n }));
      }
    }

    if (action === 'result') {
      // Everyone receives this; update the guesser's history
      const addFn = player === 1
        ? (g) => setP1Guesses(prev => [...prev, g])
        : (g) => setP2Guesses(prev => [...prev, g]);
      addFn({ guess, correct });
      if (correct === 3) {
        setWinner(player);
        setPhase('over');
      } else {
        const next = 3 - player;
        turnRef.current = next;
        setTurn(next);
      }
    }
  }

  // ── WS connection ─────────────────────────────────────────────────────────
  function connectWS(gId) {
    setConn('connecting');
    const pid = uid(12);
    const ws = new WebSocket(`${WS_SERVER}?game=${gId}&player=${pid}`);
    wsRef.current = ws;

    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'waiting') {
        meRef.current = 1; setMe(1);
        saveP1(tempSecretRef.current);
        setConn('waiting');
      } else if (msg.type === 'start') {
        const n = msg.playerNumber;
        meRef.current = n; setMe(n);
        if (n === 1) saveP1(tempSecretRef.current);
        else         saveP2(tempSecretRef.current);
        setConn('playing');
        turnRef.current = 1; setTurn(1);
        setPhase('game');
      } else if (msg.type === 'full')       { setConn('full'); }
      else if (msg.type === 'disconnect')   { setConn('disconnected'); }
      else if (msg.type === 'move')         { handleWsMove(msg); }
      else if (msg.type === 'reset') {
        // Keep secrets, restart board
        setP1Guesses([]); setP2Guesses([]);
        setRevealMine(false);
        turnRef.current = 1; setTurn(1);
        setWinner(null); setGuessInput(''); setError('');
        setPhase('game');
      }
    };
    ws.onclose = () => setConn(p => (p === 'playing' || p === 'waiting') ? 'disconnected' : p);
    ws.onerror = () => setConn('error');
  }

  // ── Full reset ────────────────────────────────────────────────────────────
  function fullReset() {
    setPhase('setup');
    saveP1(''); saveP2('');
    setP1Guesses([]); setP2Guesses([]);
    turnRef.current = 1; setTurn(1);
    setWinner(null); setSecretDigits(['', '', '']); setGuessInput('');
    setError(''); setThinking(false); setRevealMine(false);
    candidatesRef.current = Array.from({ length: 900 }, (_, i) => String(i + 100));
  }

  // ── Mode switcher ─────────────────────────────────────────────────────────
  function changeMode(m) {
    wsRef.current?.close();
    setConn('idle'); setMe(null); meRef.current = null;
    fullReset();
    if (m === 'online') {
      const gId = 'NG' + uid(8);
      setGameId(gId);
      if (typeof window !== 'undefined') {
        const u = new URL(window.location.href);
        u.searchParams.set('game', gId);
        window.history.pushState({}, '', u.toString());
        setShareUrl(`${window.location.origin}${window.location.pathname}?game=${gId}`);
      }
    } else {
      setGameId(null);
      if (typeof window !== 'undefined') {
        const u = new URL(window.location.href);
        u.searchParams.delete('game');
        window.history.pushState({}, '', u.toString());
      }
    }
    setMode(m);
  }

  // ── Secret box helpers ────────────────────────────────────────────────────
  function handleSecretDigit(i, val) {
    const d = val.replace(/\D/g, '').slice(-1);
    setSecretDigits(prev => { const n = [...prev]; n[i] = d; return n; });
    if (d && i < 2) sRefs[i + 1].current?.focus();
  }
  function handleSecretKey(i, e) {
    if (e.key === 'Backspace' && !secretDigits[i] && i > 0) sRefs[i - 1].current?.focus();
  }

  // ── Secret submission ─────────────────────────────────────────────────────
  function handleSecretSubmit(e) {
    e.preventDefault();
    const secretInput = secretDigits.join('');
    const err = validateNum(secretInput);
    if (err) { setError(err); return; }
    setError('');

    if (mode === 'computer') {
      saveP1(secretInput);
      const cs = String(Math.floor(Math.random() * 900) + 100);
      saveP2(cs);
      candidatesRef.current = Array.from({ length: 900 }, (_, i) => String(i + 100));
      setSecretDigits(['', '', '']);
      turnRef.current = 1; setTurn(1);
      setPhase('game');
    } else if (mode === 'friend') {
      if (phase === 'setup') {
        saveP1(secretInput);
        setSecretDigits(['', '', '']);
        setPhase('handoff');
      } else {
        saveP2(secretInput);
        setSecretDigits(['', '', '']);
        turnRef.current = 1; setTurn(1);
        setPhase('game');
      }
    } else {
      tempSecretRef.current = secretInput;
      setSecretDigits(['', '', '']);
      connectWS(gameId);
    }
  }

  // ── Guess submission ──────────────────────────────────────────────────────
  function handleGuessSubmit(e) {
    e.preventDefault();
    const err = validateNum(guessInput);
    if (err) { setError(err); return; }
    setError('');
    const guess = guessInput;
    setGuessInput('');

    if (mode === 'online') {
      wsRef.current?.send(JSON.stringify({ type: 'move', action: 'guess', player: meRef.current, guess }));
      return;
    }

    // Local modes: auto-calculate
    const opSecret = turn === 1 ? p2Ref.current : p1Ref.current;
    const correct  = countCorrect(opSecret, guess);
    if (turn === 1) setP1Guesses(prev => [...prev, { guess, correct }]);
    else            setP2Guesses(prev => [...prev, { guess, correct }]);

    if (correct === 3) { setWinner(turn); setPhase('over'); }
    else { const n = 3 - turn; turnRef.current = n; setTurn(n); }
  }

  // ── Computer AI ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'computer' || phase !== 'game' || turn !== 2 || winner) return;
    setThinking(true);
    const id = setTimeout(() => {
      const cands = candidatesRef.current;
      const guess  = cands[Math.floor(Math.random() * cands.length)];
      const correct = countCorrect(p1Ref.current, guess);
      candidatesRef.current = cands.filter(c => countCorrect(c, guess) === correct);
      setP2Guesses(prev => [...prev, { guess, correct }]);
      if (correct === 3) { setWinner(2); setPhase('over'); }
      else { turnRef.current = 1; setTurn(1); }
      setThinking(false);
    }, 900);
    return () => clearTimeout(id);
  }, [mode, phase, turn, winner]);

  // ── Play Again ────────────────────────────────────────────────────────────
  function playAgain() {
    if (mode === 'online') {
      wsRef.current?.send(JSON.stringify({ type: 'reset' }));
    } else {
      setP1Guesses([]); setP2Guesses([]);
      turnRef.current = 1; setTurn(1);
      setWinner(null); setGuessInput(''); setError(''); setRevealMine(false);
      if (mode === 'computer') {
        const cs = String(Math.floor(Math.random() * 900) + 100);
        saveP2(cs);
        candidatesRef.current = Array.from({ length: 900 }, (_, i) => String(i + 100));
      }
      setPhase('game');
    }
  }

  // ── Colours ───────────────────────────────────────────────────────────────
  const bg      = dark ? '#0f0f1a' : '#f0f4ff';
  const surface = dark ? '#1a1a30' : '#ffffff';
  const text    = dark ? '#e0e0f0' : '#1a1a2e';
  const sub     = dark ? 'rgba(224,224,240,.5)' : 'rgba(26,26,46,.5)';
  const accent  = '#6c63ff';
  const borderC = dark ? '#3a3a6a' : '#c5caff';
  const shadow  = dark ? '0 8px 32px rgba(0,0,0,.6)' : '0 8px 32px rgba(108,99,255,.12)';
  const panelBg = dark ? '#12122a' : '#f8f9ff';
  const P1C     = '#6c63ff';
  const P2C     = '#f472b6';

  // ── Derived ───────────────────────────────────────────────────────────────
  const isOnline  = mode === 'online';
  // "viewAs": whose perspective to show in my panel
  const viewAs    = isOnline ? (me ?? 1) : (mode === 'friend' ? turn : 1);
  const myGuesses = viewAs === 1 ? p1Guesses : p2Guesses;
  const opGuesses = viewAs === 1 ? p2Guesses : p1Guesses;
  const myDisplaySecret = viewAs === 1 ? p1Secret : p2Secret;
  const myLabel   = isOnline ? 'You' : (mode === 'computer' ? 'You' : `Player ${viewAs}`);
  const opLabel   = isOnline ? 'Opponent' : (mode === 'computer' ? 'Computer' : `Player ${3 - viewAs}`);
  const myColor   = viewAs === 1 ? P1C : P2C;
  const opColor   = viewAs === 1 ? P2C : P1C;

  const showGuessInput = phase === 'game' && !winner && !thinking && (
    isOnline   ? (conn === 'playing' && turn === me) :
    mode === 'computer' ? turn === 1 : true
  );

  const turnLabel = thinking ? 'Computer is thinking…'
    : isOnline    ? (turn === me ? '🟢 Your Turn' : '⏳ Opponent\'s Turn')
    : mode === 'computer' ? (turn === 1 ? 'Your Turn' : 'Computer\'s Turn')
    : `Player ${turn}'s Turn`;

  function tabStyle(m) {
    const active = mode === m;
    return {
      padding: '0.45rem 1.1rem', borderRadius: 10,
      border: `2px solid ${active ? accent : borderC}`,
      fontSize: '0.875rem', fontWeight: active ? 700 : 500, cursor: 'pointer',
      background: active ? accent : (dark ? '#1e1e38' : '#e8ecff'),
      color: active ? '#fff' : sub,
      transition: 'all 0.18s ease', whiteSpace: 'nowrap',
    };
  }

  const inputStyle = {
    padding: '0.55rem 0.8rem', borderRadius: 10,
    border: `2px solid ${borderC}`, background: dark ? '#1e1e38' : '#eef0ff',
    color: text, fontFamily: 'monospace', outline: 'none',
    textAlign: 'center', transition: 'border-color 0.2s',
  };
  const btnPrimary = {
    padding: '0.6rem 1.4rem', background: accent, color: '#fff',
    border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer',
    fontSize: '0.9rem',
  };

  const showOverlay = isOnline && ['connecting', 'full', 'disconnected', 'error'].includes(conn);

  // ── Hand-off screen (friend mode between P1 and P2 setup) ─────────────────
  if (phase === 'handoff') {
    return (
      <Layout title="Number Guessing">
        <main style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', fontFamily: "'Segoe UI',system-ui,sans-serif" }}>
          <div style={{ background: surface, borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 420, width: '90%', boxShadow: shadow, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4rem' }}>
            <div style={{ fontSize: '3rem' }}>🤝</div>
            <h2 style={{ margin: 0, color: P1C }}>Player 1's secret is set!</h2>
            <p style={{ color: sub, margin: 0 }}>Pass the device to <strong style={{ color: P2C }}>Player 2</strong> to enter their secret number.</p>
            <button onClick={() => setPhase('p2setup')} style={{ ...btnPrimary, background: P2C, padding: '0.75rem 2.2rem', fontSize: '1rem' }}>
              I'm Player 2 – Ready
            </button>
          </div>
        </main>
      </Layout>
    );
  }

  return (
    <Layout title="Number Guessing" description="Guess the 3-digit secret number">
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }
        .ng-card { animation: fadeUp 0.25s ease; }
      `}</style>

      {/* ── Online overlays ── */}
      {showOverlay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: surface, borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 400, width: '90%', boxShadow: shadow, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {conn === 'connecting'   && <><div style={{ fontSize: '2.5rem' }}>⏳</div><h2 style={{ margin: 0, color: accent }}>Connecting…</h2><p style={{ color: sub, margin: 0 }}>Setting up your game room</p></>}
            {conn === 'full'         && <><div style={{ fontSize: '2.5rem' }}>🚫</div><h2 style={{ margin: 0, color: P2C }}>Game is Full</h2><p style={{ color: sub, margin: 0 }}>This game already has two players.</p></>}
            {conn === 'disconnected' && <><div style={{ fontSize: '2.5rem' }}>🔌</div><h2 style={{ margin: 0 }}>Opponent Disconnected</h2><button onClick={() => window.location.reload()} style={btnPrimary}>New Game</button></>}
            {conn === 'error'        && <><div style={{ fontSize: '2.5rem' }}>⚠️</div><h2 style={{ margin: 0 }}>Connection Error</h2><button onClick={() => window.location.reload()} style={btnPrimary}>Try Again</button></>}
          </div>
        </div>
      )}

      <main style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: "'Segoe UI',system-ui,sans-serif", transition: 'background 0.3s,color 0.3s' }}>

        {/* Title */}
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: accent, margin: '0 0 0.3rem', letterSpacing: 1 }}>Number Guessing</h1>
        <p style={{ color: sub, margin: '0 0 1.4rem', fontSize: '0.9rem', textAlign: 'center' }}>
          Each player picks a 3-digit secret (100–999) · Guess by exact-position matches
        </p>

        {/* Mode Tabs */}
        {phase !== 'game' && phase !== 'over' && (
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.4rem' }}>
            <button style={tabStyle('computer')} onClick={() => changeMode('computer')}>vs Computer</button>
            <button style={tabStyle('friend')}   onClick={() => changeMode('friend')}>vs Friend</button>
            <button style={tabStyle('online')}   onClick={() => changeMode('online')}>Online</button>
          </div>
        )}

        {/* ─── SETUP PHASE ─────────────────────────────────────────────────── */}
        {(phase === 'setup' || phase === 'p2setup') && (
          <>
            {/* Share link (online, before connecting) */}
            {isOnline && conn === 'idle' && (
              <div style={{ background: panelBg, border: `2px solid ${borderC}`, borderRadius: 14, padding: '1rem 1.3rem', marginBottom: '1.2rem', width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <p style={{ margin: 0, fontWeight: 700, color: text, fontSize: '0.95rem' }}>🔗 Share this link with your opponent first!</p>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input readOnly value={shareUrl} style={{ flex: 1, minWidth: 0, padding: '0.45rem 0.7rem', borderRadius: 8, border: `1.5px solid ${borderC}`, background: dark ? '#1e1e38' : '#eef0ff', color: text, fontSize: '0.8rem', fontFamily: 'monospace', outline: 'none' }} onFocus={e => e.target.select()} />
                  <button onClick={() => { navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 2500); }}
                    style={{ ...btnPrimary, padding: '0.45rem 0.9rem', background: copied ? '#22c55e' : accent, fontSize: '0.82rem' }}>
                    {copied ? '✓' : 'Copy'}
                  </button>
                </div>
              </div>
            )}

            {/* Waiting for opponent (online) */}
            {isOnline && conn === 'waiting' && (
              <div style={{ background: panelBg, border: `2px solid ${borderC}`, borderRadius: 14, padding: '1rem 1.3rem', marginBottom: '1.2rem', width: '100%', maxWidth: 440, textAlign: 'center' }}>
                <p style={{ margin: 0, fontWeight: 600, color: text }}>⏳ Waiting for opponent to join…</p>
                <p style={{ margin: '0.4rem 0 0', color: sub, fontSize: '0.82rem' }}>Share: <span style={{ fontFamily: 'monospace', color: accent }}>{shareUrl.slice(0, 52)}…</span></p>
              </div>
            )}

            {/* Secret input card */}
            {conn !== 'waiting' && (
              <div className="ng-card" style={{ background: surface, borderRadius: 20, padding: '2rem 2rem', maxWidth: 380, width: '100%', boxShadow: shadow, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.3rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '0.4rem' }}>🔐</div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', color: phase === 'p2setup' ? P2C : (isOnline ? accent : P1C) }}>
                    {phase === 'p2setup' ? 'Player 2' : isOnline ? 'Your' : 'Player 1'}&nbsp;Secret Number
                  </h2>
                  <p style={{ color: sub, margin: '0.3rem 0 0', fontSize: '0.82rem' }}>
                    {phase === 'p2setup' ? 'Don\'t let Player 1 see!' : 'Pick a number your opponent must guess'}
                  </p>
                </div>

                <form onSubmit={handleSecretSubmit} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                    <div style={{ display: 'flex', gap: '0.6rem' }}>
                      {[0, 1, 2].map(i => (
                        <input
                          key={i}
                          ref={sRefs[i]}
                          type="password"
                          inputMode="numeric"
                          maxLength={1}
                          value={secretDigits[i]}
                          onChange={e => { handleSecretDigit(i, e.target.value); setError(''); }}
                          onKeyDown={e => handleSecretKey(i, e)}
                          style={{ ...inputStyle, fontSize: '2rem', width: '3.2rem', textAlign: 'center' }}
                          autoFocus={i === 0}
                        />
                      ))}
                    </div>
                    {error && <p style={{ margin: 0, color: '#f87171', fontSize: '0.82rem' }}>{error}</p>}
                    <p style={{ margin: 0, color: sub, fontSize: '0.78rem' }}>3 digits · 100 to 999</p>
                  </div>
                  <button type="submit" style={{ ...btnPrimary, padding: '0.7rem 2.2rem', fontSize: '1rem', background: phase === 'p2setup' ? P2C : accent }}
                    disabled={isOnline && !['idle'].includes(conn)}>
                    {isOnline && conn === 'connecting' ? 'Connecting…' : 'Set Secret & Start'}
                  </button>
                </form>
              </div>
            )}
          </>
        )}

        {/* ─── GAME PHASE ──────────────────────────────────────────────────── */}
        {phase === 'game' && (
          <>
            {/* Turn badge */}
            <div style={{ marginBottom: '1rem', padding: '0.45rem 1.4rem', borderRadius: 20, background: dark ? '#252545' : '#e8ecff', border: `2px solid ${thinking ? borderC : (turn === viewAs ? myColor : opColor)}`, fontSize: '0.9rem', fontWeight: 700, color: thinking ? sub : (turn === viewAs ? myColor : opColor), transition: 'all 0.2s' }}>
              {turnLabel}
            </div>

            {/* Mode + round info */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
              <button style={tabStyle('computer')} onClick={() => changeMode('computer')}>vs Computer</button>
              <button style={tabStyle('friend')}   onClick={() => changeMode('friend')}>vs Friend</button>
              <button style={tabStyle('online')}   onClick={() => changeMode('online')}>Online</button>
            </div>

            {/* Two-panel layout */}
            <div style={{ display: 'flex', gap: '1rem', width: '100%', maxWidth: 780, flexWrap: 'wrap', justifyContent: 'center', marginBottom: '1.2rem' }}>

              {/* ── My Panel ── */}
              <div style={{ flex: '1 1 320px', background: surface, borderRadius: 16, padding: '1.2rem', boxShadow: shadow, border: `2px solid ${myColor}33` }}>
                <h3 style={{ margin: '0 0 0.8rem', color: myColor, fontSize: '1rem', fontWeight: 700 }}>{myLabel}</h3>

                {/* My secret */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.9rem', flexWrap: 'wrap' }}>
                  <span style={{ color: sub, fontSize: '0.8rem' }}>Your secret:</span>
                  <span style={{ fontFamily: 'monospace', fontSize: '1.2rem', letterSpacing: '0.35rem', color: myColor, fontWeight: 700 }}>
                    {revealMine ? (myDisplaySecret || '???') : '● ● ●'}
                  </span>
                  <button onClick={() => setRevealMine(v => !v)} style={{ background: 'none', border: `1px solid ${borderC}`, color: sub, borderRadius: 6, padding: '0.15rem 0.5rem', fontSize: '0.7rem', cursor: 'pointer' }}>
                    {revealMine ? 'Hide' : 'Show'}
                  </button>
                </div>

                {/* My guess history */}
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: sub, textTransform: 'uppercase', letterSpacing: 1 }}>Your Guesses</p>
                {myGuesses.length === 0
                  ? <p style={{ color: sub, fontSize: '0.82rem', margin: '0 0 0.8rem' }}>No guesses yet</p>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 170, overflowY: 'auto', marginBottom: '0.8rem' }}>
                      {myGuesses.map((g, i) => <GuessRow key={i} g={g} color={myColor} dark={dark} borderC={borderC} text={text} sub={sub} />)}
                    </div>
                }

              </div>

              {/* ── Opponent Panel ── */}
              <div style={{ flex: '1 1 280px', background: surface, borderRadius: 16, padding: '1.2rem', boxShadow: shadow, border: `2px solid ${opColor}33` }}>
                <h3 style={{ margin: '0 0 0.8rem', color: opColor, fontSize: '1rem', fontWeight: 700 }}>{opLabel}</h3>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.75rem', fontWeight: 700, color: sub, textTransform: 'uppercase', letterSpacing: 1 }}>{opLabel}'s Guesses</p>
                {opGuesses.length === 0
                  ? <p style={{ color: sub, fontSize: '0.82rem', margin: 0 }}>No guesses yet</p>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 260, overflowY: 'auto' }}>
                      {opGuesses.map((g, i) => <GuessRow key={i} g={g} color={opColor} dark={dark} borderC={borderC} text={text} sub={sub} />)}
                    </div>
                }
              </div>
            </div>

            {/* Guess input */}
            {showGuessInput && (
              <form onSubmit={handleGuessSubmit}
                style={{ display: 'flex', gap: '0.6rem', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center', background: surface, padding: '1rem 1.5rem', borderRadius: 14, boxShadow: shadow }}>
                <label style={{ color: sub, fontSize: '0.88rem', whiteSpace: 'nowrap' }}>
                  {mode === 'friend' ? `Player ${turn} – ` : ''}Enter Guess:
                </label>
                <input
                  type="text" inputMode="numeric" maxLength={3}
                  value={guessInput}
                  onChange={e => { setGuessInput(e.target.value.replace(/\D/g, '')); setError(''); }}
                  placeholder="000"
                  style={{ ...inputStyle, fontSize: '1.6rem', width: '7rem', letterSpacing: '0.45rem' }}
                  autoFocus
                />
                <button type="submit" style={btnPrimary}>Submit Guess</button>
                {error && <p style={{ width: '100%', textAlign: 'center', margin: 0, color: '#f87171', fontSize: '0.82rem' }}>{error}</p>}
              </form>
            )}
          </>
        )}

        {/* ─── OVER PHASE ──────────────────────────────────────────────────── */}
        {phase === 'over' && winner && (
          <div className="ng-card" style={{ background: surface, borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 440, width: '90%', boxShadow: shadow, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.1rem' }}>
            <div style={{ fontSize: '3rem' }}>🎉</div>
            <h2 style={{ margin: 0, fontSize: '1.9rem', color: winner === (isOnline ? me : 1) && (isOnline || mode === 'computer') ? P1C : (winner === 1 ? P1C : P2C) }}>
              {isOnline
                ? (winner === me ? 'You Win!' : 'Opponent Wins!')
                : mode === 'computer'
                  ? (winner === 1 ? 'You Win!' : 'Computer Wins!')
                  : `Player ${winner} Wins!`}
            </h2>

            {/* Reveal the guessed secret */}
            <div style={{ background: dark ? '#252545' : '#f0f2ff', borderRadius: 12, padding: '0.9rem 1.4rem', display: 'flex', flexDirection: 'column', gap: '0.3rem', alignItems: 'center' }}>
              <span style={{ color: sub, fontSize: '0.8rem' }}>The secret number was</span>
              <span style={{ fontFamily: 'monospace', fontSize: '2rem', fontWeight: 800, letterSpacing: '0.5rem', color: winner === 1 ? P2C : P1C }}>
                {isOnline
                  ? (winner === 1 ? p1Guesses : p2Guesses).slice(-1)[0]?.guess
                  : winner === 1 ? p2Secret : p1Secret}
              </span>
              <span style={{ color: sub, fontSize: '0.8rem' }}>
                Guessed in {(winner === 1 ? p1Guesses : p2Guesses).length} attempt{(winner === 1 ? p1Guesses : p2Guesses).length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Both secrets revealed (local modes) */}
            {!isOnline && (
              <div style={{ fontSize: '0.82rem', color: sub, lineHeight: 1.6 }}>
                Player 1's secret: <strong style={{ color: P1C, fontFamily: 'monospace' }}>{p1Secret}</strong>
                &nbsp;·&nbsp;
                {mode === 'computer' ? 'Computer' : 'Player 2'}'s secret: <strong style={{ color: P2C, fontFamily: 'monospace' }}>{p2Secret}</strong>
              </div>
            )}

            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button onClick={() => changeMode(mode)} style={{ ...btnPrimary, padding: '0.75rem 2rem' }}>Play Again</button>
            </div>
          </div>
        )}

      </main>
    </Layout>
  );
}

export default function NumberGuessingPage() {
  return <NumberGuessingGame />;
}

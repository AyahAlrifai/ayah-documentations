import React, { useState, useEffect, useReducer, useRef } from 'react';
import Layout from '@theme/Layout';

// ─── WebSocket ────────────────────────────────────────────────────────────────
const WS_SERVER = 'ws://localhost:3001';
function uid(len = 8) { return Math.random().toString(36).slice(2, 2 + len).toUpperCase(); }

// ─── Board Constants ──────────────────────────────────────────────────────────
const DOTS  = 5;
const CELLS = DOTS - 1;
const CELL  = 75;
const DOT_R = 6;
const PAD   = 35;
const SVG_SZ = CELLS * CELL + 2 * PAD;

const P1 = '#6c63ff';
const P2 = '#f472b6';
const pColor = p => p === 1 ? P1 : P2;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const mkH  = () => Array.from({ length: DOTS  }, () => Array(CELLS).fill(null));
const mkV  = () => Array.from({ length: CELLS }, () => Array(DOTS).fill(null));
const mkSq = () => Array.from({ length: CELLS }, () => Array(CELLS).fill(null));

// ─── AI ───────────────────────────────────────────────────────────────────────
function sidesOf(nh, nv, r, c) {
  let n = 0;
  if (nh[r][c]   !== null) n++;
  if (nh[r+1][c] !== null) n++;
  if (nv[r][c]   !== null) n++;
  if (nv[r][c+1] !== null) n++;
  return n;
}

function getAIMove(hLines, vLines, squares) {
  const moves = [];
  for (let r = 0; r < DOTS;  r++) for (let c = 0; c < CELLS; c++) if (hLines[r][c] === null) moves.push({ lineType: 'h', r, c });
  for (let r = 0; r < CELLS; r++) for (let c = 0; c < DOTS;  c++) if (vLines[r][c] === null)  moves.push({ lineType: 'v', r, c });
  if (!moves.length) return null;

  function afterMove(m) {
    const nh = hLines.map(row => [...row]);
    const nv = vLines.map(row => [...row]);
    if (m.lineType === 'h') nh[m.r][m.c] = 2; else nv[m.r][m.c] = 2;
    return { nh, nv };
  }

  function scoreMove(m) {
    const { nh, nv } = afterMove(m);
    let completions = 0, dangers = 0;
    for (let r = 0; r < CELLS; r++) {
      for (let c = 0; c < CELLS; c++) {
        if (squares[r][c] !== null) continue;
        const s = sidesOf(nh, nv, r, c);
        if (s === 4) completions++;
        else if (s === 3) dangers++;
      }
    }
    return completions * 10 - dangers;
  }

  moves.sort((a, b) => scoreMove(b) - scoreMove(a));
  return moves[0];
}

// ─── Game Reducer ─────────────────────────────────────────────────────────────
const INIT_STATE = {
  hLines: mkH(), vLines: mkV(), squares: mkSq(),
  turn: 1, scores: { 1: 0, 2: 0 }, over: false,
};

function gameReducer(state, action) {
  if (action.type === 'RESET') {
    return { hLines: mkH(), vLines: mkV(), squares: mkSq(),
             turn: action.startTurn ?? 1, scores: { 1: 0, 2: 0 }, over: false };
  }
  if (action.type === 'RESET_ALL') return { ...INIT_STATE };
  if (action.type !== 'MOVE' || state.over) return state;

  const { lineType, r, c } = action;
  const nh = state.hLines.map(row => [...row]);
  const nv = state.vLines.map(row => [...row]);

  if (lineType === 'h') { if (nh[r][c] !== null) return state; nh[r][c] = state.turn; }
  else                  { if (nv[r][c] !== null) return state; nv[r][c] = state.turn; }

  const ns = state.squares.map(row => [...row]);
  let owned = 0;
  for (let row = 0; row < CELLS; row++) {
    for (let col = 0; col < CELLS; col++) {
      if (ns[row][col] === null &&
          nh[row][col] !== null && nh[row+1][col] !== null &&
          nv[row][col] !== null && nv[row][col+1] !== null) {
        const sides = [nh[row][col], nh[row+1][col], nv[row][col], nv[row][col+1]];
        ns[row][col] = sides.every(s => s === sides[0]) ? sides[0] : 'mixed';
        if (ns[row][col] === state.turn) owned++;
      }
    }
  }

  const isOver = ns.flat().filter(v => v !== null).length === CELLS * CELLS;
  const newScores = { ...state.scores, [state.turn]: state.scores[state.turn] + owned };

  return {
    hLines: nh, vLines: nv, squares: ns,
    scores: newScores, turn: state.turn === 1 ? 2 : 1, over: isOver,
  };
}

// ─── Theme Hook ───────────────────────────────────────────────────────────────
function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () => setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

// ─── Game Component ───────────────────────────────────────────────────────────
function DotsAndBoxesGame() {
  const dark = useTheme();
  const [game, dispatch] = useReducer(gameReducer, INIT_STATE);
  const [mode, setMode] = useState('computer');
  const [hover, setHover] = useState(null);
  const [thinking, setThinking] = useState(false);
  const nextStarterRef = useRef(2); // game 2 starts with player 2

  // Online state
  const [conn, setConn] = useState('idle');
  const [myPlayer, setMyPlayer] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const wsRef = useRef(null);

  // ── Detect game ID in URL on mount ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const gId = new URLSearchParams(window.location.search).get('game');
    if (gId && !gId.startsWith('T')) {
      setGameId(gId);
      setMode('online');
      setShareUrl(`${window.location.origin}${window.location.pathname}?game=${gId}`);
    }
  }, []);

  // ── WebSocket connection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'online' || !gameId) return;
    setConn('connecting');
    const playerId = uid(12);
    const ws = new WebSocket(`${WS_SERVER}?game=${gameId}&player=${playerId}`);
    wsRef.current = ws;

    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      switch (msg.type) {
        case 'waiting':    setMyPlayer(1); setConn('waiting'); break;
        case 'start':      setMyPlayer(msg.playerNumber); setConn('playing'); break;
        case 'full':       setConn('full'); break;
        case 'disconnect': setConn('disconnected'); break;
        case 'move':
          dispatch({ type: 'MOVE', lineType: msg.lineType, r: msg.row, c: msg.col });
          break;
        case 'reset': {
          const starter = nextStarterRef.current;
          nextStarterRef.current = 3 - starter;
          dispatch({ type: 'RESET', startTurn: starter });
          break;
        }
        default: break;
      }
    };

    ws.onclose = () => setConn(p => (p === 'playing' || p === 'waiting') ? 'disconnected' : p);
    ws.onerror = () => setConn('error');
    return () => { ws.close(); wsRef.current = null; };
  }, [mode, gameId]);

  // ── AI move ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'computer' || game.over || game.turn !== 2) return;
    setThinking(true);
    const id = setTimeout(() => {
      const mv = getAIMove(game.hLines, game.vLines, game.squares);
      if (mv) dispatch({ type: 'MOVE', lineType: mv.lineType, r: mv.r, c: mv.c });
      setThinking(false);
    }, 400);
    return () => clearTimeout(id);
  }, [mode, game.turn, game.over]);

  // ── Auto-restart ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!game.over) return;
    const id = setTimeout(() => {
      if (mode === 'online') {
        if (myPlayer === 1) wsRef.current?.send(JSON.stringify({ type: 'reset' }));
      } else {
        const starter = nextStarterRef.current;
        nextStarterRef.current = 3 - starter;
        dispatch({ type: 'RESET', startTurn: starter });
        setThinking(false);
      }
    }, 2000);
    return () => clearTimeout(id);
  }, [game.over, mode, myPlayer]);

  // ── Mode switcher ────────────────────────────────────────────────────────────
  function changeMode(m) {
    wsRef.current?.close();
    setConn('idle'); setMyPlayer(null); setHover(null); setThinking(false);
    nextStarterRef.current = 2;
    dispatch({ type: 'RESET_ALL' });
    if (m === 'online') {
      const gId = uid(8);
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

  // ── Line click ───────────────────────────────────────────────────────────────
  function clickLine(lineType, r, c) {
    if (game.over) return;
    const arr = lineType === 'h' ? game.hLines : game.vLines;
    if (arr[r][c] !== null) return;

    if (mode === 'online') {
      if (conn !== 'playing' || game.turn !== myPlayer) return;
      wsRef.current?.send(JSON.stringify({ type: 'move', lineType, row: r, col: c }));
      return;
    }
    if (mode === 'computer' && game.turn !== 1) return; // AI's turn
    dispatch({ type: 'MOVE', lineType, r, c });
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  }

  // ── Colours ──────────────────────────────────────────────────────────────────
  const bg        = dark ? '#0f0f1a' : '#f0f4ff';
  const surface   = dark ? '#1a1a30' : '#ffffff';
  const text      = dark ? '#e0e0f0' : '#1a1a2e';
  const sub       = dark ? 'rgba(224,224,240,.5)' : 'rgba(26,26,46,.5)';
  const accent    = '#6c63ff';
  const borderC   = dark ? '#3a3a6a' : '#c5caff';
  const shadow    = dark ? '0 8px 32px rgba(0,0,0,.6)' : '0 8px 32px rgba(108,99,255,.12)';
  const emptyLine = dark ? '#2a2a50' : '#dde1ff';
  const dotFill   = dark ? '#e0e0f0' : '#1a1a2e';
  const panelBg   = dark ? '#12122a' : '#f8f9ff';

  const isHov  = (type, r, c) => hover?.type === type && hover.r === r && hover.c === c;
  const myTurn = mode === 'online'
    ? conn === 'playing' && !game.over && game.turn === myPlayer
    : !game.over && !(mode === 'computer' && game.turn === 2);

  // Labels
  const p1Label = mode === 'computer' ? 'You'      : mode === 'online' ? (myPlayer === 1 ? 'You' : 'Opponent') : 'Player 1';
  const p2Label = mode === 'computer' ? 'Computer' : mode === 'online' ? (myPlayer === 2 ? 'You' : 'Opponent') : 'Player 2';

  // Winner of current game
  const winnerText = game.over
    ? game.scores[1] > game.scores[2]
      ? mode === 'computer' ? 'You win! 🎉' : mode === 'online' ? (myPlayer === 1 ? 'You win! 🎉' : 'Opponent wins!') : 'Player 1 wins!'
      : game.scores[2] > game.scores[1]
        ? mode === 'computer' ? 'Computer wins!' : mode === 'online' ? (myPlayer === 2 ? 'You win! 🎉' : 'Opponent wins!') : 'Player 2 wins!'
        : "It's a draw!"
    : null;

  // Status
  let statusText = '';
  if (game.over) {
    statusText = (winnerText ?? '') + '  · Starting next game…';
  } else if (mode === 'online' && conn === 'waiting') {
    statusText = 'Waiting for opponent…';
  } else if (mode === 'online' && conn === 'playing') {
    statusText = myTurn ? '🟢 Your turn' : '⏳ Opponent\'s turn';
  } else if (mode === 'computer') {
    statusText = game.turn === 2 ? (thinking ? 'Computer is thinking…' : 'Computer\'s turn') : 'Your turn';
  } else {
    statusText = `Player ${game.turn}'s turn`;
  }

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

  const showOverlay = mode === 'online' && ['connecting', 'full', 'disconnected', 'error'].includes(conn);

  return (
    <>
      {/* ── Online overlays ── */}
      {showOverlay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: surface, borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 420, width: '90%', boxShadow: shadow, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {conn === 'connecting' && <><div style={{ fontSize: '2.5rem' }}>⏳</div><h2 style={{ margin: 0, color: accent }}>Connecting…</h2><p style={{ color: sub, margin: 0 }}>Setting up your game room</p></>}
            {conn === 'full' && <><div style={{ fontSize: '2.5rem' }}>🚫</div><h2 style={{ margin: 0, color: P2 }}>Game is Full</h2><p style={{ color: sub, margin: 0 }}>This game already has two players.</p></>}
            {conn === 'disconnected' && <><div style={{ fontSize: '2.5rem' }}>🔌</div><h2 style={{ margin: 0 }}>Opponent Disconnected</h2><button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.4rem', background: accent, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>New Game</button></>}
            {conn === 'error' && <><div style={{ fontSize: '2.5rem' }}>⚠️</div><h2 style={{ margin: 0 }}>Connection Error</h2><button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.4rem', background: accent, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Try Again</button></>}
          </div>
        </div>
      )}

      <main style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: "'Segoe UI', system-ui, sans-serif", transition: 'background 0.3s, color 0.3s' }}>

        {/* Title */}
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: accent, margin: '0 0 0.3rem', letterSpacing: 1 }}>Dots and Boxes</h1>
        <p style={{ color: sub, margin: '0 0 1.4rem', fontSize: '0.9rem', textAlign: 'center' }}>Take turns drawing lines · Complete squares to score points</p>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.4rem' }}>
          <button style={tabStyle('computer')} onClick={() => changeMode('computer')}>vs Computer</button>
          <button style={tabStyle('friend')} onClick={() => changeMode('friend')}>vs Friend</button>
          <button style={tabStyle('online')} onClick={() => changeMode('online')}>Online</button>
        </div>

        {/* Share link panel */}
        {mode === 'online' && conn === 'waiting' && (
          <div style={{ background: panelBg, border: `2px solid ${borderC}`, borderRadius: 16, padding: '1.1rem 1.4rem', marginBottom: '1.4rem', width: '100%', maxWidth: 440, display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: '1rem', color: text }}>🎮 Share this link with your friend to start playing!</p>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
              <input readOnly value={shareUrl}
                style={{ flex: 1, minWidth: 0, padding: '0.5rem 0.75rem', borderRadius: 8, border: `1.5px solid ${borderC}`, background: dark ? '#1e1e38' : '#eef0ff', color: text, fontSize: '0.82rem', fontFamily: 'monospace', outline: 'none' }}
                onFocus={e => e.target.select()}
              />
              <button onClick={copyLink} style={{ padding: '0.5rem 1rem', background: copied ? '#22c55e' : accent, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'background 0.2s' }}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <p style={{ margin: 0, color: sub, fontSize: '0.82rem' }}>⏳ Waiting for your friend to join…</p>
          </div>
        )}

        {/* Scoreboard */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.4rem', width: '100%', maxWidth: 360 }}>
          {[1, 2].map(p => {
            const isActive = !game.over && game.turn === p && (mode !== 'online' || conn === 'playing');
            const col = pColor(p);
            const label = p === 1 ? p1Label : p2Label;
            return (
              <div key={p} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', padding: '0.75rem 0.5rem', borderRadius: 12, background: dark ? '#252545' : '#f0f2ff', border: `2px solid ${isActive ? col : borderC}`, boxShadow: isActive ? `0 0 14px ${col}33` : 'none', transition: 'all 0.2s ease' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2, color: col, textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: col, lineHeight: 1 }}>{game.scores[p]}</span>
              </div>
            );
          })}
        </div>

        {/* Board */}
        <div style={{ background: surface, borderRadius: 20, padding: 14, boxShadow: shadow, marginBottom: '1.2rem', opacity: mode === 'online' && conn === 'waiting' ? 0.4 : 1, transition: 'opacity 0.3s' }}>
          <svg width={SVG_SZ} height={SVG_SZ} style={{ display: 'block' }}>

            {/* Filled squares */}
            {game.squares.map((row, r) =>
              row.map((sq, c) => sq !== null && (
                <rect key={`sq${r}${c}`}
                  x={PAD + c * CELL + 1} y={PAD + r * CELL + 1}
                  width={CELL - 2} height={CELL - 2}
                  fill={sq === 'mixed' ? (dark ? 'rgba(120,120,140,0.45)' : 'rgba(30,30,50,0.25)') : pColor(sq) + '55'}
                />
              ))
            )}

            {/* Horizontal lines */}
            {Array.from({ length: DOTS }, (_, r) =>
              Array.from({ length: CELLS }, (_, c) => {
                const drawn = game.hLines[r][c];
                const hov   = isHov('h', r, c);
                const x1 = PAD + c * CELL, x2 = PAD + (c + 1) * CELL, y = PAD + r * CELL;
                return (
                  <g key={`h${r}${c}`}>
                    <line x1={x1} y1={y} x2={x2} y2={y}
                      stroke={drawn ? pColor(drawn) : hov ? pColor(game.turn) + 'bb' : emptyLine}
                      strokeWidth={drawn ? 6 : hov ? 5 : 3} strokeLinecap="round"
                    />
                    {!drawn && myTurn && (
                      <line x1={x1} y1={y} x2={x2} y2={y}
                        stroke="rgba(0,0,0,0.001)" strokeWidth={20}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHover({ type: 'h', r, c })}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => clickLine('h', r, c)}
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Vertical lines */}
            {Array.from({ length: CELLS }, (_, r) =>
              Array.from({ length: DOTS }, (_, c) => {
                const drawn = game.vLines[r][c];
                const hov   = isHov('v', r, c);
                const x = PAD + c * CELL, y1 = PAD + r * CELL, y2 = PAD + (r + 1) * CELL;
                return (
                  <g key={`v${r}${c}`}>
                    <line x1={x} y1={y1} x2={x} y2={y2}
                      stroke={drawn ? pColor(drawn) : hov ? pColor(game.turn) + 'bb' : emptyLine}
                      strokeWidth={drawn ? 6 : hov ? 5 : 3} strokeLinecap="round"
                    />
                    {!drawn && myTurn && (
                      <line x1={x} y1={y1} x2={x} y2={y2}
                        stroke="rgba(0,0,0,0.001)" strokeWidth={20}
                        style={{ cursor: 'pointer' }}
                        onMouseEnter={() => setHover({ type: 'v', r, c })}
                        onMouseLeave={() => setHover(null)}
                        onClick={() => clickLine('v', r, c)}
                      />
                    )}
                  </g>
                );
              })
            )}

            {/* Dots */}
            {Array.from({ length: DOTS }, (_, r) =>
              Array.from({ length: DOTS }, (_, c) => (
                <circle key={`d${r}${c}`} cx={PAD + c * CELL} cy={PAD + r * CELL} r={DOT_R} fill={dotFill} />
              ))
            )}
          </svg>
        </div>

        {/* Status */}
        <p style={{ margin: 0, fontSize: game.over ? '1.15rem' : '0.95rem', fontWeight: game.over ? 700 : 500, color: game.over ? text : sub, textAlign: 'center', minHeight: '1.6em' }}>
          {statusText}
        </p>

      </main>
    </>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function DotsAndBoxesPage() {
  return (
    <Layout title="Dots and Boxes" description="Dots and Boxes – vs Computer, vs Friend, or Online">
      <DotsAndBoxesGame />
    </Layout>
  );
}

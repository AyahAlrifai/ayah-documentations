import React, { useState, useEffect, useReducer, useRef } from 'react';
import Layout from '@theme/Layout';

// ─── WebSocket ────────────────────────────────────────────────────────────────
const WS_SERVER = 'ws://localhost:3001';

// ─── Colors (same palette as Tic-Tac-Toe) ────────────────────────────────────
const P1 = '#6c63ff';   // blue
const P2 = '#f472b6';   // pink
const ACC = '#6c63ff';
const pColor = p => p === 1 ? P1 : P2;

// ─── Board SVG Geometry ───────────────────────────────────────────────────────
const NODE_R = 24;                      // node circle radius
const CELL = 90;                      // distance between node centers
const PAD = 54;                      // padding from SVG edge to first node
const SZ = 2 * CELL + 2 * PAD;     // SVG size = 288px

// Node (x, y) center by index 0-8
const nx = i => PAD + (i % 3) * CELL;
const ny = i => PAD + Math.floor(i / 3) * CELL;

// All 12 edges to draw between adjacent nodes
const EDGES = [
  [0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8],   // horizontal
  [0, 3], [3, 6], [1, 4], [4, 7], [2, 5], [5, 8],   // vertical
];

// ─── Game Logic ───────────────────────────────────────────────────────────────
// Win lines: horizontal + vertical only — NO diagonals (per spec §8.1)
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
];

// Adjacency (no diagonals, per spec §7.2)
const ADJ = [
  [1, 3], [0, 2, 4], [1, 5],
  [0, 4, 6], [1, 3, 5, 7], [2, 4, 8],
  [3, 7], [4, 6, 8], [5, 7],
];

function checkWinner(board) {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { player: board[a], line: [a, b, c] };
  }
  return null;
}

function boardPhase(board) {
  return board.filter(Boolean).length < 6 ? 'place' : 'move';
}

// ─── Minimax AI (full search with alpha-beta, both phases) ────────────────────
function heuristic(board) {
  let s = 0;
  for (const [a, b, c] of WIN_LINES) {
    const row = [board[a], board[b], board[c]];
    const p1 = row.filter(x => x === 1).length;
    const p2 = row.filter(x => x === 2).length;
    if (!p1) s += p2 === 2 ? 30 : p2 === 1 ? 5 : 0;
    if (!p2) s -= p1 === 2 ? 30 : p1 === 1 ? 5 : 0;
  }
  return s;
}

function minimax(b, turn, depth, alpha, beta) {
  const win = checkWinner(b);
  if (win) return win.player === 2 ? 100 - depth : -(100 - depth);
  if (depth >= 12) return heuristic(b);

  const isMax = turn === 2;
  const next = 3 - turn;
  let best = isMax ? -Infinity : Infinity;

  if (boardPhase(b) === 'place') {
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = turn;
      const v = minimax(b, next, depth + 1, alpha, beta);
      b[i] = null;
      if (isMax) { best = Math.max(best, v); alpha = Math.max(alpha, best); }
      else { best = Math.min(best, v); beta = Math.min(beta, best); }
      if (beta <= alpha) break;
    }
  } else {
    let any = false;
    outer:
    for (let f = 0; f < 9; f++) {
      if (b[f] !== turn) continue;
      for (const t of ADJ[f]) {
        if (b[t]) continue;
        any = true;
        b[t] = turn; b[f] = null;
        const v = minimax(b, next, depth + 1, alpha, beta);
        b[f] = turn; b[t] = null;
        if (isMax) { best = Math.max(best, v); alpha = Math.max(alpha, best); }
        else { best = Math.min(best, v); beta = Math.min(beta, best); }
        if (beta <= alpha) break outer;
      }
    }
    if (!any) best = isMax ? -50 : 50;
  }
  return (best === Infinity || best === -Infinity) ? 0 : best;
}

function getBestMove(board) {
  const b = [...board];
  let bv = -Infinity, bm = null;

  if (boardPhase(b) === 'place') {
    for (let i = 0; i < 9; i++) {
      if (b[i]) continue;
      b[i] = 2;
      const v = minimax(b, 1, 1, -Infinity, Infinity);
      b[i] = null;
      if (v > bv) { bv = v; bm = { kind: 'place', pos: i }; }
    }
  } else {
    for (let f = 0; f < 9; f++) {
      if (b[f] !== 2) continue;
      for (const t of ADJ[f]) {
        if (b[t]) continue;
        b[t] = 2; b[f] = null;
        const v = minimax(b, 1, 1, -Infinity, Infinity);
        b[f] = 2; b[t] = null;
        if (v > bv) { bv = v; bm = { kind: 'move', from: f, to: t }; }
      }
    }
  }
  // Fallback to first legal move
  if (!bm) {
    if (boardPhase(b) === 'place') {
      for (let i = 0; i < 9; i++) if (!b[i]) { bm = { kind: 'place', pos: i }; break; }
    } else {
      outer2:
      for (let f = 0; f < 9; f++) {
        if (b[f] !== 2) continue;
        for (const t of ADJ[f]) { if (!b[t]) { bm = { kind: 'move', from: f, to: t }; break outer2; } }
      }
    }
  }
  return bm;
}

// ─── Game Reducer ─────────────────────────────────────────────────────────────
const INIT = {
  board: Array(9).fill(null),
  turn: 1, phase: 'place', sel: null,
  winner: null, winLine: null,
  scores: { 1: 0, 2: 0 },
};

function reducer(state, action) {
  if (action.type === 'RESET') return { ...INIT, board: Array(9).fill(null), scores: state.scores, turn: action.startPlayer ?? 1 };
  if (action.type === 'RESET_ALL') return { ...INIT, board: Array(9).fill(null) };
  if (action.type === 'DESELECT') return { ...state, sel: null };
  if (action.type === 'SELECT') {
    if (state.phase !== 'move' || state.winner || state.board[action.i] !== state.turn) return state;
    return { ...state, sel: action.i };
  }
  if (state.winner) return state;

  let board, phase, sel = null;

  if (action.type === 'PLACE') {
    if (state.phase !== 'place' || state.board[action.i] !== null) return state;
    board = [...state.board];
    board[action.i] = state.turn;
    phase = boardPhase(board);
  } else if (action.type === 'MOVE_TO') {
    // Local move via selection state
    if (state.phase !== 'move' || state.sel === null) return state;
    if (!ADJ[state.sel].includes(action.i) || state.board[action.i] !== null) return state;
    board = [...state.board];
    board[action.i] = state.turn;
    board[state.sel] = null;
    phase = 'move';
  } else if (action.type === 'MOVE_DIRECT') {
    // Used by AI and online echo (from + to explicit, no selection required)
    if (state.phase !== 'move') return state;
    if (state.board[action.from] !== state.turn || state.board[action.to] !== null) return state;
    board = [...state.board];
    board[action.to] = state.turn;
    board[action.from] = null;
    phase = 'move';
  } else {
    return state;
  }

  const w = checkWinner(board);
  const scores = w ? { ...state.scores, [w.player]: state.scores[w.player] + 1 } : state.scores;
  return {
    ...state, board,
    turn: 3 - state.turn,
    phase, sel,
    winner: w?.player ?? null,
    winLine: w?.line ?? null,
    scores,
  };
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

function uid(n = 8) { return 'T' + Math.random().toString(36).slice(2, 2 + n).toUpperCase(); }

// ─── Game Component ───────────────────────────────────────────────────────────
function ThreeStonesGame() {
  const dark = useTheme();
  const [game, dispatch] = useReducer(reducer, INIT);
  const [mode, setMode] = useState('computer');
  const [thinking, setThinking] = useState(false);
  const nextStarterRef = useRef(2); // game 2 starts with player 2

  // Online state
  const [conn, setConn] = useState('idle');
  const [me, setMe] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const wsRef = useRef(null);

  // ── Detect game ID in URL on mount ──────────────────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const gId = new URLSearchParams(window.location.search).get('game');
    if (gId && gId.startsWith('T')) {
      setGameId(gId);
      setMode('online');
      setShareUrl(`${window.location.origin}${window.location.pathname}?game=${gId}`);
    }
  }, []);

  // ── WebSocket connection ─────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'online' || !gameId) return;
    setConn('connecting');

    const pid = uid(12);
    const ws = new WebSocket(`${WS_SERVER}?game=${gameId}&player=${pid}`);
    wsRef.current = ws;

    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'waiting') { setMe(1); setConn('waiting'); }
      else if (msg.type === 'start') { setMe(msg.playerNumber); setConn('playing'); }
      else if (msg.type === 'full') { setConn('full'); }
      else if (msg.type === 'disconnect') { setConn('disconnected'); }
      else if (msg.type === 'reset') {
        const starter = nextStarterRef.current;
        nextStarterRef.current = 3 - starter;
        dispatch({ type: 'RESET', startPlayer: starter });
      }
      else if (msg.type === 'move') {
        if (msg.action === 'place') dispatch({ type: 'PLACE', i: msg.pos });
        else dispatch({ type: 'MOVE_DIRECT', from: msg.from, to: msg.to });
      }
    };

    ws.onclose = () => setConn(p => (p === 'playing' || p === 'waiting') ? 'disconnected' : p);
    ws.onerror = () => setConn('error');
    return () => { ws.close(); wsRef.current = null; };
  }, [mode, gameId]);

  // ── Computer AI ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (mode !== 'computer' || game.turn !== 2 || game.winner) return;
    setThinking(true);
    const id = setTimeout(() => {
      const mv = getBestMove(game.board);
      if (mv) {
        if (mv.kind === 'place') dispatch({ type: 'PLACE', i: mv.pos });
        else dispatch({ type: 'MOVE_DIRECT', from: mv.from, to: mv.to });
      }
      setThinking(false);
    }, 500);
    return () => clearTimeout(id);
  }, [mode, game.turn, game.winner, game.board]);

  // ── Auto-restart after win ────────────────────────────────────────────────
  useEffect(() => {
    if (!game.winner) return;
    const id = setTimeout(() => {
      if (mode === 'online') {
        if (me === 1) wsRef.current?.send(JSON.stringify({ type: 'reset' }));
      } else {
        const starter = nextStarterRef.current;
        nextStarterRef.current = 3 - starter;
        dispatch({ type: 'RESET', startPlayer: starter });
        setThinking(false);
      }
    }, 2000);
    return () => clearTimeout(id);
  }, [game.winner, mode, me]);

  // ── Mode switcher ────────────────────────────────────────────────────────────
  function changeMode(m) {
    wsRef.current?.close();
    setConn('idle'); setMe(null); setThinking(false);
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

  // ── Click a node ─────────────────────────────────────────────────────────────
  function handleNodeClick(i) {
    if (game.winner) return;

    if (mode === 'online') {
      if (conn !== 'playing' || game.turn !== me) return;
      if (game.phase === 'place') {
        if (game.board[i] !== null) return;
        wsRef.current?.send(JSON.stringify({ type: 'move', action: 'place', pos: i }));
      } else {
        if (game.sel === null) {
          if (game.board[i] === me) dispatch({ type: 'SELECT', i });
        } else if (i === game.sel) {
          dispatch({ type: 'DESELECT' });
        } else if (game.board[i] === me) {
          dispatch({ type: 'SELECT', i });
        } else if (!game.board[i] && ADJ[game.sel].includes(i)) {
          wsRef.current?.send(JSON.stringify({ type: 'move', action: 'move', from: game.sel, to: i }));
          dispatch({ type: 'DESELECT' });
        }
      }
      return;
    }

    // Local (computer / friend)
    if (mode === 'computer' && (game.turn === 2 || thinking)) return;
    if (game.phase === 'place') {
      dispatch({ type: 'PLACE', i });
    } else {
      if (game.sel === null) dispatch({ type: 'SELECT', i });
      else if (i === game.sel) dispatch({ type: 'DESELECT' });
      else if (game.board[i] === game.turn) dispatch({ type: 'SELECT', i });
      else dispatch({ type: 'MOVE_TO', i });
    }
  }

  function handleReset() {
    if (mode === 'online') wsRef.current?.send(JSON.stringify({ type: 'reset' }));
    else { dispatch({ type: 'RESET' }); setThinking(false); }
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  }

  // ── Colours ──────────────────────────────────────────────────────────────────
  const bg = dark ? '#0f0f1a' : '#f0f4ff';
  const surface = dark ? '#1a1a30' : '#ffffff';
  const text = dark ? '#e0e0f0' : '#1a1a2e';
  const sub = dark ? 'rgba(224,224,240,.5)' : 'rgba(26,26,46,.5)';
  const borderC = dark ? '#3a3a6a' : '#c5caff';
  const shadow = dark ? '0 8px 32px rgba(0,0,0,.6)' : '0 8px 32px rgba(108,99,255,.12)';
  const panelBg = dark ? '#12122a' : '#f8f9ff';
  const edgeColor = dark ? '#3a3a6a' : '#c5caff';
  const nodeBg = dark ? '#252545' : '#e8ecff';
  const nodeStroke = dark ? '#4a4a7a' : '#a5aadd';
  const dotFill = dark ? '#5a5a8a' : '#8888bb';

  // ── Derived helpers ──────────────────────────────────────────────────────────
  const validMoves = game.phase === 'move' && game.sel !== null
    ? ADJ[game.sel].filter(j => game.board[j] === null)
    : [];

  const myTurnOnline = mode === 'online' && conn === 'playing' && !game.winner && game.turn === me;

  const canClick = !game.winner && (
    mode === 'friend' ||
    (mode === 'computer' && game.turn === 1 && !thinking) ||
    myTurnOnline
  );

  function tabStyle(m) {
    const active = mode === m;
    return {
      padding: '0.45rem 1.1rem', borderRadius: 10,
      border: `2px solid ${active ? ACC : borderC}`,
      fontSize: '0.875rem', fontWeight: active ? 700 : 500, cursor: 'pointer',
      background: active ? ACC : (dark ? '#1e1e38' : '#e8ecff'),
      color: active ? '#fff' : sub,
      transition: 'all 0.18s ease', whiteSpace: 'nowrap',
    };
  }

  // Status text
  let statusText = '';
  if (game.winner) {
    if (mode === 'computer') statusText = game.winner === 1 ? 'You win! 🎉' : 'Computer wins!';
    else if (mode === 'friend') statusText = `Player ${game.winner} wins! 🎉`;
    else statusText = game.winner === me ? 'You win! 🎉' : 'Opponent wins!';
    statusText += '  · Starting next game…';
  } else if (mode === 'online' && conn === 'waiting') {
    statusText = 'Waiting for opponent to join…';
  } else if (mode === 'online' && conn === 'playing') {
    statusText = myTurnOnline ? '🟢 Your turn' : "⏳ Opponent's turn";
  } else if (mode === 'computer') {
    statusText = game.turn === 2 ? (thinking ? 'Computer is thinking…' : "Computer's turn") : 'Your turn';
  } else {
    statusText = `Player ${game.turn}'s turn`;
  }

  const showOverlay = mode === 'online' && ['connecting', 'full', 'disconnected', 'error'].includes(conn);

  return (
    <>
      <style>{`
        @keyframes popIn  { from { transform: scale(0.3); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        @keyframes pulse  { 0%,100% { opacity: 0.45; } 50% { opacity: 0.9; } }
        .valid-ring { animation: pulse 1.1s ease-in-out infinite; }
      `}</style>

      {/* ── Connection overlays ── */}
      {showOverlay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: surface, borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 420, width: '90%', boxShadow: shadow, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {conn === 'connecting' && <><div style={{ fontSize: '2.5rem' }}>⏳</div><h2 style={{ margin: 0, color: ACC }}>Connecting…</h2><p style={{ color: sub, margin: 0 }}>Setting up your game room</p></>}
            {conn === 'full' && <><div style={{ fontSize: '2.5rem' }}>🚫</div><h2 style={{ margin: 0, color: P2 }}>Game is Full</h2><p style={{ color: sub, margin: 0 }}>This game already has two players.</p></>}
            {conn === 'disconnected' && <><div style={{ fontSize: '2.5rem' }}>🔌</div><h2 style={{ margin: 0 }}>Opponent Disconnected</h2><button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.4rem', background: ACC, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>New Game</button></>}
            {conn === 'error' && <><div style={{ fontSize: '2.5rem' }}>⚠️</div><h2 style={{ margin: 0 }}>Connection Error</h2><button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.4rem', background: ACC, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Try Again</button></>}
          </div>
        </div>
      )}

      <main style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: "'Segoe UI',system-ui,sans-serif", transition: 'background 0.3s,color 0.3s' }}>

        {/* Title */}
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: ACC, margin: '0 0 0.3rem', letterSpacing: 1 }}>Trains</h1>
        <p style={{ color: sub, margin: '0 0 1.4rem', fontSize: '0.9rem', textAlign: 'center' }}>
          Line up 3 stones horizontally or vertically · No diagonals
        </p>

        {/* Mode tabs */}
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
              <button onClick={copyLink} style={{ padding: '0.5rem 1rem', background: copied ? '#22c55e' : ACC, color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: '0.85rem', whiteSpace: 'nowrap', transition: 'background 0.2s' }}>
                {copied ? '✓ Copied!' : 'Copy Link'}
              </button>
            </div>
            <p style={{ margin: 0, color: sub, fontSize: '0.82rem' }}>⏳ Waiting for your friend to join…</p>
          </div>
        )}

        {/* Scoreboard */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.4rem', width: '100%', maxWidth: 300 }}>
          {[1, 2].map(p => {
            const active = !game.winner && game.turn === p && (mode !== 'online' || conn === 'playing');
            const col = pColor(p);
            const label = mode === 'computer' ? (p === 1 ? 'You' : 'Computer')
              : mode === 'online' ? (p === me ? 'You' : 'Opponent')
                : `Player ${p}`;
            return (
              <div key={p} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', padding: '0.75rem 0.5rem', borderRadius: 12, background: dark ? '#252545' : '#f0f2ff', border: `2px solid ${active ? col : borderC}`, boxShadow: active ? `0 0 14px ${col}33` : 'none', transition: 'all 0.2s ease' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2, color: col, textTransform: 'uppercase' }}>{label}</span>
                <span style={{ fontSize: '2rem', fontWeight: 800, color: col, lineHeight: 1 }}>{game.scores[p]}</span>
              </div>
            );
          })}
        </div>

        {/* ── SVG Board: nodes + connecting lines ── */}
        <div style={{ background: surface, borderRadius: 24, padding: 16, boxShadow: shadow, marginBottom: '1.2rem', opacity: mode === 'online' && conn === 'waiting' ? 0.4 : 1, transition: 'opacity 0.3s' }}>
          <svg width={SZ} height={SZ} style={{ display: 'block', userSelect: 'none' }}>

            {/* ── Edges (lines between adjacent nodes) ── */}
            {EDGES.map(([a, b]) => {
              const onWin = game.winLine?.includes(a) && game.winLine?.includes(b);
              const onValid = game.sel !== null && (
                (game.sel === a && validMoves.includes(b)) ||
                (game.sel === b && validMoves.includes(a))
              );
              return (
                <line key={`e${a}${b}`}
                  x1={nx(a)} y1={ny(a)} x2={nx(b)} y2={ny(b)}
                  stroke={onWin ? pColor(game.winner) : onValid ? pColor(game.turn) + '99' : edgeColor}
                  strokeWidth={onWin ? 7 : onValid ? 4 : 3}
                  strokeLinecap="round"
                  style={{ transition: 'stroke 0.2s, stroke-width 0.2s' }}
                />
              );
            })}

            {/* ── Nodes ── */}
            {Array.from({ length: 9 }, (_, i) => {
              const stone = game.board[i];
              const isSel = game.sel === i;
              const isWin = game.winLine?.includes(i);
              const isValid = validMoves.includes(i);
              const col = stone ? pColor(stone) : null;

              return (
                <g key={`n${i}`}
                  onClick={() => handleNodeClick(i)}
                  style={{ cursor: canClick ? 'pointer' : 'default' }}
                >
                  {/* Pulsing ring — valid move target */}
                  {isValid && (
                    <circle
                      className="valid-ring"
                      cx={nx(i)} cy={ny(i)} r={NODE_R + 9}
                      fill="none"
                      stroke={pColor(game.turn)}
                      strokeWidth={2.5}
                      strokeDasharray="5 4"
                    />
                  )}

                  {/* Glow halo — selected or winning node */}
                  {(isSel || isWin) && (
                    <circle
                      cx={nx(i)} cy={ny(i)} r={NODE_R + 5}
                      fill={isSel ? pColor(game.turn) + '28' : pColor(game.winner ?? 1) + '28'}
                    />
                  )}

                  {/* Main node circle */}
                  <circle
                    cx={nx(i)} cy={ny(i)} r={NODE_R}
                    fill={stone ? col : nodeBg}
                    stroke={
                      isSel ? pColor(game.turn) :
                        isWin ? pColor(game.winner ?? 1) :
                          nodeStroke
                    }
                    strokeWidth={isSel || isWin ? 3.5 : 2}
                    style={{
                      filter: isSel
                        ? `drop-shadow(0 0 10px ${pColor(game.turn)}aa)`
                        : isWin
                          ? `drop-shadow(0 0 10px ${pColor(game.winner ?? 1)}aa)`
                          : 'none',
                      transition: 'fill 0.2s',
                      animation: stone ? 'popIn 0.2s ease' : 'none',
                    }}
                  />

                  {/* Center dot for empty nodes */}
                  {!stone && <circle cx={nx(i)} cy={ny(i)} r={4} fill={dotFill} />}

                  {/* Shine highlight on placed stones */}
                  {stone && (
                    <circle cx={nx(i) - 7} cy={ny(i) - 7} r={5} fill="rgba(255,255,255,0.28)" />
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Phase badge */}
        {!game.winner && (mode !== 'online' || conn === 'playing') && (
          <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: sub, marginBottom: '0.6rem' }}>
            {game.phase === 'place' ? '📍 Placement Phase' : '🔀 Movement Phase'}
          </div>
        )}

        {/* Status */}
        <p style={{ margin: '0 0 1.2rem', fontSize: game.winner ? '1.15rem' : '0.95rem', fontWeight: game.winner ? 700 : 500, color: game.winner ? text : sub, textAlign: 'center', minHeight: '1.6em' }}>
          {statusText}
        </p>


      </main>
    </>
  );
}

export default function TrainsPage() {
  return (
    <Layout title="Three Stones" description="Three Stones – place and move stones to form a line">
      <ThreeStonesGame />
    </Layout>
  );
}

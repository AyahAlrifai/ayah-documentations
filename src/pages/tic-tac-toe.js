import React, { useState, useEffect, useReducer, useRef } from 'react';
import Layout from '@theme/Layout';

// ─── WebSocket ────────────────────────────────────────────────────────────────
const WS_SERVER = 'ws://localhost:3001';
function uid(n = 8) { return Math.random().toString(36).slice(2, 2 + n).toUpperCase(); }

// ─── Game Logic ───────────────────────────────────────────────────────────────
const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8],
  [0,3,6],[1,4,7],[2,5,8],
  [0,4,8],[2,4,6],
];

function getWinner(board) {
  for (const [a,b,c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c])
      return { symbol: board[a], line: [a,b,c] };
  }
  return null;
}

function isBoardFull(board) { return board.every(c => c !== null); }

function countOpenLines(board, mine, opp) {
  let count = 0;
  for (const [a,b,c] of WIN_LINES) {
    const row = [board[a], board[b], board[c]];
    if (row.includes(mine) && !row.includes(opp)) count++;
  }
  return count;
}

function score(board) {
  const w = getWinner(board);
  if (w?.symbol === 'X') return 100;
  if (w?.symbol === 'O') return -100;
  return countOpenLines(board,'X','O') - countOpenLines(board,'O','X');
}

function minimax(board, isMax, depth) {
  if (getWinner(board) || isBoardFull(board) || depth >= 4) return score(board);
  let best = isMax ? -Infinity : Infinity;
  const sym = isMax ? 'X' : 'O';
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = sym;
      const val = minimax(board, !isMax, depth + 1);
      board[i] = null;
      best = isMax ? Math.max(best, val) : Math.min(best, val);
    }
  }
  return best;
}

function computerBestMove(board) {
  if (board.every(c => c === null)) return 4;
  let best = -Infinity, mv = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = 'X';
      const val = minimax(board, false, 0);
      board[i] = null;
      if (val > best) { best = val; mv = i; }
    }
  }
  return mv;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────
const INIT = { board: Array(9).fill(null), xTurn: true, scores: { X: 0, O: 0 }, result: null };

function reducer(state, action) {
  if (action.type === 'RESET')
    return { ...INIT, board: Array(9).fill(null), scores: state.scores, xTurn: action.xTurn ?? true };
  if (action.type === 'RESET_ALL')
    return { ...INIT, board: Array(9).fill(null) };
  if (action.type === 'MOVE') {
    if (state.result || state.board[action.cell]) return state;
    const b = [...state.board];
    b[action.cell] = action.sym;
    const w = getWinner(b);
    const full = isBoardFull(b);
    return {
      ...state,
      board: b,
      xTurn: !state.xTurn,
      scores: w ? { ...state.scores, [w.symbol]: state.scores[w.symbol] + 1 } : state.scores,
      result: w ?? (full ? 'draw' : null),
    };
  }
  return state;
}

// ─── SVG Marks ───────────────────────────────────────────────────────────────
const X_COLOR = '#6c63ff';
const O_COLOR = '#f472b6';

function MarkX() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={{ display: 'block' }}>
      <line x1="13" y1="13" x2="47" y2="47" stroke={X_COLOR} strokeWidth="7" strokeLinecap="round"
        style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: 'drawLine .25s ease forwards' }} />
      <line x1="47" y1="13" x2="13" y2="47" stroke={X_COLOR} strokeWidth="7" strokeLinecap="round"
        style={{ strokeDasharray: 48, strokeDashoffset: 48, animation: 'drawLine .25s ease .1s forwards' }} />
    </svg>
  );
}

function MarkO() {
  return (
    <svg width="60" height="60" viewBox="0 0 60 60" style={{ display: 'block' }}>
      <circle cx="30" cy="30" r="18" fill="none" stroke={O_COLOR} strokeWidth="6"
        style={{ strokeDasharray: 113, strokeDashoffset: 113, animation: 'drawLine .35s ease forwards' }} />
    </svg>
  );
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
function TicTacToeGame() {
  const dark = useTheme();
  const [game, dispatch] = useReducer(reducer, INIT);
  const [mode, setMode] = useState('computer');
  const [thinking, setThinking] = useState(false);

  // Online state
  const [conn, setConn] = useState('idle');
  const [me, setMe] = useState(null);
  const [gameId, setGameId] = useState(null);
  const [shareUrl, setShareUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const wsRef = useRef(null);
  // nextStarterRef: stores xTurn value for the NEXT game (false = O starts, true = X starts)
  const nextStarterRef = useRef(false);

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
    const pid = uid(12);
    const ws = new WebSocket(`${WS_SERVER}?game=${gameId}&player=${pid}`);
    wsRef.current = ws;

    ws.onmessage = ({ data }) => {
      const msg = JSON.parse(data);
      if (msg.type === 'waiting') { setMe(1); setConn('waiting'); }
      else if (msg.type === 'start') { setMe(msg.playerNumber); setConn('playing'); }
      else if (msg.type === 'full') { setConn('full'); }
      else if (msg.type === 'disconnect') { setConn('disconnected'); }
      else if (msg.type === 'move') {
        dispatch({ type: 'MOVE', cell: msg.cell, sym: msg.sym });
      }
      else if (msg.type === 'reset') {
        const xStarts = nextStarterRef.current;
        nextStarterRef.current = !xStarts;
        dispatch({ type: 'RESET', xTurn: xStarts });
      }
    };

    ws.onclose = () => setConn(p => (p === 'playing' || p === 'waiting') ? 'disconnected' : p);
    ws.onerror = () => setConn('error');
    return () => { ws.close(); wsRef.current = null; };
  }, [mode, gameId]);

  // ── Computer AI ──────────────────────────────────────────────────────────────
  const aiTurn = mode === 'computer' && game.xTurn && !game.result;
  useEffect(() => {
    if (!aiTurn) return;
    setThinking(true);
    const id = setTimeout(() => {
      const mv = computerBestMove([...game.board]);
      if (mv >= 0) dispatch({ type: 'MOVE', cell: mv, sym: 'X' });
      setThinking(false);
    }, 480);
    return () => clearTimeout(id);
  }, [aiTurn, game.board]);

  // ── Auto-restart after game ends ─────────────────────────────────────────────
  useEffect(() => {
    if (!game.result) return;
    const id = setTimeout(() => {
      if (mode === 'online') {
        if (me === 1) wsRef.current?.send(JSON.stringify({ type: 'reset' }));
      } else {
        const xStarts = nextStarterRef.current;
        nextStarterRef.current = !xStarts;
        dispatch({ type: 'RESET', xTurn: xStarts });
        setThinking(false);
      }
    }, 1800);
    return () => clearTimeout(id);
  }, [game.result, mode, me]);

  // ── Mode switcher ────────────────────────────────────────────────────────────
  function changeMode(m) {
    wsRef.current?.close();
    setConn('idle'); setMe(null); setThinking(false);
    nextStarterRef.current = false;
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

  // ── Cell click ───────────────────────────────────────────────────────────────
  function handleCellClick(i) {
    if (game.board[i] || game.result) return;
    if (mode === 'online') {
      if (conn !== 'playing') return;
      const myIsX = me === 1;
      if (game.xTurn !== myIsX) return;
      const sym = myIsX ? 'X' : 'O';
      wsRef.current?.send(JSON.stringify({ type: 'move', cell: i, sym }));
      return;
    }
    if (mode === 'computer') {
      if (game.xTurn || thinking) return;
      dispatch({ type: 'MOVE', cell: i, sym: 'O' });
      return;
    }
    dispatch({ type: 'MOVE', cell: i, sym: game.xTurn ? 'X' : 'O' });
  }

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2500);
    });
  }

  // ── Colours ──────────────────────────────────────────────────────────────────
  const bg      = dark ? '#0f0f1a' : '#f0f4ff';
  const surface = dark ? '#1a1a30' : '#ffffff';
  const text    = dark ? '#e0e0f0' : '#1a1a2e';
  const sub     = dark ? 'rgba(224,224,240,0.5)' : 'rgba(26,26,46,0.5)';
  const accent  = '#6c63ff';
  const cellBg  = dark ? '#252545' : '#e8ecff';
  const borderC = dark ? '#3a3a6a' : '#c5caff';
  const shadow  = dark ? '0 8px 32px rgba(0,0,0,0.6)' : '0 8px 32px rgba(108,99,255,0.12)';
  const panelBg = dark ? '#12122a' : '#f8f9ff';

  const isOver    = game.result !== null;
  const winData   = isOver && game.result !== 'draw' ? game.result : null;
  const activeSym = !isOver ? (game.xTurn ? 'X' : 'O') : null;

  const xLabel = mode === 'computer' ? 'Computer' : mode === 'online' ? (me === 1 ? 'You' : 'Opponent') : 'Player X';
  const oLabel = mode === 'computer' ? 'You'      : mode === 'online' ? (me === 2 ? 'You' : 'Opponent') : 'Player O';

  const myTurnOnline = mode === 'online' && conn === 'playing' && !isOver && (me === 1 ? game.xTurn : !game.xTurn);

  // Status text
  let statusText;
  if (!isOver) {
    if (mode === 'online' && conn === 'waiting') statusText = 'Waiting for opponent to join…';
    else if (mode === 'online' && conn === 'playing') statusText = myTurnOnline ? '🟢 Your turn' : '⏳ Opponent\'s turn';
    else if (aiTurn || thinking) statusText = 'Computer is thinking…';
    else if (mode === 'computer')  statusText = 'Your turn (O)';
    else                           statusText = `Player ${game.xTurn ? 'X' : 'O'}'s turn`;
  } else if (game.result === 'draw') {
    statusText = "It's a draw!  · Starting next game…";
  } else {
    const w = winData.symbol;
    if (mode === 'computer')  statusText = w === 'X' ? 'Computer wins!  · Starting next game…' : 'You win! 🎉  · Starting next game…';
    else if (mode === 'online') statusText = (w === 'X' ? me === 1 : me === 2) ? 'You win! 🎉  · Starting next game…' : 'Opponent wins!  · Starting next game…';
    else                        statusText = `Player ${w} wins! 🎉  · Starting next game…`;
  }

  function cellStyle(i) {
    const isWin = !!winData?.line?.includes(i);
    const sym   = game.board[i];
    return {
      width: 100, height: 100, borderRadius: 14,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: game.board[i] || isOver || (mode === 'computer' && (aiTurn || thinking)) ? 'default' : 'pointer',
      border: '2px solid',
      borderColor: isWin ? (sym === 'X' ? `${X_COLOR}88` : `${O_COLOR}88`) : borderC,
      background: isWin ? (sym === 'X' ? `${X_COLOR}22` : `${O_COLOR}22`) : cellBg,
      boxShadow: isWin
        ? (sym === 'X' ? `0 0 18px ${X_COLOR}44` : `0 0 18px ${O_COLOR}44`)
        : dark ? '0 4px 10px rgba(0,0,0,0.35)' : '0 4px 10px rgba(108,99,255,0.08)',
      transition: 'all 0.15s ease', outline: 'none', padding: 0,
    };
  }

  function scoreSlotStyle(sym) {
    const isActive = activeSym === sym;
    const color    = sym === 'X' ? X_COLOR : O_COLOR;
    return {
      flex: 1, display: 'flex', flexDirection: 'column',
      alignItems: 'center', gap: '0.15rem',
      padding: '0.75rem 0.5rem', borderRadius: 12,
      background: dark ? '#252545' : '#f0f2ff',
      border: `2px solid ${isActive ? color : borderC}`,
      boxShadow: isActive ? `0 0 14px ${color}33` : 'none',
      transition: 'all 0.2s ease',
    };
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
      <style>{`
        @keyframes drawLine { to { stroke-dashoffset: 0; } }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      {/* ── Online overlays ── */}
      {showOverlay && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: surface, borderRadius: 20, padding: '2.5rem 2rem', maxWidth: 420, width: '90%', boxShadow: shadow, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            {conn === 'connecting' && <><div style={{ fontSize: '2.5rem' }}>⏳</div><h2 style={{ margin: 0, color: accent }}>Connecting…</h2><p style={{ color: sub, margin: 0 }}>Setting up your game room</p></>}
            {conn === 'full' && <><div style={{ fontSize: '2.5rem' }}>🚫</div><h2 style={{ margin: 0, color: O_COLOR }}>Game is Full</h2><p style={{ color: sub, margin: 0 }}>This game already has two players.</p></>}
            {conn === 'disconnected' && <><div style={{ fontSize: '2.5rem' }}>🔌</div><h2 style={{ margin: 0 }}>Opponent Disconnected</h2><button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.4rem', background: accent, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>New Game</button></>}
            {conn === 'error' && <><div style={{ fontSize: '2.5rem' }}>⚠️</div><h2 style={{ margin: 0 }}>Connection Error</h2><button onClick={() => window.location.reload()} style={{ padding: '0.6rem 1.4rem', background: accent, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 600, cursor: 'pointer' }}>Try Again</button></>}
          </div>
        </div>
      )}

      <main style={{ minHeight: '100vh', background: bg, color: text, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem 1rem', fontFamily: "'Segoe UI', system-ui, sans-serif", transition: 'background 0.3s, color 0.3s' }}>

        {/* Title */}
        <h1 style={{ fontSize: '2.4rem', fontWeight: 800, color: accent, margin: '0 0 0.3rem', letterSpacing: 1 }}>Tic Tac Toe</h1>
        <p style={{ color: sub, margin: '0 0 1.6rem', fontSize: '0.9rem', textAlign: 'center' }}>First to line up three wins</p>

        {/* Mode Tabs */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.4rem' }}>
          <button style={tabStyle('computer')} onClick={() => changeMode('computer')}>vs Computer</button>
          <button style={tabStyle('friend')} onClick={() => changeMode('friend')}>vs Friend</button>
          <button style={tabStyle('online')} onClick={() => changeMode('online')}>Online</button>
        </div>

        {/* Share link panel (online waiting) */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.4rem', width: '100%', maxWidth: 340 }}>
          <div style={scoreSlotStyle('X')}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2, color: sub, textTransform: 'uppercase' }}>{xLabel}</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: X_COLOR, lineHeight: 1 }}>{game.scores.X}</span>
          </div>
          <span style={{ fontWeight: 800, fontSize: '0.8rem', color: sub }}>VS</span>
          <div style={scoreSlotStyle('O')}>
            <span style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: 2, color: sub, textTransform: 'uppercase' }}>{oLabel}</span>
            <span style={{ fontSize: '2rem', fontWeight: 800, color: O_COLOR, lineHeight: 1 }}>{game.scores.O}</span>
          </div>
        </div>

        {/* Board */}
        <div style={{ background: surface, borderRadius: 20, padding: 14, boxShadow: shadow, marginBottom: '1.2rem', opacity: mode === 'online' && conn === 'waiting' ? 0.4 : 1, transition: 'opacity 0.3s' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gridTemplateRows: 'repeat(3, 100px)', gap: 8 }}>
            {game.board.map((cell, i) => (
              <button key={i} style={cellStyle(i)} onClick={() => handleCellClick(i)} aria-label={cell ?? `cell ${i + 1}`}>
                {cell === 'X' && <MarkX />}
                {cell === 'O' && <MarkO />}
              </button>
            ))}
          </div>
        </div>

        {/* Status */}
        <p style={{ margin: 0, fontSize: isOver ? '1.1rem' : '0.95rem', fontWeight: isOver ? 700 : 500, color: isOver ? text : sub, textAlign: 'center', minHeight: '1.6em', animation: isOver ? 'fadeUp 0.3s ease' : 'none' }}>
          {statusText}
        </p>

      </main>
    </>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────
export default function TicTacToePage() {
  return (
    <Layout title="Tic Tac Toe" description="Play Tic Tac Toe against the computer, a friend, or online">
      <TicTacToeGame />
    </Layout>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '@theme/Layout';

// ─── Puzzle Logic ─────────────────────────────────────────────────────────────

const GOAL = [1, 2, 3, 4, 5, 6, 7, 8, 0];
const GOAL_KEY = GOAL.join(',');

function isSolvable(tiles) {
  let inv = 0;
  const arr = tiles.filter(t => t !== 0);
  for (let i = 0; i < arr.length; i++)
    for (let j = i + 1; j < arr.length; j++)
      if (arr[i] > arr[j]) inv++;
  return inv % 2 === 0;
}

function generatePuzzle() {
  let tiles;
  do {
    tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8].sort(() => Math.random() - 0.5);
  } while (!isSolvable(tiles) || tiles.join(',') === GOAL_KEY);
  return tiles;
}

function applyMove(tiles, dir) {
  const ei = tiles.indexOf(0);
  const row = Math.floor(ei / 3);
  const col = ei % 3;
  let si = -1;
  if (dir === 'up' && row > 0) si = ei - 3;
  if (dir === 'down' && row < 2) si = ei + 3;
  if (dir === 'left' && col > 0) si = ei - 1;
  if (dir === 'right' && col < 2) si = ei + 1;
  if (si === -1) return tiles;
  const n = [...tiles];
  [n[ei], n[si]] = [n[si], n[ei]];
  return n;
}

// ─── A* Solver ────────────────────────────────────────────────────────────────

function manhattan(tiles) {
  let d = 0;
  for (let i = 0; i < 9; i++) {
    if (tiles[i] !== 0) {
      const gi = GOAL.indexOf(tiles[i]);
      d += Math.abs(Math.floor(i / 3) - Math.floor(gi / 3))
        + Math.abs(i % 3 - gi % 3);
    }
  }
  return d;
}

class MinHeap {
  constructor() { this.h = []; }
  push(x) { this.h.push(x); this._up(this.h.length - 1); }
  pop() {
    const top = this.h[0];
    const last = this.h.pop();
    if (this.h.length) { this.h[0] = last; this._down(0); }
    return top;
  }
  get size() { return this.h.length; }
  _up(i) {
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (this.h[p].f <= this.h[i].f) break;
      [this.h[p], this.h[i]] = [this.h[i], this.h[p]];
      i = p;
    }
  }
  _down(i) {
    const n = this.h.length;
    for (; ;) {
      let m = i;
      const l = 2 * i + 1, r = 2 * i + 2;
      if (l < n && this.h[l].f < this.h[m].f) m = l;
      if (r < n && this.h[r].f < this.h[m].f) m = r;
      if (m === i) break;
      [this.h[m], this.h[i]] = [this.h[i], this.h[m]];
      i = m;
    }
  }
}

function astar(start) {
  const startKey = start.join(',');
  if (startKey === GOAL_KEY) return [];

  const heap = new MinHeap();
  const gMap = new Map();
  const from = new Map();

  gMap.set(startKey, 0);
  from.set(startKey, null);
  heap.push({ f: manhattan(start), g: 0, tiles: start, key: startKey });

  const DIRS = ['up', 'down', 'left', 'right'];
  let it = 0;

  while (heap.size && it++ < 300000) {
    const { g, tiles, key } = heap.pop();

    if (key === GOAL_KEY) {
      const path = [];
      let k = key;
      while (from.get(k)) {
        const e = from.get(k);
        path.unshift(e.move);
        k = e.pk;
      }
      return path;
    }

    if (gMap.has(key) && gMap.get(key) < g) continue;

    const ei = tiles.indexOf(0);
    const row = Math.floor(ei / 3);
    const col = ei % 3;

    for (const dir of DIRS) {
      let si = -1;
      if (dir === 'up' && row > 0) si = ei - 3;
      if (dir === 'down' && row < 2) si = ei + 3;
      if (dir === 'left' && col > 0) si = ei - 1;
      if (dir === 'right' && col < 2) si = ei + 1;
      if (si === -1) continue;

      const n = [...tiles];
      [n[ei], n[si]] = [n[si], n[ei]];
      const nk = n.join(',');
      const ng = g + 1;

      if (!gMap.has(nk) || gMap.get(nk) > ng) {
        gMap.set(nk, ng);
        from.set(nk, { pk: key, move: dir });
        heap.push({ f: ng + manhattan(n), g: ng, tiles: n, key: nk });
      }
    }
  }
  return null;
}

// ─── Theme Hook ───────────────────────────────────────────────────────────────

function useTheme() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const check = () =>
      setDark(document.documentElement.getAttribute('data-theme') === 'dark');
    check();
    const obs = new MutationObserver(check);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function EightPuzzle() {
  const dark = useTheme();
  const [tiles, setTiles] = useState(generatePuzzle);
  const [moveCount, setMoveCount] = useState(0);
  const [solved, setSolved] = useState(false);
  const [solving, setSolving] = useState(false);
  const [time, setTime] = useState(0);
  const tilesRef = useRef(tiles);

  useEffect(() => { tilesRef.current = tiles; }, [tiles]);

  // ── Timer ───────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (solved) return;
    const id = setInterval(() => setTime(t => t + 1), 1000);
    return () => clearInterval(id);
  }, [solved]);

  // ── Move ────────────────────────────────────────────────────────────────────
  const move = useCallback((dir) => {
    if (solved) return;
    const next = applyMove(tiles, dir);
    if (next === tiles) return;
    setTiles(next);
    setMoveCount(m => m + 1);
  }, [tiles, solved]);

  // ── Detect solved ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!solved && moveCount > 0 && tiles.join(',') === GOAL_KEY) {
      setSolved(true);
    }
  }, [tiles, moveCount, solved]);

  // ── Keyboard ────────────────────────────────────────────────────────────────
  useEffect(() => {
    const map = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right' };
    const handler = e => {
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      move(dir);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [move]);

  // ── New Game ──────────────────────────────────────────────────────────────────
  function newGame() {
    setTiles(generatePuzzle());
    setMoveCount(0);
    setSolved(false);
    setSolving(false);
    setTime(0);
  }

  // ── Hint (A*) — applies the best move immediately, no message shown ──────────
  function getHint() {
    if (solving || solved) return;
    setSolving(true);
    setTimeout(() => {
      const cur = tilesRef.current;
      const path = astar(cur);
      setSolving(false);
      if (path && path.length > 0) {
        const next = applyMove(cur, path[0]);
        if (next !== cur) {
          setTiles(next);
          setMoveCount(m => m + 1);
          if (next.join(',') === GOAL_KEY) setSolved(true);
        }
      }
    }, 0);
  }

  // ── Derived ───────────────────────────────────────────────────────────────────
  const emptyIdx = tiles.indexOf(0);

  const fmt = s =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // ── Colours ───────────────────────────────────────────────────────────────────
  const bg = dark ? '#0f0f1a' : '#f0f4ff';
  const surface = dark ? '#1a1a30' : '#ffffff';
  const text = dark ? '#e0e0f0' : '#1a1a2e';
  const sub = dark ? 'rgba(224,224,240,0.5)' : 'rgba(26,26,46,0.5)';
  const accent = '#6c63ff';
  const tileBg = dark ? '#252545' : '#e8ecff';
  const tileOk = dark ? '#1e4a2a' : '#d0f0d8';
  const emptyBg = dark ? '#0d0d1a' : '#d4d8ff';
  const borderC = dark ? '#3a3a6a' : '#c5caff';
  const shadow = dark
    ? '0 8px 32px rgba(0,0,0,0.6)'
    : '0 8px 32px rgba(108,99,255,0.12)';

  const btnPrimary = {
    padding: '0.65rem 1.6rem',
    background: accent,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const btnSecondary = {
    padding: '0.65rem 1.6rem',
    background: solving || solved ? (dark ? '#252545' : '#e0e0f0') : (dark ? '#1e1e38' : '#e8ecff'),
    color: solving || solved ? sub : accent,
    border: `2px solid ${solving || solved ? borderC : accent}`,
    borderRadius: 10,
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: solving || solved ? 'not-allowed' : 'pointer',
  };

  return (
    <Layout title="8 Puzzle" description="Solve the 8-puzzle game with A* hints">
      <main style={{
        minHeight: '100vh',
        background: bg,
        color: text,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
        fontFamily: "'Segoe UI', system-ui, sans-serif",
        transition: 'background 0.3s, color 0.3s',
      }}>

        {/* ── Header ── */}
        <h1 style={{
          fontSize: '2.4rem',
          fontWeight: 800,
          color: accent,
          margin: '0 0 0.3rem',
          letterSpacing: 1,
        }}>
          8 Puzzle
        </h1>
        <p style={{
          color: sub,
          margin: '0 0 1.8rem',
          fontSize: '0.9rem',
          textAlign: 'center',
          maxWidth: 340,
        }}>
          Arrange tiles 1–8 in order · Use arrow keys or tap adjacent tiles
        </p>

        {/* ── Stats ── */}
        <div style={{ display: 'flex', gap: '3.5rem', marginBottom: '1.5rem' }}>
          {[['MOVES', moveCount], ['TIME', fmt(time)]].map(([label, val]) => (
            <div key={label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '1.7rem', fontWeight: 700, color: accent, lineHeight: 1 }}>
                {val}
              </div>
              <div style={{ fontSize: '0.7rem', color: sub, letterSpacing: 2, marginTop: 3 }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* ── Board + Goal side by side ── */}
        <div style={{
          display: 'flex',
          gap: '1.5rem',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          justifyContent: 'center',
          marginBottom: '1.4rem',
        }}>
          {/* Board */}
          <div style={{
            background: surface,
            borderRadius: 20,
            padding: 14,
            boxShadow: shadow,
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 8,
              width: 270,
            }}>
              {tiles.map((tile, i) => {
                const isEmpty = tile === 0;
                const isCorrect = !isEmpty && GOAL[i] === tile;
                const isAdjacent = !isEmpty && (
                  i === emptyIdx - 3 || i === emptyIdx + 3 ||
                  i === emptyIdx - 1 || i === emptyIdx + 1
                );
                const cellBg = isEmpty ? emptyBg : isCorrect ? tileOk : tileBg;

                return (
                  <div
                    key={i}
                    onClick={() => {
                      if (isEmpty) return;
                      if (i === emptyIdx - 3) move('up');
                      else if (i === emptyIdx + 3) move('down');
                      else if (i === emptyIdx - 1) move('left');
                      else if (i === emptyIdx + 1) move('right');
                    }}
                    style={{
                      width: 82,
                      height: 82,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 14,
                      fontSize: '1.9rem',
                      fontWeight: 700,
                      background: cellBg,
                      color: isEmpty ? 'transparent' : text,
                      border: `2px ${isEmpty ? 'dashed' : 'solid'} ${borderC}`,
                      boxShadow: isEmpty
                        ? 'none'
                        : dark
                          ? '0 4px 10px rgba(0,0,0,0.35)'
                          : '0 4px 10px rgba(108,99,255,0.08)',
                      cursor: isAdjacent ? 'pointer' : 'default',
                      transition: 'all 0.15s ease',
                      userSelect: 'none',
                    }}
                  >
                    {isEmpty ? '' : tile}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Solved Banner ── */}
        {solved && (
          <div style={{
            background: dark ? '#1a3a1a' : '#e6f9ee',
            border: `1px solid ${dark ? '#4caf50' : '#81c784'}`,
            borderRadius: 14,
            padding: '0.8rem 2rem',
            textAlign: 'center',
            marginBottom: '1rem',
            color: dark ? '#81c784' : '#2e7d32',
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 700 }}>Puzzle Solved!</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>
              {moveCount} moves · {fmt(time)}
            </div>
          </div>
        )}

        {/* ── Action Buttons ── */}
        <div style={{ display: 'flex', gap: '0.8rem', flexWrap: 'wrap', justifyContent: 'center' }}>
          <button onClick={newGame} style={btnPrimary}>New Game</button>
          <button onClick={getHint} disabled={solving || solved} style={btnSecondary}>
            {solving ? 'Solving...' : 'Hint (A*)'}
          </button>
        </div>

        <br></br>

        {/* Goal State */}
        <div style={{
          background: surface,
          borderRadius: 16,
          padding: 12,
          boxShadow: shadow,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 8,
        }}>
          <div style={{ fontSize: '0.7rem', color: sub, letterSpacing: 2, fontWeight: 600 }}>
            GOAL
          </div>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 4,
          }}>
            {GOAL.map((t, i) => (
              <div key={i} style={{
                width: 38,
                height: 38,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: t === 0 ? emptyBg : tileBg,
                borderRadius: 8,
                fontSize: '1rem',
                fontWeight: 700,
                color: t === 0 ? 'transparent' : text,
                border: `1px ${t === 0 ? 'dashed' : 'solid'} ${borderC}`,
              }}>
                {t || ''}
              </div>
            ))}
          </div>
        </div>

      </main>
    </Layout >
  );
}

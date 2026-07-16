import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  person, contact, languages, skills, education, certificates, rooms, playerStart, roomBounds,
} from '../data/cv';
import * as horrorAudio from '../utils/horrorAudio';

// ─── Bold-keyword renderer: turns **word** into <strong>word</strong> ─────────

function Bold({ text }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((part, i) => (part.startsWith('**') && part.endsWith('**'))
        ? <strong key={i}>{part.slice(2, -2)}</strong>
        : <React.Fragment key={i}>{part}</React.Fragment>)}
    </>
  );
}

// ─── Room content renderer (shared by reveal panel + text view) ─────────────

function RoomBody({ room }) {
  if (room.id === 'skills') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {skills.map(s => (
          <span key={s} style={{
            padding: '0.3rem 0.7rem', borderRadius: 999, fontSize: '0.8rem',
            fontWeight: 700, background: `${room.color}22`, color: room.color,
            border: `1px solid ${room.color}55`,
          }}>{s}</span>
        ))}
      </div>
    );
  }
  if (room.id === 'education') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
        {education.map(e => (
          <div key={e.school}>
            <div style={{ fontWeight: 700 }}>{e.school}</div>
            <div style={{ fontSize: '0.9rem', opacity: 0.85 }}>{e.degree}</div>
            <div style={{ fontSize: '0.8rem', opacity: 0.6 }}><strong>{e.period}</strong> · {e.detail}</div>
          </div>
        ))}
        {certificates.map(c => (
          <div key={c.name}>
            <div style={{ fontWeight: 700 }}>{c.name}</div>
            <div style={{ fontSize: '0.85rem', opacity: 0.75 }}>{c.detail}</div>
          </div>
        ))}
      </div>
    );
  }
  if (room.id === 'contact') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {contact.map(c => (
          <a key={c.label} href={c.href} target="_blank" rel="noreferrer"
            style={{ color: room.color, fontWeight: 700, textDecoration: 'none' }}>
            {c.label}: {c.value}
          </a>
        ))}
        <div style={{ fontSize: '0.85rem', opacity: 0.7, marginTop: '0.4rem' }}>
          {languages.map(l => `${l.name} (${l.level})`).join(' · ')}
        </div>
      </div>
    );
  }
  return (
    <ul style={{ margin: 0, paddingLeft: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {room.bullets.map((b, i) => <li key={i} style={{ fontSize: '0.92rem', lineHeight: 1.5 }}><Bold text={b} /></li>)}
    </ul>
  );
}

// ─── Accessible / crawlable text view (also the SSR + no-JS fallback) ────────

function TextFallback({ surface, sub, shadow }) {
  return (
    <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {rooms.map(room => (
        <div key={room.id} style={{
          background: surface, borderRadius: 16, padding: '1.1rem 1.3rem',
          boxShadow: shadow, borderLeft: `4px solid ${room.color}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{room.icon}</span>
            <span style={{ fontWeight: 700 }}>{room.title}</span>
            {room.period && <span style={{ fontSize: '0.8rem', color: sub }}>· {room.period}</span>}
          </div>
          {room.subtitle && <div style={{ fontSize: '0.85rem', color: sub, marginBottom: '0.6rem' }}>{room.subtitle}</div>}
          <RoomBody room={room} />
        </div>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Profile() {
  const [viewMode, setViewMode] = useState('scene'); // 'scene' | 'text'
  const [entered, setEntered] = useState(false);
  const [foundRooms, setFoundRooms] = useState(() => new Set());
  const [activeRoom, setActiveRoom] = useState(null);
  const [nearId, setNearId] = useState(null);
  const apiRef = useRef(null);

  useEffect(() => () => horrorAudio.stopAmbience(), []);

  function enterCrypt() {
    horrorAudio.unlock();
    horrorAudio.startAmbience();
    setEntered(true);
  }

  function handleReveal(room) {
    setFoundRooms(prev => new Set(prev).add(room.id));
    setTimeout(() => setActiveRoom(room), 350);
  }

  const allFound = foundRooms.size === rooms.length;

  // ── Colours: dark horror palette (still shares the site's brand accent) ────
  const bg = '#050508';
  const surface = '#15121a';
  const text = '#e7e2f0';
  const sub = 'rgba(231,226,240,0.6)';
  const accent = '#8b1e2b';
  const gold = '#c9a15a';
  const shadow = '0 12px 40px rgba(0,0,0,0.7)';

  const btnPrimary = {
    padding: '0.65rem 1.5rem', background: accent, color: '#f2e9e9', border: '1px solid #d94a5a',
    borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', letterSpacing: 0.5,
  };

  return (
    <Layout
      title={`${person.name} — CV`}
      description={`${person.title}. ${person.tagline} Explore a dark interactive room to uncover the CV, or view it as plain text.`}
    >
      <style>{`
        @keyframes profilePop { from { opacity: 0; transform: scale(0.92) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes candleFlicker { 0%,100% { opacity: 1; } 45% { opacity: 0.82; } 60% { opacity: 0.95; } }
        @keyframes titleGlow { 0%,100% { text-shadow: 0 0 8px rgba(201,161,90,0.35); } 50% { text-shadow: 0 0 18px rgba(201,161,90,0.6); } }
      `}</style>

      <main style={{
        height: 'calc(100vh - var(--ifm-navbar-height, 60px))', background: bg, color: text,
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
        fontFamily: "'Courier New', Courier, monospace", transition: 'background 0.3s, color 0.3s',
      }}>

        {/* ── Minimal corner controls ── */}
        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 60, display: 'flex', gap: '0.5rem' }}>
          <button
            style={cornerBtn(gold)}
            onClick={() => setViewMode(v => (v === 'scene' ? 'text' : 'scene'))}
            title={viewMode === 'scene' ? 'View as text' : 'Enter the crypt'}
          >
            {viewMode === 'scene' ? '📄' : '🕯️'}
          </button>
          <a href="/files/Ayah-Alrefai-CV.pdf" download style={cornerBtn(gold)} title="Download PDF">⬇</a>
        </div>

        {viewMode === 'text' ? (
          <div style={{ flex: 1, overflowY: 'auto', padding: '2.5rem 1rem 3rem', display: 'flex', justifyContent: 'center' }}>
            <TextFallback surface={surface} sub={sub} shadow={shadow} />
          </div>
        ) : (
          <div style={{ position: 'relative', flex: 1, width: '100%' }}>
          <BrowserOnly fallback={
            <div style={{ height: '100%', overflowY: 'auto', padding: '2.5rem 1rem 3rem', display: 'flex', justifyContent: 'center' }}>
              <TextFallback surface={surface} sub={sub} shadow={shadow} />
            </div>
          }>
            {() => {
              const HorrorScene = require('../components/HorrorScene').default;

              if (!entered) {
                return (
                  <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                  <div style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                    background: surface, borderRadius: 18, padding: '2.2rem 1.8rem', boxShadow: shadow,
                    maxWidth: 420, textAlign: 'center', border: `1px solid ${accent}55`,
                  }}>
                    <div style={{ fontSize: '1.6rem', animation: 'candleFlicker 2.4s ease-in-out infinite' }}>🕯️</div>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: gold, margin: 0, animation: 'titleGlow 3.2s ease-in-out infinite' }}>
                      {person.name}
                    </h1>
                    <p style={{ margin: 0, fontWeight: 700 }}>{person.title}</p>
                    <p style={{ color: sub, fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                      Six relics are hidden in the dark — an altar, a vase, a locked chest,
                      a bookshelf, a well, a cracked mirror. Walk up and break them open to
                      read my career, one piece at a time.
                    </p>
                    <button style={btnPrimary} onClick={enterCrypt}>🕯️ Enter the Crypt</button>
                    <span style={{ fontSize: '0.72rem', color: sub }}>WASD / arrows to move · E or tap to interact</span>
                  </div>
                  </div>
                );
              }

              return (
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    {/* Relics-found counter */}
                    <div style={{
                      position: 'absolute', top: 12, left: 12, zIndex: 20,
                      background: 'rgba(10,8,14,0.75)', color: sub, padding: '0.4rem 0.8rem',
                      borderRadius: 999, fontSize: '0.78rem', border: `1px solid ${accent}55`,
                    }}>
                      🔍 <strong style={{ color: gold }}>{foundRooms.size}/{rooms.length}</strong> relics
                    </div>

                    <HorrorScene
                      rooms={rooms}
                      playerStart={playerStart}
                      bounds={roomBounds}
                      foundRooms={foundRooms}
                      onReveal={handleReveal}
                      onNearChange={setNearId}
                      onFootstep={() => horrorAudio.playFootstep()}
                      apiRef={apiRef}
                    />

                    {/* Near-prop prompt */}
                    {nearId && !foundRooms.has(nearId) && (
                      <div style={{
                        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(10,8,14,0.85)', color: gold, padding: '0.4rem 0.9rem',
                        borderRadius: 999, fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${gold}66`,
                      }}>
                        ✋ Press E or tap Interact
                      </div>
                    )}

                    {/* Interact button (mobile / click) */}
                    <button
                      onClick={() => apiRef.current && apiRef.current.interact()}
                      disabled={!nearId || foundRooms.has(nearId)}
                      style={{
                        position: 'absolute', bottom: 14, right: 14, padding: '0.7rem 1.1rem',
                        borderRadius: 10, fontWeight: 700, fontSize: '0.85rem',
                        background: nearId && !foundRooms.has(nearId) ? accent : 'rgba(60,60,70,0.5)',
                        color: '#fff', border: 'none',
                        cursor: nearId && !foundRooms.has(nearId) ? 'pointer' : 'default',
                        opacity: nearId && !foundRooms.has(nearId) ? 1 : 0.5,
                      }}
                    >
                      ✋ Interact
                    </button>

                    {/* D-pad */}
                    <div style={{
                      position: 'absolute', bottom: 14, left: 14,
                      display: 'grid', gridTemplateColumns: 'repeat(3, 38px)', gridTemplateRows: 'repeat(3, 38px)', gap: 4,
                    }}>
                      <div /><DpadBtn dir="forward" apiRef={apiRef}>▲</DpadBtn><div />
                      <DpadBtn dir="left" apiRef={apiRef}>◀</DpadBtn><div /><DpadBtn dir="right" apiRef={apiRef}>▶</DpadBtn>
                      <div /><DpadBtn dir="back" apiRef={apiRef}>▼</DpadBtn><div />
                    </div>

                    {/* Found-rooms quick nav */}
                    {foundRooms.size > 0 && (
                      <div style={{
                        position: 'absolute', bottom: 14, left: '50%', transform: 'translateX(-50%)',
                        display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center',
                        maxWidth: 'calc(100% - 220px)', overflowX: 'auto',
                      }}>
                        {rooms.filter(r => foundRooms.has(r.id)).map(r => (
                          <button key={r.id} onClick={() => setActiveRoom(r)} style={{
                            padding: '0.3rem 0.6rem', borderRadius: 999, fontSize: '0.72rem', fontWeight: 700,
                            background: 'rgba(10,8,14,0.75)', color: r.color, border: `1px solid ${r.color}66`, cursor: 'pointer',
                          }}>{r.icon} {r.title}</button>
                        ))}
                      </div>
                    )}

                    {allFound && (
                      <div style={{
                        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                        background: '#1a0d0dee', border: `1px solid ${accent}`, borderRadius: 14,
                        padding: '0.9rem 1.6rem', textAlign: 'center', color: gold, maxWidth: 340, boxShadow: shadow,
                      }}>
                        <div style={{ fontWeight: 700 }}>🕯️ Every relic has spoken.</div>
                        <div style={{ fontSize: '0.85rem', opacity: 0.9, marginTop: '0.3rem', color: sub }}>
                          Thanks for making it through — let's talk: <a href="mailto:alrefayayah@gmail.com" style={{ color: gold }}>alrefayayah@gmail.com</a>
                        </div>
                      </div>
                    )}
                  </div>
              );
            }}
          </BrowserOnly>
          </div>
        )}

        {/* ── Reveal panel ── */}
        {activeRoom && (
          <div
            onClick={() => setActiveRoom(null)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
              alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100,
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                background: surface, borderRadius: 18, padding: '1.6rem', maxWidth: 460, width: '100%',
                boxShadow: shadow, borderTop: `4px solid ${activeRoom.color}`,
                animation: 'profilePop 0.22s ease-out', border: `1px solid ${activeRoom.color}44`,
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                <div>
                  <div style={{ fontSize: '1.5rem' }}>{activeRoom.icon}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.15rem', marginTop: '0.2rem' }}>{activeRoom.title}</div>
                  {activeRoom.subtitle && <div style={{ fontSize: '0.85rem', color: sub }}>{activeRoom.subtitle}</div>}
                  {activeRoom.period && <div style={{ fontSize: '0.78rem', color: sub }}><strong>{activeRoom.period}</strong></div>}
                </div>
                <button onClick={() => setActiveRoom(null)} aria-label="Close"
                  style={{ background: 'transparent', border: 'none', color: sub, fontSize: '1.3rem', cursor: 'pointer', lineHeight: 1 }}>
                  ×
                </button>
              </div>
              <RoomBody room={activeRoom} />
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}

function cornerBtn(gold) {
  return {
    width: 36, height: 36, borderRadius: 8, background: 'rgba(10,8,14,0.75)',
    border: `1px solid ${gold}55`, color: gold, fontSize: '1rem', cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none',
  };
}

function DpadBtn({ dir, apiRef, children }) {
  const press = (v) => (e) => { e.preventDefault(); apiRef.current && apiRef.current.setKey(dir, v); };
  return (
    <button
      onPointerDown={press(true)}
      onPointerUp={press(false)}
      onPointerLeave={press(false)}
      style={{
        width: 38, height: 38, borderRadius: 8, background: 'rgba(10,8,14,0.75)',
        border: '1px solid rgba(201,161,90,0.4)', color: '#c9a15a', fontSize: '0.9rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none',
      }}
    >
      {children}
    </button>
  );
}

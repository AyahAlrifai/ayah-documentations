import React, { useState, useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';
import {
  person, contact, languages, skills, education, certificates, cvSections,
} from '../data/cv';
import { finale } from '../data/hexaMaze';
import * as hexaAudio from '../utils/hexaAudio';

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

// ─── CV section renderer (shared by reveal panel + text view) ────────────────

function SectionBody({ section }) {
  if (section.id === 'skills') {
    return (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {skills.map(s => (
          <span key={s} style={{
            padding: '0.3rem 0.7rem', borderRadius: 999, fontSize: '0.8rem',
            fontWeight: 700, background: `${section.color}22`, color: section.color,
            border: `1px solid ${section.color}55`,
          }}>{s}</span>
        ))}
      </div>
    );
  }
  if (section.id === 'education') {
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
  if (section.id === 'contact') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {contact.map(c => (
          <a key={c.label} href={c.href} target="_blank" rel="noreferrer"
            style={{ color: section.color, fontWeight: 700, textDecoration: 'none' }}>
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
      {section.bullets.map((b, i) => <li key={i} style={{ fontSize: '0.92rem', lineHeight: 1.5 }}><Bold text={b} /></li>)}
    </ul>
  );
}

function TextFallback({ surface, sub, shadow }) {
  return (
    <div style={{ width: '100%', maxWidth: 640, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {cvSections.map(section => (
        <div key={section.id} style={{
          background: surface, borderRadius: 16, padding: '1.1rem 1.3rem',
          boxShadow: shadow, borderLeft: `4px solid ${section.color}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', marginBottom: '0.2rem' }}>
            <span style={{ fontSize: '1.2rem' }}>{section.icon}</span>
            <span style={{ fontWeight: 700 }}>{section.title}</span>
            {section.period && <span style={{ fontSize: '0.8rem', color: sub }}>· {section.period}</span>}
          </div>
          {section.subtitle && <div style={{ fontSize: '0.85rem', color: sub, marginBottom: '0.6rem' }}>{section.subtitle}</div>}
          <SectionBody section={section} />
        </div>
      ))}
    </div>
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
      onPointerDown={press(true)} onPointerUp={press(false)} onPointerLeave={press(false)}
      style={{
        width: 38, height: 38, borderRadius: 8, background: 'rgba(10,8,14,0.75)',
        border: '1px solid rgba(201,161,90,0.4)', color: '#c9a15a', fontSize: '0.9rem',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', touchAction: 'none',
      }}
    >{children}</button>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Profile() {
  const [viewMode, setViewMode] = useState('scene');
  const [entered, setEntered] = useState(false);
  const [gameState, setGameState] = useState(null);
  const [nearInfo, setNearInfo] = useState(null);
  const [activeReveal, setActiveReveal] = useState(null);
  const [codeInfo, setCodeInfo] = useState(null);
  const [codeInput, setCodeInput] = useState('');
  const [codeReveal, setCodeReveal] = useState(null);
  const [finaleStage, setFinaleStage] = useState(null);
  const [showIntro, setShowIntro] = useState(true);
  const apiRef = useRef(null);
  const introTimer = useRef(null);
  const codeRevealTimer = useRef(null);

  useEffect(() => () => {
    hexaAudio.stopAmbience();
    clearTimeout(codeRevealTimer.current);
  }, []);

  useEffect(() => {
    setCodeInput('');
  }, [codeInfo]);

  useEffect(() => {
    if (!gameState) return;
    setShowIntro(true);
    clearTimeout(introTimer.current);
    introTimer.current = setTimeout(() => setShowIntro(false), 4200);
    return () => clearTimeout(introTimer.current);
  }, [gameState && gameState.roomIndex]);

  function beginQuest() {
    hexaAudio.unlock();
    hexaAudio.startAmbience();
    setEntered(true);
  }

  function handleSectionReveal(cvSectionId) {
    const section = cvSections.find(s => s.id === cvSectionId);
    if (section) setActiveReveal(section);
  }

  function handleCodeReveal(code) {
    setCodeReveal(code);
    clearTimeout(codeRevealTimer.current);
    codeRevealTimer.current = setTimeout(() => setCodeReveal(null), 5000);
  }

  function pressDigit(d) {
    if (!codeInfo) return;
    const next = (codeInput + d).slice(0, codeInfo.code.length);
    setCodeInput(next);
    if (next.length === codeInfo.code.length) {
      apiRef.current && apiRef.current.submitCode(next);
    }
  }

  const bg = '#0e0c14';
  const surface = '#17131e';
  const text = '#e9e2f2';
  const sub = 'rgba(233,226,242,0.62)';
  const accent = gameState ? gameState.room.accent : '#c9a15a';
  const gold = '#c9a15a';
  const shadow = '0 12px 40px rgba(0,0,0,0.7)';

  const btnPrimary = {
    padding: '0.65rem 1.5rem', background: accent, color: '#100e14', border: `1px solid ${accent}`,
    borderRadius: 8, fontSize: '0.9rem', fontWeight: 700, cursor: 'pointer', letterSpacing: 0.3,
  };

  return (
    <Layout
      title={`${person.name} — The Hexa Maze`}
      description={`${person.title}. Six rooms, six keys, six glowing orbs — explore The Hexa Maze to uncover the CV, or view it as plain text.`}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Creepster&family=Cinzel:wght@400;600;700&family=EB+Garamond:ital@0;1&display=swap');
        @keyframes profilePop { from { opacity: 0; transform: scale(0.92) translateY(8px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes introFade { 0% { opacity: 0; transform: translateY(-6px); } 12% { opacity: 1; transform: translateY(0); } 88% { opacity: 1; } 100% { opacity: 0; } }
        @keyframes softGlow { 0%,100% { text-shadow: 0 0 8px rgba(201,161,90,0.3); } 50% { text-shadow: 0 0 16px rgba(201,161,90,0.55); } }
        @keyframes revealRise { from { opacity: 0; transform: scale(0.9) translateY(14px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        @keyframes candleFlicker {
          0%, 100% { box-shadow: 0 0 0 1px var(--reveal-glow), 0 0 26px 4px var(--reveal-glow-soft), 0 22px 60px rgba(0,0,0,0.9); }
          38% { box-shadow: 0 0 0 1px var(--reveal-glow), 0 0 16px 2px var(--reveal-glow-soft), 0 22px 60px rgba(0,0,0,0.9); }
          52% { box-shadow: 0 0 0 1px var(--reveal-glow), 0 0 32px 6px var(--reveal-glow-soft), 0 22px 60px rgba(0,0,0,0.9); }
          71% { box-shadow: 0 0 0 1px var(--reveal-glow), 0 0 12px 2px var(--reveal-glow-soft), 0 22px 60px rgba(0,0,0,0.9); }
        }
        @keyframes titleFlicker {
          0%, 100% { opacity: 1; text-shadow: 0 0 10px var(--reveal-glow), 0 0 22px var(--reveal-glow-soft); }
          45% { opacity: 0.85; text-shadow: 0 0 6px var(--reveal-glow); }
          47% { opacity: 1; text-shadow: 0 0 14px var(--reveal-glow), 0 0 28px var(--reveal-glow-soft); }
          92% { opacity: 0.92; }
        }
      `}</style>

      <main style={{
        height: 'calc(100vh - var(--ifm-navbar-height, 60px))', background: bg, color: text,
        display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden',
        fontFamily: "'EB Garamond', 'Cinzel', Georgia, serif", transition: 'background 0.3s, color 0.3s',
      }}>

        <div style={{ position: 'absolute', top: 10, right: 10, zIndex: 60, display: 'flex', gap: '0.5rem' }}>
          <button style={cornerBtn(gold)} onClick={() => setViewMode(v => (v === 'scene' ? 'text' : 'scene'))}
            title={viewMode === 'scene' ? 'View as text' : 'Enter the maze'}>
            {viewMode === 'scene' ? '📄' : '🗝️'}
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
                const HexaMaze = require('../components/HexaMaze').default;

                if (!entered) {
                  return (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                      <div style={{
                        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem',
                        background: surface, borderRadius: 18, padding: '2.2rem 1.8rem', boxShadow: shadow,
                        maxWidth: 440, textAlign: 'center', border: `1px solid ${gold}44`,
                      }}>
                        <div style={{ fontSize: '1.6rem', animation: 'softGlow 3.2s ease-in-out infinite' }}>🗝️ 🔮</div>
                        <h1 style={{
                          fontSize: '2.1rem', fontWeight: 400, color: gold, margin: 0,
                          fontFamily: "'Creepster', cursive", letterSpacing: 1.5,
                          animation: 'softGlow 3.2s ease-in-out infinite',
                        }}>The Hexa Maze</h1>
                        <p style={{ margin: 0, fontWeight: 700 }}>{person.name} — {person.title}</p>
                        <p style={{ color: sub, fontSize: '0.9rem', lineHeight: 1.6, margin: 0 }}>
                          Six rooms. In each, find the Hidden Key and the Glowing Orb — the orb is your
                          light, and the story of one chapter of my career. Both must be found before
                          the door forward will open.
                        </p>
                        <button style={btnPrimary} onClick={beginQuest}>🗝️ Begin the Quest</button>
                        <span style={{ fontSize: '0.72rem', color: sub }}>WASD / arrows to move · E or tap to interact</span>
                      </div>
                    </div>
                  );
                }

                return (
                  <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                    <HexaMaze
                      apiRef={apiRef}
                      onState={setGameState}
                      onSectionReveal={handleSectionReveal}
                      onNearChange={(id, label) => setNearInfo(id ? { id, label } : null)}
                      onCodeRequest={setCodeInfo}
                      onCodeReveal={handleCodeReveal}
                      onFinaleStage={setFinaleStage}
                    />

                    {gameState && (
                      <div style={{
                        position: 'absolute', top: 12, left: 12, zIndex: 20,
                        background: 'rgba(10,8,14,0.75)', padding: '0.5rem 0.9rem', borderRadius: 10,
                        border: `1px solid ${accent}55`, fontSize: '0.78rem', color: sub,
                      }}>
                        <div style={{ color: gold, fontWeight: 700 }}>
                          Room {gameState.roomIndex + 1} / {gameState.roomCount} — {gameState.room.title}
                        </div>
                        <div style={{ display: 'flex', gap: '0.7rem', marginTop: '0.3rem' }}>
                          <span style={{ opacity: gameState.keyDone ? 1 : 0.35 }}>🗝️ Key</span>
                          <span style={{ opacity: gameState.orbDone ? 1 : 0.35 }}>🔮 Orb</span>
                        </div>
                      </div>
                    )}

                    {gameState && showIntro && (
                      <div style={{
                        position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
                        maxWidth: 420, textAlign: 'center', background: 'rgba(10,8,14,0.82)',
                        padding: '0.7rem 1.1rem', borderRadius: 10, border: `1px solid ${accent}66`,
                        animation: 'introFade 4.2s ease-in-out forwards', pointerEvents: 'none',
                      }}>
                        <div style={{ color: accent, fontWeight: 700, fontSize: '0.85rem' }}>{gameState.room.title}</div>
                        <div style={{ color: sub, fontSize: '0.78rem', fontStyle: 'italic', marginTop: '0.2rem' }}>{gameState.room.atmosphere}</div>
                      </div>
                    )}

                    {nearInfo && nearInfo.label && (
                      <div style={{
                        position: 'absolute', bottom: 68, left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(10,8,14,0.85)', color: gold, padding: '0.4rem 0.9rem',
                        borderRadius: 999, fontSize: '0.8rem', fontWeight: 700, border: `1px solid ${gold}66`,
                        textAlign: 'center', maxWidth: '80%',
                      }}>
                        ✋ {nearInfo.label}
                      </div>
                    )}

                    {codeReveal && (
                      <div style={{
                        position: 'absolute', top: 90, left: '50%', transform: 'translateX(-50%)',
                        background: 'rgba(10,8,14,0.9)', color: gold, padding: '0.55rem 1.1rem',
                        borderRadius: 10, fontSize: '0.95rem', fontWeight: 700, border: `1px solid ${gold}88`,
                        textAlign: 'center', letterSpacing: 2, zIndex: 25,
                        animation: 'profilePop 0.3s ease-out',
                      }}>
                        🔢 Code revealed: {codeReveal}
                      </div>
                    )}

                    <button
                      onClick={() => apiRef.current && apiRef.current.interact()}
                      disabled={!nearInfo}
                      style={{
                        position: 'absolute', bottom: 14, right: 14, padding: '0.7rem 1.1rem',
                        borderRadius: 10, fontWeight: 700, fontSize: '0.85rem',
                        background: nearInfo ? accent : 'rgba(60,60,70,0.5)',
                        color: '#100e14', border: 'none',
                        cursor: nearInfo ? 'pointer' : 'default',
                        opacity: nearInfo ? 1 : 0.5,
                      }}
                    >✋ Interact</button>

                    <div style={{
                      position: 'absolute', bottom: 14, left: 14,
                      display: 'grid', gridTemplateColumns: 'repeat(3, 38px)', gridTemplateRows: 'repeat(3, 38px)', gap: 4,
                    }}>
                      <div /><DpadBtn dir="forward" apiRef={apiRef}>▲</DpadBtn><div />
                      <DpadBtn dir="left" apiRef={apiRef}>◀</DpadBtn><div /><DpadBtn dir="right" apiRef={apiRef}>▶</DpadBtn>
                      <div /><DpadBtn dir="back" apiRef={apiRef}>▼</DpadBtn><div />
                    </div>

                    {codeInfo && (
                      <div style={{
                        position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', zIndex: 50,
                      }}>
                        <div style={{ background: surface, borderRadius: 16, padding: '1.4rem', boxShadow: shadow, border: `1px solid ${accent}55`, textAlign: 'center' }}>
                          <div style={{ color: gold, fontWeight: 700, marginBottom: '0.8rem' }}>Dial the combination</div>
                          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', marginBottom: '1rem' }}>
                            {Array.from({ length: codeInfo.code.length }).map((_, i) => (
                              <div key={i} style={{
                                width: 30, height: 38, borderRadius: 6, border: `1px solid ${accent}66`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: text,
                              }}>{codeInput[i] || ''}</div>
                            ))}
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 42px)', gap: 6, justifyContent: 'center' }}>
                            {['1','2','3','4','5','6','7','8','9','','0','⌫'].map((d, i) => (
                              <button key={i}
                                onClick={() => d === '⌫' ? setCodeInput(v => v.slice(0, -1)) : d && pressDigit(d)}
                                style={{
                                  width: 42, height: 42, borderRadius: 8, background: d ? 'rgba(255,255,255,0.06)' : 'transparent',
                                  border: d ? `1px solid ${accent}44` : 'none', color: text, fontSize: '1rem',
                                  cursor: d ? 'pointer' : 'default',
                                }}
                              >{d}</button>
                            ))}
                          </div>
                          <button onClick={() => setCodeInfo(null)} style={{ marginTop: '0.8rem', background: 'none', border: 'none', color: sub, cursor: 'pointer', fontSize: '0.78rem' }}>cancel</button>
                        </div>
                      </div>
                    )}

                    {finaleStage && (
                      <div style={{
                        position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: finaleStage === 'blast' ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.55)',
                        transition: 'background 0.6s', zIndex: 55, padding: '1rem',
                      }}>
                        <div style={{
                          background: finaleStage === 'blast' ? 'transparent' : surface, borderRadius: 16,
                          padding: '1.6rem 2rem', maxWidth: 480, textAlign: 'center',
                          color: finaleStage === 'blast' ? '#1a1a1a' : gold,
                          boxShadow: finaleStage === 'blast' ? 'none' : shadow,
                          border: finaleStage === 'blast' ? 'none' : `1px solid ${gold}55`,
                        }}>
                          <div style={{
                            fontWeight: 400, fontSize: '1.7rem', marginBottom: '0.6rem',
                            fontFamily: "'Creepster', cursive", letterSpacing: 1.2,
                          }}>{finale.title}</div>
                          <div style={{ fontSize: '0.92rem', lineHeight: 1.7, color: finaleStage === 'blast' ? '#1a1a1a' : sub }}>
                            {finaleStage === 'slotting' && finale.slotting}
                            {finaleStage === 'blast' && finale.blast}
                            {finaleStage === 'unlocked' && finale.unlock}
                            {finaleStage === 'escaped' && finale.escape}
                          </div>
                          {finaleStage === 'escaped' && (
                            <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: sub }}>
                              Thanks for playing through my career — let's talk: <a href="mailto:alrefayayah@gmail.com" style={{ color: gold }}>alrefayayah@gmail.com</a>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              }}
            </BrowserOnly>
          </div>
        )}

        {activeReveal && (
          <div
            onClick={() => setActiveReveal(null)}
            style={{
              position: 'fixed', inset: 0,
              background: 'radial-gradient(ellipse at center, rgba(20,4,8,0.78) 0%, rgba(0,0,0,0.94) 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100,
            }}
          >
            <div
              onClick={e => e.stopPropagation()}
              style={{
                '--reveal-glow': `${activeReveal.color}bb`,
                '--reveal-glow-soft': `${activeReveal.color}44`,
                background: 'linear-gradient(180deg, #1c1116 0%, #0c0709 100%)',
                borderRadius: 4, padding: '1.7rem 1.6rem', maxWidth: 460, width: '100%',
                border: `1px solid ${activeReveal.color}88`,
                animation: 'revealRise 0.3s ease-out, candleFlicker 3.4s ease-in-out infinite',
                position: 'relative', fontFamily: "'EB Garamond', 'Cinzel', Georgia, serif",
              }}
            >
              <div style={{
                position: 'absolute', inset: 0, borderRadius: 4, pointerEvents: 'none',
                boxShadow: 'inset 0 0 70px rgba(0,0,0,0.75)',
                background: 'repeating-linear-gradient(0deg, rgba(0,0,0,0.06) 0px, rgba(0,0,0,0) 1px, rgba(0,0,0,0) 2px)',
              }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.9rem', position: 'relative' }}>
                <div>
                  <div style={{
                    fontSize: '1.7rem', width: 48, height: 48, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    border: `1px solid ${activeReveal.color}66`, background: 'rgba(0,0,0,0.35)',
                  }}>{activeReveal.icon}</div>
                  <div style={{
                    fontFamily: "'Creepster', cursive", fontSize: '1.55rem', letterSpacing: 1,
                    color: activeReveal.color, marginTop: '0.5rem', lineHeight: 1.1,
                    animation: 'titleFlicker 2.6s ease-in-out infinite',
                  }}>{activeReveal.title}</div>
                  {activeReveal.subtitle && <div style={{ fontSize: '0.88rem', color: sub, marginTop: '0.15rem', fontStyle: 'italic' }}>{activeReveal.subtitle}</div>}
                  {activeReveal.period && <div style={{ fontSize: '0.78rem', color: sub, marginTop: '0.1rem' }}><strong>{activeReveal.period}</strong></div>}
                </div>
                <button onClick={() => setActiveReveal(null)} aria-label="Close"
                  style={{
                    background: 'rgba(0,0,0,0.4)', border: `1px solid ${activeReveal.color}55`, borderRadius: '50%',
                    width: 30, height: 30, color: '#c23b3b', fontSize: '1.15rem', cursor: 'pointer', lineHeight: 1,
                    textShadow: '0 0 6px rgba(194,59,59,0.8)', flexShrink: 0,
                  }}>
                  ×
                </button>
              </div>
              <div style={{ position: 'relative', color: '#e9e2f2' }}>
                <SectionBody section={activeReveal} />
              </div>
            </div>
          </div>
        )}
      </main>
    </Layout>
  );
}

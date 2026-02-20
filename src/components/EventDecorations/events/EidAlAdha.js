import React from 'react';
import styles from '../EventDecorations.module.css';

const PRIMARY   = '#8BC34A';   // leaf green
const SECONDARY = '#FF9800';   // warm orange
const GLOW      = 'rgba(139, 195, 74, 0.28)';

// ── Background stars ──────────────────────────────────────────
const STARS = [
  { left: '4%',  top: '8%',  delay: '0s',    size: 2.5 },
  { left: '15%', top: '18%', delay: '0.7s',  size: 2   },
  { left: '32%', top: '6%',  delay: '1.4s',  size: 2   },
  { left: '55%', top: '12%', delay: '0.3s',  size: 3   },
  { left: '72%', top: '7%',  delay: '1.1s',  size: 2   },
  { left: '88%', top: '16%', delay: '0.6s',  size: 2.5 },
  { left: '96%', top: '10%', delay: '1.8s',  size: 2   },
];

// ── Sheep positions (bottom area, varied sizes) ───────────────
const SHEEP_LIST = [
  { left: '4%',  bottom: '8%',  width: 72,  delay: '0s'   },
  { left: '26%', bottom: '5%',  width: 88,  delay: '0.9s' },
  { left: '60%', bottom: '7%',  width: 68,  delay: '1.6s' },
  { left: '82%', bottom: '6%',  width: 80,  delay: '0.5s' },
];

function Sun() {
  const c = '#FFE066';  // pale yellow centre
  const r = '#FFB800';  // amber rays
  return (
    <div className={styles.sunWrap}>
      <svg viewBox="0 0 100 100" className={styles.sunSvg} aria-hidden="true" focusable="false">
        {/* 8 rays */}
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI / 4) - Math.PI / 2;
          const x1 = 50 + 26 * Math.cos(a);
          const y1 = 50 + 26 * Math.sin(a);
          const x2 = 50 + 44 * Math.cos(a);
          const y2 = 50 + 44 * Math.sin(a);
          return (
            <line key={i}
              x1={x1.toFixed(1)} y1={y1.toFixed(1)}
              x2={x2.toFixed(1)} y2={y2.toFixed(1)}
              stroke={r} strokeWidth="3.5" strokeLinecap="round" />
          );
        })}
        {/* Core */}
        <circle cx="50" cy="50" r="22" fill={c} />
        <circle cx="50" cy="50" r="17" fill={r} />
        {/* Shine spot */}
        <circle cx="42" cy="42" r="5" fill="rgba(255,255,255,0.35)" />
      </svg>
    </div>
  );
}

function Sheep({ width, delay }) {
  const h = Math.round(width * (68 / 80));
  const wool  = '#EEEAE0';
  const wollS = '#E3DDD2';  // slightly darker for texture circles
  const skin  = '#C4A882';
  const dark  = '#3A2418';

  return (
    <div
      className={styles.sheepWrap}
      style={{ animationDelay: delay }}
    >
      <svg
        viewBox="0 0 80 68"
        width={width}
        height={h}
        fill="none"
        aria-hidden="true"
        focusable="false"
        className={styles.sheepSvg}
      >
        {/* ── Fluffy wool body (overlapping circles) ── */}
        <circle cx="40" cy="32" r="21" fill={wool}  />
        <circle cx="23" cy="29" r="14" fill={wollS} />
        <circle cx="33" cy="19" r="15" fill={wollS} />
        <circle cx="48" cy="18" r="14" fill={wollS} />
        <circle cx="57" cy="26" r="13" fill={wollS} />
        <circle cx="59" cy="37" r="11" fill={wollS} />

        {/* ── Head ── */}
        <ellipse cx="13" cy="37" rx="11" ry="10" fill={skin} />

        {/* ── Ear ── */}
        <ellipse cx="6" cy="30" rx="4" ry="6"
          fill="#B09070" transform="rotate(-18 6 30)" />

        {/* ── Eye ── */}
        <circle cx="10" cy="36" r="2.5" fill="#1A0F00" />
        <circle cx="11" cy="35" r="1"   fill="white"   />

        {/* ── Nose ── */}
        <ellipse cx="8" cy="43" rx="3.5" ry="2" fill="#A88068" />
        <circle cx="7"   cy="43" r="1" fill="#7A5848" />
        <circle cx="9.5" cy="43" r="1" fill="#7A5848" />

        {/* ── Legs ── */}
        <rect x="23" y="49" width="6" height="16" rx="3" fill={skin} />
        <rect x="33" y="49" width="6" height="16" rx="3" fill={skin} />
        <rect x="45" y="49" width="6" height="16" rx="3" fill={skin} />
        <rect x="55" y="49" width="6" height="16" rx="3" fill={skin} />

        {/* ── Hooves ── */}
        <rect x="23" y="62" width="6" height="5" rx="2" fill={dark} />
        <rect x="33" y="62" width="6" height="5" rx="2" fill={dark} />
        <rect x="45" y="62" width="6" height="5" rx="2" fill={dark} />
        <rect x="55" y="62" width="6" height="5" rx="2" fill={dark} />

        {/* ── Small tail ── */}
        <circle cx="62" cy="36" r="5" fill={wool} />
      </svg>
    </div>
  );
}

export default function EidAlAdhaEvent() {
  return (
    <div
      className={styles.overlay}
      style={{ '--ev-primary': PRIMARY, '--ev-secondary': SECONDARY, '--ev-glow': GLOW }}
    >
      {/* Background stars */}
      {STARS.map((s, i) => (
        <span key={i} className={styles.star}
          style={{ left: s.left, top: s.top, animationDelay: s.delay,
            width: `${s.size}px`, height: `${s.size}px` }} />
      ))}

      {/* Sun */}
      <Sun />

      {/* Sheep at the bottom */}
      {SHEEP_LIST.map((s, i) => (
        <div key={i} style={{ position: 'absolute', left: s.left, bottom: s.bottom }}>
          <Sheep width={s.width} delay={s.delay} />
        </div>
      ))}
    </div>
  );
}

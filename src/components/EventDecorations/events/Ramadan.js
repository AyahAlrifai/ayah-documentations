import React from 'react';
import styles from '../EventDecorations.module.css';

const PRIMARY   = '#FFD700';
const SECONDARY = '#FFA500';
const GLOW      = 'rgba(255, 215, 0, 0.28)';

const STARS = [
  { left: '5%',  top: '7%',  delay: '0s',    size: 2.5, sparkle: false },
  { left: '12%', top: '14%', delay: '0.45s', size: 2,   sparkle: false },
  { left: '22%', top: '6%',  delay: '1.2s',  size: 3,   sparkle: true  },
  { left: '33%', top: '20%', delay: '0.7s',  size: 2,   sparkle: false },
  { left: '44%', top: '11%', delay: '1.8s',  size: 2.5, sparkle: false },
  { left: '54%', top: '4%',  delay: '0.2s',  size: 2,   sparkle: false },
  { left: '64%', top: '17%', delay: '1.55s', size: 2,   sparkle: false },
  { left: '75%', top: '9%',  delay: '0.9s',  size: 3,   sparkle: true  },
  { left: '90%', top: '24%', delay: '1.1s',  size: 2,   sparkle: false },
  { left: '4%',  top: '37%', delay: '0.5s',  size: 2,   sparkle: false },
  { left: '17%', top: '48%', delay: '1.7s',  size: 2,   sparkle: false },
  { left: '38%', top: '55%', delay: '0.3s',  size: 2,   sparkle: false },
  { left: '53%', top: '42%', delay: '1.35s', size: 2.5, sparkle: false },
  { left: '68%', top: '60%', delay: '0.65s', size: 2,   sparkle: false },
  { left: '82%', top: '44%', delay: '1.9s',  size: 3,   sparkle: true  },
  { left: '96%', top: '57%', delay: '1.05s', size: 2,   sparkle: false },
  { left: '9%',  top: '72%', delay: '1.6s',  size: 2,   sparkle: false },
  { left: '30%', top: '82%', delay: '0.8s',  size: 2,   sparkle: false },
  { left: '60%', top: '76%', delay: '1.4s',  size: 3,   sparkle: true  },
  { left: '80%', top: '90%', delay: '0.15s', size: 2,   sparkle: false },
];

const FANOOS_LIST = [
  { left: '4%',  delay: '0s',    width: 38 },
  { left: '20%', delay: '0.7s',  width: 46 },
  { left: '77%', delay: '0.35s', width: 42 },
  { left: '93%', delay: '1.0s',  width: 34 },
];

function CrescentMoon() {
  return (
    <div className={styles.moonWrapper}>
      <svg
        viewBox="0 0 120 120"
        className={styles.moonSvg}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <mask id="ramadanMoonMask">
            <rect width="120" height="120" fill="white" />
            <circle cx="76" cy="44" r="44" fill="black" />
          </mask>
        </defs>
        <circle cx="52" cy="62" r="46" fill={PRIMARY} mask="url(#ramadanMoonMask)" />
      </svg>
    </div>
  );
}

function Fanoos({ width }) {
  const height = Math.round(width * (130 / 52));
  return (
    <svg
      viewBox="0 0 52 130"
      width={width}
      height={height}
      fill="none"
      aria-hidden="true"
      focusable="false"
      className={styles.fanoosSvg}
    >
      <line x1="26" y1="0" x2="26" y2="10"
        stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round" opacity="0.75" />
      <circle cx="26" cy="13" r="3.5"
        stroke={PRIMARY} strokeWidth="1.5" opacity="0.85" />
      <line x1="26" y1="16.5" x2="26" y2="21"
        stroke={PRIMARY} strokeWidth="1.5" opacity="0.75" />
      <path d="M10 21 L42 21 L37 31 L15 31 Z"
        fill={PRIMARY} opacity="0.9" />
      <path
        d="M10 21 L13 14 L16 21 L19.5 14 L23 21 L26 14 L29 21 L32.5 14 L36 21 L39 14 L42 21"
        stroke={PRIMARY} strokeWidth="1.5" strokeLinejoin="round"
        fill="none" opacity="0.78" />
      <path d="M15 31 L37 31 L43 92 L9 92 Z"
        fill="rgba(255,210,0,0.07)"
        stroke={PRIMARY} strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="20.5" y1="31" x2="17"   y2="92"
        stroke={PRIMARY} strokeWidth="0.8" opacity="0.32" />
      <line x1="26"   y1="31" x2="26"   y2="92"
        stroke={PRIMARY} strokeWidth="0.8" opacity="0.32" />
      <line x1="31.5" y1="31" x2="35"   y2="92"
        stroke={PRIMARY} strokeWidth="0.8" opacity="0.32" />
      <path d="M15.5 50 L36.5 50 L37.5 54 L14.5 54 Z"
        fill={SECONDARY} opacity="0.36" />
      <path d="M13.5 72 L38.5 72 L39.5 76 L12.5 76 Z"
        fill={SECONDARY} opacity="0.36" />
      <path
        d="M26 52 L27.8 58 L34 58 L29.1 61.8 L30.9 67.8 L26 64 L21.1 67.8 L22.9 61.8 L18 58 L24.2 58 Z"
        fill={PRIMARY} opacity="0.58" />
      <ellipse cx="26" cy="63" rx="9"   ry="15"
        fill="rgba(255,220,50,0.18)" className={styles.innerGlow} />
      <ellipse cx="26" cy="63" rx="4.5" ry="7.5"
        fill="rgba(255,240,110,0.28)" className={styles.innerGlow} />
      <path d="M9 92 L43 92 L38 102 L14 102 Z"
        fill={PRIMARY} opacity="0.9" />
      <circle cx="26" cy="105" r="3"
        stroke={PRIMARY} strokeWidth="1.5" opacity="0.75" />
      <line x1="26" y1="108" x2="26" y2="116"
        stroke={PRIMARY} strokeWidth="1.5" strokeLinecap="round" opacity="0.65" />
      <path d="M20 116 L26 124 L32 116 L26 112 Z"
        fill={PRIMARY} opacity="0.85" />
    </svg>
  );
}

export default function RamadanEvent() {
  return (
    <div
      className={styles.overlay}
      style={{ '--ev-primary': PRIMARY, '--ev-secondary': SECONDARY, '--ev-glow': GLOW }}
    >
      {STARS.map((s, i) =>
        s.sparkle ? (
          <span key={i} className={styles.starSparkle}
            style={{ left: s.left, top: s.top, animationDelay: s.delay }}>✦</span>
        ) : (
          <span key={i} className={styles.star}
            style={{ left: s.left, top: s.top, animationDelay: s.delay,
              width: `${s.size}px`, height: `${s.size}px` }} />
        )
      )}
      <CrescentMoon />
      {FANOOS_LIST.map((f, i) => (
        <div key={i} className={styles.fanoosWrap}
          style={{ left: f.left, animationDelay: f.delay, width: `${f.width}px` }}>
          <Fanoos width={f.width} />
        </div>
      ))}
    </div>
  );
}

import React from 'react';
import styles from '../EventDecorations.module.css';

/* ── Jordan Independence Day — May 25 ─────────────────────────
   Colors from the Jordanian flag
   ──────────────────────────────────────────────────────────── */
const RED   = '#CE1126';
const GREEN = '#007A3D';
const BLACK = '#1a1a1a';
const WHITE = '#f5f5f5';
const GLOW  = 'rgba(206, 17, 38, 0.32)';

/* 7-pointed star polygon points (viewBox 0 0 100 100) */
const STAR7 = '50,8 57.4,34.7 82.8,23.8 66.6,46.2 90.9,59.4 63.3,60.6 68.2,87.8 50,67 31.8,87.8 36.7,60.6 9.1,59.4 33.4,46.2 17.2,23.8 42.6,34.7';

/* Scattered stars across the overlay */
const STARS = [
  { left: '7%',  top: '10%', delay: '0s',    size: 22, color: RED   },
  { left: '18%', top: '22%', delay: '0.7s',  size: 16, color: WHITE },
  { left: '32%', top: '7%',  delay: '1.4s',  size: 20, color: GREEN },
  { left: '48%', top: '15%', delay: '0.3s',  size: 14, color: RED   },
  { left: '62%', top: '5%',  delay: '1.1s',  size: 18, color: WHITE },
  { left: '76%', top: '18%', delay: '0.6s',  size: 16, color: GREEN },
  { left: '88%', top: '10%', delay: '1.8s',  size: 20, color: RED   },
  { left: '10%', top: '50%', delay: '2.0s',  size: 13, color: WHITE },
  { left: '85%', top: '42%', delay: '0.9s',  size: 17, color: RED   },
  { left: '55%', top: '60%', delay: '1.6s',  size: 12, color: GREEN },
  { left: '25%', top: '70%', delay: '0.4s',  size: 14, color: WHITE },
  { left: '70%', top: '75%', delay: '1.3s',  size: 16, color: RED   },
];

function Star7({ size, color, style }) {
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <polygon points={STAR7} fill={color} />
    </svg>
  );
}

/* Jordanian flag SVG (simplified) */
function JordanFlag() {
  /* viewBox: 120 × 80  (3:2 ratio) */
  const starPts = '15,30 16.7,36.4 22.8,33.75 18.9,39.1 24.7,42.2 18.1,42.5 19.3,49 15,44 10.7,49 11.9,42.5 5.3,42.2 11.1,39.1 7.2,33.75 13.3,36.4';
  return (
    <svg
      viewBox="0 0 120 80"
      width="180"
      aria-label="Jordanian flag"
      focusable="false"
      className={styles.jordanFlagSvg}
    >
      {/* Three horizontal stripes */}
      <rect x="0" y="0"      width="120" height="26.7" fill={BLACK} />
      <rect x="0" y="26.7"   width="120" height="26.7" fill={WHITE} />
      <rect x="0" y="53.4"   width="120" height="26.6" fill={GREEN} />

      {/* Red triangle (hoist side) */}
      <polygon points="0,0 0,80 43,40" fill={RED} />

      {/* White 7-pointed star centered in red triangle */}
      <polygon points={starPts} fill={WHITE} />
    </svg>
  );
}

/* Stripe ribbon at the top (flag colors, under navbar) */
function FlagStripe() {
  return (
    <div className={styles.jordanStripe}>
      <div style={{ flex: 1, background: BLACK }} />
      <div style={{ flex: 1, background: WHITE }} />
      <div style={{ flex: 1, background: GREEN }} />
    </div>
  );
}

export default function JordanIndependenceDayEvent() {
  return (
    <div
      className={styles.overlay}
      style={{ '--ev-primary': RED, '--ev-secondary': GREEN, '--ev-glow': GLOW }}
    >
      {/* Thin stripe ribbon at top */}
      <FlagStripe />

      {/* Floating 7-pointed stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className={styles.jordanStarFloat}
          style={{ left: s.left, top: s.top, animationDelay: s.delay }}
        >
          <Star7 size={s.size} color={s.color} />
        </span>
      ))}

      {/* Jordanian flag in bottom-right */}
      <div className={styles.jordanFlagWrap}>
        <JordanFlag />
      </div>

      {/* Independence Day badge — bottom-left */}
      <div className={styles.jordanBadge}>
        <Star7 size={14} color={WHITE} style={{ marginRight: 6, flexShrink: 0 }} />
        Happy Independence Day, Jordan!
        <Star7 size={14} color={WHITE} style={{ marginLeft: 6, flexShrink: 0 }} />
      </div>
    </div>
  );
}

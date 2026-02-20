import React from 'react';
import styles from '../EventDecorations.module.css';

const PRIMARY   = '#C8A84B';   // warm gold
const SECONDARY = '#2E7D52';   // emerald green
const GLOW      = 'rgba(200, 168, 75, 0.32)';

// ── Twinkling dot stars ───────────────────────────────────────
const STARS = [
  { left: '6%',  top: '8%',  delay: '0s',    size: 2   },
  { left: '14%', top: '32%', delay: '0.6s',  size: 2.5 },
  { left: '26%', top: '10%', delay: '1.3s',  size: 2   },
  { left: '37%', top: '45%', delay: '0.4s',  size: 2   },
  { left: '49%', top: '28%', delay: '1.7s',  size: 2   },
  { left: '62%', top: '8%',  delay: '0.9s',  size: 2.5 },
  { left: '74%', top: '38%', delay: '0.2s',  size: 2   },
  { left: '85%', top: '14%', delay: '1.5s',  size: 2   },
  { left: '95%', top: '30%', delay: '0.7s',  size: 2.5 },
  { left: '3%',  top: '60%', delay: '1.1s',  size: 2   },
  { left: '20%', top: '70%', delay: '1.8s',  size: 2   },
  { left: '43%', top: '78%', delay: '0.3s',  size: 2   },
  { left: '67%', top: '65%', delay: '1.4s',  size: 2.5 },
  { left: '88%', top: '72%', delay: '0.8s',  size: 2   },
];

// ── Geometric ✦ stars (floating, rotating) ────────────────────
const GEOM_STARS = [
  { left: '8%',  top: '22%', delay: '0s',   size: '18px' },
  { left: '32%', top: '15%', delay: '0.8s', size: '14px' },
  { left: '58%', top: '18%', delay: '1.5s', size: '20px' },
  { left: '80%', top: '26%', delay: '0.4s', size: '16px' },
  { left: '18%', top: '55%', delay: '1.2s', size: '14px' },
  { left: '70%', top: '52%', delay: '0.6s', size: '18px' },
  { left: '46%', top: '68%', delay: '1.9s', size: '14px' },
];

// ── String light bulbs ─────────────────────────────────────────
const BULBS = [
  { left: '5%',  color: '#FFD700', delay: '0s'    },
  { left: '15%', color: '#FF6B6B', delay: '0.35s' },
  { left: '25%', color: '#4ECDC4', delay: '0.7s'  },
  { left: '35%', color: '#FFE66D', delay: '1.05s' },
  { left: '45%', color: '#C59FDB', delay: '1.4s'  },
  { left: '55%', color: '#FF8B94', delay: '0.2s'  },
  { left: '65%', color: '#4ECDC4', delay: '0.55s' },
  { left: '75%', color: '#A8E6CF', delay: '0.9s'  },
  { left: '85%', color: '#FFD700', delay: '1.25s' },
  { left: '95%', color: '#FF6B6B', delay: '1.6s'  },
];

// Compute 5-pointed star polygon points (SSR-safe, deterministic)
function fiveStar(cx, cy, R, r) {
  return Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI / 5) - Math.PI / 2;
    const rad = i % 2 === 0 ? R : r;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
}

function CrescentAndStar() {
  return (
    <div className={styles.eidMoonWrap}>
      <svg
        viewBox="0 0 160 110"
        className={styles.eidMoonSvg}
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <mask id="eidFitrMoonMask">
            <rect width="160" height="110" fill="white" />
            <circle cx="72" cy="46" r="42" fill="black" />
          </mask>
        </defs>
        {/* Crescent */}
        <circle cx="50" cy="58" r="44" fill={PRIMARY} mask="url(#eidFitrMoonMask)" />
        {/* 5-pointed star beside the crescent */}
        <polygon
          points={fiveStar(120, 46, 20, 8)}
          fill={PRIMARY}
        />
      </svg>
    </div>
  );
}

function StringLights() {
  return (
    <div className={styles.stringRow}>
      {BULBS.map((b, i) => (
        <div key={i} className={styles.bulbPost} style={{ left: b.left }}>
          <div className={styles.bulbWire} />
          <div
            className={styles.bulb}
            style={{
              background:  b.color,
              boxShadow:   `0 0 8px ${b.color}, 0 0 18px ${b.color}80`,
              animationDelay: b.delay,
            }}
          />
        </div>
      ))}
    </div>
  );
}

export default function EidAlFitrEvent() {
  return (
    <div
      className={styles.overlay}
      style={{ '--ev-primary': PRIMARY, '--ev-secondary': SECONDARY, '--ev-glow': GLOW }}
    >
      {/* Twinkling dot stars */}
      {STARS.map((s, i) => (
        <span key={i} className={styles.star}
          style={{ left: s.left, top: s.top, animationDelay: s.delay,
            width: `${s.size}px`, height: `${s.size}px` }} />
      ))}

      {/* Geometric floating stars */}
      {GEOM_STARS.map((s, i) => (
        <span key={i} className={styles.geomStar}
          style={{ left: s.left, top: s.top, animationDelay: s.delay, fontSize: s.size }}>
          ✦
        </span>
      ))}

      {/* String lights */}
      <StringLights />

      {/* Crescent moon + star */}
      <CrescentAndStar />
    </div>
  );
}

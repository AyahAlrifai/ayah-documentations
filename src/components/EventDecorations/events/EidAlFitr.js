import React from 'react';
import styles from '../EventDecorations.module.css';

const PRIMARY   = '#D4A820';   // vivid amber gold (matches reference image)
const SECONDARY = '#2E7D52';   // emerald green (kept for string lights)
const GLOW      = 'rgba(212, 168, 32, 0.35)';

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

function CoffeePotAndCup() {
  return (
    <div className={styles.dallahWrap}>
      <svg
        viewBox="0 0 220 145"
        className={styles.dallahSvg}
        role="img"
        aria-label="Arabic coffee pot and cup"
        focusable="false"
      >
        <defs>
          {/*
           * Single vivid amber-gold gradient across full viewBox.
           * Highlights are positioned at the dallah belly center (~x=68)
           * and the front cup center (~x=155), matching the reference image.
           */}
          <linearGradient id="efG" x1="0" y1="0" x2="220" y2="0" gradientUnits="userSpaceOnUse">
            <stop offset="0%"   stopColor="#6B4008" />
            <stop offset="12%"  stopColor="#C89020" />
            <stop offset="30%"  stopColor="#F8D850" />   {/* dallah belly */}
            <stop offset="50%"  stopColor="#D4A820" />
            <stop offset="65%"  stopColor="#9A6C14" />
            <stop offset="72%"  stopColor="#F0C838" />   {/* front cup */}
            <stop offset="86%"  stopColor="#D4A820" />
            <stop offset="100%" stopColor="#6B4008" />
          </linearGradient>
        </defs>

        {/* ═══════════════════════════════════════════════════
            DALLAH  —  shape matched to reference image:
              • wide spherical belly (lower 55%)
              • slight waist taper
              • shoulder flare before neck
              • tall narrow neck
              • dome lid + round ball finial
            ═══════════════════════════════════════════════════ */}

        {/* Ground shadow */}
        <ellipse cx="72" cy="142" rx="32" ry="4.5" fill="rgba(0,0,0,0.2)" />

        {/* Base foot ring */}
        <ellipse cx="72" cy="138" rx="20" ry="5.5" fill="url(#efG)" />
        <ellipse cx="72" cy="136" rx="15" ry="2.5" fill="rgba(255,255,255,0.14)" />

        {/* Body
         *  belly  ≈ 90 px wide  (x 30–120, center 75 → close to gradient peak x=66)
         *  waist  ≈ 58 px wide  (x 46–104)
         *  shoulder flare ≈ 70 px wide (x 40–110) — S-curve before neck
         *  neck   ≈ 22 px wide  (x 64–86)
         */}
        <path
          d="M 58,138
             C 34,132 28,110 30,93
             C 32,74  46,65  46,61
             C 40,57  42,51  64,45
             L 64,27
             L 86,27
             L 86,45
             C 108,51 110,57 104,61
             C 104,65 118,74 120,93
             C 122,110 116,132 92,138 Z"
          fill="url(#efG)"
        />

        {/* Left specular highlight */}
        <path
          d="M 32,114 C 28,97 32,79 46,67"
          stroke="rgba(255,255,255,0.29)" strokeWidth="13" fill="none" strokeLinecap="round"
        />
        {/* Right-edge shadow */}
        <path
          d="M 118,98 C 122,115 118,132 99,137"
          stroke="rgba(0,0,0,0.18)" strokeWidth="10" fill="none" strokeLinecap="round"
        />
        {/* Shoulder accent groove */}
        <path d="M 46,62 C 58,59 92,59 104,62"
          stroke="rgba(0,0,0,0.2)" strokeWidth="1.5" fill="none" />
        <path d="M 46,65 C 58,62 92,62 104,65"
          stroke="rgba(255,255,255,0.11)" strokeWidth="1" fill="none" />

        {/* Neck fill (bridges body to lid) */}
        <rect x="64" y="26" width="22" height="21" fill="url(#efG)" />

        {/* Lid collar ring */}
        <ellipse cx="75" cy="27" rx="16" ry="4" fill="url(#efG)" />

        {/* Lid dome */}
        <path d="M 59,27 C 59,9 91,9 91,27 Z" fill="url(#efG)" />
        {/* Lid dome specular */}
        <path
          d="M 63,27 C 62,14 73,7 81,11"
          stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="none" strokeLinecap="round"
        />

        {/* Finial collar */}
        <ellipse cx="75" cy="9" rx="7" ry="2" fill="url(#efG)" />
        {/* Finial ball (round, like reference image) */}
        <circle cx="75" cy="5" r="5.5" fill="url(#efG)" />
        <circle cx="73" cy="3.5" r="2.2" fill="rgba(255,255,255,0.48)" />

        {/* ── Decorative engraved circles on belly (matches reference image) ── */}
        <circle cx="63" cy="106" r="5.5"
          fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" />
        <circle cx="79" cy="97"  r="4.5"
          fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5" />
        <circle cx="68" cy="118" r="4"
          fill="none" stroke="rgba(0,0,0,0.15)" strokeWidth="1.5" />

        {/* ── SPOUT ──
             Origin: shoulder-left (~x=42, y=62)
             Arc: sweeps up-left to tip near lid level (~y=18)
             Tip: slight upward curl (like reference) */}
        <path
          d="M 42,62 C 18,52 6,34 10,18"
          stroke="url(#efG)" strokeWidth="11" fill="none" strokeLinecap="round"
        />
        <path
          d="M 42,62 C 18,52 6,34 10,18"
          stroke="rgba(0,0,0,0.22)" strokeWidth="5.5" fill="none" strokeLinecap="round"
        />
        <path
          d="M 41,60 C 18,50 7,33 11,19"
          stroke="rgba(255,255,255,0.22)" strokeWidth="3" fill="none" strokeLinecap="round"
        />
        {/* Spout tip — upward curl */}
        <path
          d="M 10,18 C 8,10 18,7 20,15"
          stroke="url(#efG)" strokeWidth="10" fill="none" strokeLinecap="round"
        />
        <path
          d="M 10,18 C 8,10 18,7 20,15"
          stroke="rgba(0,0,0,0.22)" strokeWidth="5" fill="none" strokeLinecap="round"
        />

        {/* ── HANDLE ──
             Upper attach: right shoulder area (~x=104, y=58)
             Lower attach: mid-belly right (~x=104, y=108)
             Moderate D-loop, consistent with reference image */}
        <path
          d="M 104,58 C 142,56 144,110 104,111"
          stroke="url(#efG)" strokeWidth="13" fill="none" strokeLinecap="round"
        />
        <path
          d="M 104,60 C 138,58 140,108 105,110"
          stroke="rgba(0,0,0,0.24)" strokeWidth="6" fill="none" strokeLinecap="round"
        />
        <path
          d="M 104,62 C 134,60 136,106 106,109"
          stroke="rgba(255,255,255,0.2)" strokeWidth="3.5" fill="none" strokeLinecap="round"
        />

        {/* Belly engraved bands */}
        <path d="M 33,108 C 55,104 97,104 117,108"
          stroke="rgba(255,255,255,0.14)" strokeWidth="1.5" fill="none" />
        <path d="M 32,114 C 55,110 97,110 116,114"
          stroke="rgba(0,0,0,0.12)" strokeWidth="1" fill="none" />

        {/* ═══════════════════════════════════════════════════
            TWO FINJAN CUPS  —  bowl-shaped (wider than tall),
            matching the reference image proportions.
            Cup 2 rendered first (it sits behind cup 1).
            ═══════════════════════════════════════════════════ */}

        {/* Cup 2 — back right */}
        <ellipse cx="189" cy="135" rx="17"  ry="4.5" fill="url(#efG)" />
        <path d="M 174,133 L 173,109 L 205,109 L 204,133 Z" fill="url(#efG)" />
        <path d="M 176,129 C 175,120 175,114 176,110"
          stroke="rgba(255,255,255,0.22)" strokeWidth="4.5" fill="none" strokeLinecap="round" />
        <path d="M 204,129 C 205,120 205,114 204,110"
          stroke="rgba(0,0,0,0.15)" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        <ellipse cx="189" cy="109" rx="16"  ry="4.5" fill="url(#efG)" />
        <ellipse cx="189" cy="109" rx="12.5" ry="3"   fill="#0E0400" opacity="0.82" />

        {/* Cup 1 — front left (larger / closer) */}
        <ellipse cx="157" cy="141" rx="20"  ry="5.5" fill="url(#efG)" />
        <path d="M 139,139 L 138,112 L 176,112 L 175,139 Z" fill="url(#efG)" />
        <path d="M 141,135 C 140,124 140,116 141,112"
          stroke="rgba(255,255,255,0.27)" strokeWidth="5.5" fill="none" strokeLinecap="round" />
        <path d="M 175,135 C 176,124 176,116 175,112"
          stroke="rgba(0,0,0,0.17)" strokeWidth="4" fill="none" strokeLinecap="round" />
        <ellipse cx="157" cy="112" rx="19"  ry="5.5" fill="url(#efG)" />
        <ellipse cx="157" cy="112" rx="15"  ry="3.8" fill="#0E0400" opacity="0.85" />

        {/* Steam wisps from front cup */}
        <path className={styles.steam1}
          d="M 150,106 C 148,99 151,93 149,86"
          stroke="#D4A820" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path className={styles.steam2}
          d="M 157,104 C 155,97 158,91 156,84"
          stroke="#D4A820" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path className={styles.steam3}
          d="M 164,106 C 162,99 165,93 163,86"
          stroke="#D4A820" strokeWidth="1.8" fill="none" strokeLinecap="round" />
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

      {/* Arabic coffee pot + cup */}
      <CoffeePotAndCup />
    </div>
  );
}

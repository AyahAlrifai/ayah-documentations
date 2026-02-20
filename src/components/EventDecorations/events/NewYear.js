import React from 'react';
import styles from '../EventDecorations.module.css';

const PRIMARY   = '#D8ECFF';   // ice blue
const SECONDARY = '#FFD700';   // gold (fireworks)
const GLOW      = 'rgba(200, 230, 255, 0.3)';

// ── Snowflakes (varied sizes, speeds, positions) ───────────────
const SNOWFLAKES = [
  { left: '3%',  delay: '0s',    size: '16px', duration: '8s'   },
  { left: '9%',  delay: '1.4s',  size: '11px', duration: '11s'  },
  { left: '16%', delay: '2.9s',  size: '18px', duration: '9s'   },
  { left: '22%', delay: '0.5s',  size: '10px', duration: '12s'  },
  { left: '29%', delay: '3.6s',  size: '14px', duration: '8.5s' },
  { left: '35%', delay: '1.9s',  size: '20px', duration: '10s'  },
  { left: '42%', delay: '4.3s',  size: '12px', duration: '9.5s' },
  { left: '49%', delay: '0.8s',  size: '17px', duration: '11s'  },
  { left: '56%', delay: '2.4s',  size: '10px', duration: '8s'   },
  { left: '63%', delay: '5.1s',  size: '19px', duration: '10s'  },
  { left: '70%', delay: '1.6s',  size: '13px', duration: '9s'   },
  { left: '77%', delay: '3.2s',  size: '22px', duration: '12s'  },
  { left: '84%', delay: '0.4s',  size: '11px', duration: '8.5s' },
  { left: '91%', delay: '4.6s',  size: '16px', duration: '10s'  },
  { left: '97%', delay: '2.1s',  size: '10px', duration: '11s'  },
];

// ── Firework bursts ───────────────────────────────────────────
const FIREWORKS = [
  { left: '14%', top: '16%', color: '#FFD700', delay: '0s',   duration: '2.2s' },
  { left: '40%', top: '10%', color: '#FF6B9D', delay: '1.1s', duration: '2.0s' },
  { left: '66%', top: '20%', color: '#5EC8E5', delay: '2.3s', duration: '2.4s' },
  { left: '86%', top: '13%', color: '#98FFB3', delay: '0.7s', duration: '1.9s' },
  { left: '28%', top: '35%', color: '#FFB347', delay: '1.8s', duration: '2.1s' },
  { left: '74%', top: '38%', color: '#E8A1FF', delay: '3.0s', duration: '2.3s' },
];

// ── Background silver stars ────────────────────────────────────
const STARS = [
  { left: '6%',  top: '55%', delay: '0s',    size: 2.5 },
  { left: '19%', top: '48%', delay: '0.8s',  size: 2   },
  { left: '38%', top: '62%', delay: '1.5s',  size: 2   },
  { left: '54%', top: '50%', delay: '0.3s',  size: 3   },
  { left: '72%', top: '58%', delay: '1.2s',  size: 2   },
  { left: '89%', top: '45%', delay: '0.6s',  size: 2.5 },
  { left: '10%', top: '78%', delay: '1.7s',  size: 2   },
  { left: '45%', top: '82%', delay: '0.9s',  size: 2   },
  { left: '80%', top: '76%', delay: '1.4s',  size: 2   },
];

export default function NewYearEvent() {
  return (
    <div
      className={styles.overlay}
      style={{ '--ev-primary': PRIMARY, '--ev-secondary': SECONDARY, '--ev-glow': GLOW }}
    >
      {/* Silver background stars */}
      {STARS.map((s, i) => (
        <span key={i} className={styles.star}
          style={{ left: s.left, top: s.top, animationDelay: s.delay,
            width: `${s.size}px`, height: `${s.size}px` }} />
      ))}

      {/* Falling snowflakes */}
      {SNOWFLAKES.map((s, i) => (
        <span
          key={i}
          className={styles.snowflake}
          style={{
            left:              s.left,
            fontSize:          s.size,
            animationDelay:    s.delay,
            animationDuration: s.duration,
          }}
        >
          ❄
        </span>
      ))}

      {/* Firework CSS bursts */}
      {FIREWORKS.map((f, i) => (
        <div
          key={i}
          className={styles.firework}
          style={{
            left:              f.left,
            top:               f.top,
            '--fw-color':      f.color,
            animationDelay:    f.delay,
            animationDuration: f.duration,
          }}
        />
      ))}
    </div>
  );
}

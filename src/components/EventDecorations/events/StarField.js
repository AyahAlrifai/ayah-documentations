import React from 'react';
import { useColorMode } from '@docusaurus/theme-common';
import styles from '../EventDecorations.module.css';

/* Mix of dot-stars and sparkle-stars spread across the viewport */
const STARS = [
  { left: '4%',  top: '8%',  delay: '0s',    size: 2,   sparkle: false },
  { left: '11%', top: '18%', delay: '0.6s',  size: 2.5, sparkle: false },
  { left: '19%', top: '5%',  delay: '1.3s',  size: 3,   sparkle: true  },
  { left: '27%', top: '22%', delay: '0.9s',  size: 2,   sparkle: false },
  { left: '35%', top: '10%', delay: '1.8s',  size: 2.5, sparkle: false },
  { left: '43%', top: '3%',  delay: '0.3s',  size: 2,   sparkle: false },
  { left: '52%', top: '16%', delay: '1.1s',  size: 3,   sparkle: true  },
  { left: '60%', top: '7%',  delay: '0.5s',  size: 2,   sparkle: false },
  { left: '68%', top: '20%', delay: '1.6s',  size: 2.5, sparkle: false },
  { left: '76%', top: '4%',  delay: '0.8s',  size: 3,   sparkle: true  },
  { left: '84%', top: '14%', delay: '1.4s',  size: 2,   sparkle: false },
  { left: '92%', top: '9%',  delay: '0.2s',  size: 2.5, sparkle: false },
  { left: '7%',  top: '38%', delay: '2.0s',  size: 2,   sparkle: false },
  { left: '16%', top: '50%', delay: '0.7s',  size: 2.5, sparkle: false },
  { left: '25%', top: '62%', delay: '1.5s',  size: 3,   sparkle: true  },
  { left: '38%', top: '45%', delay: '0.4s',  size: 2,   sparkle: false },
  { left: '48%', top: '55%', delay: '1.9s',  size: 2,   sparkle: false },
  { left: '57%', top: '38%', delay: '0.1s',  size: 3,   sparkle: true  },
  { left: '66%', top: '58%', delay: '1.2s',  size: 2.5, sparkle: false },
  { left: '74%', top: '42%', delay: '0.6s',  size: 2,   sparkle: false },
  { left: '82%', top: '52%', delay: '1.7s',  size: 3,   sparkle: true  },
  { left: '93%', top: '36%', delay: '0.9s',  size: 2,   sparkle: false },
  { left: '3%',  top: '72%', delay: '1.0s',  size: 2.5, sparkle: false },
  { left: '20%', top: '80%', delay: '0.3s',  size: 2,   sparkle: false },
  { left: '33%', top: '75%', delay: '1.6s',  size: 3,   sparkle: true  },
  { left: '50%', top: '85%', delay: '0.8s',  size: 2,   sparkle: false },
  { left: '64%', top: '78%', delay: '1.3s',  size: 2.5, sparkle: false },
  { left: '79%', top: '88%', delay: '0.5s',  size: 3,   sparkle: true  },
  { left: '90%', top: '70%', delay: '1.1s',  size: 2,   sparkle: false },
  { left: '97%', top: '82%', delay: '2.2s',  size: 2.5, sparkle: false },
];

export default function StarFieldEvent() {
  const { colorMode } = useColorMode();
  const isLight = colorMode === 'light';
  const primary = isLight ? '#f59e0b' : '#ffffff';
  const glow    = isLight ? 'rgba(245, 158, 11, 0.3)' : 'rgba(255, 255, 255, 0.25)';

  return (
    <div
      className={styles.overlay}
      style={{ '--ev-primary': primary, '--ev-secondary': '#c4d4ff', '--ev-glow': glow }}
    >
      {STARS.map((s, i) =>
        s.sparkle ? (
          <span
            key={i}
            className={styles.starSparkle}
            style={{ left: s.left, top: s.top, animationDelay: s.delay }}
          >
            ✦
          </span>
        ) : (
          <span
            key={i}
            className={styles.star}
            style={{
              left: s.left,
              top: s.top,
              animationDelay: s.delay,
              width: `${s.size}px`,
              height: `${s.size}px`,
            }}
          />
        )
      )}
    </div>
  );
}

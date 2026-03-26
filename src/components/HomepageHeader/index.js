import React, { useState, useEffect, useRef } from 'react';
import Link from '@docusaurus/Link';
import { useColorMode } from '@docusaurus/theme-common';
import styles from '../../css/style.module.css';

const TECH_CHIPS = [
  { name: 'Angular', color: '#fc7dc7', delay: '0s', duration: '4.2s', top: '5%', left: '10%' },
  { name: 'Java', color: '#fb923c', delay: '0.7s', duration: '3.8s', top: '2%', left: '45%' },
  { name: 'Spring', color: '#4ade80', delay: '1.4s', duration: '4.6s', top: '14%', left: '72%' },
  { name: 'SQL', color: '#60a5fa', delay: '0.3s', duration: '3.5s', top: '46%', left: '83%' },
  { name: 'Redis', color: '#fc7dc7', delay: '1.8s', duration: '4.0s', top: '75%', left: '65%' },
  { name: 'RabbitMQ', color: '#fbbf24', delay: '0.9s', duration: '5.0s', top: '83%', left: '28%' },
  { name: 'Swagger', color: '#34d399', delay: '2.1s', duration: '3.6s', top: '66%', left: '5%' },
  { name: 'Markdown', color: '#a78bfa', delay: '1.5s', duration: '4.4s', top: '38%', left: '1%' },
];

function TypeWriter({ text, startDelay = 700 }) {
  const [displayed, setDisplayed] = useState('');
  const idx = useRef(0);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    const t = setTimeout(() => {
      const id = setInterval(() => {
        idx.current += 1;
        setDisplayed(text.slice(0, idx.current));
        if (idx.current >= text.length) { clearInterval(id); done.current = true; }
      }, 28);
      return () => clearInterval(id);
    }, startDelay);
    return () => clearTimeout(t);
  }, [text, startDelay]);

  return (
    <>
      {displayed}
      {!done.current && <span className={styles.typeCursor} />}
    </>
  );
}

export default function HomepageHeader({ siteConfig }) {
  const { colorMode } = useColorMode();
  const logoSrc = colorMode === 'dark'
    ? '/img/logo-3-orbit-dark.svg'
    : '/img/logo-3-orbit.svg';

  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroGrid} aria-hidden="true" />

      <div className={styles.heroSplit}>

        {/* ── LEFT — text content ── */}
        <div className={styles.heroLeft}>

          <span className={styles.heroLabel}>
            <span className={styles.heroDot} aria-hidden="true" />
            Developer Reference &amp; Toolbox
          </span>

          <h1 className={styles.heroTitle}>
            <span className={styles.heroTitleTop}>Code smarter,</span>
            <span className={styles.heroTitleBottom}>ship faster.</span>
          </h1>

          <p className={styles.heroSubtitle}>
            <TypeWriter text={siteConfig.tagline} startDelay={700} />
          </p>

          {/* <div className={styles.heroButtons}>
            <Link className={styles.btnPrimary} to="/docs/multiExecPro">
              ✦ Explore Docs <span className={styles.btnArrow}>→</span>
            </Link>
            <Link className={styles.btnLink} to="apiDocumentationGenerator">
              Try the Tools <span>→</span>
            </Link>
          </div> */}

          <div className={styles.heroTechRow}>
            {['API Doc', 'JWT Decoder', 'Regex Tester', 'SQL Formatter', 'JSON Formatter', 'Markdown Viwer'].map(t => (
              <span key={t} className={styles.heroTechTag}>{t}</span>
            ))}
          </div>
        </div>

        {/* ── RIGHT — animated visual ── */}
        <div className={styles.heroRight} aria-hidden="true">
          <div className={styles.heroVisual}>

            {/* Pulsing glow behind logo */}
            <div className={styles.heroLogoPulse} />

            {/* Orbit logo */}
            <img src={logoSrc} alt="" className={styles.heroLogo} />

            {/* Floating tech chips */}
            {TECH_CHIPS.map(chip => (
              <span
                key={chip.name}
                className={styles.heroChip}
                style={{
                  top: chip.top,
                  left: chip.left,
                  color: chip.color,
                  '--chip-delay': chip.delay,
                  '--chip-duration': chip.duration,
                }}
              >
                {chip.name}
              </span>
            ))}

          </div>
        </div>

      </div>
    </header>
  );
}

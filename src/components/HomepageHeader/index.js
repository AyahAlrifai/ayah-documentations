import React from 'react';
import Link from '@docusaurus/Link';
import styles from '../../css/style.module.css';

export default function HomepageHeader({ siteConfig }) {
  return (
    <header className={styles.heroBanner}>
      <div className={styles.heroGlow} aria-hidden="true" />
      <div className={styles.heroGrid} aria-hidden="true" />

      <div className={styles.heroContent}>
        <span className={styles.heroLabel}>Developer Documentation &amp; Tools</span>

        <h1 className={styles.heroTitle}>{siteConfig.title}</h1>

        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>

        <div className={styles.heroButtons}>
          {/* Primary CTA — animated gradient with sweeping shimmer */}
          <Link className={styles.btnPrimary} to="/docs/multiExecPro">
            ✦ Explore Docs <span className={styles.btnArrow}>→</span>
          </Link>

          {/* Secondary — text link with animated underline */}
          <Link className={styles.btnLink} to="/json-formatter">
            Try the Tools <span>→</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

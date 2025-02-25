import React from 'react';
import clsx from 'clsx';
import styles from '../../css/style.module.css';
import Link from '@docusaurus/Link';

export default function HomepageHeader(prop) {
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div className={styles.uCenterText+" "+styles.uMarginBottom1 }>
          <h2 className={styles.headeringSecondary}>
            {prop.siteConfig.title}
          </h2>
        </div>
        <p className="hero__subtitle">{prop.siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className={styles.btn + " " + styles.colorBtn}
            to="/docs/multiExecPro">
            Begin Your Journey
          </Link>
        </div>
      </div>
    </header>
  );
}

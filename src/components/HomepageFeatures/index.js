import React, { useState, useEffect, useRef } from 'react';
import styles from '../../css/style.module.css';

const features = [
  {
    icon: '📚',
    gradient: 'linear-gradient(135deg, rgba(82,141,255,0.18), rgba(82,141,255,0.06))',
    accent: '#528dff',
    title: 'Rich Documentation',
    description:
      '11+ technology topics — Angular, SQL, Java/Spring, RabbitMQ, Redis, AOP, Camunda, Swagger, and more — all structured and searchable.',
  },
  {
    icon: '🛠️',
    gradient: 'linear-gradient(135deg, rgba(68,187,8,0.18), rgba(68,187,8,0.06))',
    accent: '#44bb08',
    title: 'Interactive Tools',
    description:
      'JSON Formatter, Markdown Editor with live preview, and an API Documentation Generator — powerful utilities that run entirely in your browser.',
  },
  {
    icon: '🤖',
    gradient: 'linear-gradient(135deg, rgba(156,2,92,0.18), rgba(156,2,92,0.06))',
    accent: '#fc7dc7',
    title: 'AI-Powered REST Adapter',
    description:
      'Smart REST Adapter backed by N8N workflow automation — format, map, and test your API requests with the help of an AI agent.',
  },
  {
    icon: '⚡',
    gradient: 'linear-gradient(135deg, rgba(214,196,1,0.18), rgba(214,196,1,0.06))',
    accent: '#e8c246',
    title: 'Learn by Doing',
    description:
      'Hands-on Monaco code editors, real-time markdown preview, and visual SQL execution flow diagrams that make concepts click.',
  },
];

const stats = [
  { end: 11, suffix: '+', label: 'Technology Topics' },
  { end: 4,  suffix: '',  label: 'Developer Tools' },
  { end: 100, suffix: '%', label: 'Free to Use' },
  { special: '∞', label: 'Things to Learn' },
];

function CountUp({ end, suffix }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const animated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !animated.current) {
          animated.current = true;
          const duration = 1600;
          const startTime = performance.now();
          const step = (now) => {
            const progress = Math.min((now - startTime) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end]);

  return (
    <span ref={ref} className={styles.statNumber}>
      {count}{suffix}
    </span>
  );
}

function FeatureCard({ icon, gradient, accent, title, description }) {
  return (
    <div
      className={styles.featureCard}
      style={{ '--card-accent': accent }}
    >
      <div className={styles.featureIcon} style={{ background: gradient }}>
        <span role="img" aria-label={title}>{icon}</span>
      </div>
      <h3 className={styles.featureCardTitle}>{title}</h3>
      <p className={styles.featureCardDesc}>{description}</p>
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.featuresSection}>
      <div className={styles.sectionHeader}>
        <span className={styles.sectionLabel}>What We Offer</span>
        <h2 className={styles.sectionTitle}>Everything you need to level&nbsp;up</h2>
        <p className={styles.sectionSubtitle}>
          A comprehensive platform combining structured documentation with
          interactive developer tools.
        </p>
      </div>

      <div className={styles.featureGrid}>
        {features.map((f, i) => (
          <FeatureCard key={i} {...f} />
        ))}
      </div>

      <div className={styles.statsRow}>
        {stats.map((s, i) => (
          <div key={i} className={styles.statItem}>
            {s.special ? (
              <span className={`${styles.statNumber} ${styles.statInfinity}`}>
                {s.special}
              </span>
            ) : (
              <CountUp end={s.end} suffix={s.suffix} />
            )}
            <span className={styles.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

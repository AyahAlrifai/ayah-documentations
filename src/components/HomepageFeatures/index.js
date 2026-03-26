import React, { useState, useEffect, useRef } from 'react';
import styles from '../../css/style.module.css';
import { db } from '../../config/firebase';
import { ref, runTransaction, onValue } from 'firebase/database';

const features = [
  {
    icon: '📚',
    gradient: 'linear-gradient(135deg, rgba(82,141,255,0.18), rgba(82,141,255,0.06))',
    accent: '#fc7dc7',
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
  // {
  //   icon: '🤖',
  //   gradient: 'linear-gradient(135deg, rgba(156,2,92,0.18), rgba(156,2,92,0.06))',
  //   accent: '#fc7dc7',
  //   title: 'AI-Powered REST Adapter',
  //   description:
  //     'Smart REST Adapter backed by N8N workflow automation — format, map, and test your API requests with the help of an AI agent.',
  // },
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
  { end: 8, suffix: '', label: 'Developer Tools' },
  { end: 100, suffix: '%', label: 'Free to Use' },
  { special: '∞', label: 'Things to Learn' },
];

function VisitorCount() {
  const [target, setTarget] = useState(null);
  const [count, setCount] = useState(0);
  const animated = useRef(false);
  const spanRef = useRef(null);

  useEffect(() => {
    const counterRef = ref(db, 'visits');
    runTransaction(counterRef, (current) => (current ?? 0) + 1)
      .then(() => onValue(counterRef, (snap) => setTarget(snap.val()), { onlyOnce: true }))
      .catch(() => setTarget(0));
  }, []);

  useEffect(() => {
    if (target === null || animated.current) return;
    const el = spanRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        animated.current = true;
        const duration = 1600;
        const start = performance.now();
        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * target));
          if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      }
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={spanRef} className={styles.statNumber}>{count.toLocaleString()}</span>;
}

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

const featuredTools = [
  {
    icon: '/img/icons/http.svg',
    title: 'HTTP Status Codes',
    description: '60 codes across all 5 classes — searchable, filterable reference with descriptions and developer tags.',
    to: '/http-status-codes',
    color: '#528dff',
    glow: 'rgba(82,141,255,0.18)',
    tag: 'Reference',
  },
  {
    icon: '/img/icons/jwt.svg',
    title: 'JWT Decoder',
    description: 'Decode and inspect JWT tokens instantly in your browser. Visualises header, payload, and signature separately.',
    to: '/jwt-decoder',
    color: '#c77dff',
    glow: 'rgba(199,125,255,0.18)',
    tag: 'Security',
  },
  {
    icon: '/img/icons/spring.svg',
    title: 'Spring Boot Annotations',
    description: '52 annotations across 7 categories — searchable, filterable cheat sheet for your daily Spring Boot work.',
    to: '/spring-boot-annotations',
    color: '#528dff',
    glow: 'rgba(82,141,255,0.18)',
    tag: 'Cheat Sheet',
  },
  {
    icon: '/img/icons/api.svg',
    title: 'API Doc Generator',
    description: 'Paste Spring Boot controller code and get a complete, structured API doc ready to copy as Markdown or HTML.',
    to: '/apiDocumentationGenerator',
    color: '#c77dff',
    glow: 'rgba(199,125,255,0.18)',
    tag: 'Generator',
  },
];

function FeaturedToolCard({ icon, title, description, to, color, glow, tag, index }) {
  const cardRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const num = String(index + 1).padStart(2, '0');

  return (
    <a
      ref={cardRef}
      href={to}
      style={{
        display: 'flex', flexDirection: 'column',
        borderRadius: '20px', textDecoration: 'none', overflow: 'hidden',
        border: `1px solid ${hovered ? color + '55' : 'rgba(255,255,255,0.07)'}`,
        background: hovered
          ? `linear-gradient(160deg, ${glow} 0%, transparent 55%)`
          : 'rgba(255,255,255,0.03)',
        boxShadow: hovered ? `0 20px 48px ${glow}, 0 0 0 1px ${color}22` : 'none',
        transform: visible
          ? (hovered ? 'translateY(-6px)' : 'translateY(0)')
          : 'translateY(32px)',
        opacity: visible ? 1 : 0,
        transition: `opacity 0.55s ease ${index * 0.1}s, transform 0.55s ease ${index * 0.1}s, box-shadow 0.25s ease, border-color 0.25s ease, background 0.25s ease`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent strip */}
      <div style={{
        height: 3,
        background: `linear-gradient(90deg, ${color}, ${color}44)`,
        opacity: hovered ? 1 : 0,
        transition: 'opacity 0.25s ease',
      }} />

      {/* Card body */}
      <div style={{ padding: 'clamp(1rem, 4vw, 1.6rem) clamp(0.9rem, 4vw, 1.5rem) clamp(0.9rem, 4vw, 1.4rem)', display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>

        {/* Icon row + number */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div style={{
            width: 48, height: 48, borderRadius: 14, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            background: glow,
            border: `1px solid ${color}30`,
            boxShadow: hovered ? `0 0 20px ${glow}` : 'none',
            transition: 'box-shadow 0.25s ease',
          }}>
            <img src={icon} alt={title} style={{ width: 26, height: 26 }} />
          </div>
          <span style={{
            fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.12em',
            color: color, opacity: 0.6, fontFamily: 'Consolas, monospace',
            paddingTop: '2px',
          }}>{num}</span>
        </div>

        {/* Tag */}
        <span style={{
          alignSelf: 'flex-start',
          fontSize: '0.66rem', fontWeight: 700, letterSpacing: '0.1em',
          textTransform: 'uppercase', padding: '0.18rem 0.6rem', borderRadius: 999,
          background: `${color}18`, color, border: `1px solid ${color}30`,
        }}>{tag}</span>

        {/* Text */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', flex: 1 }}>
          <strong style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--ifm-font-color-base)', lineHeight: 1.3 }}>
            {title}
          </strong>
          <p style={{ margin: 0, fontSize: '0.84rem', lineHeight: 1.7, color: 'var(--ifm-color-emphasis-600)' }}>
            {description}
          </p>
        </div>

        {/* CTA */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.35rem',
          fontSize: '0.83rem', fontWeight: 700, color,
          marginTop: 'auto',
        }}>
          Open tool
          <span style={{
            display: 'inline-block',
            transform: hovered ? 'translateX(5px)' : 'translateX(0)',
            transition: 'transform 0.22s ease',
          }}>→</span>
        </div>

      </div>
    </a>
  );
}

function FeaturedToolsGrid() {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))',
      gap: '1.25rem',
      maxWidth: '1080px',
      margin: '0 auto',
      width: '100%',
    }}>
      {featuredTools.map((t, i) => (
        <FeaturedToolCard key={i} {...t} index={i} />
      ))}
    </div>
  );
}

export default function HomepageFeatures() {
  return (
    <section className={styles.featuresSection}>
      {/* <div className={styles.sectionHeader}>
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
      </div> */}

      {/* Featured Tools */}
      <div>
        <div className={styles.sectionHeader} style={{ marginBottom: '2rem' }}>
          <span className={styles.sectionLabel}>Try Now</span>
          <h2 className={styles.sectionTitle}>Featured Tools</h2>
        </div>
        <FeaturedToolsGrid />
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
        <div className={styles.statItem}>
          <VisitorCount />
          <span className={styles.statLabel}>Total Visits</span>
        </div>
      </div>
    </section>
  );
}

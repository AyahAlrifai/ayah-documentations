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
  { end: 6, suffix: '', label: 'Developer Tools' },
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
    icon: '/img/icons/api.svg',
    title: 'API Doc Generator',
    description: 'Paste Spring Boot annotations and get a complete, structured API documentation — ready to copy as Markdown or HTML.',
    to: '/apiDocumentationGenerator',
    color: '#528dff',
    bg: 'rgba(82,141,255,0.08)',
  },
  {
    icon: '/img/icons/jwt.svg',
    title: 'JWT Decoder',
    description: 'Decode and inspect JWT tokens instantly in your browser. Supports HS256, RS256, ES256 and all standard JWT formats.',
    to: '/jwt-decoder',
    color: '#c77dff',
    bg: 'rgba(199,125,255,0.08)',
  },
  {
    icon: '/img/icons/regex.svg',
    title: 'Regex Tester',
    description: 'Test and debug regular expressions live with match highlighting, group capture display, and flag controls.',
    to: '/regex-tester',
    color: '#f97316',
    bg: 'rgba(249,115,22,0.08)',
  },
  {
    icon: '/img/icons/json.svg',
    title: 'JSON Formatter',
    description: 'Format, minify, and diff JSON instantly in your browser. Built-in Monaco editor with syntax highlighting.',
    to: '/json-formatter',
    color: '#44bb08',
    bg: 'rgba(68,187,8,0.08)',
  },
  {
    icon: '/img/icons/markdown.svg',
    title: 'Markdown Editor',
    description: 'Write Markdown with a live side-by-side preview. Export to HTML or copy the rendered output directly.',
    to: '/create-new-document',
    color: '#06b6d4',
    bg: 'rgba(6,182,212,0.08)',
  },
  {
    icon: '/img/icons/sql.svg',
    title: 'SQL Formatter',
    description: 'Beautify raw SQL queries with proper indentation and uppercase keywords — supports all major SQL dialects.',
    to: '/sql-formatter',
    color: '#e8c246',
    bg: 'rgba(232,194,70,0.08)',
  },
  {
    icon: '/img/icons/spring.svg',
    title: 'Spring Boot Annotations',
    description: '52 annotations across 7 categories — searchable, filterable cheat sheet you can use as a daily reference.',
    to: '/spring-boot-annotations',
    color: '#fc7dc7',
    bg: 'rgba(252,125,199,0.08)',
  },
  {
    icon: '/img/icons/http.svg',
    title: 'HTTP Status Codes',
    description: '60 status codes across all 5 classes — searchable, filterable reference with descriptions and tags for every code.',
    to: '/http-status-codes',
    color: '#ef4444',
    bg: 'rgba(239,68,68,0.08)',
  },
];

function FeaturedToolCard({ icon, title, description, to, color, bg }) {
  return (
    <a
      href={to}
      style={{
        display: 'flex', flexDirection: 'column', gap: '0.75rem',
        padding: '1.5rem', borderRadius: '16px', textDecoration: 'none',
        background: bg, border: `1px solid ${color}30`,
        transition: 'transform 0.2s, box-shadow 0.2s',
        height: '100%',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 12px 32px ${color}25`; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <img src={icon} alt={title} style={{ width: 36, height: 36 }} />
      <strong style={{ fontSize: '1.05rem', color }}>{title}</strong>
      <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: 1.65, opacity: 0.75 }}>{description}</p>
      <span style={{ fontSize: '0.82rem', color, fontWeight: 600 }}>Open tool →</span>
    </a>
  );
}

const VISIBLE = 4;
const TOTAL_PAGES = Math.ceil(featuredTools.length / VISIBLE);

function ToolsCarousel() {
  const [page, setPage] = useState(0);
  const trackRef = useRef(null);

  const scrollToPage = (p) => {
    const clamped = Math.max(0, Math.min(p, TOTAL_PAGES - 1));
    setPage(clamped);
    if (trackRef.current) {
      const cardW = trackRef.current.scrollWidth / featuredTools.length;
      trackRef.current.scrollTo({ left: clamped * VISIBLE * cardW, behavior: 'smooth' });
    }
  };

  // sync dot indicator when user swipes manually
  const onScroll = () => {
    if (!trackRef.current) return;
    const cardW = trackRef.current.scrollWidth / featuredTools.length;
    const newPage = Math.round(trackRef.current.scrollLeft / (VISIBLE * cardW));
    setPage(Math.max(0, Math.min(newPage, TOTAL_PAGES - 1)));
  };

  return (
    <div style={{ position: 'relative', maxWidth: '1080px', margin: '0 auto' }}>

      {/* ── Arrow: prev ── */}
      <button
        onClick={() => scrollToPage(page - 1)}
        disabled={page === 0}
        aria-label="Previous"
        style={{
          position: 'absolute', left: -48, top: '50%', transform: 'translateY(-50%)',
          zIndex: 2, width: 36, height: 36, borderRadius: '50%',
          border: '1.5px solid rgba(82,141,255,0.35)',
          background: 'rgba(82,141,255,0.1)',
          color: page === 0 ? 'rgba(82,141,255,0.25)' : '#528dff',
          cursor: page === 0 ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', transition: 'all 0.15s',
          borderColor: page === 0 ? 'rgba(82,141,255,0.15)' : 'rgba(82,141,255,0.35)',
        }}
      >‹</button>

      {/* ── Arrow: next ── */}
      <button
        onClick={() => scrollToPage(page + 1)}
        disabled={page === TOTAL_PAGES - 1}
        aria-label="Next"
        style={{
          position: 'absolute', right: -48, top: '50%', transform: 'translateY(-50%)',
          zIndex: 2, width: 36, height: 36, borderRadius: '50%',
          border: '1.5px solid rgba(82,141,255,0.35)',
          background: 'rgba(82,141,255,0.1)',
          color: page === TOTAL_PAGES - 1 ? 'rgba(82,141,255,0.25)' : '#528dff',
          cursor: page === TOTAL_PAGES - 1 ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1rem', transition: 'all 0.15s',
          borderColor: page === TOTAL_PAGES - 1 ? 'rgba(82,141,255,0.15)' : 'rgba(82,141,255,0.35)',
        }}
      >›</button>

      {/* ── Track ── */}
      <div
        ref={trackRef}
        onScroll={onScroll}
        style={{
          display: 'flex', gap: '1.25rem',
          overflowX: 'auto', scrollSnapType: 'x mandatory',
          WebkitOverflowScrolling: 'touch',
          msOverflowStyle: 'none', scrollbarWidth: 'none',
          paddingBottom: '0.25rem',
        }}
      >
        {featuredTools.map((t, i) => (
          <div key={i} style={{
            scrollSnapAlign: 'start',
            flex: '0 0 calc(25% - 0.94rem)',
            minWidth: 0,
          }}>
            <FeaturedToolCard {...t} />
          </div>
        ))}
      </div>

      {/* ── Dot indicators ── */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.45rem', marginTop: '1.25rem' }}>
        {Array.from({ length: TOTAL_PAGES }).map((_, i) => (
          <button
            key={i}
            onClick={() => scrollToPage(i)}
            aria-label={`Go to page ${i + 1}`}
            style={{
              width: i === page ? 20 : 8, height: 8,
              borderRadius: 999, border: 'none', padding: 0,
              cursor: 'pointer', transition: 'all 0.2s',
              background: i === page ? '#528dff' : 'rgba(82,141,255,0.25)',
            }}
          />
        ))}
      </div>

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
        <ToolsCarousel />
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

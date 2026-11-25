import React, { useEffect, useRef, useState } from 'react';
import Layout from '@theme/Layout';
import Head from '@docusaurus/Head';
import styles from './intro.module.css';

/*
 * Scroll version of the AyahIntro video (D:\ayah-videos).
 * The wording mirrors `defaultProps` in D:\ayah-videos\src\Root.tsx — keep them in sync.
 */
const CONTENT = {
  intro: {
    terminalCommand: 'whoami',
    loadingText: 'loading profile',
    greeting: "> hello world, I'm",
  },
  profile: {
    firstName: 'AYAH',
    lastName: 'ALREFAI',
    role: 'Senior Backend Engineer',
    focus: ['Software Architecture', 'Platform Engineering', 'Technical Leadership'],
    location: 'Jordan',
  },
  stats: {
    kicker: 'BY THE NUMBERS',
    headline: 'Impact, measured.',
    watermark: 'IMPACT',
    items: [
      { value: 6, suffix: '+', decimals: 0, label: 'Years building', sub: 'enterprise systems' },
      { value: 17, suffix: '+', decimals: 0, label: 'Microservices', sub: 'in production' },
      { value: 8, suffix: '', decimals: 0, label: 'Engineers', sub: 'mentored & grown' },
      { value: 3.93, suffix: '', decimals: 2, label: 'GPA', sub: 'Computer Engineering' },
    ],
  },
  platform: {
    kicker: 'PLATFORM',
    headline: 'From 3 to',
    startCount: 3,
    endCount: 17,
    body: 'production microservices powering one enterprise platform',
    hubLabel: 'SHARED LIBRARIES',
    domains: [
      'Workflow Engine',
      'Notifications',
      'Audit Trail',
      'Reporting',
      'User Management',
      'License Management',
      'Identity & Access',
      'Multi-tenancy',
      'Knowledge Base',
      'Admin Settings',
      'REST & SOAP Adapters',
      'Centralized Logging',
    ],
    libraries: ['EBP Common Library', 'Digi Enterprise Adapter', 'Digi Logger'],
  },
  stack: {
    kicker: 'THE STACK',
    headline: 'Deep in the backend.',
    coreTitle: '</>',
    coreSubtitle: 'Backend',
    innerRing: ['Java', 'Spring Boot', 'Spring Security', 'Hibernate', 'JPA'],
    middleRing: ['Microservices', 'RabbitMQ', 'Redis', 'Camunda BPM', 'Keycloak', 'OAuth2 · JWT'],
    outerRing: ['PostgreSQL', 'Oracle', 'Docker', 'SonarQube', 'JUnit', 'Swagger', 'React', 'Angular'],
  },
  ai: {
    kicker: 'AI-NATIVE DELIVERY',
    headline: 'My AI plugin runs our delivery flow.',
    tags: ['Claude Code', 'Skills', 'MCP servers', 'Hooks'],
    flow: ['Story analysis', 'Task descriptions', 'Start dev', 'Unit tests', 'API examples', 'Code review', 'Docs & user guides', 'Commit', 'Ship'],
    builds: [
      { name: 'Laqta', desc: 'Screenshot + voice → a fully described Jira bug', color: 'pink' },
      { name: 'Microservice Generator', desc: 'Spring Boot services, generated in one click', color: 'blue' },
      { name: 'MultiExec Pro', desc: 'One command across every microservice', color: 'green' },
    ],
  },
  journey: {
    kicker: 'THE JOURNEY',
    headline: 'Every role, a level up.',
    milestones: [
      { year: 'B.Sc.', company: 'JUST', role: 'Computer Engineering', note: 'GPA 3.93 · Excellent', color: 'green', current: false },
      { year: '2020', company: 'Second Step', role: 'Software Developer', note: 'Education & government systems', color: 'yellow', current: false },
      { year: '2022', company: 'BluLogix', role: 'Full Stack Developer II', note: 'US telecom e-commerce', color: 'blue', current: false },
      { year: '2023', company: 'Digitinary', role: 'Senior Backend Engineer', note: 'Building an enterprise platform', color: 'pink', current: true },
    ],
  },
  certs: {
    kicker: 'ALWAYS LEARNING',
    headline: 'Certified & curious.',
    items: [
      { issuer: 'Oracle', name: 'Certified Associate · Java SE 8', color: 'yellow' },
      { issuer: 'Anthropic', name: 'Claude Code in Action', color: 'pink' },
      { issuer: 'Anthropic', name: 'Claude Code 101', color: 'pink' },
      { issuer: 'Anthropic', name: 'Claude 101', color: 'pink' },
      { issuer: 'Anthropic', name: 'AI Capabilities & Limitations', color: 'pink' },
      { issuer: 'Anthropic', name: 'AI Fluency', color: 'pink' },
      { issuer: 'Google', name: 'AI Fundamentals', color: 'blue' },
      { issuer: 'Postman', name: 'API Fundamentals Student Expert', color: 'green' },
    ],
  },
  outro: {
    line1: "I don't just write code.",
    line2: 'I build platforms.',
    cta: "Let's build what's next.",
    footnote: 'Off-screen: PADI certified diver',
  },
};

// CSS variables (defined in intro.module.css) so accents follow the light/dark theme.
const COLORS = {
  blue: 'var(--blue)',
  violet: 'var(--violet)',
  pink: 'var(--pink)',
  green: 'var(--green)',
  yellow: 'var(--yellow)',
};
const ACCENTS = [COLORS.pink, COLORS.blue, COLORS.yellow, COLORS.green];
const GLYPHS = '{}[]<>/\\=+*;:#$%&01ABCDEFXYZ';

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- hooks ---------- */

// True once the element has scrolled into view (never flips back).
function useInView(threshold = 0.25) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold, rootMargin: '0px 0px -8% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, inView];
}

function useCountUp(from, to, decimals, active, duration = 1600) {
  const [value, setValue] = useState(from);
  useEffect(() => {
    if (!active) return undefined;
    if (prefersReducedMotion()) {
      setValue(to);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setValue(from + (to - from) * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [from, to, active, duration]);
  return value.toFixed(decimals);
}

// Types `text` one character at a time once `active` is true.
function useTyping(text, active, speed = 90, startDelay = 400) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return undefined;
    if (prefersReducedMotion()) {
      setCount(text.length);
      return undefined;
    }
    let i = 0;
    let timer = setTimeout(function step() {
      i += 1;
      setCount(i);
      if (i < text.length) timer = setTimeout(step, speed);
    }, startDelay);
    return () => clearTimeout(timer);
  }, [text, active, speed, startDelay]);
  return [text.slice(0, count), count >= text.length];
}

// Decodes `text` from random code glyphs, left to right.
function useScramble(text, active, startDelay = 300, perChar = 70) {
  const [out, setOut] = useState(text.replace(/\S/g, ' '));
  useEffect(() => {
    if (!active) return undefined;
    if (prefersReducedMotion()) {
      setOut(text);
      return undefined;
    }
    let raf;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start - startDelay;
      let done = true;
      const next = text
        .split('')
        .map((ch, i) => {
          if (ch === ' ') return ' ';
          if (elapsed > i * perChar + 350) return ch;
          done = false;
          if (elapsed < i * perChar * 0.4) return ' ';
          return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        })
        .join('');
      setOut(next);
      if (!done) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, active, startDelay, perChar]);
  return out;
}

/* ---------- building blocks ---------- */

function Reveal({ as: Tag = 'div', delay = 0, className = '', style, children, threshold }) {
  const [ref, inView] = useInView(threshold);
  return (
    <Tag
      ref={ref}
      className={`${styles.reveal} ${inView ? styles.in : ''} ${className}`}
      style={{ '--delay': `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}

function Section({ id, children, className = '', threshold = 0.2 }) {
  const [ref, inView] = useInView(threshold);
  return (
    <section ref={ref} id={id} className={`${styles.section} ${className}`}>
      {typeof children === 'function' ? children(inView) : children}
    </section>
  );
}

function Kicker({ children, delay = 0 }) {
  return (
    <Reveal delay={delay} className={styles.kicker}>
      <span className={styles.kickerDot} />
      {children}
    </Reveal>
  );
}

function Headline({ children, delay = 120, className = '' }) {
  return (
    <Reveal as="h2" delay={delay} className={`${styles.headline} ${className}`}>
      {children}
    </Reveal>
  );
}

/* ---------- sections ---------- */

function ColdOpen() {
  const { terminalCommand, loadingText } = CONTENT.intro;
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const [typed, done] = useTyping(terminalCommand, mounted, 110, 700);
  return (
    <Section id="start" className={styles.cold}>
      <div className={styles.terminal}>
        <div className={styles.termBar}>
          <span style={{ background: '#ff5f57' }} />
          <span style={{ background: '#febc2e' }} />
          <span style={{ background: '#28c840' }} />
          <em>ayah@orbit: ~</em>
        </div>
        <div className={styles.termBody}>
          <div>
            <span className={styles.prompt}>❯</span> {typed}
            {!done && <span className={styles.caret} />}
          </div>
          <div className={`${styles.loading} ${done ? styles.loadingOn : ''}`}>
            <span className={styles.muted}>{loadingText}</span>
            <span className={styles.loadBar}>
              <span />
            </span>
          </div>
        </div>
      </div>
      <a href="#name" className={`${styles.scrollHint} ${done ? styles.scrollHintOn : ''}`}>
        <span>scroll</span>
        <i />
      </a>
    </Section>
  );
}

function NameReveal() {
  const { greeting } = CONTENT.intro;
  const { firstName, lastName, role, focus, location } = CONTENT.profile;
  return (
    <Section id="name" threshold={0.35}>
      {(inView) => <NameInner inView={inView} {...{ greeting, firstName, lastName, role, focus, location }} />}
    </Section>
  );
}

function NameInner({ inView, greeting, firstName, lastName, role, focus, location }) {
  const first = useScramble(firstName, inView, 400);
  const last = useScramble(lastName, inView, 400 + firstName.length * 70);
  return (
    <div className={styles.center}>
      <Reveal className={styles.greeting}>{greeting}</Reveal>
      <h1 className={styles.name} aria-label={`${firstName} ${lastName}`}>
        <span className={styles.gradientText}>{first}</span> <span>{last}</span>
      </h1>
      <Reveal delay={900} className={styles.role}>
        {role} <span className={styles.muted}>· {location}</span>
      </Reveal>
      <div className={styles.chips}>
        {focus.map((f, i) => (
          <Reveal key={f} delay={1100 + i * 150} className={styles.chip} style={{ '--c': ACCENTS[i % ACCENTS.length] }}>
            {f}
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function StatCard({ item, index, active }) {
  const value = useCountUp(0, item.value, item.decimals, active);
  const color = ACCENTS[index % ACCENTS.length];
  return (
    <Reveal delay={200 + index * 140} className={`${styles.glass} ${styles.stat}`} style={{ '--c': color }}>
      <div className={styles.statValue}>
        {value}
        <span>{item.suffix}</span>
      </div>
      <div className={styles.statLabel}>{item.label}</div>
      <div className={styles.muted}>{item.sub}</div>
    </Reveal>
  );
}

function Stats() {
  const { kicker, headline, watermark, items } = CONTENT.stats;
  return (
    <Section id="stats">
      {(inView) => (
        <div className={styles.container}>
          <div className={styles.watermark} aria-hidden="true">
            {watermark}
          </div>
          <Kicker>{kicker}</Kicker>
          <Headline>{headline}</Headline>
          <div className={styles.statGrid}>
            {items.map((item, i) => (
              <StatCard key={item.label} item={item} index={i} active={inView} />
            ))}
          </div>
        </div>
      )}
    </Section>
  );
}

function Platform() {
  const { kicker, headline, startCount, endCount, body, hubLabel, domains, libraries } = CONTENT.platform;
  return (
    <Section id="platform">
      {(inView) => <PlatformInner {...{ inView, kicker, headline, startCount, endCount, body, hubLabel, domains, libraries }} />}
    </Section>
  );
}

function PlatformInner({ inView, kicker, headline, startCount, endCount, body, hubLabel, domains, libraries }) {
  const count = useCountUp(startCount, endCount, 0, inView, 2200);
  const nodes = domains.map((d, i) => {
    const angle = (i / domains.length) * Math.PI * 2 - Math.PI / 2;
    return { label: d, x: 50 + Math.cos(angle) * 40, y: 50 + Math.sin(angle) * 40 };
  });
  return (
    <div className={styles.container}>
      <Kicker>{kicker}</Kicker>
      <Headline>
        {headline} <span className={styles.gradientText}>{count}+</span>
      </Headline>
      <Reveal delay={240} className={styles.lead}>
        {body}
      </Reveal>
      <div className={`${styles.network} ${inView ? styles.networkIn : ''}`}>
        <svg className={styles.netLines} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {nodes.map((n, i) => (
            <line
              key={n.label}
              x1="50"
              y1="50"
              x2={n.x}
              y2={n.y}
              style={{ '--delay': `${400 + i * 120}ms`, stroke: ACCENTS[i % ACCENTS.length] }}
            />
          ))}
        </svg>
        <div className={styles.hub}>
          <span>{hubLabel}</span>
        </div>
        {nodes.map((n, i) => (
          <div
            key={n.label}
            className={styles.node}
            style={{ left: `${n.x}%`, top: `${n.y}%`, '--delay': `${500 + i * 120}ms`, '--c': ACCENTS[i % ACCENTS.length] }}
          >
            {n.label}
          </div>
        ))}
      </div>
      <div className={styles.chips}>
        {libraries.map((lib, i) => (
          <Reveal key={lib} delay={i * 150} className={`${styles.chip} ${styles.mono}`} style={{ '--c': COLORS.violet }}>
            {lib}
          </Reveal>
        ))}
      </div>
    </div>
  );
}

function Ring({ items, radius, duration, reverse, color }) {
  return (
    <div
      className={`${styles.ring} ${reverse ? styles.ringReverse : ''}`}
      style={{ '--r': radius, '--dur': `${duration}s`, '--c': color }}
    >
      {items.map((item, i) => (
        <div key={item} className={styles.orbitChip} style={{ '--a': `${(360 / items.length) * i}deg` }}>
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

function Stack() {
  const { kicker, headline, coreTitle, coreSubtitle, innerRing, middleRing, outerRing } = CONTENT.stack;
  const rows = [
    { items: innerRing, color: COLORS.blue },
    { items: middleRing, color: COLORS.violet },
    { items: outerRing, color: COLORS.pink },
  ];
  return (
    <Section id="stack">
      <div className={styles.container}>
        <Kicker>{kicker}</Kicker>
        <Headline>{headline}</Headline>
        <Reveal delay={250} className={styles.orbit}>
          <div className={styles.core}>
            <strong>{coreTitle}</strong>
            <span>{coreSubtitle}</span>
          </div>
          <Ring items={innerRing} radius={0.2} duration={60} color={COLORS.blue} />
          <Ring items={middleRing} radius={0.33} duration={90} reverse color={COLORS.violet} />
          <Ring items={outerRing} radius={0.46} duration={120} color={COLORS.pink} />
        </Reveal>
        <div className={styles.stackRows}>
          {rows.map((row, r) => (
            <div key={r} className={styles.chips}>
              {row.items.map((item, i) => (
                <Reveal key={item} delay={i * 80} className={styles.chip} style={{ '--c': row.color }}>
                  {item}
                </Reveal>
              ))}
            </div>
          ))}
        </div>
      </div>
    </Section>
  );
}

function AiFlow() {
  const { kicker, headline, tags, flow, builds } = CONTENT.ai;
  return (
    <Section id="ai">
      <div className={styles.container}>
        <Kicker>{kicker}</Kicker>
        <Headline>{headline}</Headline>
        <div className={styles.chips}>
          {tags.map((t, i) => (
            <Reveal key={t} delay={250 + i * 120} className={`${styles.chip} ${styles.mono}`} style={{ '--c': ACCENTS[i % ACCENTS.length] }}>
              {t}
            </Reveal>
          ))}
        </div>
        <Reveal className={styles.flow} threshold={0.3}>
          {flow.map((step, i) => (
            <div key={step} className={styles.flowStep} style={{ '--delay': `${300 + i * 260}ms` }}>
              <span className={styles.flowNum}>{String(i + 1).padStart(2, '0')}</span>
              {step}
            </div>
          ))}
        </Reveal>
        <div className={styles.builds}>
          {builds.map((b, i) => (
            <Reveal key={b.name} delay={i * 160} className={`${styles.glass} ${styles.build}`} style={{ '--c': COLORS[b.color] || COLORS.blue }}>
              <h3>{b.name}</h3>
              <p>{b.desc}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Journey() {
  const { kicker, headline, milestones } = CONTENT.journey;
  return (
    <Section id="journey" threshold={0.15}>
      {(inView) => (
        <div className={styles.container}>
          <Kicker>{kicker}</Kicker>
          <Headline>{headline}</Headline>
          <ol className={`${styles.timeline} ${inView ? styles.timelineIn : ''}`}>
            {milestones.map((m, i) => (
              <Reveal
                as="li"
                key={m.company}
                delay={200 + i * 120}
                className={`${styles.milestone} ${m.current ? styles.current : ''}`}
                style={{ '--c': COLORS[m.color] || COLORS.blue }}
              >
                <span className={styles.msDot} />
                <div className={styles.msYear}>{m.year}</div>
                <div className={`${styles.glass} ${styles.msCard}`}>
                  <div className={styles.msTop}>
                    <h3>{m.company}</h3>
                    {m.current && <span className={styles.now}>NOW</span>}
                  </div>
                  <div className={styles.msRole}>{m.role}</div>
                  <div className={styles.muted}>{m.note}</div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      )}
    </Section>
  );
}

function Certs() {
  const { kicker, headline, items } = CONTENT.certs;
  return (
    <Section id="certs">
      <div className={styles.container}>
        <Kicker>{kicker}</Kicker>
        <Headline>{headline}</Headline>
        <div className={styles.certGrid}>
          {items.map((c, i) => (
            <Reveal key={c.name} delay={150 + i * 90} className={`${styles.glass} ${styles.cert}`} style={{ '--c': COLORS[c.color] || COLORS.blue }}>
              <span className={styles.certIssuer}>{c.issuer}</span>
              <span className={styles.certName}>{c.name}</span>
            </Reveal>
          ))}
        </div>
      </div>
    </Section>
  );
}

function Outro() {
  const { line1, line2, cta, footnote } = CONTENT.outro;
  return (
    <Section id="outro" className={styles.outro} threshold={0.35}>
      <div className={styles.center}>
        <Reveal as="h2" className={styles.outroLine}>
          {line1}
        </Reveal>
        <Reveal as="h2" delay={500} className={`${styles.outroLine} ${styles.gradientText}`}>
          {line2}
        </Reveal>
        <Reveal delay={1000} className={styles.cta}>
          {cta}
        </Reveal>
        <Reveal delay={1300} className={styles.footnote}>
          {footnote}
        </Reveal>
      </div>
    </Section>
  );
}

function ScrollProgress() {
  const barRef = useRef(null);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      if (barRef.current) barRef.current.style.transform = `scaleX(${p})`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);
  return <div ref={barRef} className={styles.progress} aria-hidden="true" />;
}

export default function About() {
  return (
    <Layout title="whoami" description="Ayah Alrefai — Senior Backend Engineer. Who I am, what I build, and how I got here.">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800&family=JetBrains+Mono:wght@400;700&family=Space+Grotesk:wght@500;700&display=swap"
        />
      </Head>
      <main className={styles.page}>
        <ScrollProgress />
        <div className={styles.bg} aria-hidden="true">
          <div className={styles.aurora} />
          <div className={styles.grid} />
        </div>
        <ColdOpen />
        <NameReveal />
        <Stats />
        <Platform />
        <Stack />
        <AiFlow />
        <Journey />
        <Certs />
        <Outro />
      </main>
    </Layout>
  );
}

const lightCodeTheme = require('prism-react-renderer/themes/nightOwlLight');
const darkCodeTheme = require('prism-react-renderer/themes/oceanicNext');

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const n8nApiUrl = process.env.REACT_APP_N8N_API_URL;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Orbit',
  tagline: 'Developer tools, references, and interactive utilities — all in one place.',
  favicon: 'img/logo-3-orbit.svg',
  url: 'https://canvas-eye-416011.web.app/',
  baseUrl: '/',
  organizationName: 'Ayah Refai',
  projectName: 'Orbit',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  customFields: {
    "REACT_APP_N8N_API_URL": n8nApiUrl,
    firebaseConfig: {
      apiKey: process.env.FIREBASE_API_KEY,
      authDomain: process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL: process.env.FIREBASE_DATABASE_URL,
      projectId: process.env.FIREBASE_PROJECT_ID,
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.FIREBASE_APP_ID,
    },
  },
  // i18n: {
  //   defaultLocale: 'en',
  //   locales: ['en'],
  // },
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          editUrl: 'https://github.com/AyahAlrifai/ayah-documentations/blob/edit',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  headTags: [
    // PWA manifest
    { tagName: 'link', attributes: { rel: 'manifest', href: '/manifest.json' } },
    // Theme color (Chrome address bar + Android)
    { tagName: 'meta', attributes: { name: 'theme-color', content: '#ec4899' } },
    // iOS home screen icon (falls back gracefully on SVG-unsupported devices)
    { tagName: 'link', attributes: { rel: 'apple-touch-icon', href: '/img/logo-3-orbit.svg' } },
    { tagName: 'meta', attributes: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
    { tagName: 'meta', attributes: { name: 'apple-mobile-web-app-status-bar-style', content: 'black-translucent' } },
    { tagName: 'meta', attributes: { name: 'apple-mobile-web-app-title', content: 'Orbit' } },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        name: 'Orbit',
        url: 'https://canvas-eye-416011.web.app/',
        description: 'Developer tools, references, and interactive utilities — all in one place.',
        author: { '@type': 'Person', name: 'Ayah Refai', url: 'https://github.com/AyahAlrifai' },
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://canvas-eye-416011.web.app/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      }),
    },
    {
      tagName: 'script',
      attributes: { type: 'application/ld+json' },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Orbit Developer Tools',
        url: 'https://canvas-eye-416011.web.app/',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        description: 'Free online developer tools: JSON formatter, SQL formatter, JWT decoder, regex tester, data format converter, API documentation generator, and more.',
      }),
    },
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      metadata: [
        { name: 'description', content: 'Orbit — free online developer tools: JSON formatter, SQL formatter, JWT decoder, regex tester, data converter, API doc generator, HTTP status codes reference, and more.' },
        { name: 'keywords', content: 'JSON formatter, SQL formatter, JWT decoder, regex tester, data converter, YAML to JSON, JSON to YAML, TOML converter, XML converter, API documentation generator, Spring Boot annotations, HTTP status codes, markdown editor, developer tools, free online tools, Orbit' },
        { name: 'author', content: 'Ayah Refai' },
        { name: 'robots', content: 'index, follow' },
        { property: 'og:type', content: 'website' },
        { property: 'og:site_name', content: 'Orbit' },
        { property: 'og:title', content: 'Orbit — Developer Tools & References' },
        { property: 'og:description', content: 'Free online developer tools: JSON formatter, SQL formatter, JWT decoder, regex tester, data converter, and more.' },
        { property: 'og:image', content: 'https://canvas-eye-416011.web.app/img/logo-3-orbit.svg' },
        { property: 'og:url', content: 'https://canvas-eye-416011.web.app/' },
        { name: 'twitter:card', content: 'summary' },
        { name: 'twitter:title', content: 'Orbit — Developer Tools & References' },
        { name: 'twitter:description', content: 'Free online developer tools: JSON formatter, SQL formatter, JWT decoder, regex tester, data converter, and more.' },
        { name: 'twitter:image', content: 'https://canvas-eye-416011.web.app/img/logo-3-orbit.svg' },
      ],
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true
      },
      navbar: {
        title: 'Orbit',
        logo: {
          alt: 'Orbit — Developer Tools & References',
          src: 'img/logo-3-orbit.svg',
          srcDark: 'img/logo-3-orbit-dark.svg',
          style: { width: '44px', height: '44px' }
        },
        items: [
          {
            type: 'doc',
            docId: 'multiExecPro',
            position: 'left',
            label: 'Documentation',
            className: 'nav-icon-doc',
          },
          {
            label: 'Tools',
            position: 'left',
            className: 'nav-icon-tools',
            items: [
              { to: 'apiDocumentationGenerator', label: 'API Doc Generator', className: 'nav-icon-api' },
              { to: 'jwt-decoder', label: 'JWT Decoder', className: 'nav-icon-jwt' },
              { to: 'regex-tester', label: 'Regex Tester', className: 'nav-icon-regex' },
              { to: 'json-formatter', label: 'JSON Formatter', className: 'nav-icon-json' },
              { to: 'data-converter', label: 'Data Converter', className: 'nav-icon-converter' },
              { to: 'create-new-document', label: 'Markdown Editor', className: 'nav-icon-markdown' },
              { to: 'sql-formatter', label: 'SQL Formatter', className: 'nav-icon-sql' },
              { to: 'spring-boot-annotations', label: 'Spring Boot Annotations', className: 'nav-icon-spring' },
              { to: 'http-status-codes', label: 'HTTP Status Codes', className: 'nav-icon-http' },
            ],
          },
          {
            label: 'Games',
            position: 'left',
            className: 'nav-icon-games',
            items: [
              { to: 'tic-tac-toe', label: 'Tic Tac Toe', className: 'nav-icon-tictactoe' },
              { to: 'eight-puzzle', label: '8 Puzzle', className: 'nav-icon-puzzle' },
              { to: 'dots-and-boxes', label: 'Dots and Boxes', className: 'nav-icon-dots' },
              { to: 'trains', label: 'Trains', className: 'nav-icon-train' },
              { to: 'number-guessing', label: 'Number Guessing', className: 'nav-icon-number' },
            ],
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            items: [
              { label: 'Tools', to: '/json-formatter' },
              { label: 'Documentation', to: '/docs/multiExecPro' },
              { label: 'GitHub', href: 'https://github.com/AyahAlrifai' },
              { label: 'LinkedIn', href: 'https://www.linkedin.com/in/ayah-alrefai-may1997/' },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Orbit · Built by Ayah Refai`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
        additionalLanguages: ['java', 'powershell'],
      },
    }),
  scripts: [
    {
      src: 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2474031713574575',
      async: true,
      crossorigin: 'anonymous'
    },
  ],
  themes: ['@docusaurus/theme-live-codeblock'],
};

module.exports = config;
const lightCodeTheme = require('prism-react-renderer/themes/nightOwlLight');
const darkCodeTheme = require('prism-react-renderer/themes/oceanicNext');

require('dotenv').config({ path: `.env.${process.env.NODE_ENV}` });

const n8nApiUrl = process.env.REACT_APP_N8N_API_URL;

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Learn Technology Easily', // show in home
  tagline: 'Let’s Go on a Tech Journey Together', // show in home
  favicon: 'img/logo-3-orbit.svg',
  url: 'https://canvas-eye-416011.web.app/',
  baseUrl: '/',
  organizationName: 'Ayah',
  projectName: 'Ayah\'s documentations',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  customFields: {
    "REACT_APP_N8N_API_URL": n8nApiUrl,
    firebaseConfig: {
      apiKey:            process.env.FIREBASE_API_KEY,
      authDomain:        process.env.FIREBASE_AUTH_DOMAIN,
      databaseURL:       process.env.FIREBASE_DATABASE_URL,
      projectId:         process.env.FIREBASE_PROJECT_ID,
      storageBucket:     process.env.FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
      appId:             process.env.FIREBASE_APP_ID,
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

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/ayah.png',
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true
      },
      navbar: {
        logo: {
          alt: 'Learn Technology Easily',
          src: 'img/logo-3-orbit.svg',
          srcDark: 'img/logo-3-orbit-dark.svg',
          style: { width: '44px', height: '44px' }
        },
        items: [
          {
            type: 'doc',
            docId: 'multiExecPro',
            position: 'left',
            label: '📚 Documentation',
          },
          {
            label: '🛠️ Tools',
            position: 'left',
            items: [
              { to: 'create-new-document',       label: '✏️ Markdown Editor' },
              { to: 'json-formatter',             label: '{ } JSON Formatter' },
              { to: 'sql-formatter',              label: '🗄️ SQL Formatter' },
              { to: 'apiDocumentationGenerator',  label: '⚡ API Doc Generator' },
              { to: 'spring-boot-annotations',    label: '🍃 Spring Boot Annotations' },
            ],
          },
          {
            label: '🎮 Games',
            position: 'left',
            items: [
              { to: 'tic-tac-toe',      label: '⭕ Tic Tac Toe' },
              { to: 'eight-puzzle',     label: '🧩 8 Puzzle' },
              { to: 'dots-and-boxes',   label: '⬛ Dots and Boxes' },
              { to: 'trains',           label: '🚂 Trains' },
              { to: 'number-guessing',  label: '🔢 Number Guessing' },
            ],
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Auther Ayah Al-Refai',
            items: [
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/in/ayah-alrefai-may1997/',
              }, {
                label: 'GitHub',
                href: 'https://github.com/AyahAlrifai',
              }
            ],
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Ayah Al-Rifai`,
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
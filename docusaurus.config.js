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

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
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
              { to: 'create-new-document', label: 'Markdown Editor', className: 'nav-icon-markdown' },
              { to: 'sql-formatter', label: 'SQL Formatter', className: 'nav-icon-sql' },
              { to: 'spring-boot-annotations', label: 'Spring Boot Annotations', className: 'nav-icon-spring' },
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
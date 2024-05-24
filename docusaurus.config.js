const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Ayah\'s Documentation ', // show in home
  tagline: 'Lets go to...', // show in home
  favicon: 'img/ayah.png', 
  url: 'https://github.com',

  baseUrl: '/',
  organizationName: 'Ayah',
  projectName: 'Ayah\'s documentations',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // editUrl:
          //   'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
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
      navbar: {
        style:"primary", // same as primary color
        title: 'Home', // first page allways read pages/index.js
        logo: {
          alt: 'My Site Logo',
          src: 'img/ayah.png',
          style:{width:'150px',height:'40px'}
        },
        items: [
          {
            type: 'doc',
            docId: 'MultiExecPro',
            position: 'left',
            label: 'Documentation',
          },{
            to: 'create-new-document',
            position: 'left',
            label: 'Review Markdown',
          }
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
              },{
                label: 'GitHub',
                href: 'https://github.com/AyahAlrifai',
              }
            ],
          }
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Ayah`,
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
        crossorigin:'anonymous'
      },
    ],
    themes: ['@docusaurus/theme-live-codeblock'],
};

module.exports = config;
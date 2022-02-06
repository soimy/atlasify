// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Atlasify documentation',
  tagline: 'Dinosaurs are cool',
  url: 'https://soimy.github.io/',
  baseUrl: '/atlasify/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'soimy', // Usually your GitHub org/user name.
  projectName: 'Atlasify', // Usually your repo name.

  plugins: [
    [
      'docusaurus-plugin-typedoc',
      {
        // TypeDoc options
        entryPoints: ['../src/atlasify.ts'],
        tsconfig: '../tsconfig.json',

        // Plugin options
        out: '.',
        sidebar: {
          categoryLabel: 'API Reference',
          position: 0,
          fullNames: true
        },
      },
    ],
  ],

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          // showReadingTime: true,
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/atlasify/docs',
        },
        // blog: {
        //   showReadingTime: true,
        //   // Please change this to your repo.
        //   editUrl:
        //     'https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/',
        // },
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
        defaultMode: 'light',
        disableSwitch: true,
      },
      algolia: {
        // The application ID provided by Algolia
        appId: 'M3MT999VTR',

        // Public API key: it is safe to commit it
        apiKey: '5f3b2744f71bc49d767ef36c2ffdedf7',

        indexName: 'atlasify_soimy',

        // Optional: see doc section below
        contextualSearch: true,

        // Optional: Specify domains where the navigation should occur through window.location instead on history.push. Useful when our Algolia config crawls multiple documentation sites and we want to navigate with window.location.href to them.
        // externalUrlRegex: 'external\\.com|domain\\.com',

        // Optional: Algolia search parameters
        // searchParameters: {},

        //... other Algolia params
      },
      navbar: {
        title: 'Atlasify',
        logo: {
          alt: 'Atlasify',
          src: 'img/favicon.png',
        },
        hideOnScroll: true,
        items: [
          {
            type: 'doc',
            docId: 'index',
            position: 'left',
            label: 'Readme',
          },
          {
            to: 'docs/modules',  
            activeBasePath: 'docs',
            label: 'API Reference',
            position: 'left',
          },
          // {to: '/blog', label: 'Blog', position: 'left'},
          {
            href: 'https://github.com/soimy/atlasify',
            label: 'GitHub',
            position: 'right',
          },
          {
            type: 'search',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          // {
          //   title: 'Introduction',
          //   items: [
          //     {
          //       type: 'doc',
          //       docId: 'index',
          //       position: 'left',
          //       label: 'Readme',
          //     }
          //   ]
          // },
          {
            title: 'Docs',
            items: [
              {
                label: 'API Reference',
                to: '/docs',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              // {
              //   label: 'Stack Overflow',
              //   href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              // },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/ymshen',
              },
            ],
          },
          {
            title: 'More',
            items: [
              // {
              //   label: 'Blog',
              //   to: '/blog',
              // },
              {
                label: 'GitHub',
                href: 'https://github.com/facebook/docusaurus',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Shen Yiming. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        // darkTheme: darkCodeTheme,
        darkTheme: lightCodeTheme,
      },
    }),
};

module.exports = config;

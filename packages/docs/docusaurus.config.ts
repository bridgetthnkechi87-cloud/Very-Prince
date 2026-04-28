import { themes as prismThemes } from "prism-react-renderer";
import type { Config } from "@docusaurus/types";
import type * as Preset from "@docusaurus/preset-classic";

const config: Config = {
  title: "very-princess",
  tagline: "Stellar-Native Multi-Organization Payout Registry",
  favicon: "img/favicon.ico",

  url: "https://docs.tradeflow.app",
  baseUrl: "/",

  organizationName: "Zakky-Fat",
  projectName: "Very-Princess",

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      {
        docs: {
          sidebarPath: "./sidebars.ts",
          editUrl:
            "https://github.com/Zakky-Fat/Very-Princess/tree/main/packages/docs/",
        },
        blog: false,
        theme: {
          customCss: "./src/css/custom.css",
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    image: "img/docusaurus-social-card.jpg",
    navbar: {
      title: "very-princess",
      logo: {
        alt: "very-princess Logo",
        src: "img/logo.svg",
      },
      items: [
        {
          type: "docSidebar",
          sidebarId: "docsSidebar",
          position: "left",
          label: "Docs",
        },
        {
          href: "https://github.com/Zakky-Fat/Very-Princess",
          label: "GitHub",
          position: "right",
        },
      ],
    },
    footer: {
      style: "dark",
      links: [
        {
          title: "Guides",
          items: [
            { label: "Getting Started as an Org", to: "/docs/getting-started" },
            { label: "Connecting Webhooks", to: "/docs/webhooks" },
            { label: "API Limits", to: "/docs/api-limits" },
          ],
        },
        {
          title: "API Reference",
          items: [
            { label: "REST API", to: "/docs/api-reference" },
          ],
        },
        {
          title: "More",
          items: [
            {
              label: "GitHub",
              href: "https://github.com/Zakky-Fat/Very-Princess",
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} very-princess. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ["bash", "python"],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;

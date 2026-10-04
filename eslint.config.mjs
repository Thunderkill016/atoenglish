import nextConfig from "eslint-config-next";

// Raw Tailwind palette utilities (bg-zinc-500, text-emerald-600, …) bypass the
// semantic token layer — D4: theme breakage becomes structural. The design
// system must stay pure (error); app code is migrating (warn until clean).
const RAW_PALETTE_SELECTOR =
  "Literal[value=/\\b(?:bg|text|border|ring|from|via|to|fill|stroke|shadow|divide|outline|decoration|caret|accent|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}\\b/], TemplateElement[value.raw=/\\b(?:bg|text|border|ring|from|via|to|fill|stroke|shadow|divide|outline|decoration|caret|accent|placeholder)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\\d{2,3}\\b/]";
const RAW_PALETTE_MESSAGE =
  "Raw palette utility — use semantic tokens (bg-card, text-foreground, bg-primary, text-muted-foreground, border-border, state-*…).";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [
      ".next/**",
      ".next-dev/**",
      ".cloudflare/**",
      "node_modules/**",
      "dist/**",
      "out/**",
      "research/**",
    ],
  },
  ...nextConfig,
  {
    files: ["src/components/design-system/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "error",
        { selector: RAW_PALETTE_SELECTOR, message: RAW_PALETTE_MESSAGE },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-syntax": [
        "warn",
        { selector: RAW_PALETTE_SELECTOR, message: RAW_PALETTE_MESSAGE },
      ],
    },
  },
];

export default eslintConfig;

import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = [
  {
    ignores: [".next/**", ".next-dev/**", "node_modules/**", "dist/**", "out/**", "research/**"],
  },
  ...nextConfig,
];

export default eslintConfig;


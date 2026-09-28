import type { Config } from "prettier";

const config: Config = {
  trailingComma: "es5",
  // The Tailwind plugin must be last so it sees the output of the others.
  plugins: [
    "@ianvs/prettier-plugin-sort-imports",
    "prettier-plugin-tailwindcss",
  ],
  // Third-party imports, a blank line, then relative imports.
  importOrder: ["<THIRD_PARTY_MODULES>", "", "^[./]"],
  tailwindStylesheet: "./src/index.css",
  tailwindFunctions: ["cx"],
};

export default config;

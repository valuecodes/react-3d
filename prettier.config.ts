import type { Config } from "prettier";

const config: Config = {
  trailingComma: "es5",
  plugins: ["@ianvs/prettier-plugin-sort-imports"],
  // Third-party imports, a blank line, then relative imports.
  importOrder: ["<THIRD_PARTY_MODULES>", "", "^[./]"],
};

export default config;

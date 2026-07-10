import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import { defineConfig, globalIgnores } from "eslint/config";

export default defineConfig([
  globalIgnores(["dist", "e2e", "playwright.config.ts"]),
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      /* ---------- TypeScript ---------- */
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-empty-object-type": "off",
      "no-unused-expressions": "off",
      "@typescript-eslint/no-unused-expressions": "off",
      /* ---------- React Hooks / Purity ---------- */
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
      "react-hooks/static-components": "off",

      /* ---------- React Refresh ---------- */
      "react-refresh/only-export-components": "off",

      /* ---------- General React ---------- */
      "react/jsx-no-bind": "off",
      "react/no-unstable-nested-components": "off",

      "react-hooks/purity": "off",
      "react-compiler/react-compiler": "off",
      "react-hooks/refs": "off",
    },
  },
]);

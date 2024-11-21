import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginPrettier from "eslint-plugin-prettier";
// import nextConfig from "eslint-config-next";

/** @type {import('eslint').Linter.Config[]} */
export default [
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { ignores: ["node_modules", "dist", "build", "out"] },
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  //...nextConfig.coreWebVitals,
  {
    plugins: {
      prettier: pluginPrettier,
    },
    rules: {
      // Prettier-specific rules
      "prettier/prettier": [
        "error",
        {
          singleQuote: false, // Use double quotes
          endOfLine: "auto", // Maintain consistent end of line behavior
        },
      ],
      "react/jsx-uses-react": "off", // We are using React >= 17, so we can safely turn this off
      "react/react-in-jsx-scope": "off", // We are using React >= 17, so we can safely turn this off
    },
    settings: {
      // Tailwind-specific settings
      tailwindcss: {
        callees: ["classnames", "clsx", "ctl", "cva", "tv", "cn"],
      },
    },
  },
];

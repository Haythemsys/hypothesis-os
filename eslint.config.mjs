import next from "eslint-config-next";

// Flat ESLint config (Next.js 15 / ESLint 9). Default export is a flat-config array.
// Lint is advisory here: genuine errors fail, stylistic rules are relaxed.
export default [
  ...next,
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "@next/next/no-html-link-for-pages": "off",
      // Reading localStorage in an effect (hydration-safe) is intentional here.
      "react-hooks/set-state-in-effect": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  { ignores: [".next/**", "node_modules/**", "lib/**/*.mjs", "scripts/**", "out/**"] },
];

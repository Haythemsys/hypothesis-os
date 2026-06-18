import type { Config } from "tailwindcss";
export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: { extend: {
    colors: { go:"#16a34a", kill:"#dc2626", unresolved:"#d97706", ink:"#0b0f17", panel:"#111827", line:"#1f2937" }
  } },
  plugins: [],
} satisfies Config;

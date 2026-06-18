// Multi-domain benchmark index. Aggregates all domains into one list with a `domain` tag.
import { SCIENCE } from "./science.mjs";
import { PSYCHOLOGY } from "./psychology.mjs";
import { BUSINESS } from "./business.mjs";
import { MARKETING } from "./marketing.mjs";
import { AI } from "./ai.mjs";

export const DOMAINS = {
  Science: SCIENCE, Psychology: PSYCHOLOGY, Business: BUSINESS, Marketing: MARKETING, AI: AI,
};

export const ALL_BENCHMARKS = Object.entries(DOMAINS).flatMap(([domain, list]) =>
  list.map((h) => ({ ...h, domain })));

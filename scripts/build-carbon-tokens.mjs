import fs from 'node:fs/promises';
import path from 'node:path';

const rootDir = process.cwd();
const sourcePath = path.join(rootDir, 'src/theme/tokens.json');
const outputPath = path.join(rootDir, 'lib/carbon/tokens.ts');
const cljsOutputPath = path.join(rootDir, 'src/clj/breakdex/design/generated_tokens.cljs');
const cssOutputPath = path.join(rootDir, 'src/theme/carbon.css');

const source = JSON.parse(await fs.readFile(sourcePath, 'utf8'));

function toCljs(value, indent = 0) {
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    const lines = value.map((entry) => `${' '.repeat(indent + 2)}${toCljs(entry, indent + 2)}`);
    return `[\n${lines.join('\n')}\n${' '.repeat(indent)}]`;
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value);

    if (entries.length === 0) return '{}';

    const lines = entries.map(
      ([key, entry]) => `${' '.repeat(indent + 2)}:${key} ${toCljs(entry, indent + 2)}`
    );
    return `{\n${lines.join('\n')}\n${' '.repeat(indent)}}`;
  }

  if (typeof value === 'string') return JSON.stringify(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value === null) return 'nil';

  throw new Error(`Unsupported token value: ${value}`);
}

function toCssVarName(parts) {
  return `--${parts.join('-').replace(/[A-Z]/g, (char) => `-${char.toLowerCase()}`)}`;
}

function flattenVars(value, parts = []) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return Object.entries(value).flatMap(([key, entry]) => flattenVars(entry, [...parts, key]));
  }

  return [[toCssVarName(parts), typeof value === 'number' ? `${value}px` : String(value)]];
}

const fileContents = `// Generated from src/theme/tokens.json by scripts/build-carbon-tokens.mjs
// Do not edit manually.

export const carbonTokens = ${JSON.stringify(source, null, 2)} as const;

export type CarbonThemeMode = keyof typeof carbonTokens.color extends infer T
  ? T extends 'light' | 'dark'
    ? T
    : never
  : never;
export type CarbonColorToken = keyof typeof carbonTokens.color.light;
export type CarbonStateToken = keyof typeof carbonTokens.color.state;
export type CarbonReviewRatingToken = keyof typeof carbonTokens.color.reviewRating;
export type CarbonSpaceToken = keyof typeof carbonTokens.space;
export type CarbonRadiusToken = keyof typeof carbonTokens.radius;
export type CarbonTypeToken = keyof typeof carbonTokens.type;
export type CarbonFontToken = keyof typeof carbonTokens.font;

export function getColor(mode: CarbonThemeMode, token: CarbonColorToken) {
  return carbonTokens.color[mode][token];
}

export function getStateColor(mode: CarbonThemeMode, token: CarbonStateToken) {
  return carbonTokens.color.state[token][mode];
}

export function getReviewRatingColor(token: CarbonReviewRatingToken) {
  return carbonTokens.color.reviewRating[token];
}

export function getSpacing(token: CarbonSpaceToken) {
  return carbonTokens.space[token];
}

export function getRadius(token: CarbonRadiusToken) {
  return carbonTokens.radius[token];
}

export function getTypeSize(token: CarbonTypeToken) {
  return carbonTokens.type[token];
}

export function getLineHeight(token: CarbonTypeToken) {
  return carbonTokens.lineHeight[token];
}

export function getFont(token: CarbonFontToken) {
  return carbonTokens.font[token];
}

export default carbonTokens;
`;

const cljsContents = `;; Generated from src/theme/tokens.json by scripts/build-carbon-tokens.mjs
;; Do not edit manually.

(ns breakdex.design.generated-tokens)

(def carbon-tokens ${toCljs(source)})

(def token-meta (:meta carbon-tokens))
(def color (:color carbon-tokens))
(def space (:space carbon-tokens))
(def radius (:radius carbon-tokens))
(def type-scale (:type carbon-tokens))
(def line-height (:lineHeight carbon-tokens))
(def font (:font carbon-tokens))
`;

const rootVars = [
  ...flattenVars(source.color.light, ['color']),
  ...flattenVars(source.color.state, ['color-state']),
  ...flattenVars(source.color.reviewRating, ['color-review-rating']),
  ...flattenVars(source.space, ['space']),
  ...flattenVars(source.radius, ['radius']),
  ...flattenVars(source.type, ['type']),
  ...flattenVars(source.lineHeight, ['line-height']),
  ...flattenVars(source.font, ['font']),
];

const darkVars = flattenVars(source.color.dark, ['color']);

const cssContents = `/* Generated from src/theme/tokens.json by scripts/build-carbon-tokens.mjs */
/* Import this file anywhere CSS variables are needed, including Storybook/web previews. */

:root {
${rootVars.map(([name, value]) => `  ${name}: ${value};`).join('\n')}
}

[data-theme='dark'],
.theme-dark {
${darkVars.map(([name, value]) => `  ${name}: ${value};`).join('\n')}
}
`;

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.mkdir(path.dirname(cljsOutputPath), { recursive: true });
await fs.mkdir(path.dirname(cssOutputPath), { recursive: true });
await fs.writeFile(outputPath, fileContents);
await fs.writeFile(cljsOutputPath, cljsContents);
await fs.writeFile(cssOutputPath, cssContents);

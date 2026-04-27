const tokens = require('./src/theme/tokens.json');

const toDimensionScale = (values) =>
  Object.fromEntries(Object.entries(values).map(([key, value]) => [key, `${value}px`]));

module.exports = {
  content: [
    './AppEntry.js',
    './app/**/*.{js,jsx,ts,tsx}',
    './lib/**/*.{js,jsx,ts,tsx}',
    './src/**/*.{cljs,cljc,js,jsx,ts,tsx}',
  ],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      spacing: toDimensionScale(tokens.space),
      borderRadius: toDimensionScale(tokens.radius),
      fontSize: Object.fromEntries(
        Object.entries(tokens.type).map(([key, value]) => [
          key,
          [value, { lineHeight: `${tokens.lineHeight[key]}px` }],
        ])
      ),
    },
  },
  plugins: [],
};

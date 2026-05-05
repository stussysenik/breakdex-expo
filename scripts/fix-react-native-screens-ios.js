/* global __dirname */

const fs = require('node:fs');
const path = require('node:path');

const targetFile = path.join(
  __dirname,
  '..',
  'node_modules',
  'react-native-screens',
  'ios',
  'RNSScreenStackHeaderConfig.mm'
);

if (!fs.existsSync(targetFile)) {
  process.exit(0);
}

const source = fs.readFileSync(targetFile, 'utf8');

if (source.includes('#import <utility>')) {
  process.exit(0);
}

const anchor = '#import "RNSUIBarButtonItem.h"\n';

if (!source.includes(anchor)) {
  throw new Error(`Unable to find patch anchor in ${targetFile}`);
}

const patched = source.replace(anchor, `${anchor}#import <utility>\n`);

fs.writeFileSync(targetFile, patched);

const rollup = require('rollup');
const fs = require('fs');
const path = require('path');
const nodeResolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const json = require('@rollup/plugin-json');

async function main() {
  await Promise.all([
    bundleDependency('process-es6'),
    bundleDependency('buffer-es6'),
    bundleDependency('browserify-fs'),
    bundleDependency('crypto-browserify'),
  ])

  // quick and dirty find-replace
  const cryptoPolyfillLoc = path.join(__dirname, '../polyfills/crypto-browserify.js');
  let cryptoPolyfill = fs.readFileSync(cryptoPolyfillLoc, 'utf8');
  cryptoPolyfill = cryptoPolyfill.replace(`import require$$0$1 from 'buffer';`, `import * as require$$$0$1 from 'buffer';`);
  cryptoPolyfill = cryptoPolyfill.replace(`import require$$2$1 from 'string_decoder';`, `import * as require$$$2$1 from 'string_decoder';`);
  cryptoPolyfill = cryptoPolyfill.replace(`buffer$1.hasOwnProperty(key)`, `Object.prototype.hasOwnProperty.call(buffer$1, key)`);
  // console.log(cryptoPolyfill);
  fs.writeFileSync(cryptoPolyfillLoc, cryptoPolyfill, 'utf8');
}

async function bundleDependency(depName) {
  const bundle = await rollup.rollup({
    input: depName,
    plugins: [
      commonjs(),
      nodeResolve({
        browser: true,
        preferBuiltins: true
      }),
      json(),
    ],
    external: [
      'crypto',
      'vm',
      'events',
      'path',
      'stream',
      'util',
      'buffer'
    ]
  });

  await bundle.write({
    format: 'esm',
    file: path.join('polyfills', depName + '.js')
  });
}

main();

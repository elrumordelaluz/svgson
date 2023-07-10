import fs from 'node:fs/promises'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import babel from 'rollup-plugin-babel'
// import pkg from './package.json'
const pkg = JSON.parse(await fs.readFile('package.json'))

export default [
  // browser-friendly UMD build
  {
    input: 'src/index-umd.js',
    output: {
      file: pkg.browser,
      format: 'umd',
      name: 'svgson',
    },
    plugins: [
      resolve(),
      commonjs(),
      babel({
        // transpile ES2015+ to ES5
        exclude: ['node_modules/**'],
      }),
    ],
  },

  // CommonJS (for Node) and ES module (for bundlers) build.
  // (We could have three entries in the configuration array
  // instead of two, but it's quicker to generate multiple
  // builds from a single configuration where possible, using
  // the `targets` option which can specify `dest` and `format`)
  {
    input: 'src/index-es.js',
    external: ['deep-rename-keys', 'xml-printer', 'xml-reader'],
    plugins: [
      babel({
        exclude: ['node_modules/**'],
      }),
    ],
    output: [
      { file: pkg.main, format: 'cjs', exports: 'named' },
      { file: pkg.module, format: 'es', exports: 'named' },
    ],
  },
]

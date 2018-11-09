<p align="center">
  <img alt="svgson" title="svgson" src="logo.svg" width="450">
</p>

<p align="center">
  Simple tool to transform <code>svg</code> files and Strings into <code>Object</code> or <code>JSON</code>.
</p>
<p align="center">
  Useful to manipulate <code>SVG</code> with <code>js</code>, to store in noSQL databses.
</p>
<p align="center">
  This is the new version of <a href="https://github.com/elrumordelaluz/svgson">svgson</a>
</p>

[![Travis](https://img.shields.io/travis/elrumordelaluz/svgson.svg)](https://travis-ci.org/elrumordelaluz/svgson/)
[![Codecov](https://img.shields.io/codecov/c/github/elrumordelaluz/svgson.svg)](https://codecov.io/gh/elrumordelaluz/svgson)
[![Version](https://img.shields.io/npm/v/svgson.svg)](https://www.npmjs.com/package/svgson)
[![Download](https://img.shields.io/npm/dm/svgson.svg)](https://npm-stat.com/charts.html?package=svgsont)
[![MIT License](https://img.shields.io/npm/l/svgson.svg)](https://opensource.org/licenses/MIT)

## Install

```
yarn add svgson-next
```

## Usage

```js
const svgson = require('svgson-next')

// ----------------------------
// Convert SVG to JSON AST
// ----------------------------
svgson
  .parse(
    `<svg>
  <line
    stroke= "#bada55"
    stroke-width= "2"
    stroke-linecap= "round"
    x1= "70"
    y1= "80"
    x2= "250"
    y2= "150">
  </line>
</svg>`
  )
  .then(function(json) {
    console.log(JSON.stringify(json, null, 2))
    /*
    {
      name: 'svg',
      type: 'element',
      value: '',
      attributes: {},
      children: [
        {
          name: 'line',
          type: 'element',
          value: '',
          attributes: {
            stroke: '#bada55',
            'stroke-width': '2',
            'stroke-linecap': 'round',
            x1: '70',
            y1: '80',
            x2: '250',
            y2: '150'
          },
          children: []
        }
      ]
    }
  */

    // -------------------------------
    // Convert JSON AST back to SVG
    // -------------------------------
    mysvg = svgson.stringify(json)
    /* returns the SVG as string */
  })
```

Test in browser [here](https://codepen.io/elrumordelaluz/full/XBKedz/)

# API

## svgson.parse

```js
svgson.parse(input[, options])
```

Returns: `Promise`

- **`input`**

  Type: `String`

- **`options.transformNode`**

  Function to apply on each node when parsing, useful when need to reshape nodes or set default attributes.

  Type: `Function` that returns the node

  Default:

  ```js
  function(node){
    return node
  }
  ```

- **`options.compat`**

  Use keys from previuos version of `svgson`

  Type: `Boolean`

  Default: `false`

- **`options.camelcase`**

  Apply `camelCase` into attributes

  Type: `Boolean`

  Default: `false`

## svgson.stringify

```js
svg = svgson.stringify(json)
```

- **Pretty Printing**

  In order to generate pretty formatted SVG output, use [`pretty` npm module](https://www.npmjs.com/package/pretty):

  ```js
  pretty = require('pretty')
  formatted = pretty(svg)
  ```

# Related

[svgson-cli](https://github.com/elrumordelaluz/svgson-cli) Transform SVG into `Object` from the Command Line

[element-to-path](https://github.com/elrumordelaluz/element-to-path) Convert SVG element into `path`

[path-that-svg](https://github.com/elrumordelaluz/path-that-svg) Convert entire SVG with `path`

[svg-path-tools](https://github.com/elrumordelaluz/svg-path-tools) Tools to manipulate SVG `path` (d)

## License

MIT © [Lionel T](https://lionel.tzatzk.in)

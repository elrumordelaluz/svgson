# SVGson [![Build Status](https://travis-ci.org/elrumordelaluz/svgson.svg?branch=master)](https://travis-ci.org/elrumordelaluz/svgson)

> Transform `svg` files into `json` notation

## Install

```
$ npm install --save svgson
```

## Usage

```js
var svgson = require('svgson');
var output = svgson('test.svg', { json: true, svgo: true })
```

Get this `console.log(output)` output:
```json
{
  "name": "svg",
  "attrs": {
    "xmlns": "http://www.w3.org/2000/svg",
    "width": "64",
    "height": "64",
    "viewBox": "0 0 64 64"
  },
  "childs": [
    {
      "name": "path",
      "attrs": {
        "class": "st0",
        "d": "M48.5 40.2c-1.2-.8-4.2-1.6-6.5 1.3-2.4 2.9-5.3 7.7-16.2-3.2-11-11-6.1-13.9-3.2-16.2 2.9-2.4 2.1-5.3 1.3-6.5-.9-1.3-6-9.2-6.9-10.5-.9-1.3-2.1-3.4-4.9-3C10 2.4 2 6.6 2 15.6s7.1 20 16.8 29.7C28.4 54.9 39.5 62 48.4 62c9 0 13.2-8 13.5-10 .4-2.8-1.7-4-3-4.9-1.3-1-9.2-6.1-10.4-6.9z"
      }
    }
  ]
}
```

### Options
- Output Type between Object and JSON. `Boolean` Default: `json: false`
- Apply [Svgo](https://github.com/svg/svgo) optimization to the `svg` source. `Boolean` Default: `svgo: false`
- Add custom Svgo [Plugins](https://github.com/svg/svgo#what-it-can-do). `Array` Default: `[ { removeStyleElement: true } ]`
- Add a general **Title** attribute. If from `file` will be the `filename`, if from `String`, the `title` attribute if exist. `Boolean` Default: `title: false`
- Add same custom attributes for each item. `Object` Default: `customAttrs: {}`

```js
var svgson = require('svgson');

var options = {
  json: false,
  svgo: false,
  svgoPlugins: [
    { removeStyleElement: true }
  ],
  title: false,
  customAttrs: {}
};

svgson(source, options);
```

```js
var svgson = require('svgson');

// Object
var out_object = svgson('test.svg');

// JSON
var out_json = svgson('test.svg', { json: true });

// Object with SVG Optimized
var out_object_opt = svgson('test.svg', { svgo: true });

// JSON with SVG Optimized
var out_json_opt = svgson('test.svg', { json: true, svgo: true });

// Object with SVG Optimized with custom plugins
var out_object_custom = svgson('test.svg', {
  svgo: true,
  svgoPlugins: [ { sortAttrs: true } ]
});

// JSON with Title
var out_json_opt = svgson('test.svg', { json: true, title: true });

// JSON with Custom Attributes
var files = ['test.svg', '/svg/at.svg'];
var out_json_opt = svgson(files, {
  json: true,
  customAttrs: {
    hello: 'world',
    generalComment: 'Lorem ipsum dolor sit amet',
    total: files.length
  }
});

```
### Inputs
- File path `Stinrg`
- Directory path `Stinrg`
- SVG data `Stinrg`
- Multiple SVG data `Array`

```js
var svgson = require('svgson');

// Source from single File
var out_from_file = svgson('test.svg');

// Source from Directory
var out_from_dir = svgson('svg');

// Source from Data
var str = '<svg><rect height="100" width="100" stroke="#333"/></svg>';
var out_from_data = svgson(str);

// Source from Multiple Data
var arr = ['<svg><rect height="100" width="100" stroke="#333"/></svg>', '<svg><rect height="250" width="50" fill="#faa"/></svg>'];
var out_from_multiple = svgson(arr);
```

## License

MIT © [Lionel T](https://elrumordelaluz.com)

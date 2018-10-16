<p align="center">
  <img alt="svgson" title="svgson" src="/logo.svg" width="450">
</p>

<p align="center">
  Simple tool to transform <code>svg</code> files and Strings into <code>Object</code> or <code>JSON</code>.
</p>
<p align="center">
  Useful to manipulate <code>SVG</code> with <code>js</code>, to store in noSQL databses.
</p>

<p align="center">
  <a href="https://travis-ci.org/elrumordelaluz/svgson">
    <img src="https://travis-ci.org/elrumordelaluz/svgson.svg?branch=master" alt="Build Status">
  </a>
</p>

🚨🚨🚨
Take a look to [svgson-next](https://github.com/elrumordelaluz/svgson-next) because 🔜 will be the next major version of this _Package_ with lots of improvements (droped dependencies, [reduced bundle size](https://bundlephobia.com/result?p=svgson-next@4.2.0), improved transformations, and more…) 🚨🚨🚨

### How to use

```
$ [sudo] npm install -g svgson
```

```
$ svgson [options] <keywords>
```

### Options

```
    -h, --help             output usage information
    -V, --version          output the version number
    -i, --input [input]    Specifies input folder or file.
                           Default current folder
    -o, --output [output]  Specifies output file. Default ./svgson.json
    -t, --title            Add title from svg filename
    -P, --prefix <prefix>  Remove prefix from title
    -S, --suffix <suffix>  Remove suffix from title
    -k, --key [key]        Specifies a key where include all paths
    -a, --attrs <attrs>    Custom Attributes: key=value, key=value...
    -p, --pretty           Prettyfied JSON
    -s, --svgo             Optimize SVG with SVGO
```

![](https://cdn.rawgit.com/elrumordelaluz/svgson/master/example.gif)

### Examples

- `input` current folder | `output` **svgson.json** file

  ```
  $ svgson
  ```

- `input` **/svgs** folder | `output` **my-svgs.json** file

  ```
  $ svgson --input svgs --output my-svgs.json
  ```

- `input` **myfile.svg** file | `output` **my-file.json** file

  ```
  $ svgson -i myfile.svg -o my-file.json
  ```

- Complex example

  - `input` **/svgs** folder
  - `output` **svgson.json** file
  - adds `title` from each file and removes `icon-` prefix
  - prettifies JSON output
  - group all _paths_ into the key `myPaths`
  - adds `{ author: me, foo: bar }` custom attributes per file
  - optimize output with [svgo](https://github.com/svg/svgo)

  ```
  $ svgson -i ./svgs --title --prefix icon- --pretty --key myPaths --svgo --attrs author=me,foo=bar
  ```

### Use as Node Module

```
$ npm i --save svgson
```

```js
const svgson = require('svgson')

// From .svg file
const fs = require('fs')
fs.readFile('myfile.svg', 'utf-8', function(err, data) {
  svgson(
    data,
    {
      svgo: true,
      title: 'myFile',
      pathsKey: 'myPaths',
      customAttrs: {
        foo: true,
      },
    },
    function(result) {
      console.log(result)
    }
  )
})

// From svg String
const SVG =
  '<svg width="100" height="100"><circle r="15" stroke-linecap="round" /></svg>'
svgson(SVG, {}, result => console.log(result))
```

### Use in Browser

```
$ npm run bundle
```

or

```
$ browserify ./lib/svgson.js --standalone svgson -o svgson-bundle.js
```

then in `html` file

```html
<body>
  <svg viewBox="0 0 100 100" id="mySVG">
  	<circle cx="50" cy="50" r="48" stroke="red" stroke-width="4"/>
  </svg>
  <script src="svgson-bundle.js"></script>
  <script>
    svgson(document.querySelector('#mySVG').outerHTML, {
      title: 'mySVG',
      pathsKey: 'paths',
      customAttrs: {
        a: 123,
        foo: true,
        bar: 'baz'
      }
    }, function(result) {
      console.log(result);
    });
  </script>
</body>
```

### Tests

```
npm test
```

### License

MIT © [Lionel T](https://elrumordelaluz.com)

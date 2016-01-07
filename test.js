'use strict';
var test = require('tape');
var svg2obj = require('./index');
const str = '<svg title="SVG Title" style="fill: green;"><path class="st0" d="M48.5,40.2c-1.2-0.8-4.2-1.6-6.5,1.3c-2.4,2.9-5.3,7.7-16.2-3.2c-11-11-6.1-13.9-3.2-16.2c2.9-2.4,2.1-5.3,1.3-6.5C23,14.3,17.9,6.4,17,5.1c-0.9-1.3-2.1-3.4-4.9-3C10,2.4,2,6.6,2,15.6s7.1,20,16.8,29.7C28.4,54.9,39.5,62,48.4,62c9,0,13.2-8,13.5-10c0.4-2.8-1.7-4-3-4.9C57.6,46.1,49.7,41,48.5,40.2z"/></svg>';
const arr = ['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"><rect x="10" y="10" height="100" width="100" style="stroke:#ff0000; fill: #0000ff"/></svg>', '<svg><rect x="10" y="10" height="200" width="200" stroke="#333"/></svg>'];

test('SVG to Object Test', function (t) {
    t.plan(14);

    // SVG File
    t.equal(typeof svg2obj('test.svg'), 'object', 'SVG file converted to Object');
    t.equal(typeof svg2obj('test.svg', { json: true }), 'string', 'SVG file converted to JSON');

    // Directory
    t.equal(typeof svg2obj('svg'), 'object', 'SVG files in directory converted to Object');
    t.equal(typeof svg2obj('svg', { json: true }), 'string', 'SVG files in directory converted to JSON');
    t.equal(svg2obj('svg') instanceof Array, true, 'Directory results in an Array');

    // Data
    t.equal(typeof svg2obj(str), 'object', 'SVG data converted to Object');
    t.equal(typeof svg2obj(str, { json: true }), 'string', 'SVG data converted to JSON');
    t.equal(svg2obj(arr) instanceof Array, true, 'Array data results in an Array');

    // SVGO
    t.notEqual(
      svg2obj('test.svg', { json: true, svgo: false }),
      svg2obj('test.svg', { json: true, svgo: true }),
      'Output change with svgo active'
    );
    t.notEqual(
      svg2obj('svg', { json: true, svgo: false }),
      svg2obj('svg', { json: true, svgo: true }),
      'Output in more files change with svgo active'
    );

    // Title
    t.equal(svg2obj('test.svg', { svgo: true, title: true }).title, 'test', 'Object title same as File name')
    t.equal(svg2obj(str, { svgo: true, title: true }).title, 'SVG Title', 'Object title same as Title Attribute')
    t.equal(svg2obj(arr[0], { svgo: true, title: true }).title, undefined, 'Object without title when not defined as attribute in String')

    // customAttrs
    t.equal(svg2obj('test.svg', { svgo: true, title: true, customAttrs: { hello: 'world' } }).hello, 'world', 'Assigned Custom Attributes')


});

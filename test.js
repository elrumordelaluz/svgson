const test = require('ava')
const { default: svgson, stringify, parseSync } = require('./dist/svgson.cjs')
const svgo = require('svgo')
const { expect } = require('chai')

const svgoDefaultConfig = {
  plugins: [
    { removeStyleElement: true },
    { removeViewBox: false },
    {
      removeAttrs: {
        attrs: '(stroke-width|stroke-linecap|stroke-linejoin|)',
      },
    },
  ],
  multipass: true,
}

const optimizeSVG = (input, config) => {
  return new svgo(config).optimize(input).then(({ data }) => data)
}

const SVG =
  '<svg viewBox="0 0 100 100" width="100" height="100"><circle r="15" data-name="stroke" stroke-linecap="round"/></svg>'

const SVG2 =
  '<svg viewBox="0 0 100 100" width="100" height="100"><circle r="15" data-name="stroke" stroke-linecap="round" data-custom-data="{&quot;foo&quot;:{&quot;bar&quot;:&quot;baz&quot;}}"/></svg>'

const SVG_WITHOUT_WH =
  '<svg viewBox="0 0 100 100"><circle r="15" data-name="stroke" stroke-linecap="round"/></svg>'

const MULTIPLE_SVG = `
<svg viewBox="0 0 100 100" width="100" height="100">
<circle r="15" data-name="first" stroke-linecap="round"/>
</svg>
<svg viewBox="0 0 50 50" width="50" height="50">
<title>Second SVG</title>
<circle r="15" data-name="second" stroke-linecap="round"/>
</svg>
`
const expected = {
  type: 'element',
  name: 'svg',
  attributes: { width: '100', height: '100', viewBox: '0 0 100 100' },
  value: '',
  children: [
    {
      type: 'element',
      name: 'circle',
      attributes: {
        r: '15',
        'data-name': 'stroke',
        'stroke-linecap': 'round',
      },
      children: [],
      value: '',
    },
  ],
}

const expectedTransformed = {
  tag: 'svg',
  props: { width: '100', height: '100', viewBox: '0 0 100 100' },
  children: [
    {
      tag: 'circle',
      props: {
        r: '15',
        'data-name': 'stroke',
        'stroke-linecap': 'round',
      },
    },
  ],
}

const expectedOptimized = [
  {
    type: 'element',
    name: 'svg',
    attributes: { width: '100', height: '100', viewBox: '0 0 100 100' },
    value: '',
    children: [
      {
        type: 'element',
        name: 'circle',
        attributes: { r: '15', 'data-name': 'stroke' },
        children: [],
        value: '',
      },
    ],
  },
  {
    type: 'element',
    name: 'svg',
    attributes: {},
    value: '',
    children: [
      {
        type: 'element',
        name: 'circle',
        attributes: { r: '15', 'data-name': 'stroke' },
        children: [],
        value: '',
      },
    ],
  },
]

const expectedMultiple = [
  {
    name: 'svg',
    type: 'element',
    value: '',
    attributes: { viewBox: '0 0 100 100', width: '100', height: '100' },
    children: [
      {
        name: 'circle',
        type: 'element',
        value: '',
        attributes: {
          r: '15',
          'stroke-linecap': 'round',
          'data-name': 'first',
        },
        children: [],
      },
    ],
  },
  {
    name: 'svg',
    type: 'element',
    value: '',
    attributes: { viewBox: '0 0 50 50', width: '50', height: '50' },
    children: [
      {
        name: 'title',
        type: 'element',
        value: '',
        attributes: {},
        children: [
          {
            name: '',
            type: 'text',
            value: 'Second SVG',
            attributes: {},
            children: [],
          },
        ],
      },
      {
        name: 'circle',
        type: 'element',
        value: '',
        attributes: {
          r: '15',
          'stroke-linecap': 'round',
          'data-name': 'second',
        },
        children: [],
      },
    ],
  },
]

test('Fullfill a Promise', async (t) => {
  await t.notThrowsAsync(() => svgson(SVG))
})

test('Reject a Promise', async (t) => {
  await t.throwsAsync(() => svgson('abc'))
})

test('Returns an Array when input is more than one SVG', async (t) => {
  const res = await svgson(MULTIPLE_SVG)
  t.true(Array.isArray(res))
})

test('Resulted nodes has basic keys', async (t) => {
  const res = await svgson(SVG)
  const keys = Object.keys(res)
  t.true(keys.includes('type'))
  t.true(keys.includes('name'))
  t.true(keys.includes('attributes'))
  t.true(keys.includes('children'))
})

test('Optimize using default config', async (t) => {
  const optimized = await optimizeSVG(SVG, svgoDefaultConfig)
  const res = await svgson(optimized)
  t.deepEqual(res, expectedOptimized[0])
})

test('Optimize using custom config', async (t) => {
  const optimized = await optimizeSVG(SVG, {
    plugins: [
      {
        removeAttrs: {
          attrs: '(width|height)',
        },
      },
    ],
  })
  const res = await svgson(optimized)
  t.deepEqual(res, expectedOptimized[1])
})

test('Adds custom attributes via transformNode', async (t) => {
  const res = await svgson(SVG, {
    transformNode: (node) => ({
      tag: node.name,
      props: node.attributes,
      ...(node.children && node.children.length > 0
        ? { children: node.children }
        : {}),
    }),
  })

  t.deepEqual(res, expectedTransformed)
})

test('Sync mode works', async (t) => {
  const resSync = parseSync(SVG)
  const res = await svgson(SVG)

  t.deepEqual(res, resSync)
})

test('Sync mode adds custom attributes via transformNode', async (t) => {
  const options = {
    transformNode: (node) => ({
      tag: node.name,
      props: node.attributes,
      ...(node.children && node.children.length > 0
        ? { children: node.children }
        : {}),
    }),
  }

  const resSync = parseSync(SVG, options)
  const res = await svgson(SVG, options)

  t.deepEqual(res, resSync)
})

test('Sync mode throws', (t) => {
  t.throws(() => parseSync('abc'))
})

test.cb('Applies camelCase', (t) => {
  svgson(SVG, {
    camelcase: true,
  }).then((res) => {
    const childrenAttrs = res.children[0].attributes
    expect(childrenAttrs).to.deep.include.keys('strokeLinecap', 'data-name')
    expect(childrenAttrs).to.have.property('strokeLinecap', 'round')
    expect(childrenAttrs).to.have.property('data-name', 'stroke')
    t.end()
  })
})

test('Stringify', async (t) => {
  const res = await svgson(SVG)
  t.is(SVG, stringify(res))
})

test('Stringify using transformAttr', async (t) => {
  const res = await svgson(SVG2)
  t.is(
    SVG2,
    stringify(res, {
      transformAttr: (key, value, escape) => {
        return /^data-/.test(key)
          ? `${key}="${value}"`
          : `${key}="${escape(value)}"`
      },
    })
  )
})

const unescapeAttr = (attr) => {
  return String(attr)
    .replace(/&amp;/g, '&')
    .replace(/&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

test('Parsing and Stringify attributes', async (t) => {
  const res = await svgson(SVG2, {
    transformNode: (node) => {
      if (node.attributes['data-custom-data']) {
        node.attributes['data-custom-data'] = JSON.parse(
          unescapeAttr(node.attributes['data-custom-data'])
        )
      }
      return node
    },
  })
  t.is(
    SVG2,
    stringify(res, {
      transformAttr: (key, value, escape) =>
        `${key}="${escape(
          /^data-custom/.test(key) ? JSON.stringify(value) : value
        )}"`,
    })
  )
})

test('Stringify using transformAttr to remove Attributes conditionally', async (t) => {
  const res = await svgson(SVG)
  t.is(
    SVG_WITHOUT_WH,
    stringify(res, {
      transformAttr: (key, value, escape, name) => {
        return name === 'svg' && /(width|height)/.test(key)
          ? null
          : `${key}="${escape(value)}"`
      },
    })
  )
})

test('Works with doctype', async (t) => {
  const svg = `<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
 viewBox="0 0 32 32">
<path class="st0" d="M16,16v15.5c0,0,9.3-2.6,12.7-15.5H16z"/>
</svg>`
  const res = await svgson(svg)
  const keys = Object.keys(res)
  t.true(keys.includes('name'))
  t.true(res.name === 'svg')
})

const test = require('ava')
const { default: svgson, stringify, parseSync } = require('./dist/svgson.cjs')
const { optimize } = require('svgo')
const transform = require('lodash.transform')
const { expect } = require('chai')

const svgoDefaultConfig = {
  plugins: [
    {
      name: 'preset-default',
      params: {
        overrides: {
          removeViewBox: false,
        },
      },
    },

    'removeStyleElement',
    {
      name: 'removeAttrs',
      params: {
        attrs: '(stroke-width|stroke-linecap|stroke-linejoin|)',
      },
    },
  ],
  multipass: true,
}

const optimizeSVG = (input, config) => {
  const result = optimize(input, config)
  return result.data
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

const expectedCompat = {
  type: 'element',
  name: 'svg',
  attrs: { viewBox: '0 0 100 100', width: '100', height: '100' },
  parent: null,
  value: '',
  childs: [
    {
      type: 'element',
      name: 'circle',
      attrs: {
        r: '15',
        'data-name': 'stroke',
        'stroke-linecap': 'round',
      },
      parent: null,
      value: '',
    },
  ],
}

const expectedTransformed = {
  tag: 'svg',
  props: { width: '100', height: '100', viewBox: '0 0 100 100' },
  parent: null,
  children: [
    {
      tag: 'circle',
      props: {
        r: '15',
        'data-name': 'stroke',
        'stroke-linecap': 'round',
      },
      parent: null,
    },
  ],
}

const expectedOptimized = [
  {
    type: 'element',
    name: 'svg',
    attributes: { width: '100', height: '100', viewBox: '0 0 100 100' },
    parent: null,
    value: '',
    children: [
      {
        type: 'element',
        name: 'circle',
        attributes: { r: '15', 'data-name': 'stroke' },
        parent: null,
        children: [],
        value: '',
      },
    ],
  },
  {
    type: 'element',
    name: 'svg',
    attributes: {},
    parent: null,
    value: '',
    children: [
      {
        type: 'element',
        name: 'circle',
        attributes: { r: '15', 'data-name': 'stroke' },
        parent: null,
        children: [],
        value: '',
      },
    ],
  },
]

function deepTransform(obj, iterator) {
  return transform(obj, (acc, val, key) => {
    const [k, v] = iterator(key, val)
    if (k === undefined) return
    acc[k] =
      typeof v === 'object' && v !== null ? deepTransform(v, iterator) : v
  })
}

test('Fullfill a Promise', async (t) => {
  await t.notThrowsAsync(() => svgson(SVG))
})

test('Reject a Promise', async (t) => {
  await t.throwsAsync(() => svgson('abc'))
})

test('Returns an Array when input is more than one SVG', async (t) => {
  const res = await svgson(MULTIPLE_SVG)
  console.log(res)
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
        name: 'removeAttrs',
        params: {
          attrs:
            '(viewBox|width|height|stroke-width|stroke-linecap|stroke-linejoin|)',
        },
      },
    ],
  })
  const res = await svgson(optimized)
  t.deepEqual(res, expectedOptimized[1])
})

test('Adds custom attributes via transformNode', async (t) => {
  const res = await svgson(SVG, {
    transformNode: (node) =>
      deepTransform(node, (key, value) => {
        if (key === 'name') return ['tag', value]
        if (key === 'attributes') return ['props', value]
        if (key === 'type') return []
        if (key === 'value') return []
        if (key === 'children' && value.length === 0) return []
        return [key, value]
      }),
  })
  t.deepEqual(res, expectedTransformed)
})

test('compat mode via transformNode', async (t) => {
  const res = await svgson(SVG, {
    transformNode: (node) => {
      return deepTransform(node, (key, value) => {
        if (key === 'attributes') return ['attrs', value]
        if (key === 'children') {
          if (value.length === 0) {
            return []
          } else {
            return ['childs', value]
          }
        }
        return [key, value]
      })
    },
  })
  t.deepEqual(res, expectedCompat)
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

test('Applies camelCase', async (t) => {
  const res = await svgson(SVG, {
    camelcase: true,
  })

  const childrenAttrs = res.children[0].attributes
  expect(childrenAttrs).to.deep.include.keys('strokeLinecap', 'data-name')
  expect(childrenAttrs).to.have.property('strokeLinecap', 'round')
  expect(childrenAttrs).to.have.property('data-name', 'stroke')
  // t.end()
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

test('Stringify compat mode via transformNode', async (t) => {
  t.is(
    SVG,
    stringify(expectedCompat, {
      transformNode: (node) =>
        deepTransform(node, (key, value) => {
          if (key === 'attrs') return ['attributes', value]
          if (key === 'childs') return ['children', value]
          return [key, value]
        }),
    })
  )
})

test('Parsing and Stringify attributes', async (t) => {
  const res = await svgson(SVG2, {
    transformNode: (node) =>
      deepTransform(node, (key, value) => {
        if (key === 'data-custom-data') {
          return [key, JSON.parse(unescapeAttr(value))]
        }
        return [key, value]
      }),
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

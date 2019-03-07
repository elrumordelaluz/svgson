import omitDeep from 'omit-deep'
import rename from 'deep-rename-keys'
import clean from 'clean-deep'
import { parseSync } from 'xml-reader'

export const parseInput = input => {
  const parsed = parseSync(input, { parentNodes: false })
  const hasMoreChildren = parsed.name === 'root' && parsed.children.length > 1
  const isValid = hasMoreChildren
    ? parsed.children.reduce((acc, { name }) => {
        return !acc ? name === 'svg' : true
      }, false)
    : parsed.children[0].name === 'svg'

  if (isValid) {
    return hasMoreChildren ? parsed : parsed.children[0]
  } else {
    throw Error('nothing to parse')
  }
}

export const removeDoctype = input => {
  return input.replace(/<[\/]{0,1}(\!?DOCTYPE|\??xml)[^><]*>/gi, '')
}
export const wrapInput = input => `<root>${input}</root>`

export const removeAttrs = obj => omitDeep(obj, ['parent'])

export const addCustomAttrs = (attrs, node) => ({
  ...node,
  ...attrs,
})

export const applyCompat = node => {
  const renamed = rename(node, key => {
    if (key === 'attributes') {
      return 'attrs'
    }
    if (key === 'children') {
      return 'childs'
    }
    return key
  })
  return omitDeep(clean(renamed), ['type'])
}

export const camelize = node => {
  return rename(node, key => {
    if (!notCamelcase(key)) {
      return toCamelCase(key)
    }
    return key
  })
}

export const toCamelCase = prop =>
  prop.replace(/[-|:]([a-z])/gi, (all, letter) => letter.toUpperCase())

const notCamelcase = prop => /^(data|aria)(-\w+)/.test(prop)

export const escapeText = text => {
  if (text) {
    const str = String(text)
    return /[&<>]/.test(str)
      ? `<![CDATA[${str.replace(/]]>/, ']]]]><![CDATA[>')}]]>`
      : str
  }
  return ''
}

export const escapeAttr = attr => {
  return String(attr)
    .replace(/&/g, '&amp;')
    .replace(/'/g, '&apos;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

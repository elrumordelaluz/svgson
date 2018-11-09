import { escapeText, escapeAttr } from './tools'

const stringify = (
  ast,
  {
    transformAttr = (key, value, escape) => `${key}="${escape(value)}"`,
    selfClose = true,
  } = {}
) => {
  if (Array.isArray(ast)) {
    return ast.map(ast => stringify(ast, { transformAttr, selfClose })).join('')
  }

  if (ast.type === 'text') {
    return escapeText(ast.value)
  }

  let attributes = ''
  for (const attr in ast.attributes) {
    const attrStr = transformAttr(
      attr,
      ast.attributes[attr],
      escapeAttr,
      ast.name
    )
    attributes += attrStr ? ` ${attrStr}` : ''
  }

  return ast.children.length || !selfClose
    ? `<${ast.name}${attributes}>${stringify(ast.children, {
        transformAttr,
        selfClose,
      })}</${ast.name}>`
    : `<${ast.name}${attributes}/>`
}

export default stringify

import { escapeText, escapeAttr } from './tools'

const stringify = (
  _ast,
  {
    transformAttr = (key, value, escape) => `${key}="${escape(value)}"`,
    transformNode = (node) => node,
    selfClose = true,
  } = {}
) => {
  if (Array.isArray(_ast)) {
    return _ast
      .map((ast) => stringify(ast, { transformAttr, selfClose, transformNode }))
      .join('')
  }

  let ast = transformNode(_ast)

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

  return (ast.children && ast.children.length > 0) || !selfClose
    ? `<${ast.name}${attributes}>${stringify(ast.children, {
        transformAttr,
        transformNode,
        selfClose,
      })}</${ast.name}>`
    : `<${ast.name}${attributes}/>`
}

export default stringify

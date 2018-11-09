import {
  parseInput,
  wrapInput,
  removeDoctype,
  removeAttrs,
  camelize,
  applyCompat,
} from './tools'

const svgson = function svgson(
  input,
  { transformNode = node => node, compat = false, camelcase = false } = {}
) {
  const wrapper = input => {
    const cleanInput = removeDoctype(input)
    return wrapInput(cleanInput)
  }
  const parser = input => parseInput(input)

  const applyFilters = input => {
    const applyTransformNode = node => {
      const children = compat ? node.childs : node.children
      return node.name === 'root'
        ? children.map(applyTransformNode)
        : {
            ...transformNode(node),
            ...(children && children.length > 0
              ? {
                  [compat ? 'childs' : 'children']: children.map(
                    applyTransformNode
                  ),
                }
              : {}),
          }
    }
    let n
    n = removeAttrs(input)
    if (compat) {
      n = applyCompat(n)
    }
    n = applyTransformNode(n)
    if (camelcase || compat) {
      n = camelize(n)
    }
    return Promise.resolve(n)
  }

  return wrapper(input)
    .then(parser)
    .then(applyFilters)
    .then(res => (res.name === 'root' ? res.children : res))
}

export default svgson

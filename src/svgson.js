import {
  parseInput,
  wrapInput,
  removeDoctype,
  removeAttrs,
  camelize,
} from './tools'

export const svgsonSync = function svgsonSync(
  input,
  { transformNode = node => node, camelcase = false } = {}
) {
  const wrap = input => {
    const cleanInput = removeDoctype(input)
    return wrapInput(cleanInput)
  }

  const unwrap = res => {
    return res.name === 'root' ? res.children : res
  }

  const applyFilters = input => {
    const applyTransformNode = node => {
      const children = node.children
      return node.name === 'root'
        ? children.map(applyTransformNode)
        : {
            ...transformNode(node),
            ...(children && children.length > 0
              ? {
                  children: children.map(applyTransformNode),
                }
              : {}),
          }
    }
    let n
    n = removeAttrs(input)
    n = applyTransformNode(n)
    if (camelcase) {
      n = camelize(n)
    }
    return n
  }

  return unwrap(applyFilters(parseInput(wrap(input))))
}

export default function svgson(...args) {
  return new Promise((resolve, reject) => {
    try {
      const res = svgsonSync(...args)
      resolve(res)
    } catch (e) {
      reject(e)
    }
  })
}

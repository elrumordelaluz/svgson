import {
  parseInput,
  wrapInput,
  removeDoctype,
  removeAttrs,
  camelize,
} from './tools'

export const svgsonSync = function svgsonSync(
  input,
  { transformNode = (node) => node, camelcase = false } = {}
) {
  const wrap = (input) => {
    const cleanInput = removeDoctype(input)
    return wrapInput(cleanInput)
  }

  const unwrap = (res) => {
    return res.name === 'root' ? res.children : res
  }

  const applyFilters = (input) => {
    let n
    n = removeAttrs(input)
    n = transformNode(n)
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

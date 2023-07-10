import { parseInput, camelize } from './tools'

export const svgsonSync = function svgsonSync(
  input,
  { transformNode = (node) => node, camelcase = false } = {}
) {
  const applyFilters = (input) => {
    let n
    n = transformNode(input)
    if (camelcase) {
      n = camelize(n)
    }
    return n
  }

  return applyFilters(parseInput(input))
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

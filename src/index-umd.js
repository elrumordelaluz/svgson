import svgson, { svgsonSync } from './svgson'
import stringify from './stringify'
export default Object.assign({}, { parse: svgson, parseSync: svgsonSync, stringify })

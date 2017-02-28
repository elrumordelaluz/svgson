'use strict';

const htmlparser = require("htmlparser2");
const svgo = require('svgo');

const filterTags = (node) => node.filter(n => {
  return n.type === 'tag' || (n.type === 'text' && /([^\s])/.test(n.data));
});

const setRoot = (source) => {
  if (Array.isArray(source)) {
    const onlyTag = filterTags(source);
    return onlyTag.length === 1 ? onlyTag[0] : onlyTag;
  }

  return source;
}

const camelCase = (prop) => {
  return prop.replace(/[-|:]([a-z])/gi, (all, letter) => letter.toUpperCase());
};

const isDataAttr = (prop) => /^data(-\w+)/.test(prop)

const generate = (source) => {
  const root = setRoot(source);
  let obj = {};

  if (Array.isArray(root)) {
    return root.map(node => generate(node))
  }

  if (root.type === 'tag') {
    obj.name = root.name;

    if (root.attribs) {
      obj.attrs = {}
      for (var attr in root.attribs) {
        if (root.attribs.hasOwnProperty(attr)) {
          obj.attrs[
            isDataAttr(attr) 
            ? attr 
            : camelCase(attr)
          ] = root.attribs[attr]
        }
      }
    }

    if (root.children) {
      obj.childs = filterTags(root.children).map(node => generate(node));
      if (!obj.childs.length)
        delete obj.childs
    }
  } else if (root.type === 'text') {
    obj.text = root.data;
  }

  return obj;
}

const optimize = (should, input, plugins, callback) => {
  should ? new svgo(plugins).optimize(input, result => callback(result.data)) : callback(input);
};

const parseAndGenerate = (input, callback) => {
  const dom = htmlparser.parseDOM(input, { xmlMode: true });
  callback(generate(dom), setRoot(dom));
};


module.exports = function (input, options, callback) {
  const initialConfig = {
    svgo: false,
    svgoConfig: {
      plugins: [
        { removeStyleElement: true },
        { removeAttrs: {
            attrs: '(stroke-width|stroke-linecap|stroke-linejoin)'
          }
        }
      ],
      multipass: true
    },
    title: null,
    pathsKey: null,
    customAttrs: {},
  }

  const config = Object.assign({}, initialConfig, options);
  const hasCustomAttrs = Object.getOwnPropertyNames(config.customAttrs).length !== 0;
  const wrapInKey = (key, node) => ({ [key]: node });

  const _processOne = (node, more) => {
    const nod = config.pathsKey ? wrapInKey(config.pathsKey, node) : node;
    return hasCustomAttrs
      ? Object.assign({}, nod, config.customAttrs, more)
      : Object.assign({}, nod, more);
  };

  return optimize(config.svgo, input, config.svgoConfig, r => {
    parseAndGenerate(r, (generated, root) => {
      const isArray = Array.isArray(root);
      const more = config.title ? { title: config.title } : {};

      if (isArray) {
        callback( generated.map((node, i) => _processOne(node, more)) );
      } else {
        callback( _processOne(generated, more) )
      }

    });
  });

};

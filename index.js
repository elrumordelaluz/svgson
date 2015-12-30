'use strict';
var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    xmldom = require('xmldom'),
    DOMParser = xmldom.DOMParser,
    SVGO = require('svgo'),
    exist = require('./existsSync');

var camelCase = function (prop) {
  return prop.replace(/[-|:]([a-z])/gi, function (all, letter) {
    return letter.toUpperCase();
  });
};

module.exports = function(input, options) {
  var config = {
    json: false,
    svgo: false,
    svgoPlugins: [
      { removeStyleElement: true }
      ]
  };
  
  for(var prop in options) {
    if(options.hasOwnProperty(prop)){
      config[prop] = options[prop];
    }
  }

  var data;

  var parse = function(input) {
    var doc = new DOMParser().parseFromString(input);
    return doc.documentElement ? doc.documentElement : undefined;
  };

  var generate = function(source) {
    var obj = {}; 
    if (source.nodeType === 1) {
      obj.name = source.nodeName;

      if (source.attributes.length > 0) {
        obj.attrs = {};
        [].slice.call(source.attributes).forEach(function(item) {
          obj.attrs[camelCase(item.name)] = item.value;
        });
      }

    }

    if (source.hasChildNodes()) {
      var elements = [];
      for (var i = 0; i < source.childNodes.length; i++) {
        var item = source.childNodes.item(i);
        if (item.nodeType == 1 || (item.nodeType == 3 && /\S/.test(item.nodeValue))) {
          var nodeName = item.nodeName;
          elements.push(generate(item));
        }
      };
      obj['childs'] = elements;
    }

    return obj;
  };

  // TODO: review output stuff based on configs
  var r;
  if (exist(input)) {
    data = fs.readFileSync(input, 'utf8')
    if (parse(data)) {
      if (config.svgo) {
        new SVGO({ plugins: config.svgoPlugins }).optimize(data, function(result) {
          r = parse(result.data);
        });  
      } else {
        r = parse(data);
      }
    }
    
    if (config.json) {
      return r ? JSON.stringify(generate(r), null, 2) : false;
    } else {
      return r ? generate(r) : false;
    }

  } else {
    data = input;
    if (parse(data)) {
      if (config.svgo) {
        new SVGO({ plugins: config.svgoPlugins }).optimize(data, function(result) {
          r = parse(result.data);
        });  
      } else {
        r = parse(data);
      }
    }

    if (config.json) {
      return r ? JSON.stringify(generate(r), null, 2) : false;
    } else {
      return r ? generate(r) : false;
    }

  }
  
};

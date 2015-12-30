'use strict';
var fs = require('fs'),
    path = require('path'),
    async = require('async'),
    xmldom = require('xmldom'),
    DOMParser = xmldom.DOMParser,
    SVGO = require('svgo'),
    svgo = new SVGO({
      plugins: [{
        removeStyleElement: true
      }]
    });

var exist = require('./existsSync');

var camelCase = function (prop) {
  return prop.replace(/[-|:]([a-z])/gi, function (all, letter) {
    return letter.toUpperCase();
  });
};

module.exports = function(input, options) {
  var config = {
    json: false,
    svgo: false
  };
  
  for(var prop in options) {
    if(options.hasOwnProperty(prop)){
      config[prop] = options[prop];
    }
  }

  var data;

  var parse = function(input) {
    var doc = new DOMParser().parseFromString(input);
    return doc.documentElement ? doc : undefined;
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

    } else if (source.nodeType == 3 && /\S/.test(source.nodeValue)) {
      obj.name = 'text';
      obj.content = source.nodeValue;
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

    return config.json ? JSON.stringify(obj, null, 2) : obj;
  };

  var optimize = function (input) {
    svgo.optimize(input, function(result) {
        return result.data;
    });
  }

  var r;
  if (exist(input)) {
    data = fs.readFileSync(input, 'utf8')
    if (parse(data)) {
      if (config.svgo) {
        svgo.optimize(data, function(result) {
          r = parse(result.data);
        });  
      } else {
        r = parse(data);
      }
    }
    return r ? generate(r) : false;
  } else {
    data = input;
    if (parse(data)) {
      if (config.svgo) {
        svgo.optimize(data, function(result) {
          r = parse(result.data);
        });  
      } else {
        r = parse(data);
      }
    }
    return r ? generate(r) : false;
  }
  
};

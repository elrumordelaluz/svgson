const chai = require('chai');
const expect = chai.expect;
const svgson = require('../lib/svgson');

const SVG = '<svg viewBox="0 0 100 100" width="100" height="100"><circle r="15" stroke-linecap="round" /></svg>';
const expected = {
  name: 'svg',
  attrs: { width: '100', height: '100', viewBox: '0 0 100 100' },
  childs: [
    {
      name: 'circle',
      attrs: { r: '15', 'strokeLinecap': 'round' }
    }
  ]
};

const expected2 = {
  name: 'svg',
  attrs: { viewBox: '0 0 100 100' },
  childs: [
    {
      name: 'circle',
      attrs: { r: '15' }
    }
  ]
};

describe('svgson', () => {

  it('returns an Object', () => {
    svgson(SVG, {}, res => {
      expect(res).to.be.an('object');
      expect(res).to.eql(expected);
    });
  });

  it('has basic keys', () => {
    svgson(SVG, {}, res => {
      expect(res).to.include.keys('attrs', 'childs', 'name');
    });
  });

  it('adds title key', () => {
    svgson(SVG, {
        title: 'mySVG'
      }, res => {
        expect(res).to.have.property('title', 'mySVG');
    });
  });

  it('wrap output in pathKey', () => {
    svgson(SVG, {
        pathsKey: 'paths'
      }, res => {
        expect(res).to.include.key('paths');
        expect(res).to.eql({
          paths: expected
        });
    });
  });

  it('adds custom attributes', () => {
    svgson(SVG, {
        customAttrs: {
          foo: 'bar',
          test: true
        }
      }, res => {
        expect(res).to.include.keys('foo', 'test');
        expect(res).to.have.property('foo', 'bar');
        expect(res).to.have.property('test', true);
        expect(res).to.eql(Object.assign({}, expected, {
          foo: 'bar',
          test: true
        }));
    });
  });

  it('optimize with svgo', () => {
    svgson(SVG, {
        svgo: true
      }, res => {
        expect(res).not.to.eql(expected);
        expect(res).not.to.have.deep.property("childs[0].attrs.stroke-linecap");
    });
  });

  it('optimize with svgo and custom plugins', () => {
    svgson(SVG, {
        svgo: true,
        svgoConfig: {
          plugins: [
            { removeAttrs: {
                attrs: '(width|height)'
              }
            }
          ]
        }
      }, res => {
        expect(res).to.eql(expected2);
    });
  });

});

const chai = require('chai');
const expect = chai.expect;
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
const svgson = require('../lib/svgson');

// describe('svgson-cli', () => {
//
//   it('1', (done) => {
//     exec('svgon -i examples/svg', (err, stdout) => {
//       console.log/stdout
//       done();
//     });
//   });
//
// });

var theCWD = process.cwd();
console.log(theCWD + '/hola.json')
exec('./bin/svgson.js -i examples/svg --output ' + theCWD + '/hola.json', {encoding: 'binary'}, (err, stdout, stderr) => {
  console.log(err,stdout, stderr)
});

// console.log(a)

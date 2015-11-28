console.log("importing test.js")
module.exports.sum =  function sum(a,b){
  return a+b;
}
exports.pi=3.14;
var SVG = require('../bower_components/svg.js/dist/svg.js');
console.log("!!!");
console.log(SVG);
// var svg=SVG("main");
// var rect = svg.rect(100, 100).attr({ fill: '#f06'})
// class App {
//   constructor(url,id){
//     this.svg=SVG(id);
//     this.status="initializing";
//     this.rest={};
//   }
// }

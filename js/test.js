"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.sum = sum;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function sum(a, b) {
  return a + b;
}

var pi = 3.14;
exports.pi = pi;
var svg = SVG("main");
var rect = svg.rect(100, 100).attr({ fill: '#f06' });

var App = function App(url, id) {
  _classCallCheck(this, App);

  this.svg = SVG(id);
  this.status = "initializing";
  this.rest = {};
};
//# sourceMappingURL=test.js.map
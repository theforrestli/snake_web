(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _testJs = require("./test.js");

var math = _interopRequireWildcard(_testJs);

console.log("2π = " + math.sum(math.pi, math.pi));

},{"./test.js":2}],2:[function(require,module,exports){
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

},{}]},{},[1])


//# sourceMappingURL=main.js.map
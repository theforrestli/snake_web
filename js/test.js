(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

module.exports = function blobToBuffer(blob, cb) {
  if (blob == undefined) {
    return cb(new Uint8Array());
  }

  var fileReader = new FileReader();

  fileReader.onloadend = function (event) {
    var uint8ArrayNew = new Uint8Array(event.target.result);
    cb(uint8ArrayNew);
  };

  fileReader.readAsArrayBuffer(blob);
};

},{}],2:[function(require,module,exports){
"use strict";

var D_EAST = 0;
var D_SOUTH = 1;
var D_WEST = 2;
var D_NORTH = 3;
var D_OTHER = 4;
var D_OP_MASK = 2;
var BT_EMPTY = 0;
var BT_SNAKE = 1;
exports.D = {
  EAST: 0,
  SOUTH: 1,
  WEST: 2,
  NORTH: 3,
  OTHER: 4,
  OTHER_T: 6,
  OP_MASK: 2
};
exports.B = {
  EMPTY: 0,
  SNAKE: 1,
  FOOD: 2,
  BLOCK: 3
};
exports.H = {
  applyDirection: function applyDirection(_ref, d) {
    var x = _ref.x,
        y = _ref.y;

    switch (d) {
      case D_NORTH:
        y -= 1;
        break;

      case D_SOUTH:
        y += 1;
        break;

      case D_WEST:
        x -= 1;
        break;

      case D_EAST:
        x += 1;
        break;

      default:
        break;
    }

    return {
      x: x,
      y: y
    };
  },
  cloneBox: function cloneBox(b) {
    return [b[0], $.extend({}, b[1])];
  }
};

},{}],3:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));

var _require = require('consts'),
    D = _require.D,
    B = _require.B,
    H = _require.H;

var _require2 = require('events'),
    EventEmitter = _require2.EventEmitter;

var xor128 = require('seedrandom/lib/xor128');

var _ = require("underscore");

var blobToBuffer = require('blob_to_buffer');

module.exports =
/*#__PURE__*/
function (_EventEmitter) {
  (0, _inherits2["default"])(Game, _EventEmitter);

  function Game(json) {
    var _this2;

    (0, _classCallCheck2["default"])(this, Game);
    _this2 = (0, _possibleConstructorReturn2["default"])(this, (0, _getPrototypeOf2["default"])(Game).call(this));
    if (json.version != 1) throw "wrong version";
    _this2.json = json;
    var user2index = new Map();
    var random = xor128("", {
      state: json.seed
    });

    _.each(json.snakes, function (snake, index) {
      if (snake) {
        user2index.set(snake.name, index);
      }
    });

    _this2.cache = {
      user2index: user2index,
      random: random,
      //TODO
      food: 0
    };
    return _this2;
  }

  (0, _createClass2["default"])(Game, [{
    key: "tick",
    value: function tick() {
      var _this = this;

      var json = this.json;
      json.snakes.forEach(function (snake) {
        if (snake === undefined) {
          return;
        }

        if (--snake.tick !== 0) {
          return;
        }

        snake.tick = 1; //TODO

        var p1 = snake.head;

        var b1 = _this.getBox(snake.head);

        if (b1[1].h == D.OTHER) {
          return;
        }

        var p2 = H.applyDirection(p1, b1[1].h);

        var b2 = _this.getBox(p2);

        switch (b2[0]) {
          case B.FOOD:
            snake.remain += b2[1].q;

            _this.setBox(p2, [B.EMPTY, {}]); //TODO


            if (_this.cache.food >= 0) {
              _this.setBox(_this.randomFreeLocation(), [B.FOOD, {
                q: 1
              }]);
            } else {
              _this.cache.food++;
            }

          case B.EMPTY:
            _this.setBox(p2, [B.SNAKE, {
              h: b1[1].h,
              t: b1[1].h ^ D.OP_MASK,
              s: snake.index
            }]);

            snake.head = p2;

            if (snake.remain > 0) {
              snake.remain--;
              snake.length++;
              return;
            }

            p1 = snake.tail;
            b1 = _this.getBox(p1);
            p2 = H.applyDirection(p1, b1[1].h);
            b2 = _this.getBox(p2);
            snake.tail = p2;

            _this.setBox(p1, [B.EMPTY, {}]);

            break;

          case B.BLOCK:
          case B.SNAKE:
            destroySnake(_this, snake);

            var _this$randomFreeLocat = _this.randomFreeLocation(),
                x = _this$randomFreeLocat.x,
                y = _this$randomFreeLocat.y;

            _this.join({
              x: x,
              y: y,
              name: snake.name,
              remain: 3
            });

            break;
        }
      });
    }
  }, {
    key: "randomFreeLocation",
    value: function randomFreeLocation() {
      while (true) {
        var r = randomRange(this.cache.random, this.json.width * this.json.height);

        if (this.json.grid[r][0] == B.EMPTY) {
          return {
            x: r % this.json.width,
            y: r / this.json.width | 0
          };
        }
      }
    }
  }, {
    key: "setSeed",
    value: function setSeed(seed) {
      this.cache.random = xor128(seed, {
        state: true
      });
    }
  }, {
    key: "handleCommand2",
    value: function handleCommand2(cmd) {
      var c = cmd[cmd.command];

      switch (cmd.command) {
        case "tickCommand":
          if (c.randomSeed.length > 0) {
            this.setSeed(c.randomSeed);
          }

          this.tick();
          break;

        case "idCommand":
          if (c.oldId == "" && c.newId != "") {
            var _this$randomFreeLocat2 = this.randomFreeLocation(),
                x = _this$randomFreeLocat2.x,
                y = _this$randomFreeLocat2.y;

            this.join({
              x: x,
              y: y,
              name: c.newId,
              remain: 3
            });
          } else if (c.oldId != "" && c.newId == "") {
            var snake = this.json.snakes[this.cache.user2index.get(c.oldId)];

            if (snake == undefined) {
              throw "snake not exist";
            }

            destroySnake(this, snake);
          } else {
            throw "unknown error";
          }

          break;

        case "writerCommand":
          var dir = c.command[0];

          if (dir >= 4) {
            throw "unknown dir";
          }

          var json = game.json;
          var snake = json.snakes[this.cache.user2index.get(c.id)];
          var box1 = game.getBox(snake.head);

          if (box1[1].t == dir) {
            throw "move oppo";
          }

          box1[1].h = dir;
      }
    }
  }, {
    key: "handleCommands",
    value: function handleCommands(cmds) {
      var _this3 = this;

      cmds.forEach(function (cmd) {
        try {
          handlers[cmd[0]](cmd[1], _this3);
        } catch (e) {
          console.error("illegal command: " + JSON.stringify(cmd));
          console.error(e);
        }
      });
    }
  }, {
    key: "getBox",
    value: function getBox(_ref) {
      var x = _ref.x,
          y = _ref.y;
      var index = y * this.json.width + x;
      return this.json.grid[index];
    }
  }, {
    key: "getSnakeSize",
    value: function getSnakeSize() {
      return this.cache.user2index.size;
    }
  }, {
    key: "setSnake",
    value: function setSnake(index, snake) {
      var oldSnake = this.json.snakes[index];

      if (this.json.snakes[index] != undefined) {
        this.cache.user2index["delete"](oldSnake.name);
      }

      if (snake != undefined) {
        this.cache.user2index.set(snake.name, index);
      }

      this.json.snakes[index] = snake;
    }
  }, {
    key: "join",
    value: function join(data) {
      var x = data.x,
          y = data.y;
      var box = this.getBox({
        x: x,
        y: y
      });
      var json = this.json;

      if (box[0] != B.EMPTY) {
        throw "box taken";
      }

      var index = findNextEmpty(json.snakes);
      var snake = {
        age: 0,
        index: index,
        head: {
          x: x,
          y: y
        },
        length: 1,
        name: data.name,
        remain: data.remain,
        tail: {
          x: x,
          y: y
        },
        tick: 1,
        pretty: data.pretty
      };
      this.setSnake(index, snake);
      this.setBox({
        x: x,
        y: y
      }, [B.SNAKE, {
        h: D.OTHER,
        s: snake.index,
        t: D.OTHER_T
      }]); //TODO

      if (this.cache.food >= 0) {
        this.setBox(this.randomFreeLocation(), [B.FOOD, {
          q: 1
        }]);
      } else {
        this.cache.food++;
      }
    }
  }, {
    key: "setBox",
    value: function setBox(_ref2, b2) {
      var x = _ref2.x,
          y = _ref2.y;
      var index = y * this.json.width + x;
      var b1 = this.json.grid[index];
      this.json.grid[index] = b2;
      this.emit("box", {
        x: x,
        y: y
      }, b1, b2);
    }
  }]);
  return Game;
}(EventEmitter);

var handlers = {
  tick: function tick(data, game) {
    game.tick();
  },
  join: function join(data, game) {
    game.join(data);
  },
  direction: function direction(data, game) {
    var json = game.json;
    var snake = json.snakes[data.s];
    var box1 = game.getBox(snake.head);

    if (box1[1].t == data.d) {
      throw "move oppo";
    }

    box1[1].h = data.d;
  },
  food: function food(data, game) {
    var b1 = game.getBox(data);

    if (b1[0] != B.EMPTY) {
      throw "box taken";
    }

    game.setBox(data, [B.FOOD, {
      q: data.q
    }]);
  },
  leave: function leave(data, game) {
    var snake = game.json.snakes[data.s];

    if (snake == undefined) {
      throw "snake not exist";
    }

    destroySnake(game, snake);
  }
};

function findNextEmpty(list) {
  var t = 0;

  while (list[t] != undefined) {
    t++;
  }

  return t;
}

;

function destroySnake(game, snake) {
  var p1 = snake.head;
  var b1 = game.getBox(snake.head);

  while (b1[0] == B.SNAKE && b1[1].s == snake.index) {
    game.setBox(p1, [B.EMPTY, {}]);
    p1 = H.applyDirection(p1, b1[1].t);
    b1 = game.getBox(p1);
  }

  game.cache.food--;
  game.setSnake(snake.index, undefined);
}

function randomRange(rand, range) {
  var max = (4294967296 / range | 0) * range;

  while (true) {
    var next = rand.int32() + 2147483648;

    if (next < max) {
      return next % range;
    }
  }
}

},{"@babel/runtime/helpers/classCallCheck":8,"@babel/runtime/helpers/createClass":9,"@babel/runtime/helpers/getPrototypeOf":11,"@babel/runtime/helpers/inherits":12,"@babel/runtime/helpers/interopRequireDefault":13,"@babel/runtime/helpers/possibleConstructorReturn":14,"blob_to_buffer":1,"consts":2,"events":17,"seedrandom/lib/xor128":18,"underscore":19}],4:[function(require,module,exports){
"use strict";

var _require = require('consts'),
    B = _require.B;

module.exports = function (param) {
  var size = param.width * param.height;
  var grid = [];

  for (var t = 0; t < size; t++) {
    grid[t] = [B.EMPTY, {}];
  }

  for (var t = 0; t < param.width; t++) {
    grid[t] = [B.BLOCK, {}];
    grid[size - 1 - t] = [B.BLOCK, {}];
  }

  for (var t = 0; t < param.height; t++) {
    grid[t * param.width] = [B.BLOCK, {}];
    grid[size - 1 - t * param.width] = [B.BLOCK, {}];
  }

  var game = {
    version: 1,
    config: {
      startRemain: 5
    },
    seed: {
      x: 1,
      y: 2,
      z: 3,
      w: 4
    },
    width: param.width,
    height: param.height,
    grid: grid,
    snakes: [],
    tick: 0
  };
  return {
    game: game
  };
};

},{"consts":2}],5:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));

var _require = require('consts'),
    B = _require.B;

var SVG = require('svg.js/svg'); //view listens game


module.exports =
/*#__PURE__*/
function () {
  function View(el, game) {
    var _this = this;

    (0, _classCallCheck2["default"])(this, View);
    this.svg = SVG(el);
    this.main = this.svg.group();
    this.main.scale(10);
    this.game = game;
    this.grid = [];
    this.init(); // this.symbols = [];
    // this.symbols[B.EMPTY] = this.svg.symbol()
    // this.symbols[B.SNAKE] = this.svg.symbol()

    $(window).on("resize", function (e) {
      _this.svg.size(window.width(), window.height());
    });
    game.on('box', function (p, b1, b2) {
      _this.setBox(p, b1, b2);
    });
  }

  (0, _createClass2["default"])(View, [{
    key: "init",
    value: function init() {
      for (var t1 = 0; t1 < this.game.json.height; t1++) {
        this.grid[t1] = [];

        for (var t2 = 0; t2 < this.game.json.width; t2++) {
          var group = this.main.group();
          group.translate(t2, t1);
          this.grid[t1 * this.game.json.width + t2] = group;
          this.setBox({
            x: t2,
            y: t1
          }, undefined, this.game.json.grid[t1 * this.game.json.width + t2]);
        }
      }
    }
  }, {
    key: "setBox",
    value: function setBox(p, b1, b2) {
      var vbox = this.grid[p.y * this.game.json.width + p.x];
      vbox.children().forEach(function (e) {
        return e.remove();
      });

      switch (b2[0]) {
        case B.EMPTY:
          break;

        case B.SNAKE:
          var rect = vbox.rect(1, 1);
          rect.fill({
            color: colors[b2[1].s]
          });
          break;

        case B.FOOD:
          var circle = vbox.circle(1);
          circle.fill({
            color: "#f00"
          });
          break;

        case B.BLOCK:
          var rect = vbox.rect(1, 1);
          rect.fill({
            color: "#aaa"
          });
          break;
      }
    }
  }]);
  return View;
}();

var colors = ["#000", "#00f", "#0f0", "#f442d9", "#db7f00", "#019ec1"];

},{"@babel/runtime/helpers/classCallCheck":8,"@babel/runtime/helpers/createClass":9,"@babel/runtime/helpers/interopRequireDefault":13,"consts":2,"svg.js/svg":6}],6:[function(require,module,exports){
/*!
* svg.js - A lightweight library for manipulating and animating SVG.
* @version 2.2.1
* http://www.svgjs.com
*
* @copyright Wout Fierens <wout@impinc.co.uk>
* @license MIT
*
* BUILT: Wed Nov 18 2015 14:42:33 GMT+0100 (Mitteleuropäische Zeit)
*/
;

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = root.document ? factory(root, root.document) : function (w) {
      return factory(w, w.document);
    };
  } else {
    root.SVG = factory(root, root.document);
  }
})(typeof window !== "undefined" ? window : this, function (window, document) {
  // The main wrapping element
  var SVG = this.SVG = function (element) {
    if (SVG.supported) {
      element = new SVG.Doc(element);
      if (!SVG.parser) SVG.prepare(element);
      return element;
    }
  }; // Default namespaces


  SVG.ns = 'http://www.w3.org/2000/svg';
  SVG.xmlns = 'http://www.w3.org/2000/xmlns/';
  SVG.xlink = 'http://www.w3.org/1999/xlink';
  SVG.svgjs = 'http://svgjs.com/svgjs'; // Svg support test

  SVG.supported = function () {
    return !!document.createElementNS && !!document.createElementNS(SVG.ns, 'svg').createSVGRect;
  }(); // Don't bother to continue if SVG is not supported


  if (!SVG.supported) return false; // Element id sequence

  SVG.did = 1000; // Get next named element id

  SVG.eid = function (name) {
    return 'Svgjs' + capitalize(name) + SVG.did++;
  }; // Method for element creation


  SVG.create = function (name) {
    // create element
    var element = document.createElementNS(this.ns, name); // apply unique id

    element.setAttribute('id', this.eid(name));
    return element;
  }; // Method for extending objects


  SVG.extend = function () {
    var modules, methods, key, i; // Get list of modules

    modules = [].slice.call(arguments); // Get object with extensions

    methods = modules.pop();

    for (i = modules.length - 1; i >= 0; i--) if (modules[i]) for (key in methods) modules[i].prototype[key] = methods[key]; // Make sure SVG.Set inherits any newly added methods


    if (SVG.Set && SVG.Set.inherit) SVG.Set.inherit();
  }; // Invent new element


  SVG.invent = function (config) {
    // Create element initializer
    var initializer = typeof config.create == 'function' ? config.create : function () {
      this.constructor.call(this, SVG.create(config.create));
    }; // Inherit prototype

    if (config.inherit) initializer.prototype = new config.inherit(); // Extend with methods

    if (config.extend) SVG.extend(initializer, config.extend); // Attach construct method to parent

    if (config.construct) SVG.extend(config.parent || SVG.Container, config.construct);
    return initializer;
  }; // Adopt existing svg elements


  SVG.adopt = function (node) {
    // make sure a node isn't already adopted
    if (node.instance) return node.instance; // initialize variables

    var element; // adopt with element-specific settings

    if (node.nodeName == 'svg') element = node.parentNode instanceof SVGElement ? new SVG.Nested() : new SVG.Doc();else if (node.nodeName == 'linearGradient') element = new SVG.Gradient('linear');else if (node.nodeName == 'radialGradient') element = new SVG.Gradient('radial');else if (SVG[capitalize(node.nodeName)]) element = new SVG[capitalize(node.nodeName)]();else element = new SVG.Element(node); // ensure references

    element.type = node.nodeName;
    element.node = node;
    node.instance = element; // SVG.Class specific preparations

    if (element instanceof SVG.Doc) element.namespace().defs(); // pull svgjs data from the dom (getAttributeNS doesn't work in html5)

    element.setData(JSON.parse(node.getAttribute('svgjs:data')) || {});
    return element;
  }; // Initialize parsing element


  SVG.prepare = function (element) {
    // Select document body and create invisible svg element
    var body = document.getElementsByTagName('body')[0],
        draw = (body ? new SVG.Doc(body) : element.nested()).size(2, 0),
        path = SVG.create('path'); // Insert parsers

    draw.node.appendChild(path); // Create parser object

    SVG.parser = {
      body: body || element.parent(),
      draw: draw.style('opacity:0;position:fixed;left:100%;top:100%;overflow:hidden'),
      poly: draw.polyline().node,
      path: path
    };
  }; // Storage for regular expressions


  SVG.regex = {
    // Parse unit value
    unit: /^(-?[\d\.]+)([a-z%]{0,2})$/ // Parse hex value
    ,
    hex: /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i // Parse rgb value
    ,
    rgb: /rgb\((\d+),(\d+),(\d+)\)/ // Parse reference id
    ,
    reference: /#([a-z0-9\-_]+)/i // Parse matrix wrapper
    ,
    matrix: /matrix\(|\)/g // Elements of a matrix
    ,
    matrixElements: /,*\s+|,/ // Whitespace
    ,
    whitespace: /\s/g // Test hex value
    ,
    isHex: /^#[a-f0-9]{3,6}$/i // Test rgb value
    ,
    isRgb: /^rgb\(/ // Test css declaration
    ,
    isCss: /[^:]+:[^;]+;?/ // Test for blank string
    ,
    isBlank: /^(\s+)?$/ // Test for numeric string
    ,
    isNumber: /^-?[\d\.]+$/ // Test for percent value
    ,
    isPercent: /^-?[\d\.]+%$/ // Test for image url
    ,
    isImage: /\.(jpg|jpeg|png|gif|svg)(\?[^=]+.*)?/i // The following regex are used to parse the d attribute of a path
    // Replaces all negative exponents
    ,
    negExp: /e\-/gi // Replaces all comma
    ,
    comma: /,/g // Replaces all hyphens
    ,
    hyphen: /\-/g // Replaces and tests for all path letters
    ,
    pathLetters: /[MLHVCSQTAZ]/gi // yes we need this one, too
    ,
    isPathLetter: /[MLHVCSQTAZ]/i // split at whitespaces
    ,
    whitespaces: /\s+/ // matches X
    ,
    X: /X/g
  };
  SVG.utils = {
    // Map function
    map: function (array, block) {
      var i,
          il = array.length,
          result = [];

      for (i = 0; i < il; i++) result.push(block(array[i]));

      return result;
    } // Degrees to radians
    ,
    radians: function (d) {
      return d % 360 * Math.PI / 180;
    } // Radians to degrees
    ,
    degrees: function (r) {
      return r * 180 / Math.PI % 360;
    },
    filterSVGElements: function (p) {
      return [].filter.call(p, function (el) {
        return el instanceof SVGElement;
      });
    }
  };
  SVG.defaults = {
    // Default attribute values
    attrs: {
      // fill and stroke
      'fill-opacity': 1,
      'stroke-opacity': 1,
      'stroke-width': 0,
      'stroke-linejoin': 'miter',
      'stroke-linecap': 'butt',
      fill: '#000000',
      stroke: '#000000',
      opacity: 1 // position
      ,
      x: 0,
      y: 0,
      cx: 0,
      cy: 0 // size
      ,
      width: 0,
      height: 0 // radius
      ,
      r: 0,
      rx: 0,
      ry: 0 // gradient
      ,
      offset: 0,
      'stop-opacity': 1,
      'stop-color': '#000000' // text
      ,
      'font-size': 16,
      'font-family': 'Helvetica, Arial, sans-serif',
      'text-anchor': 'start'
    } // Module for color convertions

  };

  SVG.Color = function (color) {
    var match; // initialize defaults

    this.r = 0;
    this.g = 0;
    this.b = 0; // parse color

    if (typeof color === 'string') {
      if (SVG.regex.isRgb.test(color)) {
        // get rgb values
        match = SVG.regex.rgb.exec(color.replace(/\s/g, '')); // parse numeric values

        this.r = parseInt(match[1]);
        this.g = parseInt(match[2]);
        this.b = parseInt(match[3]);
      } else if (SVG.regex.isHex.test(color)) {
        // get hex values
        match = SVG.regex.hex.exec(fullHex(color)); // parse numeric values

        this.r = parseInt(match[1], 16);
        this.g = parseInt(match[2], 16);
        this.b = parseInt(match[3], 16);
      }
    } else if (typeof color === 'object') {
      this.r = color.r;
      this.g = color.g;
      this.b = color.b;
    }
  };

  SVG.extend(SVG.Color, {
    // Default to hex conversion
    toString: function () {
      return this.toHex();
    } // Build hex value
    ,
    toHex: function () {
      return '#' + compToHex(this.r) + compToHex(this.g) + compToHex(this.b);
    } // Build rgb value
    ,
    toRgb: function () {
      return 'rgb(' + [this.r, this.g, this.b].join() + ')';
    } // Calculate true brightness
    ,
    brightness: function () {
      return this.r / 255 * 0.30 + this.g / 255 * 0.59 + this.b / 255 * 0.11;
    } // Make color morphable
    ,
    morph: function (color) {
      this.destination = new SVG.Color(color);
      return this;
    } // Get morphed color at given position
    ,
    at: function (pos) {
      // make sure a destination is defined
      if (!this.destination) return this; // normalise pos

      pos = pos < 0 ? 0 : pos > 1 ? 1 : pos; // generate morphed color

      return new SVG.Color({
        r: ~~(this.r + (this.destination.r - this.r) * pos),
        g: ~~(this.g + (this.destination.g - this.g) * pos),
        b: ~~(this.b + (this.destination.b - this.b) * pos)
      });
    }
  }); // Testers
  // Test if given value is a color string

  SVG.Color.test = function (color) {
    color += '';
    return SVG.regex.isHex.test(color) || SVG.regex.isRgb.test(color);
  }; // Test if given value is a rgb object


  SVG.Color.isRgb = function (color) {
    return color && typeof color.r == 'number' && typeof color.g == 'number' && typeof color.b == 'number';
  }; // Test if given value is a color


  SVG.Color.isColor = function (color) {
    return SVG.Color.isRgb(color) || SVG.Color.test(color);
  }; // Module for array conversion


  SVG.Array = function (array, fallback) {
    array = (array || []).valueOf(); // if array is empty and fallback is provided, use fallback

    if (array.length == 0 && fallback) array = fallback.valueOf(); // parse array

    this.value = this.parse(array);
  };

  SVG.extend(SVG.Array, {
    // Make array morphable
    morph: function (array) {
      this.destination = this.parse(array); // normalize length of arrays

      if (this.value.length != this.destination.length) {
        var lastValue = this.value[this.value.length - 1],
            lastDestination = this.destination[this.destination.length - 1];

        while (this.value.length > this.destination.length) this.destination.push(lastDestination);

        while (this.value.length < this.destination.length) this.value.push(lastValue);
      }

      return this;
    } // Clean up any duplicate points
    ,
    settle: function () {
      // find all unique values
      for (var i = 0, il = this.value.length, seen = []; i < il; i++) if (seen.indexOf(this.value[i]) == -1) seen.push(this.value[i]); // set new value


      return this.value = seen;
    } // Get morphed array at given position
    ,
    at: function (pos) {
      // make sure a destination is defined
      if (!this.destination) return this; // generate morphed array

      for (var i = 0, il = this.value.length, array = []; i < il; i++) array.push(this.value[i] + (this.destination[i] - this.value[i]) * pos);

      return new SVG.Array(array);
    } // Convert array to string
    ,
    toString: function () {
      return this.value.join(' ');
    } // Real value
    ,
    valueOf: function () {
      return this.value;
    } // Parse whitespace separated string
    ,
    parse: function (array) {
      array = array.valueOf(); // if already is an array, no need to parse it

      if (Array.isArray(array)) return array;
      return this.split(array);
    } // Strip unnecessary whitespace
    ,
    split: function (string) {
      return string.trim().split(/\s+/);
    } // Reverse array
    ,
    reverse: function () {
      this.value.reverse();
      return this;
    }
  }); // Poly points array

  SVG.PointArray = function (array, fallback) {
    this.constructor.call(this, array, fallback || [[0, 0]]);
  }; // Inherit from SVG.Array


  SVG.PointArray.prototype = new SVG.Array();
  SVG.extend(SVG.PointArray, {
    // Convert array to string
    toString: function () {
      // convert to a poly point string
      for (var i = 0, il = this.value.length, array = []; i < il; i++) array.push(this.value[i].join(','));

      return array.join(' ');
    } // Convert array to line object
    ,
    toLine: function () {
      return {
        x1: this.value[0][0],
        y1: this.value[0][1],
        x2: this.value[1][0],
        y2: this.value[1][1]
      };
    } // Get morphed array at given position
    ,
    at: function (pos) {
      // make sure a destination is defined
      if (!this.destination) return this; // generate morphed point string

      for (var i = 0, il = this.value.length, array = []; i < il; i++) array.push([this.value[i][0] + (this.destination[i][0] - this.value[i][0]) * pos, this.value[i][1] + (this.destination[i][1] - this.value[i][1]) * pos]);

      return new SVG.PointArray(array);
    } // Parse point string
    ,
    parse: function (array) {
      array = array.valueOf(); // if already is an array, no need to parse it

      if (Array.isArray(array)) return array; // split points

      array = this.split(array); // parse points

      for (var i = 0, il = array.length, p, points = []; i < il; i++) {
        p = array[i].split(',');
        points.push([parseFloat(p[0]), parseFloat(p[1])]);
      }

      return points;
    } // Move point string
    ,
    move: function (x, y) {
      var box = this.bbox(); // get relative offset

      x -= box.x;
      y -= box.y; // move every point

      if (!isNaN(x) && !isNaN(y)) for (var i = this.value.length - 1; i >= 0; i--) this.value[i] = [this.value[i][0] + x, this.value[i][1] + y];
      return this;
    } // Resize poly string
    ,
    size: function (width, height) {
      var i,
          box = this.bbox(); // recalculate position of all points according to new size

      for (i = this.value.length - 1; i >= 0; i--) {
        this.value[i][0] = (this.value[i][0] - box.x) * width / box.width + box.x;
        this.value[i][1] = (this.value[i][1] - box.y) * height / box.height + box.y;
      }

      return this;
    } // Get bounding box of points
    ,
    bbox: function () {
      SVG.parser.poly.setAttribute('points', this.toString());
      return SVG.parser.poly.getBBox();
    }
  }); // Path points array

  SVG.PathArray = function (array, fallback) {
    this.constructor.call(this, array, fallback || [['M', 0, 0]]);
  }; // Inherit from SVG.Array


  SVG.PathArray.prototype = new SVG.Array();
  SVG.extend(SVG.PathArray, {
    // Convert array to string
    toString: function () {
      return arrayToString(this.value);
    } // Move path string
    ,
    move: function (x, y) {
      // get bounding box of current situation
      var box = this.bbox(); // get relative offset

      x -= box.x;
      y -= box.y;

      if (!isNaN(x) && !isNaN(y)) {
        // move every point
        for (var l, i = this.value.length - 1; i >= 0; i--) {
          l = this.value[i][0];

          if (l == 'M' || l == 'L' || l == 'T') {
            this.value[i][1] += x;
            this.value[i][2] += y;
          } else if (l == 'H') {
            this.value[i][1] += x;
          } else if (l == 'V') {
            this.value[i][1] += y;
          } else if (l == 'C' || l == 'S' || l == 'Q') {
            this.value[i][1] += x;
            this.value[i][2] += y;
            this.value[i][3] += x;
            this.value[i][4] += y;

            if (l == 'C') {
              this.value[i][5] += x;
              this.value[i][6] += y;
            }
          } else if (l == 'A') {
            this.value[i][6] += x;
            this.value[i][7] += y;
          }
        }
      }

      return this;
    } // Resize path string
    ,
    size: function (width, height) {
      // get bounding box of current situation
      var i,
          l,
          box = this.bbox(); // recalculate position of all points according to new size

      for (i = this.value.length - 1; i >= 0; i--) {
        l = this.value[i][0];

        if (l == 'M' || l == 'L' || l == 'T') {
          this.value[i][1] = (this.value[i][1] - box.x) * width / box.width + box.x;
          this.value[i][2] = (this.value[i][2] - box.y) * height / box.height + box.y;
        } else if (l == 'H') {
          this.value[i][1] = (this.value[i][1] - box.x) * width / box.width + box.x;
        } else if (l == 'V') {
          this.value[i][1] = (this.value[i][1] - box.y) * height / box.height + box.y;
        } else if (l == 'C' || l == 'S' || l == 'Q') {
          this.value[i][1] = (this.value[i][1] - box.x) * width / box.width + box.x;
          this.value[i][2] = (this.value[i][2] - box.y) * height / box.height + box.y;
          this.value[i][3] = (this.value[i][3] - box.x) * width / box.width + box.x;
          this.value[i][4] = (this.value[i][4] - box.y) * height / box.height + box.y;

          if (l == 'C') {
            this.value[i][5] = (this.value[i][5] - box.x) * width / box.width + box.x;
            this.value[i][6] = (this.value[i][6] - box.y) * height / box.height + box.y;
          }
        } else if (l == 'A') {
          // resize radii
          this.value[i][1] = this.value[i][1] * width / box.width;
          this.value[i][2] = this.value[i][2] * height / box.height; // move position values

          this.value[i][6] = (this.value[i][6] - box.x) * width / box.width + box.x;
          this.value[i][7] = (this.value[i][7] - box.y) * height / box.height + box.y;
        }
      }

      return this;
    } // Absolutize and parse path to array
    ,
    parse: function (array) {
      // if it's already a patharray, no need to parse it
      if (array instanceof SVG.PathArray) return array.valueOf(); // prepare for parsing

      var i,
          x0,
          y0,
          s,
          seg,
          arr,
          x = 0,
          y = 0,
          paramCnt = {
        'M': 2,
        'L': 2,
        'H': 1,
        'V': 1,
        'C': 6,
        'S': 4,
        'Q': 4,
        'T': 2,
        'A': 7
      };

      if (typeof array == 'string') {
        array = array.replace(SVG.regex.negExp, 'X') // replace all negative exponents with certain char
        .replace(SVG.regex.pathLetters, ' $& ') // put some room between letters and numbers
        .replace(SVG.regex.hyphen, ' -') // add space before hyphen
        .replace(SVG.regex.comma, ' ') // unify all spaces
        .replace(SVG.regex.X, 'e-') // add back the expoent
        .trim() // trim
        .split(SVG.regex.whitespaces); // split into array
      } else {
        array = array.reduce(function (prev, curr) {
          return [].concat.apply(prev, curr);
        }, []);
      } // array now is an array containing all parts of a path e.g. ['M', '0', '0', 'L', '30', '30' ...]


      var arr = [];

      do {
        // Test if we have a path letter
        if (SVG.regex.isPathLetter.test(array[0])) {
          s = array[0];
          array.shift(); // If last letter was a move command and we got no new, it defaults to [L]ine
        } else if (s.toUpperCase() == 'M') {
          s = 'L';
        } // add path letter as first element


        seg = [s.toUpperCase()]; // push all necessary parameters to segment

        for (i = 0; i < paramCnt[seg[0]]; ++i) {
          seg.push(parseFloat(array.shift()));
        } // upper case


        if (s == seg[0]) {
          if (s == 'M' || s == 'L' || s == 'C' || s == 'Q') {
            x = seg[paramCnt[seg[0]] - 1];
            y = seg[paramCnt[seg[0]]];
          } else if (s == 'V') {
            y = seg[1];
          } else if (s == 'H') {
            x = seg[1];
          } else if (s == 'A') {
            x = seg[6];
            y = seg[7];
          } // lower case

        } else {
          // convert relative to absolute values
          if (s == 'm' || s == 'l' || s == 'c' || s == 's' || s == 'q' || s == 't') {
            seg[1] += x;
            seg[2] += y;

            if (seg[3] != null) {
              seg[3] += x;
              seg[4] += y;
            }

            if (seg[5] != null) {
              seg[5] += x;
              seg[6] += y;
            } // move pointer


            x = seg[paramCnt[seg[0]] - 1];
            y = seg[paramCnt[seg[0]]];
          } else if (s == 'v') {
            seg[1] += y;
            y = seg[1];
          } else if (s == 'h') {
            seg[1] += x;
            x = seg[1];
          } else if (s == 'a') {
            seg[6] += x;
            seg[7] += y;
            x = seg[6];
            y = seg[7];
          }
        }

        if (seg[0] == 'M') {
          x0 = x;
          y0 = y;
        }

        if (seg[0] == 'Z') {
          x = x0;
          y = y0;
        }

        arr.push(seg);
      } while (array.length);

      return arr;
    } // Get bounding box of path
    ,
    bbox: function () {
      SVG.parser.path.setAttribute('d', this.toString());
      return SVG.parser.path.getBBox();
    }
  }); // Module for unit convertions

  SVG.Number = SVG.invent({
    // Initialize
    create: function (value, unit) {
      // initialize defaults
      this.value = 0;
      this.unit = unit || ''; // parse value

      if (typeof value === 'number') {
        // ensure a valid numeric value
        this.value = isNaN(value) ? 0 : !isFinite(value) ? value < 0 ? -3.4e+38 : +3.4e+38 : value;
      } else if (typeof value === 'string') {
        unit = value.match(SVG.regex.unit);

        if (unit) {
          // make value numeric
          this.value = parseFloat(unit[1]); // normalize

          if (unit[2] == '%') this.value /= 100;else if (unit[2] == 's') this.value *= 1000; // store unit

          this.unit = unit[2];
        }
      } else {
        if (value instanceof SVG.Number) {
          this.value = value.valueOf();
          this.unit = value.unit;
        }
      }
    } // Add methods
    ,
    extend: {
      // Stringalize
      toString: function () {
        return (this.unit == '%' ? ~~(this.value * 1e8) / 1e6 : this.unit == 's' ? this.value / 1e3 : this.value) + this.unit;
      },
      // Convert to primitive
      valueOf: function () {
        return this.value;
      } // Add number
      ,
      plus: function (number) {
        return new SVG.Number(this + new SVG.Number(number), this.unit);
      } // Subtract number
      ,
      minus: function (number) {
        return this.plus(-new SVG.Number(number));
      } // Multiply number
      ,
      times: function (number) {
        return new SVG.Number(this * new SVG.Number(number), this.unit);
      } // Divide number
      ,
      divide: function (number) {
        return new SVG.Number(this / new SVG.Number(number), this.unit);
      } // Convert to different unit
      ,
      to: function (unit) {
        var number = new SVG.Number(this);
        if (typeof unit === 'string') number.unit = unit;
        return number;
      } // Make number morphable
      ,
      morph: function (number) {
        this.destination = new SVG.Number(number);
        return this;
      } // Get morphed number at given position
      ,
      at: function (pos) {
        // Make sure a destination is defined
        if (!this.destination) return this; // Generate new morphed number

        return new SVG.Number(this.destination).minus(this).times(pos).plus(this);
      }
    }
  });

  SVG.ViewBox = function (element) {
    var x,
        y,
        width,
        height,
        wm = 1 // width multiplier
    ,
        hm = 1 // height multiplier
    ,
        box = element.bbox(),
        view = (element.attr('viewBox') || '').match(/-?[\d\.]+/g),
        we = element,
        he = element; // get dimensions of current node

    width = new SVG.Number(element.width());
    height = new SVG.Number(element.height()); // find nearest non-percentual dimensions

    while (width.unit == '%') {
      wm *= width.value;
      width = new SVG.Number(we instanceof SVG.Doc ? we.parent().offsetWidth : we.parent().width());
      we = we.parent();
    }

    while (height.unit == '%') {
      hm *= height.value;
      height = new SVG.Number(he instanceof SVG.Doc ? he.parent().offsetHeight : he.parent().height());
      he = he.parent();
    } // ensure defaults


    this.x = box.x;
    this.y = box.y;
    this.width = width * wm;
    this.height = height * hm;
    this.zoom = 1;

    if (view) {
      // get width and height from viewbox
      x = parseFloat(view[0]);
      y = parseFloat(view[1]);
      width = parseFloat(view[2]);
      height = parseFloat(view[3]); // calculate zoom accoring to viewbox

      this.zoom = this.width / this.height > width / height ? this.height / height : this.width / width; // calculate real pixel dimensions on parent SVG.Doc element

      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  }; //


  SVG.extend(SVG.ViewBox, {
    // Parse viewbox to string
    toString: function () {
      return this.x + ' ' + this.y + ' ' + this.width + ' ' + this.height;
    }
  });
  SVG.Element = SVG.invent({
    // Initialize node
    create: function (node) {
      // make stroke value accessible dynamically
      this._stroke = SVG.defaults.attrs.stroke; // initialize data object

      this.dom = {}; // create circular reference

      if (this.node = node) {
        this.type = node.nodeName;
        this.node.instance = this; // store current attribute value

        this._stroke = node.getAttribute('stroke') || this._stroke;
      }
    } // Add class methods
    ,
    extend: {
      // Move over x-axis
      x: function (x) {
        return this.attr('x', x);
      } // Move over y-axis
      ,
      y: function (y) {
        return this.attr('y', y);
      } // Move by center over x-axis
      ,
      cx: function (x) {
        return x == null ? this.x() + this.width() / 2 : this.x(x - this.width() / 2);
      } // Move by center over y-axis
      ,
      cy: function (y) {
        return y == null ? this.y() + this.height() / 2 : this.y(y - this.height() / 2);
      } // Move element to given x and y values
      ,
      move: function (x, y) {
        return this.x(x).y(y);
      } // Move element by its center
      ,
      center: function (x, y) {
        return this.cx(x).cy(y);
      } // Set width of element
      ,
      width: function (width) {
        return this.attr('width', width);
      } // Set height of element
      ,
      height: function (height) {
        return this.attr('height', height);
      } // Set element size to given width and height
      ,
      size: function (width, height) {
        var p = proportionalSize(this.bbox(), width, height);
        return this.width(new SVG.Number(p.width)).height(new SVG.Number(p.height));
      } // Clone element
      ,
      clone: function () {
        // clone element and assign new id
        var clone = assignNewId(this.node.cloneNode(true)); // insert the clone after myself

        this.after(clone);
        return clone;
      } // Remove element
      ,
      remove: function () {
        if (this.parent()) this.parent().removeElement(this);
        return this;
      } // Replace element
      ,
      replace: function (element) {
        this.after(element).remove();
        return element;
      } // Add element to given container and return self
      ,
      addTo: function (parent) {
        return parent.put(this);
      } // Add element to given container and return container
      ,
      putIn: function (parent) {
        return parent.add(this);
      } // Get / set id
      ,
      id: function (id) {
        return this.attr('id', id);
      } // Checks whether the given point inside the bounding box of the element
      ,
      inside: function (x, y) {
        var box = this.bbox();
        return x > box.x && y > box.y && x < box.x + box.width && y < box.y + box.height;
      } // Show element
      ,
      show: function () {
        return this.style('display', '');
      } // Hide element
      ,
      hide: function () {
        return this.style('display', 'none');
      } // Is element visible?
      ,
      visible: function () {
        return this.style('display') != 'none';
      } // Return id on string conversion
      ,
      toString: function () {
        return this.attr('id');
      } // Return array of classes on the node
      ,
      classes: function () {
        var attr = this.attr('class');
        return attr == null ? [] : attr.trim().split(/\s+/);
      } // Return true if class exists on the node, false otherwise
      ,
      hasClass: function (name) {
        return this.classes().indexOf(name) != -1;
      } // Add class to the node
      ,
      addClass: function (name) {
        if (!this.hasClass(name)) {
          var array = this.classes();
          array.push(name);
          this.attr('class', array.join(' '));
        }

        return this;
      } // Remove class from the node
      ,
      removeClass: function (name) {
        if (this.hasClass(name)) {
          this.attr('class', this.classes().filter(function (c) {
            return c != name;
          }).join(' '));
        }

        return this;
      } // Toggle the presence of a class on the node
      ,
      toggleClass: function (name) {
        return this.hasClass(name) ? this.removeClass(name) : this.addClass(name);
      } // Get referenced element form attribute value
      ,
      reference: function (attr) {
        return SVG.get(this.attr(attr));
      } // Returns the parent element instance
      ,
      parent: function (type) {
        var parent = this; // check for parent

        if (!parent.node.parentNode) return null; // get parent element

        parent = SVG.adopt(parent.node.parentNode);
        if (!type) return parent; // loop trough ancestors if type is given

        while (parent.node instanceof SVGElement) {
          if (typeof type === 'string' ? parent.matches(type) : parent instanceof type) return parent;
          parent = SVG.adopt(parent.node.parentNode);
        }
      } // Get parent document
      ,
      doc: function () {
        return this instanceof SVG.Doc ? this : this.parent(SVG.Doc);
      } // return array of all ancestors of given type up to the root svg
      ,
      parents: function (type) {
        var parents = [],
            parent = this;

        do {
          parent = parent.parent(type);
          if (!parent || !parent.node) break;
          parents.push(parent);
        } while (parent.parent);

        return parents;
      } // matches the element vs a css selector
      ,
      matches: function (selector) {
        return matches(this.node, selector);
      } // Returns the svg node to call native svg methods on it
      ,
      native: function () {
        return this.node;
      } // Import raw svg
      ,
      svg: function (svg) {
        // create temporary holder
        var well = document.createElement('svg'); // act as a setter if svg is given

        if (svg && this instanceof SVG.Parent) {
          // dump raw svg
          well.innerHTML = '<svg>' + svg.replace(/\n/, '').replace(/<(\w+)([^<]+?)\/>/g, '<$1$2></$1>') + '</svg>'; // transplant nodes

          for (var i = 0, il = well.firstChild.childNodes.length; i < il; i++) this.node.appendChild(well.firstChild.firstChild); // otherwise act as a getter

        } else {
          // create a wrapping svg element in case of partial content
          well.appendChild(svg = document.createElement('svg')); // write svgjs data to the dom

          this.writeDataToDom(); // insert a copy of this node

          svg.appendChild(this.node.cloneNode(true)); // return target element

          return well.innerHTML.replace(/^<svg>/, '').replace(/<\/svg>$/, '');
        }

        return this;
      } // write svgjs data to the dom
      ,
      writeDataToDom: function () {
        // dump variables recursively
        if (this.each || this.lines) {
          var fn = this.each ? this : this.lines();
          fn.each(function () {
            this.writeDataToDom();
          });
        } // remove previously set data


        this.node.removeAttribute('svgjs:data');
        if (Object.keys(this.dom).length) this.node.setAttributeNS(SVG.svgjs, 'svgjs:data', JSON.stringify(this.dom));
        return this;
      } // set given data to the elements data property
      ,
      setData: function (o) {
        this.dom = o;
        return this;
      }
    }
  });
  SVG.FX = SVG.invent({
    // Initialize FX object
    create: function (element) {
      // store target element
      this.target = element;
    } // Add class methods
    ,
    extend: {
      // Add animation parameters and start animation
      animate: function (d, ease, delay) {
        var akeys,
            skeys,
            key,
            element = this.target,
            fx = this; // dissect object if one is passed

        if (typeof d == 'object') {
          delay = d.delay;
          ease = d.ease;
          d = d.duration;
        } // ensure default duration and easing


        d = d == '=' ? d : d == null ? 1000 : new SVG.Number(d).valueOf();
        ease = ease || '<>'; // process values

        fx.at = function (pos) {
          var i; // normalise pos

          pos = pos < 0 ? 0 : pos > 1 ? 1 : pos; // collect attribute keys

          if (akeys == null) {
            akeys = [];

            for (key in fx.attrs) akeys.push(key); // make sure morphable elements are scaled, translated and morphed all together


            if (element.morphArray && (fx.destination.plot || akeys.indexOf('points') > -1)) {
              // get destination
              var box,
                  p = new element.morphArray(fx.destination.plot || fx.attrs.points || element.array()); // add size

              if (fx.destination.size) p.size(fx.destination.size.width.to, fx.destination.size.height.to); // add movement

              box = p.bbox();
              if (fx.destination.x) p.move(fx.destination.x.to, box.y);else if (fx.destination.cx) p.move(fx.destination.cx.to - box.width / 2, box.y);
              box = p.bbox();
              if (fx.destination.y) p.move(box.x, fx.destination.y.to);else if (fx.destination.cy) p.move(box.x, fx.destination.cy.to - box.height / 2); // reset destination values

              fx.destination = {
                plot: element.array().morph(p)
              };
            }
          } // collect style keys


          if (skeys == null) {
            skeys = [];

            for (key in fx.styles) skeys.push(key);
          } // apply easing


          pos = ease == '<>' ? -Math.cos(pos * Math.PI) / 2 + 0.5 : ease == '>' ? Math.sin(pos * Math.PI / 2) : ease == '<' ? -Math.cos(pos * Math.PI / 2) + 1 : ease == '-' ? pos : typeof ease == 'function' ? ease(pos) : pos; // run plot function

          if (fx.destination.plot) {
            element.plot(fx.destination.plot.at(pos));
          } else {
            // run all x-position properties
            if (fx.destination.x) element.x(fx.destination.x.at(pos));else if (fx.destination.cx) element.cx(fx.destination.cx.at(pos)); // run all y-position properties

            if (fx.destination.y) element.y(fx.destination.y.at(pos));else if (fx.destination.cy) element.cy(fx.destination.cy.at(pos)); // run all size properties

            if (fx.destination.size) element.size(fx.destination.size.width.at(pos), fx.destination.size.height.at(pos));
          } // run all viewbox properties


          if (fx.destination.viewbox) element.viewbox(fx.destination.viewbox.x.at(pos), fx.destination.viewbox.y.at(pos), fx.destination.viewbox.width.at(pos), fx.destination.viewbox.height.at(pos)); // run leading property

          if (fx.destination.leading) element.leading(fx.destination.leading.at(pos)); // animate attributes

          for (i = akeys.length - 1; i >= 0; i--) element.attr(akeys[i], at(fx.attrs[akeys[i]], pos)); // animate styles


          for (i = skeys.length - 1; i >= 0; i--) element.style(skeys[i], at(fx.styles[skeys[i]], pos)); // callback for each keyframe


          if (fx.situation.during) fx.situation.during.call(element, pos, function (from, to) {
            return at({
              from: from,
              to: to
            }, pos);
          });
        };

        if (typeof d === 'number') {
          // delay animation
          this.timeout = setTimeout(function () {
            var start = new Date().getTime(); // initialize situation object

            fx.situation.start = start;
            fx.situation.play = true;
            fx.situation.finish = start + d;
            fx.situation.duration = d;
            fx.situation.ease = ease; // render function

            fx.render = function () {
              if (fx.situation.play === true) {
                // calculate pos
                var time = new Date().getTime(),
                    pos = time > fx.situation.finish ? 1 : (time - fx.situation.start) / d; // reverse pos if animation is reversed

                if (fx.situation.reversing) pos = -pos + 1; // process values

                fx.at(pos); // finish off animation

                if (time > fx.situation.finish) {
                  if (fx.destination.plot) element.plot(new SVG.PointArray(fx.destination.plot.destination).settle());

                  if (fx.situation.loop === true || typeof fx.situation.loop == 'number' && fx.situation.loop > 0) {
                    // register reverse
                    if (fx.situation.reverse) fx.situation.reversing = !fx.situation.reversing;

                    if (typeof fx.situation.loop == 'number') {
                      // reduce loop count
                      if (!fx.situation.reverse || fx.situation.reversing) --fx.situation.loop; // remove last loop if reverse is disabled

                      if (!fx.situation.reverse && fx.situation.loop == 1) --fx.situation.loop;
                    }

                    fx.animate(d, ease, delay);
                  } else {
                    fx.situation.after ? fx.situation.after.apply(element, [fx]) : fx.stop();
                  }
                } else {
                  fx.animationFrame = requestAnimationFrame(fx.render);
                }
              } else {
                fx.animationFrame = requestAnimationFrame(fx.render);
              }
            }; // start animation


            fx.render();
          }, new SVG.Number(delay).valueOf());
        }

        return this;
      } // Get bounding box of target element
      ,
      bbox: function () {
        return this.target.bbox();
      } // Add animatable attributes
      ,
      attr: function (a, v) {
        // apply attributes individually
        if (typeof a == 'object') {
          for (var key in a) this.attr(key, a[key]);
        } else {
          // get the current state
          var from = this.target.attr(a); // detect format

          if (a == 'transform') {
            // merge given transformation with an existing one
            if (this.attrs[a]) v = this.attrs[a].destination.multiply(v); // prepare matrix for morphing

            this.attrs[a] = new SVG.Matrix(this.target).morph(v); // add parametric rotation values

            if (this.param) {
              // get initial rotation
              v = this.target.transform('rotation'); // add param

              this.attrs[a].param = {
                from: this.target.param || {
                  rotation: v,
                  cx: this.param.cx,
                  cy: this.param.cy
                },
                to: this.param
              };
            }
          } else {
            this.attrs[a] = SVG.Color.isColor(v) ? // prepare color for morphing
            new SVG.Color(from).morph(v) : SVG.regex.unit.test(v) ? // prepare number for morphing
            new SVG.Number(from).morph(v) : // prepare for plain morphing
            {
              from: from,
              to: v
            };
          }
        }

        return this;
      } // Add animatable styles
      ,
      style: function (s, v) {
        if (typeof s == 'object') for (var key in s) this.style(key, s[key]);else this.styles[s] = {
          from: this.target.style(s),
          to: v
        };
        return this;
      } // Animatable x-axis
      ,
      x: function (x) {
        this.destination.x = new SVG.Number(this.target.x()).morph(x);
        return this;
      } // Animatable y-axis
      ,
      y: function (y) {
        this.destination.y = new SVG.Number(this.target.y()).morph(y);
        return this;
      } // Animatable center x-axis
      ,
      cx: function (x) {
        this.destination.cx = new SVG.Number(this.target.cx()).morph(x);
        return this;
      } // Animatable center y-axis
      ,
      cy: function (y) {
        this.destination.cy = new SVG.Number(this.target.cy()).morph(y);
        return this;
      } // Add animatable move
      ,
      move: function (x, y) {
        return this.x(x).y(y);
      } // Add animatable center
      ,
      center: function (x, y) {
        return this.cx(x).cy(y);
      } // Add animatable size
      ,
      size: function (width, height) {
        if (this.target instanceof SVG.Text) {
          // animate font size for Text elements
          this.attr('font-size', width);
        } else {
          // animate bbox based size for all other elements
          var box = this.target.bbox();
          this.destination.size = {
            width: new SVG.Number(box.width).morph(width),
            height: new SVG.Number(box.height).morph(height)
          };
        }

        return this;
      } // Add animatable plot
      ,
      plot: function (p) {
        this.destination.plot = p;
        return this;
      } // Add leading method
      ,
      leading: function (value) {
        if (this.target.destination.leading) this.destination.leading = new SVG.Number(this.target.destination.leading).morph(value);
        return this;
      } // Add animatable viewbox
      ,
      viewbox: function (x, y, width, height) {
        if (this.target instanceof SVG.Container) {
          var box = this.target.viewbox();
          this.destination.viewbox = {
            x: new SVG.Number(box.x).morph(x),
            y: new SVG.Number(box.y).morph(y),
            width: new SVG.Number(box.width).morph(width),
            height: new SVG.Number(box.height).morph(height)
          };
        }

        return this;
      } // Add animateable gradient update
      ,
      update: function (o) {
        if (this.target instanceof SVG.Stop) {
          if (o.opacity != null) this.attr('stop-opacity', o.opacity);
          if (o.color != null) this.attr('stop-color', o.color);
          if (o.offset != null) this.attr('offset', new SVG.Number(o.offset));
        }

        return this;
      } // Add callback for each keyframe
      ,
      during: function (during) {
        this.situation.during = during;
        return this;
      } // Callback after animation
      ,
      after: function (after) {
        this.situation.after = after;
        return this;
      } // Make loopable
      ,
      loop: function (times, reverse) {
        // store current loop and total loops
        this.situation.loop = this.situation.loops = times || true; // make reversable

        this.situation.reverse = !!reverse;
        return this;
      } // Stop running animation
      ,
      stop: function (fulfill) {
        // fulfill animation
        if (fulfill === true) {
          this.animate(0);
          if (this.situation.after) this.situation.after.apply(this.target, [this]);
        } else {
          // stop current animation
          clearTimeout(this.timeout);
          cancelAnimationFrame(this.animationFrame); // reset storage for properties

          this.attrs = {};
          this.styles = {};
          this.situation = {};
          this.destination = {};
        }

        return this;
      } // Pause running animation
      ,
      pause: function () {
        if (this.situation.play === true) {
          this.situation.play = false;
          this.situation.pause = new Date().getTime();
        }

        return this;
      } // Play running animation
      ,
      play: function () {
        if (this.situation.play === false) {
          var pause = new Date().getTime() - this.situation.pause;
          this.situation.finish += pause;
          this.situation.start += pause;
          this.situation.play = true;
        }

        return this;
      } // Define parent class

    },
    parent: SVG.Element // Add method to parent elements
    ,
    construct: {
      // Get fx module or create a new one, then animate with given duration and ease
      animate: function (d, ease, delay) {
        return (this.fx || (this.fx = new SVG.FX(this))).stop().animate(d, ease, delay);
      } // Stop current animation; this is an alias to the fx instance
      ,
      stop: function (fulfill) {
        if (this.fx) this.fx.stop(fulfill);
        return this;
      } // Pause current animation
      ,
      pause: function () {
        if (this.fx) this.fx.pause();
        return this;
      } // Play paused current animation
      ,
      play: function () {
        if (this.fx) this.fx.play();
        return this;
      }
    }
  });
  SVG.BBox = SVG.invent({
    // Initialize
    create: function (element) {
      // get values if element is given
      if (element) {
        var box; // yes this is ugly, but Firefox can be a bitch when it comes to elements that are not yet rendered

        try {
          // find native bbox
          box = element.node.getBBox();
        } catch (e) {
          if (element instanceof SVG.Shape) {
            var clone = element.clone().addTo(SVG.parser.draw);
            box = clone.bbox();
            clone.remove();
          } else {
            box = {
              x: element.node.clientLeft,
              y: element.node.clientTop,
              width: element.node.clientWidth,
              height: element.node.clientHeight
            };
          }
        } // plain x and y


        this.x = box.x;
        this.y = box.y; // plain width and height

        this.width = box.width;
        this.height = box.height;
      } // add center, right and bottom


      fullBox(this);
    } // Define Parent
    ,
    parent: SVG.Element // Constructor
    ,
    construct: {
      // Get bounding box
      bbox: function () {
        return new SVG.BBox(this);
      }
    }
  });
  SVG.TBox = SVG.invent({
    // Initialize
    create: function (element) {
      // get values if element is given
      if (element) {
        var t = element.ctm().extract(),
            box = element.bbox(); // width and height including transformations

        this.width = box.width * t.scaleX;
        this.height = box.height * t.scaleY; // x and y including transformations

        this.x = box.x + t.x;
        this.y = box.y + t.y;
      } // add center, right and bottom


      fullBox(this);
    } // Define Parent
    ,
    parent: SVG.Element // Constructor
    ,
    construct: {
      // Get transformed bounding box
      tbox: function () {
        return new SVG.TBox(this);
      }
    }
  });
  SVG.RBox = SVG.invent({
    // Initialize
    create: function (element) {
      if (element) {
        var e = element.doc().parent(),
            box = element.node.getBoundingClientRect(),
            zoom = 1; // get screen offset

        this.x = box.left;
        this.y = box.top; // subtract parent offset

        this.x -= e.offsetLeft;
        this.y -= e.offsetTop;

        while (e = e.offsetParent) {
          this.x -= e.offsetLeft;
          this.y -= e.offsetTop;
        } // calculate cumulative zoom from svg documents


        e = element;

        while (e.parent && (e = e.parent())) {
          if (e.viewbox) {
            zoom *= e.viewbox().zoom;
            this.x -= e.x() || 0;
            this.y -= e.y() || 0;
          }
        } // recalculate viewbox distortion


        this.width = box.width /= zoom;
        this.height = box.height /= zoom;
      } // add center, right and bottom


      fullBox(this); // offset by window scroll position, because getBoundingClientRect changes when window is scrolled

      this.x += window.scrollX;
      this.y += window.scrollY;
    } // define Parent
    ,
    parent: SVG.Element // Constructor
    ,
    construct: {
      // Get rect box
      rbox: function () {
        return new SVG.RBox(this);
      }
    }
  }) // Add universal merge method
  ;
  [SVG.BBox, SVG.TBox, SVG.RBox].forEach(function (c) {
    SVG.extend(c, {
      // Merge rect box with another, return a new instance
      merge: function (box) {
        var b = new c(); // merge boxes

        b.x = Math.min(this.x, box.x);
        b.y = Math.min(this.y, box.y);
        b.width = Math.max(this.x + this.width, box.x + box.width) - b.x;
        b.height = Math.max(this.y + this.height, box.y + box.height) - b.y;
        return fullBox(b);
      }
    });
  });
  SVG.Matrix = SVG.invent({
    // Initialize
    create: function (source) {
      var i,
          base = arrayToMatrix([1, 0, 0, 1, 0, 0]); // ensure source as object

      source = source instanceof SVG.Element ? source.matrixify() : typeof source === 'string' ? stringToMatrix(source) : arguments.length == 6 ? arrayToMatrix([].slice.call(arguments)) : typeof source === 'object' ? source : base; // merge source

      for (i = abcdef.length - 1; i >= 0; i--) this[abcdef[i]] = source && typeof source[abcdef[i]] === 'number' ? source[abcdef[i]] : base[abcdef[i]];
    } // Add methods
    ,
    extend: {
      // Extract individual transformations
      extract: function () {
        // find delta transform points
        var px = deltaTransformPoint(this, 0, 1),
            py = deltaTransformPoint(this, 1, 0),
            skewX = 180 / Math.PI * Math.atan2(px.y, px.x) - 90;
        return {
          // translation
          x: this.e,
          y: this.f // skew
          ,
          skewX: -skewX,
          skewY: 180 / Math.PI * Math.atan2(py.y, py.x) // scale
          ,
          scaleX: Math.sqrt(this.a * this.a + this.b * this.b),
          scaleY: Math.sqrt(this.c * this.c + this.d * this.d) // rotation
          ,
          rotation: skewX
        };
      } // Clone matrix
      ,
      clone: function () {
        return new SVG.Matrix(this);
      } // Morph one matrix into another
      ,
      morph: function (matrix) {
        // store new destination
        this.destination = new SVG.Matrix(matrix);
        return this;
      } // Get morphed matrix at a given position
      ,
      at: function (pos) {
        // make sure a destination is defined
        if (!this.destination) return this; // calculate morphed matrix at a given position

        var matrix = new SVG.Matrix({
          a: this.a + (this.destination.a - this.a) * pos,
          b: this.b + (this.destination.b - this.b) * pos,
          c: this.c + (this.destination.c - this.c) * pos,
          d: this.d + (this.destination.d - this.d) * pos,
          e: this.e + (this.destination.e - this.e) * pos,
          f: this.f + (this.destination.f - this.f) * pos
        }); // process parametric rotation if present

        if (this.param && this.param.to) {
          // calculate current parametric position
          var param = {
            rotation: this.param.from.rotation + (this.param.to.rotation - this.param.from.rotation) * pos,
            cx: this.param.from.cx,
            cy: this.param.from.cy // rotate matrix

          };
          matrix = matrix.rotate((this.param.to.rotation - this.param.from.rotation * 2) * pos, param.cx, param.cy); // store current parametric values

          matrix.param = param;
        }

        return matrix;
      } // Multiplies by given matrix
      ,
      multiply: function (matrix) {
        return new SVG.Matrix(this.native().multiply(parseMatrix(matrix).native()));
      } // Inverses matrix
      ,
      inverse: function () {
        return new SVG.Matrix(this.native().inverse());
      } // Translate matrix
      ,
      translate: function (x, y) {
        return new SVG.Matrix(this.native().translate(x || 0, y || 0));
      } // Scale matrix
      ,
      scale: function (x, y, cx, cy) {
        // support universal scale
        if (arguments.length == 1 || arguments.length == 3) y = x;

        if (arguments.length == 3) {
          cy = cx;
          cx = y;
        }

        return this.around(cx, cy, new SVG.Matrix(x, 0, 0, y, 0, 0));
      } // Rotate matrix
      ,
      rotate: function (r, cx, cy) {
        // convert degrees to radians
        r = SVG.utils.radians(r);
        return this.around(cx, cy, new SVG.Matrix(Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0));
      } // Flip matrix on x or y, at a given offset
      ,
      flip: function (a, o) {
        return a == 'x' ? this.scale(-1, 1, o, 0) : this.scale(1, -1, 0, o);
      } // Skew
      ,
      skew: function (x, y, cx, cy) {
        return this.around(cx, cy, this.native().skewX(x || 0).skewY(y || 0));
      } // SkewX
      ,
      skewX: function (x, cx, cy) {
        return this.around(cx, cy, this.native().skewX(x || 0));
      } // SkewY
      ,
      skewY: function (y, cx, cy) {
        return this.around(cx, cy, this.native().skewY(y || 0));
      } // Transform around a center point
      ,
      around: function (cx, cy, matrix) {
        return this.multiply(new SVG.Matrix(1, 0, 0, 1, cx || 0, cy || 0)).multiply(matrix).multiply(new SVG.Matrix(1, 0, 0, 1, -cx || 0, -cy || 0));
      } // Convert to native SVGMatrix
      ,
      native: function () {
        // create new matrix
        var matrix = SVG.parser.draw.node.createSVGMatrix(); // update with current values

        for (var i = abcdef.length - 1; i >= 0; i--) matrix[abcdef[i]] = this[abcdef[i]];

        return matrix;
      } // Convert matrix to string
      ,
      toString: function () {
        return 'matrix(' + this.a + ',' + this.b + ',' + this.c + ',' + this.d + ',' + this.e + ',' + this.f + ')';
      } // Define parent

    },
    parent: SVG.Element // Add parent method
    ,
    construct: {
      // Get current matrix
      ctm: function () {
        return new SVG.Matrix(this.node.getCTM());
      },
      // Get current screen matrix
      screenCTM: function () {
        return new SVG.Matrix(this.node.getScreenCTM());
      }
    }
  });
  SVG.extend(SVG.Element, {
    // Set svg element attribute
    attr: function (a, v, n) {
      // act as full getter
      if (a == null) {
        // get an object of attributes
        a = {};
        v = this.node.attributes;

        for (n = v.length - 1; n >= 0; n--) a[v[n].nodeName] = SVG.regex.isNumber.test(v[n].nodeValue) ? parseFloat(v[n].nodeValue) : v[n].nodeValue;

        return a;
      } else if (typeof a == 'object') {
        // apply every attribute individually if an object is passed
        for (v in a) this.attr(v, a[v]);
      } else if (v === null) {
        // remove value
        this.node.removeAttribute(a);
      } else if (v == null) {
        // act as a getter if the first and only argument is not an object
        v = this.node.getAttribute(a);
        return v == null ? SVG.defaults.attrs[a] : SVG.regex.isNumber.test(v) ? parseFloat(v) : v;
      } else {
        // BUG FIX: some browsers will render a stroke if a color is given even though stroke width is 0
        if (a == 'stroke-width') this.attr('stroke', parseFloat(v) > 0 ? this._stroke : null);else if (a == 'stroke') this._stroke = v; // convert image fill and stroke to patterns

        if (a == 'fill' || a == 'stroke') {
          if (SVG.regex.isImage.test(v)) v = this.doc().defs().image(v, 0, 0);
          if (v instanceof SVG.Image) v = this.doc().defs().pattern(0, 0, function () {
            this.add(v);
          });
        } // ensure correct numeric values (also accepts NaN and Infinity)


        if (typeof v === 'number') v = new SVG.Number(v); // ensure full hex color
        else if (SVG.Color.isColor(v)) v = new SVG.Color(v); // parse array values
          else if (Array.isArray(v)) v = new SVG.Array(v); // store parametric transformation values locally
            else if (v instanceof SVG.Matrix && v.param) this.param = v.param; // if the passed attribute is leading...

        if (a == 'leading') {
          // ... call the leading method instead
          if (this.leading) this.leading(v);
        } else {
          // set given attribute on node
          typeof n === 'string' ? this.node.setAttributeNS(n, a, v.toString()) : this.node.setAttribute(a, v.toString());
        } // rebuild if required


        if (this.rebuild && (a == 'font-size' || a == 'x')) this.rebuild(a, v);
      }

      return this;
    }
  });
  SVG.extend(SVG.Element, SVG.FX, {
    // Add transformations
    transform: function (o, relative) {
      // get target in case of the fx module, otherwise reference this
      var target = this.target || this,
          matrix; // act as a getter

      if (typeof o !== 'object') {
        // get current matrix
        matrix = new SVG.Matrix(target).extract(); // add parametric rotation

        if (typeof this.param === 'object') {
          matrix.rotation = this.param.rotation;
          matrix.cx = this.param.cx;
          matrix.cy = this.param.cy;
        }

        return typeof o === 'string' ? matrix[o] : matrix;
      } // get current matrix


      matrix = this instanceof SVG.FX && this.attrs.transform ? this.attrs.transform : new SVG.Matrix(target); // ensure relative flag

      relative = !!relative || !!o.relative; // act on matrix

      if (o.a != null) {
        matrix = relative ? // relative
        matrix.multiply(new SVG.Matrix(o)) : // absolute
        new SVG.Matrix(o); // act on rotation
      } else if (o.rotation != null) {
        // ensure centre point
        ensureCentre(o, target); // relativize rotation value

        if (relative) {
          o.rotation += this.param && this.param.rotation != null ? this.param.rotation : matrix.extract().rotation;
        } // store parametric values


        this.param = o; // apply transformation

        if (this instanceof SVG.Element) {
          matrix = relative ? // relative
          matrix.rotate(o.rotation, o.cx, o.cy) : // absolute
          matrix.rotate(o.rotation - matrix.extract().rotation, o.cx, o.cy);
        } // act on scale

      } else if (o.scale != null || o.scaleX != null || o.scaleY != null) {
        // ensure centre point
        ensureCentre(o, target); // ensure scale values on both axes

        o.scaleX = o.scale != null ? o.scale : o.scaleX != null ? o.scaleX : 1;
        o.scaleY = o.scale != null ? o.scale : o.scaleY != null ? o.scaleY : 1;

        if (!relative) {
          // absolute; multiply inversed values
          var e = matrix.extract();
          o.scaleX = o.scaleX * 1 / e.scaleX;
          o.scaleY = o.scaleY * 1 / e.scaleY;
        }

        matrix = matrix.scale(o.scaleX, o.scaleY, o.cx, o.cy); // act on skew
      } else if (o.skewX != null || o.skewY != null) {
        // ensure centre point
        ensureCentre(o, target); // ensure skew values on both axes

        o.skewX = o.skewX != null ? o.skewX : 0;
        o.skewY = o.skewY != null ? o.skewY : 0;

        if (!relative) {
          // absolute; reset skew values
          var e = matrix.extract();
          matrix = matrix.multiply(new SVG.Matrix().skew(e.skewX, e.skewY, o.cx, o.cy).inverse());
        }

        matrix = matrix.skew(o.skewX, o.skewY, o.cx, o.cy); // act on flip
      } else if (o.flip) {
        matrix = matrix.flip(o.flip, o.offset == null ? target.bbox()['c' + o.flip] : o.offset); // act on translate
      } else if (o.x != null || o.y != null) {
        if (relative) {
          // relative
          matrix = matrix.translate(o.x, o.y);
        } else {
          // absolute
          if (o.x != null) matrix.e = o.x;
          if (o.y != null) matrix.f = o.y;
        }
      }

      return this.attr(this instanceof SVG.Pattern ? 'patternTransform' : this instanceof SVG.Gradient ? 'gradientTransform' : 'transform', matrix);
    }
  });
  SVG.extend(SVG.Element, {
    // Reset all transformations
    untransform: function () {
      return this.attr('transform', null);
    },
    // merge the whole transformation chain into one matrix
    matrixify: function () {
      var matrix = (this.attr('transform') || ''). // split transformations
      split(/\)\s*/).slice(0, -1).map(function (str) {
        // generate key => value pairs
        var kv = str.trim().split('(');
        return [kv[0], kv[1].split(SVG.regex.matrixElements).map(function (str) {
          return parseFloat(str);
        })];
      }) // calculate every transformation into one matrix
      .reduce(function (matrix, transform) {
        if (transform[0] == 'matrix') return matrix.multiply(arrayToMatrix(transform[1]));
        return matrix[transform[0]].apply(matrix, transform[1]);
      }, new SVG.Matrix()); // apply calculated matrix to element

      this.attr('transform', matrix);
      return matrix;
    },
    // add an element to another parent without changing the visual representation on the screen
    toParent: function (parent) {
      if (this == parent) return this;
      var ctm = this.screenCTM();
      var temp = parent.rect(1, 1);
      var pCtm = temp.screenCTM().inverse();
      temp.remove();
      this.addTo(parent).untransform().transform(pCtm.multiply(ctm));
      return this;
    },
    // same as above with parent equals root-svg
    toDoc: function () {
      return this.toParent(this.doc());
    }
  });
  SVG.extend(SVG.Element, {
    // Dynamic style generator
    style: function (s, v) {
      if (arguments.length == 0) {
        // get full style
        return this.node.style.cssText || '';
      } else if (arguments.length < 2) {
        // apply every style individually if an object is passed
        if (typeof s == 'object') {
          for (v in s) this.style(v, s[v]);
        } else if (SVG.regex.isCss.test(s)) {
          // parse css string
          s = s.split(';'); // apply every definition individually

          for (var i = 0; i < s.length; i++) {
            v = s[i].split(':');
            this.style(v[0].replace(/\s+/g, ''), v[1]);
          }
        } else {
          // act as a getter if the first and only argument is not an object
          return this.node.style[camelCase(s)];
        }
      } else {
        this.node.style[camelCase(s)] = v === null || SVG.regex.isBlank.test(v) ? '' : v;
      }

      return this;
    }
  });
  SVG.Parent = SVG.invent({
    // Initialize node
    create: function (element) {
      this.constructor.call(this, element);
    } // Inherit from
    ,
    inherit: SVG.Element // Add class methods
    ,
    extend: {
      // Returns all child elements
      children: function () {
        return SVG.utils.map(SVG.utils.filterSVGElements(this.node.childNodes), function (node) {
          return SVG.adopt(node);
        });
      } // Add given element at a position
      ,
      add: function (element, i) {
        if (!this.has(element)) {
          // define insertion index if none given
          i = i == null ? this.children().length : i; // add element references

          this.node.insertBefore(element.node, this.node.childNodes[i] || null);
        }

        return this;
      } // Basically does the same as `add()` but returns the added element instead
      ,
      put: function (element, i) {
        this.add(element, i);
        return element;
      } // Checks if the given element is a child
      ,
      has: function (element) {
        return this.index(element) >= 0;
      } // Gets index of given element
      ,
      index: function (element) {
        return this.children().indexOf(element);
      } // Get a element at the given index
      ,
      get: function (i) {
        return this.children()[i];
      } // Get first child, skipping the defs node
      ,
      first: function () {
        return this.children()[0];
      } // Get the last child
      ,
      last: function () {
        return this.children()[this.children().length - 1];
      } // Iterates over all children and invokes a given block
      ,
      each: function (block, deep) {
        var i,
            il,
            children = this.children();

        for (i = 0, il = children.length; i < il; i++) {
          if (children[i] instanceof SVG.Element) block.apply(children[i], [i, children]);
          if (deep && children[i] instanceof SVG.Container) children[i].each(block, deep);
        }

        return this;
      } // Remove a given child
      ,
      removeElement: function (element) {
        this.node.removeChild(element.node);
        return this;
      } // Remove all elements in this container
      ,
      clear: function () {
        // remove children
        while (this.node.hasChildNodes()) this.node.removeChild(this.node.lastChild); // remove defs reference


        delete this._defs;
        return this;
      },
      // Get defs
      defs: function () {
        return this.doc().defs();
      }
    }
  });
  SVG.extend(SVG.Parent, {
    ungroup: function (parent, depth) {
      if (depth === 0 || this instanceof SVG.Defs) return this;
      parent = parent || (this instanceof SVG.Doc ? this : this.parent(SVG.Parent));
      depth = depth || Infinity;
      this.each(function () {
        if (this instanceof SVG.Defs) return this;
        if (this instanceof SVG.Parent) return this.ungroup(parent, depth - 1);
        return this.toParent(parent);
      });
      this.node.firstChild || this.remove();
      return this;
    },
    flatten: function (parent, depth) {
      return this.ungroup(parent, depth);
    }
  });
  SVG.Container = SVG.invent({
    // Initialize node
    create: function (element) {
      this.constructor.call(this, element);
    } // Inherit from
    ,
    inherit: SVG.Parent // Add class methods
    ,
    extend: {
      // Get the viewBox and calculate the zoom value
      viewbox: function (v) {
        if (arguments.length == 0) // act as a getter if there are no arguments
          return new SVG.ViewBox(this); // otherwise act as a setter

        v = arguments.length == 1 ? [v.x, v.y, v.width, v.height] : [].slice.call(arguments);
        return this.attr('viewBox', v);
      }
    }
  }) // Add events to elements
  ;
  ['click', 'dblclick', 'mousedown', 'mouseup', 'mouseover', 'mouseout', 'mousemove' // , 'mouseenter' -> not supported by IE
  // , 'mouseleave' -> not supported by IE
  , 'touchstart', 'touchmove', 'touchleave', 'touchend', 'touchcancel'].forEach(function (event) {
    // add event to SVG.Element
    SVG.Element.prototype[event] = function (f) {
      var self = this; // bind event to element rather than element node

      this.node['on' + event] = typeof f == 'function' ? function () {
        return f.apply(self, arguments);
      } : null;
      return this;
    };
  }); // Initialize listeners stack

  SVG.listeners = [];
  SVG.handlerMap = []; // Add event binder in the SVG namespace

  SVG.on = function (node, event, listener, binding) {
    // create listener, get object-index
    var l = listener.bind(binding || node.instance || node),
        index = (SVG.handlerMap.indexOf(node) + 1 || SVG.handlerMap.push(node)) - 1,
        ev = event.split('.')[0],
        ns = event.split('.')[1] || '*'; // ensure valid object

    SVG.listeners[index] = SVG.listeners[index] || {};
    SVG.listeners[index][ev] = SVG.listeners[index][ev] || {};
    SVG.listeners[index][ev][ns] = SVG.listeners[index][ev][ns] || {}; // reference listener

    SVG.listeners[index][ev][ns][listener] = l; // add listener

    node.addEventListener(ev, l, false);
  }; // Add event unbinder in the SVG namespace


  SVG.off = function (node, event, listener) {
    var index = SVG.handlerMap.indexOf(node),
        ev = event && event.split('.')[0],
        ns = event && event.split('.')[1];
    if (index == -1) return;

    if (listener) {
      // remove listener reference
      if (SVG.listeners[index][ev] && SVG.listeners[index][ev][ns || '*']) {
        // remove listener
        node.removeEventListener(ev, SVG.listeners[index][ev][ns || '*'][listener], false);
        delete SVG.listeners[index][ev][ns || '*'][listener];
      }
    } else if (ns && ev) {
      // remove all listeners for a namespaced event
      if (SVG.listeners[index][ev] && SVG.listeners[index][ev][ns]) {
        for (listener in SVG.listeners[index][ev][ns]) SVG.off(node, [ev, ns].join('.'), listener);

        delete SVG.listeners[index][ev][ns];
      }
    } else if (ns) {
      // remove all listeners for a specific namespace
      for (event in SVG.listeners[index]) {
        for (namespace in SVG.listeners[index][event]) {
          if (ns === namespace) {
            SVG.off(node, [event, ns].join('.'));
          }
        }
      }
    } else if (ev) {
      // remove all listeners for the event
      if (SVG.listeners[index][ev]) {
        for (namespace in SVG.listeners[index][ev]) SVG.off(node, [ev, namespace].join('.'));

        delete SVG.listeners[index][ev];
      }
    } else {
      // remove all listeners on a given node
      for (event in SVG.listeners[index]) SVG.off(node, event);

      delete SVG.listeners[index];
    }
  }; //


  SVG.extend(SVG.Element, {
    // Bind given event to listener
    on: function (event, listener, binding) {
      SVG.on(this.node, event, listener, binding);
      return this;
    } // Unbind event from listener
    ,
    off: function (event, listener) {
      SVG.off(this.node, event, listener);
      return this;
    } // Fire given event
    ,
    fire: function (event, data) {
      // Dispatch event
      if (event instanceof Event) {
        this.node.dispatchEvent(event);
      } else {
        this.node.dispatchEvent(new CustomEvent(event, {
          detail: data
        }));
      }

      return this;
    }
  });
  SVG.Defs = SVG.invent({
    // Initialize node
    create: 'defs' // Inherit from
    ,
    inherit: SVG.Container
  });
  SVG.G = SVG.invent({
    // Initialize node
    create: 'g' // Inherit from
    ,
    inherit: SVG.Container // Add class methods
    ,
    extend: {
      // Move over x-axis
      x: function (x) {
        return x == null ? this.transform('x') : this.transform({
          x: -this.x() + x
        }, true);
      } // Move over y-axis
      ,
      y: function (y) {
        return y == null ? this.transform('y') : this.transform({
          y: -this.y() + y
        }, true);
      } // Move by center over x-axis
      ,
      cx: function (x) {
        return x == null ? this.tbox().cx : this.x(x - this.tbox().width / 2);
      } // Move by center over y-axis
      ,
      cy: function (y) {
        return y == null ? this.tbox().cy : this.y(y - this.tbox().height / 2);
      },
      gbox: function () {
        var bbox = this.bbox(),
            trans = this.transform();
        bbox.x += trans.x;
        bbox.x2 += trans.x;
        bbox.cx += trans.x;
        bbox.y += trans.y;
        bbox.y2 += trans.y;
        bbox.cy += trans.y;
        return bbox;
      } // Add parent method

    },
    construct: {
      // Create a group element
      group: function () {
        return this.put(new SVG.G());
      }
    }
  }); // ### This module adds backward / forward functionality to elements.
  //

  SVG.extend(SVG.Element, {
    // Get all siblings, including myself
    siblings: function () {
      return this.parent().children();
    } // Get the curent position siblings
    ,
    position: function () {
      return this.parent().index(this);
    } // Get the next element (will return null if there is none)
    ,
    next: function () {
      return this.siblings()[this.position() + 1];
    } // Get the next element (will return null if there is none)
    ,
    previous: function () {
      return this.siblings()[this.position() - 1];
    } // Send given element one step forward
    ,
    forward: function () {
      var i = this.position() + 1,
          p = this.parent(); // move node one step forward

      p.removeElement(this).add(this, i); // make sure defs node is always at the top

      if (p instanceof SVG.Doc) p.node.appendChild(p.defs().node);
      return this;
    } // Send given element one step backward
    ,
    backward: function () {
      var i = this.position();
      if (i > 0) this.parent().removeElement(this).add(this, i - 1);
      return this;
    } // Send given element all the way to the front
    ,
    front: function () {
      var p = this.parent(); // Move node forward

      p.node.appendChild(this.node); // Make sure defs node is always at the top

      if (p instanceof SVG.Doc) p.node.appendChild(p.defs().node);
      return this;
    } // Send given element all the way to the back
    ,
    back: function () {
      if (this.position() > 0) this.parent().removeElement(this).add(this, 0);
      return this;
    } // Inserts a given element before the targeted element
    ,
    before: function (element) {
      element.remove();
      var i = this.position();
      this.parent().add(element, i);
      return this;
    } // Insters a given element after the targeted element
    ,
    after: function (element) {
      element.remove();
      var i = this.position();
      this.parent().add(element, i + 1);
      return this;
    }
  });
  SVG.Mask = SVG.invent({
    // Initialize node
    create: function () {
      this.constructor.call(this, SVG.create('mask')); // keep references to masked elements

      this.targets = [];
    } // Inherit from
    ,
    inherit: SVG.Container // Add class methods
    ,
    extend: {
      // Unmask all masked elements and remove itself
      remove: function () {
        // unmask all targets
        for (var i = this.targets.length - 1; i >= 0; i--) if (this.targets[i]) this.targets[i].unmask();

        delete this.targets; // remove mask from parent

        this.parent().removeElement(this);
        return this;
      } // Add parent method

    },
    construct: {
      // Create masking element
      mask: function () {
        return this.defs().put(new SVG.Mask());
      }
    }
  });
  SVG.extend(SVG.Element, {
    // Distribute mask to svg element
    maskWith: function (element) {
      // use given mask or create a new one
      this.masker = element instanceof SVG.Mask ? element : this.parent().mask().add(element); // store reverence on self in mask

      this.masker.targets.push(this); // apply mask

      return this.attr('mask', 'url("#' + this.masker.attr('id') + '")');
    } // Unmask element
    ,
    unmask: function () {
      delete this.masker;
      return this.attr('mask', null);
    }
  });
  SVG.ClipPath = SVG.invent({
    // Initialize node
    create: function () {
      this.constructor.call(this, SVG.create('clipPath')); // keep references to clipped elements

      this.targets = [];
    } // Inherit from
    ,
    inherit: SVG.Container // Add class methods
    ,
    extend: {
      // Unclip all clipped elements and remove itself
      remove: function () {
        // unclip all targets
        for (var i = this.targets.length - 1; i >= 0; i--) if (this.targets[i]) this.targets[i].unclip();

        delete this.targets; // remove clipPath from parent

        this.parent().removeElement(this);
        return this;
      } // Add parent method

    },
    construct: {
      // Create clipping element
      clip: function () {
        return this.defs().put(new SVG.ClipPath());
      }
    }
  }); //

  SVG.extend(SVG.Element, {
    // Distribute clipPath to svg element
    clipWith: function (element) {
      // use given clip or create a new one
      this.clipper = element instanceof SVG.ClipPath ? element : this.parent().clip().add(element); // store reverence on self in mask

      this.clipper.targets.push(this); // apply mask

      return this.attr('clip-path', 'url("#' + this.clipper.attr('id') + '")');
    } // Unclip element
    ,
    unclip: function () {
      delete this.clipper;
      return this.attr('clip-path', null);
    }
  });
  SVG.Gradient = SVG.invent({
    // Initialize node
    create: function (type) {
      this.constructor.call(this, SVG.create(type + 'Gradient')); // store type

      this.type = type;
    } // Inherit from
    ,
    inherit: SVG.Container // Add class methods
    ,
    extend: {
      // Add a color stop
      at: function (offset, color, opacity) {
        return this.put(new SVG.Stop()).update(offset, color, opacity);
      } // Update gradient
      ,
      update: function (block) {
        // remove all stops
        this.clear(); // invoke passed block

        if (typeof block == 'function') block.call(this, this);
        return this;
      } // Return the fill id
      ,
      fill: function () {
        return 'url(#' + this.id() + ')';
      } // Alias string convertion to fill
      ,
      toString: function () {
        return this.fill();
      } // custom attr to handle transform
      ,
      attr: function (a, b, c) {
        if (a == 'transform') a = 'gradientTransform';
        return SVG.Container.prototype.attr.call(this, a, b, c);
      } // Add parent method

    },
    construct: {
      // Create gradient element in defs
      gradient: function (type, block) {
        return this.defs().gradient(type, block);
      }
    }
  }); // Add animatable methods to both gradient and fx module

  SVG.extend(SVG.Gradient, SVG.FX, {
    // From position
    from: function (x, y) {
      return (this.target || this).type == 'radial' ? this.attr({
        fx: new SVG.Number(x),
        fy: new SVG.Number(y)
      }) : this.attr({
        x1: new SVG.Number(x),
        y1: new SVG.Number(y)
      });
    } // To position
    ,
    to: function (x, y) {
      return (this.target || this).type == 'radial' ? this.attr({
        cx: new SVG.Number(x),
        cy: new SVG.Number(y)
      }) : this.attr({
        x2: new SVG.Number(x),
        y2: new SVG.Number(y)
      });
    }
  }); // Base gradient generation

  SVG.extend(SVG.Defs, {
    // define gradient
    gradient: function (type, block) {
      return this.put(new SVG.Gradient(type)).update(block);
    }
  });
  SVG.Stop = SVG.invent({
    // Initialize node
    create: 'stop' // Inherit from
    ,
    inherit: SVG.Element // Add class methods
    ,
    extend: {
      // add color stops
      update: function (o) {
        if (typeof o == 'number' || o instanceof SVG.Number) {
          o = {
            offset: arguments[0],
            color: arguments[1],
            opacity: arguments[2]
          };
        } // set attributes


        if (o.opacity != null) this.attr('stop-opacity', o.opacity);
        if (o.color != null) this.attr('stop-color', o.color);
        if (o.offset != null) this.attr('offset', new SVG.Number(o.offset));
        return this;
      }
    }
  });
  SVG.Pattern = SVG.invent({
    // Initialize node
    create: 'pattern' // Inherit from
    ,
    inherit: SVG.Container // Add class methods
    ,
    extend: {
      // Return the fill id
      fill: function () {
        return 'url(#' + this.id() + ')';
      } // Update pattern by rebuilding
      ,
      update: function (block) {
        // remove content
        this.clear(); // invoke passed block

        if (typeof block == 'function') block.call(this, this);
        return this;
      } // Alias string convertion to fill
      ,
      toString: function () {
        return this.fill();
      } // custom attr to handle transform
      ,
      attr: function (a, b, c) {
        if (a == 'transform') a = 'patternTransform';
        return SVG.Container.prototype.attr.call(this, a, b, c);
      } // Add parent method

    },
    construct: {
      // Create pattern element in defs
      pattern: function (width, height, block) {
        return this.defs().pattern(width, height, block);
      }
    }
  });
  SVG.extend(SVG.Defs, {
    // Define gradient
    pattern: function (width, height, block) {
      return this.put(new SVG.Pattern()).update(block).attr({
        x: 0,
        y: 0,
        width: width,
        height: height,
        patternUnits: 'userSpaceOnUse'
      });
    }
  });
  SVG.Doc = SVG.invent({
    // Initialize node
    create: function (element) {
      if (element) {
        // ensure the presence of a dom element
        element = typeof element == 'string' ? document.getElementById(element) : element; // If the target is an svg element, use that element as the main wrapper.
        // This allows svg.js to work with svg documents as well.

        if (element.nodeName == 'svg') {
          this.constructor.call(this, element);
        } else {
          this.constructor.call(this, SVG.create('svg'));
          element.appendChild(this.node);
        } // set svg element attributes and ensure defs node


        this.namespace().size('100%', '100%').defs();
      }
    } // Inherit from
    ,
    inherit: SVG.Container // Add class methods
    ,
    extend: {
      // Add namespaces
      namespace: function () {
        return this.attr({
          xmlns: SVG.ns,
          version: '1.1'
        }).attr('xmlns:xlink', SVG.xlink, SVG.xmlns).attr('xmlns:svgjs', SVG.svgjs, SVG.xmlns);
      } // Creates and returns defs element
      ,
      defs: function () {
        if (!this._defs) {
          var defs; // Find or create a defs element in this instance

          if (defs = this.node.getElementsByTagName('defs')[0]) this._defs = SVG.adopt(defs);else this._defs = new SVG.Defs(); // Make sure the defs node is at the end of the stack

          this.node.appendChild(this._defs.node);
        }

        return this._defs;
      } // custom parent method
      ,
      parent: function () {
        return this.node.parentNode.nodeName == '#document' ? null : this.node.parentNode;
      } // Fix for possible sub-pixel offset. See:
      // https://bugzilla.mozilla.org/show_bug.cgi?id=608812
      ,
      spof: function (spof) {
        var pos = this.node.getScreenCTM();
        if (pos) this.style('left', -pos.e % 1 + 'px').style('top', -pos.f % 1 + 'px');
        return this;
      } // Removes the doc from the DOM
      ,
      remove: function () {
        if (this.parent()) {
          this.parent().removeChild(this.node);
        }

        return this;
      }
    }
  });
  SVG.Shape = SVG.invent({
    // Initialize node
    create: function (element) {
      this.constructor.call(this, element);
    } // Inherit from
    ,
    inherit: SVG.Element
  });
  SVG.Bare = SVG.invent({
    // Initialize
    create: function (element, inherit) {
      // construct element
      this.constructor.call(this, SVG.create(element)); // inherit custom methods

      if (inherit) for (var method in inherit.prototype) if (typeof inherit.prototype[method] === 'function') this[method] = inherit.prototype[method];
    } // Inherit from
    ,
    inherit: SVG.Element // Add methods
    ,
    extend: {
      // Insert some plain text
      words: function (text) {
        // remove contents
        while (this.node.hasChildNodes()) this.node.removeChild(this.node.lastChild); // create text node


        this.node.appendChild(document.createTextNode(text));
        return this;
      }
    }
  });
  SVG.extend(SVG.Parent, {
    // Create an element that is not described by SVG.js
    element: function (element, inherit) {
      return this.put(new SVG.Bare(element, inherit));
    } // Add symbol element
    ,
    symbol: function () {
      return this.defs().element('symbol', SVG.Container);
    }
  });
  SVG.Use = SVG.invent({
    // Initialize node
    create: 'use' // Inherit from
    ,
    inherit: SVG.Shape // Add class methods
    ,
    extend: {
      // Use element as a reference
      element: function (element, file) {
        // Set lined element
        return this.attr('href', (file || '') + '#' + element, SVG.xlink);
      } // Add parent method

    },
    construct: {
      // Create a use element
      use: function (element, file) {
        return this.put(new SVG.Use()).element(element, file);
      }
    }
  });
  SVG.Rect = SVG.invent({
    // Initialize node
    create: 'rect' // Inherit from
    ,
    inherit: SVG.Shape // Add parent method
    ,
    construct: {
      // Create a rect element
      rect: function (width, height) {
        return this.put(new SVG.Rect()).size(width, height);
      }
    }
  });
  SVG.Circle = SVG.invent({
    // Initialize node
    create: 'circle' // Inherit from
    ,
    inherit: SVG.Shape // Add parent method
    ,
    construct: {
      // Create circle element, based on ellipse
      circle: function (size) {
        return this.put(new SVG.Circle()).rx(new SVG.Number(size).divide(2)).move(0, 0);
      }
    }
  });
  SVG.extend(SVG.Circle, SVG.FX, {
    // Radius x value
    rx: function (rx) {
      return this.attr('r', rx);
    } // Alias radius x value
    ,
    ry: function (ry) {
      return this.rx(ry);
    }
  });
  SVG.Ellipse = SVG.invent({
    // Initialize node
    create: 'ellipse' // Inherit from
    ,
    inherit: SVG.Shape // Add parent method
    ,
    construct: {
      // Create an ellipse
      ellipse: function (width, height) {
        return this.put(new SVG.Ellipse()).size(width, height).move(0, 0);
      }
    }
  });
  SVG.extend(SVG.Ellipse, SVG.Rect, SVG.FX, {
    // Radius x value
    rx: function (rx) {
      return this.attr('rx', rx);
    } // Radius y value
    ,
    ry: function (ry) {
      return this.attr('ry', ry);
    }
  }); // Add common method

  SVG.extend(SVG.Circle, SVG.Ellipse, {
    // Move over x-axis
    x: function (x) {
      return x == null ? this.cx() - this.rx() : this.cx(x + this.rx());
    } // Move over y-axis
    ,
    y: function (y) {
      return y == null ? this.cy() - this.ry() : this.cy(y + this.ry());
    } // Move by center over x-axis
    ,
    cx: function (x) {
      return x == null ? this.attr('cx') : this.attr('cx', x);
    } // Move by center over y-axis
    ,
    cy: function (y) {
      return y == null ? this.attr('cy') : this.attr('cy', y);
    } // Set width of element
    ,
    width: function (width) {
      return width == null ? this.rx() * 2 : this.rx(new SVG.Number(width).divide(2));
    } // Set height of element
    ,
    height: function (height) {
      return height == null ? this.ry() * 2 : this.ry(new SVG.Number(height).divide(2));
    } // Custom size function
    ,
    size: function (width, height) {
      var p = proportionalSize(this.bbox(), width, height);
      return this.rx(new SVG.Number(p.width).divide(2)).ry(new SVG.Number(p.height).divide(2));
    }
  });
  SVG.Line = SVG.invent({
    // Initialize node
    create: 'line' // Inherit from
    ,
    inherit: SVG.Shape // Add class methods
    ,
    extend: {
      // Get array
      array: function () {
        return new SVG.PointArray([[this.attr('x1'), this.attr('y1')], [this.attr('x2'), this.attr('y2')]]);
      } // Overwrite native plot() method
      ,
      plot: function (x1, y1, x2, y2) {
        if (arguments.length == 4) x1 = {
          x1: x1,
          y1: y1,
          x2: x2,
          y2: y2
        };else x1 = new SVG.PointArray(x1).toLine();
        return this.attr(x1);
      } // Move by left top corner
      ,
      move: function (x, y) {
        return this.attr(this.array().move(x, y).toLine());
      } // Set element size to given width and height
      ,
      size: function (width, height) {
        var p = proportionalSize(this.bbox(), width, height);
        return this.attr(this.array().size(p.width, p.height).toLine());
      } // Add parent method

    },
    construct: {
      // Create a line element
      line: function (x1, y1, x2, y2) {
        return this.put(new SVG.Line()).plot(x1, y1, x2, y2);
      }
    }
  });
  SVG.Polyline = SVG.invent({
    // Initialize node
    create: 'polyline' // Inherit from
    ,
    inherit: SVG.Shape // Add parent method
    ,
    construct: {
      // Create a wrapped polyline element
      polyline: function (p) {
        return this.put(new SVG.Polyline()).plot(p);
      }
    }
  });
  SVG.Polygon = SVG.invent({
    // Initialize node
    create: 'polygon' // Inherit from
    ,
    inherit: SVG.Shape // Add parent method
    ,
    construct: {
      // Create a wrapped polygon element
      polygon: function (p) {
        return this.put(new SVG.Polygon()).plot(p);
      }
    }
  }); // Add polygon-specific functions

  SVG.extend(SVG.Polyline, SVG.Polygon, {
    // Get array
    array: function () {
      return this._array || (this._array = new SVG.PointArray(this.attr('points')));
    } // Plot new path
    ,
    plot: function (p) {
      return this.attr('points', this._array = new SVG.PointArray(p));
    } // Move by left top corner
    ,
    move: function (x, y) {
      return this.attr('points', this.array().move(x, y));
    } // Set element size to given width and height
    ,
    size: function (width, height) {
      var p = proportionalSize(this.bbox(), width, height);
      return this.attr('points', this.array().size(p.width, p.height));
    }
  }); // unify all point to point elements

  SVG.extend(SVG.Line, SVG.Polyline, SVG.Polygon, {
    // Define morphable array
    morphArray: SVG.PointArray // Move by left top corner over x-axis
    ,
    x: function (x) {
      return x == null ? this.bbox().x : this.move(x, this.bbox().y);
    } // Move by left top corner over y-axis
    ,
    y: function (y) {
      return y == null ? this.bbox().y : this.move(this.bbox().x, y);
    } // Set width of element
    ,
    width: function (width) {
      var b = this.bbox();
      return width == null ? b.width : this.size(width, b.height);
    } // Set height of element
    ,
    height: function (height) {
      var b = this.bbox();
      return height == null ? b.height : this.size(b.width, height);
    }
  });
  SVG.Path = SVG.invent({
    // Initialize node
    create: 'path' // Inherit from
    ,
    inherit: SVG.Shape // Add class methods
    ,
    extend: {
      // Define morphable array
      morphArray: SVG.PathArray // Get array
      ,
      array: function () {
        return this._array || (this._array = new SVG.PathArray(this.attr('d')));
      } // Plot new poly points
      ,
      plot: function (p) {
        return this.attr('d', this._array = new SVG.PathArray(p));
      } // Move by left top corner
      ,
      move: function (x, y) {
        return this.attr('d', this.array().move(x, y));
      } // Move by left top corner over x-axis
      ,
      x: function (x) {
        return x == null ? this.bbox().x : this.move(x, this.bbox().y);
      } // Move by left top corner over y-axis
      ,
      y: function (y) {
        return y == null ? this.bbox().y : this.move(this.bbox().x, y);
      } // Set element size to given width and height
      ,
      size: function (width, height) {
        var p = proportionalSize(this.bbox(), width, height);
        return this.attr('d', this.array().size(p.width, p.height));
      } // Set width of element
      ,
      width: function (width) {
        return width == null ? this.bbox().width : this.size(width, this.bbox().height);
      } // Set height of element
      ,
      height: function (height) {
        return height == null ? this.bbox().height : this.size(this.bbox().width, height);
      } // Add parent method

    },
    construct: {
      // Create a wrapped path element
      path: function (d) {
        return this.put(new SVG.Path()).plot(d);
      }
    }
  });
  SVG.Image = SVG.invent({
    // Initialize node
    create: 'image' // Inherit from
    ,
    inherit: SVG.Shape // Add class methods
    ,
    extend: {
      // (re)load image
      load: function (url) {
        if (!url) return this;
        var self = this,
            img = document.createElement('img'); // preload image

        img.onload = function () {
          var p = self.parent(SVG.Pattern); // ensure image size

          if (self.width() == 0 && self.height() == 0) self.size(img.width, img.height); // ensure pattern size if not set

          if (p && p.width() == 0 && p.height() == 0) p.size(self.width(), self.height()); // callback

          if (typeof self._loaded === 'function') self._loaded.call(self, {
            width: img.width,
            height: img.height,
            ratio: img.width / img.height,
            url: url
          });
        };

        return this.attr('href', img.src = this.src = url, SVG.xlink);
      } // Add loaded callback
      ,
      loaded: function (loaded) {
        this._loaded = loaded;
        return this;
      } // Add parent method

    },
    construct: {
      // create image element, load image and set its size
      image: function (source, width, height) {
        return this.put(new SVG.Image()).load(source).size(width || 0, height || width || 0);
      }
    }
  });
  SVG.Text = SVG.invent({
    // Initialize node
    create: function () {
      this.constructor.call(this, SVG.create('text'));
      this.dom.leading = new SVG.Number(1.3); // store leading value for rebuilding

      this._rebuild = true; // enable automatic updating of dy values

      this._build = false; // disable build mode for adding multiple lines
      // set default font

      this.attr('font-family', SVG.defaults.attrs['font-family']);
    } // Inherit from
    ,
    inherit: SVG.Shape // Add class methods
    ,
    extend: {
      clone: function () {
        // clone element and assign new id
        var clone = assignNewId(this.node.cloneNode(true)); // insert the clone after myself

        this.after(clone);
        return clone;
      } // Move over x-axis
      ,
      x: function (x) {
        // act as getter
        if (x == null) return this.attr('x'); // move lines as well if no textPath is present

        if (!this.textPath) this.lines().each(function () {
          if (this.dom.newLined) this.x(x);
        });
        return this.attr('x', x);
      } // Move over y-axis
      ,
      y: function (y) {
        var oy = this.attr('y'),
            o = typeof oy === 'number' ? oy - this.bbox().y : 0; // act as getter

        if (y == null) return typeof oy === 'number' ? oy - o : oy;
        return this.attr('y', typeof y === 'number' ? y + o : y);
      } // Move center over x-axis
      ,
      cx: function (x) {
        return x == null ? this.bbox().cx : this.x(x - this.bbox().width / 2);
      } // Move center over y-axis
      ,
      cy: function (y) {
        return y == null ? this.bbox().cy : this.y(y - this.bbox().height / 2);
      } // Set the text content
      ,
      text: function (text) {
        // act as getter
        if (typeof text === 'undefined') {
          var text = '';
          var children = this.node.childNodes;

          for (var i = 0, len = children.length; i < len; ++i) {
            // add newline if its not the first child and newLined is set to true
            if (i != 0 && children[i].nodeType != 3 && SVG.adopt(children[i]).dom.newLined == true) {
              text += '\n';
            } // add content of this node


            text += children[i].textContent;
          }

          return text;
        } // remove existing content


        this.clear().build(true);

        if (typeof text === 'function') {
          // call block
          text.call(this, this);
        } else {
          // store text and make sure text is not blank
          text = text.split('\n'); // build new lines

          for (var i = 0, il = text.length; i < il; i++) this.tspan(text[i]).newLine();
        } // disable build mode and rebuild lines


        return this.build(false).rebuild();
      } // Set font size
      ,
      size: function (size) {
        return this.attr('font-size', size).rebuild();
      } // Set / get leading
      ,
      leading: function (value) {
        // act as getter
        if (value == null) return this.dom.leading; // act as setter

        this.dom.leading = new SVG.Number(value);
        return this.rebuild();
      } // Get all the first level lines
      ,
      lines: function () {
        // filter tspans and map them to SVG.js instances
        var lines = SVG.utils.map(SVG.utils.filterSVGElements(this.node.childNodes), function (el) {
          return SVG.adopt(el);
        }); // return an instance of SVG.set

        return new SVG.Set(lines);
      } // Rebuild appearance type
      ,
      rebuild: function (rebuild) {
        // store new rebuild flag if given
        if (typeof rebuild == 'boolean') this._rebuild = rebuild; // define position of all lines

        if (this._rebuild) {
          var self = this;
          this.lines().each(function () {
            if (this.dom.newLined) {
              if (!this.textPath) this.attr('x', self.attr('x'));
              this.attr('dy', self.dom.leading * new SVG.Number(self.attr('font-size')));
            }
          });
          this.fire('rebuild');
        }

        return this;
      } // Enable / disable build mode
      ,
      build: function (build) {
        this._build = !!build;
        return this;
      } // overwrite method from parent to set data properly
      ,
      setData: function (o) {
        this.dom = o;
        this.dom.leading = o.leading ? new SVG.Number(o.leading.value, o.leading.unit) : new SVG.Number(1.3);
        return this;
      } // Add parent method

    },
    construct: {
      // Create text element
      text: function (text) {
        return this.put(new SVG.Text()).text(text);
      } // Create plain text element
      ,
      plain: function (text) {
        return this.put(new SVG.Text()).plain(text);
      }
    }
  });
  SVG.Tspan = SVG.invent({
    // Initialize node
    create: 'tspan' // Inherit from
    ,
    inherit: SVG.Shape // Add class methods
    ,
    extend: {
      // Set text content
      text: function (text) {
        typeof text === 'function' ? text.call(this, this) : this.plain(text);
        return this;
      } // Shortcut dx
      ,
      dx: function (dx) {
        return this.attr('dx', dx);
      } // Shortcut dy
      ,
      dy: function (dy) {
        return this.attr('dy', dy);
      } // Create new line
      ,
      newLine: function () {
        // fetch text parent
        var t = this.parent(SVG.Text); // mark new line

        this.dom.newLined = true; // apply new hy¡n

        return this.dy(t.dom.leading * t.attr('font-size')).attr('x', t.x());
      }
    }
  });
  SVG.extend(SVG.Text, SVG.Tspan, {
    // Create plain text node
    plain: function (text) {
      // clear if build mode is disabled
      if (this._build === false) this.clear(); // create text node

      this.node.appendChild(document.createTextNode(text));
      return this;
    } // Create a tspan
    ,
    tspan: function (text) {
      var node = (this.textPath && this.textPath() || this).node,
          tspan = new SVG.Tspan(); // clear if build mode is disabled

      if (this._build === false) this.clear(); // add new tspan

      node.appendChild(tspan.node);
      return tspan.text(text);
    } // Clear all lines
    ,
    clear: function () {
      var node = (this.textPath && this.textPath() || this).node; // remove existing child nodes

      while (node.hasChildNodes()) node.removeChild(node.lastChild);

      return this;
    } // Get length of text element
    ,
    length: function () {
      return this.node.getComputedTextLength();
    }
  });
  SVG.TextPath = SVG.invent({
    // Initialize node
    create: 'textPath' // Inherit from
    ,
    inherit: SVG.Element // Define parent class
    ,
    parent: SVG.Text // Add parent method
    ,
    construct: {
      // Create path for text to run on
      path: function (d) {
        // create textPath element
        var path = new SVG.TextPath(),
            track = this.doc().defs().path(d); // move lines to textpath

        while (this.node.hasChildNodes()) path.node.appendChild(this.node.firstChild); // add textPath element as child node


        this.node.appendChild(path.node); // link textPath to path and add content

        path.attr('href', '#' + track, SVG.xlink);
        return this;
      } // Plot path if any
      ,
      plot: function (d) {
        var track = this.track();
        if (track) track.plot(d);
        return this;
      } // Get the path track element
      ,
      track: function () {
        var path = this.textPath();
        if (path) return path.reference('href');
      } // Get the textPath child
      ,
      textPath: function () {
        if (this.node.firstChild && this.node.firstChild.nodeName == 'textPath') return SVG.adopt(this.node.firstChild);
      }
    }
  });
  SVG.Nested = SVG.invent({
    // Initialize node
    create: function () {
      this.constructor.call(this, SVG.create('svg'));
      this.style('overflow', 'visible');
    } // Inherit from
    ,
    inherit: SVG.Container // Add parent method
    ,
    construct: {
      // Create nested svg document
      nested: function () {
        return this.put(new SVG.Nested());
      }
    }
  });
  SVG.A = SVG.invent({
    // Initialize node
    create: 'a' // Inherit from
    ,
    inherit: SVG.Container // Add class methods
    ,
    extend: {
      // Link url
      to: function (url) {
        return this.attr('href', url, SVG.xlink);
      } // Link show attribute
      ,
      show: function (target) {
        return this.attr('show', target, SVG.xlink);
      } // Link target attribute
      ,
      target: function (target) {
        return this.attr('target', target);
      } // Add parent method

    },
    construct: {
      // Create a hyperlink element
      link: function (url) {
        return this.put(new SVG.A()).to(url);
      }
    }
  });
  SVG.extend(SVG.Element, {
    // Create a hyperlink element
    linkTo: function (url) {
      var link = new SVG.A();
      if (typeof url == 'function') url.call(link, link);else link.to(url);
      return this.parent().put(link).put(this);
    }
  });
  SVG.Marker = SVG.invent({
    // Initialize node
    create: 'marker' // Inherit from
    ,
    inherit: SVG.Container // Add class methods
    ,
    extend: {
      // Set width of element
      width: function (width) {
        return this.attr('markerWidth', width);
      } // Set height of element
      ,
      height: function (height) {
        return this.attr('markerHeight', height);
      } // Set marker refX and refY
      ,
      ref: function (x, y) {
        return this.attr('refX', x).attr('refY', y);
      } // Update marker
      ,
      update: function (block) {
        // remove all content
        this.clear(); // invoke passed block

        if (typeof block == 'function') block.call(this, this);
        return this;
      } // Return the fill id
      ,
      toString: function () {
        return 'url(#' + this.id() + ')';
      } // Add parent method

    },
    construct: {
      marker: function (width, height, block) {
        // Create marker element in defs
        return this.defs().marker(width, height, block);
      }
    }
  });
  SVG.extend(SVG.Defs, {
    // Create marker
    marker: function (width, height, block) {
      // Set default viewbox to match the width and height, set ref to cx and cy and set orient to auto
      return this.put(new SVG.Marker()).size(width, height).ref(width / 2, height / 2).viewbox(0, 0, width, height).attr('orient', 'auto').update(block);
    }
  });
  SVG.extend(SVG.Line, SVG.Polyline, SVG.Polygon, SVG.Path, {
    // Create and attach markers
    marker: function (marker, width, height, block) {
      var attr = ['marker']; // Build attribute name

      if (marker != 'all') attr.push(marker);
      attr = attr.join('-'); // Set marker attribute

      marker = arguments[1] instanceof SVG.Marker ? arguments[1] : this.doc().marker(width, height, block);
      return this.attr(attr, marker);
    }
  }); // Define list of available attributes for stroke and fill

  var sugar = {
    stroke: ['color', 'width', 'opacity', 'linecap', 'linejoin', 'miterlimit', 'dasharray', 'dashoffset'],
    fill: ['color', 'opacity', 'rule'],
    prefix: function (t, a) {
      return a == 'color' ? t : t + '-' + a;
    } // Add sugar for fill and stroke

  };
  ['fill', 'stroke'].forEach(function (m) {
    var i,
        extension = {};

    extension[m] = function (o) {
      if (typeof o == 'string' || SVG.Color.isRgb(o) || o && typeof o.fill === 'function') this.attr(m, o);else // set all attributes from sugar.fill and sugar.stroke list
        for (i = sugar[m].length - 1; i >= 0; i--) if (o[sugar[m][i]] != null) this.attr(sugar.prefix(m, sugar[m][i]), o[sugar[m][i]]);
      return this;
    };

    SVG.extend(SVG.Element, SVG.FX, extension);
  });
  SVG.extend(SVG.Element, SVG.FX, {
    // Map rotation to transform
    rotate: function (d, cx, cy) {
      return this.transform({
        rotation: d,
        cx: cx,
        cy: cy
      });
    } // Map skew to transform
    ,
    skew: function (x, y, cx, cy) {
      return this.transform({
        skewX: x,
        skewY: y,
        cx: cx,
        cy: cy
      });
    } // Map scale to transform
    ,
    scale: function (x, y, cx, cy) {
      return arguments.length == 1 || arguments.length == 3 ? this.transform({
        scale: x,
        cx: y,
        cy: cx
      }) : this.transform({
        scaleX: x,
        scaleY: y,
        cx: cx,
        cy: cy
      });
    } // Map translate to transform
    ,
    translate: function (x, y) {
      return this.transform({
        x: x,
        y: y
      });
    } // Map flip to transform
    ,
    flip: function (a, o) {
      return this.transform({
        flip: a,
        offset: o
      });
    } // Map matrix to transform
    ,
    matrix: function (m) {
      return this.attr('transform', new SVG.Matrix(m));
    } // Opacity
    ,
    opacity: function (value) {
      return this.attr('opacity', value);
    } // Relative move over x axis
    ,
    dx: function (x) {
      return this.x((this.target || this).x() + x);
    } // Relative move over y axis
    ,
    dy: function (y) {
      return this.y((this.target || this).y() + y);
    } // Relative move over x and y axes
    ,
    dmove: function (x, y) {
      return this.dx(x).dy(y);
    }
  });
  SVG.extend(SVG.Rect, SVG.Ellipse, SVG.Circle, SVG.Gradient, SVG.FX, {
    // Add x and y radius
    radius: function (x, y) {
      var type = (this.target || this).type;
      return type == 'radial' || type == 'circle' ? this.attr({
        'r': new SVG.Number(x)
      }) : this.rx(x).ry(y == null ? x : y);
    }
  });
  SVG.extend(SVG.Path, {
    // Get path length
    length: function () {
      return this.node.getTotalLength();
    } // Get point at length
    ,
    pointAt: function (length) {
      return this.node.getPointAtLength(length);
    }
  });
  SVG.extend(SVG.Parent, SVG.Text, SVG.FX, {
    // Set font
    font: function (o) {
      for (var k in o) k == 'leading' ? this.leading(o[k]) : k == 'anchor' ? this.attr('text-anchor', o[k]) : k == 'size' || k == 'family' || k == 'weight' || k == 'stretch' || k == 'variant' || k == 'style' ? this.attr('font-' + k, o[k]) : this.attr(k, o[k]);

      return this;
    }
  });
  SVG.Set = SVG.invent({
    // Initialize
    create: function (members) {
      // Set initial state
      Array.isArray(members) ? this.members = members : this.clear();
    } // Add class methods
    ,
    extend: {
      // Add element to set
      add: function () {
        var i,
            il,
            elements = [].slice.call(arguments);

        for (i = 0, il = elements.length; i < il; i++) this.members.push(elements[i]);

        return this;
      } // Remove element from set
      ,
      remove: function (element) {
        var i = this.index(element); // remove given child

        if (i > -1) this.members.splice(i, 1);
        return this;
      } // Iterate over all members
      ,
      each: function (block) {
        for (var i = 0, il = this.members.length; i < il; i++) block.apply(this.members[i], [i, this.members]);

        return this;
      } // Restore to defaults
      ,
      clear: function () {
        // initialize store
        this.members = [];
        return this;
      } // Get the length of a set
      ,
      length: function () {
        return this.members.length;
      } // Checks if a given element is present in set
      ,
      has: function (element) {
        return this.index(element) >= 0;
      } // retuns index of given element in set
      ,
      index: function (element) {
        return this.members.indexOf(element);
      } // Get member at given index
      ,
      get: function (i) {
        return this.members[i];
      } // Get first member
      ,
      first: function () {
        return this.get(0);
      } // Get last member
      ,
      last: function () {
        return this.get(this.members.length - 1);
      } // Default value
      ,
      valueOf: function () {
        return this.members;
      } // Get the bounding box of all members included or empty box if set has no items
      ,
      bbox: function () {
        var box = new SVG.BBox(); // return an empty box of there are no members

        if (this.members.length == 0) return box; // get the first rbox and update the target bbox

        var rbox = this.members[0].rbox();
        box.x = rbox.x;
        box.y = rbox.y;
        box.width = rbox.width;
        box.height = rbox.height;
        this.each(function () {
          // user rbox for correct position and visual representation
          box = box.merge(this.rbox());
        });
        return box;
      } // Add parent method

    },
    construct: {
      // Create a new set
      set: function (members) {
        return new SVG.Set(members);
      }
    }
  });
  SVG.FX.Set = SVG.invent({
    // Initialize node
    create: function (set) {
      // store reference to set
      this.set = set;
    }
  }); // Alias methods

  SVG.Set.inherit = function () {
    var m,
        methods = []; // gather shape methods

    for (var m in SVG.Shape.prototype) if (typeof SVG.Shape.prototype[m] == 'function' && typeof SVG.Set.prototype[m] != 'function') methods.push(m); // apply shape aliasses


    methods.forEach(function (method) {
      SVG.Set.prototype[method] = function () {
        for (var i = 0, il = this.members.length; i < il; i++) if (this.members[i] && typeof this.members[i][method] == 'function') this.members[i][method].apply(this.members[i], arguments);

        return method == 'animate' ? this.fx || (this.fx = new SVG.FX.Set(this)) : this;
      };
    }); // clear methods for the next round

    methods = []; // gather fx methods

    for (var m in SVG.FX.prototype) if (typeof SVG.FX.prototype[m] == 'function' && typeof SVG.FX.Set.prototype[m] != 'function') methods.push(m); // apply fx aliasses


    methods.forEach(function (method) {
      SVG.FX.Set.prototype[method] = function () {
        for (var i = 0, il = this.set.members.length; i < il; i++) this.set.members[i].fx[method].apply(this.set.members[i].fx, arguments);

        return this;
      };
    });
  };

  SVG.extend(SVG.Element, {
    // Store data values on svg nodes
    data: function (a, v, r) {
      if (typeof a == 'object') {
        for (v in a) this.data(v, a[v]);
      } else if (arguments.length < 2) {
        try {
          return JSON.parse(this.attr('data-' + a));
        } catch (e) {
          return this.attr('data-' + a);
        }
      } else {
        this.attr('data-' + a, v === null ? null : r === true || typeof v === 'string' || typeof v === 'number' ? v : JSON.stringify(v));
      }

      return this;
    }
  });
  SVG.extend(SVG.Element, {
    // Remember arbitrary data
    remember: function (k, v) {
      // remember every item in an object individually
      if (typeof arguments[0] == 'object') for (var v in k) this.remember(v, k[v]); // retrieve memory
      else if (arguments.length == 1) return this.memory()[k]; // store memory
        else this.memory()[k] = v;
      return this;
    } // Erase a given memory
    ,
    forget: function () {
      if (arguments.length == 0) this._memory = {};else for (var i = arguments.length - 1; i >= 0; i--) delete this.memory()[arguments[i]];
      return this;
    } // Initialize or return local memory object
    ,
    memory: function () {
      return this._memory || (this._memory = {});
    }
  }); // Method for getting an element by id

  SVG.get = function (id) {
    var node = document.getElementById(idFromReference(id) || id);
    return SVG.adopt(node);
  }; // Select elements by query string


  SVG.select = function (query, parent) {
    return new SVG.Set(SVG.utils.map((parent || document).querySelectorAll(query), function (node) {
      return SVG.adopt(node);
    }));
  };

  SVG.extend(SVG.Parent, {
    // Scoped select method
    select: function (query) {
      return SVG.select(query, this.node);
    }
  }); // tests if a given selector matches an element

  function matches(el, selector) {
    return (el.matches || el.matchesSelector || el.msMatchesSelector || el.mozMatchesSelector || el.webkitMatchesSelector || el.oMatchesSelector).call(el, selector);
  } // Convert dash-separated-string to camelCase


  function camelCase(s) {
    return s.toLowerCase().replace(/-(.)/g, function (m, g) {
      return g.toUpperCase();
    });
  } // Capitalize first letter of a string


  function capitalize(s) {
    return s.charAt(0).toUpperCase() + s.slice(1);
  } // Ensure to six-based hex


  function fullHex(hex) {
    return hex.length == 4 ? ['#', hex.substring(1, 2), hex.substring(1, 2), hex.substring(2, 3), hex.substring(2, 3), hex.substring(3, 4), hex.substring(3, 4)].join('') : hex;
  } // Component to hex value


  function compToHex(comp) {
    var hex = comp.toString(16);
    return hex.length == 1 ? '0' + hex : hex;
  } // Calculate proportional width and height values when necessary


  function proportionalSize(box, width, height) {
    if (height == null) height = box.height / box.width * width;else if (width == null) width = box.width / box.height * height;
    return {
      width: width,
      height: height
    };
  } // Delta transform point


  function deltaTransformPoint(matrix, x, y) {
    return {
      x: x * matrix.a + y * matrix.c + 0,
      y: x * matrix.b + y * matrix.d + 0
    };
  } // Map matrix array to object


  function arrayToMatrix(a) {
    return {
      a: a[0],
      b: a[1],
      c: a[2],
      d: a[3],
      e: a[4],
      f: a[5]
    };
  } // Parse matrix if required


  function parseMatrix(matrix) {
    if (!(matrix instanceof SVG.Matrix)) matrix = new SVG.Matrix(matrix);
    return matrix;
  } // Add centre point to transform object


  function ensureCentre(o, target) {
    o.cx = o.cx == null ? target.bbox().cx : o.cx;
    o.cy = o.cy == null ? target.bbox().cy : o.cy;
  } // Convert string to matrix


  function stringToMatrix(source) {
    // remove matrix wrapper and split to individual numbers
    source = source.replace(SVG.regex.whitespace, '').replace(SVG.regex.matrix, '').split(SVG.regex.matrixElements); // convert string values to floats and convert to a matrix-formatted object

    return arrayToMatrix(SVG.utils.map(source, function (n) {
      return parseFloat(n);
    }));
  } // Calculate position according to from and to


  function at(o, pos) {
    // number recalculation (don't bother converting to SVG.Number for performance reasons)
    return typeof o.from == 'number' ? o.from + (o.to - o.from) * pos : // instance recalculation
    o instanceof SVG.Color || o instanceof SVG.Number || o instanceof SVG.Matrix ? o.at(pos) : // for all other values wait until pos has reached 1 to return the final value
    pos < 1 ? o.from : o.to;
  } // PathArray Helpers


  function arrayToString(a) {
    for (var i = 0, il = a.length, s = ''; i < il; i++) {
      s += a[i][0];

      if (a[i][1] != null) {
        s += a[i][1];

        if (a[i][2] != null) {
          s += ' ';
          s += a[i][2];

          if (a[i][3] != null) {
            s += ' ';
            s += a[i][3];
            s += ' ';
            s += a[i][4];

            if (a[i][5] != null) {
              s += ' ';
              s += a[i][5];
              s += ' ';
              s += a[i][6];

              if (a[i][7] != null) {
                s += ' ';
                s += a[i][7];
              }
            }
          }
        }
      }
    }

    return s + ' ';
  } // Deep new id assignment


  function assignNewId(node) {
    // do the same for SVG child nodes as well
    for (var i = node.childNodes.length - 1; i >= 0; i--) if (node.childNodes[i] instanceof SVGElement) assignNewId(node.childNodes[i]);

    return SVG.adopt(node).id(SVG.eid(node.nodeName));
  } // Add more bounding box properties


  function fullBox(b) {
    if (b.x == null) {
      b.x = 0;
      b.y = 0;
      b.width = 0;
      b.height = 0;
    }

    b.w = b.width;
    b.h = b.height;
    b.x2 = b.x + b.width;
    b.y2 = b.y + b.height;
    b.cx = b.x + b.width / 2;
    b.cy = b.y + b.height / 2;
    return b;
  } // Get id from reference string


  function idFromReference(url) {
    var m = url.toString().match(SVG.regex.reference);
    if (m) return m[1];
  } // Create matrix array for looping


  var abcdef = 'abcdef'.split(''); // Add CustomEvent to IE9 and IE10

  if (typeof CustomEvent !== 'function') {
    // Code from: https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent
    var CustomEvent = function (event, options) {
      options = options || {
        bubbles: false,
        cancelable: false,
        detail: undefined
      };
      var e = document.createEvent('CustomEvent');
      e.initCustomEvent(event, options.bubbles, options.cancelable, options.detail);
      return e;
    };

    CustomEvent.prototype = window.Event.prototype;
    window.CustomEvent = CustomEvent;
  } // requestAnimationFrame / cancelAnimationFrame Polyfill with fallback based on Paul Irish


  (function (w) {
    var lastTime = 0;
    var vendors = ['moz', 'webkit'];

    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      w.requestAnimationFrame = w[vendors[x] + 'RequestAnimationFrame'];
      w.cancelAnimationFrame = w[vendors[x] + 'CancelAnimationFrame'] || w[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    w.requestAnimationFrame = w.requestAnimationFrame || function (callback) {
      var currTime = new Date().getTime();
      var timeToCall = Math.max(0, 16 - (currTime - lastTime));
      var id = w.setTimeout(function () {
        callback(currTime + timeToCall);
      }, timeToCall);
      lastTime = currTime + timeToCall;
      return id;
    };

    w.cancelAnimationFrame = w.cancelAnimationFrame || w.clearTimeout;
  })(window);

  return SVG;
});

},{}],7:[function(require,module,exports){
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

module.exports = _assertThisInitialized;
},{}],8:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

module.exports = _classCallCheck;
},{}],9:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

module.exports = _createClass;
},{}],10:[function(require,module,exports){
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

module.exports = _defineProperty;
},{}],11:[function(require,module,exports){
function _getPrototypeOf(o) {
  module.exports = _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}

module.exports = _getPrototypeOf;
},{}],12:[function(require,module,exports){
var setPrototypeOf = require("./setPrototypeOf");

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  if (superClass) setPrototypeOf(subClass, superClass);
}

module.exports = _inherits;
},{"./setPrototypeOf":15}],13:[function(require,module,exports){
function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : {
    "default": obj
  };
}

module.exports = _interopRequireDefault;
},{}],14:[function(require,module,exports){
var _typeof = require("../helpers/typeof");

var assertThisInitialized = require("./assertThisInitialized");

function _possibleConstructorReturn(self, call) {
  if (call && (_typeof(call) === "object" || typeof call === "function")) {
    return call;
  }

  return assertThisInitialized(self);
}

module.exports = _possibleConstructorReturn;
},{"../helpers/typeof":16,"./assertThisInitialized":7}],15:[function(require,module,exports){
function _setPrototypeOf(o, p) {
  module.exports = _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };

  return _setPrototypeOf(o, p);
}

module.exports = _setPrototypeOf;
},{}],16:[function(require,module,exports){
function _typeof2(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof2 = function _typeof2(obj) { return typeof obj; }; } else { _typeof2 = function _typeof2(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof2(obj); }

function _typeof(obj) {
  if (typeof Symbol === "function" && _typeof2(Symbol.iterator) === "symbol") {
    module.exports = _typeof = function _typeof(obj) {
      return _typeof2(obj);
    };
  } else {
    module.exports = _typeof = function _typeof(obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : _typeof2(obj);
    };
  }

  return _typeof(obj);
}

module.exports = _typeof;
},{}],17:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var objectCreate = Object.create || objectCreatePolyfill
var objectKeys = Object.keys || objectKeysPolyfill
var bind = Function.prototype.bind || functionBindPolyfill

function EventEmitter() {
  if (!this._events || !Object.prototype.hasOwnProperty.call(this, '_events')) {
    this._events = objectCreate(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
var defaultMaxListeners = 10;

var hasDefineProperty;
try {
  var o = {};
  if (Object.defineProperty) Object.defineProperty(o, 'x', { value: 0 });
  hasDefineProperty = o.x === 0;
} catch (err) { hasDefineProperty = false }
if (hasDefineProperty) {
  Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
    enumerable: true,
    get: function() {
      return defaultMaxListeners;
    },
    set: function(arg) {
      // check whether the input is a positive number (whose value is zero or
      // greater and not a NaN).
      if (typeof arg !== 'number' || arg < 0 || arg !== arg)
        throw new TypeError('"defaultMaxListeners" must be a positive number');
      defaultMaxListeners = arg;
    }
  });
} else {
  EventEmitter.defaultMaxListeners = defaultMaxListeners;
}

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || isNaN(n))
    throw new TypeError('"n" argument must be a positive number');
  this._maxListeners = n;
  return this;
};

function $getMaxListeners(that) {
  if (that._maxListeners === undefined)
    return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return $getMaxListeners(this);
};

// These standalone emit* functions are used to optimize calling of event
// handlers for fast cases because emit() itself often has a variable number of
// arguments and can be deoptimized because of that. These functions always have
// the same number of arguments and thus do not get deoptimized, so the code
// inside them can execute faster.
function emitNone(handler, isFn, self) {
  if (isFn)
    handler.call(self);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self);
  }
}
function emitOne(handler, isFn, self, arg1) {
  if (isFn)
    handler.call(self, arg1);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1);
  }
}
function emitTwo(handler, isFn, self, arg1, arg2) {
  if (isFn)
    handler.call(self, arg1, arg2);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2);
  }
}
function emitThree(handler, isFn, self, arg1, arg2, arg3) {
  if (isFn)
    handler.call(self, arg1, arg2, arg3);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].call(self, arg1, arg2, arg3);
  }
}

function emitMany(handler, isFn, self, args) {
  if (isFn)
    handler.apply(self, args);
  else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);
    for (var i = 0; i < len; ++i)
      listeners[i].apply(self, args);
  }
}

EventEmitter.prototype.emit = function emit(type) {
  var er, handler, len, args, i, events;
  var doError = (type === 'error');

  events = this._events;
  if (events)
    doError = (doError && events.error == null);
  else if (!doError)
    return false;

  // If there is no 'error' event listener then throw.
  if (doError) {
    if (arguments.length > 1)
      er = arguments[1];
    if (er instanceof Error) {
      throw er; // Unhandled 'error' event
    } else {
      // At least give some kind of context to the user
      var err = new Error('Unhandled "error" event. (' + er + ')');
      err.context = er;
      throw err;
    }
    return false;
  }

  handler = events[type];

  if (!handler)
    return false;

  var isFn = typeof handler === 'function';
  len = arguments.length;
  switch (len) {
      // fast cases
    case 1:
      emitNone(handler, isFn, this);
      break;
    case 2:
      emitOne(handler, isFn, this, arguments[1]);
      break;
    case 3:
      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
      break;
    case 4:
      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
      break;
      // slower
    default:
      args = new Array(len - 1);
      for (i = 1; i < len; i++)
        args[i - 1] = arguments[i];
      emitMany(handler, isFn, this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;

  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');

  events = target._events;
  if (!events) {
    events = target._events = objectCreate(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener) {
      target.emit('newListener', type,
          listener.listener ? listener.listener : listener);

      // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object
      events = target._events;
    }
    existing = events[type];
  }

  if (!existing) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] =
          prepend ? [listener, existing] : [existing, listener];
    } else {
      // If we've already got an array, just append.
      if (prepend) {
        existing.unshift(listener);
      } else {
        existing.push(listener);
      }
    }

    // Check for listener leak
    if (!existing.warned) {
      m = $getMaxListeners(target);
      if (m && m > 0 && existing.length > m) {
        existing.warned = true;
        var w = new Error('Possible EventEmitter memory leak detected. ' +
            existing.length + ' "' + String(type) + '" listeners ' +
            'added. Use emitter.setMaxListeners() to ' +
            'increase limit.');
        w.name = 'MaxListenersExceededWarning';
        w.emitter = target;
        w.type = type;
        w.count = existing.length;
        if (typeof console === 'object' && console.warn) {
          console.warn('%s: %s', w.name, w.message);
        }
      }
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener =
    function prependListener(type, listener) {
      return _addListener(this, type, listener, true);
    };

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    switch (arguments.length) {
      case 0:
        return this.listener.call(this.target);
      case 1:
        return this.listener.call(this.target, arguments[0]);
      case 2:
        return this.listener.call(this.target, arguments[0], arguments[1]);
      case 3:
        return this.listener.call(this.target, arguments[0], arguments[1],
            arguments[2]);
      default:
        var args = new Array(arguments.length);
        for (var i = 0; i < args.length; ++i)
          args[i] = arguments[i];
        this.listener.apply(this.target, args);
    }
  }
}

function _onceWrap(target, type, listener) {
  var state = { fired: false, wrapFn: undefined, target: target, type: type, listener: listener };
  var wrapped = bind.call(onceWrapper, state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  if (typeof listener !== 'function')
    throw new TypeError('"listener" argument must be a function');
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener =
    function prependOnceListener(type, listener) {
      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');
      this.prependListener(type, _onceWrap(this, type, listener));
      return this;
    };

// Emits a 'removeListener' event if and only if the listener was removed.
EventEmitter.prototype.removeListener =
    function removeListener(type, listener) {
      var list, events, position, i, originalListener;

      if (typeof listener !== 'function')
        throw new TypeError('"listener" argument must be a function');

      events = this._events;
      if (!events)
        return this;

      list = events[type];
      if (!list)
        return this;

      if (list === listener || list.listener === listener) {
        if (--this._eventsCount === 0)
          this._events = objectCreate(null);
        else {
          delete events[type];
          if (events.removeListener)
            this.emit('removeListener', type, list.listener || listener);
        }
      } else if (typeof list !== 'function') {
        position = -1;

        for (i = list.length - 1; i >= 0; i--) {
          if (list[i] === listener || list[i].listener === listener) {
            originalListener = list[i].listener;
            position = i;
            break;
          }
        }

        if (position < 0)
          return this;

        if (position === 0)
          list.shift();
        else
          spliceOne(list, position);

        if (list.length === 1)
          events[type] = list[0];

        if (events.removeListener)
          this.emit('removeListener', type, originalListener || listener);
      }

      return this;
    };

EventEmitter.prototype.removeAllListeners =
    function removeAllListeners(type) {
      var listeners, events, i;

      events = this._events;
      if (!events)
        return this;

      // not listening for removeListener, no need to emit
      if (!events.removeListener) {
        if (arguments.length === 0) {
          this._events = objectCreate(null);
          this._eventsCount = 0;
        } else if (events[type]) {
          if (--this._eventsCount === 0)
            this._events = objectCreate(null);
          else
            delete events[type];
        }
        return this;
      }

      // emit removeListener for all listeners on all events
      if (arguments.length === 0) {
        var keys = objectKeys(events);
        var key;
        for (i = 0; i < keys.length; ++i) {
          key = keys[i];
          if (key === 'removeListener') continue;
          this.removeAllListeners(key);
        }
        this.removeAllListeners('removeListener');
        this._events = objectCreate(null);
        this._eventsCount = 0;
        return this;
      }

      listeners = events[type];

      if (typeof listeners === 'function') {
        this.removeListener(type, listeners);
      } else if (listeners) {
        // LIFO order
        for (i = listeners.length - 1; i >= 0; i--) {
          this.removeListener(type, listeners[i]);
        }
      }

      return this;
    };

function _listeners(target, type, unwrap) {
  var events = target._events;

  if (!events)
    return [];

  var evlistener = events[type];
  if (!evlistener)
    return [];

  if (typeof evlistener === 'function')
    return unwrap ? [evlistener.listener || evlistener] : [evlistener];

  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function(emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;
function listenerCount(type) {
  var events = this._events;

  if (events) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
};

// About 1.5x faster than the two-arg version of Array#splice().
function spliceOne(list, index) {
  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
    list[i] = list[k];
  list.pop();
}

function arrayClone(arr, n) {
  var copy = new Array(n);
  for (var i = 0; i < n; ++i)
    copy[i] = arr[i];
  return copy;
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);
  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }
  return ret;
}

function objectCreatePolyfill(proto) {
  var F = function() {};
  F.prototype = proto;
  return new F;
}
function objectKeysPolyfill(obj) {
  var keys = [];
  for (var k in obj) if (Object.prototype.hasOwnProperty.call(obj, k)) {
    keys.push(k);
  }
  return k;
}
function functionBindPolyfill(context) {
  var fn = this;
  return function () {
    return fn.apply(context, arguments);
  };
}

},{}],18:[function(require,module,exports){
// A Javascript implementaion of the "xor128" prng algorithm by
// George Marsaglia.  See http://www.jstatsoft.org/v08/i14/paper

(function(global, module, define) {

function XorGen(seed) {
  var me = this, strseed = '';

  me.x = 0;
  me.y = 0;
  me.z = 0;
  me.w = 0;

  // Set up generator function.
  me.next = function() {
    var t = me.x ^ (me.x << 11);
    me.x = me.y;
    me.y = me.z;
    me.z = me.w;
    return me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8);
  };

  if (seed === (seed | 0)) {
    // Integer seed.
    me.x = seed;
  } else {
    // String seed.
    strseed += seed;
  }

  // Mix in string seed, then discard an initial batch of 64 values.
  for (var k = 0; k < strseed.length + 64; k++) {
    me.x ^= strseed.charCodeAt(k) | 0;
    me.next();
  }
}

function copy(f, t) {
  t.x = f.x;
  t.y = f.y;
  t.z = f.z;
  t.w = f.w;
  return t;
}

function impl(seed, opts) {
  var xg = new XorGen(seed),
      state = opts && opts.state,
      prng = function() { return (xg.next() >>> 0) / 0x100000000; };
  prng.double = function() {
    do {
      var top = xg.next() >>> 11,
          bot = (xg.next() >>> 0) / 0x100000000,
          result = (top + bot) / (1 << 21);
    } while (result === 0);
    return result;
  };
  prng.int32 = xg.next;
  prng.quick = prng;
  if (state) {
    if (typeof(state) == 'object') copy(state, xg);
    prng.state = function() { return copy(xg, {}); }
  }
  return prng;
}

if (module && module.exports) {
  module.exports = impl;
} else if (define && define.amd) {
  define(function() { return impl; });
} else {
  this.xor128 = impl;
}

})(
  this,
  (typeof module) == 'object' && module,    // present in node.js
  (typeof define) == 'function' && define   // present with an AMD loader
);



},{}],19:[function(require,module,exports){
(function (global){
//     Underscore.js 1.9.1
//     http://underscorejs.org
//     (c) 2009-2018 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` (`self`) in the browser, `global`
  // on the server, or `this` in some virtual machines. We use `self`
  // instead of `window` for `WebWorker` support.
  var root = typeof self == 'object' && self.self === self && self ||
            typeof global == 'object' && global.global === global && global ||
            this ||
            {};

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype;
  var SymbolProto = typeof Symbol !== 'undefined' ? Symbol.prototype : null;

  // Create quick reference variables for speed access to core prototypes.
  var push = ArrayProto.push,
      slice = ArrayProto.slice,
      toString = ObjProto.toString,
      hasOwnProperty = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var nativeIsArray = Array.isArray,
      nativeKeys = Object.keys,
      nativeCreate = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for their old module API. If we're in
  // the browser, add `_` as a global object.
  // (`nodeType` is checked to ensure that `module`
  // and `exports` are not HTML elements.)
  if (typeof exports != 'undefined' && !exports.nodeType) {
    if (typeof module != 'undefined' && !module.nodeType && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.9.1';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      // The 2-argument case is omitted because we’re not using it.
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  var builtinIteratee;

  // An internal function to generate callbacks that can be applied to each
  // element in a collection, returning the desired result — either `identity`,
  // an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (_.iteratee !== builtinIteratee) return _.iteratee(value, context);
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value) && !_.isArray(value)) return _.matcher(value);
    return _.property(value);
  };

  // External wrapper for our callback generator. Users may customize
  // `_.iteratee` if they want additional predicate/iteratee shorthand styles.
  // This abstraction hides the internal-only argCount argument.
  _.iteratee = builtinIteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // Some functions take a variable number of arguments, or a few expected
  // arguments at the beginning and then a variable number of values to operate
  // on. This helper accumulates all remaining arguments past the function’s
  // argument length (or an explicit `startIndex`), into an array that becomes
  // the last argument. Similar to ES6’s "rest parameter".
  var restArguments = function(func, startIndex) {
    startIndex = startIndex == null ? func.length - 1 : +startIndex;
    return function() {
      var length = Math.max(arguments.length - startIndex, 0),
          rest = Array(length),
          index = 0;
      for (; index < length; index++) {
        rest[index] = arguments[index + startIndex];
      }
      switch (startIndex) {
        case 0: return func.call(this, rest);
        case 1: return func.call(this, arguments[0], rest);
        case 2: return func.call(this, arguments[0], arguments[1], rest);
      }
      var args = Array(startIndex + 1);
      for (index = 0; index < startIndex; index++) {
        args[index] = arguments[index];
      }
      args[startIndex] = rest;
      return func.apply(this, args);
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var shallowProperty = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  var has = function(obj, path) {
    return obj != null && hasOwnProperty.call(obj, path);
  }

  var deepGet = function(obj, path) {
    var length = path.length;
    for (var i = 0; i < length; i++) {
      if (obj == null) return void 0;
      obj = obj[path[i]];
    }
    return length ? obj : void 0;
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object.
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = shallowProperty('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  var createReduce = function(dir) {
    // Wrap code that reassigns argument variables in a separate function than
    // the one that accesses `arguments.length` to avoid a perf hit. (#1991)
    var reducer = function(obj, iteratee, memo, initial) {
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      if (!initial) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    };

    return function(obj, iteratee, memo, context) {
      var initial = arguments.length >= 3;
      return reducer(obj, optimizeCb(iteratee, context, 4), memo, initial);
    };
  };

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var keyFinder = isArrayLike(obj) ? _.findIndex : _.findKey;
    var key = keyFinder(obj, predicate, context);
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = restArguments(function(obj, path, args) {
    var contextPath, func;
    if (_.isFunction(path)) {
      func = path;
    } else if (_.isArray(path)) {
      contextPath = path.slice(0, -1);
      path = path[path.length - 1];
    }
    return _.map(obj, function(context) {
      var method = func;
      if (!method) {
        if (contextPath && contextPath.length) {
          context = deepGet(context, contextPath);
        }
        if (context == null) return void 0;
        method = context[path];
      }
      return method == null ? method : method.apply(context, args);
    });
  });

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null || typeof iteratee == 'number' && typeof obj[0] != 'object' && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value != null && value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(v, index, list) {
        computed = iteratee(v, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = v;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection.
  _.shuffle = function(obj) {
    return _.sample(obj, Infinity);
  };

  // Sample **n** random values from a collection using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    var sample = isArrayLike(obj) ? _.clone(obj) : _.values(obj);
    var length = getLength(sample);
    n = Math.max(Math.min(n, length), 0);
    var last = length - 1;
    for (var index = 0; index < n; index++) {
      var rand = _.random(index, last);
      var temp = sample[index];
      sample[index] = sample[rand];
      sample[rand] = temp;
    }
    return sample.slice(0, n);
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    var index = 0;
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, key, list) {
      return {
        value: value,
        index: index++,
        criteria: iteratee(value, key, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior, partition) {
    return function(obj, iteratee, context) {
      var result = partition ? [[], []] : {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (has(result, key)) result[key]++; else result[key] = 1;
  });

  var reStrSymbol = /[^\ud800-\udfff]|[\ud800-\udbff][\udc00-\udfff]|[\ud800-\udfff]/g;
  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (_.isString(obj)) {
      // Keep surrogate pair characters together
      return obj.match(reStrSymbol);
    }
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = group(function(result, value, pass) {
    result[pass ? 0 : 1].push(value);
  }, true);

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null || array.length < 1) return n == null ? void 0 : [];
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, Boolean);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        // Flatten current level of array or arguments object.
        if (shallow) {
          var j = 0, len = value.length;
          while (j < len) output[idx++] = value[j++];
        } else {
          flatten(value, shallow, strict, output);
          idx = output.length;
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = restArguments(function(array, otherArrays) {
    return _.difference(array, otherArrays);
  });

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // The faster algorithm will not work with an iteratee if the iteratee
  // is not a one-to-one function, so providing an iteratee will disable
  // the faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted && !iteratee) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = restArguments(function(arrays) {
    return _.uniq(flatten(arrays, true, true));
  });

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      var j;
      for (j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = restArguments(function(array, rest) {
    rest = flatten(rest, true, true);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  });

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices.
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = restArguments(_.unzip);

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values. Passing by pairs is the reverse of _.pairs.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions.
  var createPredicateIndexFinder = function(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  };

  // Returns the first index on an array-like that passes a predicate test.
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions.
  var createIndexFinder = function(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
          i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
          length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  };

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    if (!step) {
      step = stop < start ? -1 : 1;
    }

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Chunk a single array into multiple arrays, each containing `count` or fewer
  // items.
  _.chunk = function(array, count) {
    if (count == null || count < 1) return [];
    var result = [];
    var i = 0, length = array.length;
    while (i < length) {
      result.push(slice.call(array, i, i += count));
    }
    return result;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments.
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = restArguments(function(func, context, args) {
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var bound = restArguments(function(callArgs) {
      return executeBound(func, bound, context, this, args.concat(callArgs));
    });
    return bound;
  });

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder by default, allowing any combination of arguments to be
  // pre-filled. Set `_.partial.placeholder` for a custom placeholder argument.
  _.partial = restArguments(function(func, boundArgs) {
    var placeholder = _.partial.placeholder;
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === placeholder ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  });

  _.partial.placeholder = _;

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = restArguments(function(obj, keys) {
    keys = flatten(keys, false, false);
    var index = keys.length;
    if (index < 1) throw new Error('bindAll must be passed function names');
    while (index--) {
      var key = keys[index];
      obj[key] = _.bind(obj[key], obj);
    }
  });

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = restArguments(function(func, wait, args) {
    return setTimeout(function() {
      return func.apply(null, args);
    }, wait);
  });

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var timeout, context, args, result;
    var previous = 0;
    if (!options) options = {};

    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };

    var throttled = function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };

    throttled.cancel = function() {
      clearTimeout(timeout);
      previous = 0;
      timeout = context = args = null;
    };

    return throttled;
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, result;

    var later = function(context, args) {
      timeout = null;
      if (args) result = func.apply(context, args);
    };

    var debounced = restArguments(function(args) {
      if (timeout) clearTimeout(timeout);
      if (immediate) {
        var callNow = !timeout;
        timeout = setTimeout(later, wait);
        if (callNow) result = func.apply(this, args);
      } else {
        timeout = _.delay(later, wait, this, args);
      }

      return result;
    });

    debounced.cancel = function() {
      clearTimeout(timeout);
      timeout = null;
    };

    return debounced;
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  _.restArguments = restArguments;

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
    'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  var collectNonEnumProps = function(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = _.isFunction(constructor) && constructor.prototype || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  };

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`.
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object.
  // In contrast to _.map it returns an object.
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = _.keys(obj),
        length = keys.length,
        results = {};
    for (var index = 0; index < length; index++) {
      var currentKey = keys[index];
      results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  // The opposite of _.object.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`.
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, defaults) {
    return function(obj) {
      var length = arguments.length;
      if (defaults) obj = Object(obj);
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!defaults || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s).
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test.
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Internal pick helper function to determine if `obj` has key `key`.
  var keyInObj = function(value, key, obj) {
    return key in obj;
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = restArguments(function(obj, keys) {
    var result = {}, iteratee = keys[0];
    if (obj == null) return result;
    if (_.isFunction(iteratee)) {
      if (keys.length > 1) iteratee = optimizeCb(iteratee, keys[1]);
      keys = _.allKeys(obj);
    } else {
      iteratee = keyInObj;
      keys = flatten(keys, false, false);
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  });

  // Return a copy of the object without the blacklisted properties.
  _.omit = restArguments(function(obj, keys) {
    var iteratee = keys[0], context;
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
      if (keys.length > 1) context = keys[1];
    } else {
      keys = _.map(flatten(keys, false, false), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  });

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq, deepEq;
  eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // `null` or `undefined` only equal to itself (strict comparison).
    if (a == null || b == null) return false;
    // `NaN`s are equivalent, but non-reflexive.
    if (a !== a) return b !== b;
    // Exhaust primitive checks
    var type = typeof a;
    if (type !== 'function' && type !== 'object' && typeof b != 'object') return false;
    return deepEq(a, b, aStack, bStack);
  };

  // Internal recursive comparison function for `isEqual`.
  deepEq = function(a, b, aStack, bStack) {
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN.
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
      case '[object Symbol]':
        return SymbolProto.valueOf.call(a) === SymbolProto.valueOf.call(b);
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError, isMap, isWeakMap, isSet, isWeakSet.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error', 'Symbol', 'Map', 'WeakMap', 'Set', 'WeakSet'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), Safari 8 (#1929), and PhantomJS (#2236).
  var nodelist = root.document && root.document.childNodes;
  if (typeof /./ != 'function' && typeof Int8Array != 'object' && typeof nodelist != 'function') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return !_.isSymbol(obj) && isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`?
  _.isNaN = function(obj) {
    return _.isNumber(obj) && isNaN(obj);
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, path) {
    if (!_.isArray(path)) {
      return has(obj, path);
    }
    var length = path.length;
    for (var i = 0; i < length; i++) {
      var key = path[i];
      if (obj == null || !hasOwnProperty.call(obj, key)) {
        return false;
      }
      obj = obj[key];
    }
    return !!length;
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  // Creates a function that, when passed an object, will traverse that object’s
  // properties down the given `path`, specified as an array of keys or indexes.
  _.property = function(path) {
    if (!_.isArray(path)) {
      return shallowProperty(path);
    }
    return function(obj) {
      return deepGet(obj, path);
    };
  };

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    if (obj == null) {
      return function(){};
    }
    return function(path) {
      return !_.isArray(path) ? obj[path] : deepGet(obj, path);
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

  // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped.
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // Traverses the children of `obj` along `path`. If a child is a function, it
  // is invoked with its parent as context. Returns the value of the final
  // child, or `fallback` if any child is undefined.
  _.result = function(obj, path, fallback) {
    if (!_.isArray(path)) path = [path];
    var length = path.length;
    if (!length) {
      return _.isFunction(fallback) ? fallback.call(obj) : fallback;
    }
    for (var i = 0; i < length; i++) {
      var prop = obj == null ? void 0 : obj[path[i]];
      if (prop === void 0) {
        prop = fallback;
        i = length; // Ensure we don't continue iterating.
      }
      obj = _.isFunction(prop) ? prop.call(obj) : prop;
    }
    return obj;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate: /<%([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    escape: /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'": "'",
    '\\': '\\',
    '\r': 'r',
    '\n': 'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escapeRegExp = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escapeRegExp, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offset.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    var render;
    try {
      render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var chainResult = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return chainResult(this, func.apply(_, args));
      };
    });
    return _;
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return chainResult(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return chainResult(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return String(this._wrapped);
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define == 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}());

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],20:[function(require,module,exports){
"use strict";

var _require = require('consts'),
    D = _require.D,
    B = _require.B,
    H = _require.H;

describe("Sample test", function () {
  describe("basics", function () {
    it("is working", function () {
      expect(true).to.equal(true);
    });
    it("can import", function () {
      expect(D.EAST).not.to.be(undefined);
    });
  });
  describe("hooks", function () {
    var a = 0;
    before(function () {
      a += 1;
    });
    it("run before block", function () {
      expect(a).to.be(1);
    });
    it("run before block twice", function () {
      expect(a).to.be(1);
    });
  });
});

},{"consts":2}],21:[function(require,module,exports){
"use strict";

var _require = require('consts'),
    D = _require.D,
    B = _require.B,
    H = _require.H;

var map = require('map');

var Game = require('game');

var _ = require('underscore');

var _require2 = require('./validators'),
    validateSnake = _require2.validateSnake;

describe("Game", function () {
  var game;
  var cmds = {
    "j222": ["join", {
      "name": "j22",
      "remain": 2,
      "x": 2,
      "y": 2
    }],
    "j242": ["join", {
      "name": "j24",
      "remain": 2,
      "x": 2,
      "y": 4
    }],
    "d0E": ["direction", {
      s: 0,
      d: D.EAST
    }],
    "d0W": ["direction", {
      s: 0,
      d: D.WEST
    }],
    "d0S": ["direction", {
      s: 0,
      d: D.SOUTH
    }],
    "t0": ["tick", {}],
    "f242": ["food", {
      x: 2,
      y: 4,
      q: 2
    }],
    "l0": ["leave", {
      s: 0
    }],
    "l1": ["leave", {
      s: 1
    }]
  };
  beforeEach(function () {
    var param = {
      width: 20,
      height: 20,
      version: 1
    };
    game = new Game(map(param).game);
  });
  describe("#handleCommands", function () {
    describe("join", function () {
      it("initializes snake", function () {
        console.log(game.getBox({
          x: 2,
          y: 2
        }));
        game.handleCommands([cmds.j222]);
        expect(game.getSnakeSize()).to.be(1);
        var snake = game.json.snakes[0];
        expect(snake.head).not.to.be(snake.tail);
        var box1 = game.getBox({
          x: 2,
          y: 2
        });
        expect(box1[1].h).to.be(D.OTHER);
        expect(box1[1].t).to.be(D.OTHER_T);
      });
      it("can join many snakes", function () {
        var box1 = game.getBox({
          x: 2,
          y: 2
        });
        var box2 = game.getBox({
          x: 2,
          y: 4
        });
        game.handleCommands([cmds.j222]);
        expect(game.getSnakeSize()).to.be(1);
        expect(box1[0] === B.SNAKE);
        debugger;
        game.handleCommands([cmds.j242]);
        expect(game.getSnakeSize()).to.be(2);
        expect(box2[0] === B.SNAKE);
      });
      it("cannot add snake at the same position", function () {
        game.handleCommands([cmds.j222]);
        game.handleCommands([cmds.j222]);
        expect(game.getSnakeSize()).to.be(1);
      });
    });
    describe("direction", function () {
      it("can change direction", function () {
        game.handleCommands([cmds.j222, cmds.d0E]);
        var snake = game.json.snakes[0];
        var box = game.getBox(snake.head);
        validateSnake(game, snake);
        expect(box[1].h == D.EAST);
      });
      it("cannot go to opposite direction", function () {
        game.handleCommands([cmds.j222]);
        var snake = game.json.snakes[0];
        var box = game.getBox(snake.head);
        box[1].h = D.WEST;
        box[1].t = D.EAST;
        validateSnake(game, snake);
        game.handleCommands([cmds.d0E]);
        expect(box[1].h).to.be(D.WEST);
      });
    });
    describe("move", function () {
      it("moves at length 1", function () {
        game.handleCommands([cmds.j222]);
        game.handleCommands([cmds.d0E]);
        var snake = game.json.snakes[0];
        snake.remain = 0;

        for (var t = 0; t < 2; t++) {
          game.handleCommands([cmds.t0]);
          validateSnake(game, snake);
          expect(snake.length).to.be(1);
        }
      });
      it("moves at length 2", function () {
        game.handleCommands([cmds.j222, cmds.d0E]);
        var snake = game.json.snakes[0];
        snake.remain = 1;
        var lengths = [2, 2];

        for (var t = 0; t < 2; t++) {
          game.handleCommands([cmds.t0]);
          validateSnake(game, snake);
          expect(snake.length).to.be(lengths[t]);
        }
      });
      it("moves at length 3", function () {
        game.handleCommands([cmds.j222, cmds.d0E]);
        var snake = game.json.snakes[0];
        snake.remain = 2;
        var lengths = [2, 3, 3];

        for (var t = 0; t < 3; t++) {
          game.handleCommands([cmds.t0]);
          validateSnake(game, snake);
          expect(snake.length).to.be(lengths[t]);
        }
      });
    });
    describe("food", function () {
      it("can be placed", function () {
        game.handleCommands([cmds.f242]);
        expect(game.getBox({
          x: 2,
          y: 4
        })).to.eql([B.FOOD, {
          q: 2
        }]);
      });
      it("cannot override block", function () {
        game.handleCommands([cmds.j242, cmds.f242]);
        expect(game.getBox({
          x: 2,
          y: 4
        })[0]).to.be(B.SNAKE);
      });
      it("can be eaten", function () {
        game.handleCommands([cmds.j222, cmds.d0S]);
        var snake = game.json.snakes[0];
        snake.remain = 1;
        game.handleCommands([cmds.f242, cmds.t0, cmds.t0]);
        expect(snake.remain).to.be(1);
        expect(snake.length).to.be(3);
      });
    });
    describe("leave", function () {
      it("a snake leaves", function () {
        game.handleCommands([cmds.j222, cmds.l0]);
        expect(game.getSnakeSize()).to.be(0);
        expect(game.getBox({
          x: 2,
          y: 2
        })).to.eql([B.EMPTY, {}]);
      });
      it("cannot leave nothing", function () {
        game.handleCommands([cmds.j222, cmds.l1]);
        expect(game.getSnakeSize()).to.be(1);
      });
      it("cannot leave twice", function () {
        game.handleCommands([cmds.j222, cmds.l0, cmds.l0]);
        expect(game.getSnakeSize()).to.be(0);
      });
    });
  });
});

},{"./validators":24,"consts":2,"game":3,"map":4,"underscore":19}],22:[function(require,module,exports){
"use strict";

require('./example');

require('./map_test');

require('./game_test');

require('./view_test');

},{"./example":20,"./game_test":21,"./map_test":23,"./view_test":25}],23:[function(require,module,exports){
"use strict";

var map = require('map');

var validators = require('./validators');

describe("map", function () {
  var input;
  beforeEach(function () {
    input = {
      version: 1,
      width: 10,
      height: 10
    };
  });
  describe.skip("validation", function () {
    it("passes when input is good", function () {
      expect(map).withArgs(input).not.to.throwException();
    });
    it("varifies version", function () {
      input.version = -1;
      expect(map).withArgs(input).to.throwException();
    });
    it("varifies size", function () {
      input.width = 0;
      expect(map).withArgs(input).to.throwException();
      input.width = -1;
      expect(map).withArgs(input).to.throwException();
      input.width = 3.5;
      expect(map).withArgs(input).to.throwException();
      input.width = 1e10;
      expect(map).withArgs(input).to.throwException();
      input.width = 10;
      input.height = 0;
      expect(map).withArgs(input).to.throwException();
      input.height = -1;
      expect(map).withArgs(input).to.throwException();
      input.height = 3.5;
      expect(map).withArgs(input).to.throwException();
      input.height = 1e10;
      expect(map).withArgs(input).to.throwException();
    });
  });
  describe("game", function () {
    it("creates valid game", function () {
      var _map = map(input),
          game = _map.game;

      validators.validateGame(game);
    });
  });
});

},{"./validators":24,"map":4}],24:[function(require,module,exports){
"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");

var _defineProperty2 = _interopRequireDefault(require("@babel/runtime/helpers/defineProperty"));

var _require = require('consts'),
    B = _require.B,
    D = _require.D,
    H = _require.H;

var _ = require('underscore');

var V = {
  validateGame: function validateGame(game) {
    expect(game).to.only.have.keys(['config', //config object for game, such as power duration
    'grid', // array of boxes on map
    'height', 'seed', // state object for seedrandom
    'snakes', // array of snakes
    'tick', // integer representing time since game started
    'version', // always 1
    'width']);
    V.validateConfig(game.config);
    expect(game.grid).to.be.an('array');
    expect(game.grid).to.have.length(game.width * game.height);
    game.grid.forEach(function (box, index) {
      V.validateBox(game, box, {
        x: index % game.width,
        y: index / game.width | 0
      });
    });
    V.validateNonNegativeInteger(game.height);
    V.validateSeed(game.seed);
    expect(game.snakes).to.be.an('array');
    var snakeCount = getSnakeCount();
    game.snakes.forEach(function (snake, index) {
      V.validateSnake(snake, index, snakeCount[index]);
    });
    V.validateNonNegativeInteger(game.tick);
    expect(game.version).to.be(1);
    V.validateNonNegativeInteger(game.width);

    function validateWithinGrid(_ref) {
      var x = _ref.x,
          y = _ref.y;
      V.validateNonNegativeInteger(x);
      expect(x).to.be.below(game.width);
      V.validateNonNegativeInteger(y);
      expect(y).to.be.below(game.height);
    }

    function getSnakeCount() {
      var time = new Date();
      var count = [];
      game.grid.forEach(function (b) {
        if (b[0] == B.SNAKE) {
          count[b[1].s] |= 0;
          count[b[1].s] += 1;
        }
      });
      console.log(new Date() - time);
      return count;
    }
  },
  validateNonNegativeInteger: function validateNonNegativeInteger(value) {
    expect(value).to.be.within(0, Infinity);
    expect(value).to.eql(Math.floor(value));
  },
  when: function when(v, k, cases) {
    expect(_.keys(cases)).to.contain(v.toString());
    cases[v](k);
  },
  validateKVPair: function validateKVPair(pair, cases) {
    expect(pair).to.be.an('array');
    expect(pair).to.have.length(2);
    helper.when(pair[0], pair[1], cases);
  },
  validateEmptyHash: function validateEmptyHash(hash) {
    expect(hash).to.eql({});
  },
  validateString: function validateString(string) {
    expect(string).to.be.a('string');
  },
  validateConfig: function validateConfig(config) {
    expect(config).to.only.have.keys(['startRemain']);
    expect(config.startRemain).to.be.a('number');
  },
  validateSnake: function validateSnake(game, snake, full) {
    validateKeys(); //validatePretty();

    validateHeadOrTail(snake.head);
    validateHeadOrTail(snake.tail);
    validateLength();
    validateRemain();
    validateSnakeBody();

    function validateKeys() {
      expect(snake).to.only.have.keys(['age', //number of ticks since joined
      'head', //position of head
      'index', //index in game.snakes
      'length', //cached length of snake
      'pretty', //every not related to game mechanics
      'remain', //number of length left to grow
      'tick', //ticks left for the next move
      'name', //id of snake
      'tail']);
    }

    function validatePretty() {
      expect(snake.pretty).to.only.have.keys(["name"]);
    }

    function validateHeadOrTail(head_or_tail) {
      expect(head_or_tail).to.only.have.keys(['x', 'y']);
      expect(game.getBox(head_or_tail)).not.to.eql(null);
    }

    function validateGame() {
      expect(game.json.snakes[snake.index]).to.be(snake);
    }

    function validateLength() {
      expect(snake.length).to.be.above(0);
    }

    function validateRemain() {
      expect(snake.remain).to.be.above(-1);
    }

    function validateSnakeBody() {
      var p1 = snake.head;
      var b1 = game.getBox(p1); //box belongs to the snake

      expect(b1[1].s == snake.index);
      expect(b1[0] == B.SNAKE);

      if (b1[1].h == D.OTHER) {
        //not moving
        //expect snake only have one box
        expect(snake.length).to.be(1);
        expect(b1[1].t == D.OTHER_T);
        expect(snake.tail).to.eql(p1);
        return;
      }

      var length = 1;
      var limit = 1000;

      while (!_.isEqual(p1, snake.tail) && limit-- > 0) {
        var p2 = H.applyDirection(p1, b1[1].t);
        var b2 = game.getBox(p2); //is snake

        expect(b2[0] == B.SNAKE); //is the snake

        expect(b2[1].s == snake.index); //connected

        expect(b2[1].h == b1[1].t ^ D.OP_MASK); //is still going to extend to the tail

        expect(b1[1].t != D.OTHER_T);
        p1 = p2;
        b1 = b2;
        length++;
      }

      expect(snake.length).to.be(length);
    }
  },
  validateBox: function validateBox(game, box, _ref2) {
    var _V$when;

    var x = _ref2.x,
        y = _ref2.y;

    if (JSON.stringify(box) == "[0,{}]") {
      return;
    }

    expect(box).to.be.an('array');
    expect(_.values(B)).to.contain(box[0]);
    V.when(box[0], box[1], (_V$when = {}, (0, _defineProperty2["default"])(_V$when, B.EMPTY, function (data) {
      //empty box
      expect(data).to.eql({});
    }), (0, _defineProperty2["default"])(_V$when, B.SNAKE, function (data) {
      expect(data).to.only.have.keys(['h', //direction toward the head
      't', //direction toward the tail
      's']);
      expect(_.values(D)).to.contain(data.h);
      expect(_.values(D)).to.contain(data.t);
      V.validateNonNegativeInteger(data.s);
      var snake = game.snakes[data.s];
      expect(snake).not.to.eql(null);
      expect([D.EAST, D.SOUTH, D.WEST, D.NORTH, D.OTHER]).to.contain(data.h);
      _.isEqual(snake.head, {
        x: x,
        y: y
      }) || validateConnect('h', 't');
      expect([D.EAST, D.SOUTH, D.WEST, D.NORTH, D.OTHER_T]).to.contain(data.t);
      _.isEqual(snake.tail, {
        x: x,
        y: y
      }) || validateConnect('t', 'h');

      function validateConnect(hKey, tKey) {
        if (!D.isValidUserDirection(data[hKey])) {
          return;
        }

        var pHead = game._applyDirection({
          x: x,
          y: y
        }, data[hKey]);

        validateWithinGrid(pHead);
        var bHead = game.getBox(pHead);
        expect(bHead[0]).to.be(B.SNAKE);
        var dataHead = bHead[1];
        expect(dataHead.s).to.be(data.s);

        var pTailOfHead = game._applyDirection(pHead, dataHead[tKey]);

        expect(pTailOfHead).to.eql({
          x: x,
          y: y
        });
      }
    }), (0, _defineProperty2["default"])(_V$when, B.FOOD, function (data) {
      expect(data).to.only.have.keys(['q']); //length it awards the snake

      expect(data.q).to.be.a('number');
    }), (0, _defineProperty2["default"])(_V$when, B.BLOCK, function (data) {}), _V$when));
  },
  validateSeed: function validateSeed(seed) {
    //state of xor128
    var keys = ["x", "y", "z", "w"];
    expect(seed).to.only.have.keys(keys);
    keys.forEach(function (k) {
      expect(seed[k]).to.be.a('number');
    });
  }
};
module.exports = V;

},{"@babel/runtime/helpers/defineProperty":10,"@babel/runtime/helpers/interopRequireDefault":13,"consts":2,"underscore":19}],25:[function(require,module,exports){
"use strict";

var View = require('view');

var Game = require('game');

var map = require('map');

describe("View", function () {
  describe("on game box", function () {
    it("clears the original content", function () {
      var param = {
        width: 20,
        height: 20,
        version: 1
      };
      var game = new Game(map(param).game);
      var svgEl = $('<svg></svg>')[0];
      var view = new View(svgEl, game);
      var box = view.grid[20];
      box.rect(1, 1);
      game.emit('box', {
        x: 0,
        y: 1
      }, [], [0]);
      expect(box.children.length).to.be(0);
    });
  });
});

},{"game":3,"map":4,"view":5}]},{},[22])

//# sourceMappingURL=test.js.map

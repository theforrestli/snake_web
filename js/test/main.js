(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var D_EAST = 0;
exports.D_EAST = D_EAST;
var D_SOUTH = 1;
exports.D_SOUTH = D_SOUTH;
var D_WEST = 2;
exports.D_WEST = D_WEST;
var D_NORTH = 3;
exports.D_NORTH = D_NORTH;
var D_OTHER = 4;
exports.D_OTHER = D_OTHER;
var D_OP_MASK = 2;

exports.D_OP_MASK = D_OP_MASK;
var BT_EMPTY = 0;
exports.BT_EMPTY = BT_EMPTY;
var BT_SNAKE = 1;
exports.BT_SNAKE = BT_SNAKE;
var D = {
  EAST: 0,
  SOUTH: 1,
  WEST: 2,
  NORTH: 3,
  OTHER: 4,
  OTHER_T: 6,
  OP_MASK: 2
};
exports.D = D;
var B = {
  EMPTY: 0,
  SNAKE: 1,
  FOOD: 2
};
exports.B = B;
var H = {
  applyDirection: function applyDirection(_ref, d) {
    var x = _ref.x;
    var y = _ref.y;

    switch (d) {
      case D_NORTH:
        y -= 1;break;
      case D_SOUTH:
        y += 1;break;
      case D_WEST:
        x -= 1;break;
      case D_EAST:
        x += 1;break;
      default:
        break;
    }
    return { x: x, y: y };
  }
};
exports.H = H;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _consts = require('./consts');

var Game = (function () {
  function Game(json) {
    _classCallCheck(this, Game);

    if (json.version != 1) throw "wrong version";
    this.json = json;
    var nsnake = this.json.snakes.filter(function (x) {
      return x != null;
    }).length;
    this.cache = {
      nsnake: nsnake
    };
  }

  _createClass(Game, [{
    key: "handleCommands",
    value: function handleCommands(cmds) {
      var _this = this;

      cmds.forEach(function (cmd) {
        try {
          handlers[cmd[0]](cmd[1], _this);
        } catch (e) {
          console.error(e);
        }
      });
    }
  }, {
    key: "getBox",
    value: function getBox(_ref) {
      var x = _ref.x;
      var y = _ref.y;

      return this.json.grid[y * this.json.width + x];
    }
  }, {
    key: "getSnakeSize",
    value: function getSnakeSize() {
      return this.cache.nsnake;
    }
  }, {
    key: "setSnake",
    value: function setSnake(index, snake) {
      if (this.json.snakes[index] != null) {
        this.cache.nsnake--;
      }
      if (snake != null) {
        this.cache.nsnake++;
      }
      this.json.snakes[index] = snake;
    }
  }]);

  return Game;
})();

exports["default"] = Game;

var handlers = {
  move: function move(data, game) {
    var json = game.json;
    var snake = json.snakes[data.s];
    var p1 = snake.head;
    var b1 = game.getBox(snake.head);
    if (b1[1].h == _consts.D.OTHER) {
      return;
    }
    var p2 = _consts.H.applyDirection(p1, b1[1].h);
    var b2 = game.getBox(p2);
    switch (b2[0]) {
      case _consts.B.FOOD:
        snake.remain += b2[1].q;
        b2[0] = _consts.B.EMPTY;
        b2[1] = {};
      case _consts.B.EMPTY:
        b2[0] = _consts.B.SNAKE;
        b2[1] = {
          h: b1[1].h,
          t: b1[1].h ^ _consts.D.OP_MASK,
          s: snake.index
        };
        snake.head = p2;
        if (snake.remain > 0) {
          snake.remain--;
          snake.length++;
          return;
        }
        p1 = snake.tail;
        b1 = game.getBox(p1);
        p2 = _consts.H.applyDirection(p1, b1[1].h);
        b2 = game.getBox(p2);
        snake.tail = p2;
        b1[0] = _consts.B.EMPTY;
        b1[1] = {};
        break;
      case _consts.B.BLOCK:
      case _consts.B.SNAKE:
        destroySnake(game, snake);
        break;
    }
  },
  join: function join(data, game) {
    var x = data.x;
    var y = data.y;

    var box = game.getBox({ x: x, y: y });
    var json = game.json;

    if (box[0] != _consts.B.EMPTY) {
      throw "box taken";
    }
    var index = findNextEmpty(json.snakes);

    var snake = {
      age: 0,
      index: index,
      head: { x: x, y: y },
      length: 1,
      name: data.name,
      remain: data.remain,
      tail: { x: x, y: y },
      pretty: data.pretty
    };
    game.setSnake(index, snake);

    json.snakes[snake.index] = snake;
    box[0] = _consts.B.SNAKE;
    box[1] = {
      h: _consts.D.OTHER,
      s: snake.index,
      t: _consts.D.OTHER_T
    };
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
    if (b1[0] != _consts.B.EMPTY) {
      throw "box taken";
    }
    b1[0] = _consts.B.FOOD;
    b1[1] = {
      q: data.q
    };
  },
  leave: function leave(data, game) {
    var snake = game.json.snakes[data.s];
    if (snake == null) {
      throw "snake not exist";
    }
    destroySnake(game, snake);
  }
};
function findNextEmpty(list) {
  var t = 0;
  while (list[t] != null) {
    t++;
  }
  return t;
}
function destroySnake(game, snake) {
  var p1 = snake.head;
  var b1 = game.getBox(snake.head);
  while (b1[0] == _consts.B.SNAKE && b1[1].s == snake.index) {
    p1 = _consts.H.applyDirection(p1, b1[1].t);
    b1[0] = _consts.B.EMPTY;
    b1[1] = {};
    b1 = game.getBox(p1);
  }
  game.setSnake(snake.index, null);
}
module.exports = exports["default"];

},{"./consts":1}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

var _constsJs = require('./consts.js');

var C = _interopRequireWildcard(_constsJs);

exports["default"] = function (param) {
  var size = param.width * param.height;
  var grid = [];
  for (var t = 0; t < size; t++) {
    grid[t] = [C.BT_EMPTY, {}];
  }
  var game = {
    "version": 1,
    "width": param.width,
    "height": param.height,
    "grid": grid,
    "snakes": []
  };
  return { game: game };
};

module.exports = exports["default"];

},{"./consts.js":1}],4:[function(require,module,exports){
"use strict";

var _consts = require('../consts');

describe("Sample test", function () {
  describe("basics", function () {
    it("is working", function () {
      expect(true).to.equal(true);
    });
    it("can import", function () {
      expect(_consts.D.EAST).not.to.be(undefined);
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

},{"../consts":1}],5:[function(require,module,exports){
'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _consts = require('../consts');

var _map = require('../map');

var _map2 = _interopRequireDefault(_map);

var _game = require('../game');

var _game2 = _interopRequireDefault(_game);

function validateGame(game) {}
function validateSnake(game, snake, full) {
  expect(snake).to.only.have.keys(['age', 'head', 'index', 'length', 'name', 'pretty', 'remain', 'tail']);
  expect(snake.head).to.only.have.keys(['x', 'y']);
  expect(game.getBox(snake.head)).not.to.eql(null);

  expect(game.json.snakes[snake.index]).to.be(snake);

  expect(snake.length).to.be.above(0);

  expect(snake.remain).to.be.above(-1);

  expect(snake.tail).to.only.have.keys(['x', 'y']);
  expect(game.getBox(snake.tail)).not.to.eql(null);

  var p1 = snake.head;
  var b1 = game.getBox(p1);
  expect(b1[1].s == snake.index);
  if (b1[1].h == _consts.D.OTHER) {
    //not moving
    expect(snake.length).to.be(1);
    expect(b1[1].t == _consts.D.OTHER_T);
    expect(snake.tail).to.eql(p1);
    return;
  }
  var p2 = _consts.H.applyDirection(p1, b1[1].t);
  var b2 = game.getBox(p2);
  var length = 1;
  while (b2[0] == _consts.B.SNAKE && b2[1].s == snake.index) {
    expect(b1[1].s == snake.index);
    if (b1 == b2) {
      expect(b1[1].t).to.be(_consts.D.OTHER_T);
      break;
    }
    expect(b2[1].h == b1[1].t ^ _consts.D.OP_MASK);
    p1 = p2;
    b1 = b2;
    p2 = _consts.H.applyDirection(p1, b1[1].t);
    b2 = game.getBox(p2);
    length++;
  }
  expect(snake.length).to.be(length);
  expect(snake.tail).to.eql(p1);
}
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
      d: _consts.D.EAST
    }],
    "d0W": ["direction", {
      s: 0,
      d: _consts.D.WEST
    }],
    "d0S": ["direction", {
      s: 0,
      d: _consts.D.SOUTH
    }],
    "m0": ["move", {
      s: 0
    }],
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
    game = new _game2['default']((0, _map2['default'])(param).game);
  });
  describe("#handleCommands", function () {
    describe("join", function () {
      it("initializes snake", function () {
        var box1 = game.getBox({ x: 2, y: 2 });
        game.handleCommands([cmds.j222]);
        expect(game.getSnakeSize()).to.be(1);
        var snake = game.json.snakes[0];
        expect(snake.head).not.to.be(snake.tail);
        expect(box1[1].t).to.be(_consts.D.OTHER_T);
        expect(box1[1].h).to.be(_consts.D.OTHER);
      });
      it("can join many snakes", function () {
        var box1 = game.getBox({ x: 2, y: 2 });
        var box2 = game.getBox({ x: 2, y: 4 });

        game.handleCommands([cmds.j222]);
        expect(game.getSnakeSize()).to.be(1);
        expect(box1[0] === _consts.B.SNAKE);

        game.handleCommands([cmds.j242]);
        expect(game.getSnakeSize()).to.be(2);
        expect(box2[0] === _consts.B.SNAKE);
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
        expect(box[1].h == _consts.D.EAST);
      });
      it("cannot go to opposite direction", function () {
        game.handleCommands([cmds.j222]);
        var snake = game.json.snakes[0];
        var box = game.getBox(snake.head);
        box[1].h = _consts.D.WEST;
        box[1].t = _consts.D.EAST;
        validateSnake(game, snake);
        game.handleCommands([cmds.d0E]);
        expect(box[1].h).to.be(_consts.D.WEST);
      });
    });
    describe("move", function () {
      it("moves at length 1", function () {
        game.handleCommands([cmds.j222]);
        game.handleCommands([cmds.d0E]);
        var snake = game.json.snakes[0];
        snake.remain = 0;
        for (var t = 0; t < 2; t++) {
          game.handleCommands([cmds.m0]);
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
          game.handleCommands([cmds.m0]);
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
          game.handleCommands([cmds.m0]);
          validateSnake(game, snake);
          expect(snake.length).to.be(lengths[t]);
        }
      });
    });
    describe("food", function () {
      it("can be placed", function () {
        game.handleCommands([cmds.f242]);
        expect(game.getBox({ x: 2, y: 4 })).to.eql([_consts.B.FOOD, {
          q: 2
        }]);
      });
      it("cannot override block", function () {
        game.handleCommands([cmds.j242, cmds.f242]);
        expect(game.getBox({ x: 2, y: 4 })[0]).to.be(_consts.B.SNAKE);
      });
      it("can be eaten", function () {
        game.handleCommands([cmds.j222, cmds.d0S]);
        var snake = game.json.snakes[0];
        snake.remain = 1;
        game.handleCommands([cmds.f242, cmds.m0, cmds.m0]);
        expect(snake.remain).to.be(1);
        expect(snake.length).to.be(3);
      });
    });
    describe("leave", function () {
      it("a snake leaves", function () {
        game.handleCommands([cmds.j222, cmds.l0]);
        expect(game.getSnakeSize()).to.be(0);
        expect(game.getBox({ x: 2, y: 2 })).to.eql([_consts.B.EMPTY, {}]);
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

},{"../consts":1,"../game":2,"../map":3}],6:[function(require,module,exports){
'use strict';

require('./example');

require('./map');

require('./game');

},{"./example":4,"./game":5,"./map":7}],7:[function(require,module,exports){
"use strict";

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _map = require('../map');

var _map2 = _interopRequireDefault(_map);

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
      expect(_map2["default"]).withArgs(input).not.to.throwException();
    });
    it("varifies version", function () {
      input.version = -1;
      expect(_map2["default"]).withArgs(input).to.throwException();
    });
    it("varifies size", function () {
      input.width = 0;
      expect(_map2["default"]).withArgs(input).to.throwException();
      input.width = -1;
      expect(_map2["default"]).withArgs(input).to.throwException();
      input.width = 3.5;
      expect(_map2["default"]).withArgs(input).to.throwException();
      input.width = 1e10;
      expect(_map2["default"]).withArgs(input).to.throwException();

      input.width = 10;

      input.height = 0;
      expect(_map2["default"]).withArgs(input).to.throwException();
      input.height = -1;
      expect(_map2["default"]).withArgs(input).to.throwException();
      input.height = 3.5;
      expect(_map2["default"]).withArgs(input).to.throwException();
      input.height = 1e10;
      expect(_map2["default"]).withArgs(input).to.throwException();
    });
  });
  describe("game", function () {});
});

},{"../map":3}]},{},[6])


//# sourceMappingURL=main.js.map
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj["default"] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var _constsJs = require('./consts.js');

var C = _interopRequireWildcard(_constsJs);

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
    value: function setSnake(snake) {
      if (this.json.snakes[snake.index] != null) {
        this.cache.nsnake--;
      }
      if (snake != null) {
        this.cache.nsnake++;
      }
      this.json.snakes[snake.index] = snake;
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
    if (b1[1].h == D_OTHER) {
      return;
    }
    var p = applyDirection(snake.head, head.d.h);
    var box = game.getBox(p);
    switch (box.t) {
      case BT_FOOD:
        snake.remain += box.d.q;
        box.t = BT_EMPTY;
        box.d = {};
      case BT_EMPTY:
        box.t = BT_SNAKE;
        box.d = {
          d: snake.d,
          s: snake.index
        };
        if (snake.remain > 0) {
          snake.remain--;
        } else {}
        break;
      case BT_BLOCK:
      case BT_SNAKE:
        box = game.getBox(sanke);
        while (box.t == BT_SNAKE && box.d.s == snake.index) {
          var _applyDirection = applyDirection({ x: x, y: y }, box.d.d ^ D_OP_MASK);

          var x = _applyDirection.x;
          var y = _applyDirection.y;

          var b2 = game.getBox({ x: x, y: y });
          box.t = BT_EMPTY;
          box.d = {};
          box = b2;
        }
        break;
    }
  },
  join: function join(data, game) {
    var x = data.x;
    var y = data.y;

    var box = game.getBox({ x: x, y: y });

    if (box[0] != C.BT_EMPTY) {
      throw "box taken";
    }
    var index = findNextEmpty(game.json.snakes);

    var snake = {
      age: 0,
      index: index,
      head: { x: x, y: y },
      length: 1,
      name: data.name,
      remain: data.remain,
      tail: { x: x, y: y }
    };

    game.setSnake(snake);

    game.json.snakes[snake.index] = snake;
    box[0] = C.BT_SNAKE;
    box[1] = {
      h: C.D_OTHER,
      s: snake.index,
      t: C.D_OTHER_T
    };
  }
};
function findNextEmpty(list) {

  console.log(list);
  var t = 0;
  while (list[t] != null) {
    t++;
  }
  return t;
}
module.exports = exports["default"];
//# sourceMappingURL=game.js.map
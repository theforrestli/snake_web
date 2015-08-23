'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _constsJs = require('../consts.js');

var C = _interopRequireWildcard(_constsJs);

var _mapJs = require('../map.js');

var _mapJs2 = _interopRequireDefault(_mapJs);

var _gameJs = require('../game.js');

var _gameJs2 = _interopRequireDefault(_gameJs);

describe("Sample test", function () {
  describe("basics", function () {
    it("is working", function () {
      expect(true).to.equal(true);
    });
    it("can import", function () {
      expect(C.D_EAST).to.be(0);
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

function validateSnake(game, snake) {
  var p1 = snake.head;
  var b1 = game.getBox(p1);
  if (b1[1].h == C.D_OTHER) {
    expect(snake.length).to.be(1);
    expect(b1[1].t == C.D_OTHER);
    expect(snake.tail).to.eql(p1);
    return;
  }
  var p2 = applyDirection(p1, b1[1].t);
  var b2 = game.getBox(p1);
  var length = 1;
  while (b2[0] == C.BT_SNAKE && b2[1].s == snake.index) {
    if (b1 == b2) {
      expect(b1[1].t).to.be(C.D_OTHER_T);
      break;
    }
    expect(b2[1].h == b1[1].t);
    p1 = p2;
    b1 = b2;
    p2 = applyDirection(p1, b1[1].t);
    b2 = game.getBox(p2);
  }
  expect(snake.length).to.be(length);
  expect(snake.tail).to.eql(p1);
}
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
      expect(_mapJs2['default']).withArgs(input).not.to.throwException();
    });
    it("varifies version", function () {
      input.version = -1;
      expect(_mapJs2['default']).withArgs(input).to.throwException();
    });
    it.skip("varifies size", function () {
      input.width = 0;
      expect(_mapJs2['default']).withArgs(input).to.throwException();
      input.width = -1;
      expect(_mapJs2['default']).withArgs(input).to.throwException();
      input.width = 3.5;
      expect(_mapJs2['default']).withArgs(input).to.throwException();
      input.width = 1e10;
      expect(_mapJs2['default']).withArgs(input).to.throwException();

      input.width = 10;

      input.height = 0;
      expect(_mapJs2['default']).withArgs(input).to.throwException();
      input.height = -1;
      expect(_mapJs2['default']).withArgs(input).to.throwException();
      input.height = 3.5;
      expect(_mapJs2['default']).withArgs(input).to.throwException();
      input.height = 1e10;
      expect(_mapJs2['default']).withArgs(input).to.throwException();
    });
  });
  describe("game", function () {});
});

describe("Game", function () {
  var game;
  var cmds = {
    "j22": ["join", {
      "name": "j22",
      "remain": 0,
      "x": 2,
      "y": 2
    }],
    "j24": ["join", {
      "name": "j24",
      "remain": 0,
      "x": 2,
      "y": 4
    }]

  };
  beforeEach(function () {
    var param = {
      width: 20,
      height: 20,
      version: 1
    };
    game = new _gameJs2['default']((0, _mapJs2['default'])(param).game);
  });
  describe("#handleCommand", function () {
    describe("join", function () {
      it("can join many snakes", function () {
        var box1 = game.getBox({ x: 2, y: 2 });
        var box2 = game.getBox({ x: 2, y: 4 });

        game.handleCommand(cmds.j22);
        expect(game.getSnakeSize()).to.be(1);
        expect(box1[0] === C.BT_SNAKE);

        game.handleCommand(cmds.j24);
        expect(game.getSnakeSize()).to.be(2);
        expect(box2[0] === C.BT_SNAKE);
      });
      it("cannot add snake at the same position", function () {
        game.handleCommand(cmds.j22);
        game.handleCommand(cmds.j22);
        expect(game.getSnakeSize()).to.be(1);
      });
    });
    describe.skip("move", function () {
      it("moves along direction", function () {
        // var snake = game.snake[0];
        // validateSnake(game,snake);
        // game.handleCommand({
        //   cmd:"move",
        //   s:0
        // });
        // validateSnake(game,snake);
      });
    });
  });
});
//# sourceMappingURL=../test/main.js.map
import * as C from '../consts.js';
import map from '../map.js';
import Game from '../game.js';
describe("Sample test", () => {
  describe("basics", () => {
    it("is working", () => {
      expect(true).to.equal(true);
    });
    it("can import", () => {
      expect(C.D_EAST).to.be(0);
    });
  });
  describe("hooks", () =>{
    var a=0;
    before(() => {
      a+=1;
    });
    it("run before block", () => {
      expect(a).to.be(1);
    })
    it("run before block twice", () => {
      expect(a).to.be(1);
    })
  })
});

function validateSnake(game,snake){
  var p1=snake.head;
  var b1=game.getBox(p1);
  if(b1[1].h==C.D_OTHER){
    expect(snake.length).to.be(1);
    expect(b1[1].t==C.D_OTHER);
    expect(snake.tail).to.eql(p1);
    return;
  }
  var p2=applyDirection(p1,b1[1].t);
  var b2=game.getBox(p1);
  var length=1;
  while(b2[0]==C.BT_SNAKE && b2[1].s==snake.index){
    if(b1==b2){
      expect(b1[1].t).to.be(C.D_OTHER_T);
      break;
    }
    expect(b2[1].h == b1[1].t);
    p1=p2;
    b1=b2;
    p2=applyDirection(p1,b1[1].t);
    b2=game.getBox(p2);
  }
  expect(snake.length).to.be(length);
  expect(snake.tail).to.eql(p1);
}
describe("map", () => {
  var input;
  beforeEach(() => {
    input = {
      version: 1,
      width: 10,
      height: 10,
    };
  });
  describe.skip("validation", () => {
    it("passes when input is good", () => {
      expect(map).withArgs(input).not.to.throwException();
    });
    it("varifies version", () => {
      input.version = -1;
      expect(map).withArgs(input).to.throwException();
    });
    it.skip("varifies size", () => {
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
  })
  describe("game", () => {
  })
})

describe("Game", () => {
  var game;
  var cmds = {
    "j22":[
      "join",
      {
        "name": "j22",
        "remain":0,
        "x":2,
        "y":2,
      }
    ],
    "j24":[
      "join",
      {
        "name": "j24",
        "remain":0,
        "x":2,
        "y":4,
      }
    ],

  }
  beforeEach(() => {
    var param = {
      width: 20,
      height: 20,
      version: 1,
    }
    game = new Game(map(param).game);
  });
  describe("#handleCommand", () => {
    describe("join", () => {
      it("can join many snakes", () => {
        var box1 = game.getBox({x:2,y:2});
        var box2 = game.getBox({x:2,y:4});

        game.handleCommand(cmds.j22);
        expect(game.getSnakeSize()).to.be(1);
        expect(box1[0] === C.BT_SNAKE);

        game.handleCommand(cmds.j24);
        expect(game.getSnakeSize()).to.be(2);
        expect(box2[0] === C.BT_SNAKE);
      });
      it("cannot add snake at the same position", () => {
        game.handleCommand(cmds.j22);
        game.handleCommand(cmds.j22);
        expect(game.getSnakeSize()).to.be(1);
      });
    })
    describe.skip("move", () => {
      it("moves along direction", () => {
        // var snake = game.snake[0];
        // validateSnake(game,snake);
        // game.handleCommand({
        //   cmd:"move",
        //   s:0
        // });
        // validateSnake(game,snake);
      })
    })
  })
});

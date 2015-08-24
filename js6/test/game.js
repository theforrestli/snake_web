import {D,B,H} from '../consts';
import map from '../map';
import Game from '../game';
function validateBox(game, {x,y,box}){
}
function validateSnake(game,snake){
  var p1=snake.head;
  var b1=game.getBox(p1);
  if(b1[1].h==D.OTHER){
    expect(snake.length).to.be(1);
    expect(b1[1].t==D.OTHER);
    expect(snake.tail).to.eql(p1);
    return;
  }
  var p2=H.applyDirection(p1,b1[1].t);
  var b2=game.getBox(p2);
  var length=1;
  while(b2[0]==B.SNAKE && b2[1].s==snake.index){
    if(b1==b2){
      expect(b1[1].t).to.be(D.OTHER_T);
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
describe("Game", () => {
  var game;
  var cmds = {
    "j222":[
      "join",
      {
        "name": "j22",
        "remain":2,
        "x":2,
        "y":2,
      }
    ],
    "j242":[
      "join",
      {
        "name": "j24",
        "remain":2,
        "x":2,
        "y":4,
      }
    ],
    "d0E":[
      "direction",
      {
        s:0,
        d:D.EAST,
      }
    ],
    "d0W":[
      "direction",
      {
        s:0,
        d:D.WEST,
      }
    ],
    "m0":[
      "move",
      {
        s:0,
      }
    ]
  }
  beforeEach(() => {
    var param = {
      width: 20,
      height: 20,
      version: 1,
    }
    game = new Game(map(param).game);
  });
  describe("#handleCommands", () => {
    describe("join", () => {
      it("initializes snake", () => {
        var box1 = game.getBox({x:2,y:2});
        game.handleCommands([cmds.j222]);
        expect(game.getSnakeSize()).to.be(1);
        var snake = game.json.snakes[0];
        expect(snake.head).not.to.be(snake.tail);
        expect(box1[1].t).to.be(D.OTHER_T);
        expect(box1[1].h).to.be(D.OTHER);
      });
      it("can join many snakes", () => {
        var box1 = game.getBox({x:2,y:2});
        var box2 = game.getBox({x:2,y:4});

        game.handleCommands([cmds.j222]);
        expect(game.getSnakeSize()).to.be(1);
        expect(box1[0] === B.SNAKE);

        game.handleCommands([cmds.j242]);
        expect(game.getSnakeSize()).to.be(2);
        expect(box2[0] === B.SNAKE);
      });
      it("cannot add snake at the same position", () => {
        game.handleCommands([cmds.j222]);
        game.handleCommands([cmds.j222]);
        expect(game.getSnakeSize()).to.be(1);
      });
    })
    describe("direction", () => {
      it("can change direction", () => {
        game.handleCommands([
          cmds.j222,
          cmds.d0E,
        ]);
        var snake = game.json.snakes[0];
        var box = game.getBox(snake.head);
        validateSnake(game,snake);
        expect(box[1].h == D.EAST);
      });
      it("cannot go to opposite direction", () => {
        game.handleCommands([
          cmds.j222,
        ]);
        var snake = game.json.snakes[0];
        var box = game.getBox(snake.head);
        box[1].h = D.WEST;
        box[1].t = D.EAST;
        validateSnake(game,snake);
        game.handleCommands([
          cmds.m0E,
        ]);
        expect(box[1].h == D.EAST);
      });
    })
    describe.skip("move", () => {
      it("moves along direction", () => {
        game.handleCommands([
          cmds.j222,
          cmds.d00,
          cmds.m0,
        ]);
        var snake = game.snake[0];
        validateSnake(game,snake);
      })
    })
  })
});

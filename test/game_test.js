const {D,B,H} = require('consts');
const Box = require('box');
const map = require('map');
var Game = require('game');
var _ = require('underscore/underscore');
var th = require('./test_helper');
const xor128 = require('seedrandom/xor128');

function validateGame(game){
  expect(game).to.only.have.keys([
    'config',//config object for game, such as power duration
    'grid',// array of boxes on map
    'height',
    'seed',// state object for seedrandom
    'snakes',// array of snakes
    'tick',// integer representing time since game started
    'version',// always 1
    'width',
  ]);

  validateConfig(game.config);

  expect(game.grid).to.be.an('array');
  expect(game.grid).to.have.length(game.width * game.height);
  game.grid.forEach((box, index) => {
    validateBox(box, {x: index%game.width, y: (index/game.width)|0});
  });

  th.validateNonNegativeInteger(game.height);

  validateSeed(game.seed);

  expect(game.snakes).to.be.an('array');
  const snakeCount = getSnakeCount();
  game.snakes.forEach((snake, index) => {
    validateSnake(snake, index, snakeCount[index]);
  });


  th.validateNonNegativeInteger(game.tick);
  expect(game.version).to.be(1);
  th.validateNonNegativeInteger(game.width);

  function validateConfig(config){
    expect(config).to.only.have.keys([
      'startRemain',//the remain value for snake when initialized
    ]);
    expect(config.startRemain).to.be.a('number');
  }

  function validateSnake(snake, index, count){
    if(snake === undefined){
      return;
    }
    expect(snake).to.only.have.keys([
      'startAge',//time when snake was initialized
      'head',//position of head {x,y}
      'name',//user friendly name
      'length',//calculated integer
      'powerStartTick',//the time when snake can start power
      'powerStopTick',//the time when snake no longer gets power
      'pretty',//config object for displaying game
      'remain',//remaining number of boxes the snake can grow
      'tail',//position of tail {x,y}
    ]);

    th.validateNonNegativeInteger(snake.startAge);
    expect(snake.startAge).to.be.below(game.tick+1);

    validateHeadOrTail(snake.head);

    expect(snake.name).to.be.a('string');
    expect(snake.name.length).to.within(0,256);

    validateSnakeLength(count);

    th.validateNonNegativeInteger(snake.powerStartTick);
    th.validateNonNegativeInteger(snake.powerStopTick);
    th.validateNonNegativeInteger(snake.remain);
    validateHeadOrTail(snake.tail);

    var p1=snake.head;
    var b1=game.getBox(p1);
    expect(b1[1].s).to.eql(index);
    if(b1[1].h==D.OTHER){//not moving
      expect(snake.length).to.be(1);
      expect(b1[1].t==D.OTHER_T);
      expect(snake.tail).to.eql(p1);
      return;
    }
    var p2=game._applyDirection(p1,b1[1].t);
    var b2=game.getBox(p2);
    var length=1;
    while(b2[0]==B.SNAKE && b2[1].s==index){
      expect(b1[1].s).to.eql(index);
      if(b1==b2){
        expect(b1[1].t).to.be(D.OTHER_T);
        break;
      }
      expect(b2[1].h == b1[1].t ^ D.OP_MASK);
      p1=p2;
      b1=b2;
      p2=game._applyDirection(p1,b1[1].t);
      b2=game.getBox(p2);
      length++;
    }
    expect(snake.length).to.be(length);
    expect(snake.tail).to.eql(p1);

    function validateHeadOrTail(p){
      expect(p).to.only.have.keys(['x','y']);
      validateWithinGrid(p);
      const box = game.getBox(p);
      expect(box[0]).to.be(B.SNAKE);
      expect(box[1].s).to.be(index);
    }

    function validateSnakeLength(count){
      let p = snake.head;
      let length = 1;
      while(!_.isEqual(p, snake.tail)){
        length++;
        let box = game.getBox(p);
        p=game._applyDirection(p, box[1].t);
      }
      expect(length).to.be(count);
      expect(length).to.be(snake.length);
    }
  }

  function validateWithinGrid({x,y}){
    th.validateNonNegativeInteger(x);
    expect(x).to.be.below(game.width);
    th.validateNonNegativeInteger(y);
    expect(y).to.be.below(game.height);
  }

  function validateBox(box, {x,y}){
    if(JSON.stringify(box) == "[0,{}]"){
      return;
    }
    expect(box).to.be.an('array');
    expect(_.values(B)).to.contain(box[0]);
    th.when(box[0], box[1], {
      [B.EMPTY]: (data) => {//empty box
        expect(data).to.eql({});
      },
      [B.SNAKE]: (data) => {
        expect(data).to.only.have.keys([
          'h',//direction toward the head
          't',//direction toward the tail
          's',//index of the snake
        ]);
        expect(_.values(D)).to.contain(data.h);
        expect(_.values(D)).to.contain(data.t);

        th.validateNonNegativeInteger(data.s);
        const snake = game.snakes[data.s];
        expect(snake).not.to.eql(null);

        expect([
          D.EAST,
          D.SOUTH,
          D.WEST,
          D.NORTH,
          D.OTHER,
        ]).to.contain(data.h);
        _.isEqual(snake.head, {x,y}) ||
          validateConnect('h','t');

        expect([
          D.EAST,
          D.SOUTH,
          D.WEST,
          D.NORTH,
          D.OTHER_T,
        ]).to.contain(data.t);
        _.isEqual(snake.tail, {x,y}) ||
          validateConnect('t','h');

        function validateConnect(hKey,tKey){
          if(!D.isValidUserDirection(data[hKey])){
            return;
          }
          const pHead = game._applyDirection({x,y},data[hKey]);
          validateWithinGrid(pHead);

          const bHead = game.getBox(pHead);

          expect(bHead[0]).to.be(B.SNAKE);
          const dataHead = bHead[1];
          expect(dataHead.s).to.be(data.s);
          const pTailOfHead = game._applyDirection(pHead, dataHead[tKey]);
          expect(pTailOfHead).to.eql({x,y});
        }
      },
      [B.FOOD]: (data) => {
        expect(data).to.only.have.keys(['q']);//length it awards the snake
        expect(data.q).to.be.a('number');
      },
      [B.BLOCK]: (data) => {
      }
    });
  }

  function validateSeed(seed){//state of xor128
    const keys = ["x","y","z","w"];
    expect(seed).to.only.have.keys(keys);
    keys.forEach((k) => {
      expect(seed[k]).to.be.a('number');
    });
  }

  function getSnakeCount(){
    const time = new Date();
    var count = [];
    game.grid.forEach((b) => {
      if(b[0] == B.SNAKE){
        count[b[1].s]|=0;
        count[b[1].s]+=1;
      }
    });
    console.log(new Date() - time);
    return count;
  }
}

describe("Game", () => {
  describe("generate", () => {
    it("generates valid game", () => {
      const game = Game.generate({width: 100, height: 100});
      validateGame(game);
    });
  });
  describe("#nextFreeP", () => {
    it("skips FOOD box and find next valid position", () => {
      const game = Game.generate({width: 5, height: 5});
      const random = function(){
        var c = 0;
        return function(){return (c++)/25;};
      }();
      for(var i=0;i<7;i++){
        game.grid[i]=[B.FOOD,{}];
      }
      const gameJson = JSON.stringify(game);
      expect(game.nextFreeP(random)).to.eql({x: 2, y: 1});
      expect(JSON.stringify(game)).to.eql(gameJson);
    });
  });
  describe("#_$setBox", () => {
    it("updates the box and calls listeners", () => {
      const game = Game.generate({width: 5, height: 5});
      const oldBox = "oldBox";
      game.grid[7] = oldBox;
      const position = {x:2,y:1};
      var called = false;
      game._$setBox({x:2,y:1},"newBox");
      expect(called).to.be.true;
    });
  });
  describe("#_$move", () => {
    it("moves snake based on direction", () => {
      const game = Game.generate({width: 10, height: 10});
      game.$join(1);
      const snake = game.snakes[1];
      game._$setBox(snake.head, Box.generate.empty());
      for(var x=3;x<6;x++){
        game._$setBox({x,y:2}, Box.generate.snake(1, D.WEST, D.EAST));
      }
      game._$setBox({x:3,y:2}, Box.generate.snake(1, D.SOUTH, D.EAST));
      snake.head = {x:3,y:2};
      snake.tail = {x:5,y:2};
      snake.length = 3;

      game._$move(1);
      validateGame(game);
    });
  });
  describe("#$join", () => {
    it("intitiates a snake", () => {
      const game = Game.generate({});
      const position = game.nextFreeP();
      game.$join(1);
      expect(game.getBox(position)).to.eql(
        Box.generate.snake(1,D.OTHER,D.OTHER_T)
      );
      expect(game.snakes[1]).to.be.an('object');
    });
  });
  describe("#$tick", () => {
    it("resets random", () => {
      const game = Game.generate({});
      const seed = "secret";
      const expectedSeed = new xor128(seed, {state: true}).state();
      game.$tick(seed);
      expect(game.seed).to.eql(expectedSeed);
    });
  });
});

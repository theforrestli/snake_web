var {D,B,H} = require('consts');
var map = require('map');
var Game = require('game');
var _ = require('underscore/underscore');
var th = require('./test_helper');

function validateGame(game){
  expect(game).to.only.have.keys([
    'config',
    'grid',
    'height',
    'seed',
    'snakes',
    'tick',
    'version',
    'width',
  ]);

  //validateConfig(game.config)

  expect(game.grid).to.be.an('array');
  expect(game.grid).to.have.length(game.width * game.height);
  game.grid.forEach((box, index) => {
    validateBox(box, {x: index%game.width, y: (index/game.width)|0});
  });

  th.validateNonNegativeInteger(game.height)

  validateSeed(game.seed);

  expect(game.snakes).to.be.an('array');
  const snakeCount = getSnakeCount();
  game.snakes.forEach((snake, index) => {
    validateSnake(snake, index, snakeCount[index]);
  });


  th.validateNonNegativeInteger(game.tick);
  expect(game.version).to.be(1);
  th.validateNonNegativeInteger(game.width)

  function validateSnake(snake, index, count){
    if(snake == null){
      return;
    }
    expect(snake).to.only.have.keys([
      'startAge',
      'head',
      'name',
      'length',
      'powerStartAge',
      'powerStopAge',
      'pretty',
      'remain',
      'tail',
    ]);

    th.validateNonNegativeInteger(snake.startAge);
    expect(snake.startAge).to.be.below(game.tick);

    validateHeadOrTail(snake.head);

    expect(snake.name).to.be.a('string');
    expect(snake.name.length).to.within(0,256);

    validateSnakeLength();

    th.validateNonNegativeInteger(snake.powerStartAge);
    th.validateNonNegativeInteger(snake.powerStopAge);
    th.validateNonNegativeInteger(snake.remain);
    validateHeadOrTail(snake.tail);

    var p1=snake.head;
    var b1=game.getBox(p1);
    expect(b1[1].s==snake.index);
    if(b1[1].h==D.OTHER){//not moving
      expect(snake.length).to.be(1);
      expect(b1[1].t==D.OTHER_T);
      expect(snake.tail).to.eql(p1);
      return;
    }
    var p2=H.applyDirection(p1,b1[1].t);
    var b2=game.getBox(p2);
    var length=1;
    while(b2[0]==B.SNAKE && b2[1].s==snake.index){
      expect(b1[1].s==snake.index);
      if(b1==b2){
        expect(b1[1].t).to.be(D.OTHER_T);
        break;
      }
      expect(b2[1].h == b1[1].t ^ D.OP_MASK);
      p1=p2;
      b1=b2;
      p2=H.applyDirection(p1,b1[1].t);
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

    function validateSnakeLength(){
      let p = snake.head;
      let length = 1;
      while(!_.equal(p, snake.tail)){
        length++;
        let box = game.getBox(p);
        p=Position.next(box);
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
    expect(box).to.be.an('array');
    expect(_.values(B)).to.contain(box[0]);
    th.when(box[0], box[1], {
      [B.EMPTY]: (data) => {
        expect(data).to.eql({});
      },
      [B.SNAKE]: (data) => {
        expect(data).to.only.have.keys([
          'h','t','s'
        ]);
        expect(_.values(D)).to.contain(data.h);
        expect(_.values(D)).to.contain(data.t);

        th.validateNonNegativeInteger(data.s);
        const snake = game.snakes[data.s];
        expect(snake).not.to.eql(null);

        expect([
          B.EAST,
          B.SOUTH,
          B.WEST,
          B.NORTH,
          B.OTHER,
        ]).to.contain(data.h);
        _.equal(snake.head, {x,y}) ||
          validateConnect('h','t');

        expect([
          B.EAST,
          B.SOUTH,
          B.WEST,
          B.NORTH,
          B.OTHER_T,
        ]).to.contain(data.t);
        _.equal(snake.tail, {x,y}) ||
          validateConnect('t','h');

        function validateConnect(hKey,tKey){
          if(!_.contains(Position.MOVABLES, data[hKey])){
            return;
          }
          const pHead = Position.next({x,y},data[hKey]);
          validateWithinGrid(pHead);

          const bHead = game.getBox(pHead);

          expect(bHead[0]).to.be(B.SNAKE);
          const dataHead = bHead[1];
          expect(dataHead.s).to.be(data.s);
          const pTailOfHead = Position.next(pHead, dataHead[tKey]);
          expect(pTailOfHead).to.eql({x,y});
        }
      },
      [B.FOOD]: (data) => {
        expect(data).to.only.have.keys(['q']);
        expect(data.q).to.be.a('number');
      },
      [B.BLOCK]: (data) => {
      }
    });
  }

  function validateSeed(seed){
    const keys = ["x","y","z","w"]
    expect(seed).to.only.have.keys(keys);
    keys.forEach((k) => {
      expect(seed[k]).to.be.a('number');
    });
  }

  function getSnakeCount(){
    return _.groupBy(
      game.grid.filter((box) => box[0] == B.SNAKE),
      (box) => box.s
    ).map((v) => v.length);
  }
}

describe("Game", () => {
  describe("generate", () => {
    it("generates valid game", () => {
      const game = Game.generate({});
      validateGame(game);
    });
  });
});

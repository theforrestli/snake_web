const {B, D, H} = require('consts');
const _ = require('underscore');
const V = {
  validateGame(game){
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

    V.validateConfig(game.config);

    expect(game.grid).to.be.an('array');
    expect(game.grid).to.have.length(game.width * game.height);
    game.grid.forEach((box, index) => {
      V.validateBox(game, box, {x: index%game.width, y: (index/game.width)|0});
    });

    V.validateNonNegativeInteger(game.height);

    V.validateSeed(game.seed);

    expect(game.snakes).to.be.an('array');
    const snakeCount = getSnakeCount();
    game.snakes.forEach((snake, index) => {
      V.validateSnake(snake, index, snakeCount[index]);
    });

    V.validateNonNegativeInteger(game.tick);
    expect(game.version).to.be(1);
    V.validateNonNegativeInteger(game.width);

    function validateWithinGrid({x,y}){
      V.validateNonNegativeInteger(x);
      expect(x).to.be.below(game.width);
      V.validateNonNegativeInteger(y);
      expect(y).to.be.below(game.height);
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
  },
  validateNonNegativeInteger(value){
    expect(value).to.be.within(0,Infinity);
    expect(value).to.eql(Math.floor(value));
  },
  when(v, k, cases){
    expect(_.keys(cases)).to.contain(v.toString());
    cases[v](k);
  },
  validateKVPair(pair, cases){
    expect(pair).to.be.an('array');
    expect(pair).to.have.length(2);
    helper.when(pair[0],pair[1],cases);
  },
  validateEmptyHash(hash){
    expect(hash).to.eql({});
  },
  validateString(string){
    expect(string).to.be.a('string');
  },
  validateConfig(config){
    expect(config).to.only.have.keys([
      'startRemain',//the remain value for snake when initialized
    ]);
    expect(config.startRemain).to.be.a('number');
  },
  validateSnake(game,snake,full){
    validateKeys();
    validatePretty();
    validateHeadOrTail(snake.head);
    validateHeadOrTail(snake.tail);
    validateLength();
    validateRemain();
    validateSnakeBody();


    function validateKeys(){
      expect(snake).to.only.have.keys([
        'age', //number of ticks since joined
        'head', //position of head
        'index', //index in game.snakes
        'length', //cached length of snake
        'pretty',//every not related to game mechanics
        'remain',//number of length left to grow
        'tick',//ticks left for the next move
        'tail',//position of tail
      ]);
    }
    function validatePretty(){
      expect(snake.pretty).to.only.have.keys([
        "name",
      ]);
    }
    function validateHeadOrTail(head_or_tail){
      expect(head_or_tail).to.only.have.keys(['x','y']);
      expect(game.getBox(head_or_tail)).not.to.eql(null);
    }
    function validateGame(){
      expect(game.json.snakes[snake.index]).to.be(snake);
    }
    function validateLength(){
      expect(snake.length).to.be.above(0);
    }
    function validateRemain(){
      expect(snake.remain).to.be.above(-1);
    }
    function validateSnakeBody(){
      let p1=snake.head;
      let b1=game.getBox(p1);
      //box belongs to the snake
      expect(b1[1].s==snake.index);
      expect(b1[0]==B.SNAKE);
      if(b1[1].h==D.OTHER){//not moving
        //expect snake only have one box
        expect(snake.length).to.be(1);
        expect(b1[1].t==D.OTHER_T);
        expect(snake.tail).to.eql(p1);
        return;
      }
      let length=1;
      let limit=1000;
      while(!_.isEqual(p1,snake.tail)&&limit-->0){
        let p2=H.applyDirection(p1,b1[1].t);
        let b2=game.getBox(p2);
        //is snake
        expect(b2[0]==B.SNAKE);
        //is the snake
        expect(b2[1].s==snake.index);
        //connected
        expect(b2[1].h==b1[1].t ^ D.OP_MASK);
        //is still going to extend to the tail
        expect(b1[1].t!=D.OTHER_T);
        p1 = p2;
        b1 = b2;
        length++;
      }
      expect(snake.length).to.be(length);
    }
  },
  validateBox(game, box, {x,y}){
    if(JSON.stringify(box) == "[0,{}]"){
      return;
    }
    expect(box).to.be.an('array');
    expect(_.values(B)).to.contain(box[0]);
    V.when(box[0], box[1], {
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

        V.validateNonNegativeInteger(data.s);
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
  },
  validateSeed(seed){//state of xor128
    const keys = ["x","y","z","w"];
    expect(seed).to.only.have.keys(keys);
    keys.forEach((k) => {
      expect(seed[k]).to.be.a('number');
    });
  }
};
module.exports = V;

const {D,B,H,LOG} = require('consts');
const Box = require('box');
const xor128 = require('seedrandom/xor128');
const _ = require('underscore/underscore');
const helpers = function(state, listeners){
  return self = {
    _$nextRandom(max){
      const me = this.seed;
      const t = me.x ^ (me.x << 11);
      me.x = me.y;
      me.y = me.z;
      me.z = me.w;
      const result = (me.w ^= (me.w >>> 19) ^ t ^ (t >>> 8));
      return (((result/0x100000000)+0.5)*max)|0;
    },
    _$nextFreeP(){
      var iGrid;
      var box;
      do{
        iGrid = this._$nextRandom(this.grid.length);
        box = this.grid[iGrid];
      }while(Box.getType(box) != Box.EMPTY)
      return this.toPosition(iGrid);
    },
  }
}
// module.exports = {
//   generate,
//   helpers,
// };
var Game;
module.exports = Game = {

  proto: {
    nextFreeP(random = this.getRandom()){
      var iGrid;
      var box;
      do{
        iGrid = (random()*this.grid.length)|0;
        box = this.grid[iGrid];
      }while(box[0] != B.EMPTY)
      return this.toPosition(iGrid);
    },
    getRandom(){
      return new xor128("", {state: this.seed});
    },
    _$setRandom(seedrandom){
      this.seed = seedrandom.state();
    },
    getBox(p){
      if(0<=p.x && p.x<this.width && 0<=p.y && p.y<this.height){
        return this.grid[p.x+p.y*this.height];
      }else{
        return null;
      }
    },
    _$setBox(p, newBox){
      const iGrid = p.x+p.y*this.height;
      const oldBox = this.grid[iGrid];
      this.grid[iGrid] = newBox;
    },
    $join(index){
      if(this.snakes[index] != null){
        //TODO return listeners;
        return;
      }
      const seedrandom = this.getRandom();
      const p = this.nextFreeP(seedrandom);
      const box = this.getBox(p);

      const snake={
        startAge: this.tick,
        head: p,
        name: `Snake-${index}`,
        length: 1,
        powerStartTick: this.tick,
        powerStopTick: this.tick,
        pretty: {},
        remain: this.config.startRemain,
        tail: p,
      };
      this.snakes[index]=snake;
      this._$setBox(p, [B.SNAKE, {
        h:D.OTHER,
        s:index,
        t:D.OTHER_T,
      }]);
      this._$setRandom(seedrandom);
    },
    $direction(index, direction){
      if(D.isValidUserDirection(direction)){
        return;
      }
      const snake = this.snakes[index];
      const head = this.getBox(snake.head);

      if(box1[1].t == direction){
        return;
      }
      box1[1].h = data.d;
    },
    $tick(seed){
      const seedrandom = new xor128(seed, {state: true});
      const self = this;
      _.each(this.snakes,(snake, index) => {
        if(snake == null){
          return;
        }
        if(snake.powerStopAge <= self.tick && (self.tick|1)!=0){
          return;
        }

        const headP = snake.head;
        const headB = this.getBox(headP);
        const nextP = this._applyDirection(headP, headB[1].h)
        const nextB = this.getBox(nextP);
        switch(nextB[0]){
          case B.FOOD:
            snake.remain += nextB[1].q;
          case B.EMPTY:
            _$move(index);
            break;
          case B.BLOCK:
          case B.SNAKE:
            //TODO
            break;
        }
      });
      this._$setRandom(seedrandom);
    },
    _$move(index){
      const snake = this.snakes[index];
      {
        const headP = snake.head;
        const headB = this.getBox(headP);
        const newP = this._applyDirection(headP, headB[1].h)

        this._$setBox(newP, Box.generate.snake(
          index,
          headB[1].h,
          headB[1].h ^ D.OP_MASK,
        ));
        snake.head = newP;
      }

      if(snake.remain > 0){
        snake.remain--;
        snake.length++;
        return;
      }

      {
        const tailP = snake.tail;
        const tailB = this.getBox(tailP);
        const newP = this._applyDirection(tailP, tailB[1].h);

        this._$setBox(tailP,[ B.EMPTY, {}]);
        snake.tail = newP;
      }
    },
    _applyDirection({x,y}, direction){
      switch(direction){
        case D.NORTH: y-=1; break;
        case D.SOUTH: y+=1; break;
        case D.WEST: x-=1; break;
        case D.EAST: x+=1; break;
        default: break;
      }
      if(0<=x && x<this.width && 0<=y && y<this.height){
        return {x,y};
      }
      return null;
    },
    toPosition(i){
      return {
        x: i%this.width,
        y: (i/this.width)|0
      }
    },
    $$(command){
      const data = command[1];
      if(command[0] == "s"){
        if(data[0] == "tick"){
          this.$tick(data[1]);
        }
      }else{
        const index = command[0];
        if(!(0<=index && index<this.snakes.length)){
          return;
        }
        switch(data[0]){
          case "j":
            this.$join(index);break;
          case "d":
            this.$direction(index,data[1]);break;
        }
      }
    },
  },
  generate({width = 8, height = 8, snakeCount = 4, config = {}}){
    const length = width * height;
    const seedrandom = new xor128("", {state: true, entropy: true});
    const game = {
      config: {
        startRemain: 0,
      },
      grid: new Array(length),
      height,
      seed: seedrandom.state(),
      snakes: [],
      tick: 0,
      version: 1,
      width,
    };
    for(var i=0;i<length;i++){
      game.grid[i]=[B.EMPTY, {}];
    }

    function random32(){
      return (Math.random()*0x100000000)|0;
    }
    game.__proto__ = Game.proto;
    return game;
  },
};
var handlers = {
  tick(data,game){
    var json = game.json;
    json.snakes.forEach(function(snake){
      if(snake === undefined){
        return;
      }
      if(--snake.tick !== 0){
        return;
      }
      snake.tick = 1; //TODO
      var p1 = snake.head;
      var b1 = game.getBox(snake.head);
      if(b1[1].h == D.OTHER){
        return;
      }
      var p2 = H.applyDirection(p1,b1[1].h);
      var b2 = game.getBox(p2);
      switch(b2[0]){
      case B.FOOD:
        snake.remain += b2[1].q;
        game.setBox(p2,[ B.EMPTY, {} ])
      case B.EMPTY:
        game.setBox(p2,[ B.SNAKE, {
          h:b1[1].h,
          t:b1[1].h ^ D.OP_MASK,
          s:snake.index
        }])
        snake.head = p2;
        if(snake.remain > 0){
          snake.remain--;
          snake.length++;
          return;
        }
        p1 = snake.tail;
        b1 = game.getBox(p1);
        p2 = H.applyDirection(p1, b1[1].h);
        b2 = game.getBox(p2);
        snake.tail = p2;
        game.setBox(p1,[ B.EMPTY, {}]);
        break;
      case B.BLOCK:
      case B.SNAKE:
        destroySnake(game,snake);
        break;
      }
    })
  },
  join(data,game){
    var {x,y} = data;
    var box = game.getBox({x,y});
    var json = game.json;

    if(box[0] != B.EMPTY){
      throw "box taken";
    }
    var index = findNextEmpty(json.snakes);

    var snake={
      age: 0,
      index,
      head: {x,y},
      length: 1,
      name: data.name,
      remain: data.remain,
      tail: {x,y},
      tick: 1,
      pretty: data.pretty
    };
    game.setSnake(index,snake);

    json.snakes[snake.index]=snake;
    game.$setBox({x,y},[ B.SNAKE, {
      h:D.OTHER,
      s:snake.index,
      t:D.OTHER_T,
    }], listeners);
  },
  direction(data,game){
    var json = game.json;
    var snake = json.snakes[data.s];
    var box1 = game.getBox(snake.head);

    if(box1[1].t == data.d){
      throw "move oppo";
    }

    box1[1].h = data.d;
  },
  food(data,game){
    var b1 = game.getBox(data);
    if(b1[0] != B.EMPTY){
      throw "box taken";
    }
    game.setBox(data,[ B.FOOD, {
      q: data.q
    }]);
  },
  leave(data,game){
    var snake = game.json.snakes[data.s]
    if(snake == null){
      throw "snake not exist";
    }
    destroySnake(game,snake);
  }
}
function destroySnake(game,snake){
  var p1 = snake.head;
  var b1 = game.getBox(snake.head);
  while(b1[0] == B.SNAKE && b1[1].s == snake.index){
    game.setBox(p1,[ B.EMPTY,{}]);
    p1 = H.applyDirection(p1, b1[1].t);
    b1 = game.getBox(p1);
  }
  game.setSnake(snake.index,null);
}

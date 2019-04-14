const {D,B,H} = require('consts');
const {EventEmitter} = require('events');
const xor128 = require('seedrandom/lib/xor128');
const _ = require("underscore");
const blobToBuffer = require('blob_to_buffer')
module.exports = class Game extends EventEmitter{
  constructor(json){
    super();
    if(json.version != 1)
      throw "wrong version";
    this.json = json;
    const user2index = new Map();
    const random = xor128("", {state: json.seed});
    _.each(json.snakes, (snake, index) => {
      if(snake){
        user2index.set(snake.name, index);
      }
    });
    this.cache = {
      user2index,
      random,
      //TODO
      food: 0,
    };
  }
  tick(){
    const _this = this;
    var json = this.json;
    json.snakes.forEach(function(snake){
      if(snake === undefined){
        return;
      }
      if(--snake.tick !== 0){
        return;
      }
      snake.tick = 1; //TODO
      var p1 = snake.head;
      var b1 = _this.getBox(snake.head);
      if(b1[1].h == D.OTHER){
        return;
      }
      var p2 = H.applyDirection(p1,b1[1].h);
      var b2 = _this.getBox(p2);
      switch(b2[0]){
      case B.FOOD:
        snake.remain += b2[1].q;
        _this.setBox(p2,[ B.EMPTY, {} ])
        //TODO
        if(_this.cache.food>=0) {
          _this.setBox(_this.randomFreeLocation(), [ B.FOOD, {q: 1} ]);
        } else {
          _this.cache.food++;
        }
      case B.EMPTY:
        _this.setBox(p2,[ B.SNAKE, {
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
        b1 = _this.getBox(p1);
        p2 = H.applyDirection(p1, b1[1].h);
        b2 = _this.getBox(p2);
        snake.tail = p2;
        _this.setBox(p1,[ B.EMPTY, {}]);
        break;
      case B.BLOCK:
      case B.SNAKE:
        destroySnake(_this,snake);
        const {x, y} = _this.randomFreeLocation();
        _this.join({x, y, name: snake.name, remain: 3});
        break;
      }
    })
  }
  randomFreeLocation() {
    while(true) {
      const r = randomRange(this.cache.random, this.json.width * this.json.height);
      if(this.json.grid[r][0] == B.EMPTY) { return {x: r % this.json.width, y: (r/this.json.width)|0 } }
    }
  }
  setSeed(seed) {
    this.cache.random = xor128(seed, {state: true});
  }
  handleCommand2(cmd) {
    const c = cmd[cmd.command];
    switch(cmd.command) {
      case "tickCommand":
        if(c.randomSeed.length > 0){
          this.setSeed(c.randomSeed);
        }
        this.tick();
        break;
      case "idCommand":
        if(c.oldId == "" && c.newId != "") {
          const {x, y} = this.randomFreeLocation();
          this.join({x, y, name: c.newId, remain: 3});
        } else if (c.oldId != "" && c.newId == "") {
          var snake = this.json.snakes[this.cache.user2index.get(c.oldId)]
          if(snake == undefined){
            throw "snake not exist";
          }
          destroySnake(this,snake);
        } else {
          throw "unknown error";
        }
        break;
      case "writerCommand":
        const dir = c.command[0];
        if(dir >= 4) {
          throw "unknown dir";
        }
        var json = game.json;
        var snake = json.snakes[this.cache.user2index.get(c.id)];
        var box1 = game.getBox(snake.head);
        if(box1[1].t == dir){
          throw "move oppo";
        }

        box1[1].h = dir;
    }
  }

  handleCommands(cmds){
    cmds.forEach((cmd) => {
      try{
        handlers[cmd[0]](cmd[1],this);
      }catch(e){
        console.error("illegal command: "+JSON.stringify(cmd));
        console.error(e);
      }
    });
  }
  getBox({x,y}){
    var index = y*this.json.width+x;
    return this.json.grid[index];
  }
  getSnakeSize(){
    return this.cache.user2index.size;
  }
  setSnake(index,snake){
    const oldSnake = this.json.snakes[index];
    if(this.json.snakes[index] != undefined){
      this.cache.user2index.delete(oldSnake.name);
    }
    if(snake != undefined){
      this.cache.user2index.set(snake.name, index);
    }
    this.json.snakes[index]=snake;
  }
  join(data) {
    var {x,y} = data;
    var box = this.getBox({x,y});
    var json = this.json;

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
    this.setSnake(index,snake);

    this.setBox({x,y},[ B.SNAKE, {
      h:D.OTHER,
      s:snake.index,
      t:D.OTHER_T,
    }]);
    //TODO
    if(this.cache.food>=0) {
      this.setBox(this.randomFreeLocation(), [ B.FOOD, {q: 1} ]);
    } else {
      this.cache.food++;
    }
  }
  setBox({x,y},b2){
    var index = y*this.json.width+x;
    var b1 = this.json.grid[index];
    this.json.grid[index] = b2;
    this.emit("box",{x,y},b1,b2);
  }
};
var handlers = {
  tick(data,game){
    game.tick();
  },
  join(data,game){
    game.join(data);
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
    if(snake == undefined){
      throw "snake not exist";
    }
    destroySnake(game,snake);
  }
};
function findNextEmpty(list){
  var t=0;
  while(list[t] != undefined){
    t++;
  }
  return t;
};
function destroySnake(game,snake){
  var p1 = snake.head;
  var b1 = game.getBox(snake.head);
  while(b1[0] == B.SNAKE && b1[1].s == snake.index){
    game.setBox(p1,[ B.EMPTY,{}]);
    p1 = H.applyDirection(p1, b1[1].t);
    b1 = game.getBox(p1);
  }
  game.cache.food--;
  game.setSnake(snake.index,undefined);
}

function randomRange(rand, range) {
  const max = ((4294967296 / range) | 0) * range;
  while(true) {
    const next = rand.int32()+2147483648;
    if(next < max) { return next % range; }
  }
  
}

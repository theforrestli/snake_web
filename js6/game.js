var {D,B,H} = require('consts');
var Game;
module.exports = Game = {
  proto: {
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
    $join(index, listeners){
      // return (game, listeners){
      //   if(game.snakes[index] == null){
      //     return listeners.log(1, `the snake spot ${index} has been taken`)
      //   }
      //   const {x,y} = game._$nextFreeP();
      //   const box = game.getBox({x,y});

      //   var snake={
      //     age: 0,
      //     head: {x,y},
      //     length: 1,
      //     name: `Snake-${index}`,
      //     remain: game.config.remain,
      //     tail: {x,y},
      //     tick: 1,
      //     pretty: {},
      //   };
      //   game.snakes[index]=snake;
      //   game.setBox({x,y},[ B.SNAKE, {
      //     h:D.OTHER,
      //     s:snake.index,
      //     t:D.OTHER_T,
      //   }], listeners);
      // };
    },
    tick(game){
    },
  },
  generate({width = 100, height = 100, snakeCount = 10, config = {}}){
    const length = width * height;
    const game = {
      config: {},
      grid: new Array(length),
      height,
      seed: {
        x: random32(),
        y: random32(),
        z: random32(),
        w: random32(),
      },
      snakes: [],
      tick: 0,
      version: 1,
      width
    };

    function random32(){
      return (Math.random()*0x100000000)|0;
    }
    
    return game;
  }
}
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
function findNextEmpty(list){
  var t=0;
  while(list[t] != null){
    t++;
  }
  return t;
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

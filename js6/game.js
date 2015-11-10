var {D,B,H} = require('./consts');
var {EventEmitter} = require('events');
module.exports = class Game extends EventEmitter{
  constructor(json){
    super();
    if(json.version != 1)
      throw "wrong version";
    this.json = json;
    var nsnake = this.json.snakes
      .filter(x => x != null)
      .length;
    this.cache = {
      nsnake,
    };
  }
  handleCommands(cmds){
    cmds.forEach((cmd) => {
      try{
        handlers[cmd[0]](cmd[1],this);
      }catch(e){
        console.error(e);
      }
    });
  }
  getBox({x,y}){
    var index = y*this.json.width+x;
    return this.json.grid[index];
  }
  getSnakeSize(){
    return this.cache.nsnake;
  }
  setSnake(index,snake){
    if(this.json.snakes[index] != null){
      this.cache.nsnake--;
    }
    if(snake != null){
      this.cache.nsnake++;
    }
    this.json.snakes[index]=snake;
  }
  setBox({x,y},b2){
    var index = y*this.json.width+x;
    var b1 = this.json.grid[index];
    this.json.grid[index] = b2;
    this.emit("box",{x,y},b1,b2);
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
    game.setBox({x,y},[ B.SNAKE, {
      h:D.OTHER,
      s:snake.index,
      t:D.OTHER_T,
    }]);
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

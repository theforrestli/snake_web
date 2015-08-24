import {D,B,H} from './consts';
export default class Game {
  constructor(json){
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
        console.error(e.message);
      }
    });
  }
  getBox({x,y}){
    return this.json.grid[y*this.json.width+x];
  }
  getSnakeSize(){
    return this.cache.nsnake;
  }
  setSnake(snake){
    if(this.json.snakes[snake.index] != null){
      this.cache.nsnake--;
    }
    if(snake != null){
      this.cache.nsnake++;
    }
    this.json.snakes[snake.index]=snake;
  }
}
var handlers = {
  move(data,game){
    var json = game.json;
    var snake = json.snakes[data.s];
    var p1 = snake.head;
    var b1 = game.getBox(snake.head);
    if(b1[1].h == D.OTHER){
      return;
    }
    var p = applyDirection(snake.head,head.d.h);
    var box = game.getBox(p);
    switch(box.t){
    case B.FOOD:
      snake.remain += box.d.q;
      box.t = BT_EMPTY;
      box.d = {};
    case B.EMPTY:
      box.t = BT_SNAKE;
      box.d = {
        d:snake.d,
        s:snake.index
      };
      if(snake.remain > 0){
        snake.remain--;
      }else{
      }
      break;
    case B.BLOCK:
    case B.SNAKE:
      box = game.getBox(sanke);
      while(box.t == BT_SNAKE && box.d.s == snake.index){
        var {x,y} = applyDirection({x,y},box.d.d ^ D_OP_MASK);
        var b2 = game.getBox({x,y});
        box.t = BT_EMPTY;
        box.d = {};
        box = b2;
      }
      break;
    }
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
    }

    game.setSnake(snake);

    json.snakes[snake.index]=snake;
    box[0]=B.SNAKE;
    box[1]={
      h:D.OTHER,
      s:snake.index,
      t:D.OTHER_T,
    };
  },
  direction(data,game){
    var json = game.json;
    var snake = json.snakes[data.s];
    var box1 = game.getBox(snake.head);
    box1[1].h = data.d;
  }
}
function findNextEmpty(list){
  var t=0;
  while(list[t] != null){
    t++;
  }
  return t;
}


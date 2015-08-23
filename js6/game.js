import * as C from './consts.js';
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
  handleCommand(cmd){
    try{
      handlers[cmd[0]](cmd[1],this);
    }catch(e){
      console.error(e);
    }
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
    if(b1[1].h == D_OTHER){
      return;
    }
    var p = applyDirection(snake.head,head.d.h);
    var box = game.getBox(p);
    switch(box.t){
    case BT_FOOD:
      snake.remain += box.d.q;
      box.t = BT_EMPTY;
      box.d = {};
    case BT_EMPTY:
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
    case BT_BLOCK:
    case BT_SNAKE:
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

    if(box[0] != C.BT_EMPTY){
      throw "box taken";
    }
    var index = findNextEmpty(game.json.snakes);

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

    game.json.snakes[snake.index]=snake;
    box[0]=C.BT_SNAKE;
    box[1]={
      h:C.D_OTHER,
      s:snake.index,
      t:C.D_OTHER_T,
    };
  }
}
function findNextEmpty(list){

  console.log(list);
  var t=0;
  while(list[t] != null){
    t++;
  }
  return t;
}


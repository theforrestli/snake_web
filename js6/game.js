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
        console.error(e);
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
    var p2 = H.applyDirection(p1,b1[1].h);
    var b2 = game.getBox(p2);
    switch(b2[0]){
    case B.FOOD:
      snake.remain += b2[1].q;
      b2[0] = B.EMPTY;
      b2[1] = {};
    case B.EMPTY:
      b2[0] = B.SNAKE;
      b2[1] = {
        h:b1[1].h,
        t:b1[1].h ^ D.OP_MASK,
        s:snake.index
      };
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
      b1[0]=B.EMPTY;
      b1[1]={};
      break;
    case B.BLOCK:
    case B.SNAKE:
      while(b1[0] == B.SNAKE && b1[1].s == snake.index){
        p1 = H.applyDirection(p1, b1[1].t);
        var b2 = game.getBox(p1);
        b1[0] = B.EMPTY;
        b1[1] = {};
        b1 = b2;
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
      pretty: data.pretty
    };
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
    b1[0] = B.FOOD;
    b1[1] = {
      q: data.q
    };
  }
}
function findNextEmpty(list){
  var t=0;
  while(list[t] != null){
    t++;
  }
  return t;
}


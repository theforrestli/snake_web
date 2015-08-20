
class Game {
  constructor(json){
    if(json.version != 1){
      throw "wrong version";
    this.json=json;
  },
  handleCommand(cmd){
    handlers[cmd.c](cmd,this);
  }
}
var handlers={
  move(cmd,game){
    var json=game.json;
    var snake=json.snakes[cmd.s];
    var {x,y} = snake;
    switch(snake.d){
    case D_NORTH: y-=1; break;
    case D_SOUTH: y+=1; break;
    case D_WEST: x-=1; break;
    case D_EAST: x+=1; break;
    }
    var box=json.grid[y*json.width+x];
    switch(box.type){
    case BT_EMPTY:
      box.type=BT_SNAKE;
      box.data={
        s:snake.index,

      }
    }
  }
}


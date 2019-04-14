var {B} = require('consts');
var SVG = require('svg.js/svg');
//view listens game
export default class View{
  constructor(el,game){
    this.svg=SVG(el);
    this.main = this.svg.group();
    this.main.scale(10);
    this.game=game;
    this.grid = [];
    this.init();
    // this.symbols = [];
    // this.symbols[B.EMPTY] = this.svg.symbol()
    // this.symbols[B.SNAKE] = this.svg.symbol()
    $(window).on("resize", (e) => {
      this.svg.size(window.width(),window.height());
    })
    game.on('box',(p,b1,b2) => {
      this.setBox(p,b1,b2);
    });
  }
  init(){
    for(var t1 = 0;t1 < this.game.json.height;t1++){
      this.grid[t1] = [];
      for(var t2 = 0;t2 < this.game.json.width;t2++){
        var group = this.main.group();
        group.translate(t2,t1);
        this.grid[t1*this.game.json.width+t2] = group;
        this.setBox({x:t2, y:t1},undefined,this.game.json.grid[t1*this.game.json.width+t2]);
      }
    }
  }
  setBox(p,b1,b2){
    var vbox = this.grid[p.y*this.game.json.width+p.x];
    vbox.children().forEach((e) => e.remove())
    switch(b2[0]){
    case B.EMPTY:break;
    case B.SNAKE:
      var rect = vbox.rect(1,1);
      rect.fill({color:colors[b2[1].s]});
      break;
    case B.FOOD:
      var circle = vbox.circle(1);
      circle.fill({color:"#f00"});
      break;
    case B.BLOCK:
      var rect = vbox.rect(1,1);
      rect.fill({color:"#aaa"});
      break;
    }
  }
}

const colors = [
  "#000",
  "#00f",
  "#0f0",
  "#f442d9",
  "#db7f00",
  "#019ec1",
]

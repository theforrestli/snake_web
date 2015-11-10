var {B} = require('./consts');

module.exports = function(param){
  var size=param.width * param.height;
  var grid = [];
  for(var t=0;t<size;t++){
    grid[t]=[B.EMPTY,{}];
  }
  var game = {
    "version":1,
    "width": param.width,
    "height": param.height,
    "grid": grid,
    "snakes":[],
  };
  return {game};
}

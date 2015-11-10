var socket_io = require('socket.io');
var prefix = "/";
var gen = function(json,id){
  var io = socket_io(id);
  var game = new Game(json),
  io.on("connection",(socket) => {
    socket.emit("init", game.json);
    socket.on("reload",(message) =>{
      socket.emit("init", game.json);
    });
    socket.on("game", (message) => {
      io.emit("game", message);
    });
  });
  var tick = setInterval(game.tick,function(){
    io.emit("game",[["tick"]]);
  });

  return {
    io,
    game,
    tick
  }
}

var io = socket_io();

io.on("connection",(socket) => {
  console.log("connected");
  global.socket=socket;
  socket.on("test",(message) => {
    console.log(message);
    global.message = message;
  })
})

io.listen(3002);


var socket_io = require('socket.io');
var prefix = "/";
var gen = function(json,id){
  var io = socket_io(id);
  var game = new Game(json);
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
};
var message_valid = () => true;

var io = socket_io();

io.on("connection",(socket) => {
  console.log(`connected: ${socket.id}`);
  socket.join("default");
  global.socket=socket;
  socket.on("m",(m) => {
    console.log("m");
    console.log(m);
    if(!message_valid(m)){
      return;
    }
    socket.to("default").emit(m[0],[socket.id,m[1]])
  })
})

io.listen(3002);


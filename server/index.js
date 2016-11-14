var socket_io = require('socket.io');
var Game = require('../js6/game');
var prefix = "/";
var gen = function(json){
  var io = socket_io();
  var game = new Game(json);
  const socketIdHash = {};
  const gameIdHash = {};
  io.on("connection",(socket) => {
    socketIdHash[socket.id] = {};
    socket.on("join",(id) =>{
      socketData = socketIdHash[socket.id];
      if(socketData.gameId === undefined && gameIdHash[id] === undefined){
        socketData.gameId = id;
        gameIdHash[id] = { socketId: socket.id };
      }
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
  };
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


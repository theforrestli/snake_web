var socket_io = require('socket.io');
var _ = require("underscore");
var prefix = "/";

var io = socket_io();
var idMap = new Map();
var initData = {
  data: {},
  command_on_leave: ["l"],
  random_length: 128,
  name: "",
};
createNamespace(io);
function createNamespace(nsp){
  var history = [];
  nsp.on("connection",(socket) => {
    console.log(`connected: ${socket.id}`);
    socket.join("default");
    global.socket=socket;
    setupDebugger(nsp, socket);
    function setupDebugger(nsp, socket){
      socket.on("test",(m, cb) => {
        console.log("test", m);
        if(m>1){
          cb(-m);
        }
        // socket.to("default").emit("test", {
        //   "socket_id": socket.id,
        //   "socket": socket,
        //   "data": m
        // });
      });
      socket.on("connect", (data) => {
        console.log("nooo");
        console.log("NEVER: connected!", socket);
      });
      socket.on("reconnect", (data) => {
        console.log("nooo");
        console.log("NEVER: reconnected", socket);
      });
    }
    socket.on("s", (ids) => {
      const index = _.findIndex(ids, (id) => {
        return ValidateId(id) && !idMap.has(id);
      });
      if(index === -1){
        return socket.emit("s", socket.user_id);
      }else{
        if(socket.user_id !== undefined){
          leave();
        }
        const id = ids[index];
        join(id);
        return socket.emit("s", socket.user_id);
      }
      function ValidateId(id){
        return _.isString(id) && id.length < 256;
      }
    });
    socket.on("b", (data) => {
      console.log("b",data);
      broadcast(data);
    });
    socket.on('disconnecting', (data) => {
      console.log("disconnecting");
      console.log(data);
      console.log(typeof data);
    });
    socket.on("disconnect", (data) => {
      leave();
      console.log("disconnect", data);
      console.log(data);
      console.log(typeof data);
    });
    socket.on("g", (data) => {
    });
    function broadcast(data){
      const command = [socket.user_id, data];
      history.push(command);
      nsp.to("all", command);
    }
    function join(id){
      idMap.set(id,socket);
      socket.user_id = id;
      socket.join("all");
    }
    function leave(){
      broadcast(initData.command_on_leave);
      idMap.delete(socket.user_id);
      delete socket.user_id;
      socket.leave("all");
    }
  });
}


io.listen(3002);
console.log("finished loading");


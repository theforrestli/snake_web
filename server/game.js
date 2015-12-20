const _ = require("underscore");
var opt = {
  name: "test",
  game: {},
  random_key_length: 128,
  period: 500,
}
function generate(nsp, state){
  return self = {
    getId(socket, ids, ecb){
      const oldId = state.mapS2U[socket.id];
      if(!_.isArray(ids)){
        ecb("input need to be an array of valid ids");
        return oldId;
      }
      const id = _.chain(ids)
        .filter(self.validateId)
        .without(..._.keys(state.mapU2S))
        .value()[0];
      if(id === undefined){
        ecb("all id candidates are taken, or invalid");
        return oldId;
      }
      if(id === oldId){
        ecb("the first valid id is the same as the old id");
        return oldId;
      }
      return id;
    },
    validateId(id){
      return _.isString(id) && id.length < 256;
    },
    onJoin(socket, ids){
      const oldId = state.mapS2U[socket.id];
      const id = self.getId(socket, ids, (message) => {
        socket.emit("join", {old: oldId, new: oldId, error: message});
      });
      self.setId(socket, id);
      socket.emit("join", {old: oldId, new: id});
    },
    setId(socket, id){
      const oldId = state.mapS2U[socket.id];
      if(oldId !== undefined){
        self.broadcast("s", ["l",oldId]);
        socket.leave("all");
        delete state.mapU2S[oldId];
        delete state.mapS2U[socket.id];
      }
      if(id !== undefined){
        socket.join("all");
        self.broadcast("s", ["j",id]);
        state.mapS2U[socket.id]=id;
        state.mapU2S[id]=socket.id;
      }
    },
    broadcast(id, data){
      const command = [id, data]
      state.history.push(command);
      nsp.to("all").emit("b", command);
    },
  };
}



function createNamespace(io, opt){
  const nsp = io.of(opt.name);
  const state = {
    history: [],
    mapU2S: {s: ''},
    mapS2U: {'': "s"},
  }
  const methods = generate(nsp, state);
  nsp.on("connection",(socket) => {
    setupDebugger(nsp, socket);
    function setupDebugger(nsp, socket){
      socket.on("test",(m) => {
        console.log("test", m);
        socket.to("default").emit("test", {
          "socket_id": socket.id,
          "socket": socket,
          "data": m
        });
      });
      socket.on("debug", (cb) => {
        cb(state);
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

    socket.on("join", (ids) => {
      methods.onJoin(socket, ids);
    });
    socket.on("b", (data) => {
      const id = state.mapS2U[socket.id];
      if(id === undefined){
        return socket.emit("err", {
          event: "b",
          message: "does not have id yet",
        });
      }
      methods.broadcast(id, data);
    });
    socket.on("disconnect", (data) => {
      methods.setId(socket, undefined);
      console.log("disconnect", socket.id, data);
    });
  });
  return nsp;
}
module.exports = {
  createNamespace,
  generate,
}



var {Game} = require('game');
var RawCommand = {
  server_id: 's',
  server: {
    join: {//join
      // generate: (id, socketId) => [Command.SERVER_ID, [Command.server.join.key, [id, socketId]]],
      key: 'j',
      apply(reject, {0: id, 1: socketId}){
        if(id < 0 || ((id|0) !== id)){
          reject("id is not valid");
        }
        return function(game, listener){
          game.createSnake$(id, listener);
        }
      }
    },
    l: {//leave
      // generate: (id) => [Command.SERVER_ID, [Command.special_keys.LEAVE, id]],
      key: 'l',
      apply(reject, {0: id, 1: socketId}){
        return function(game, listener){
          game.removeSnake$(id, listener);
        }
      }
    },
    r: {
      // generate: (seed) => [Command.SERVER_ID, ['r', ':seed']]
      key: 'r',
      apply(game, listeners){
      }
    },
    t: {
      // generate: (age) => [Command.SERVER_ID, ['t', :age]]
      key: 't',
      apply(game, listeners){
      }
    }
  },
  game: {
    time: {
      key: 't',
      apply(reject, from, data){
        if(from != server_id){
          return reject("time command can only be sent from server");
        }
      }
    },
    join: {
      key: 'j',
      apply(reject, from, data){
      }
    }
    boost: {
      key: 'b',
      apply(data){
      }
    },
    chat: {
      key: 'c',
      apply(data){
      }
    },
    direction: {
      key: 'd',
      apply(data){
      }
    }
  }
}

exports.modules = function(C){
  function toMap(o){
    const values = _.values(o);
    return _.object(_.pluck(values,'key'),_.pluck(values, 'apply'));
  }
  const server = toMap(C.server);
  const game = toMap(C.game);
  return (reject, command) => {
    if(command[0] == C.server_id){
      return server[command[1]](reject, command[1][1]);
    }else{
      return game[command[1]](reject, command[0],command[1][1]);
    }
  }
}(RawCommand);


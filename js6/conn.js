
const {D,B,H} = require('consts');

const View = require('view');
const Game = require('game');
const map = require('map');
const blobToBuffer = require('blob_to_buffer')
const protobuf = require("protobufjs");
//TODO
const CommandsP = $.get("https://raw.githubusercontent.com/lijiaqigreat/personal_server/master/protobuf/command.proto").then(protoFile => {
  return protobuf.parse(protoFile).root.lookup("Commands");
});

const keyMap = {
  ArrowRight: D.EAST,
  ArrowDown: D.SOUTH,
  ArrowLeft: D.WEST,
  ArrowUp: D.NORTH
}

module.exports = function(id, url){
  var param = {
    width: 20,
    height: 20,
    version: 1,
  }
  const ws = new WebSocket(url);
  ws.onopen = async () => {
    const game = new Game(map(param).game);
    window.game = game;
    const Commands = await CommandsP;
    var inited = 0;
    var debugi = 0;
    ws.onmessage = (event) => {
      new Promise((resolve, reject) => {
        blobToBuffer(event.data, resolve);
      }).then(buffer => {
        const cs = Commands.decode(buffer).commands;
        const time1 = new Date();
        for(var t=0;t<cs.length;t++){
          try {
          game.handleCommand2(cs[t]);
          } catch(err) {console.err(err);}
        }
        const time2 = new Date();
        if(inited != "initialized") {
          clearTimeout(inited);
          inited = setTimeout(() => {
            inited = "initialized";
            console.log("init view");
            const view = new View($("#main")[0],game);
            window.view = view;
            $("body").on("keydown", (e) => {
              const dir = keyMap[e.key];
              if(dir != undefined) {
                ws.send(new Uint8Array([dir]));
              }
            });
          }, 100);
        }
      });
    }

  };
  return ws;
}

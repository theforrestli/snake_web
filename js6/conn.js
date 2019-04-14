
const {D,B,H} = require('consts');

const View = require('view');
const Game = require('game');
const map = require('map');
const blobToBuffer = require('blob_to_buffer')
const protobuf = require("protobufjs");
//TODO
const CommandP = $.get("https://raw.githubusercontent.com/lijiaqigreat/personal_server/master/protobuf/command.proto").then(protoFile => {
  return protobuf.parse(protoFile).root.lookup("Command");
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
  // setInterval(() => {console.log("tick")}, 500);
  ws.onopen = async () => {
    const game = new Game(map(param).game);
    const Command = await CommandP;
    var inited = 0;
    ws.onmessage = (event) => {
      new Promise((resolve, reject) => {
        blobToBuffer(event.data, resolve);
      }).then(buffer => {
        const c = Command.decode(buffer);
        // console.log("c");
        game.handleCommand2(c);
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
    //TODO
    window.game = game;

  };
  return ws;
}

// var math = require('./test');
// window.pubsub = require('../vendor/pubsub.js')
// console.log("2π = " + math.sum(math.pi, math.pi));
// var a = require('./test2');
var tmpp = require('test');
const View = require('view');
const Game = require('game');
const map = require('map');
const conn = require('conn');
window._ = require('underscore');
window.protobuf = require("protobufjs");
window.xor128 = require('seedrandom/lib/xor128');
// window.blobToBuffer = require("blob-to-buffer");

$('#button').on('click', () => {
  conn($('#name').value(), $('#url').value());
});
var param = {
  width: 20,
  height: 20,
  version: 1,
}
var game = new Game(map(param).game);
var view = new View($("#main")[0],game);
var {D,B,H} = require('./consts.js');
window.cmds = {
  "j222":[
    "join",
    {
      "name": "j22",
      "remain":2,
      "x":2,
      "y":2,
    }
  ],
  "j242":[
    "join",
    {
      "name": "j24",
      "remain":2,
      "x":2,
      "y":4,
    }
  ],
  "d0E":[
    "direction",
    {
      s:0,
      d:D.EAST,
    }
  ],
  "d0W":[
    "direction",
    {
      s:0,
      d:D.WEST,
    }
  ],
  "d0S":[
    "direction",
    {
      s:0,
      d:D.SOUTH,
    }
  ],
  "t0":[
    "tick",
    {}
  ],
  "f242":[
    "food",{
      x: 2,
      y: 4,
      q: 2
    }
  ],
  "l0":[
    "leave",{
      s:0
    }
  ],
  "l1":[
    "leave",{
      s:1
    }
  ]
}

window.game = game;
window.view = view;
window.conn = conn;


// import Game from './game';
// import map from './map';
// window.View = View;
// window.Game = Game;

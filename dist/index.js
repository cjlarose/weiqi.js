'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _game = require('./lib/game');

exports.default = {
  createGame: _game.createGame,
  isOver: _game.isOver,
  play: _game.play,
  pass: _game.pass,
  areaScore: _game.areaScore
};
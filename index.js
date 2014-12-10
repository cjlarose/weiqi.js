var Game = require('./lib/game');
var Board = require('./lib/board');
var Constants = require('./lib/constants');

module.exports = {
  Game: Game,
  Board: Board,
  EMPTY: Constants.EMPTY,
  BLACK: Constants.BLACK,
  WHITE: Constants.WHITE
};

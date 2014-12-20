var createGame = require('./lib/game').createGame;
var createBoard = require('./lib/board').createBoard;
var Constants = require('./lib/constants');

module.exports = {
  createGame: createGame,
  createBoard: createBoard,
  EMPTY: Constants.EMPTY,
  BLACK: Constants.BLACK,
  WHITE: Constants.WHITE
};

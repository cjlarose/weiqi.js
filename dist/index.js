"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var createGame = require("./lib/game").createGame;
var createBoard = require("./lib/board").createBoard;
var Constants = _interopRequire(require("./lib/constants"));

module.exports = {
  createGame: createGame,
  createBoard: createBoard,
  EMPTY: Constants.EMPTY,
  BLACK: Constants.BLACK,
  WHITE: Constants.WHITE
};
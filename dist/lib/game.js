"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.createGame = createGame;
var mori = _interopRequire(require("mori"));

var createBoard = require("./board").createBoard;
var Constants = _interopRequire(require("./constants"));

function createGame(boardSize, values) {
  var currentColor, consectutivePasses, history, board;

  if (typeof values !== "undefined") {
    currentColor = values.currentColor;
    consectutivePasses = values.consectutivePasses;
    history = values.history;
    board = values.board;
  } else {
    currentColor = Constants.BLACK;
    consectutivePasses = 0;
    board = createBoard(boardSize);
    history = mori.set(board.getIntersections());
  }

  function opponentColor(color) {
    return color == Constants.BLACK ? Constants.WHITE : Constants.BLACK;
  }

  function inHistory(otherBoard) {
    return mori.hasKey(history, otherBoard.getIntersections());
  }

  var Game = {
    isOver: function () {
      return consectutivePasses >= 2;
    },

    getCurrentPlayer: function () {
      return currentColor;
    },

    getBoard: function () {
      return board;
    },

    play: function (player, coords) {
      if (this.isOver()) throw "Game is already over";

      if (player != currentColor) throw "Not player's turn";

      var newBoard = board.play(currentColor, coords);
      if (inHistory(newBoard)) throw "Violation of Ko";

      return createGame(boardSize, {
        currentColor: opponentColor(currentColor),
        consectutivePasses: 0,
        board: newBoard,
        history: mori.conj(history, newBoard.getIntersections())
      });
    },

    pass: function (player) {
      if (this.isOver()) throw "Game is already over";

      if (player != currentColor) throw "Not player's turn";

      return createGame(boardSize, {
        currentColor: opponentColor(currentColor),
        consectutivePasses: consectutivePasses + 1,
        board: board,
        history: history
      });
    },

    /*
     * Returns Black - White
     */
    areaScore: function (komi) {
      if (typeof komi === "undefined") komi = 0;

      var boardScore = board.areaScore();
      return boardScore[Constants.BLACK] - (boardScore[Constants.WHITE] + komi);
    }

  };

  return Object.create(Game);
}
Object.defineProperty(exports, "__esModule", {
  value: true
});
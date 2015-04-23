"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.createGame = createGame;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var Immutable = _interopRequire(require("immutable"));

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
    history = Immutable.Set([board.stones]);
  }

  function opponentColor(color) {
    return color == Constants.BLACK ? Constants.WHITE : Constants.BLACK;
  }

  function inHistory(otherBoard) {
    return history.has(otherBoard.stones);
  }

  var Game = {
    isOver: function isOver() {
      return consectutivePasses >= 2;
    },

    getCurrentPlayer: function getCurrentPlayer() {
      return currentColor;
    },

    getBoard: function getBoard() {
      return board;
    },

    play: function play(player, coords) {
      if (this.isOver()) throw "Game is already over";

      if (player != currentColor) throw "Not player's turn";

      var newBoard = board.play(currentColor, coords);
      if (inHistory(newBoard)) throw "Violation of Ko";

      return createGame(boardSize, {
        currentColor: opponentColor(currentColor),
        consectutivePasses: 0,
        board: newBoard,
        history: history.add(newBoard.stones)
      });
    },

    pass: function pass(player) {
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
    areaScore: function areaScore(komi) {
      if (typeof komi === "undefined") komi = 0;

      var boardScore = board.areaScore();
      return boardScore[Constants.BLACK] - (boardScore[Constants.WHITE] + komi);
    }

  };

  return Object.create(Game);
}
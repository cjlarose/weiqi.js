"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

exports.createGame = createGame;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var Immutable = _interopRequire(require("immutable"));

var createBoard = require("./board").createBoard;

var opponentColor = require("./util").opponentColor;

var Constants = _interopRequire(require("./constants"));

var Game = (function () {
  function Game(boardSize, values) {
    _classCallCheck(this, Game);

    if (typeof values !== "undefined") {
      this.currentColor = values.currentColor;
      this.consectutivePasses = values.consectutivePasses;
      this.history = values.history;
      this.board = values.board;
    } else {
      this.currentColor = Constants.BLACK;
      this.consectutivePasses = 0;
      this.board = createBoard(boardSize);
      this.history = Immutable.Set([this.board.stones]);
    }
  }

  _createClass(Game, {
    isOver: {
      value: function isOver() {
        return this.consectutivePasses >= 2;
      }
    },
    getCurrentPlayer: {
      value: function getCurrentPlayer() {
        return this.currentColor;
      }
    },
    getBoard: {
      value: function getBoard() {
        return this.board;
      }
    },
    play: {
      value: function play(player, coords) {
        var _this = this;

        var inHistory = function (otherBoard) {
          return _this.history.has(otherBoard.stones);
        };

        if (this.isOver()) throw "Game is already over";

        if (player != this.currentColor) throw "Not player's turn";

        var newBoard = this.board.play(this.currentColor, coords);
        if (inHistory(newBoard)) throw "Violation of Ko";

        return createGame(this.boardSize, {
          currentColor: opponentColor(this.currentColor),
          consectutivePasses: 0,
          board: newBoard,
          history: this.history.add(newBoard.stones)
        });
      }
    },
    pass: {
      value: function pass(player) {
        if (this.isOver()) throw "Game is already over";

        if (player != this.currentColor) throw "Not player's turn";

        return createGame(this.boardSize, {
          currentColor: opponentColor(this.currentColor),
          consectutivePasses: this.consectutivePasses + 1,
          board: this.board,
          history: this.history
        });
      }
    },
    areaScore: {

      /*
       * Returns Black - White
       */

      value: function areaScore(komi) {
        if (typeof komi === "undefined") komi = 0;

        var boardScore = this.board.areaScore();
        return boardScore[Constants.BLACK] - (boardScore[Constants.WHITE] + komi);
      }
    }
  });

  return Game;
})();

function createGame(boardSize, values) {
  return new Game(boardSize, values);
}
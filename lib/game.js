var mori = require('mori');
var Board = require('./board');
var Constants = require('./constants');

function createGame(boardSize) {
  var currentColor = Constants.BLACK;
  var consectutivePasses = 0;
  var history = mori.set();
  var board;
  setBoard(Board.createBoard(boardSize));

  function switchPlayer() {
    currentColor =
      currentColor == Constants.BLACK ? Constants.WHITE : Constants.BLACK;
  }

  function setBoard(newBoard) {
    history = mori.conj(history, newBoard.getIntersections());
    board = newBoard;
  }

  function inHistory(otherBoard) {
    return mori.has_key(history, otherBoard.getIntersections());
  }

  var Game = {
    isOver: function() {
      return consectutivePasses >= 2;
    },

    getCurrentPlayer: function() {
      return currentColor;
    },

    getBoard: function() {
      return board;
    },

    play: function(player, coords) {
      if (this.isOver())
        throw "Game is already over";

      if (player != currentColor)
        throw "Not player's turn";

      var newBoard = board.play(currentColor, coords);
      if (inHistory(newBoard))
        throw "Violation of Ko";

      setBoard(newBoard);
      consectutivePasses = 0;
      switchPlayer();

      return this;
    },

    pass: function(player) {
      if (this.isOver())
        throw "Game is already over";

      if (player != currentColor)
        throw "Not player's turn";

      consectutivePasses++;
      switchPlayer();

      return this;
    }

  };

  return Object.create(Game);
}


module.exports = {
  createGame: createGame
};

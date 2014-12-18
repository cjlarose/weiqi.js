var Board = require('./board');
var Constants = require('./constants');

var Game = {
  isOver: function() {
    return this._consectutivePasses >= 2;
  },

  getCurrentPlayer: function() {
    return this._currentColor;
  },

  getBoard: function() {
    return this._board;
  },

  play: function(player, coords) {
    if (this.isOver())
      throw "Game is already over";

    if (player != this._currentColor)
      throw "Not player's turn";

    this._board.play(this._currentColor, coords);
    this._consectutivePasses = 0;
    this._switchPlayer();

    return this;
  },

  /*
   * At any point in the game, a player can pass and let his opponent play
   */
  pass: function(player) {
    if (this.isOver())
      throw "Game is already over";

    if (player != this._currentColor)
      throw "Not player's turn";

    this._consectutivePasses++;
    this._switchPlayer();

    return this;
  },

  /*
   * Switches the current player
   */
  _switchPlayer: function() {
    this._currentColor =
      this._currentColor == Constants.BLACK ? Constants.WHITE : Constants.BLACK;
  }

};

function createGame(boardSize) {
  var game = Object.create(Game);
  game._board = Board.createBoard(boardSize);
  game._currentColor = Constants.BLACK;
  game._consectutivePasses = 0;
  return game;
}


module.exports = {
  createGame: createGame
};

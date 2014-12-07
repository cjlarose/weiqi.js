var Board = require('./board');

var GamePrototype = {
  isOver: function() {
    return this._consectutivePasses >= 2;
  },

  getCurrentPlayer: function() {
    return this._currentColor;
  },

  play: function(player, i, j) {
    if (player != this._currentColor)
      throw "Not player's turn";

    if (this.isOver())
      throw "Game is already over";

    this._board.play(this._currentColor, i, j);
    this._consectutivePasses = 0;
    this._switchPlayer();
  },

  /*
   * At any point in the game, a player can pass and let his opponent play
   */
  pass: function(player) {
    if (player != this._currentColor)
      throw "Not player's turn";

    if (this.isOver())
      throw "Game is already over";

    this._consectutivePasses++;
    this._switchPlayer();
  },

  /*
   * Switches the current player
   */
  _switchPlayer: function() {
    this._currentColor =
      this._currentColor == Board.BLACK ? Board.WHITE : Board.BLACK;
  }

};

function createGame(boardSize) {
  var game = Object.create(GamePrototype);
  game._board = Board.createBoard(boardSize);
  game._currentColor = Board.BLACK;
  game._consectutivePasses = 0;
  return game;
}


module.exports = {
  createGame: createGame
};

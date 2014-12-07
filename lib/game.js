var Board = require('./board');

var GamePrototype = {
  isOver: function() {
    return this._consectutivePasses >= 2;
  },

  /*
   * At any point in the game, a player can pass and let his opponent play
   */
  pass: function() {
    this._consectutivePasses++;
    this._switchPlayer();
  },

  play: function(i, j) {
    try {
      this._inAtari = this._board.play(this._currentColor, i, j);
      this._lastMovePassed = false;
      this._switchPlayer();
    } catch (e) {

    }
  },

  /*
   * Switches the current player
   */
  switchPlayer: function() {
    this._currentColor =
      this._currentColor == Board.BLACK ? Board.WHITE : Board.BLACK;
  }

};

function createGame(boardSize) {
  var game = Object.create(GamePrototype);
  game._board = Board.createBoard(boardSize);
  game._currentColor = Board.BLACK;
  game._consectutivePasses = 0;
  game._inAtari = false;
  return game;
}


module.exports = {
  createGame: createGame
};

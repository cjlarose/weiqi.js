var assert = require('assert');
var Weiqi = require('../dist/index.js').default;

function playMoves(initialGame, moves) {
  return moves.reduce(function(game, move) {
    if (move[1]) {
      return Weiqi.play(game, move[0], move[1]);
    }
    return Weiqi.pass(game, move[0]);
  }, initialGame);
}

describe("Game", function() {
  describe('#createGame', function() {
    it('started with black player', function() {
      var game = Weiqi.createGame(9);
      assert.equal('black', game.get('currentPlayer'));
      assert.equal(false, Weiqi.isOver(game));
    });
  });

  describe('#pass', function() {
    it('ends the game with two consectutive passes', function() {
      var game = Weiqi.pass(Weiqi.createGame(9), 'black')

      assert.equal('white', game.get('currentPlayer'));

      game = Weiqi.pass(game, 'white');
      assert(Weiqi.isOver(game));

      var fn = function() { Weiqi.pass(game, 'black'); };
      assert.throws(fn, /Game is already over/);
    });

    it('forbids play of same player twice', function() {
      var game = Weiqi.pass(Weiqi.createGame(9), 'black');
      assert.equal('white', game.get('currentPlayer'));

      var fn = function() { Weiqi.pass(game, 'black'); };
      assert.throws(fn, /Not player's turn/);
    });
  });

  describe("#play", function() {
    it('forbids play on completed game', function() {
      var game = Weiqi.pass(Weiqi.pass(Weiqi.createGame(9), 'black'), 'white');
      assert(Weiqi.isOver(game));

      var fn = function() { Weiqi.play(game, 'black', [0, 0]); }
      assert.throws(fn, /Game is already over/);
    });

    it('forbids play of same player twice', function() {
      var game = Weiqi.play(Weiqi.createGame(9), 'black', [0, 0]);
      assert.equal('white', game.get('currentPlayer'));

      var fn = function() { Weiqi.play(game, 'black', [0, 0]); }
      assert.throws(fn, /Not player's turn/);
    });

    it('forbids simple ko', function() {
      var moves = [
        ['black', [0, 1]],
        ['white', [0, 2]],
        ['black', [1, 2]],
        ['white', [1, 3]],
        ['black', [2, 1]],
        ['white', [2, 2]],
        ['black', [1, 0]],
        ['white', [1, 1]],
      ];
      var game = playMoves(Weiqi.createGame(4), moves);
      var fn = function() { Weiqi.play(game, 'black', [1, 2]); }
      assert.throws(fn, /Violation of Ko/);
    });

    it('forbids complex ko', function() {
      // Example from http://senseis.xmp.net/?Superko
      // setup
      var moves = [
        ['black', [0, 3]],
        ['white', [1, 0]],
        ['black', [1, 1]],
        ['white', null],
        ['black', [1, 2]],
        ['white', null],
        ['black', [1, 3]],
      ];
      var game = playMoves(Weiqi.createGame(4), moves);

      // white plays, putting board into valid state
      // black captures
      moves = [
        ['white', [0, 1]],
        ['black', null],
        ['white', [0, 2]],
        ['black', [0, 0]],
      ];
      game = playMoves(game, moves);

      // white cannot retake
      var fn = function() { Weiqi.play(game, 'white', [0, 1]); }
      assert.throws(fn, /Violation of Ko/);
    });
  });

  describe('#areaScore', function() {
    var moves = [
      ['black', [0, 1]],
      ['white', [0, 2]],
      ['black', [1, 0]],
      ['white', [1, 2]],
      ['black', [1, 1]],
      ['white', [2, 0]],
      ['black', null],
      ['white', [2, 1]],
    ];
    var game = playMoves(Weiqi.createGame(4), moves);

    it('returns the difference between black and white\'s scores', function() {
      assert.equal(4 - 12, Weiqi.areaScore(game, 0));
    });

    it('defaults to komi of 0', function() {
      assert.equal(4 - 12, Weiqi.areaScore(game));
    });

    it('adds komi to white\'s score', function() {
      assert.equal(4 - (12 + 0.5), Weiqi.areaScore(game, 0.5));
    });
  });
});

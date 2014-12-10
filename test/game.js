var should = require('chai').should();
var expect = require('chai').expect;
var Game = require('../index.js').Game;
var Board = require('../index.js').Board;

describe("Game", function() {
  describe('#createGame', function() {
    it('started with black player', function() {
      var game = Game.createGame(9);
      game.getCurrentPlayer().should.equal(Board.BLACK);
      game.isOver().should.equal(false);
    });
  });

  describe('#pass', function() {
    it('ends the game with two consectutive passes', function() {
      var game = Game.createGame(9);
      game.pass(Board.BLACK);
      game.getCurrentPlayer().should.equal(Board.WHITE);
      game.pass(Board.WHITE);
      game.isOver().should.equal(true);

      var fn = function() {game.pass(Board.BLACK);};
      expect(fn).to.throw("Game is already over");
    });

    it('forbids play of same player twice', function() {
      var game = Game.createGame(9);
      game.pass(Board.BLACK);
      game.getCurrentPlayer().should.equal(Board.WHITE);

      var fn = function() {game.pass(Board.BLACK);};
      expect(fn).to.throw("Not player's turn");
    });
  });

  describe("#play", function() {
    it('forbids play on completed game', function() {
      var game = Game.createGame(9);
      game.pass(Board.BLACK);
      game.pass(Board.WHITE);
      game.isOver().should.equal(true);

      var fn = function() {game.play(Board.BLACK, [0, 0]);};
      expect(fn).to.throw("Game is already over");
    });

    it('forbids play of same player twice', function() {
      var game = Game.createGame(9);
      game.play(Board.BLACK, [0, 0]);
      game.getCurrentPlayer().should.equal(Board.WHITE);

      var fn = function() {game.play(Board.BLACK, [0, 0]);};
      expect(fn).to.throw("Not player's turn");
    });
  });
});

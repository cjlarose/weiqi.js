var should = require('chai').should();
var expect = require('chai').expect;
var Weiqi = require('../index.js');
var Game = Weiqi.Game;

describe("Game", function() {
  describe('#createGame', function() {
    it('started with black player', function() {
      var game = Game.createGame(9);
      game.getCurrentPlayer().should.equal(Weiqi.BLACK);
      game.isOver().should.equal(false);
    });
  });

  describe('#pass', function() {
    it('ends the game with two consectutive passes', function() {
      var game = Game.createGame(9);
      game.pass(Weiqi.BLACK);
      game.getCurrentPlayer().should.equal(Weiqi.WHITE);
      game.pass(Weiqi.WHITE);
      game.isOver().should.equal(true);

      var fn = function() {game.pass(Weiqi.BLACK);};
      expect(fn).to.throw("Game is already over");
    });

    it('forbids play of same player twice', function() {
      var game = Game.createGame(9);
      game.pass(Weiqi.BLACK);
      game.getCurrentPlayer().should.equal(Weiqi.WHITE);

      var fn = function() {game.pass(Weiqi.BLACK);};
      expect(fn).to.throw("Not player's turn");
    });
  });

  describe("#play", function() {
    it('forbids play on completed game', function() {
      var game = Game.createGame(9);
      game.pass(Weiqi.BLACK);
      game.pass(Weiqi.WHITE);
      game.isOver().should.equal(true);

      var fn = function() {game.play(Weiqi.BLACK, [0, 0]);};
      expect(fn).to.throw("Game is already over");
    });

    it('forbids play of same player twice', function() {
      var game = Game.createGame(9);
      game.play(Weiqi.BLACK, [0, 0]);
      game.getCurrentPlayer().should.equal(Weiqi.WHITE);

      var fn = function() {game.play(Weiqi.BLACK, [0, 0]);};
      expect(fn).to.throw("Not player's turn");
    });
  });
});

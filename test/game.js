var should = require('chai').should();
var expect = require('chai').expect;
var Weiqi = require('../index.js');

describe("Game", function() {
  describe('#createGame', function() {
    it('started with black player', function() {
      var game = Weiqi.createGame(9);
      game.getCurrentPlayer().should.equal(Weiqi.BLACK);
      game.isOver().should.equal(false);
    });
  });

  describe('#pass', function() {
    it('ends the game with two consectutive passes', function() {
      var game = Weiqi.createGame(9)
        .pass(Weiqi.BLACK);

      game.getCurrentPlayer().should.equal(Weiqi.WHITE);

      game = game.pass(Weiqi.WHITE);
      game.isOver().should.equal(true);

      var fn = function() {game.pass(Weiqi.BLACK);};
      expect(fn).to.throw("Game is already over");
    });

    it('forbids play of same player twice', function() {
      var game = Weiqi.createGame(9).pass(Weiqi.BLACK);
      game.getCurrentPlayer().should.equal(Weiqi.WHITE);

      var fn = function() {game.pass(Weiqi.BLACK);};
      expect(fn).to.throw("Not player's turn");
    });
  });

  describe("#play", function() {
    it('forbids play on completed game', function() {
      var game = Weiqi.createGame(9)
        .pass(Weiqi.BLACK)
        .pass(Weiqi.WHITE);
      game.isOver().should.equal(true);

      var fn = function() {game.play(Weiqi.BLACK, [0, 0]);};
      expect(fn).to.throw("Game is already over");
    });

    it('forbids play of same player twice', function() {
      var game = Weiqi.createGame(9)
        .play(Weiqi.BLACK, [0, 0]);
      game.getCurrentPlayer().should.equal(Weiqi.WHITE);

      var fn = function() {game.play(Weiqi.BLACK, [0, 0]);};
      expect(fn).to.throw("Not player's turn");
    });

    it('forbids simple ko', function() {
      var game = Weiqi.createGame(4)
                   .play(Weiqi.BLACK, [0, 1])
                   .play(Weiqi.WHITE, [0, 2])
                   .play(Weiqi.BLACK, [1, 2])
                   .play(Weiqi.WHITE, [1, 3])
                   .play(Weiqi.BLACK, [2, 1])
                   .play(Weiqi.WHITE, [2, 2])
                   .play(Weiqi.BLACK, [1, 0])
                   .play(Weiqi.WHITE, [1, 1]);
      var fn = function() {game.play(Weiqi.BLACK, [1, 2]);};
      expect(fn).to.throw("Violation of Ko");
    });

    it('forbids complex ko', function() {
      // Example from http://senseis.xmp.net/?Superko
      // setup
      var game = Weiqi.createGame(4)
                   .play(Weiqi.BLACK, [0, 3])
                   .play(Weiqi.WHITE, [1, 0])
                   .play(Weiqi.BLACK, [1, 1])
                   .pass(Weiqi.WHITE)
                   .play(Weiqi.BLACK, [1, 2])
                   .pass(Weiqi.WHITE)
                   .play(Weiqi.BLACK, [1, 3]);

      // white plays, putting board into valid state
      // black captures
      game = game.play(Weiqi.WHITE, [0, 1])
               .pass(Weiqi.BLACK)
               .play(Weiqi.WHITE, [0, 2])
               .play(Weiqi.BLACK, [0, 0]);

      // white cannot retake
      var fn = function() {game.play(Weiqi.WHITE, [0, 1]);};
      expect(fn).to.throw("Violation of Ko");
    });
  });

  describe('#areaSore', function() {
    it('returns the difference between black and white\'s scores', function() {
      var game = Weiqi.createGame(4)
                   .play(Weiqi.BLACK, [0, 1])
                   .play(Weiqi.WHITE, [0, 2])
                   .play(Weiqi.BLACK, [1, 0])
                   .play(Weiqi.WHITE, [1, 2])
                   .play(Weiqi.BLACK, [1, 1])
                   .play(Weiqi.WHITE, [2, 0])
                   .pass(Weiqi.BLACK)
                   .play(Weiqi.WHITE, [2, 1]);
      game.areaScore(0).should.equal(4 - 12);
    });

    it('defaults to komi of 0', function() {
      var game = Weiqi.createGame(4)
                   .play(Weiqi.BLACK, [0, 1])
                   .play(Weiqi.WHITE, [0, 2])
                   .play(Weiqi.BLACK, [1, 0])
                   .play(Weiqi.WHITE, [1, 2])
                   .play(Weiqi.BLACK, [1, 1])
                   .play(Weiqi.WHITE, [2, 0])
                   .pass(Weiqi.BLACK)
                   .play(Weiqi.WHITE, [2, 1]);
      game.areaScore().should.equal(4 - 12);
    });

    it('adds komi to white\'s score', function() {
      var game = Weiqi.createGame(4)
                   .play(Weiqi.BLACK, [0, 1])
                   .play(Weiqi.WHITE, [0, 2])
                   .play(Weiqi.BLACK, [1, 0])
                   .play(Weiqi.WHITE, [1, 2])
                   .play(Weiqi.BLACK, [1, 1])
                   .play(Weiqi.WHITE, [2, 0])
                   .pass(Weiqi.BLACK)
                   .play(Weiqi.WHITE, [2, 1]);
      game.areaScore(0.5).should.equal(4 - (12 + 0.5));
    });
  });
});

var should = require('chai').should();
var expect = require('chai').expect;
var Weiqi = require('../index.js');
var Board = Weiqi.Board;

// shorthand for testing whole board
Object.prototype.looksLike = function(rows) {
  var expected = [];
  rows.forEach(function(str) {
    expected.push(str.split(''));
  });
  return this.toArray().should.deep.equal(expected);
};

describe("Board", function() {
  describe('#createBoard', function() {
    it('creates a board of size 9', function() {
      var board = Board.createBoard(9);
      board.getSize().should.equal(9);
    });

    it('creates a board of size 13', function() {
      var board = Board.createBoard(13);
      board.getSize().should.equal(13);
    });

    it('creates a board of size 19', function() {
      var board = Board.createBoard(19);
      board.getSize().should.equal(19);
    });

    it('should start off empty', function() {
      var board = Board.createBoard(9);
      var i, j;
      for (i = 0; i < 9; i++)
        for (j = 0; j < 9; j++)
          board.getStone([i, j]).should.equal(Weiqi.EMPTY);
    });
  });

  describe('#play', function() {
    it('should allow inner coords', function() {
      var i, j, board;
      var board = Board.createBoard(9);
      for (i = 0; i < 9; i++)
        for (j = 0; j < 9; j++) {
          board
            .play(Weiqi.BLACK, [i, j])
           .getStone([i, j]).should.equal(Weiqi.BLACK);
        }
    });

    it('should reject out of bounds coords', function() {
      var positions = [[-1, 0], [0, -1], [-1, -1], [9, 0], [0, 9], [9, 9]];
      positions.forEach(function(position) {
        var fn = function() {
          return Board.createBoard(9).play(Weiqi.BLACK, positions);
        };
        expect(fn).to.throw("Intersection out of bounds");
      });
    });

    it('should reject occupied intersections', function() {
      var fn = function() {
        Board.createBoard(9)
          .play(Weiqi.BLACK, [0, 0])
          .play(Weiqi.WHITE, [0, 0]);
      };
      expect(fn).to.throw("Intersection occupied by existing stone");
    });

    it('should set the correct stone color', function() {
      Board.createBoard(4)
        .play(Weiqi.BLACK, [0, 0])
        .looksLike(['x...', '....', '....', '....']);

      Board.createBoard(4)
        .play(Weiqi.WHITE, [3, 2])
        .looksLike(['....', '....', '....', '..o.']);
    });

    it('should capture stones in the corner', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 0])
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      board.looksLike(['xx..', 'x...', '....', '....']);

      board = board
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [1, 1]);

      board.looksLike(['xxo.', 'xo..', '....', '....']);

      board = board.play(Weiqi.WHITE, [2, 0]);
      board.looksLike(['..o.', '.o..', 'o...', '....']);
    });

    it('should capture stones on the side', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [1, 3])
                    .play(Weiqi.BLACK, [1, 2]);

      board.looksLike(['....', '..xx', '....', '....']);

      board = board
        .play(Weiqi.WHITE, [1, 1])
        .play(Weiqi.WHITE, [0, 3])
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [2, 3]);

      board.looksLike(['..oo', '.oxx', '...o', '....']);
      board = board.play(Weiqi.WHITE, [2, 2]);
      board.looksLike(['..oo', '.o..', '..oo', '....']);
    });

    it('should capture stones in the middle', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [1, 1])
                    .play(Weiqi.BLACK, [1, 2]);

      board.looksLike(['....', '.xx.', '....', '....']);

      board = board
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [1, 0])
        .play(Weiqi.WHITE, [1, 3])
        .play(Weiqi.WHITE, [2, 1])
        .play(Weiqi.WHITE, [2, 2]);

      board.looksLike(['..o.', 'oxxo', '.oo.', '....']);
      board = board.play(Weiqi.WHITE, [0, 1]);
      board.looksLike(['.oo.', 'o..o', '.oo.', '....']);
    });

    it('should allow suicide of one stone', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [1, 2])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      board.looksLike(['.x..', 'x.x.', '.x..', '....']);
      board = board.play(Weiqi.WHITE, [1, 1]);
      board.looksLike(['.x..', 'x.x.', '.x..', '....']);
    });

    it('should allow suicide of many stones', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [0, 2])
                    .play(Weiqi.BLACK, [1, 3])
                    .play(Weiqi.BLACK, [2, 2])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      board.looksLike(['.xx.', 'x..x', '.xx.', '....']);
      board = board.play(Weiqi.WHITE, [1, 1]);
      board.looksLike(['.xx.', 'xo.x', '.xx.', '....']);
      board = board.play(Weiqi.WHITE, [1, 2]);
      board.looksLike(['.xx.', 'x..x', '.xx.', '....']);
    });

    it('should evaluate enemy liberties before player liberties', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.WHITE, [0, 2])
                    .play(Weiqi.BLACK, [1, 2])
                    .play(Weiqi.WHITE, [1, 3])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.WHITE, [2, 2])
                    .play(Weiqi.BLACK, [1, 0]);
      board.looksLike(['.xo.', 'x.xo', '.xo.', '....']);
      board = board.play(Weiqi.WHITE, [1, 1]);
      board.looksLike(['.xo.', 'xo.o', '.xo.', '....']);
    });
  });
});

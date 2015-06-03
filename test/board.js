var assert = require('assert');
var Immutable = require('immutable');
var Weiqi = require('../dist/index.js');

const assertEqualBoards = function(expectedRows, board) {
  var rows = expectedRows.map(function(str) {
    return Immutable.List(str.split(''));
  });
  var expected = Immutable.List(rows);
  var actual = board.getIntersections();
  var message = expected.toString() +
                "\nis not equal to\n" +
                actual.toString();
  assert(Immutable.is(expected, actual), message);
}

describe("Board", function() {
  describe('#createBoard', function() {
    it('creates a board of size 9', function() {
      var board = Weiqi.createBoard(9);
      assert.equal(9, board.getSize());
    });

    it('creates a board of size 13', function() {
      var board = Weiqi.createBoard(13);
      assert.equal(13, board.getSize());
    });

    it('creates a board of size 19', function() {
      var board = Weiqi.createBoard(19);
      assert.equal(19, board.getSize());
    });

    it('should start off empty', function() {
      var board = Weiqi.createBoard(9);
      for (var i = 0; i < 9; i++)
        for (var j = 0; j < 9; j++)
          assert.equal(Weiqi.EMPTY, board.getStone([i, j]));
    });

    it('requires a size', function() {
      var fn = function() { Weiqi.createBoard(); };
      assert.throws(fn, /^Size must be an integer greater than zero$/);
    });

    it('rejects negative size', function() {
      var fn = function() { Weiqi.createBoard(-9); };
      assert.throws(fn, /^Size must be an integer greater than zero$/);
    });
  });

  describe('#play', function() {
    it('should allow inner coords', function() {
      var board = Weiqi.createBoard(9);
      for (var i = 0; i < 9; i++)
        for (var j = 0; j < 9; j++) {
          var stone = board.play(Weiqi.BLACK, [i, j]).getStone([i, j]);
          assert.equal(Weiqi.BLACK, stone);
        }
    });

    it('should reject out of bounds coords', function() {
      var positions = [[-1, 0], [0, -1], [-1, -1], [9, 0], [0, 9], [9, 9]];
      positions.forEach(function(position) {
        var fn = function() {
          return Weiqi.createBoard(9).play(Weiqi.BLACK, positions);
        };
        assert.throws(fn, /^Intersection out of bounds$/);
      });
    });

    it('should reject occupied intersections', function() {
      var fn = function() {
        Weiqi.createBoard(9)
          .play(Weiqi.BLACK, [0, 0])
          .play(Weiqi.WHITE, [0, 0]);
      };
      assert.throws(fn, /^Intersection occupied by existing stone$/);
    });

    it('should set the correct stone color', function() {
      assertEqualBoards(['x...', '....', '....', '....'],
                        Weiqi.createBoard(4).play(Weiqi.BLACK, [0, 0]));

      assertEqualBoards(['....', '....', '....', '..o.'],
                        Weiqi.createBoard(4).play(Weiqi.WHITE, [3, 2]));
    });

    it('should capture stones in the corner', function() {
      var board = Weiqi.createBoard(4)
                    .play(Weiqi.BLACK, [0, 0])
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      assertEqualBoards(['xx..', 'x...', '....', '....'], board);

      board = board
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [1, 1]);

      assertEqualBoards(['xxo.', 'xo..', '....', '....'], board);

      board = board.play(Weiqi.WHITE, [2, 0]);
      assertEqualBoards(['..o.', '.o..', 'o...', '....'], board);
    });

    it('should capture stones on the side', function() {
      var board = Weiqi.createBoard(4)
                    .play(Weiqi.BLACK, [1, 3])
                    .play(Weiqi.BLACK, [1, 2]);

      assertEqualBoards(['....', '..xx', '....', '....'], board);

      board = board
        .play(Weiqi.WHITE, [1, 1])
        .play(Weiqi.WHITE, [0, 3])
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [2, 3]);

      assertEqualBoards(['..oo', '.oxx', '...o', '....'], board);
      board = board.play(Weiqi.WHITE, [2, 2]);
      assertEqualBoards(['..oo', '.o..', '..oo', '....'], board);
    });

    it('should capture stones in the middle', function() {
      var board = Weiqi.createBoard(4)
                    .play(Weiqi.BLACK, [1, 1])
                    .play(Weiqi.BLACK, [1, 2]);

      assertEqualBoards(['....', '.xx.', '....', '....'], board);

      board = board
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [1, 0])
        .play(Weiqi.WHITE, [1, 3])
        .play(Weiqi.WHITE, [2, 1])
        .play(Weiqi.WHITE, [2, 2]);

      assertEqualBoards(['..o.', 'oxxo', '.oo.', '....'], board);
      board = board.play(Weiqi.WHITE, [0, 1]);
      assertEqualBoards(['.oo.', 'o..o', '.oo.', '....'], board);
    });

    it('should allow suicide of one stone', function() {
      var board = Weiqi.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [1, 2])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      assertEqualBoards(['.x..', 'x.x.', '.x..', '....'], board);
      board = board.play(Weiqi.WHITE, [1, 1]);
      assertEqualBoards(['.x..', 'x.x.', '.x..', '....'], board);
    });

    it('should allow suicide of many stones', function() {
      var board = Weiqi.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [0, 2])
                    .play(Weiqi.BLACK, [1, 3])
                    .play(Weiqi.BLACK, [2, 2])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      assertEqualBoards(['.xx.', 'x..x', '.xx.', '....'], board);
      board = board.play(Weiqi.WHITE, [1, 1]);
      assertEqualBoards(['.xx.', 'xo.x', '.xx.', '....'], board);
      board = board.play(Weiqi.WHITE, [1, 2]);
      assertEqualBoards(['.xx.', 'x..x', '.xx.', '....'], board);
    });

    it('should evaluate enemy liberties before player liberties', function() {
      var board = Weiqi.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.WHITE, [0, 2])
                    .play(Weiqi.BLACK, [1, 2])
                    .play(Weiqi.WHITE, [1, 3])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.WHITE, [2, 2])
                    .play(Weiqi.BLACK, [1, 0]);
      assertEqualBoards(['.xo.', 'x.xo', '.xo.', '....'], board);
      board = board.play(Weiqi.WHITE, [1, 1]);
      assertEqualBoards(['.xo.', 'xo.o', '.xo.', '....'], board);
    });
  });

  describe('#areaScore', function() {
    it('should not award points for empty board', function() {
      var board = Weiqi.createBoard(4);
      assertEqualBoards(['....', '....', '....', '....'], board);
      var score = board.areaScore();
      assert.equal(0, score[Weiqi.BLACK]);
      assert.equal(0, score[Weiqi.WHITE]);
    });

    it('should award points for board with single stone', function() {
      var board = Weiqi.createBoard(4)
                    .play(Weiqi.BLACK, [0, 0]);
      assertEqualBoards(['x...', '....', '....', '....'], board);
      var score = board.areaScore();
      assert.equal(16, score[Weiqi.BLACK]);
      assert.equal(0, score[Weiqi.WHITE]);
    });

    it('should not award points for sparse board', function() {
      var board = Weiqi.createBoard(4)
                    .play(Weiqi.BLACK, [1, 1])
                    .play(Weiqi.WHITE, [2, 2]);
      assertEqualBoards(['....', '.x..', '..o.', '....'], board);
      var score = board.areaScore();
      assert.equal(1, score[Weiqi.BLACK]);
      assert.equal(1, score[Weiqi.WHITE]);
    });

    it('should count stones and territory', function() {
      var board = Weiqi.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [1, 1])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.BLACK, [3, 1])
                    .play(Weiqi.WHITE, [0, 2])
                    .play(Weiqi.WHITE, [1, 2])
                    .play(Weiqi.WHITE, [2, 2])
                    .play(Weiqi.WHITE, [3, 2]);
      assertEqualBoards(['.xo.', '.xo.', '.xo.', '.xo.'], board);
      var score = board.areaScore();
      assert.equal(8, score[Weiqi.BLACK]);
      assert.equal(8, score[Weiqi.WHITE]);
    });

    it('should consider all stones alive', function() {
      var board = Weiqi.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [1, 1])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.BLACK, [3, 1])
                    .play(Weiqi.WHITE, [0, 2])
                    .play(Weiqi.WHITE, [1, 2])
                    .play(Weiqi.WHITE, [2, 2])
                    .play(Weiqi.WHITE, [3, 2])
                    .play(Weiqi.BLACK, [2, 3])
                    .play(Weiqi.BLACK, [3, 3]);
      assertEqualBoards(['.xo.', '.xo.', '.xox', '.xox'], board);
      var score = board.areaScore();
      assert.equal(10, score[Weiqi.BLACK]);
      assert.equal(4, score[Weiqi.WHITE]);
    });
  });
});

var assert = require('assert');
var Immutable = require('immutable');
var Weiqi = require('../dist/index.js').default;
var Board = require('../dist/lib/board.js');
var Records = require('../dist/lib/records.js');

const assertEqualBoards = function(expectedRows, board) {
  var rows = expectedRows.map(function(str) {
    return Immutable.List(str.split(''));
  });
  var expected = Immutable.List(rows);
  var actual = Immutable.fromJS(Board.toArray(board));
  var message = expected.toString() +
                "\nis not equal to\n" +
                actual.toString();
  assert(Immutable.is(expected, actual), message);
}

describe("Board", function() {
  describe('#createBoard', function() {
    it('creates a board of size 9', function() {
      var board = Board.createBoard(9);
      assert.equal(9, board.get('size'));
    });

    it('creates a board of size 13', function() {
      var board = Board.createBoard(13);
      assert.equal(13, board.get('size'));
    });

    it('creates a board of size 19', function() {
      var board = Board.createBoard(19);
      assert.equal(19, board.get('size'));
    });

    it('should start off empty', function() {
      var board = Board.createBoard(9);
      for (var i = 0; i < 9; i++)
        for (var j = 0; j < 9; j++) {
          var position = new Records.Position({ i: i, j: j });
          assert.strictEqual(undefined, board.get('stones').get(position));
        }
    });

    it('requires a size', function() {
      var fn = function() { Board.createBoard(); };
      assert.throws(fn, /Size must be an integer greater than zero/);
    });

    it('rejects negative size', function() {
      var fn = function() { Board.createBoard(-9); };
      assert.throws(fn, /Size must be an integer greater than zero/);
    });
  });

  describe('#placeStone', function() {
    it('should allow inner coords', function() {
      var board = Board.createBoard(9);
      for (var i = 0; i < 9; i++)
        for (var j = 0; j < 9; j++) {
          var position = new Records.Position({ i: i, j: j });
          var move = new Records.Move({ position: position, stoneColor: 'black' });
          var stone = Board.placeStone(board, move).get('stones').get(position);
          assert.equal('black', stone);
        }
    });

    it('should reject out of bounds coords', function() {
      var coords = [[-1, 0], [0, -1], [-1, -1], [9, 0], [0, 9], [9, 9]];
      coords.forEach(function(coord) {
        var fn = function() {
          var position = new Records.Position({ i: coord[0], j: coord[1] });
          var move = new Records.Move({ position: position, stoneColor: 'black' });
          return Board.placeStone(Board.createBoard(9), move);
        };
        assert.throws(fn, /Intersection out of bounds/);
      });
    });

    it('should reject occupied intersections', function() {
      var fn = function() {
        var zero = new Records.Position({ i: 0, j: 0 });
        var blackMove = new Records.Move({ stoneColor: 'black', position: zero });
        var whiteMove = new Records.Move({ stoneColor: 'white', position: zero });
        Board.placeStone(Board.placeStone(Board.createBoard(9), blackMove), whiteMove);
      };
      assert.throws(fn, /Intersection occupied by existing stone/);
    });

    it('should set the correct stone color', function() {
      assertEqualBoards(['x...', '....', '....', '....'],
                        Board.placeStone(Board.createBoard(4), new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 0, j: 0 }) })));

      assertEqualBoards(['....', '....', '....', '..o.'],
                        Board.placeStone(Board.createBoard(4), new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 3, j: 2 }) })));
    });

    it('should capture stones in the corner', function() {
      var moves = [
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 0, j: 0 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 0, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 0 }) }),
      ];
      var board = moves.reduce(Board.placeStone, Board.createBoard(4));
      assertEqualBoards(['xx..', 'x...', '....', '....'], board);

      moves = [
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 0, j: 2 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 1 }) }),
      ];
      board = moves.reduce(Board.placeStone, board);
      assertEqualBoards(['xxo.', 'xo..', '....', '....'], board);

      board = Board.placeStone(board, new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 2, j: 0 }) }));
      assertEqualBoards(['..o.', '.o..', 'o...', '....'], board);
    });

    it('should capture stones on the side', function() {
      var moves = [
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 3 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 2 }) }),
      ];
      var board = moves.reduce(Board.placeStone, Board.createBoard(4));
      assertEqualBoards(['....', '..xx', '....', '....'], board);

      moves = [
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 1 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 0, j: 3 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 0, j: 2 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 2, j: 3 }) }),
      ];
      board = moves.reduce(Board.placeStone, board);
      assertEqualBoards(['..oo', '.oxx', '...o', '....'], board);

      moves = [
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 2, j: 2 }) }),
      ];
      board = moves.reduce(Board.placeStone, board);
      assertEqualBoards(['..oo', '.o..', '..oo', '....'], board);
    });

    it('should capture stones in the middle', function() {
      var moves = [
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 2 }) }),
      ];
      var board = moves.reduce(Board.placeStone, Board.createBoard(4));
      assertEqualBoards(['....', '.xx.', '....', '....'], board);

      moves = [
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 0, j: 2 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 0 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 3 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 2, j: 1 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 2, j: 2 }) }),
      ];
      board = moves.reduce(Board.placeStone, board);
      assertEqualBoards(['..o.', 'oxxo', '.oo.', '....'], board);

      moves = [
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 0, j: 1 }) }),
      ];
      board = moves.reduce(Board.placeStone, board);
      assertEqualBoards(['.oo.', 'o..o', '.oo.', '....'], board);
    });

    it('should allow suicide of one stone', function() {
      var moves = [
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 0, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 2 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 2, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 0 }) }),
      ];
      var board = moves.reduce(Board.placeStone, Board.createBoard(4));
      assertEqualBoards(['.x..', 'x.x.', '.x..', '....'], board);

      moves = [
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 1 }) }),
      ];
      board = moves.reduce(function(b, m) { return Board.placeStone(b, m, true); }, board);
      assertEqualBoards(['.x..', 'x.x.', '.x..', '....'], board);
    });

    it('should allow suicide of many stones', function() {
      var moves = [
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 0, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 0, j: 2 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 3 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 2, j: 2 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 2, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 0 }) }),
      ];
      var board = moves.reduce(Board.placeStone, Board.createBoard(4));
      assertEqualBoards(['.xx.', 'x..x', '.xx.', '....'], board);

      moves = [
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 1 }) }),
      ];
      board = moves.reduce(Board.placeStone, board);
      assertEqualBoards(['.xx.', 'xo.x', '.xx.', '....'], board);

      moves = [
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 2 }) }),
      ];
      board = moves.reduce(function(b, m) { return Board.placeStone(b, m, true); }, board);
      assertEqualBoards(['.xx.', 'x..x', '.xx.', '....'], board);
    });

    it('should evaluate enemy liberties before player liberties', function() {
      var moves = [
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 0, j: 1 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 0, j: 2 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 2 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 3 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 2, j: 1 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 2, j: 2 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 0 }) }),
      ];

      var board = moves.reduce(Board.placeStone, Board.createBoard(4));
      assertEqualBoards(['.xo.', 'x.xo', '.xo.', '....'], board);

      moves = [
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 1 }) }),
      ];
      board = moves.reduce(Board.placeStone, board);
      assertEqualBoards(['.xo.', 'xo.o', '.xo.', '....'], board);
    });
  });

  describe('#areaScore', function() {
    it('should not award points for empty board', function() {
      var board = Board.createBoard(4);
      assertEqualBoards(['....', '....', '....', '....'], board);
      var score = Board.areaScore(board);
      assert.equal(0, score['black']);
      assert.equal(0, score['white']);
    });

    it('should award points for board with single stone', function() {
      var move = new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 0, j: 0 }) });
      var board = Board.placeStone(Board.createBoard(4), move);
      assertEqualBoards(['x...', '....', '....', '....'], board);
      var score = Board.areaScore(board);
      assert.equal(16, score['black']);
      assert.equal(0, score['white']);
    });

    it('should not award points for sparse board', function() {
      var moves = [
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 1 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 2, j: 2 }) }),
      ];
      var board = moves.reduce(Board.placeStone, Board.createBoard(4));
      assertEqualBoards(['....', '.x..', '..o.', '....'], board);

      var score = Board.areaScore(board);
      assert.equal(1, score['black']);
      assert.equal(1, score['white']);
    });

    it('should count stones and territory', function() {
      var moves = [
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 0, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 2, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 3, j: 1 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 0, j: 2 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 2 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 2, j: 2 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 3, j: 2 }) }),
      ];
      var board = moves.reduce(Board.placeStone, Board.createBoard(4));
      assertEqualBoards(['.xo.', '.xo.', '.xo.', '.xo.'], board);

      var score = Board.areaScore(board);
      assert.equal(8, score['black']);
      assert.equal(8, score['white']);
    });

    it('should consider all stones alive', function() {
      var moves = [
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 0, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 1, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 2, j: 1 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 3, j: 1 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 0, j: 2 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 1, j: 2 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 2, j: 2 }) }),
        new Records.Move({ stoneColor: 'white', position: new Records.Position({ i: 3, j: 2 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 2, j: 3 }) }),
        new Records.Move({ stoneColor: 'black', position: new Records.Position({ i: 3, j: 3 }) }),
      ];
      var board = moves.reduce(Board.placeStone, Board.createBoard(4));
      assertEqualBoards(['.xo.', '.xo.', '.xox', '.xox'], board);

      var score = Board.areaScore(board);
      assert.equal(10, score['black']);
      assert.equal(4, score['white']);
    });
  });
});

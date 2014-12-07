var should = require('chai').should();
var expect = require('chai').expect;
var Board = require('../index.js').Board;

describe('#createBoard', function() {
  it('creates a board of size 9', function() {
    var board = Board.createBoard(9);
    board.size.should.equal(9);
  });

  it('creates a board of size 13', function() {
    var board = Board.createBoard(13);
    board.size.should.equal(13);
  });

  it('creates a board of size 19', function() {
    var board = Board.createBoard(19);
    board.size.should.equal(19);
  });
});

describe('#inBounds', function() {
  it('should accept inner bounds', function() {
    var board = Board.createBoard(9);
    var i, j;
    for (i = 0; i < 9; i++) {
      for (j = 0; j < 9; j++) {
        board.inBounds(i, j).should.equal(true);
      }
    }
  });

  it('should reject negative coords', function() {
    Board.createBoard(9).inBounds(-1, 0).should.equal(false);
    Board.createBoard(9).inBounds(0, -1).should.equal(false);
    Board.createBoard(9).inBounds(-1, -1).should.equal(false);
  });


  it('should reject high coords', function() {
    Board.createBoard(9).inBounds(9, 0).should.equal(false);
    Board.createBoard(9).inBounds(0, 9).should.equal(false);
    Board.createBoard(9).inBounds(9, 9).should.equal(false);
  });
});

describe('#play', function() {
  it('should reject out of bounds coords', function() {
    var fn = function() {
      return Board.createBoard(9).play(Board.BLACK, -1, -1);
    };
    expect(fn).to.throw("Intersection out of bounds");
  });

  it('should reject occupied intersections', function() {
    var fn = function() {
      Board.createBoard(9)
        .play(Board.BLACK, 0, 0)
        .play(Board.WHITE, 0, 0);
    };
    expect(fn).to.throw("Intersection occupied by existing stone");
  });

  it('should set the correct stone color', function() {
    Board.createBoard(9)
      .play(Board.BLACK, 0, 0)
      .getStone(0, 0).should.equal(Board.BLACK);

    Board.createBoard(9)
      .play(Board.WHITE, 4, 2)
      .getStone(4, 2).should.equal(Board.WHITE);
  });
});

var should = require('chai').should();
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

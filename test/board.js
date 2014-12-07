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

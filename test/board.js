var should = require('chai').should();
var expect = require('chai').expect;
var Weiqi = require('../index.js');
var Board = Weiqi.Board;

describe("Board", function() {
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

    it('should start off empty', function() {
      var board = Board.createBoard(9);
      var i, j;
      for (i = 0; i < 9; i++)
        for (j = 0; j < 9; j++)
          board.getStone([i, j]).should.equal(Weiqi.EMPTY);
    });
  });

  describe('#inBounds', function() {
    it('should accept inner bounds', function() {
      var board = Board.createBoard(9);
      var i, j;
      for (i = 0; i < 9; i++)
        for (j = 0; j < 9; j++)
          board.inBounds([i, j]).should.equal(true);
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
        return Board.createBoard(9).play(Weiqi.BLACK, [-1, -1]);
      };
      expect(fn).to.throw("Intersection out of bounds");
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
        .toString().should.equal("x...\n....\n....\n....");

      Board.createBoard(4)
        .play(Weiqi.WHITE, [3, 2])
        .toString().should.equal("....\n....\n....\n..o.");
    });

    it('should capture stones in the corner', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 0])
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      board.toString().should.equal("xx..\nx...\n....\n....");

      board
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [1, 1]);

      board.toString().should.equal("xxo.\nxo..\n....\n....");

      board
        .play(Weiqi.WHITE, [2, 0]);

      board.toString().should.equal("..o.\n.o..\no...\n....");
    });

    it('should capture stones on the side', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [1, 3])
                    .play(Weiqi.BLACK, [1, 2]);

      board.toString().should.equal("....\n..xx\n....\n....");

      board
        .play(Weiqi.WHITE, [1, 1])
        .play(Weiqi.WHITE, [0, 3])
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [2, 3]);

      board.toString().should.equal("..oo\n.oxx\n...o\n....");

      board
        .play(Weiqi.WHITE, [2, 2]);

      board.toString().should.equal("..oo\n.o..\n..oo\n....");
    });

    it('should capture stones in the middle', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [1, 1])
                    .play(Weiqi.BLACK, [1, 2]);

      board.toString().should.equal("....\n.xx.\n....\n....");

      board
        .play(Weiqi.WHITE, [0, 2])
        .play(Weiqi.WHITE, [1, 0])
        .play(Weiqi.WHITE, [1, 3])
        .play(Weiqi.WHITE, [2, 1])
        .play(Weiqi.WHITE, [2, 2]);

      board.toString().should.equal("..o.\noxxo\n.oo.\n....");

      board
        .play(Weiqi.WHITE, [0, 1]);

      board.toString().should.equal(".oo.\no..o\n.oo.\n....");
    });

    it('should allow suicide of one stone', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [1, 2])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      board.toString().should.equal(".x..\nx.x.\n.x..\n....");

      board.play(Weiqi.WHITE, [1, 1]);

      board.toString().should.equal(".x..\nx.x.\n.x..\n....");
    });

    it('should allow suicide of many stones', function() {
      var board = Board.createBoard(4)
                    .play(Weiqi.BLACK, [0, 1])
                    .play(Weiqi.BLACK, [0, 2])
                    .play(Weiqi.BLACK, [1, 3])
                    .play(Weiqi.BLACK, [2, 2])
                    .play(Weiqi.BLACK, [2, 1])
                    .play(Weiqi.BLACK, [1, 0]);

      board.toString().should.equal(".xx.\nx..x\n.xx.\n....");

      board.play(Weiqi.WHITE, [1, 1]);

      board.toString().should.equal(".xx.\nxo.x\n.xx.\n....");

      board.play(Weiqi.WHITE, [1, 2]);

      board.toString().should.equal(".xx.\nx..x\n.xx.\n....");
    });
  });
});

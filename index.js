var _ = require('lodash');

var Board = function(size) {
  this.current_color = Board.BLACK;
  this.size = size;
  this.board = this.createBoard(size);
  this.last_move_passed = false;
  this.in_atari = false;
  this.attempted_suicide = false;
};

/*
 * Constants for intersection states
 */
Board.EMPTY = "empty";
Board.BLACK = "black";
Board.WHITE = "white";

_.extend(Board.prototype, {

  /*
   * Returns a size x size matrix with all entries initialized to Board.EMPTY
   */
  createBoard: function(size) {
    var m = [];
    for (var i = 0; i < size; i++) {
      m[i] = [];
      for (var j = 0; j < size; j++)
        m[i][j] = Board.EMPTY;
    }
    return m;
  },

  /*
   * Switches the current player
   */
  switchPlayer: function() {
    this.current_color = 
      this.current_color == Board.BLACK ? Board.WHITE : Board.BLACK;
  },

  /*
   * At any point in the game, a player can pass and let his opponent play
   */
  pass: function() {
    if (this.last_move_passed)
      this.endGame();
    this.last_move_passed = true;
    this.switchPlayer();
  },

  /*
   * Called when the game ends (both players passed)
   */
  endGame: function() {
    console.log("GAME OVER");
  },

  /*
   * Attempt to place a stone at (i,j). Returns true iff the move was legal
   */
  play: function(i, j) {
    console.log("Played at " + i + ", " + j);   
    this.attempted_suicide = this.in_atari = false;

    if (this.board[i][j] != Board.EMPTY)
      return false;

    var color = this.board[i][j] = this.current_color;
    var captured = [];
    var neighbors = this.getAdjacentIntersections(i, j);
    var atari = false;

    var self = this;
    _.each(neighbors, function(n) {
      var state = self.board[n[0]][n[1]];
      if (state != Board.EMPTY && state != color) {
        var group = self.getGroup(n[0], n[1]);
        console.log(group);
        if (group["liberties"] == 0)
          captured.push(group);
        else if (group["liberties"] == 1)
          atari = true;
      }
    });

    // detect suicide
    if (_.isEmpty(captured) && this.getGroup(i, j)["liberties"] == 0) {
      this.board[i][j] = Board.EMPTY;
      this.attempted_suicide = true;
      return false;
    }

    var self = this;
    _.each(captured, function(group) {
      _.each(group["stones"], function(stone) {
        self.board[stone[0]][stone[1]] = Board.EMPTY;
      });
    });

    if (atari)
      this.in_atari = true;

    this.last_move_passed = false;
    this.switchPlayer();
    return true;
  },

  /*
   * Given a board position, returns a list of [i,j] coordinates representing
   * orthagonally adjacent intersections
   */
  getAdjacentIntersections: function(i , j) {
    var neighbors = []; 
    if (i > 0)
      neighbors.push([i - 1, j]);
    if (j < this.size - 1)
      neighbors.push([i, j + 1]);
    if (i < this.size - 1)
      neighbors.push([i + 1, j]);
    if (j > 0)
      neighbors.push([i, j - 1]);
    return neighbors;
  },

  /*
   * Performs a breadth-first search about an (i,j) position to find recursively
   * orthagonally adjacent stones of the same color (stones with which it shares
   * liberties). Returns null for if there is no stone at the specified position,
   * otherwise returns an object with two keys: "liberties", specifying the
   * number of liberties the group has, and "stones", the list of [i,j]
   * coordinates of the group's members.
   */
  getGroup: function(i, j) {

    var color = this.board[i][j];
    if (color == Board.EMPTY)
      return null;

    var visited = {}; // for O(1) lookups
    var visited_list = []; // for returning
    var queue = [[i, j]];
    var count = 0;

    while (queue.length > 0) {
      var stone = queue.pop();
      if (visited[stone])
        continue;

      var neighbors = this.getAdjacentIntersections(stone[0], stone[1]);
      var self = this;
      _.each(neighbors, function(n) {
        var state = self.board[n[0]][n[1]];
        if (state == Board.EMPTY)
          count++;
        if (state == color)
          queue.push([n[0], n[1]]);
      });

      visited[stone] = true;
      visited_list.push(stone);
    }

    return {
      "liberties": count,
      "stones": visited_list
    };
  }
});

module.exports = Board;

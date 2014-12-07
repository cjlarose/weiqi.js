var _ = require('lodash');

/*
 * Constants for intersection states
 */
var EMPTY = "empty";
var BLACK = "black";
var WHITE = "white";

/*
 * Returns a size x size matrix with all entries initialized to EMPTY
 */
function createIntersections(size) {
  var m = [];
  for (var i = 0; i < size; i++) {
    m[i] = [];
    for (var j = 0; j < size; j++)
      m[i][j] = EMPTY;
  }
  return m;
};


var BoardPrototype = {

  inBounds: function(i, j) {
    return i >= 0 && i < this.size && j >= 0 && j < this.size;
  },

  getStone: function(i, j) {
    return this.intersections[i][j];
  },

  /*
   * Attempt to place a stone at (i,j).
   */
  play: function(playerColor, i, j) {
    if (!this.inBounds(i, j))
      throw "Intersection out of bounds";

    if (this.intersections[i][j] != EMPTY)
      throw "Intersection occupied by existing stone";

    var color = this.intersections[i][j] = playerColor;
    var captured = [];
    var neighbors = this.getAdjacentIntersections(i, j);

    var self = this;
    _.each(neighbors, function(n) {
      var state = self.getStone(n[0], n[1]);
      if (state != EMPTY && state != color) {
        var group = self.getGroup(n[0], n[1]);
        if (group["liberties"] == 0)
          captured.push(group);
      }
    });

    var self = this;
    _.each(captured, function(group) {
      _.each(group["stones"], function(stone) {
        self.intersections[stone[0]][stone[1]] = EMPTY;
      });
    });

    return this;
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

    var color = this.intersections[i][j];
    if (color == EMPTY)
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
        var state = self.getStone(n[0], n[1]);
        if (state == EMPTY)
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
};

function createBoard(size) {
  var board = Object.create(BoardPrototype);
  board.size = size;
  board.intersections = createIntersections(size);
  return board;
};

module.exports = {
  createBoard: createBoard,
  EMPTY: EMPTY,
  BLACK: BLACK,
  WHITE: WHITE
};

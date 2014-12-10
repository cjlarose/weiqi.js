var _ = require('lodash');
var Constants = require('./constants');

/*
 * Returns a size x size matrix with all entries initialized to Constants.EMPTY
 */
function createIntersections(size) {
  var range = _.range(size);
  return _.map(range, function() {
    return _.map(range, function() { return Constants.EMPTY; });
  });
};


var BoardPrototype = {

  inBounds: function(coords) {
    var i = coords[0], j = coords[1];
    return i >= 0 && i < this.size && j >= 0 && j < this.size;
  },

  getStone: function(coords) {
    return this.intersections[coords[0]][coords[1]];
  },

  toString: function() {
    return _.map(this.intersections, function(row) {return row.join('');}).join('\n');
  },

  /*
   * Attempt to place a stone at (i,j).
   */
  play: function(playerColor, i, j) {
    var coords = [i, j];
    if (!this.inBounds(coords))
      throw "Intersection out of bounds";

    if (this.getStone(coords) != Constants.EMPTY)
      throw "Intersection occupied by existing stone";

    var color = this.intersections[i][j] = playerColor;
    var neighbors = this.getAdjacentIntersections(coords);

    var captured = _(neighbors)
      .zip(_.map(neighbors, this.getStone.bind(this)))
      .filter(function(x) { return x[1] != Constants.EMPTY && x[1] != color; })
      .map(_.first)
      .map(this.getGroup.bind(this))
      .filter(function(g) { return g.liberties === 0; })
      .value();

    // detect suicide
    var newGroup = this.getGroup(coords);
    if (_.isEmpty(captured) && newGroup.liberties === 0) {
      captured = [newGroup];
    }

    // remove captured stones
    _.each(captured, function(group) {
      _.each(group["stones"], function(stone) {
        this.intersections[stone[0]][stone[1]] = Constants.EMPTY;
      }.bind(this));
    }.bind(this));

    return this;
  },

  /*
   * Given a board position, returns a list of [i,j] coordinates representing
   * orthagonally adjacent intersections
   */
  getAdjacentIntersections: function(coords) {
    var i = coords[0], j = coords[1];
    return _([[-1, 0], [0, 1], [1, 0], [0, -1]])
      .map(function(delta) { return [i + delta[0], j + delta[1]]; })
      .filter(this.inBounds.bind(this))
      .value();
  },

  /*
   * Performs a breadth-first search about an (i,j) position to find recursively
   * orthagonally adjacent stones of the same color (stones with which it shares
   * liberties). Returns null for if there is no stone at the specified position,
   * otherwise returns an object with two keys: "liberties", specifying the
   * number of liberties the group has, and "stones", the list of [i,j]
   * coordinates of the group's members.
   */
  getGroup: function(coords) {
    var color = this.getStone(coords);
    if (color == Constants.EMPTY)
      return null;

    var visited = {}; // for O(1) lookups
    var visitedList = []; // for returning
    var queue = [coords];
    var count = 0;

    while (queue.length > 0) {
      var stone = queue.pop();
      if (visited[stone])
        continue;

      var neighbors = this.getAdjacentIntersections(stone);
      _.each(neighbors, function(n) {
        var state = this.getStone(n);
        if (state == Constants.EMPTY)
          count++;
        if (state == color)
          queue.push(n);
      }.bind(this));

      visited[stone] = true;
      visitedList.push(stone);
    }

    return {
      "liberties": count,
      "stones": visitedList
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
  EMPTY: Constants.EMPTY,
  BLACK: Constants.BLACK,
  WHITE: Constants.WHITE
};

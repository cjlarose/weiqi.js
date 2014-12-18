var _ = require('lodash');
var mori = require('mori');
var Constants = require('./constants');

/*
 * Returns a size x size matrix with all entries initialized to Constants.EMPTY
 */
function createIntersections(size) {
  var getRow = function() {
    return mori.into(
      mori.vector(),
      mori.map(
        mori.constantly(Constants.EMPTY),
        mori.range(size)));
  };

  return mori.into(mori.vector(), mori.map(getRow, mori.range(size)));
}

function inBounds(size, coords) {
  var i = coords[0], j = coords[1];
  return i >= 0 && i < size && j >= 0 && j < size;
}

function getStone(intersections, coords) {
  return mori.nth(mori.nth(intersections, coords[0]), coords[1]);
}

function replaceStone(oldIntersections, coords, value) {
  return mori.assoc(
    oldIntersections,
    coords[0],
    mori.assoc(mori.nth(oldIntersections, coords[0]), coords[1], value));
}

/*
 * Given a board position, returns a list of [i,j] coordinates representing
 * orthagonally adjacent intersections
 */
function getAdjacentIntersections(size, coords) {
  var i = coords[0], j = coords[1];
  return _([[-1, 0], [0, 1], [1, 0], [0, -1]])
    .map(function(delta) { return [i + delta[0], j + delta[1]]; })
    .filter(inBounds.bind(this, size))
    .value();
}

/*
 * Performs a breadth-first search about an (i,j) position to find recursively
 * orthagonally adjacent stones of the same color (stones with which it shares
 * liberties). Returns null for if there is no stone at the specified position,
 * otherwise returns an object with two keys: "liberties", specifying the
 * number of liberties the group has, and "stones", the list of [i,j]
 * coordinates of the group's members.
 */
function getGroup(intersections, size, coords) {
  var color = getStone(intersections, coords);
  if (color == Constants.EMPTY)
    return null;

  var toVec = function(point) { return mori.into(mori.vector(), point); }

  var visited = mori.set();
  var queue = mori.queue(toVec(coords));
  var surrounding = mori.set();

  while (!mori.is_empty(queue)) {
    var stone = mori.peek(queue);
    queue = mori.pop(queue);

    if (mori.has_key(visited, stone))
      continue;

    var neighbors = getAdjacentIntersections(size, mori.clj_to_js(stone));
    _.each(neighbors, function(n) {
      var state = getStone(intersections, n);
      if (state == color)
        queue = mori.conj(queue, toVec(n));
      else
        surrounding = mori.conj(surrounding, toVec(n));
    }.bind(this));

    visited = mori.conj(visited, stone);
  }

  var liberties = mori.filter(function(coord) {
    return getStone(intersections, mori.clj_to_js(coord)) == Constants.EMPTY;
  }, surrounding);

  return {
    "liberties": mori.count(liberties),
    "stones": mori.clj_to_js(visited)
  };
}

function createBoard(size, intersections) {
  if (_.isUndefined(intersections))
    intersections = createIntersections(size);

  var Board = {

    getStone: function(coords) {
      return getStone(intersections, coords);
    },

    toString: function() {
      return _.map(mori.clj_to_js(intersections), function(row) {return row.join('');}).join('\n');
    },

    getSize: function() {
      return size;
    },

    getIntersections: function() {
      return intersections;
    },

    /*
     * Attempt to place a stone at (i,j).
     */
    play: function(color, coords) {
      var i = coords[0], j = coords[1];

      if (!inBounds(size, coords))
        throw "Intersection out of bounds";

      if (this.getStone(coords) != Constants.EMPTY)
        throw "Intersection occupied by existing stone";

      var newBoard = replaceStone(intersections, coords, color);
      var neighbors = getAdjacentIntersections(size, coords);

      var captured = _(neighbors)
        .zip(_.map(neighbors, getStone.bind(this, newBoard)))
        .filter(function(x) { return x[1] != Constants.EMPTY && x[1] != color; })
        .map(_.first)
        .map(getGroup.bind(this, newBoard, size))
        .filter(function(g) { return g.liberties === 0; })
        .value();

      // detect suicide
      var newGroup = getGroup(newBoard, size, coords);
      if (_.isEmpty(captured) && newGroup.liberties === 0) {
        captured = [newGroup];
      }

      // remove captured stones
      _.each(captured, function(group) {
        _.each(group["stones"], function(stone) {
          newBoard = replaceStone(newBoard, stone, Constants.EMPTY);
        }.bind(this));
      }.bind(this));

      return createBoard(size, newBoard);
    },
  };

  return Object.create(Board);
};


module.exports = {
  createBoard: createBoard
};

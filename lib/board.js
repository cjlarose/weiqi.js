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
  var i = mori.nth(coords, 0), j = mori.nth(coords, 1);
  return i >= 0 && i < size && j >= 0 && j < size;
}

function getStone(intersections, coords) {
  var i = mori.nth(coords, 0), j = mori.nth(coords, 1);
  return mori.nth(mori.nth(intersections, i), j);
}

function replaceStone(oldIntersections, coords, value) {
  var i = mori.nth(coords, 0), j = mori.nth(coords, 1);
  return mori.assoc(
    oldIntersections,
    i,
    mori.assoc(mori.nth(oldIntersections, i), j, value));
}

var deltas = mori.vector(mori.vector(-1, 0),
                         mori.vector(0, 1),
                         mori.vector(1, 0),
                         mori.vector(0, -1));

/*
 * Given a board position, returns a list of [i,j] coordinates representing
 * orthagonally adjacent intersections
 */
function getAdjacentIntersections(size, coords) {
  var i = mori.nth(coords, 0), j = mori.nth(coords, 1);

  var addPair = function(vec) {
    return mori.vector(mori.nth(vec, 0) + i, mori.nth(vec, 1) + j);
  };

  return mori.filter(mori.partial(inBounds, size), mori.map(addPair, deltas));
}

function allPositions(size) {
  return mori.mapcat(function(i) {
    return mori.map(function(j) {
      return mori.vector(i, j);
    }, mori.range(size));
  }, mori.range(size));
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
  var visited = mori.set();
  var queue = mori.queue(coords);
  var surrounding = mori.hash_map();

  while (!mori.is_empty(queue)) {
    var stone = mori.peek(queue);
    queue = mori.pop(queue);

    if (mori.has_key(visited, stone))
      continue;

    var neighbors = getAdjacentIntersections(size, stone);
    mori.each(neighbors, function(n) {
      var state = getStone(intersections, n);
      if (state == color)
        queue = mori.conj(queue, n);
      else
        surrounding = mori.assoc(surrounding, n, state);
    });

    visited = mori.conj(visited, stone);
  }

  var liberties = mori.filter(function(pair) {
    return mori.nth(pair, 1) == Constants.EMPTY;
  }, surrounding);

  return mori.hash_map('liberties',   mori.count(liberties),
                       'stones',      visited,
                       'surrounding', surrounding);
}

function createBoard(size, intersections) {
  if (typeof size === "undefined" || size < 0)
    throw "Size must be an integer greater than zero";

  if (typeof intersections === "undefined")
    intersections = createIntersections(size);

  var Board = {

    getStone: function(coords) {
      return getStone(intersections, coords);
    },

    toArray: function() {
      return mori.clj_to_js(intersections);
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
      coords = mori.js_to_clj(coords);

      if (!inBounds(size, coords))
        throw "Intersection out of bounds";

      if (this.getStone(coords) != Constants.EMPTY)
        throw "Intersection occupied by existing stone";

      var newBoard = replaceStone(intersections, coords, color);
      var neighbors = getAdjacentIntersections(size, coords);
      var neighborColors = mori.zipmap(neighbors, mori.map(mori.partial(getStone, newBoard), neighbors));
      var opponentColor = function(pair) {
        return mori.nth(pair, 1) != color && mori.nth(pair, 1) != Constants.EMPTY;
      };
      var isDead = function(group) { return mori.get(group, 'liberties') === 0; };
      var captured = mori.pipeline(neighborColors,
        mori.partial(mori.filter, opponentColor),
        mori.partial(mori.map, mori.comp(mori.partial(getGroup, newBoard, size), mori.first)),
        mori.partial(mori.filter, isDead));

      // detect suicide
      var newGroup = getGroup(newBoard, size, coords);
      if (mori.is_empty(captured) && mori.get(newGroup, 'liberties') === 0) {
        captured = mori.vector(newGroup);
      }

      // remove captured stones
      newBoard = mori.pipeline(captured,
        mori.partial(mori.mapcat, function(g) {return mori.get(g, 'stones');}),
        mori.partial(mori.reduce, function(board, stone) {
          return replaceStone(board, stone, Constants.EMPTY);
        }, newBoard));

      return createBoard(size, newBoard);
    },

    areaScore: function() {
      var positions = allPositions(size);
      var visited = mori.set();
      var score = {};
      score[Constants.BLACK] = 0;
      score[Constants.WHITE] = 0;

      mori.each(positions, function(coords) {
        if (mori.has_key(visited, coords))
          return;

        var state = getStone(intersections, coords);
        var group = getGroup(intersections, size, coords);
        var stones = mori.get(group, 'stones');
        var surroundingColors = mori.pipeline(mori.get(group, 'surrounding'),
          mori.partial(mori.map, function(pair) { return mori.nth(pair, 1); }),
          mori.partial(mori.into, mori.set()));

        if (state == Constants.EMPTY) {
          if (mori.count(surroundingColors) === 1)
            score[mori.first(surroundingColors)] += mori.count(stones);
        } else {
          score[state] += mori.count(stones);
        }

        visited = mori.union(visited, stones);
      });

      return score;
    }
  };

  return Object.create(Board);
};


module.exports = {
  createBoard: createBoard
};

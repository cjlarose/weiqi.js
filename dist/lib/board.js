"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.createBoard = createBoard;
var mori = _interopRequire(require("mori"));

var Constants = _interopRequire(require("./constants"));

function inBounds(size, coords) {
  var i = mori.nth(coords, 0),
      j = mori.nth(coords, 1);
  return i >= 0 && i < size && j >= 0 && j < size;
}

function getStone(stones, coords) {
  return mori.get(stones, coords, Constants.EMPTY);
}

function replaceStone(stones, coords, value) {
  return mori.assoc(stones, coords, value);
}

var deltas = mori.vector(mori.vector(-1, 0), mori.vector(0, 1), mori.vector(1, 0), mori.vector(0, -1));

/*
 * Given a board position, returns a list of [i,j] coordinates representing
 * orthagonally adjacent intersections
 */
function getAdjacentIntersections(size, coords) {
  var i = mori.nth(coords, 0),
      j = mori.nth(coords, 1);
  var addPair = function (vec) {
    return mori.vector(mori.nth(vec, 0) + i, mori.nth(vec, 1) + j);
  };
  return mori.filter(mori.partial(inBounds, size), mori.map(addPair, deltas));
}

function allPositions(size) {
  return mori.mapcat(function (i) {
    return mori.map(function (j) {
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
function getGroup(stones, size, coords) {
  var color = getStone(stones, coords);

  function search(visited, queue, surrounding) {
    var _arguments = arguments,
        _this = this,
        _shouldContinue,
        _result;
    do {
      _shouldContinue = false;
      _result = (function (visited, queue, surrounding) {
        if (mori.isEmpty(queue)) return { visited: visited, surrounding: surrounding };

        var stone = mori.peek(queue);
        queue = mori.pop(queue);

        if (mori.hasKey(visited, stone)) {
          _arguments = [visited, queue, surrounding];
          _this = undefined;
          return _shouldContinue = true;
        }

        var neighbors = getAdjacentIntersections(size, stone);
        mori.each(neighbors, function (n) {
          var state = getStone(stones, n);
          if (state == color) queue = mori.conj(queue, n);else surrounding = mori.assoc(surrounding, n, state);
        });

        visited = mori.conj(visited, stone);
        _arguments = [visited, queue, surrounding];
        _this = undefined;
        return _shouldContinue = true;
      }).apply(_this, _arguments);
    } while (_shouldContinue);
    return _result;
  }

  var _search = search(mori.set(), mori.queue(coords), mori.hashMap());

  var visited = _search.visited;
  var surrounding = _search.surrounding;


  var liberties = mori.filter(function (pair) {
    return mori.nth(pair, 1) == Constants.EMPTY;
  }, surrounding);

  return mori.hashMap("liberties", mori.count(liberties), "stones", visited, "surrounding", surrounding);
}

function createBoard(size, stones) {
  if (typeof size === "undefined" || size < 0) throw "Size must be an integer greater than zero";

  if (typeof stones === "undefined") stones = mori.hashMap();

  var Board = {

    getStone: function (coords) {
      return getStone(stones, mori.toClj(coords));
    },

    toArray: function () {
      return mori.toJs(this.getIntersections());
    },

    getStones: function (color) {
      return mori.pipeline(stones, mori.partial(mori.filter, function (pair) {
        return mori.nth(pair, 1) == color;
      }), mori.partial(mori.map, mori.first), mori.toJs);
    },

    getSize: function () {
      return size;
    },

    getIntersections: function () {
      return mori.map(function (i) {
        return mori.map(function (j) {
          return getStone(stones, mori.vector(i, j));
        }, mori.range(size));
      }, mori.range(size));
    },

    /*
     * Attempt to place a stone at (i,j).
     */
    play: function (color, coords) {
      coords = mori.toClj(coords);

      if (!inBounds(size, coords)) throw "Intersection out of bounds";

      if (this.getStone(coords) != Constants.EMPTY) throw "Intersection occupied by existing stone";

      var newBoard = replaceStone(stones, coords, color);
      var neighbors = getAdjacentIntersections(size, coords);
      var neighborColors = mori.zipmap(neighbors, mori.map(mori.partial(getStone, newBoard), neighbors));
      var opponentColor = function (pair) {
        return mori.nth(pair, 1) != color && mori.nth(pair, 1) != Constants.EMPTY;
      };
      var isDead = function (group) {
        return mori.get(group, "liberties") === 0;
      };
      var captured = mori.pipeline(neighborColors, mori.partial(mori.filter, opponentColor), mori.partial(mori.map, mori.comp(mori.partial(getGroup, newBoard, size), mori.first)), mori.partial(mori.filter, isDead));

      // detect suicide
      var newGroup = getGroup(newBoard, size, coords);
      if (mori.isEmpty(captured) && isDead(newGroup)) {
        captured = mori.vector(newGroup);
      }

      var replaceStones = function (board, value, coords) {
        return mori.reduce(function (acc, stone) {
          return replaceStone(acc, stone, value);
        }, board, coords);
      };

      // remove captured stones
      newBoard = mori.pipeline(captured, mori.partial(mori.mapcat, function (g) {
        return mori.get(g, "stones");
      }), mori.partial(replaceStones, newBoard, Constants.EMPTY));

      return createBoard(size, newBoard);
    },

    areaScore: function () {
      var positions = allPositions(size);
      var visited = mori.set();
      var score = {};
      score[Constants.BLACK] = 0;
      score[Constants.WHITE] = 0;

      mori.each(positions, function (coords) {
        if (mori.hasKey(visited, coords)) return;

        var state = getStone(stones, coords);
        var group = getGroup(stones, size, coords);
        var groupStones = mori.get(group, "stones");
        var surroundingColors = mori.pipeline(mori.get(group, "surrounding"), mori.partial(mori.map, function (pair) {
          return mori.nth(pair, 1);
        }), mori.partial(mori.into, mori.set()));

        if (state == Constants.EMPTY) {
          if (mori.count(surroundingColors) === 1) score[mori.first(surroundingColors)] += mori.count(groupStones);
        } else {
          score[state] += mori.count(groupStones);
        }

        visited = mori.union(visited, groupStones);
      });

      return score;
    }
  };

  return Object.create(Board);
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
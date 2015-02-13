"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.createBoard = createBoard;
var Immutable = _interopRequire(require("immutable"));

var Constants = _interopRequire(require("./constants"));

function inBounds(size, coords) {
  var i = coords.get(0),
      j = coords.get(1);
  return i >= 0 && i < size && j >= 0 && j < size;
}

function getStone(stones, coords) {
  return stones.get(coords, Constants.EMPTY);
}

function replaceStone(stones, coords, value) {
  return stones.set(coords, value);
}

var deltas = Immutable.List.of(Immutable.List.of(-1, 0), Immutable.List.of(0, 1), Immutable.List.of(1, 0), Immutable.List.of(0, -1));

/*
 * Given a board position, returns a list of [i,j] coordinates representing
 * orthagonally adjacent intersections
 */
function getAdjacentIntersections(size, coords) {
  var i = coords.get(0),
      j = coords.get(1);
  var addPair = function (vec) {
    return Immutable.List.of(vec.get(0) + i, vec.get(1) + j);
  };
  return deltas.map(addPair).filter(function (coord) {
    return inBounds(size, coord);
  });
}

function allPositions(size) {
  var range = Immutable.Range(0, size);
  return range.flatMap(function (i) {
    return range.map(function (j) {
      return Immutable.List.of(i, j);
    });
  });
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
        if (queue.isEmpty()) return { visited: visited, surrounding: surrounding };

        var stone = queue.first();
        queue = queue.shift();

        if (visited.has(stone)) {
          _arguments = [visited, queue, surrounding];
          _this = undefined;
          return _shouldContinue = true;
        }

        var neighbors = getAdjacentIntersections(size, stone);
        neighbors.forEach(function (n) {
          var state = getStone(stones, n);
          if (state == color) queue = queue.push(n);else surrounding = surrounding.set(n, state);
        });

        visited = visited.add(stone);
        _arguments = [visited, queue, surrounding];
        _this = undefined;
        return _shouldContinue = true;
      }).apply(_this, _arguments);
    } while (_shouldContinue);
    return _result;
  }

  var _search = search(Immutable.Set(), Immutable.List([coords]), Immutable.Map());

  var visited = _search.visited;
  var surrounding = _search.surrounding;
  var liberties = surrounding.filter(function (color) {
    return color == Constants.EMPTY;
  });

  return Immutable.Map({ liberties: liberties.size,
    stones: visited,
    surrounding: surrounding });
}

function createBoard(size, stones) {
  if (typeof size === "undefined" || size < 0) throw "Size must be an integer greater than zero";

  if (typeof stones === "undefined") stones = Immutable.Map();

  var Board = {

    getStone: function (coords) {
      return getStone(stones, Immutable.List(coords));
    },

    toArray: function () {
      return this.getIntersections().toJS();
    },

    getStones: function (color) {
      return stones.filter(function (stoneColor) {
        return stoneColor == color;
      }).keySeq().toJS();
    },

    getSize: function () {
      return size;
    },

    getIntersections: function () {
      var range = Immutable.Range(0, size);
      return range.map(function (i) {
        return range.map(function (j) {
          return getStone(stones, Immutable.List([i, j]));
        });
      });
    },

    /*
     * Attempt to place a stone at (i,j).
     */
    play: function (color, coords) {
      coords = Immutable.List(coords);

      if (!inBounds(size, coords)) throw "Intersection out of bounds";

      if (this.getStone(coords) != Constants.EMPTY) throw "Intersection occupied by existing stone";

      var newBoard = replaceStone(stones, coords, color);
      var neighbors = getAdjacentIntersections(size, coords);
      var neighborColors = Immutable.Map(neighbors.zipWith(function (n) {
        return [n, getStone(newBoard, n)];
      }));
      var opponentColor = function (stoneColor, coords) {
        return stoneColor != color && stoneColor != Constants.EMPTY;
      };
      var isDead = function (group) {
        return group.get("liberties") === 0;
      };
      var captured = neighborColors.filter(opponentColor).map(function (val, coord) {
        return getGroup(newBoard, size, coord);
      }).valueSeq().filter(isDead);

      // detect suicide
      var newGroup = getGroup(newBoard, size, coords);
      if (captured.isEmpty() && isDead(newGroup)) captured = Immutable.List([newGroup]);

      newBoard = captured.flatMap(function (g) {
        return g.get("stones");
      }).reduce(function (acc, stone) {
        return replaceStone(acc, stone, Constants.EMPTY);
      }, newBoard);

      return createBoard(size, newBoard);
    },

    areaScore: function () {
      var positions = allPositions(size);
      var visited = Immutable.Set();
      var score = {};
      score[Constants.BLACK] = 0;
      score[Constants.WHITE] = 0;

      positions.forEach(function (coords) {
        if (visited.has(coords)) return;

        var state = getStone(stones, coords);
        var group = getGroup(stones, size, coords);
        var groupStones = group.get("stones");
        var surroundingColors = group.get("surrounding").valueSeq().toSet();

        if (state == Constants.EMPTY) {
          if (surroundingColors.size === 1) score[surroundingColors.first()] += groupStones.size;
        } else {
          score[state] += groupStones.size;
        }

        visited = visited.union(groupStones);
      });

      return score;
    }
  };

  return Object.create(Board);
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
import Immutable from "immutable";
import { opponentColor } from "./util";
import Constants from "./constants";

class Point extends Immutable.Record({i: 0, j: 0}) {
  constructor(i, j) {
    super({i: i, j: j});
  }
}

class Group extends Immutable.Record({stones: null, surrounding: null}) {
  isDead() {
    return this.getLiberties().isEmpty();
  }

  getLiberties() {
    return this.surrounding.filter(color => color == Constants.EMPTY);
  }
}

function inBounds(size, point) {
  return point.i >= 0 && point.i < size && point.j >= 0 && point.j < size;
}

function getStone(stones, coords) {
  return stones.get(coords, Constants.EMPTY);
}

function replaceStone(stones, coords, value) {
  if (value == Constants.EMPTY)
    return removeStone(coords);
  else
    return stones.set(coords, value);
}

function removeStone(stones, coords) {
  return stones.remove(coords);
}

var deltas = Immutable.List.of(new Point(-1, 0),
                               new Point(0, 1),
                               new Point(1, 0),
                               new Point(0, -1));


/*
 * Given a board position, returns a list of [i,j] coordinates representing
 * orthagonally adjacent intersections
 */
function getAdjacentIntersections(size, coords) {
  var addPair = vec => new Point(vec.i + coords.i, vec.j + coords.j);
  return deltas.map(addPair).filter(coord => inBounds(size, coord));
}

function allPositions(size) {
  var range = Immutable.Range(0, size);
  return range.flatMap(i => range.map(j => new Point(i, j)));
}

/*
 * Performs a breadth-first search about an (i,j) position to find recursively
 * orthagonally adjacent stones of the same color (stones with which it shares
 * liberties).
 */
function getGroup(stones, size, coords) {
  var color = getStone(stones, coords);

  function search(visited, queue, surrounding) {
    if (queue.isEmpty())
      return {visited: visited, surrounding: surrounding};

    var stone = queue.first();
    queue = queue.shift();

    if (visited.has(stone))
      return search(visited, queue, surrounding);

    var neighbors = getAdjacentIntersections(size, stone);
    neighbors.forEach(n => {
      var state = getStone(stones, n);
      if (state == color)
        queue = queue.push(n);
      else
        surrounding = surrounding.set(n, state);
    });

    visited = visited.add(stone);
    return search(visited, queue, surrounding);
  }

  var {visited, surrounding} = search(Immutable.Set(),
                                      Immutable.List([coords]),
                                      Immutable.Map());

  return new Group({ stones       : visited,
                     surrounding  : surrounding });
}

class Board {
  constructor(size, stones) {
    if (typeof size === "undefined" || size < 0)
      throw "Size must be an integer greater than zero";

    if (typeof stones === "undefined")
      stones = Immutable.Map();

    this.size = size;
    this.stones = stones;
  }

  getStone(coords) {
    return getStone(this.stones, new Point(coords[0], coords[1]));
  }

  getSize() {
    return this.size;
  }

  toArray() {
    return this.getIntersections().toJS();
  }

  getIntersections() {
    var range = Immutable.Range(0, this.size);
    return range.map(i =>
      range.map(j => getStone(this.stones, new Point(i, j))).toList()
    ).toList();
  }

  play(color, coords) {
    coords = new Point(coords[0], coords[1]);

    if (!inBounds(this.size, coords))
      throw "Intersection out of bounds";

    if (getStone(this.stones, coords) != Constants.EMPTY)
      throw "Intersection occupied by existing stone";

    var newBoard = replaceStone(this.stones, coords, color);
    var neighbors = getAdjacentIntersections(this.size, coords);
    var neighborColors = Immutable.Map(
      neighbors.zipWith(n => [n, getStone(newBoard, n)])
    );
    var isOpponentColor = (stoneColor, _) =>
      stoneColor === opponentColor(color);
    var captured = neighborColors.
                     filter(isOpponentColor).
                     map((val, coord) => getGroup(newBoard, this.size, coord)).
                     valueSeq().
                     filter(g => g.isDead());

    // detect suicide
    var newGroup = getGroup(newBoard, this.size, coords);
    if (captured.isEmpty() && newGroup.isDead())
      captured = Immutable.List([newGroup]);

    newBoard = captured.
                 flatMap(g => g.get("stones")).
                 reduce((acc, stone) => removeStone(acc, stone), newBoard);

    return createBoard(this.size, newBoard);
  }

  areaScore() {
    var positions = allPositions(this.size);
    var visited = Immutable.Set();
    var score = {};
    score[Constants.BLACK] = 0;
    score[Constants.WHITE] = 0;

    positions.forEach((coords) => {
      if (visited.has(coords))
        return;

      var state = getStone(this.stones, coords);
      var group = getGroup(this.stones, this.size, coords);
      var groupStones = group.get("stones");
      var surroundingColors = group.get("surrounding").valueSeq().toSet();

      if (state == Constants.EMPTY) {
        if (surroundingColors.size === 1)
          score[surroundingColors.first()] += groupStones.size;
      } else {
        score[state] += groupStones.size;
      }

      visited = visited.union(groupStones);
    });

    return score;
  }

}

export function createBoard(size, stones) {
  return new Board(size, stones);
};

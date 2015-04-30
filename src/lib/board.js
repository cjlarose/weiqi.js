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
    return this.surrounding.filter(color => color === Constants.EMPTY);
  }
}

const inBounds = (size, point) =>
  point.i >= 0 && point.i < size && point.j >= 0 && point.j < size;

const getStone = (stones, coords) =>
  stones.get(coords, Constants.EMPTY);

const replaceStone = (stones, coords, value) => {
  if (value === Constants.EMPTY)
    return removeStone(coords);
  else
    return stones.set(coords, value);
};

const removeStone = (stones, coords) =>
  stones.remove(coords);

const deltas = Immutable.List.of(new Point(-1, 0),
                                 new Point(0, 1),
                                 new Point(1, 0),
                                 new Point(0, -1));


/*
 * Given a board position, returns a list of [i,j] coordinates representing
 * orthagonally adjacent intersections
 */
const getAdjacentIntersections = (size, coords) => {
  const addPair = vec => new Point(vec.i + coords.i, vec.j + coords.j);
  return deltas.map(addPair).filter(coord => inBounds(size, coord));
};

const allPositions = (size) => {
  const range = Immutable.Range(0, size);
  return range.flatMap(i => range.map(j => new Point(i, j)));
};

/*
 * Performs a breadth-first search about an (i,j) position to find recursively
 * orthagonally adjacent stones of the same color (stones with which it shares
 * liberties).
 */
const getGroup = (stones, size, coords) => {
  const color = getStone(stones, coords);

  const search = (visited, queue, surrounding) => {
    if (queue.isEmpty())
      return {visited: visited, surrounding: surrounding};

    const stone = queue.first();
    queue = queue.shift();

    if (visited.has(stone))
      return search(visited, queue, surrounding);

    const neighbors = getAdjacentIntersections(size, stone);
    neighbors.forEach(n => {
      const state = getStone(stones, n);
      if (state === color)
        queue = queue.push(n);
      else
        surrounding = surrounding.set(n, state);
    });

    visited = visited.add(stone);
    return search(visited, queue, surrounding);
  };

  const {visited, surrounding} = search(Immutable.Set(),
                                        Immutable.List([coords]),
                                        Immutable.Map());

  return new Group({ stones       : visited,
                     surrounding  : surrounding });
};

const createEmptyGrid = (() => {
  const createGrid = (size) =>
    Immutable.Repeat(
      Immutable.Repeat(Constants.EMPTY, size).toList(),
      size
    ).toList();

  const cache = {};
  return (size) => cache[size] || (cache[size] = createGrid(size));
})();

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
    const mergeStones = map =>
      this.stones.reduce(
        (board, color, point) =>
          board.setIn([point.i, point.j], color),
        map);
    return createEmptyGrid(this.size).withMutations(mergeStones);
  }

  play(color, coords) {
    coords = new Point(coords[0], coords[1]);

    if (!inBounds(this.size, coords))
      throw "Intersection out of bounds";

    if (getStone(this.stones, coords) != Constants.EMPTY)
      throw "Intersection occupied by existing stone";

    let newBoard = replaceStone(this.stones, coords, color);
    const neighbors = getAdjacentIntersections(this.size, coords);
    const neighborColors = Immutable.Map(
      neighbors.zipWith(n => [n, getStone(newBoard, n)])
    );
    const isOpponentColor = (stoneColor, _) =>
      stoneColor === opponentColor(color);
    let captured = neighborColors.
                     filter(isOpponentColor).
                     map((val, coord) => getGroup(newBoard, this.size, coord)).
                     valueSeq().
                     filter(g => g.isDead());

    // detect suicide
    const newGroup = getGroup(newBoard, this.size, coords);
    if (captured.isEmpty() && newGroup.isDead())
      captured = Immutable.List([newGroup]);

    newBoard = captured.
                 flatMap(g => g.get("stones")).
                 reduce((acc, stone) => removeStone(acc, stone), newBoard);

    return createBoard(this.size, newBoard);
  }

  areaScore() {
    const positions = allPositions(this.size);
    let visited = Immutable.Set();
    const score = {};
    score[Constants.BLACK] = 0;
    score[Constants.WHITE] = 0;

    positions.forEach((coords) => {
      if (visited.has(coords))
        return;

      const state = getStone(this.stones, coords);
      const group = getGroup(this.stones, this.size, coords);
      const groupStones = group.get("stones");
      const surroundingColors = group.get("surrounding").valueSeq().toSet();

      if (state === Constants.EMPTY && surroundingColors.size === 1)
          score[surroundingColors.first()] += groupStones.size;
      else
        score[state] += groupStones.size;

      visited = visited.union(groupStones);
    });

    return score;
  }

}

export const createBoard = (size, stones) =>
  new Board(size, stones);

import Immutable from 'immutable';
import { Position, Group } from './records';

function positionInBounds(size, position) {
  const i = position.get('i');
  const j = position.get('j');
  return i >= 0 && i < size && j >= 0 && j < size;
}

function addPositions(a, b) {
  return new Position({ i: a.get('i') + b.get('i'),
                        j: a.get('j') + b.get('j') });
}

const deltas = [new Position({ i: 1, j: 0 }),
                new Position({ i: 0, j: 1 }),
                new Position({ i: -1, j: 0 }),
                new Position({ i: 0, j: -1 })];

function getNeighbors(size, position) {
  return deltas.map(d => addPositions(position, d)).filter(p => positionInBounds(size, p));
}

function removeGroup(board, group) {
  return group.get('stones').reduce((b, p) => b.delete(p), board);
}

function groupAtPosition(size, board, position) {
  const color = board.get(position);

  const search = (group, queue, visited) => {
    if (queue.isEmpty()) { return group; }

    const pos = queue.first();
    if (visited.has(pos)) { return search(group, queue.shift(), visited); }

    if (color === board.get(pos)) {
      const newGroup = new Group({ stones: group.get('stones').add(pos),
                                   liberties: group.get('liberties') });
      const newQueue = queue.shift().concat(getNeighbors(size, pos));
      return search(newGroup, newQueue, visited.add(pos));
    }

    if (!board.has(pos)) {
      const newGroup = new Group({ stones: group.get('stones'),
                                   liberties: group.get('liberties').add(pos) });
      return search(newGroup, queue.shift(), visited.add(pos));
    }

    return search(group, queue.shift(), visited.add(pos));
  };

  return search(new Group(), new Immutable.List([position]), new Immutable.Set());
}


export function createBoard(size) {
  if (typeof size === 'undefined' || size < 0) {
    throw new Error('Size must be an integer greater than zero');
  }

  return new Immutable.Map({
    size,
    stones: new Immutable.Map(),
  });
}

export function placeStone(board, move, allowSuicide = false) {
  const size = board.get('size');
  const stones = board.get('stones');

  if (!positionInBounds(size, move.get('position'))) {
    throw new Error('Intersection out of bounds');
  }

  if (stones.has(move.get('position'))) {
    throw new Error('Intersection occupied by existing stone');
  }

  const newBoard = stones.set(move.get('position'), move.get('stoneColor'));
  const neighborCoords = getNeighbors(size, move.get('position'));
  const neighboringEnemyStones =
    neighborCoords.filter(p => stones.has(p) && stones.get(p) !== move.get('stoneColor'));
  const neighboringEnemyGroups =
    neighboringEnemyStones.map(p => groupAtPosition(size, newBoard, p));
  const deadNeighborGroups = neighboringEnemyGroups.filter(g => g.get('liberties').size === 0);
  const stonesAfterRemovals = deadNeighborGroups.reduce(removeGroup, newBoard);

  const newGroup = groupAtPosition(size, stonesAfterRemovals, move.get('position'));

  if (newGroup.get('liberties').size === 0) {
    if (!allowSuicide) {
      throw new Error('New group has zero liberies (suicide)');
    } else {
      return board.set('stones', removeGroup(stonesAfterRemovals, newGroup));
    }
  }

  return board.set('stones', stonesAfterRemovals);
}

function allPositions(size) {
  const range = new Immutable.Range(0, size);
  return range.flatMap(i => range.map(j => new Position({ i, j })));
}

function surroundingColors(board, group) {
  const result = { black: false, white: false };
  const groupStones = group.get('stones');
  groupStones.forEach((position) => {
    const neighborCoords = getNeighbors(board.get('size'), position);
    neighborCoords.forEach((pos) => {
      if (groupStones.has(pos)) { return; }
      const color = board.get('stones').get(pos);
      if (typeof color !== 'undefined') {
        result[color] = true;
      }
    });
  });
  return result;
}

export function areaScore(board) {
  const size = board.get('size');
  const positions = allPositions(size);
  let visited = new Immutable.Set();
  const score = { black: 0, white: 0 };

  positions.forEach((position) => {
    if (visited.has(position)) { return; }
    const groupColor = board.get('stones').get(position);
    const group = groupAtPosition(size, board.get('stones'), position);
    const colors = surroundingColors(board, group);

    if (typeof groupColor === 'undefined') {
      if (colors.white && !colors.black) {
        score.white += group.get('stones').size;
      } else if (colors.black && !colors.white) {
        score.black += group.get('stones').size;
      }
    } else {
      score[groupColor] += group.get('stones').size;
    }

    visited = visited.union(group.get('stones'));
  });
  return score;
}

export function toArray(board) {
  const size = board.get('size');

  const boardArray = Array(size);
  for (let i = 0; i < size; i += 1) {
    const row = Array(size);
    for (let j = 0; j < size; j += 1) {
      row[j] = '.';
    }
    boardArray[i] = row;
  }

  const boardState = board.get('stones');
  boardState.forEach((stoneColor, position) => {
    const character = stoneColor === 'black' ? 'x' : 'o';
    boardArray[position.get('i')][position.get('j')] = character;
  });
  return boardArray;
}

import Immutable from 'immutable';
import { Move, Position } from './records';
import { createBoard, placeStone, areaScore as boardAreaScore } from './board';
import { opponentColor } from './util';

export function createGame(boardSize) {
  const board = createBoard(boardSize);
  return new Immutable.Map({
    board,
    currentPlayer: 'black',
    consectutivePasses: 0,
    history: new Immutable.Set(board.get('stones')),
  });
}

export function isOver(game) {
  return game.get('consectutivePasses') >= 2;
}

export function play(game, player, position) {
  let move;
  if (position) {
    const [i, j] = position;
    move = new Move({ position: new Position({ i, j }), stoneColor: player });
  } else {
    move = new Move({ position: null, stoneColor: player });
  }

  const inHistory = otherBoard => game.get('history').has(otherBoard.get('stones'));

  if (isOver(game)) {
    throw new Error('Game is already over');
  }

  if (player !== game.get('currentPlayer')) {
    throw new Error("Not player's turn");
  }

  if (move.get('position') === null) {
    return game
      .update('currentPlayer', opponentColor)
      .update('consectutivePasses', p => p + 1);
  }

  const newBoard = placeStone(game.get('board'), move);

  if (inHistory(newBoard)) {
    throw new Error('Violation of Ko');
  }

  return game
    .update('currentPlayer', opponentColor)
    .set('consectutivePasses', 0)
    .set('board', newBoard)
    .update('history', h => h.add(newBoard.get('stones')));
}

export function pass(game, player) {
  return play(game, player, null);
}

export function areaScore(game, komi = 0.0) {
  const boardScore = boardAreaScore(game.get('board'));
  return boardScore.black - (boardScore.white + komi);
}

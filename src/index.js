import { createGame } from './lib/game';
import { createBoard } from './lib/board';
import Constants from './lib/constants';

export default {
  createGame: createGame,
  createBoard: createBoard,
  EMPTY: Constants.EMPTY,
  BLACK: Constants.BLACK,
  WHITE: Constants.WHITE
};

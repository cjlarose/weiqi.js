import Immutable from "immutable";
import { createBoard } from "./board";
import { opponentColor } from "./util";
import Constants from "./constants";

class Game {
  constructor(boardSize, values) {
    if (typeof values !== "undefined") {
      this.currentColor = values.currentColor;
      this.consectutivePasses = values.consectutivePasses;
      this.history = values.history;
      this.board = values.board;
    } else {
      this.currentColor = Constants.BLACK;
      this.consectutivePasses = 0;
      this.board = createBoard(boardSize);
      this.history = Immutable.Set([this.board.stones]);
    }
  }

  isOver() {
    return this.consectutivePasses >= 2;
  }

  getCurrentPlayer() {
    return this.currentColor;
  }

  getBoard() {
    return this.board;
  }

  play(player, coords) {
    const inHistory = (otherBoard) => this.history.has(otherBoard.stones);

    if (this.isOver())
      throw "Game is already over";

    if (player != this.currentColor)
      throw "Not player's turn";

    const newBoard = this.board.play(this.currentColor, coords);
    if (inHistory(newBoard))
      throw "Violation of Ko";

    return createGame(this.boardSize, {
      currentColor: opponentColor(this.currentColor),
      consectutivePasses: 0,
      board: newBoard,
      history: this.history.add(newBoard.stones)
    });
  }

  pass(player) {
    if (this.isOver())
      throw "Game is already over";

    if (player != this.currentColor)
      throw "Not player's turn";

    return createGame(this.boardSize, {
      currentColor: opponentColor(this.currentColor),
      consectutivePasses: this.consectutivePasses + 1,
      board: this.board,
      history: this.history
    });
  }

  /*
   * Returns Black - White
   */
  areaScore(komi) {
    if (typeof komi === "undefined")
      komi = 0.0;

    const boardScore = this.board.areaScore();
    return boardScore[Constants.BLACK] - (boardScore[Constants.WHITE] + komi);
  }

}

export function createGame(boardSize, values) {
  return new Game(boardSize, values);
}

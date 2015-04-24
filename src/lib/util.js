import Constants from "./constants";

export function opponentColor(color) {
  return color == Constants.BLACK ? Constants.WHITE : Constants.BLACK;
}

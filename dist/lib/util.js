'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.opponentColor = opponentColor;
function opponentColor(color) {
  switch (color) {
    case 'black':
      return 'white';
    case 'white':
      return 'black';
    default:
      throw new Error('Unknown color: ' + color);
  }
}
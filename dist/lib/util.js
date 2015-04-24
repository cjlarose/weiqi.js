"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

exports.opponentColor = opponentColor;
Object.defineProperty(exports, "__esModule", {
  value: true
});

var Constants = _interopRequire(require("./constants"));

function opponentColor(color) {
  return color == Constants.BLACK ? Constants.WHITE : Constants.BLACK;
}
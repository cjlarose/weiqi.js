"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

Object.defineProperty(exports, "__esModule", {
  value: true
});

var Constants = _interopRequire(require("./constants"));

var opponentColor = function (color) {
  return color == Constants.BLACK ? Constants.WHITE : Constants.BLACK;
};
exports.opponentColor = opponentColor;
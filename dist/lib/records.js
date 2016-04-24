'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Group = exports.Move = exports.Position = undefined;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Position = exports.Position = new _immutable2.default.Record({ i: 0, j: 0 });
var Move = exports.Move = new _immutable2.default.Record({ position: new Position(), stoneColor: 'black' });
var Group = exports.Group = new _immutable2.default.Record({
  stones: new _immutable2.default.Set(),
  liberties: new _immutable2.default.Set()
});
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.createGame = createGame;
exports.isOver = isOver;
exports.play = play;
exports.pass = pass;
exports.areaScore = areaScore;

var _immutable = require('immutable');

var _immutable2 = _interopRequireDefault(_immutable);

var _records = require('./records');

var _board = require('./board');

var _util = require('./util');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createGame(boardSize) {
  var board = (0, _board.createBoard)(boardSize);
  return new _immutable2.default.Map({
    board: board,
    currentColor: 'black',
    consectutivePasses: 0,
    history: new _immutable2.default.Set(board.get('stones'))
  });
}

function isOver(game) {
  return game.get('consectutivePasses') >= 2;
}

function play(game, player, position) {
  var move = void 0;
  if (position) {
    var _position = _slicedToArray(position, 2);

    var i = _position[0];
    var j = _position[1];

    move = new _records.Move({ position: new _records.Position({ i: i, j: j }), stoneColor: player });
  } else {
    move = new _records.Move({ position: null, stoneColor: player });
  }

  var inHistory = function inHistory(otherBoard) {
    return game.get('history').has(otherBoard.get('stones'));
  };

  if (isOver(game)) {
    throw new Error('Game is already over');
  }

  if (player !== game.get('currentColor')) {
    throw new Error("Not player's turn");
  }

  if (move.get('position') === null) {
    return game.update('currentColor', _util.opponentColor).update('consectutivePasses', function (p) {
      return p + 1;
    });
  }

  var newBoard = (0, _board.placeStone)(game.get('board'), move);

  if (inHistory(newBoard)) {
    throw new Error('Violation of Ko');
  }

  return game.update('currentColor', _util.opponentColor).set('consectutivePasses', 0).set('board', newBoard).update('history', function (h) {
    return h.add(newBoard.get('stones'));
  });
}

function pass(game, player) {
  return play(game, player, null);
}

function areaScore(game) {
  var komi = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.0;

  var boardScore = (0, _board.areaScore)(game.get('board'));
  return boardScore.black - (boardScore.white + komi);
}
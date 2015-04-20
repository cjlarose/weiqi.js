# weiqi.js [![Build Status](https://travis-ci.org/cjlarose/weiqi.js.svg?branch=master)](https://travis-ci.org/cjlarose/weiqi.js)

`weiqi.js` is an implementation of the board game [Go][1]. It provides
mechanisms for representing a board with black and white stones, as well as the
logic to actually play a game. The objects used in `weiqi.js` are
[persistent][2]--methods often return entirely new instances instead of
mutating internal state.

Persistence and structural sharing offer a memory-efficient way to represent multiple
states of the board simutaneously, a desirable trait for applications where
you'd like to explore the history of the game (such as for review) or to
explore possible future responses (such as for AI decision-making).

[1]: http://en.wikipedia.org/wiki/Go_%28game%29
[2]: http://en.wikipedia.org/wiki/Persistent_data_structure

The library is available as an [`npm` package][3], and can be used in the
browser with tools like [browserify][4].

[3]: https://www.npmjs.com/package/weiqi
[4]: http://browserify.org/

**Note: This library's API is still unstable. There will be breaking API
changes in future releases.**

## Playing a game

```javascript
var Weiqi = require('weiqi');
var game = Weiqi.createGame(9)            // creates a game with a 9 x 9 board
                .play(Weiqi.BLACK, [2,2]) // positions are 0-indexed. Black plays at the 3-3 point.
                .play(Weiqi.WHITE, [6,6]) // white plays at the 7-7 corner.
                .pass(Weiqi.BLACK)        // black passes
                .pass(Weiqi.WHITE);       // white passes
```

`Weiqi.Game` handles captures appropriately. It forbids the same color playing twice.
It enforces [positional superko][5]--at the end of any turn, the board cannot
be in a state in which it has been previously.

[5]: http://senseis.xmp.net/?Superko

To see where all the stones are, use `game.getBoard().getIntersections()`. This returns an [`Immutable.Seq`][6] of [`Immutable.Seq`][6]s.

[6]: http://facebook.github.io/immutable-js/docs/#/Seq

```javascript
> game.getBoard().getIntersections()
Seq [ Seq [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
      Seq [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
      Seq [ ".", ".", "x", ".", ".", ".", ".", ".", "." ],
      Seq [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
      Seq [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
      Seq [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
      Seq [ ".", ".", ".", ".", ".", ".", "o", ".", "." ],
      Seq [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
      Seq [ ".", ".", ".", ".", ".", ".", ".", ".", "." ] ]
```

Alternatively, you can retrieve the board state as a standard JavaScript Array.

```javascript
> game.getBoard().toArray()
[ [ '.', '.', '.', '.', '.', '.', '.', '.', '.' ],
  [ '.', '.', '.', '.', '.', '.', '.', '.', '.' ],
  [ '.', '.', 'x', '.', '.', '.', '.', '.', '.' ],
  [ '.', '.', '.', '.', '.', '.', '.', '.', '.' ],
  [ '.', '.', '.', '.', '.', '.', '.', '.', '.' ],
  [ '.', '.', '.', '.', '.', '.', '.', '.', '.' ],
  [ '.', '.', '.', '.', '.', '.', 'o', '.', '.' ],
  [ '.', '.', '.', '.', '.', '.', '.', '.', '.' ],
  [ '.', '.', '.', '.', '.', '.', '.', '.', '.' ] ]
```

To compute the score of the game (using [area score][6]) pass a value of komi to `areaScore()`. All stones are considered alive.

[6]: http://senseis.xmp.net/?Scoring

```javascript
game.areaScore(7.5);  // compute area score given 7.5 komi
```

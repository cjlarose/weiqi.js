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
browser with tools like [browserify][4]. If you don't want to use browserify,
there is a pre-built file in the `dist-browser` directory that you can include
in your browser-targeted projects right away. Access `Weiqi` with the global
`Weiqi` variable in this case.

[3]: https://www.npmjs.com/package/weiqi
[4]: http://browserify.org/

## Usage

### Creating a game

```javascript
var Weiqi = require('weiqi');
var game = Weiqi.createGame(9);  // creates a game on a 9 x 9 board
game = Weiqi.createGame(13);  // creates a game on a 13 x 13 board
game = Weiqi.createGame(19);  // creates a game on a 19 x 19 board
```

### Playing a game

```javascript
var Weiqi = require('weiqi');
var game = Weiqi.createGame(9)
                .play(Weiqi.BLACK, [2,2])
                .play(Weiqi.WHITE, [6,7])
                .pass(Weiqi.BLACK)  // black passes
                .pass(Weiqi.WHITE); // white passes
```

`Game.play` and `Game.pass` each take a player identifier (`Weiqi.BLACK` or `Weiqi.WHITE`). `Game.play` takes an additional zero-indexed array of size two that indicates the position to place a stone. `Game.play` will raise exceptions for the following situations:
* the game is already over (there have already been two consecutive passes)
* it is not currently the turn of the player who is attempting to play
* the move violates [positional superko][5] (at the end of any turn, the board cannot
be in a state in which it has been previously).

[5]: http://senseis.xmp.net/?Superko

### Querying the game

`getCurrentPlayer` returns either `Weiqi.BLACK` or `Weiqi.WHITE`. The example below shows that `Weiqi.WHITE === "o"`, but don't depend on that always being true. Always perform comparisons to `Weiqi.BLACK` and `Weiqi.WHITE`.

```javascript
> var Weiqi = require('weiqi');
> var game = Weiqi.createGame(9)
                .play(Weiqi.BLACK, [2,2]);
> game.getCurrentPlayer();
"o"
```

`isOver` returns true iff there have been two consecutive passes.

```javascript
> var Weiqi = require('weiqi');
> var game = Weiqi.createGame(9)
                .play(Weiqi.BLACK, [2,2]);
> game.isOver();
false
> game = game.pass(Weiqi.WHITE);
> game.isOver();
false
> game = game.pass(Weiqi.BLACK);
> game.isOver();
true
```

To see where all the stones are, use `game.getBoard().getIntersections()`. This returns an [`Immutable.List`][6] of [`Immutable.List`][6]s.

[6]: http://facebook.github.io/immutable-js/docs/#/List

```javascript
> game.getBoard().getIntersections()
List [ List [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
       List [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
       List [ ".", ".", "x", ".", ".", ".", ".", ".", "." ],
       List [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
       List [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
       List [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
       List [ ".", ".", ".", ".", ".", ".", "o", ".", "." ],
       List [ ".", ".", ".", ".", ".", ".", ".", ".", "." ],
       List [ ".", ".", ".", ".", ".", ".", ".", ".", "." ] ]
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

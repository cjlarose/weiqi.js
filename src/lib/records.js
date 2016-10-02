import Immutable from 'immutable';

export const Position = new Immutable.Record({ i: 0, j: 0 });
export const Move = new Immutable.Record({ position: new Position(), stoneColor: 'black' });
export const Group = new Immutable.Record({
  stones: new Immutable.Set(),
  liberties: new Immutable.Set(),
});

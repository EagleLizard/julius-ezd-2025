
/*
  For simulating events over time.
  1 tick = 1 time step / cycle
_*/

type Clockable = {
  tick: number; // The moment the event occurs
} & {};

export class EventClock<T extends Clockable> {
  startTick: number;
  endTick: number;
  currTick: number;
  items: T[];
  private _tickCb?: (tickItems: T[], currTick?: number) => void;
  constructor(items: T[]) {
    let minTick: number;
    let maxTick: number;
    this.items = items;

    minTick = Infinity;
    maxTick = -Infinity;
    for(let i = 0; i < this.items.length; ++i) {
      let item = this.items[i];
      if(item.tick < minTick) {
        minTick = item.tick;
      }
      if(item.tick > maxTick) {
        maxTick = item.tick;
      }
    }
    this.startTick = minTick;
    this.endTick = maxTick;
    this.currTick = this.startTick;
  }
  onTick(tickCb: (tickItems: T[], currTick?: number) => void) {
    this._tickCb = tickCb;
  }
  tick(): number | undefined {
    let currItems: T[];
    let currTick = this.currTick;
    if(currTick > this.endTick) {
      return undefined;
    }
    currItems = this.items.filter((item) => {
      return item.tick === currTick;
    });
    this.currTick++;
    this._tickCb?.(currItems, currTick);
    return currTick;
  }
}

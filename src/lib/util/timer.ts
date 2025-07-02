
export class Timer {
  startTime: bigint;
  endTime?: bigint;
  private constructor(
    startTime: bigint,
    endTime?: bigint,
  ) {
    this.startTime = startTime;
    this.endTime = endTime;
  }

  static start(): Timer {
    let timer: Timer;
    let startTime: bigint;
    startTime = process.hrtime.bigint();
    timer = new Timer(startTime);
    return timer;
  }

  stop(): number {
    let endTime: bigint;
    let deltaMs: number;
    endTime = process.hrtime.bigint();
    this.endTime = endTime;
    deltaMs = Timer.getDeltaMs(this.startTime, this.endTime);
    return deltaMs;
  }

  currentMs(): number {
    return Timer.getDeltaMs(this.startTime, process.hrtime.bigint());
  }

  static getDeltaMs(start: bigint, end: bigint): number {
    return Number((end - start) / BigInt(1e3)) / 1e3;
  }
}

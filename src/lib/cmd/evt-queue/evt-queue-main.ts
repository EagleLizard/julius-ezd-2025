
import { sleep } from '../../util/sleep';
import { EventClock } from './event-clock';
import { EventQueue } from './event-queue';

type TestEvt = {
  id: number;
  val: string;
  runMs: number;
  tick: number;
} & {};

export async function evtQueueMain() {
  console.log('evt-queue main ~');
  const testEvtTuples: [ string, number, number ][] = [
    [ 'a', 10, 1 ],
    [ 'b', 20, 2 ],
    [ 'c', 30, 3 ],
    [ 'd', 0, 4 ],
    [ 'e', 5, 5 ],
    [ 'f', 15, 6 ],
  ];
  const testEvts: TestEvt[] = testEvtTuples.map((evtTuple, idx) => {
    let testEvt: TestEvt = {
      id: idx,
      val: evtTuple[0],
      runMs: evtTuple[1],
      tick: evtTuple[2],
    };
    return testEvt;
  });
  console.log('START - no queue');
  await testEvtsNoQueue(testEvts);
  console.log('END - no queue');

  console.log('START - queue');
  await testEvtsQueue(testEvts);
  console.log('END - queue');

  console.log('START - queue2');
  await testEvtQueue2(testEvts);
  console.log('END - queue2');
}

async function testEvtQueue2(evts: TestEvt[]) {
  let clock: EventClock<TestEvt>;
  let evtFnPromises: Promise<void>[];
  let doneEvts: TestEvt[];
  clock = new EventClock(evts);
  evtFnPromises = [];
  doneEvts = [];
  clock.onTick((currEvts) => {
    for(let i = 0; i < currEvts.length; i++) {
      let evt = currEvts[i];
      let evtFnPromise: Promise<void>;
      evtFnPromise = testEvtHandler(evt).then(() => {
        doneEvts.push(evt);
      });
      evtFnPromises.push(evtFnPromise);
    }
  });
  while((clock.tick()) !== undefined) {
    await sleep(0);
  }
  await Promise.all(evtFnPromises);
}

async function testEvtsQueue(evts: TestEvt[]) {
  let clock: EventClock<TestEvt>;
  let evtQueue: EventQueue<TestEvt>;
  let evtFnPromises: Promise<void>[];
  let allEvtsFiredDeferred: PromiseWithResolvers<void>;
  clock = new EventClock(evts);
  evtFnPromises = [];
  allEvtsFiredDeferred = Promise.withResolvers();
  let evtFn = (evt: TestEvt, doneCb: (err?: unknown) => void) => {
    let evtFnPromise: Promise<void>;
    evtFnPromise = testEvtHandler(evt).then(() => {
      doneCb();
    }).catch((err) => {
      doneCb(err);
    });
    evtFnPromises.push(evtFnPromise);
    if(evtFnPromises.length >= evts.length) {
      allEvtsFiredDeferred.resolve();
    }
  };
  evtQueue = new EventQueue((evt, doneCb) => {
    evtFn(evt, doneCb);
  });
  clock.onTick((currEvts) => {
    for(let i = 0; i < currEvts.length; i++) {
      let evt = currEvts[i];
      evtQueue.push(evt);
    }
  });
  while(clock.tick() !== undefined) {
    /* tested with 0, 10, 100 _*/
    await sleep(0);
  }
  await allEvtsFiredDeferred.promise;
  await Promise.all(evtFnPromises);
}

async function testEvtsNoQueue(evts: TestEvt[]) {
  let clock: EventClock<TestEvt>;
  let evtFnPromises: Promise<void>[];
  clock = new EventClock(evts);
  evtFnPromises = [];
  clock.onTick((currEvts) => {
    for(let i = 0; i < currEvts.length; i++) {
      let evt = currEvts[i];
      let evtFnPromise: Promise<void>;
      evtFnPromise = testEvtHandler(evt);
      evtFnPromises.push(evtFnPromise);
    }
  });
  while(clock.tick() !== undefined) {
    await sleep(0);
  }
  await Promise.all(evtFnPromises);
}

async function testEvtHandler(evt: TestEvt) {
  await sleep(evt.runMs);
  console.log(`${evt.id} - ${evt.val}`);
}

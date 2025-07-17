
import { sleep } from '../../util/sleep';
import { EventQueue } from './event-queue';

type TestEvt = {
  id: number;
  val: string;
  runMs: number;
} & {};

export async function evtQueueMain() {
  console.log('evt-queue main ~');
  const testEvtTuples: [ string, number ][] = [
    [ 'a', 10 ],
    [ 'b', 20 ],
    [ 'c', 30 ],
    [ 'd', 0 ],
    [ 'e', 5 ],
    [ 'f', 15 ],
  ];
  const testEvts: TestEvt[] = testEvtTuples.map((evtTuple, idx) => {
    let testEvt: TestEvt = {
      id: idx,
      val: evtTuple[0],
      runMs: evtTuple[1],
    };
    return testEvt;
  });
  console.log('START - no queue');
  await testEvtsNoQueue(testEvts);
  console.log('END - no queue');

  console.log('START - with queue');
  await testEvtsQueue(testEvts);
  console.log('END - with queue');
}

async function testEvtsQueue(evts: TestEvt[]) {
  let evtQueue: EventQueue<TestEvt>;
  let evtFnPromises: Promise<void>[];
  let drainPromise: Promise<void>;
  evtFnPromises = [];
  let evtFn = (evt: TestEvt, doneCb: (err?: unknown) => void) => {
    let evtFnPromise: Promise<void>;
    evtFnPromise = testEvtHandler(evt).then(() => {
      doneCb();
    }).catch((err) => {
      doneCb(err);
    });
    evtFnPromises.push(evtFnPromise);
  };
  evtQueue = new EventQueue((evt, doneCb) => {
    evtFn(evt, doneCb);
  });
  drainPromise = new Promise((resolve) => {
    evtQueue.drain(() => {
      resolve();
    });
  });
  for(let i = 0; i < evts.length; i++) {
    let evt = evts[i];
    evtQueue.push(evt);
  }
  await drainPromise;
  await Promise.all(evtFnPromises);
}

async function testEvtsNoQueue(evts: TestEvt[]) {
  let evtFnPromises: Promise<void>[];
  evtFnPromises = [];
  let evtFn = async (evt: TestEvt) => {
    await testEvtHandler(evt);
  };
  for(let i = 0; i < evts.length; i++) {
    let evtFnPromise: Promise<void>;
    let evt = evts[i];
    evtFnPromise = evtFn(evt);
    evtFnPromises.push(evtFnPromise);
  }
  await Promise.all(evtFnPromises);
}

async function testEvtHandler(evt: TestEvt) {
  await sleep(evt.runMs);
  console.log(`${evt.id} - ${evt.val}`);
}

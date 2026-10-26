// Seek Determinism Test runner for NodeJS
class TimelineState {
  constructor() {
    this.currentTimestampNs = 0;
    this.minTimestampNs = 0;
    this.maxTimestampNs = 0;
    this.events = [];
    this.checkpoints = [];
    this.activeCheckpoint = null;
    this.activeEvent = null;
  }

  setSession(meta, events, checkpoints) {
    this.events = events;
    this.checkpoints = checkpoints;
    if (events.length > 0) {
      this.minTimestampNs = events[0].timestamp_ns;
      this.maxTimestampNs = events[events.length - 1].timestamp_ns;
      this.seekToTimestamp(this.minTimestampNs);
    }
  }

  seekToTimestamp(ts) {
    this.currentTimestampNs = Math.max(this.minTimestampNs, Math.min(ts, this.maxTimestampNs));
    let nearestEvent = null;
    for (const ev of this.events) {
      if (ev.timestamp_ns <= this.currentTimestampNs) {
        nearestEvent = ev;
      } else {
        break;
      }
    }
    this.activeEvent = nearestEvent || (this.events[0] || null);

    let nearestCp = null;
    for (const cp of this.checkpoints) {
      if (cp.timestamp_ns <= this.currentTimestampNs) {
        nearestCp = cp;
      } else {
        break;
      }
    }
    this.activeCheckpoint = nearestCp || (this.checkpoints[0] || null);
  }
}

function runSeekDeterminismTest() {
  console.log('[TEST] Running Web Cockpit Seek Determinism Test...');

  const store = new TimelineState();
  const sampleMeta = { session_id: 'test-seek-run' };
  const sampleEvents = [
    { seq_id: 1, timestamp_ns: 1000, kind: 'session_start' },
    { seq_id: 2, timestamp_ns: 5000, kind: 'tool_call' },
    { seq_id: 3, timestamp_ns: 12000, kind: 'checkpoint' },
    { seq_id: 4, timestamp_ns: 25000, kind: 'tool_call' },
    { seq_id: 5, timestamp_ns: 40000, kind: 'checkpoint' }
  ];
  const sampleCheckpoints = [
    { id: 'chk_1', timestamp_ns: 12000 },
    { id: 'chk_2', timestamp_ns: 40000 }
  ];

  store.setSession(sampleMeta, sampleEvents, sampleCheckpoints);

  store.seekToTimestamp(15000);
  const stateA_cp = store.activeCheckpoint?.id;
  const stateA_ev = store.activeEvent?.seq_id;
  if (stateA_cp !== 'chk_1' || stateA_ev !== 3) {
    throw new Error('Initial seek failed');
  }

  store.seekToTimestamp(45000);
  const stateB_cp = store.activeCheckpoint?.id;
  const stateB_ev = store.activeEvent?.seq_id;
  if (stateB_cp !== 'chk_2' || stateB_ev !== 5) {
    throw new Error('Second seek failed');
  }

  // Seek BACK to 15000
  store.seekToTimestamp(15000);
  if (store.activeCheckpoint?.id !== stateA_cp || store.activeEvent?.seq_id !== stateA_ev) {
    throw new Error('DETERMINISM VIOLATION: Invariant broken on seek back');
  }

  // 1,000 rapid seek iterations
  for (let i = 0; i < 1000; i++) {
    const target = (i % 2 === 0) ? 15000 : 45000;
    store.seekToTimestamp(target);
    const expected = (i % 2 === 0) ? 'chk_1' : 'chk_2';
    if (store.activeCheckpoint?.id !== expected) {
      throw new Error(`Oscillation failure at step ${i}`);
    }
  }

  console.log('[PASS] Seek Determinism Test passed: 1,000 seek operations verified 100% deterministic.');
}

runSeekDeterminismTest();

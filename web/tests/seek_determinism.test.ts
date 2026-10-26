import { TimelineState } from '../src/state/timelineStore';

export function runSeekDeterminismTest() {
  console.log('[TEST] Running Seek Determinism Test...');

  const store = new TimelineState();
  const sampleMeta = {
    session_id: 'test-seek-run',
    task_name: 'Seek Determinism Test',
    model: 'muse-spark-1026',
    agent_framework: 'muse_code',
    git_branch: 'main'
  };

  const sampleEvents = [
    { seq_id: 1, timestamp_ns: 1000, kind: 'session_start', flags: 0, payload: {} },
    { seq_id: 2, timestamp_ns: 5000, kind: 'tool_call', flags: 0, payload: { tool: 'bash' } },
    { seq_id: 3, timestamp_ns: 12000, kind: 'checkpoint', flags: 1, payload: { id: 'chk_1' } },
    { seq_id: 4, timestamp_ns: 25000, kind: 'tool_call', flags: 0, payload: { tool: 'edit' } },
    { seq_id: 5, timestamp_ns: 40000, kind: 'checkpoint', flags: 1, payload: { id: 'chk_2' } }
  ];

  const sampleCheckpoints = [
    { id: 'chk_1', git_tree_hash: 'tree_1', event_offset: 3, timestamp_ns: 12000, files_modified: ['file1.cpp'], additions: 10, deletions: 0, summary: 'cp 1', raw_patch: '' },
    { id: 'chk_2', git_tree_hash: 'tree_2', event_offset: 5, timestamp_ns: 40000, files_modified: ['file2.cpp'], additions: 20, deletions: 5, summary: 'cp 2', raw_patch: '' }
  ];

  store.setSession(sampleMeta, sampleEvents as any, sampleCheckpoints as any);

  // Seek to 15000 ns -> Should select chk_1 and seq 3
  store.seekToTimestamp(15000);
  const stateA_cp = store.activeCheckpoint?.id;
  const stateA_ev = store.activeEvent?.seq_id;

  if (stateA_cp !== 'chk_1' || stateA_ev !== 3) {
    throw new Error(`Seek to 15000 failed: got cp=${stateA_cp}, ev=${stateA_ev}`);
  }

  // Seek away to 45000 ns -> Should select chk_2 and seq 5
  store.seekToTimestamp(45000);
  const stateB_cp = store.activeCheckpoint?.id;
  const stateB_ev = store.activeEvent?.seq_id;

  if (stateB_cp !== 'chk_2' || stateB_ev !== 5) {
    throw new Error(`Seek to 45000 failed: got cp=${stateB_cp}, ev=${stateB_ev}`);
  }

  // Seek BACK to 15000 ns -> MUST produce exact same stateA
  store.seekToTimestamp(15000);
  const restored_cp = store.activeCheckpoint?.id;
  const restored_ev = store.activeEvent?.seq_id;

  if (restored_cp !== stateA_cp || restored_ev !== stateA_ev) {
    throw new Error('DETERMINISM VIOLATION: Seeking back to 15000 ns produced different state!');
  }

  // Rapid oscillation test across 1000 seeks
  for (let i = 0; i < 1000; i++) {
    const target = (i % 2 === 0) ? 15000 : 45000;
    store.seekToTimestamp(target);
    const expectedCp = (i % 2 === 0) ? 'chk_1' : 'chk_2';
    if (store.activeCheckpoint?.id !== expectedCp) {
      throw new Error(`Oscillation failure at step ${i}`);
    }
  }

  console.log('[PASS] Seek Determinism Test passed: 1000 seeks verified 100% deterministic.');
}

runSeekDeterminismTest();

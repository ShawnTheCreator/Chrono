import { Checkpoint, CEPEvent, SessionMetadata, StallAlert, Narration } from '../types';

export class TimelineState {
  currentTimestampNs: number = 0;
  minTimestampNs: number = 0;
  maxTimestampNs: number = 400000000000;
  isPlaying: boolean = false;
  playbackSpeed: number = 1.0;

  metadata: SessionMetadata | null = null;
  events: CEPEvent[] = [];
  checkpoints: Checkpoint[] = [];
  activeCheckpoint: Checkpoint | null = null;
  activeEvent: CEPEvent | null = null;
  stalls: StallAlert[] = [];
  activeNarration: Narration | null = null;
  isNarrating: boolean = false;

  private listeners: Set<() => void> = new Set();

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  notify() {
    this.listeners.forEach((l) => l());
  }

  setSession(meta: SessionMetadata, events: CEPEvent[], checkpoints: Checkpoint[]) {
    this.metadata = meta;
    this.events = events;
    this.checkpoints = checkpoints;

    if (events.length > 0) {
      this.minTimestampNs = events[0].timestamp_ns;
      this.maxTimestampNs = events[events.length - 1].timestamp_ns;
      this.seekToTimestamp(this.minTimestampNs);
    }
    this.notify();
  }

  seekToTimestamp(ts: number) {
    this.currentTimestampNs = Math.max(this.minTimestampNs, Math.min(ts, this.maxTimestampNs));

    // Find nearest event at or before ts
    let nearestEvent: CEPEvent | null = null;
    for (const ev of this.events) {
      if (ev.timestamp_ns <= this.currentTimestampNs) {
        nearestEvent = ev;
      } else {
        break;
      }
    }
    this.activeEvent = nearestEvent || (this.events[0] || null);

    // Find nearest checkpoint at or before ts
    let nearestCp: Checkpoint | null = null;
    for (const cp of this.checkpoints) {
      if (cp.timestamp_ns <= this.currentTimestampNs) {
        nearestCp = cp;
      } else {
        break;
      }
    }
    this.activeCheckpoint = nearestCp || (this.checkpoints[0] || null);
    this.notify();
  }

  seekToSequence(seq: number) {
    const target = this.events.find((e) => e.seq_id === seq);
    if (target) {
      this.seekToTimestamp(target.timestamp_ns);
    }
  }

  selectCheckpoint(cp: Checkpoint) {
    this.activeCheckpoint = cp;
    this.seekToTimestamp(cp.timestamp_ns);
  }

  setPlaying(playing: boolean) {
    this.isPlaying = playing;
    this.notify();
  }

  setNarration(narration: Narration | null, isNarrating: boolean = false) {
    this.activeNarration = narration;
    this.isNarrating = isNarrating;
    this.notify();
  }
}

export const store = new TimelineState();

export interface Checkpoint {
  id: string;
  git_tree_hash: string;
  event_offset: number;
  timestamp_ns: number;
  files_modified: string[];
  additions: number;
  deletions: number;
  summary: string;
  raw_patch: string;
}

export interface CEPEvent {
  seq_id: number;
  timestamp_ns: number;
  kind: string;
  flags: number;
  payload: any;
}

export interface SessionMetadata {
  session_id: string;
  task_name: string;
  model: string;
  agent_framework: string;
  git_branch: string;
  duration_seconds?: number;
  total_tokens?: number;
  terminal_hash?: string;
}

export interface StallAlert {
  pattern: string;
  cycle_count: number;
  culprit: string;
  confidence: number;
  description: string;
  suggested_intervention?: string;
  triggered_at_seq?: number;
  triggered_at_ts?: number;
}

export interface Narration {
  headline: string;
  causal_chain: string;
  hypothesis: string;
  verdict: 'FIXED' | 'PARTIAL' | 'REGRESSION' | 'STALL_RISK';
  risk_score: number;
  provider?: string;
  is_live?: boolean;
  model?: string;
}

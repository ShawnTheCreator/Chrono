import { store } from '../state/timelineStore';

const BACKEND_URL = 'http://127.0.0.1:8000';

export class SessionClient {
  private eventSource: EventSource | null = null;
  private pollInterval: any = null;

  async init() {
    await this.fetchSessions();
  }

  async fetchSessions() {
    try {
      const res = await fetch(`${BACKEND_URL}/sessions`);
      if (res.ok) {
        const data = await res.json();
        if (data.sessions && Array.isArray(data.sessions)) {
          store.setAvailableSessions(data.sessions);
          return data.sessions;
        }
      }
    } catch (err) {
      console.warn('Backend /sessions unreachable, using fallback session list.');
    }
    return null;
  }

  async connect(sessionId: string) {
    this.disconnect();

    try {
      // 1. Fetch Session Details, Checkpoints & File Tree from Backend
      const sessionRes = await fetch(`${BACKEND_URL}/sessions/${sessionId}`);
      let sessionData: any = null;
      if (sessionRes.ok) {
        sessionData = await sessionRes.json();
      }

      // 2. Fetch Real Events from Backend
      const eventsRes = await fetch(`${BACKEND_URL}/sessions/${sessionId}/events?limit=3000`);
      let events: any[] = [];
      if (eventsRes.ok) {
        const evData = await eventsRes.json();
        if (evData && Array.isArray(evData.events)) {
          events = evData.events;
        }
      }

      if (sessionData) {
        store.setBackendSession(
          sessionData.metadata || { session_id: sessionId },
          events,
          sessionData.checkpoints || [],
          sessionData.tree || []
        );
      }

      // 3. Fetch Telemetry from Backend
      this.fetchTelemetry(sessionId);

      // 4. Fetch Verification Receipt from Backend
      this.fetchVerification(sessionId);

      // 5. Fetch Initial File Diff from Backend
      const initialFile = sessionData?.checkpoints?.[0]?.files_modified?.[0] || 'core/src/stall_detector.cpp';
      const initialCpId = sessionData?.checkpoints?.[0]?.id;
      this.fetchFileDiff(sessionId, initialFile, initialCpId);

      // 6. Fetch Initial Causal Narration from Backend
      if (sessionData?.checkpoints && sessionData.checkpoints.length > 0) {
        const activeCp = sessionData.checkpoints.find((c: any) => c.id === 'chk_04n112tt8a') || sessionData.checkpoints[sessionData.checkpoints.length - 1];
        this.narrateCheckpoint(activeCp);
      }
    } catch (err) {
      console.warn('Backend connect failed, fallback will be used:', err);
      store.loadSessionById(sessionId);
    }
  }

  async fetchFileDiff(sessionId: string, file: string, checkpointId?: string) {
    try {
      const url = new URL(`${BACKEND_URL}/sessions/${sessionId}/diff`);
      url.searchParams.set('file', file);
      if (checkpointId) {
        url.searchParams.set('checkpoint_id', checkpointId);
      }
      const res = await fetch(url.toString());
      if (res.ok) {
        const data = await res.json();
        store.setActiveFileDiff(data);
        return data;
      }
    } catch (err) {
      console.warn('Backend /diff error:', err);
    }
    return null;
  }

  async fetchTelemetry(sessionId: string) {
    try {
      const res = await fetch(`${BACKEND_URL}/sessions/${sessionId}/telemetry`);
      if (res.ok) {
        const data = await res.json();
        store.setSessionTelemetry(data);
        return data;
      }
    } catch (err) {
      console.warn('Backend /telemetry error:', err);
    }
    return null;
  }

  async fetchVerification(sessionId: string) {
    try {
      const res = await fetch(`${BACKEND_URL}/sessions/${sessionId}/verify`);
      if (res.ok) {
        const data = await res.json();
        store.setVerificationReceipt(data);
        return data;
      }
    } catch (err) {
      console.warn('Backend /verify error:', err);
    }
    return null;
  }

  async narrateCheckpoint(cp: any) {
    if (!cp) return null;
    try {
      const res = await fetch(`${BACKEND_URL}/checkpoints/${cp.id}/narrate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          checkpoint_id: cp.id,
          git_tree_hash: cp.git_tree_hash,
          raw_patch: cp.raw_patch,
          summary: cp.summary,
          files_modified: cp.files_modified || []
        })
      });
      if (res.ok) {
        const data = await res.json();
        store.setNarration(data);
        return data;
      }
    } catch (err) {
      console.warn('Backend /narrate error:', err);
    }
    store.hydrateNarrationForCheckpoint(cp);
    return null;
  }

  async requestSuggestion(pattern: string = 'IDENTICAL_DIFF_LOOP', culprit: string = 'core/src/stall_detector.cpp', cycleCount: number = 3) {
    try {
      const res = await fetch(`${BACKEND_URL}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pattern,
          culprit,
          cycle_count: cycleCount,
          description: 'Agent repeated identical diff without resolving test failure'
        })
      });
      if (res.ok) {
        const data = await res.json();
        const injection = typeof data === 'string' ? data : (data.prompt_injection || data.recommended_action);
        store.setIntervention(injection);
        return data;
      }
    } catch (err) {
      console.warn('Backend /suggest error:', err);
    }
    store.setIntervention('INTERVENTION: Inspect threshold_cycles_ parameter in StallDetector constructor instead of re-applying identical diff.');
    return null;
  }

  disconnect() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

export const sessionClient = new SessionClient();

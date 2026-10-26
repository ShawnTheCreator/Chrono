import { store } from '../state/timelineStore';
import { CEPEvent } from '../types';

export class SessionClient {
  private eventSource: EventSource | null = null;
  private pollInterval: any = null;

  connect(sessionId: string) {
    this.disconnect();

    // Fetch initial session metadata and checkpoints
    fetch(`http://localhost:8000/sessions/${sessionId}`)
      .then((res) => res.json())
      .then((data) => {
        // Then fetch initial events
        fetch(`http://localhost:8000/sessions/${sessionId}/events?limit=2000`)
          .then((r) => r.json())
          .then((evData) => {
            if (evData && Array.isArray(evData.events) && evData.events.length > 0) {
              store.setSession(data.metadata || { session_id: sessionId }, evData.events, data.checkpoints || []);
            }
          });
      })
      .catch(() => {
        console.warn('Bridge service offline, using committed fixture state.');
      });
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

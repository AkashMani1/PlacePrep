import * as Y from 'yjs';
import { RealtimeChannel } from '@supabase/supabase-js';

export class SupabaseProvider {
  doc: Y.Doc;
  channel: RealtimeChannel;
  private awareness: any;
  private isDestroyed = false;

  constructor(channel: RealtimeChannel, doc: Y.Doc) {
    this.channel = channel;
    this.doc = doc;
    
    // Yjs Awareness (stubbed for compatibility if needed, but not fully implemented)
    // We just need basic doc sync for now
    this.awareness = {
      on: () => {},
      off: () => {},
      getStates: () => new Map(),
      setLocalStateField: () => {}
    };

    // Listen for local changes and send to Supabase
    this.doc.on('update', (update: Uint8Array, origin: any) => {
      if (origin === this || this.isDestroyed) return; // Don't broadcast updates we just received
      const updateArray = Array.from(update);
      this.channel.send({
        type: 'broadcast',
        event: 'yjs_update',
        payload: { update: updateArray }
      }).catch(err => console.error('[Yjs] Broadcast error:', err));
    });

    // Listen for remote changes from Supabase
    this.channel.on('broadcast', { event: 'yjs_update' }, ({ payload }) => {
      if (this.isDestroyed) return;
      try {
        const update = new Uint8Array(payload.update);
        Y.applyUpdate(this.doc, update, this);
      } catch (err) {
        console.error('[Yjs] Apply update error:', err);
      }
    });

    // Initial state exchange (request state from peers)
    this.channel.on('broadcast', { event: 'yjs_request_state' }, () => {
      if (this.isDestroyed) return;
      const state = Y.encodeStateAsUpdate(this.doc);
      this.channel.send({
        type: 'broadcast',
        event: 'yjs_update',
        payload: { update: Array.from(state) }
      });
    });

    // Subscribe and request state
    if (this.channel.state === 'closed') {
       this.channel.subscribe((status) => {
         if (status === 'SUBSCRIBED') {
           this.channel.send({ type: 'broadcast', event: 'yjs_request_state' });
         }
       });
    } else if (this.channel.state === 'joined') {
       this.channel.send({ type: 'broadcast', event: 'yjs_request_state' });
    }
  }

  destroy() {
    this.isDestroyed = true;
    this.doc.off('update', () => {});
  }
}

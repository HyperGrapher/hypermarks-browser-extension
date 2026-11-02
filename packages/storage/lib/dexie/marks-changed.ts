import type { Transaction } from 'dexie';

/** Runtime message sent to the background whenever saved items were added, updated or deleted. */
export const MARKS_CHANGED_ACTION = 'marksChanged';

type Listener = () => void;
const listeners = new Set<Listener>();
// A bulk write fires the table hooks once per row, but the change is announced once per transaction
const announced = new WeakSet<object>();

/**
 * Subscribes to changes of saved items made from this same context (the runtime message does not reach the
 * context that sent it). Returns an unsubscribe function.
 */
export function onMarksChanged(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function announce() {
  listeners.forEach(listener => {
    try {
      listener();
    } catch (error) {
      console.error('marks changed listener failed', error);
    }
  });

  // Tells the background (and other extension pages) about changes made from the popup, side panel, etc.
  if (typeof chrome !== 'undefined' && chrome.runtime?.id) {
    try {
      chrome.runtime.sendMessage({ action: MARKS_CHANGED_ACTION }).catch(() => {
        // Nobody listening, e.g. the background is not running yet. Nothing to do.
      });
    } catch {
      // Extension context invalidated (extension reloaded while the page stayed open)
    }
  }
}

/** Table hook helper: announces the change once the transaction that made it has committed. */
export function announceMarksChangedOnComplete(transaction: Transaction) {
  if (announced.has(transaction)) return;
  announced.add(transaction);
  transaction.on('complete', announce);
}

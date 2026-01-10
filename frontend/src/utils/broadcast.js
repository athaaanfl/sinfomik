// frontend/src/utils/broadcast.js
// Simple BroadcastChannel + localStorage fallback for cross-tab signaling
const CHANNEL_NAME = 'sinfomik-updates';

export const notifyDataChange = (resource, payload = null) => {
  try {
    if (typeof BroadcastChannel !== 'undefined') {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      bc.postMessage({ resource, payload });
      bc.close();
    } else if (typeof window !== 'undefined') {
      // localStorage event fallback - write then remove a key
      const key = `sinfomik-update:${resource}`;
      try {
        localStorage.setItem(key, JSON.stringify({ ts: Date.now(), payload }));
        // remove to avoid buildup
        setTimeout(() => localStorage.removeItem(key), 1000);
      } catch (e) {
        // ignore storage errors
      }
    }
  } catch (err) {
    // best-effort only
    console.warn('notifyDataChange failed', err);
  }
};

export const subscribeDataChange = (handler) => {
  let bc = null;
  const onStorage = (e) => {
    if (!e.key) return;
    if (e.key.startsWith('sinfomik-update:')) {
      const resource = e.key.split(':')[1];
      handler({ resource, payload: null });
    }
  };

  if (typeof BroadcastChannel !== 'undefined') {
    bc = new BroadcastChannel(CHANNEL_NAME);
    const listener = (ev) => handler(ev.data);
    bc.addEventListener('message', listener);
    return () => {
      bc.removeEventListener('message', listener);
      bc.close();
    };
  } else {
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }
};
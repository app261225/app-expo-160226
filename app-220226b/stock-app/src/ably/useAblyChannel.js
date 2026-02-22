import { useEffect, useRef } from 'react';
import { sub, unsub } from './ablyService';

/**
 * Hook untuk subscribe ke Ably channel di dalam React component.
 * Otomatis unsubscribe saat komponen unmount.
 *
 * @param {string}   channelName  - nama channel
 * @param {string}   eventName    - nama event
 * @param {Function} callback     - handler saat pesan datang
 *
 * Contoh:
 * useAblyChannel('stock', 'stock-in', (message) => {
 *   console.log('Stock in:', message.data);
 * });
 */
const useAblyChannel = (channelName, eventName, callback) => {
  // Simpan referensi callback supaya unsub bisa pakai referensi yang sama
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  useEffect(() => {
    // Bungkus dalam fungsi stable supaya referensi tidak berubah
    const handler = (message) => callbackRef.current(message);

    sub(channelName, eventName, handler);

    return () => {
      unsub(channelName, eventName, handler);
    };
  }, [channelName, eventName]);
};

export default useAblyChannel;
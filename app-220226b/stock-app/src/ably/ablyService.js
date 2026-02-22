import ablyClient from './ablyClient';

/**
 * Helper internal — ambil channel instance.
 * Ably otomatis reuse channel yang sama jika nama sama.
 */
const getChannel = (channelName) => ablyClient.channels.get(channelName);

/**
 * pub — Kirim data ke channel.
 *
 * @param {string} channelName  - nama channel, contoh: 'stock'
 * @param {string} eventName    - nama event, contoh: 'stock-in'
 * @param {any}    data         - data yang dikirim (object, string, number)
 *
 * Contoh:
 * await pub('stock', 'stock-in', { productId: '1', qty: 1 });
 */
export const pub = async (channelName, eventName, data) => {
  try {
    const channel = getChannel(channelName);
    await channel.publish(eventName, data);
  } catch (error) {
    console.error(`[Ably] pub failed — ${channelName}/${eventName}:`, error);
    throw error;
  }
};

/**
 * sub — Dengarkan event di channel.
 *
 * @param {string}   channelName  - nama channel
 * @param {string}   eventName    - nama event
 * @param {Function} callback     - dipanggil saat pesan datang
 *
 * Contoh:
 * sub('stock', 'stock-in', (message) => {
 *   console.log(message.data);
 * });
 */
export const sub = (channelName, eventName, callback) => {
  try {
    const channel = getChannel(channelName);
    channel.subscribe(eventName, callback);
  } catch (error) {
    console.error(`[Ably] sub failed — ${channelName}/${eventName}:`, error);
    throw error;
  }
};

/**
 * unsub — Berhenti mendengarkan event di channel.
 *
 * @param {string}   channelName  - nama channel
 * @param {string}   eventName    - nama event
 * @param {Function} callback     - referensi fungsi yang SAMA PERSIS saat sub()
 *
 * ⚠️ Callback harus referensi yang sama.
 * Kalau berbeda, unsub tidak akan berhasil.
 *
 * Contoh:
 * unsub('stock', 'stock-in', handleStockIn);
 */
export const unsub = (channelName, eventName, callback) => {
  try {
    const channel = getChannel(channelName);
    channel.unsubscribe(eventName, callback);
  } catch (error) {
    console.error(`[Ably] unsub failed — ${channelName}/${eventName}:`, error);
  }
};

/**
 * getHistory — Ambil pesan lama dari channel.
 *
 * @param {string} channelName        - nama channel
 * @param {Object} options
 * @param {number} options.limit      - jumlah pesan (default 20)
 * @param {string} options.direction  - 'backwards' (terbaru dulu) | 'forwards'
 *
 * Contoh:
 * const messages = await getHistory('stock', { limit: 10 });
 */
export const getHistory = async (channelName, options = { limit: 20, direction: 'backwards' }) => {
  try {
    const channel = getChannel(channelName);
    const result = await channel.history(options);
    return result.items;
  } catch (error) {
    console.error(`[Ably] getHistory failed — ${channelName}:`, error);
    throw error;
  }
};
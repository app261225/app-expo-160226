export const CHANNELS = {
  DEFAULT: 'default',
  REMINDER: 'reminder',
};

/**
 * NOTIFICATION_ACTIONS — enum semua aksi yang bisa dipicu saat notifikasi di-tap.
 *
 * Setiap notifikasi membawa { action, payload } di field `data`.
 * NotificationService membaca ini di response listener dan
 * mendelegasikan ke handler yang sesuai.
 *
 * Untuk tambah aksi baru:
 * 1. Tambah entry di sini
 * 2. Tambah handler di NotificationService.ACTION_HANDLERS
 * Tidak perlu ubah file lain.
 */
export const NOTIFICATION_ACTIONS = {
  NONE: 'none',           // tidak ada aksi khusus (default)
  NAVIGATE: 'navigate',   // navigate ke screen tertentu
  OPEN_URL: 'open_url',   // buka URL di browser
  ALERT: 'alert',         // tampilkan Alert dialog di app
  FETCH: 'fetch',         // lakukan HTTP request
  AUTOFILL: 'autofill',   // navigate ke screen + isi form otomatis
};

/**
 * NOTIFICATION_TEMPLATES — template konten notifikasi per tipe.
 * params bisa override title, body, dan data tambahan.
 */
export const NOTIFICATION_TEMPLATES = {
  general: (params = {}) => ({
    title: params.title ?? '🔔 Notifikasi',
    body: params.body ?? 'Ada sesuatu untuk kamu.',
    data: {
      action: NOTIFICATION_ACTIONS.NONE,
      ...params.data,
    },
  }),

  navigate: (params = {}) => ({
    title: params.title ?? '📱 Buka Halaman',
    body: params.body ?? 'Tap untuk membuka halaman.',
    data: {
      action: NOTIFICATION_ACTIONS.NAVIGATE,
      screen: params.screen ?? 'Demo',
      screenParams: params.screenParams ?? {},
      ...params.data,
    },
  }),

  openUrl: (params = {}) => ({
    title: params.title ?? '🌐 Buka Link',
    body: params.body ?? 'Tap untuk membuka link.',
    data: {
      action: NOTIFICATION_ACTIONS.OPEN_URL,
      url: params.url ?? 'https://expo.dev',
      ...params.data,
    },
  }),

  showAlert: (params = {}) => ({
    title: params.title ?? '⚠️ Perhatian',
    body: params.body ?? 'Tap untuk melihat detail.',
    data: {
      action: NOTIFICATION_ACTIONS.ALERT,
      alertTitle: params.alertTitle ?? 'Info',
      alertMessage: params.alertMessage ?? 'Tidak ada pesan.',
      ...params.data,
    },
  }),

  fetchData: (params = {}) => ({
    title: params.title ?? '🔄 Ambil Data',
    body: params.body ?? 'Tap untuk mengambil data terbaru.',
    data: {
      action: NOTIFICATION_ACTIONS.FETCH,
      url: params.url ?? 'https://jsonplaceholder.typicode.com/posts/1',
      method: params.method ?? 'GET',
      ...params.data,
    },
  }),

  autofill: (params = {}) => ({
    title: params.title ?? '📝 Isi Form',
    body: params.body ?? 'Tap untuk mengisi form otomatis.',
    data: {
      action: NOTIFICATION_ACTIONS.AUTOFILL,
      screen: params.screen ?? 'Demo',
      fields: params.fields ?? {},
      ...params.data,
    },
  }),

  reminder: (params = {}) => ({
    title: params.title ?? '⏰ Pengingat',
    body: params.body ?? 'Jangan lupa!',
    data: {
      action: NOTIFICATION_ACTIONS.NONE,
      ...params.data,
    },
  }),
};
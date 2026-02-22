import * as Notifications from 'expo-notifications';
import { Platform, Linking, Alert } from 'react-native';
import { CHANNELS, NOTIFICATION_TEMPLATES, NOTIFICATION_ACTIONS } from './notificationTypes';
import { navigate } from '../navigation/navigationRef';

// Singleton handler — dipanggil sekali oleh JS engine
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

let _permissionGranted = null;

const NotificationService = {
  _initialized: false,

  async init() {
    if (this._initialized) return;

    if (Platform.OS === 'android') {
      await Promise.all([
        Notifications.setNotificationChannelAsync(CHANNELS.DEFAULT, {
          name: 'Umum',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#6200EE',
          sound: 'default',
        }),
        Notifications.setNotificationChannelAsync(CHANNELS.REMINDER, {
          name: 'Pengingat',
          importance: Notifications.AndroidImportance.DEFAULT,
          sound: 'default',
        }),
      ]);
    }

    this._initialized = true;
    console.log('[NotificationService] Init complete');
  },

  resetPermissionCache() {
    _permissionGranted = null;
  },

  async hasPermission() {
    if (_permissionGranted !== null) return _permissionGranted;
    const { status } = await Notifications.getPermissionsAsync();
    _permissionGranted = status === 'granted';
    return _permissionGranted;
  },

  async requestPermission() {
    if (await this.hasPermission()) return true;

    const { status, canAskAgain } = await Notifications.getPermissionsAsync();

    if (status === 'granted') {
      _permissionGranted = true;
      return true;
    }

    if (!canAskAgain) {
      Alert.alert(
        'Notifikasi Diblokir',
        'Aktifkan notifikasi di Settings perangkat.',
        [
          { text: 'Batal', style: 'cancel' },
          { text: 'Buka Settings', onPress: () => Linking.openSettings() },
        ]
      );
      _permissionGranted = false;
      return false;
    }

    const { status: newStatus } = await Notifications.requestPermissionsAsync();
    _permissionGranted = newStatus === 'granted';
    return _permissionGranted;
  },

  /**
   * ACTION_HANDLERS — map dari NOTIFICATION_ACTIONS ke fungsi handler.
   *
   * Setiap handler menerima `data` dari notification content.
   * Untuk tambah aksi baru: cukup tambah entry baru di sini.
   * Tidak ada switch/if-else — O(1) lookup, mudah di-extend.
   */
  ACTION_HANDLERS: {
    [NOTIFICATION_ACTIONS.NONE]: (_data) => {
      console.log('[Action] NONE — tidak ada aksi');
    },

    [NOTIFICATION_ACTIONS.NAVIGATE]: (data) => {
      console.log('[Action] NAVIGATE →', data.screen, data.screenParams);
      navigate(data.screen, data.screenParams ?? {});
    },

    [NOTIFICATION_ACTIONS.OPEN_URL]: async (data) => {
      console.log('[Action] OPEN_URL →', data.url);
      const supported = await Linking.canOpenURL(data.url);
      if (supported) {
        await Linking.openURL(data.url);
      } else {
        Alert.alert('Error', `Tidak bisa membuka URL: ${data.url}`);
      }
    },

    [NOTIFICATION_ACTIONS.ALERT]: (data) => {
      console.log('[Action] ALERT →', data.alertTitle);
      Alert.alert(
        data.alertTitle ?? 'Info',
        data.alertMessage ?? '',
        [{ text: 'OK' }]
      );
    },

    [NOTIFICATION_ACTIONS.FETCH]: async (data) => {
      console.log('[Action] FETCH →', data.method, data.url);
      try {
        const response = await fetch(data.url, { method: data.method ?? 'GET' });
        const json = await response.json();
        console.log('[Action] FETCH result:', json);
        // Tampilkan preview hasil fetch sebagai Alert
        Alert.alert(
          '✅ Data Berhasil Diambil',
          `ID: ${json.id}\nTitle: ${json.title ?? JSON.stringify(json).slice(0, 80)}`,
          [{ text: 'OK' }]
        );
      } catch (err) {
        console.error('[Action] FETCH error:', err);
        Alert.alert('Fetch Gagal', err.message);
      }
    },

    [NOTIFICATION_ACTIONS.AUTOFILL]: (data) => {
      console.log('[Action] AUTOFILL → screen:', data.screen, 'fields:', data.fields);
      // Kirim fields sebagai screenParams — DemoScreen akan baca ini
      navigate(data.screen, { autofill: data.fields });
    },
  },

  /**
   * handleAction — entry point dari response listener.
   * Dipanggil oleh NotificationProvider saat user tap notifikasi.
   *
   * @param {object} data - notification.request.content.data
   */
  async handleAction(data) {
    const action = data?.action ?? NOTIFICATION_ACTIONS.NONE;
    const handler = this.ACTION_HANDLERS[action];

    if (!handler) {
      console.warn('[NotificationService] Unknown action:', action);
      return;
    }

    await handler(data);
  },

  /**
   * send() — kirim notifikasi immediate.
   *
   * @param {string} type      - key dari NOTIFICATION_TEMPLATES
   * @param {object} params    - override title/body/data
   * @param {string} channelId - Android channel
   */
  async send({
    type = 'general',
    params = {},
    channelId = CHANNELS.DEFAULT,
  } = {}) {
    const granted = await this.requestPermission();
    if (!granted) return null;

    await this.init();

    const templateFn = NOTIFICATION_TEMPLATES[type] ?? NOTIFICATION_TEMPLATES.general;
    const content = templateFn(params);

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        ...content,
        ...(Platform.OS === 'android' && {
          channelId,
          priority: 'max',
          sticky: false,
          autoDismiss: true,
        }),
      },
      trigger: null,
    });

    console.log(`[NotificationService] Sent [${type}] id: ${id}`);
    return id;
  },

  async cancelAll() {
    await Notifications.cancelAllScheduledNotificationsAsync();
    console.log('[NotificationService] All cancelled');
  },
};

export default NotificationService;
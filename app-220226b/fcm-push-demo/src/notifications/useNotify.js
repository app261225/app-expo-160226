import { useCallback } from 'react';
import { useNotificationContext } from './NotificationProvider';

/**
 * useNotify — public API hook untuk semua consumer.
 *
 * Gunakan helper shorthand untuk aksi spesifik (lebih ekspresif),
 * atau gunakan notify() langsung untuk kasus custom.
 *
 * Usage:
 *   const { notify, notifyNavigate, notifyOpenUrl,
 *           notifyAlert, notifyFetch, notifyAutofill,
 *           cancelAll } = useNotify();
 */
export function useNotify() {
  const service = useNotificationContext();

  // Generic — pass type & params manual
  const notify = useCallback(
    (type, params, channelId) => service.send({ type, params, channelId }),
    [service]
  );

  // Shorthand: navigate ke screen saat di-tap
  const notifyNavigate = useCallback(
    (screen, screenParams, params) =>
      service.send({
        type: 'navigate',
        params: { screen, screenParams, ...params },
      }),
    [service]
  );

  // Shorthand: buka URL di browser saat di-tap
  const notifyOpenUrl = useCallback(
    (url, params) =>
      service.send({
        type: 'openUrl',
        params: { url, ...params },
      }),
    [service]
  );

  // Shorthand: tampilkan Alert dialog saat di-tap
  const notifyAlert = useCallback(
    (alertTitle, alertMessage, params) =>
      service.send({
        type: 'showAlert',
        params: { alertTitle, alertMessage, ...params },
      }),
    [service]
  );

  // Shorthand: trigger HTTP fetch saat di-tap
  const notifyFetch = useCallback(
    (url, method = 'GET', params) =>
      service.send({
        type: 'fetchData',
        params: { url, method, ...params },
      }),
    [service]
  );

  // Shorthand: navigate + auto-fill form saat di-tap
  const notifyAutofill = useCallback(
    (screen, fields, params) =>
      service.send({
        type: 'autofill',
        params: { screen, fields, ...params },
      }),
    [service]
  );

  const cancelAll = useCallback(() => service.cancelAll(), [service]);

  return {
    notify,
    notifyNavigate,
    notifyOpenUrl,
    notifyAlert,
    notifyFetch,
    notifyAutofill,
    cancelAll,
  };
}
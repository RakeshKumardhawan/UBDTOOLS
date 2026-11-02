/**
 * Dedicated Real-time OTA & Version Status Change Notifier Service
 * Handles dispatching instant notifications to Telegram channel whenever an OTA update is triggered
 * or a client reports a version status change.
 */

export interface OtaNotificationPayload {
  eventType: 'OTA_TRIGGERED' | 'OTA_PAYLOAD_DOWNLOADED' | 'VERSION_UPGRADED' | 'STATUS_CHANGED';
  pcId?: string;
  pcName?: string;
  oldVersion?: string;
  newVersion?: string;
  downloadUrl?: string;
  details?: string;
  status?: string;
}

export async function sendOtaStatusChangeNotification(payload: OtaNotificationPayload): Promise<{ success: boolean; message?: string }> {
  try {
    const response = await fetch('/api/telemetry/ota-event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        eventType: payload.eventType || 'STATUS_CHANGED',
        pcId: payload.pcId || 'EVD-WEB-CLIENT',
        pcName: payload.pcName || 'E-VEDHIKA-WEB-CONSOLE',
        oldVersion: payload.oldVersion || 'v1.0.8',
        newVersion: payload.newVersion || 'v1.0.9',
        downloadUrl: payload.downloadUrl || '',
        details: payload.details || 'Real-time version status notification triggered from Admin Portal',
        status: payload.status || 'SUCCESS'
      })
    });

    if (response.ok) {
      const data = await response.json();
      return { success: true, message: data.message };
    }
    return { success: false, message: 'Server returned HTTP error status' };
  } catch (err: any) {
    console.warn('[OTA NOTIFIER SERVICE ERROR]', err?.message || err);
    return { success: false, message: err?.message || 'Network request failed' };
  }
}

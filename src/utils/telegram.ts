export interface DeploymentSummaryPayload {
  stepsPassed: number;
  totalSteps: number;
  profileName: string;
  status: 'SUCCESS' | 'FAILED' | 'PARTIAL';
  remarks?: string;
}

export async function SendDeploymentSummaryToTelegram(summary: DeploymentSummaryPayload): Promise<boolean> {
  const timestamp = new Date().toLocaleString();
  const message = `🚀 *E-VEDHIKA UBD DEPLOYMENT REPORT* 🚀\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🏢 *Office Profile:* ${summary.profileName}\n` +
    `✅ *Steps Completed:* ${summary.stepsPassed} / ${summary.totalSteps}\n` +
    `📊 *Status:* ${summary.status}\n` +
    `⏰ *Timestamp:* ${timestamp}\n` +
    `💡 *Remarks:* ${summary.remarks || 'Automated deployment completed successfully.'}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🌐 *Central Portal:* https://www.e-vedhika.in`;

  try {
    const res = await fetch('/api/telegram-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message })
    });
    const data = await res.json();
    return data.success;
  } catch (err) {
    console.warn('Failed to dispatch telegram deployment summary:', err);
    return false;
  }
}

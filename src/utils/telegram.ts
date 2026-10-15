export interface DeploymentSummaryOptions {
  stepsPassed?: number;
  totalSteps?: number;
  profileName?: string;
  status?: string;
  pcId?: string;
  pcName?: string;
  remarks?: string;
}

/**
 * Sends a deployment summary notification to Telegram after the 15-step deployment completes.
 * Fetches 'TELEGRAM_BOT_TOKEN' and 'TELEGRAM_CHAT_ID' from process environment.
 */
export async function SendDeploymentSummaryToTelegram(options: DeploymentSummaryOptions = {}) {
  const {
    stepsPassed = 15,
    totalSteps = 15,
    profileName = 'Kodangal Grama Panchayat',
    status = 'SUCCESS',
    pcId = 'EVD-TS-SEC-01',
    pcName = 'GP-SECRETARY-PC',
    remarks = 'All 15 UBD Gateway deployment steps executed with zero manual clicks!'
  } = options;

  // Retrieve TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID from process environment
  let botToken = (typeof process !== 'undefined' && process.env?.TELEGRAM_BOT_TOKEN) || 
                 (import.meta as any).env?.VITE_TELEGRAM_BOT_TOKEN || '';
  let chatId = (typeof process !== 'undefined' && process.env?.TELEGRAM_CHAT_ID) || 
               (import.meta as any).env?.VITE_TELEGRAM_CHAT_ID || '';

  // Fallback: If process.env values are empty, fetch runtime config from server API
  if (!botToken || !chatId) {
    try {
      const configResp = await fetch('/api/telegram/config');
      if (configResp.ok) {
        const configData = await configResp.json();
        if (!botToken && configData.botToken) botToken = configData.botToken;
        if (!chatId && configData.chatId) chatId = configData.chatId;
      }
    } catch (err) {
      console.warn('Failed to fetch fallback Telegram config from server:', err);
    }
  }

  const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
  const statusEmoji = status === 'SUCCESS' ? '✅ COMPLETED' : '⚠️ INCOMPLETE';

  const messageText = `
🛡️ <b>E-VEDHIKA AUTOMATED DEPLOYMENT SUMMARY</b>

🏢 <b>Office:</b> ${profileName}
💻 <b>PC Name:</b> ${pcName} (${pcId})
⚡ <b>Deployment Status:</b> ${statusEmoji} (${stepsPassed}/${totalSteps} Steps Passed)
🌐 <b>Portal Target:</b> ubd.telangana.gov.in (IE Mode Active)
🔐 <b>USB DSC Token:</b> mToken / ProxKey Class 3 Active
📅 <b>Timestamp:</b> ${timestamp}
📝 <b>Summary:</b> ${remarks}

🚀 <i>Live Deployment Report automatically dispatched by E-Vedhika Deployment Engine.</i>
`.trim();

  try {
    let result;
    if (botToken && chatId) {
      // Send POST request directly to Telegram Bot API
      const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: chatId,
          text: messageText,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
      result = await response.json();
      console.log('✅ [Telegram Dispatch] POST Response:', result);
    } else {
      // Send POST request to local server proxy endpoint
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageText,
          botToken,
          chatId,
        }),
      });
      result = await response.json();
      console.log('✅ [Telegram Backend Dispatch] POST Response:', result);
    }
    return result;
  } catch (error: any) {
    console.error('❌ [Telegram Dispatch Error]:', error?.message || error);
    return { success: false, error: error?.message || error };
  }
}

export interface SystemLocationInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  timezone: string;
  detectedState: 'Telangana' | 'Andhra Pradesh' | 'Other';
  locale: string;
  source: string;
}

export const getBrowserTimezoneInfo = (): { timezone: string; locale: string } => {
  try {
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata';
    const locale = navigator.language || 'en-IN';
    return { timezone, locale };
  } catch (e) {
    return { timezone: 'Asia/Kolkata', locale: 'en-IN' };
  }
};

export const detectSystemLocation = async (selectedState?: 'Telangana' | 'Andhra Pradesh'): Promise<SystemLocationInfo> => {
  const browserInfo = getBrowserTimezoneInfo();
  const targetState = selectedState || 'Telangana';

  // Try ip-api.com first (supports fields selection)
  try {
    const resp = await fetch('http://ip-api.com/json/?fields=status,country,regionName,city,query,timezone', {
      signal: AbortSignal.timeout(4000)
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.status === 'success') {
        // CRITICAL FIX: We strictly respect the Profile Selection over IP detection.
        // If the user selected Telangana, the region must be reported as Telangana.
        const state = targetState;
        const region = targetState;

        return {
          ip: data.query || 'Local Network',
          country: data.country || 'India',
          region: region,
          city: data.city || (targetState === 'Telangana' ? 'Hyderabad' : 'Vijayawada'),
          timezone: data.timezone || browserInfo.timezone,
          detectedState: state,
          locale: browserInfo.locale,
          source: 'ip-api.com (Primary API)'
        };
      }
    }
  } catch (err) {
    console.warn('Primary location API failed, attempting ipwho.is fallback...', err);
  }

  // Fallback to ipwho.is
  try {
    const resp = await fetch('https://ipwho.is/', {
      signal: AbortSignal.timeout(4000)
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.success) {
        const state = targetState;
        const region = targetState;

        return {
          ip: data.ip || 'Local Network',
          country: data.country || 'India',
          region: region,
          city: data.city || (targetState === 'Telangana' ? 'Hyderabad' : 'Vijayawada'),
          timezone: data.timezone?.id || browserInfo.timezone,
          detectedState: state,
          locale: browserInfo.locale,
          source: 'ipwho.is (Secondary API)'
        };
      }
    }
  } catch (err) {
    console.warn('Fallback location API failed, using Browser Timezone Fallback', err);
  }

  // Default browser fallback
  return {
    ip: '127.0.0.1 (Local Environment)',
    country: 'India',
    region: targetState,
    city: targetState === 'Telangana' ? 'Hyderabad (GP Office)' : 'Vijayawada (GP Office)',
    timezone: browserInfo.timezone,
    detectedState: targetState,
    locale: browserInfo.locale,
    source: 'Browser System Locale (Offline Fallback)'
  };
};

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

export const detectSystemLocation = async (): Promise<SystemLocationInfo> => {
  const browserInfo = getBrowserTimezoneInfo();

  // Try ip-api.com first (supports fields selection)
  try {
    const resp = await fetch('http://ip-api.com/json/?fields=status,country,regionName,city,query,timezone', {
      signal: AbortSignal.timeout(4000)
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.status === 'success') {
        const reg = data.regionName || '';
        let state: 'Telangana' | 'Andhra Pradesh' | 'Other' = 'Other';
        if (/Telangana/i.test(reg) || /Hyderabad/i.test(data.city || '')) {
          state = 'Telangana';
        } else if (/Andhra Pradesh/i.test(reg) || /Vijayawada|Visakhapatnam|Amaravati/i.test(data.city || '')) {
          state = 'Andhra Pradesh';
        } else if (reg.toLowerCase().includes('telangana') || reg.toLowerCase().includes('andhra')) {
          state = reg.toLowerCase().includes('telangana') ? 'Telangana' : 'Andhra Pradesh';
        } else {
          // Default for IN if unknown region in India
          state = 'Telangana';
        }

        return {
          ip: data.query || 'Local Network',
          country: data.country || 'India',
          region: data.regionName || 'Telangana',
          city: data.city || 'Hyderabad',
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
        const reg = data.region || '';
        let state: 'Telangana' | 'Andhra Pradesh' | 'Other' = 'Other';
        if (/Telangana/i.test(reg) || /Hyderabad/i.test(data.city || '')) {
          state = 'Telangana';
        } else if (/Andhra Pradesh/i.test(reg)) {
          state = 'Andhra Pradesh';
        } else {
          state = 'Telangana';
        }

        return {
          ip: data.ip || 'Local Network',
          country: data.country || 'India',
          region: data.region || 'Telangana',
          city: data.city || 'Hyderabad',
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
    region: 'Telangana',
    city: 'Hyderabad (GP Office)',
    timezone: browserInfo.timezone,
    detectedState: 'Telangana',
    locale: browserInfo.locale,
    source: 'Browser System Locale (Offline Fallback)'
  };
};

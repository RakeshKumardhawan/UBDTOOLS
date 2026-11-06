export interface SystemLocationInfo {
  ip: string;
  country: string;
  region: string;
  city: string;
  district?: string;
  mandal?: string;
  village?: string;
  timezone: string;
  detectedState: 'Telangana' | 'Andhra Pradesh' | 'Unverified';
  locale: string;
  source: string;
  isVerified: boolean;
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

// Known Telangana Cities & Districts
const TELANGANA_KEYWORDS = [
  'TELANGANA', 'HYDERABAD', 'WARANGAL', 'KARIMNAGAR', 'NIZAMABAD', 'KHAMMAM',
  'MANCHERIAL', 'MANCHIRAL', 'NALGONDA', 'SURYAPET', 'MAHABUBNAGAR', 'MEDAK',
  'SANGAREDDY', 'SIDDIPET', 'KAMAREDDY', 'ADILABAD', 'NIRMAL', 'JAGTIAL',
  'PEDDAPALLI', 'BHUPALPALLY', 'MULUGU', 'KOTHAGUDEM', 'MAHABUBABAD', 'JANGAON',
  'YADADRI', 'BHONGIR', 'VIKARABAD', 'NARAYANPET', 'GADWAL', 'WANAPARTHY',
  'NAGARKURNOOL', 'RANGAREDDY', 'MEDCHAL', 'MALKAJGIRI'
];

// Known Andhra Pradesh Cities & Districts
const ANDHRA_KEYWORDS = [
  'ANDHRA', 'PRADESH', 'VISAKHAPATNAM', 'VIZAG', 'VIJAYAWADA', 'GUNTUR', 'KURNOOL',
  'ANANTAPUR', 'CHITTOOR', 'TIRUPATI', 'NELLORE', 'ONGOLE', 'PRAKASAM', 'KAKINADA',
  'RAJAHMUNDRY', 'ELURU', 'MACHILIPATNAM', 'SRIKAKULAM', 'VIZIANAGARAM', 'KADAPA',
  'CUDDAPAH', 'YSR', 'EAST GODAVARI', 'WEST GODAVARI', 'KRISHNA'
];

export const detectSystemLocation = async (
  selectedState?: 'Telangana' | 'Andhra Pradesh',
  officeText?: string
): Promise<SystemLocationInfo> => {
  const browserInfo = getBrowserTimezoneInfo();
  
  // 1. If explicit office location string or profile is available, test against known keywords first
  if (officeText) {
    const upperText = officeText.toUpperCase();
    const isTS = TELANGANA_KEYWORDS.some(kw => upperText.includes(kw));
    const isAP = ANDHRA_KEYWORDS.some(kw => upperText.includes(kw));

    if (isTS && !isAP) {
      return {
        ip: 'Local Network',
        country: 'India',
        region: 'Telangana',
        city: officeText.split(',')[0] || 'Telangana Office',
        timezone: browserInfo.timezone,
        detectedState: 'Telangana',
        locale: browserInfo.locale,
        source: 'Verified Office Profile',
        isVerified: true
      };
    } else if (isAP && !isTS) {
      return {
        ip: 'Local Network',
        country: 'India',
        region: 'Andhra Pradesh',
        city: officeText.split(',')[0] || 'Andhra Pradesh Office',
        timezone: browserInfo.timezone,
        detectedState: 'Andhra Pradesh',
        locale: browserInfo.locale,
        source: 'Verified Office Profile',
        isVerified: true
      };
    }
  }

  if (selectedState) {
    return {
      ip: 'Local Network',
      country: 'India',
      region: selectedState,
      city: selectedState === 'Telangana' ? 'Telangana GP Office' : 'Andhra Pradesh GP Office',
      timezone: browserInfo.timezone,
      detectedState: selectedState,
      locale: browserInfo.locale,
      source: 'Verified Profile Selection',
      isVerified: true
    };
  }

  // 2. Try ip-api.com lookup without blind guessing
  try {
    const resp = await fetch('http://ip-api.com/json/?fields=status,country,regionName,city,query,timezone', {
      signal: AbortSignal.timeout(3000)
    });
    if (resp.ok) {
      const data = await resp.json();
      if (data.status === 'success') {
        const regionUpper = String(data.regionName || '').toUpperCase();
        const cityUpper = String(data.city || '').toUpperCase();
        const fullGeo = `${regionUpper} ${cityUpper}`;

        let detectedState: 'Telangana' | 'Andhra Pradesh' | 'Unverified' = 'Unverified';
        if (TELANGANA_KEYWORDS.some(kw => fullGeo.includes(kw))) {
          detectedState = 'Telangana';
        } else if (ANDHRA_KEYWORDS.some(kw => fullGeo.includes(kw))) {
          detectedState = 'Andhra Pradesh';
        }

        return {
          ip: data.query || 'Unknown IP',
          country: data.country || 'India',
          region: data.regionName || 'Unverified',
          city: data.city || 'Unverified',
          timezone: data.timezone || browserInfo.timezone,
          detectedState,
          locale: browserInfo.locale,
          source: 'IP Geolocation API',
          isVerified: detectedState !== 'Unverified'
        };
      }
    }
  } catch (err) {
    console.warn('[LOCATION HELPER] IP Geolocation lookup unavailable, falling back to Unverified', err);
  }

  // 3. Fallback without fake location guessing
  return {
    ip: '127.0.0.1',
    country: 'India',
    region: 'Unverified',
    city: 'Unverified Location',
    timezone: browserInfo.timezone,
    detectedState: 'Unverified',
    locale: browserInfo.locale,
    source: 'Unverified Location System',
    isVerified: false
  };
};

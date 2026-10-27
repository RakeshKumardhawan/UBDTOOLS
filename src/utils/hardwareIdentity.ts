export interface DeviceIdentity {
  hardwareId: string;
  macSuffix: string;
  hardwareUuid: string;
  status: string;
}

export function getDeviceHardwareIdentity(): DeviceIdentity {
  let savedId = localStorage.getItem('evedhika_device_hw_id');
  let savedMac = localStorage.getItem('evedhika_device_mac_suffix');
  let savedUuid = localStorage.getItem('evedhika_device_hw_uuid');

  if (!savedId) {
    const platform = navigator.platform || 'Win32';
    const cores = navigator.hardwareConcurrency || 8;
    const screenRes = `${window.screen?.width || 1920}x${window.screen?.height || 1080}`;
    const userAgent = navigator.userAgent || 'Windows';
    
    const seed = `${platform}_${cores}_${screenRes}_${userAgent}_${Math.random().toString(36).substring(2, 9)}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = (hash << 5) - hash + seed.charCodeAt(i);
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
    
    savedId = `HW-EVD-${hex.slice(0, 4)}-${hex.slice(4)}`;
    savedMac = `${hex.slice(0, 2)}:${hex.slice(2, 4)}:${hex.slice(4, 6)}:${hex.slice(6, 8)}`;
    savedUuid = `EVD-${hex.slice(0, 4)}-438F-${hex.slice(4, 8)}-${Date.now().toString(16).toUpperCase().slice(-4)}`;

    localStorage.setItem('evedhika_device_hw_id', savedId);
    localStorage.setItem('evedhika_device_mac_suffix', savedMac);
    localStorage.setItem('evedhika_device_hw_uuid', savedUuid);
  }

  return {
    hardwareId: savedId,
    macSuffix: savedMac || 'A4:BB:6D:88:21:EF',
    hardwareUuid: savedUuid || 'EVD-481F-438F-901B-22EF',
    status: 'ACTIVE & UNIQUE'
  };
}

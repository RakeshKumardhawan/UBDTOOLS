import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildLogExportFilename,
  buildStructuredLogExport,
  serializeLogExportJson,
} from '../src/utils/logExport';
import { EnvironmentStatus, LogEntry } from '../src/types';
import { DeviceIdentity } from '../src/utils/hardwareIdentity';

const sampleEnv: EnvironmentStatus = {
  osVersion: 'Windows 11 Pro',
  osBuild: '22631',
  arch: '64-bit (x64)',
  isAdmin: true,
  internetConnected: true,
  dotNet35Installed: true,
  dotNet4xInstalled: true,
  edgeIEModeConfigured: true,
  registryConfigured: true,
  proxKeyDriverInstalled: true,
  hyp2003DriverInstalled: false,
  nicDigiSignerInstalled: true,
  dscTokenConnected: true,
  dscTokenName: 'Watchdata ProxKey',
  digiSignerServiceRunning: true,
  lastCheckTime: '2026-11-19 18:30:00',
};

const sampleDevice: DeviceIdentity = {
  hardwareId: 'EVD-TS-MNCL-01',
  macSuffix: '26:F5:49:1E',
  hardwareUuid: 'EVD-TS-MNCL-26F5',
  deviceInstallationId: 'INST-26F5-ABCDEF-1234',
  status: 'ACTIVE & UNIQUE',
};

test('buildStructuredLogExport computes accurate summary counts and preserves fields', () => {
  const logs: LogEntry[] = [
    {
      id: '1',
      timestamp: '2026-11-19 18:20:00',
      user: 'Operator',
      pcName: 'GP-KUKNOOR-PC',
      module: 'SYSTEM',
      message: 'Initialized deployment engine',
      type: 'info',
    },
    {
      id: '2',
      timestamp: '2026-11-19 18:20:05',
      user: 'Operator',
      pcName: 'GP-KUKNOOR-PC',
      module: 'REGISTRY',
      message: 'Zone 2 Trusted Sites applied',
      type: 'success',
    },
    {
      id: '3',
      timestamp: '2026-11-19 18:20:08',
      user: 'Operator',
      pcName: 'GP-KUKNOOR-PC',
      module: 'DSC',
      message: 'Token PIN retry requested',
      type: 'warning',
    },
    {
      id: '4',
      timestamp: '2026-11-19 18:20:10',
      user: 'Operator',
      pcName: 'GP-KUKNOOR-PC',
      module: 'UBD',
      message: 'INVALID TOKEN returned by portal',
      type: 'error',
    },
  ];

  const fixedDate = new Date('2026-11-19T13:00:00.000Z');
  const payload = buildStructuredLogExport(logs, sampleEnv, sampleDevice, fixedDate);

  assert.equal(payload.schemaVersion, '1.0');
  assert.equal(payload.exportedAt, '2026-11-19T13:00:00.000Z');
  assert.equal(payload.totalLogs, 4);
  assert.deepEqual(payload.summary, {
    info: 1,
    success: 1,
    warning: 1,
    error: 1,
  });
  assert.equal(payload.deviceIdentity.hardwareId, 'EVD-TS-MNCL-01');
  assert.equal(payload.environmentStatus.osVersion, 'Windows 11 Pro');
  assert.equal(payload.logs.length, 4);
  assert.equal(payload.logs[3].message, 'INVALID TOKEN returned by portal');

  const json = serializeLogExportJson(payload);
  const parsed = JSON.parse(json);
  assert.equal(parsed.totalLogs, 4);
  assert.equal(parsed.summary.error, 1);
});

test('buildStructuredLogExport handles empty log array safely', () => {
  const payload = buildStructuredLogExport([], sampleEnv, sampleDevice, new Date('2026-11-19T13:00:00.000Z'));
  assert.equal(payload.totalLogs, 0);
  assert.deepEqual(payload.summary, { info: 0, success: 0, warning: 0, error: 0 });
  assert.deepEqual(payload.logs, []);
});

test('buildLogExportFilename generates timestamped .json filename', () => {
  const filename = buildLogExportFilename(new Date(2026, 10, 19, 18, 5, 9));
  assert.equal(filename, 'e-vedhika-logs-20261119-180509.json');
});

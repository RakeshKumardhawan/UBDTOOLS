import test from 'node:test';
import assert from 'node:assert/strict';
import {
  findDuplicateInstalledPcs,
  findDuplicateReportEvents,
  isTrialOrDummyPc,
  isGenericPcName
} from '../src/utils/pcCleanupHelpers';

test('findDuplicateInstalledPcs detects double-reported PCs with same PC name and preserves newest/online canonical EVD record', () => {
  const pcs = [
    {
      pcId: 'ROSI-OLD-1',
      pcName: 'ROSI',
      userName: 'Rakesh',
      district: 'Mancherial',
      officeLocation: 'Naspur GP',
      isOnline: false,
      lastSeenEpoch: 1700000000000
    },
    {
      pcId: 'EVD-TS-MNCL-53',
      pcName: 'rosi ',
      userName: 'Rakesh',
      district: 'Mancherial',
      officeLocation: 'Naspur GP',
      isOnline: true,
      lastSeenEpoch: 1700005000000
    },
    {
      pcId: 'EVD-TS-KHM-11',
      pcName: 'DESKTOP-KHAMMAM1',
      userName: 'Suresh',
      district: 'Khammam',
      officeLocation: 'Wyra GP',
      isOnline: false,
      lastSeenEpoch: 1700002000000
    }
  ];

  const analysis = findDuplicateInstalledPcs(pcs);
  assert.equal(analysis.duplicateCount, 1);
  assert.equal(analysis.groups.length, 1);
  assert.equal(analysis.groups[0].primary.pcId, 'EVD-TS-MNCL-53');
  assert.ok(analysis.primaryPcIds.has('EVD-TS-MNCL-53'));
  assert.ok(analysis.duplicatePcIds.has('ROSI-OLD-1'));
  assert.equal(analysis.allInvolvedPcIds.has('EVD-TS-KHM-11'), false);
});

test('findDuplicateInstalledPcs does NOT falsely flag two distinct offices with generic GP-OFFICE-PC name', () => {
  assert.equal(isGenericPcName('GP-OFFICE-PC'), true);
  const pcs = [
    {
      pcId: 'EVD-TS-MNCL-01',
      pcName: 'GP-OFFICE-PC',
      userName: 'Raju',
      district: 'Mancherial',
      officeLocation: 'Naspur GP',
      lastSeenEpoch: 1700001000000
    },
    {
      pcId: 'EVD-TS-WGL-02',
      pcName: 'GP-OFFICE-PC',
      userName: 'Anil',
      district: 'Warangal',
      officeLocation: 'Narsampet GP',
      lastSeenEpoch: 1700002000000
    }
  ];

  const analysis = findDuplicateInstalledPcs(pcs);
  assert.equal(analysis.duplicateCount, 0);
  assert.equal(analysis.groups.length, 0);
});

test('findDuplicateInstalledPcs flags generic GP-OFFICE-PC when same office + district + user reported twice', () => {
  const pcs = [
    {
      pcId: 'EVD-TS-MNCL-01',
      pcName: 'GP-OFFICE-PC',
      userName: 'Raju',
      district: 'Mancherial',
      officeLocation: 'Naspur GP',
      lastSeenEpoch: 1700001000000
    },
    {
      pcId: 'EVD-TS-MNCL-09',
      pcName: 'GP-OFFICE-PC',
      userName: 'Raju',
      district: 'Mancherial',
      officeLocation: 'Naspur GP',
      lastSeenEpoch: 1700009000000
    }
  ];

  const analysis = findDuplicateInstalledPcs(pcs);
  assert.equal(analysis.duplicateCount, 1);
  assert.ok(analysis.primaryPcIds.has('EVD-TS-MNCL-09'));
  assert.ok(analysis.duplicatePcIds.has('EVD-TS-MNCL-01'));
});

test('findDuplicateReportEvents marks older redundant same-day reports for the same PC & category', () => {
  const reports = [
    {
      reportId: 'RPT-1',
      pcId: 'EVD-TS-MNCL-53',
      reportType: 'DEPLOYMENT_AUDIT',
      appVersion: 'v1.1.0',
      timestampUtc: '2026-11-20T09:00:00.000Z'
    },
    {
      reportId: 'RPT-2',
      pcId: 'EVD-TS-MNCL-53',
      reportType: 'DEPLOYMENT_AUDIT',
      appVersion: 'v1.1.0',
      timestampUtc: '2026-11-20T11:30:00.000Z'
    },
    {
      reportId: 'RPT-3',
      pcId: 'EVD-TS-MNCL-53',
      reportType: 'VERSION_UPGRADE',
      appVersion: 'v1.1.0',
      timestampUtc: '2026-11-20T11:35:00.000Z'
    }
  ];

  const analysis = findDuplicateReportEvents(reports);
  assert.equal(analysis.duplicateCount, 1);
  assert.ok(analysis.duplicateReportIds.has('RPT-1'));
  assert.equal(analysis.duplicateReportIds.has('RPT-2'), false);
  assert.equal(analysis.duplicateReportIds.has('RPT-3'), false);
});

test('isTrialOrDummyPc detects test/trial/dummy records without touching real GP PCs', () => {
  assert.equal(isTrialOrDummyPc({ pcId: 'EVD-TRIAL-PC-01', pcName: 'TRIAL-PC' }), true);
  assert.equal(isTrialOrDummyPc({ pcId: 'DUMMY-01', pcName: 'TEST-PC' }), true);
  assert.equal(isTrialOrDummyPc({ pcId: 'EVD-TS-MNCL-53', pcName: 'ROSI', officeLocation: 'Mancherial GP' }), false);
});

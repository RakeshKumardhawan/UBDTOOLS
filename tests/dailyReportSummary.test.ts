import test from 'node:test';
import assert from 'node:assert/strict';
import * as XLSX from 'xlsx';
import {
  buildDateWiseInstallSummary,
  extractRecordInstallDateYmd,
  formatYmdToDmy,
  normalizeToYmd
} from '../src/utils/dailyReportSummary';
import { buildFirebaseConsolidatedWorkbook } from '../src/utils/firebaseExcelExport';

test('formatYmdToDmy formats YYYY-MM-DD as DD-MM-YYYY matching report screenshot', () => {
  assert.equal(formatYmdToDmy('2026-11-18'), '18-11-2026');
  assert.equal(formatYmdToDmy('2026-11-19'), '19-11-2026');
  assert.equal(formatYmdToDmy('2026-11-20'), '20-11-2026');
});

test('normalizeToYmd parses ISO, YYYY-MM-DD, DD-MM-YYYY, and IST epochs cleanly', () => {
  assert.equal(normalizeToYmd('2026-11-18'), '2026-11-18');
  assert.equal(normalizeToYmd('18-11-2026'), '2026-11-18');
  assert.equal(normalizeToYmd('19/11/2026'), '2026-11-19');
  assert.equal(normalizeToYmd('2026-11-20T13:30:00Z'), '2026-11-20');
  assert.equal(normalizeToYmd('Recently'), null);
  assert.equal(normalizeToYmd(null), null);
});

test('buildDateWiseInstallSummary reproduces exact horizontal table (18-11-2026: 10, 19-11-2026: 11, 20-11-2026: 13, Total: 34)', () => {
  const records: Array<Record<string, any>> = [];
  for (let i = 1; i <= 10; i++) {
    records.push({ pcId: `PC-D1-${i}`, pcName: `GP-D1-${i}`, initialInstallDate: '2026-11-18', date: '2026-11-18' });
  }
  for (let i = 1; i <= 11; i++) {
    records.push({ pcId: `PC-D2-${i}`, pcName: `GP-D2-${i}`, initialInstallDate: '19-11-2026', date: '2026-11-19' });
  }
  for (let i = 1; i <= 13; i++) {
    records.push({ pcId: `PC-D3-${i}`, pcName: `GP-D3-${i}`, date: '2026-11-20' });
  }

  const summary = buildDateWiseInstallSummary(records, '2026-11-20');

  assert.equal(summary.installedUpToYesterday, 21);
  assert.equal(summary.installedToday, 13);
  assert.equal(summary.grandTotal, 34);

  assert.deepEqual(summary.horizontalRows, [
    ['Date', '18-11-2026', '19-11-2026', '20-11-2026', 'Total'],
    ['Installed PCs', 10, 11, 13, 34]
  ]);

  // Verify email HTML & Telegram output include key figures
  assert.ok(summary.htmlTable.includes('18-11-2026'));
  assert.ok(summary.htmlTable.includes('19-11-2026'));
  assert.ok(summary.htmlTable.includes('20-11-2026'));
  assert.ok(summary.htmlTable.includes('34'));
  assert.ok(summary.htmlTable.includes('21 PCs'));
  assert.ok(summary.telegramBreakdown.includes('21 PCs'));
  assert.ok(summary.telegramBreakdown.includes('13 PCs'));
  assert.ok(summary.telegramBreakdown.includes('34 PCs'));
});

test('buildDateWiseInstallSummary deduplicates repeat PCs across days using earliest install date', () => {
  const records = [
    // Same PC reported on Nov 18 and again on Nov 20 -> must count ONCE on Nov 18
    { pcId: 'evd-pc-101', pcName: 'GP-OFFICE-1', date: '2026-11-20' },
    { pcId: 'EVD-PC-101', pcName: 'GP-OFFICE-1', initialInstallDate: '2026-11-18', date: '2026-11-18' },
    // Another PC installed on Nov 19 and reported again on Nov 20 -> counts ONCE on Nov 19
    { pcId: 'EVD-PC-102', pcName: 'GP-OFFICE-2', firstSeen: '19-11-2026', date: '2026-11-20' },
    // Fresh PC today on Nov 20
    { pcId: 'EVD-PC-103', pcName: 'GP-OFFICE-3', date: '2026-11-20' }
  ];

  const summary = buildDateWiseInstallSummary(records, '2026-11-20');

  assert.equal(summary.grandTotal, 3);
  assert.equal(summary.installedUpToYesterday, 2);
  assert.equal(summary.installedToday, 1);
  assert.deepEqual(summary.horizontalRows, [
    ['Date', '18-11-2026', '19-11-2026', '20-11-2026', 'Total'],
    ['Installed PCs', 1, 1, 1, 3]
  ]);
});

test('extractRecordInstallDateYmd picks earliest valid date among multiple record fields', () => {
  const earliest = extractRecordInstallDateYmd(
    {
      initialInstallDate: '2026-11-18',
      date: '2026-11-20',
      lastSeenEpoch: Date.parse('2026-11-20T14:00:00Z')
    },
    '2026-11-20'
  );
  assert.equal(earliest, '2026-11-18');
});

test('buildDateWiseInstallSummary handles empty records gracefully', () => {
  const summary = buildDateWiseInstallSummary([], '2026-11-20');
  assert.equal(summary.installedUpToYesterday, 0);
  assert.equal(summary.installedToday, 0);
  assert.equal(summary.grandTotal, 0);
  assert.deepEqual(summary.horizontalRows, [
    ['Date', '20-11-2026', 'Total'],
    ['Installed PCs', 0, 0]
  ]);
});

test('horizontalRows serialize cleanly into an XLSX worksheet and read back accurately', () => {
  const records = [
    { pcId: 'PC-1', date: '2026-11-18' },
    { pcId: 'PC-2', date: '2026-11-19' },
    { pcId: 'PC-3', date: '2026-11-20' }
  ];
  const summary = buildDateWiseInstallSummary(records, '2026-11-20');

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.aoa_to_sheet(summary.horizontalRows);
  XLSX.utils.book_append_sheet(wb, ws, 'Date-Wise Install Summary');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  const parsed = XLSX.read(buf, { type: 'buffer' });
  const rows = XLSX.utils.sheet_to_json(parsed.Sheets['Date-Wise Install Summary'], { header: 1 });

  assert.deepEqual(rows, [
    ['Date', '18-11-2026', '19-11-2026', '20-11-2026', 'Total'],
    ['Installed PCs', 1, 1, 1, 3]
  ]);
});

test('buildFirebaseConsolidatedWorkbook builds 3 sheets with exact 26 columns and horizontal summary', () => {
  const records = [
    { pcId: 'GP-01', pcName: 'MANCHERIAL-PC1', officeLocation: 'Mancherial GP', state: 'Telangana', initialInstallDate: '2026-11-18', date: '2026-11-20' },
    { pcId: 'GP-02', pcName: 'PEDDAPALLI-PC2', officeLocation: 'Keshanpalli GP', state: 'Telangana', initialInstallDate: '2026-11-19', date: '2026-11-19' },
    { pcId: 'GP-03', pcName: 'RANGAREDDY-PC3', officeLocation: 'Manchal GP', state: 'Telangana', initialInstallDate: '2026-11-20', date: '2026-11-20' }
  ];

  const { workbook, dateSummary } = buildFirebaseConsolidatedWorkbook(records, {
    todayYmdIST: '2026-11-20'
  });

  assert.deepEqual(workbook.SheetNames, [
    'Executive Summary',
    'Date-Wise Install Summary',
    'All PCs Live Audit Matrix'
  ]);
  assert.equal(dateSummary.installedUpToYesterday, 2);
  assert.equal(dateSummary.installedToday, 1);
  assert.equal(dateSummary.grandTotal, 3);

  const matrixRows = XLSX.utils.sheet_to_json(workbook.Sheets['All PCs Live Audit Matrix'], { header: 1 }) as any[][];
  assert.equal(matrixRows[0].length, 26);
  assert.equal(matrixRows[0][0], 'Sl. No.');
  assert.equal(matrixRows[0][25], 'Remarks');
  assert.equal(matrixRows.length, 4); // header + 3 PCs

  const dateWiseRows = XLSX.utils.sheet_to_json(workbook.Sheets['Date-Wise Install Summary'], { header: 1 }) as any[][];
  assert.deepEqual(dateWiseRows[0], ['Date', '18-11-2026', '19-11-2026', '20-11-2026', 'Total']);
  assert.deepEqual(dateWiseRows[1], ['Installed PCs', 1, 1, 1, 3]);
});

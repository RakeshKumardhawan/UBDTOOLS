export interface DateWiseInstallEntry {
  dateYmd: string;
  dateLabel: string; // DD-MM-YYYY (e.g. 18-11-2026)
  count: number;
  cumulativeTotal: number;
  isToday: boolean;
  isUpToYesterday: boolean;
}

export interface DateWiseInstallSummary {
  todayYmd: string;
  todayLabel: string;
  entries: DateWiseInstallEntry[];
  installedUpToYesterday: number;
  installedToday: number;
  grandTotal: number;
  horizontalRows: Array<Array<string | number>>;
  verticalRows: Array<{
    Date: string;
    Period: string;
    'Installed PCs': number;
    'Cumulative Total': number;
  }>;
  htmlTable: string;
  telegramBreakdown: string;
}

const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Returns the canonical YYYY-MM-DD date string in IST (UTC+5:30).
 */
export function getTodayYmdIST(nowMs: number = Date.now()): string {
  const ist = new Date(nowMs + IST_OFFSET_MS);
  return ist.toISOString().slice(0, 10);
}

/**
 * Converts YYYY-MM-DD to DD-MM-YYYY (e.g. 2026-11-18 -> 18-11-2026).
 */
export function formatYmdToDmy(ymd: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(ymd || '').trim());
  if (!match) return String(ymd || '').trim();
  return `${match[3]}-${match[2]}-${match[1]}`;
}

/**
 * Attempts to normalize any date string or epoch timestamp into canonical YYYY-MM-DD.
 * Returns null if the input cannot be parsed into a valid calendar date.
 */
export function normalizeToYmd(value: unknown): string | null {
  if (value === null || value === undefined) return null;

  if (typeof value === 'number' && Number.isFinite(value) && value > 0) {
    // Support seconds or milliseconds epoch
    const ms = value < 1e12 ? value * 1000 : value;
    const ist = new Date(ms + IST_OFFSET_MS);
    if (!Number.isNaN(ist.getTime())) {
      return ist.toISOString().slice(0, 10);
    }
    return null;
  }

  const raw = String(value).trim();
  if (!raw || raw.toLowerCase() === 'recently' || raw.toLowerCase() === 'unknown') {
    return null;
  }

  // Case 1: Leading YYYY-MM-DD or YYYY/MM/DD (also handles ISO timestamps like 2026-11-18T14:20:00Z)
  const isoMatch = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(raw);
  if (isoMatch) {
    const year = Number(isoMatch[1]);
    const month = Number(isoMatch[2]);
    const day = Number(isoMatch[3]);
    if (year >= 2020 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Case 2: DD-MM-YYYY or DD/MM/YYYY (common Indian date format)
  const dmyMatch = /^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/.exec(raw);
  if (dmyMatch) {
    const day = Number(dmyMatch[1]);
    const month = Number(dmyMatch[2]);
    const year = Number(dmyMatch[3]);
    if (year >= 2020 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      return `${String(year).padStart(4, '0')}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }

  // Case 3: Pure numeric string epoch
  if (/^\d{10,13}$/.test(raw)) {
    return normalizeToYmd(Number(raw));
  }

  // Case 4: Native Date fallback
  const parsedMs = Date.parse(raw);
  if (!Number.isNaN(parsedMs)) {
    const ist = new Date(parsedMs + IST_OFFSET_MS);
    const year = ist.getUTCFullYear();
    if (year >= 2020 && year <= 2100) {
      return ist.toISOString().slice(0, 10);
    }
  }

  return null;
}

/**
 * Extracts the earliest install date (YYYY-MM-DD) from a PC telemetry/archive record.
 */
export function extractRecordInstallDateYmd(record: Record<string, any>, fallbackDateYmd: string): string {
  const candidates = [
    record?.initialInstallDate,
    record?.firstInstalledAt,
    record?.firstSeen,
    record?.installedDate,
    record?.installDate,
    record?.date,
    record?.reportDate,
    record?.createdAt,
    record?.firstSeenEpoch,
    record?.lastSeenEpoch,
    record?.lastUpdatedEpoch,
    record?.lastHeartbeatEpoch
  ];

  const validDates: string[] = [];
  for (const c of candidates) {
    const normalized = normalizeToYmd(c);
    if (normalized) validDates.push(normalized);
  }

  if (validDates.length === 0) {
    return fallbackDateYmd;
  }

  // Pick the earliest known date for this PC so its original installation day is preserved
  validDates.sort();
  return validDates[0];
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Builds the Date-wise Installed PCs Summary matching:
 *   Date          | 18-11-2026 | 19-11-2026 | 20-11-2026 | Total
 *   Installed PCs | 10         | 11         | 13         | 34
 *
 * Each unique PC (by pcId or pcName) is counted strictly ONCE on its earliest
 * install date so cumulative totals are always 100% accurate without double counting.
 */
export function buildDateWiseInstallSummary(
  records: Array<Record<string, any>>,
  todayYmdIST: string = getTodayYmdIST()
): DateWiseInstallSummary {
  const normalizedToday = normalizeToYmd(todayYmdIST) || getTodayYmdIST();
  const todayLabel = formatYmdToDmy(normalizedToday);

  // Deduplicate each unique PC keeping its earliest install date
  const pcEarliestInstallDate = new Map<string, string>();

  for (const rec of records || []) {
    if (!rec || typeof rec !== 'object') continue;
    const rawKey = String(rec.pcId || rec.pcName || '').toUpperCase().trim();
    if (!rawKey) continue;

    const installYmd = extractRecordInstallDateYmd(rec, normalizedToday);
    const existingYmd = pcEarliestInstallDate.get(rawKey);
    if (!existingYmd || installYmd < existingYmd) {
      pcEarliestInstallDate.set(rawKey, installYmd);
    }
  }

  // Group counts per YYYY-MM-DD
  const countByDate = new Map<string, number>();
  for (const ymd of pcEarliestInstallDate.values()) {
    countByDate.set(ymd, (countByDate.get(ymd) || 0) + 1);
  }

  const sortedDates = Array.from(countByDate.keys()).sort();

  let runningCumulative = 0;
  let installedUpToYesterday = 0;
  let installedToday = 0;

  const entries: DateWiseInstallEntry[] = sortedDates.map((dateYmd) => {
    const count = countByDate.get(dateYmd) || 0;
    runningCumulative += count;
    const isToday = dateYmd === normalizedToday;
    const isUpToYesterday = dateYmd < normalizedToday;
    if (isUpToYesterday) installedUpToYesterday += count;
    if (isToday) installedToday += count;

    return {
      dateYmd,
      dateLabel: formatYmdToDmy(dateYmd),
      count,
      cumulativeTotal: runningCumulative,
      isToday,
      isUpToYesterday
    };
  });

  const grandTotal = pcEarliestInstallDate.size;

  // Build exact 2-row horizontal table matching the admin's Excel screenshot
  const horizontalDateRow: Array<string | number> = ['Date'];
  const horizontalCountRow: Array<string | number> = ['Installed PCs'];

  if (entries.length === 0) {
    horizontalDateRow.push(todayLabel, 'Total');
    horizontalCountRow.push(0, 0);
  } else {
    for (const entry of entries) {
      horizontalDateRow.push(entry.dateLabel);
      horizontalCountRow.push(entry.count);
    }
    horizontalDateRow.push('Total');
    horizontalCountRow.push(grandTotal);
  }

  const horizontalRows: Array<Array<string | number>> = [
    horizontalDateRow,
    horizontalCountRow
  ];

  const verticalRows = entries.length > 0
    ? entries.map((e) => ({
        Date: e.dateLabel,
        Period: e.isToday ? 'Today' : (e.isUpToYesterday ? 'Up to Yesterday' : 'Recorded'),
        'Installed PCs': e.count,
        'Cumulative Total': e.cumulativeTotal
      }))
    : [
        {
          Date: todayLabel,
          Period: 'Today',
          'Installed PCs': 0,
          'Cumulative Total': 0
        }
      ];

  // Build clean horizontal HTML table for the Daily 7 PM Email
  const headerCells = horizontalDateRow
    .map((cell, idx) => {
      const isLabel = idx === 0;
      const isTotal = idx === horizontalDateRow.length - 1;
      const bg = isTotal ? '#0f172a' : (isLabel ? '#1e3a8a' : '#e0f2fe');
      const color = isTotal || isLabel ? '#ffffff' : '#0369a1';
      const align = isLabel ? 'left' : 'center';
      return `<th style="padding: 8px 12px; border: 1px solid #cbd5e1; background: ${bg}; color: ${color}; text-align: ${align}; white-space: nowrap; font-size: 13px;">${escapeHtml(String(cell))}</th>`;
    })
    .join('');

  const valueCells = horizontalCountRow
    .map((cell, idx) => {
      const isLabel = idx === 0;
      const isTotal = idx === horizontalCountRow.length - 1;
      const bg = isTotal ? '#f0fdf4' : (isLabel ? '#f8fafc' : '#ffffff');
      const color = isTotal ? '#15803d' : '#0f172a';
      const align = isLabel ? 'left' : 'center';
      const weight = isLabel || isTotal ? 'bold' : '600';
      return `<td style="padding: 8px 12px; border: 1px solid #cbd5e1; background: ${bg}; color: ${color}; text-align: ${align}; font-weight: ${weight}; white-space: nowrap; font-size: 13px;">${escapeHtml(String(cell))}</td>`;
    })
    .join('');

  const htmlTable = `
    <div style="margin: 18px 0; overflow-x: auto;">
      <p style="margin: 0 0 8px 0; font-size: 14px; font-weight: bold; color: #0f172a;">
        📆 Date-Wise Installed PCs Summary (నిన్నటి వరకు &amp; రోజువారీ ఇన్‌స్టాలేషన్ సమ్మరీ)
      </p>
      <table style="width: 100%; border-collapse: collapse; font-family: Arial, sans-serif;">
        <thead><tr>${headerCells}</tr></thead>
        <tbody><tr>${valueCells}</tr></tbody>
      </table>
      <p style="margin: 8px 0 0 0; font-size: 12px; color: #475569;">
        📌 <b>Up to Yesterday (నిన్నటి వరకు):</b> ${installedUpToYesterday} PCs &nbsp;|&nbsp;
        🆕 <b>Today (${escapeHtml(todayLabel)}):</b> ${installedToday} PCs &nbsp;|&nbsp;
        🏆 <b>Grand Total:</b> ${grandTotal} PCs
      </p>
    </div>
  `.trim();

  // Build compact Telegram breakdown (show latest 14 dates cleanly if many exist, plus total)
  const recentEntries = entries.slice(-14);
  const dateLines = recentEntries.length > 0
    ? recentEntries.map((e) => `   • <code>${e.dateLabel}</code>: <b>${e.count} PCs</b>`).join('\n')
    : `   • <code>${todayLabel}</code>: <b>0 PCs</b>`;

  const omittedNote = entries.length > 14
    ? `   • <i>(+ ${entries.length - 14} earlier dates included in Excel)</i>\n`
    : '';

  const telegramBreakdown =
    `📆 <b>Date-Wise Installed PCs Summary:</b>\n` +
    omittedNote +
    `${dateLines}\n` +
    `   ━━━━━━━━━━━━━━━━━━━\n` +
    `   📌 <b>Up to Yesterday (నిన్నటి వరకు):</b> <b>${installedUpToYesterday} PCs</b>\n` +
    `   🆕 <b>Today (${todayLabel}):</b> <b>${installedToday} PCs</b>\n` +
    `   🏆 <b>Grand Total Installed:</b> <b>${grandTotal} PCs</b>`;

  return {
    todayYmd: normalizedToday,
    todayLabel,
    entries,
    installedUpToYesterday,
    installedToday,
    grandTotal,
    horizontalRows,
    verticalRows,
    htmlTable,
    telegramBreakdown
  };
}

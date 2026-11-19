import { EnvironmentStatus, LogEntry } from '../types';
import { DeviceIdentity } from './hardwareIdentity';

export interface LogExportSummary {
  info: number;
  success: number;
  warning: number;
  error: number;
}

export interface StructuredLogExport {
  schemaVersion: string;
  application: string;
  exportedAt: string;
  totalLogs: number;
  summary: LogExportSummary;
  deviceIdentity: DeviceIdentity;
  environmentStatus: EnvironmentStatus;
  logs: LogEntry[];
}

export function buildLogExportFilename(date: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  const datePart = `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`;
  const timePart = `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
  return `e-vedhika-logs-${datePart}-${timePart}.json`;
}

export function buildStructuredLogExport(
  logs: LogEntry[],
  environmentStatus: EnvironmentStatus,
  deviceIdentity: DeviceIdentity,
  exportedAt: Date = new Date()
): StructuredLogExport {
  const safeLogs = Array.isArray(logs) ? logs : [];
  const summary: LogExportSummary = {
    info: 0,
    success: 0,
    warning: 0,
    error: 0,
  };

  for (const entry of safeLogs) {
    if (entry.type === 'error') summary.error += 1;
    else if (entry.type === 'warning') summary.warning += 1;
    else if (entry.type === 'success') summary.success += 1;
    else summary.info += 1;
  }

  return {
    schemaVersion: '1.0',
    application: 'E-Vedhika UBD Deployment Tool',
    exportedAt: exportedAt.toISOString(),
    totalLogs: safeLogs.length,
    summary,
    deviceIdentity,
    environmentStatus,
    logs: safeLogs.map((entry) => ({
      id: entry.id,
      timestamp: entry.timestamp,
      user: entry.user,
      pcName: entry.pcName,
      module: entry.module,
      message: entry.message,
      type: entry.type,
    })),
  };
}

export function serializeLogExportJson(payload: StructuredLogExport): string {
  return JSON.stringify(payload, null, 2);
}

export function downloadStructuredLogsJson(
  logs: LogEntry[],
  environmentStatus: EnvironmentStatus,
  deviceIdentity: DeviceIdentity
): string {
  const now = new Date();
  const payload = buildStructuredLogExport(logs, environmentStatus, deviceIdentity, now);
  const jsonContent = serializeLogExportJson(payload);
  const filename = buildLogExportFilename(now);

  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 1000);

  return filename;
}

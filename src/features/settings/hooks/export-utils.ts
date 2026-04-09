import JSZip from 'jszip';
import { printToFileAsync } from 'expo-print';
import { File, Paths } from 'expo-file-system';
import { appConstants } from '@/config/app-constants';
import { DailyLog } from '@/services/local/daily-log-service';
import { TimeEntry } from '@/services/local/time-entry-service';
import { UserProfile } from '@/services/local/user-profile-service';

/** Magic signature written into every .orender backup manifest. */
export const BACKUP_MAGIC = 'ORENDER_BACKUP';
/** Current backup format version — bump when the schema changes. */
export const BACKUP_FORMAT_VERSION = 1;

const formatDate = (value: Date | string | number) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

const formatDateTime = (value: Date | string | number) =>
  new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

const formatTime = (value: Date | string | number) =>
  new Date(value).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

const escapeCsvValue = (value: string | number | null | undefined) => {
  const normalized = String(value ?? '');
  if (normalized.includes(',') || normalized.includes('"') || normalized.includes('\n')) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }
  return normalized;
};

const escapeHtml = (value: string | null | undefined) =>
  String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');

const getFriendlyDateSlug = (date = new Date()) =>
  date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  }).replaceAll(',', '').replaceAll(' ', '-');

const getCompletedEntries = (entries: TimeEntry[]) =>
  entries.filter((entry) => (entry.status === 'complete' || entry.status === 'edited') && !!entry.totalHours);

const getProgressPercentage = (completedHours: number, requiredHours: number) => {
  if (!requiredHours || requiredHours <= 0) return 0;
  return Math.min((completedHours / requiredHours) * 100, 100);
};

const getAttendanceStatusLabel = (entry: TimeEntry) => {
  if (entry.status === 'edited') return 'Adjusted';
  if (entry.status === 'complete') return 'Completed';
  return 'Incomplete';
};

const getAttendanceSourceLabel = (entry: TimeEntry) => (entry.isManual ? 'Manual' : 'Clocked');

const renderEmptyBlock = (title: string, message: string) => `
  <div class="empty-block">
    <div class="empty-title">${escapeHtml(title)}</div>
    <div class="empty-copy">${escapeHtml(message)}</div>
  </div>
`;

export const buildBackupZip = async (serializedDatabase: Uint8Array, profile: UserProfile) => {
  const zip = new JSZip();
  const generatedAt = new Date();
  const fileName = `${appConstants.appName}-backup-${getFriendlyDateSlug(generatedAt)}.orender`;

  zip.file('database.sqlite', serializedDatabase);
  zip.file('manifest.json', JSON.stringify({
    magic: BACKUP_MAGIC,
    formatVersion: BACKUP_FORMAT_VERSION,
    app: appConstants.appName,
    appVersion: appConstants.appVersion,
    exportedAt: generatedAt.toISOString(),
    user: {
      id: profile.id,
      fullName: profile.fullName,
    },
    contents: ['database.sqlite'],
  }, null, 2));

  const zipBytes = await zip.generateAsync({
    type: 'uint8array',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });

  const backupsDir = new File(Paths.document, 'backups');
  const file = new File(backupsDir, fileName);
  file.create({ overwrite: true, intermediates: true });
  file.write(zipBytes);

  return {
    file,
    fileName,
    fileSize: zipBytes.byteLength,
  };
};

export const buildRecordsCsv = (
  profile: UserProfile,
  entries: TimeEntry[],
  logs: DailyLog[]
) => {
  const entriesById = new Map(entries.map((entry) => [entry.id, entry]));
  const rows = logs.map((log) => {
    const linkedEntry = log.timeEntryId ? entriesById.get(log.timeEntryId) : undefined;
    return [
      formatDate(log.date),
      log.title ?? '',
      log.description ?? '',
      linkedEntry ? formatDateTime(linkedEntry.clockIn) : '',
      linkedEntry?.clockOut ? formatDateTime(linkedEntry.clockOut) : '',
      linkedEntry?.totalHours ?? '',
      linkedEntry?.breakMinutes ?? '',
      linkedEntry?.status ?? '',
      linkedEntry?.isManual ? 'Manual' : 'Clocked',
      linkedEntry?.notes ?? '',
    ].map(escapeCsvValue).join(',');
  });

  const orphanEntries = entries
    .filter((entry) => !logs.some((log) => log.timeEntryId === entry.id))
    .map((entry) => [
      formatDate(entry.clockIn),
      '',
      '',
      formatDateTime(entry.clockIn),
      entry.clockOut ? formatDateTime(entry.clockOut) : '',
      entry.totalHours ?? '',
      entry.breakMinutes ?? '',
      entry.status,
      entry.isManual ? 'Manual' : 'Clocked',
      entry.notes ?? '',
    ].map(escapeCsvValue).join(','));

  return [
    `${profile.fullName} Record Export`,
    `Generated At,${new Date().toISOString()}`,
    '',
    'Date,Log Title,Log Description,Clock In,Clock Out,Total Hours,Break Minutes,Status,Entry Source,Entry Notes',
    ...rows,
    ...orphanEntries,
  ].join('\n');
};

export const createRecordsCsvFile = (profile: UserProfile, entries: TimeEntry[], logs: DailyLog[]) => {
  const generatedAt = new Date();
  const fileName = `ORender-records-${getFriendlyDateSlug(generatedAt)}.csv`;
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true, intermediates: true });
  file.write(buildRecordsCsv(profile, entries, logs));
  return { file, fileName };
};

export const createRecordsPdfFile = async (
  profile: UserProfile,
  entries: TimeEntry[],
  _logs: DailyLog[]
) => {
  const completedEntries = getCompletedEntries(entries);
  const totalHours = completedEntries.reduce((sum, entry) => sum + (entry.totalHours ?? 0), 0);
  const activeEntries = entries.filter((entry) => entry.status === 'incomplete');
  const manualEntries = entries.filter((entry) => entry.isManual);
  const progressPercentage = getProgressPercentage(totalHours, profile.requiredHours);
  const remainingHours = Math.max(profile.requiredHours - totalHours, 0);
  const generatedAt = new Date();
  const attendanceRows = [...entries].sort(
    (left, right) => new Date(left.clockIn).getTime() - new Date(right.clockIn).getTime()
  );
  const completedDays = new Set(
    completedEntries.map((entry) => formatDate(entry.clockIn))
  ).size;
  const incompleteDays = new Set(
    activeEntries.map((entry) => formatDate(entry.clockIn))
  ).size;
  const attendancePeriod = attendanceRows.length > 0
    ? `${formatDate(attendanceRows[0].clockIn)} to ${formatDate(attendanceRows[attendanceRows.length - 1].clockIn)}`
    : 'No attendance records yet';

  const attendanceSection = attendanceRows.length > 0
    ? `
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Clock In</th>
            <th>Clock Out</th>
            <th>Break</th>
            <th>Rendered Hours</th>
            <th>Status</th>
            <th>Source</th>
          </tr>
        </thead>
        <tbody>
          ${attendanceRows.map((entry) => `
            <tr>
              <td>${escapeHtml(formatDate(entry.clockIn))}</td>
              <td>${escapeHtml(formatTime(entry.clockIn))}</td>
              <td>${entry.clockOut ? escapeHtml(formatTime(entry.clockOut)) : '—'}</td>
              <td>${entry.breakMinutes ? `${entry.breakMinutes} min` : '—'}</td>
              <td>${entry.totalHours?.toFixed(2) ?? '—'}</td>
              <td>${escapeHtml(getAttendanceStatusLabel(entry))}</td>
              <td>${escapeHtml(getAttendanceSourceLabel(entry))}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `
    : renderEmptyBlock(
      'No attendance records yet',
      'No clock-in or clock-out records have been captured yet for this trainee.'
    );

  const html = `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: 'Times New Roman', Georgia, serif; padding: 34px 38px; color: #111111; line-height: 1.45; }
          .document-header { text-align: center; margin-bottom: 28px; }
          .document-title { font-size: 22px; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; margin: 0 0 8px; }
          .document-subtitle { font-size: 12px; margin: 0; color: #444444; }
          .document-rule { border-top: 2px solid #111111; margin: 16px 0 0; }
          .section-title { font-size: 14px; font-weight: 700; text-transform: uppercase; margin: 22px 0 10px; }
          .summary-copy { font-size: 12px; margin: 0 0 16px; color: #333333; }
          .details-table { width: 100%; border-collapse: collapse; margin-bottom: 18px; }
          .details-table td { border: 1px solid #1f1f1f; padding: 9px 10px; font-size: 12px; vertical-align: top; }
          .details-label { width: 20%; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; background: #f4f4f4; }
          .totals-row td { font-weight: 700; }
          table { width: 100%; border-collapse: collapse; }
          th, td { text-align: left; padding: 9px 8px; border: 1px solid #1f1f1f; font-size: 12px; vertical-align: top; }
          th { background: #f4f4f4; text-transform: uppercase; letter-spacing: 0.03em; font-size: 11px; }
          .empty-block { border: 1px solid #1f1f1f; padding: 18px; background: #fafafa; }
          .empty-title { font-size: 14px; font-weight: 600; margin-bottom: 6px; }
          .empty-copy { font-size: 12px; color: #666666; line-height: 1.5; }
          .footer-note { margin-top: 18px; font-size: 11px; color: #444444; }
        </style>
      </head>
      <body>
        <div class="document-header">
          <p class="document-title">OJT Attendance Record</p>
          <p class="document-subtitle">Official attendance summary for internship / on-the-job training submission</p>
          <div class="document-rule"></div>
        </div>

        <p class="summary-copy">
          This document certifies the recorded attendance of the student named below based on the time entries saved in OJT Tracker as of ${escapeHtml(formatDateTime(generatedAt))}.
        </p>

        <table class="details-table">
          <tr>
            <td class="details-label">Student Name</td>
            <td>${escapeHtml(profile.fullName)}</td>
            <td class="details-label">Student ID</td>
            <td>${escapeHtml(profile.studentId ?? 'Not provided')}</td>
          </tr>
          <tr>
            <td class="details-label">School</td>
            <td>${escapeHtml(profile.school ?? 'Not provided')}</td>
            <td class="details-label">Program</td>
            <td>${escapeHtml(profile.department ?? 'Not provided')}</td>
          </tr>
          <tr>
            <td class="details-label">Company</td>
            <td>${escapeHtml(profile.company ?? 'Not provided')}</td>
            <td class="details-label">Supervisor</td>
            <td>${escapeHtml(profile.supervisorName ?? 'Not provided')}</td>
          </tr>
          <tr>
            <td class="details-label">Coverage</td>
            <td>${escapeHtml(attendancePeriod)}</td>
            <td class="details-label">Generated On</td>
            <td>${escapeHtml(formatDate(generatedAt))}</td>
          </tr>
          <tr class="totals-row">
            <td class="details-label">Required Hours</td>
            <td>${profile.requiredHours.toFixed(0)} hours</td>
            <td class="details-label">Completed Hours</td>
            <td>${totalHours.toFixed(2)} hours</td>
          </tr>
          <tr class="totals-row">
            <td class="details-label">Completion</td>
            <td>${progressPercentage.toFixed(1)}%</td>
            <td class="details-label">Remaining Hours</td>
            <td>${remainingHours.toFixed(2)} hours</td>
          </tr>
          <tr>
            <td class="details-label">Completed Days</td>
            <td>${completedDays}</td>
            <td class="details-label">Incomplete Days</td>
            <td>${incompleteDays}</td>
          </tr>
          <tr>
            <td class="details-label">Attendance Rows</td>
            <td>${attendanceRows.length}</td>
            <td class="details-label">Manual Entries</td>
            <td>${manualEntries.length}</td>
          </tr>
          <tr>
            <td class="details-label">Open Sessions</td>
            <td colspan="3">${activeEntries.length}</td>
          </tr>
        </table>

        <div class="section-title">Attendance Record</div>
        ${attendanceSection}
        <p class="footer-note">
          This report was system-generated from recorded attendance entries and is intended for academic or internship monitoring purposes.
        </p>
      </body>
    </html>
  `;

  const result = await printToFileAsync({
    html,
    base64: true,
  });

  const fileName = `ORender-records-${getFriendlyDateSlug(new Date())}.pdf`;
  const file = new File(Paths.cache, fileName);
  file.create({ overwrite: true, intermediates: true });

  if (result.base64) {
    file.write(result.base64, { encoding: 'base64' });
  } else {
    const sourceFile = new File(result.uri);
    file.write(sourceFile.bytesSync());
  }

  return {
    file,
    fileName,
  };
};

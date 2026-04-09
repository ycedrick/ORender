import { expoDb } from '@/db/client';
import { useBackupHistory, useCreateBackupEntry } from '@/hooks/use-backup-history';
import { useDailyLogs } from '@/hooks/use-daily-logs';
import { useTimeEntries } from '@/hooks/use-time-entries';
import { useUserProfile } from '@/hooks/use-user-profile';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { EncodingType, StorageAccessFramework, writeAsStringAsync } from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useMemo, useState } from 'react';
import { Alert, Platform } from 'react-native';
import {
  buildBackupZip,
  createRecordsCsvFile,
  createRecordsPdfFile,
} from './export-utils';
import { restoreDatabase, validateOrenderFile } from './restore-utils';
import { formatBackupDate, formatFileSize } from './settings-utils';

import * as Updates from 'expo-updates';

export const useBackupRestoreScreen = () => {
  const router = useRouter();
  const { data: profile, isPending: isProfilePending } = useUserProfile();
  const { data: entries = [], isPending: isEntriesPending } = useTimeEntries();
  const { data: logs = [], isPending: isLogsPending } = useDailyLogs();
  const { data: backups = [], isPending: isBackupsPending } = useBackupHistory(profile?.id);
  const createBackupEntry = useCreateBackupEntry();
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const hasAnyRecords = entries.length > 0 || logs.length > 0;

  const formattedBackups = useMemo(() => backups.map((backup) => ({
    ...backup,
    formattedDate: formatBackupDate(backup.createdAt),
    formattedSize: formatFileSize(backup.fileSize),
  })), [backups]);

  const handleExportBackup = async () => {
    if (!profile) {
      Alert.alert('Profile unavailable', 'We could not find your profile for this export.');
      return;
    }

    if (Platform.OS === 'web') {
      Alert.alert('Unsupported on web', 'Database export is currently available on mobile builds only.');
      return;
    }

    try {
      setIsExportingBackup(true);

      // Force SQLite to flush all pending changes (in the -wal file) to the main database file
      // BEFORE we serialize it. Otherwise, recent data is lost in the backup.
      expoDb.execSync('PRAGMA wal_checkpoint(FULL);');

      const serializedDatabase = expoDb.serializeSync();

      const { file, fileName, fileSize } = await buildBackupZip(serializedDatabase, profile);

      // Record the backup in history
      await createBackupEntry.mutateAsync({
        userId: profile.id,
        filePath: file.uri,
        fileName,
        fileSize,
        type: 'export',
      });

      // Offer sharing as an optional follow-up
      Alert.alert(
        'Backup created',
        `"${fileName}" is ready. It's stored within the app for easy restoring.\n\nTo keep a copy in your device's files or send it somewhere, tap "Save to Device".`,
        [
          { text: 'Done', style: 'cancel' },
          {
            text: 'Save to Device',
            onPress: async () => {
              await saveToDevice(file.uri, fileName);
            },
          },
        ],
      );
    } catch {
      Alert.alert('Export failed', 'We could not create a backup file right now.');
    } finally {
      setIsExportingBackup(false);
    }
  };

  const shareFile = async (uri: string, mimeType: string) => {
    const sharingAvailable = await Sharing.isAvailableAsync();
    if (!sharingAvailable) {
      Alert.alert('Sharing unavailable', 'This device cannot share exported files right now.');
      return false;
    }

    await Sharing.shareAsync(uri, { mimeType });
    return true;
  };

  /**
   * Opens a native "Save As" dialog on Android via SAF.
   * Falls back to the share sheet on iOS.
   */
  const saveToDevice = async (sourceUri: string, fileName: string, mimeType: string = 'application/octet-stream', showSuccessAlert: boolean = true) => {
    if (Platform.OS === 'android') {
      try {
        const permissions = await StorageAccessFramework.requestDirectoryPermissionsAsync();
        if (!permissions.granted) return;

        const destinationUri = await StorageAccessFramework.createFileAsync(
          permissions.directoryUri,
          fileName,
          mimeType,
        );

        const sourceFile = new File(sourceUri);
        const base64Content = await sourceFile.base64();
        await writeAsStringAsync(destinationUri, base64Content, {
          encoding: EncodingType.Base64,
        });

        if (showSuccessAlert) {
          Alert.alert('Saved', `"${fileName}" has been saved to your chosen folder.`);
        }
      } catch {
        Alert.alert('Save failed', 'Could not save the file to your device.');
      }
    } else {
      // iOS: share sheet has a native "Save to Files" option
      await shareFile(sourceUri, mimeType);
    }
  };

  const handleExportRecordsCsv = async () => {
    if (!profile) {
      Alert.alert('Profile unavailable', 'We could not load your profile for this export.');
      return;
    }

    try {
      setIsExportingCsv(true);
      const { file, fileName } = createRecordsCsvFile(profile, entries, logs);
      await saveToDevice(file.uri, fileName, 'text/csv');
    } catch {
      Alert.alert('CSV export failed', 'We could not generate the records CSV right now.');
    } finally {
      setIsExportingCsv(false);
    }
  };

  const handleExportRecordsPdf = async () => {
    if (!profile) {
      Alert.alert('Profile unavailable', 'We could not load your profile for this export.');
      return;
    }

    try {
      setIsExportingPdf(true);
      const { file, fileName } = await createRecordsPdfFile(profile, entries, logs);

      Alert.alert(
        'PDF Report Ready',
        'How would you like to export your report?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Share',
            onPress: () => shareFile(file.uri, 'application/pdf'),
          },
          {
            text: 'Save to Device',
            onPress: () => saveToDevice(file.uri, fileName, 'application/pdf'),
          },
        ]
      );
    } catch {
      Alert.alert('PDF export failed', 'We could not generate the records PDF right now.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleImportBackup = async () => {
    if (Platform.OS === 'web') {
      Alert.alert('Unsupported on web', 'Restore is only available on mobile devices.');
      return;
    }

    try {
      // 1. Pick a file
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets?.[0]) return;

      const pickedFile = result.assets[0];

      // Quick extension check
      if (!pickedFile.name?.toLowerCase().endsWith('.orender')) {
        Alert.alert(
          'Invalid file',
          'Please select a file with the .orender extension.',
        );
        return;
      }

      setIsRestoring(true);

      // 2. Validate the archive
      const { manifest, databaseBytes } = await validateOrenderFile(pickedFile.uri);

      setIsRestoring(false);
      confirmAndRestore(manifest, databaseBytes);
    } catch (error) {
      setIsRestoring(false);
      const message = error instanceof Error ? error.message : 'An unexpected error occurred during restore.';
      Alert.alert('Restore failed', message);
    }
  };

  const handleRestoreFromHistory = async (filePath: string) => {
    try {
      setIsRestoring(true);

      const { manifest, databaseBytes } = await validateOrenderFile(filePath);

      setIsRestoring(false);
      confirmAndRestore(manifest, databaseBytes);
    } catch (error) {
      setIsRestoring(false);
      const message = error instanceof Error ? error.message : 'This backup file may have been moved or deleted.';
      Alert.alert('Restore failed', message);
    }
  };

  const handleBackupItemPress = (backup: typeof formattedBackups[number]) => {
    Alert.alert(
      backup.fileName,
      `Created ${backup.formattedDate} • ${backup.formattedSize}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save to Device',
          onPress: () => saveToDevice(backup.filePath, backup.fileName),
        },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => handleRestoreFromHistory(backup.filePath),
        },
      ],
    );
  };

  const confirmAndRestore = (manifest: { user: { fullName: string }; exportedAt: string; appVersion: string }, databaseBytes: Uint8Array) => {
    const backupDate = new Date(manifest.exportedAt).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    Alert.alert(
      'Restore backup?',
      `This will replace ALL your current data with the backup from:\n\n` +
      `Name: ${manifest.user.fullName}\n` +
      `Date: ${backupDate}\n` +
      `Version: v${manifest.appVersion}\n\n` +
      `This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: () => {
            try {
              restoreDatabase(databaseBytes);

              Alert.alert(
                'Restore complete',
                'Your data has been successfully restored. The app will now reload to apply the changes.',
                [
                  {
                    text: 'Reload App',
                    onPress: async () => {
                      await Updates.reloadAsync();
                    },
                  },
                ]
              );
            } catch (err: any) {
              const errMsg = err?.message || 'Unknown error occurred while replacing the file.';
              console.error("[RESTORE ERROR]", err);
              Alert.alert('Restore failed', `The database could not be replaced.\n\nError: ${errMsg}`);
            }
          },
        },
      ],
    );
  };

  return {
    backups: formattedBackups,
    hasAnyRecords,
    entriesCount: entries.length,
    logsCount: logs.length,
    isLoading: isProfilePending || isBackupsPending || isEntriesPending || isLogsPending,
    isExportingBackup,
    isExportingCsv,
    isExportingPdf,
    isRestoring,
    handleExportBackup,
    handleExportRecordsCsv,
    handleExportRecordsPdf,
    handleImportBackup,
    handleBackupItemPress,
    goBack: () => router.back(),
  };
};

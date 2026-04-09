import { Button, Card, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SettingsRow } from './components/SettingsRow';
import { useBackupRestoreScreen } from './hooks/use-backup-restore-screen';

export const BackupRestoreScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    backups,
    hasAnyRecords,
    entriesCount,
    logsCount,
    isLoading,
    isExportingBackup,
    isExportingCsv,
    isExportingPdf,
    isRestoring,
    handleExportBackup,
    handleExportRecordsCsv,
    handleExportRecordsPdf,
    handleImportBackup,
    handleBackupItemPress,
  } = useBackupRestoreScreen();

  return (
    <Screen edges={["right", "left"]} scroll style={styles.container} contentContainerStyle={styles.content}>
      <VStack spacing="lg">
        <VStack spacing="xs" style={styles.header}>
          <View style={styles.backButton}>
            <Button variant="ghost" title="← Back" size="sm" onPress={() => router.back()} />
          </View>
          <Text variant="xl" weight="bold">Backup & Restore</Text>
          <Text color={theme.colors.text.secondary}>
            Keep your data safe or share your records.
          </Text>
        </VStack>

        <Card variant="outlined" padding="lg">
          <VStack spacing="sm">
            <Text variant="lg" weight="bold">Create backup</Text>
            <Text variant="sm" color={theme.colors.text.secondary}>
              Save a copy of all your data as a shareable file.
            </Text>
            <Button title="Create Backup" onPress={handleExportBackup} loading={isExportingBackup} />
          </VStack>
        </Card>

        <Card variant="outlined" padding="lg">
          <VStack spacing="sm">
            <Text variant="lg" weight="bold">Export records</Text>
            {!hasAnyRecords ? (
              <Text variant="sm" color={theme.colors.text.secondary}>
                No records to export yet. Start tracking to generate reports.
              </Text>
            ) : (
              <Text variant="sm" color={theme.colors.text.secondary}>
                {entriesCount} time entr{entriesCount === 1 ? 'y' : 'ies'} and {logsCount} daily log{logsCount === 1 ? '' : 's'} available.
              </Text>
            )}
            <VStack spacing="sm">
              <Button title="Export PDF Report" onPress={handleExportRecordsPdf} loading={isExportingPdf} />
              <Button title="Export CSV Records" variant="outlined" onPress={handleExportRecordsCsv} loading={isExportingCsv} />
            </VStack>
          </VStack>
        </Card>

        <Card variant="outlined" padding="lg">
          <VStack spacing="sm">
            <Text variant="lg" weight="bold">Restore</Text>
            <Text variant="sm" color={theme.colors.text.secondary}>
              Tap a backup below to restore it, or import an .orender file from your device.
            </Text>
            <Button title="Import from File" variant="outlined" onPress={handleImportBackup} loading={isRestoring} />
          </VStack>
        </Card>

        <VStack spacing="sm">
          <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>BACKUP HISTORY</Text>
          <Text variant="xs" color={theme.colors.text.tertiary}>Tap a backup to restore or share it.</Text>
          {isLoading ? (
            <View style={styles.centeredState}>
              <ActivityIndicator color={theme.colors.action.primary} />
            </View>
          ) : backups.length === 0 ? (
            <Card variant="outlined" padding="lg">
              <Text color={theme.colors.text.secondary}>
                No backups yet. Create one above to get started.
              </Text>
            </Card>
          ) : (
            <VStack spacing="sm">
              {backups.map((backup) => (
                <SettingsRow
                  key={backup.id}
                  title={backup.fileName}
                  subtitle={backup.formattedDate}
                  value={backup.formattedSize}
                  iconName="document-outline"
                  onPress={() => handleBackupItemPress(backup)}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </VStack>

      <Spacer size="xxxl" />
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingBottom: 8,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: -16,
  },
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
});

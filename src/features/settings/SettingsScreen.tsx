import { appConstants } from '@/config/app-constants';
import { Card, Chip, HStack, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SettingsRow } from './components/SettingsRow';
import { useSettingsScreen } from './hooks/use-settings-screen';

export const SettingsScreen = () => {
  const { theme } = useTheme();
  const {
    profile,
    currentThemePreference,
    currentTimeFormat,
    isSavingTheme,
    isSavingTimeFormat,
    profileSubtitle,
    reminderSummary,
    backupSummary,
    versionLabel,
    isLoading,
    setThemePreference,
    setTimeFormatPreference,
    navigateToProfile,
    navigateToNotifications,
    navigateToBackup,
    navigateToAbout,
  } = useSettingsScreen();

  return (
    <Screen edges={["left", "right"]} scroll style={styles.container} contentContainerStyle={styles.content}>
      <VStack spacing="lg">
        <VStack spacing="xs">
          <Text variant="xl" weight="bold">Settings</Text>
          <Text color={theme.colors.text.secondary}>
            Manage your profile, reminders, export history, and app preferences.
          </Text>
        </VStack>

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={theme.colors.action.primary} />
          </View>
        ) : (
          <>
            <Card variant="outlined" padding="lg">
              <VStack spacing="xxs">
                <Text variant="lg" weight="bold">{profile?.fullName ?? 'Trainee profile'}</Text>
                <Text variant="sm" color={theme.colors.text.secondary}>{profileSubtitle}</Text>
              </VStack>
            </Card>

            <VStack spacing="sm">
              <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>APPEARANCE</Text>
              <Card variant="outlined" padding="lg">
                <VStack spacing="md">
                  <VStack spacing="xs">
                    <Text variant="sm" weight="semibold">Theme</Text>
                    <HStack spacing="xs" wrap>
                      <Chip label="System" selected={currentThemePreference === 'system'} onPress={() => setThemePreference('system')} disabled={isSavingTheme} />
                      <Chip label="Light" selected={currentThemePreference === 'light'} onPress={() => setThemePreference('light')} disabled={isSavingTheme} />
                      <Chip label="Dark" selected={currentThemePreference === 'dark'} onPress={() => setThemePreference('dark')} disabled={isSavingTheme} />
                    </HStack>
                  </VStack>

                  <VStack spacing="xs">
                    <Text variant="sm" weight="semibold">Time format</Text>
                    <HStack spacing="xs" wrap>
                      <Chip label="12-hour" selected={currentTimeFormat === '12h'} onPress={() => setTimeFormatPreference('12h')} disabled={isSavingTimeFormat} />
                      <Chip label="24-hour" selected={currentTimeFormat === '24h'} onPress={() => setTimeFormatPreference('24h')} disabled={isSavingTimeFormat} />
                    </HStack>
                  </VStack>
                </VStack>
              </Card>
            </VStack>

            <VStack spacing="sm">
              <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>ACCOUNT</Text>
              <SettingsRow
                title="Edit Profile"
                subtitle="Update your trainee details and required hours."
                iconName="person-circle-outline"
                onPress={navigateToProfile}
              />
            </VStack>

            <VStack spacing="sm">
              <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>APP</Text>
              <SettingsRow
                title="Notifications"
                subtitle="Clock in, clock out, and daily log reminders."
                value={reminderSummary}
                iconName="notifications-outline"
                onPress={navigateToNotifications}
              />
              <SettingsRow
                title="Backup & Restore"
                subtitle="Export your local database and review backup history."
                value={backupSummary}
                iconName="archive-outline"
                onPress={navigateToBackup}
              />
              <SettingsRow
                title="About"
                subtitle="Version, credits, and app information."
                value={`v${versionLabel}`}
                iconName="information-circle-outline"
                onPress={navigateToAbout}
              />
            </VStack>

            <Text variant="xs" align="center" color={theme.colors.text.tertiary}>
              {appConstants.appName} v{versionLabel}
            </Text>
          </>
        )}
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
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
});

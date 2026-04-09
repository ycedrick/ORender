import { Button, Card, HStack, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useAboutScreen } from './hooks/use-about-screen';

export const AboutScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { appName, version } = useAboutScreen();

  const features = [
    { icon: 'time-outline' as const, label: 'Clock in & out with one tap' },
    { icon: 'document-text-outline' as const, label: 'Daily logs & task tracking' },
    { icon: 'bar-chart-outline' as const, label: 'Progress reports & insights' },
    { icon: 'phone-portrait-outline' as const, label: 'Works fully offline' },
  ];

  return (
    <Screen edges={["right", "left"]} scroll style={styles.container} contentContainerStyle={styles.content}>
      <VStack spacing="lg">
        <VStack spacing="xs" style={styles.header}>
          <View style={styles.backButton}>
            <Button variant="ghost" title="← Back" size="sm" onPress={() => router.back()} />
          </View>
          <Text variant="xl" weight="bold">About</Text>

        </VStack>

        {/* What You Can Do */}
        <VStack spacing="sm">
          <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>WHAT YOU CAN DO</Text>
          <Card variant="outlined" padding="lg">
            <VStack spacing="md">
              {features.map((feat) => (
                <HStack key={feat.label} spacing="md" align="center">
                  <Ionicons name={feat.icon} size={20} color={theme.colors.text.secondary} />
                  <Text variant="sm" color={theme.colors.text.primary}>{feat.label}</Text>
                </HStack>
              ))}
            </VStack>
          </Card>
        </VStack>

        {/* Privacy Note */}
        <Card variant="outlined" padding="lg">
          <HStack spacing="md" align="center">
            <Ionicons name="lock-closed-outline" size={20} color={theme.colors.action.success} />
            <VStack spacing="xxs" style={styles.privacyCopy}>
              <Text variant="sm" weight="medium">Your data stays on your device</Text>
              <Text variant="xs" color={theme.colors.text.secondary}>
                No accounts, no cloud sync. Everything is stored locally and belongs to you.
              </Text>
            </VStack>
          </HStack>
        </Card>

        <Text variant="xs" align="center" color={theme.colors.text.tertiary}>
          Made with care for OJT trainees everywhere.
        </Text>
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
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  privacyCopy: {
    flex: 1,
  },
});

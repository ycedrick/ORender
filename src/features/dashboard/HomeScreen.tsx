import { HStack, IconButton, Screen, Spacer, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { ClockButton } from './components/ClockButton';
import { ProgressRing } from './components/ProgressRing';
import { QuickActions } from './components/QuickActions';
import { TodaySummary } from './components/TodaySummary';
import { useDashboard } from './hooks/use-dashboard';
import { useSessionControls } from '@/hooks/use-session-controls';

export const HomeScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    activeSession,
    handleClockIn,
    handleClockOut,
    isClockActionDisabled,
    isClockingIn,
    isClockingOut,
  } = useSessionControls();
  const {
    totalCompletedHours,
    todayCompletedHours,
    requiredHours,
    progressPercentage,
  } = useDashboard();

  return (
    <Screen safeArea edges={['left', 'right']} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Spacer size="md" />

        <HStack justify="flex-end" align="center" style={[styles.header]}>
          <IconButton
            icon={<Ionicons name="scan-outline" size={20} color={theme.colors.text.primary} />}
            variant="outlined"
            onPress={() => router.push('/focus-session')}
            accessibilityLabel="Open focus mode"
          />
          <Spacer size="sm" />
          <IconButton
            icon={<Ionicons name="time-outline" size={20} color={theme.colors.text.primary} />}
            variant="outlined"
            onPress={() => router.push('/history')}
            accessibilityLabel="Open history"
          />
        </HStack>
        <VStack align="center" spacing="xl" fill>
          {/* Progress Ring */}
          <ProgressRing
            progressPercentage={progressPercentage}
            totalCompletedHours={totalCompletedHours}
            requiredHours={requiredHours}
          />

          {/* Main Action Button */}
          <ClockButton
            isActive={!!activeSession}
            onClockIn={handleClockIn}
            onClockOut={handleClockOut}
            loading={isClockingIn || isClockingOut}
            disabled={isClockActionDisabled}
          />
        </VStack>

        <Spacer size="xl" />

        {/* Dashboard Cards Area */}
        <VStack spacing="md">
          <TodaySummary todayCompletedHours={todayCompletedHours} />
          <QuickActions />
        </VStack>

        <Spacer size="xxxl" />
      </ScrollView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingTop: 8,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 8,
  },
});

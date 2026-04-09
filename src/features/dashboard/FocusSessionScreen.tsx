import { IconButton, Screen, VStack } from '@/components/ui';
import { useSessionControls } from '@/hooks/use-session-controls';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { ClockButton } from './components/ClockButton';
import { ProgressRing } from './components/ProgressRing';
import { SessionTimer } from './components/SessionTimer';
import { useDashboard } from './hooks/use-dashboard';

export const FocusSessionScreen = () => {
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
    requiredHours,
    progressPercentage,
  } = useDashboard();

  const opacity = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        speed: 18,
        bounciness: 5,
      }),
    ]).start();
  }, [opacity, scale]);

  return (
    <Screen safeArea edges={['left', 'right']} style={styles.screen}>
      <View style={styles.header}>
        <IconButton
          icon={<Ionicons name="close-outline" size={24} color={theme.colors.text.primary} />}
          variant="outlined"
          onPress={() => router.back()}
          accessibilityLabel="Close focus mode"
        />
      </View>

      <View style={styles.contentWrap}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity,
              transform: [{ scale }],
            },
          ]}
        >
          <VStack align="center" spacing="xl">
            <SessionTimer clockInTime={activeSession?.clockIn ?? null} />
            <ProgressRing
              progressPercentage={progressPercentage}
              totalCompletedHours={totalCompletedHours}
              requiredHours={requiredHours}
              size={250}
              strokeWidth={16}
            />
            <ClockButton
              isActive={!!activeSession}
              onClockIn={handleClockIn}
              onClockOut={handleClockOut}
              loading={isClockingIn || isClockingOut}
              disabled={isClockActionDisabled}
            />
          </VStack>
        </Animated.View>
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  header: {
    paddingTop: 8,
    alignItems: 'flex-end',
  },
  contentWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 32,
  },
  content: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { HStack, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';

interface ActiveSessionBannerProps {
  clockInTime: Date;
  onStop: () => void;
  loading?: boolean;
}

export const ActiveSessionBanner: React.FC<ActiveSessionBannerProps> = ({
  clockInTime,
  onStop,
  loading = false,
}) => {
  const { theme } = useTheme();
  const [elapsed, setElapsed] = useState('');

  const startedAt = new Date(clockInTime).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });

  useEffect(() => {
    const updateElapsed = () => {
      const now = new Date();
      const diffSecs = Math.max(0, Math.floor((now.getTime() - clockInTime.getTime()) / 1000));

      const hours = Math.floor(diffSecs / 3600);
      const minutes = Math.floor((diffSecs % 3600) / 60);
      const seconds = diffSecs % 60;

      const pad = (n: number) => n.toString().padStart(2, '0');

      if (hours > 0) {
        setElapsed(`${hours}:${pad(minutes)}:${pad(seconds)}`);
      } else {
        setElapsed(`${pad(minutes)}:${pad(seconds)}`);
      }
    };

    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [clockInTime]);

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface.input,
          borderColor: theme.colors.border.default,
        }
      ]}
    >
      <VStack spacing="xs">
        <HStack align="center" justify="space-between">
          <VStack spacing="xxs" style={styles.leftGroup}>
            <Text variant="sm" weight="medium" color={theme.colors.text.primary}>
              Clocked in
            </Text>
            <Text variant="xs" color={theme.colors.text.secondary}>
              Started {startedAt}
            </Text>
          </VStack>

          <HStack spacing="sm" align="center" style={styles.rightGroup}>
            <Text variant="xl" weight="bold" color={theme.colors.text.primary} style={styles.timeValue}>
              {elapsed}
            </Text>
            <Pressable
              onPress={onStop}
              disabled={loading}
              accessibilityRole="button"
              accessibilityLabel="Stop active session"
              style={({ pressed }) => [
                styles.stopButton,
                {
                  backgroundColor: theme.colors.surface.card,
                  borderColor: theme.colors.border.default,
                  opacity: loading ? theme.opacity.disabled : (pressed ? theme.opacity.pressed : 1),
                }
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color={theme.colors.action.danger} />
              ) : (
                <Ionicons name="stop-circle-outline" size={24} color={theme.colors.action.danger} />
              )}
            </Pressable>
          </HStack>
        </HStack>
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  timeValue: {
    fontVariant: ['tabular-nums'],
  },
  leftGroup: {
    flex: 1,
  },
  rightGroup: {
    minWidth: 104,
    justifyContent: 'flex-end',
  },
  stopButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import { Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import React, { useEffect, useState } from 'react';
import { StyleSheet } from 'react-native';

interface SessionTimerProps {
  clockInTime?: Date | null;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({ clockInTime }) => {
  const { theme } = useTheme();
  const [elapsed, setElapsed] = useState('00:00');

  useEffect(() => {
    if (!clockInTime) {
      setElapsed('00:00');
      return;
    }

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

  const startedAt = clockInTime
    ? new Date(clockInTime).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    })
    : null;

  return (
    <VStack align="center" spacing="xs">
      <Text variant="display" weight="bold" style={styles.timerValue}>
        {elapsed}
      </Text>
      <Text variant="sm" color={theme.colors.text.secondary}>
        {startedAt ? `Started ${startedAt}` : 'No active session'}
      </Text>
    </VStack>
  );
};

const styles = StyleSheet.create({
  timerValue: {
    fontVariant: ['tabular-nums'],
    lineHeight: 58,
  },
});

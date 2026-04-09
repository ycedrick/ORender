import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from '@/hooks/use-theme';
import { Text, VStack, HStack, Divider } from '@/components/ui';

interface TodaySummaryProps {
  todayCompletedHours: number;
}

export const TodaySummary: React.FC<TodaySummaryProps> = ({ todayCompletedHours }) => {
  const { theme } = useTheme();

  return (
    <View style={styles.container}>
      <VStack spacing="xs">
        <HStack align="center" justify="space-between">
          <Text variant="sm" weight="semibold" color={theme.colors.text.secondary}>
            TODAY
          </Text>
          <Text variant="md" weight="bold" color={theme.colors.text.primary}>
            {todayCompletedHours.toFixed(2)} hrs
          </Text>
        </HStack>
        <Divider spacing="sm" />
        <Text variant="xs" color={theme.colors.text.tertiary}>
          {todayCompletedHours === 0 
            ? "You haven't logged any hours completed yet today." 
            : "Great job! Keep up the consistency."}
        </Text>
      </VStack>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  }
});

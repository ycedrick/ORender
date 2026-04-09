import { Button, HStack, IconButton, Screen, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View, useWindowDimensions } from 'react-native';
import { MonthGrid } from './components/MonthGrid';
import { toDateKey, useCalendarScreen } from './hooks/use-calendar-screen';

export const CalendarScreen = () => {
  const router = useRouter();
  const listRef = React.useRef<FlatList>(null);
  const isPageTransitioningRef = React.useRef(false);
  const { width: windowWidth } = useWindowDimensions();
  const { theme } = useTheme();
  const {
    monthLabel,
    weekdayLabels,
    monthPages,
    visibleMonthSummary,
    goToPreviousMonth,
    goToNextMonth,
    isLoading,
  } = useCalendarScreen();

  const pageWidth = Math.max(windowWidth - (theme.layout.screenPaddingHorizontal * 2), 1);
  const [displayedMonthLabel, setDisplayedMonthLabel] = React.useState(monthLabel);

  React.useEffect(() => {
    listRef.current?.scrollToIndex({ index: 1, animated: false });
    const frame = requestAnimationFrame(() => {
      isPageTransitioningRef.current = false;
      setDisplayedMonthLabel(monthLabel);
    });

    return () => cancelAnimationFrame(frame);
  }, [monthLabel, monthPages]);

  const handleMomentumEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isPageTransitioningRef.current) {
      return;
    }

    const offsetX = event.nativeEvent.contentOffset.x;
    const pageIndex = Math.round(offsetX / pageWidth);

    if (pageIndex === 0) {
      isPageTransitioningRef.current = true;
      setDisplayedMonthLabel(
        monthPages[0]?.monthDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }) ?? monthLabel
      );
      goToPreviousMonth();
    } else if (pageIndex === 2) {
      isPageTransitioningRef.current = true;
      setDisplayedMonthLabel(
        monthPages[2]?.monthDate.toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        }) ?? monthLabel
      );
      goToNextMonth();
    } else {
      setDisplayedMonthLabel(monthLabel);
    }
  };

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const nextPreviewIndex = Math.min(2, Math.max(0, Math.round(offsetX / pageWidth)));
    const previewMonth = monthPages[nextPreviewIndex]?.monthDate;
    if (!previewMonth) return;

    setDisplayedMonthLabel(
      previewMonth.toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    );
  };

  const handlePreviousPress = () => {
    if (isPageTransitioningRef.current) return;
    isPageTransitioningRef.current = true;
    goToPreviousMonth();
  };

  const handleNextPress = () => {
    if (isPageTransitioningRef.current) return;
    isPageTransitioningRef.current = true;
    goToNextMonth();
  };

  return (
    <Screen edges={['left', 'right']} scroll style={styles.container} contentContainerStyle={styles.content}>
      <VStack spacing="lg">
        <VStack spacing="xs">
          <Text variant="xl" weight="bold">Calendar</Text>
          <Text color={theme.colors.text.secondary}>
            Review your month at a glance with day-by-day activity markers.
          </Text>
        </VStack>

        <HStack justify="space-between" align="center">
          <IconButton
            icon={<Ionicons name="chevron-back" size={18} color={theme.colors.text.primary} />}
            variant="outlined"
            onPress={handlePreviousPress}
            accessibilityLabel="Previous month"
          />
          <Text variant="lg" weight="semibold">{displayedMonthLabel}</Text>
          <IconButton
            icon={<Ionicons name="chevron-forward" size={18} color={theme.colors.text.primary} />}
            variant="outlined"
            onPress={handleNextPress}
            accessibilityLabel="Next month"
          />
        </HStack>

        <HStack spacing="md" wrap>
          <HStack spacing="xs" align="center">
            <View style={[styles.legendDot, { backgroundColor: theme.colors.action.success }]} />
            <Text variant="xs" color={theme.colors.text.secondary}>Logged</Text>
          </HStack>
          <HStack spacing="xs" align="center">
            <View style={[styles.legendDot, { backgroundColor: theme.colors.action.danger }]} />
            <Text variant="xs" color={theme.colors.text.secondary}>Incomplete</Text>
          </HStack>
          <HStack spacing="xs" align="center">
            <View style={[styles.legendDot, { backgroundColor: theme.colors.action.warning }]} />
            <Text variant="xs" color={theme.colors.text.secondary}>Log only</Text>
          </HStack>
        </HStack>

        {!isLoading && !visibleMonthSummary.hasAnyActivity && (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface.input, borderColor: theme.colors.border.default }]}>
            <VStack spacing="xs">
              <Text variant="sm" weight="semibold">No activity recorded this month</Text>
              <Text variant="xs" color={theme.colors.text.secondary}>
                Add an entry or log to populate the calendar.
              </Text>
            </VStack>
            <HStack spacing="sm" wrap>
              <Button title="Manual Entry" variant="outlined" size="sm" onPress={() => router.push('/entry/manual')} />
              <Button title="Create Log" size="sm" onPress={() => router.push('/log/create')} />
            </HStack>
          </View>
        )}

        {isLoading ? (
          <View style={styles.loadingState}>
            <ActivityIndicator color={theme.colors.action.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={monthPages}
            keyExtractor={(item) => item.key}
            horizontal
            pagingEnabled
            bounces={false}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={1}
            getItemLayout={(_, index) => ({
              length: pageWidth,
              offset: pageWidth * index,
              index,
            })}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            onMomentumScrollEnd={handleMomentumEnd}
            renderItem={({ item }) => (
              <View style={{ width: pageWidth }}>
                <MonthGrid
                  weekdayLabels={weekdayLabels}
                  weeks={item.weeks}
                  onSelectDay={(date) => router.push(`/calendar/${toDateKey(date)}`)}
                />
              </View>
            )}
          />
        )}
      </VStack>
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
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  loadingState: {
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 10,
  },
});

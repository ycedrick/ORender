import { Button, Chip, HStack, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { HistoryEntryCard } from './components/HistoryEntryCard';
import { useHistoryScreen } from './hooks/use-history-screen';

export const HistoryScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const {
    entries,
    isPending,
    summary,
    searchQuery,
    statusFilter,
    sourceFilter,
    setSearchQuery,
    setStatusFilter,
    setSourceFilter,
  } = useHistoryScreen();

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface.input,
      borderColor: theme.colors.border.default,
      color: theme.colors.text.primary,
    }
  ];

  return (
    <Screen edges={["right", "left"]} scroll style={styles.container} contentContainerStyle={styles.content}>
      <VStack spacing="lg">
        <VStack spacing="xs" style={styles.header}>
          <View style={styles.backButton}>
            <Button
              variant="ghost"
              title="← Back"
              size="sm"
              onPress={() => router.back()}
            />
          </View>
          <Text variant="xl" weight="bold">History</Text>
          <Text color={theme.colors.text.secondary}>
            Review your past time entries and completed training hours.
          </Text>
        </VStack>

        <HStack spacing="sm" wrap>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
            <Text variant="xs" color={theme.colors.text.tertiary}>Entries</Text>
            <Text variant="lg" weight="bold">{summary.totalEntries}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
            <Text variant="xs" color={theme.colors.text.tertiary}>Hours</Text>
            <Text variant="lg" weight="bold">{summary.completedHours.toFixed(1)}</Text>
          </View>
          <View style={[styles.summaryCard, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
            <Text variant="xs" color={theme.colors.text.tertiary}>Manual</Text>
            <Text variant="lg" weight="bold">{summary.manualEntries}</Text>
          </View>
        </HStack>

        <VStack spacing="sm">
          <VStack spacing="xs">
            <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>SEARCH</Text>
            <TextInput
              style={inputStyle}
              placeholder="Search date, notes, or status"
              placeholderTextColor={theme.colors.text.tertiary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </VStack>

          <VStack spacing="xs">
            <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>STATUS</Text>
            <HStack spacing="xs" wrap>
              <Chip label="All" selected={statusFilter === 'all'} onPress={() => setStatusFilter('all')} />
              <Chip label="Completed" selected={statusFilter === 'completed'} onPress={() => setStatusFilter('completed')} />
              <Chip label="Active" selected={statusFilter === 'active'} onPress={() => setStatusFilter('active')} />
            </HStack>
          </VStack>

          <VStack spacing="xs">
            <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>SOURCE</Text>
            <HStack spacing="xs" wrap>
              <Chip label="All" selected={sourceFilter === 'all'} onPress={() => setSourceFilter('all')} />
              <Chip label="Clocked" selected={sourceFilter === 'clocked'} onPress={() => setSourceFilter('clocked')} />
              <Chip label="Manual" selected={sourceFilter === 'manual'} onPress={() => setSourceFilter('manual')} />
            </HStack>
          </VStack>
        </VStack>

        {isPending ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={theme.colors.action.primary} />
          </View>
        ) : entries.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
            <Ionicons name="time-outline" size={28} color={theme.colors.text.secondary} />
            <Text variant="md" weight="semibold" align="center">No matching time entries</Text>
            <Text align="center" color={theme.colors.text.secondary}>
              Try changing the search or filters, or add a manual entry to start building your history.
            </Text>
            <View style={styles.emptyStateButton}>
              <Button title="Add Manual Entry" onPress={() => router.push('/entry/manual')} />
            </View>
          </View>
        ) : (
          <VStack spacing="sm">
            {entries.map((entry) => (
              <HistoryEntryCard key={entry.id} entry={entry} />
            ))}
          </VStack>
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
    paddingTop: 8,
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
  summaryCard: {
    flexGrow: 1,
    minWidth: 100,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
  },
  emptyState: {
    alignItems: 'center',
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 28,
  },
  emptyStateButton: {
    alignSelf: 'center',
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
});

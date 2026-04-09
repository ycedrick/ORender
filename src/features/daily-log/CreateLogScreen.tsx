import { Button, Chip, HStack, KeyboardAwareView, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, TextInput, View } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { TaskList } from './components/TaskList';
import { useCreateLogScreen } from './hooks/use-create-log-screen';

export const CreateLogScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const { control, errors, isSubmitting, onSubmit, activeSession, recentShifts } = useCreateLogScreen();
  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface.input,
      borderColor: theme.colors.border.default,
      color: theme.colors.text.primary,
    }
  ];

  return (
    <Screen edges={["left", "right"]} style={styles.container}>
      {/* Header */}
      <VStack spacing="xs" style={[styles.header]}>
        <View style={styles.backButton}>
          <Button
            variant="ghost"
            title="← Back"
            size="sm"
            onPress={() => router.back()}
          />
        </View>
        <Text variant="xl" weight="bold">Create Daily Log</Text>
        <Text color={theme.colors.text.secondary}>
          Record what you accomplished and optionally bind it to today&apos;s shift.
        </Text>
      </VStack>

      <KeyboardAwareView offset={20} contentContainerStyle={styles.scrollContent}>
        <VStack spacing="xl">

          {/* Active Session Info Banner */}
          <View style={[
            styles.infoBanner,
            {
              backgroundColor: activeSession ? theme.colors.action.primary + '15' : theme.colors.surface.card,
              borderColor: activeSession ? theme.colors.action.primary : theme.colors.border.subtle
            }
          ]}>
            <Text
              variant="sm"
              weight={activeSession ? 'medium' : 'regular'}
              color={activeSession ? theme.colors.action.primary : theme.colors.text.secondary}
            >
              {activeSession
                ? 'Active shift detected. This log will be automatically tied to your current session.'
                : 'No active shift detected. This log will be saved as a standalone entry unless you bind it to a recent shift below.'}
            </Text>
          </View>

          {/* Past Shift Selector (Only if not currently active) */}
          {!activeSession && recentShifts && recentShifts.length > 0 && (
            <VStack spacing="sm">
              <Text variant="sm" weight="medium">Bind to a Recent Shift (Optional)</Text>
              <Controller
                control={control}
                name="selectedTimeEntryId"
                render={({ field: { value, onChange } }) => (
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <HStack spacing="sm">
                      {recentShifts.map((shift) => (
                        <Chip
                          key={shift.id}
                          label={`${new Date(shift.clockIn).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${shift.totalHours} hrs)`}
                          selected={value === shift.id}
                          onPress={() => {
                            onChange(value === shift.id ? undefined : shift.id);
                          }}
                        />
                      ))}
                    </HStack>
                  </ScrollView>
                )}
              />
            </VStack>
          )}

          {/* Title */}
          <VStack spacing="sm">
            <Text variant="sm" weight="medium">Log Title</Text>
            <Controller
              control={control}
              name="title"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[
                    ...inputStyle,
                    errors.title && { borderColor: theme.colors.action.danger }
                  ]}
                  placeholder="e.g. Frontend Development & Planning"
                  placeholderTextColor={theme.colors.text.tertiary}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.title && <Text variant="xs" color={theme.colors.action.danger}>{errors.title.message}</Text>}
          </VStack>

          {/* Description */}
          <VStack spacing="sm">
            <Text variant="sm" weight="medium">Notes / Description (Optional)</Text>
            <Controller
              control={control}
              name="description"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[
                    ...inputStyle,
                    styles.textArea,
                    errors.description && { borderColor: theme.colors.action.danger }
                  ]}
                  placeholder="Summarize your daily achievements or challenges..."
                  placeholderTextColor={theme.colors.text.tertiary}
                  multiline
                  numberOfLines={4}
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  textAlignVertical="top"
                />
              )}
            />
          </VStack>

          {/* Dynamic Task List */}
          <Controller
            control={control}
            name="tasks"
            render={({ field: { value, onChange } }) => (
              <TaskList
                tasks={value || []}
                onChange={onChange}
                error={errors.tasks?.message}
              />
            )}
          />

        </VStack>

        <Spacer size="xxxl" />

        <Button
          title="Save Log"
          onPress={onSubmit}
          loading={isSubmitting}
          fullWidth
        />

        <Spacer size="xxxl" />
      </KeyboardAwareView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 24,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: -16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 16,
  },
  infoBanner: {
    padding: 12,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: -8,
  }
});

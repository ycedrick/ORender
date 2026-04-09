import { Button, KeyboardAwareView, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller } from 'react-hook-form';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { TaskList } from './components/TaskList';
import { useEditLogScreen } from './hooks/use-edit-log-screen';

export const EditLogScreen = () => {
  const { theme } = useTheme();
  const router = useRouter();
  const {
    control,
    errors,
    log,
    formattedDate,
    isLoading,
    isSubmitting,
    onSubmit,
  } = useEditLogScreen();

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface.input,
      borderColor: theme.colors.border.default,
      color: theme.colors.text.primary,
    },
  ];

  return (
    <Screen edges={["left", "right"]} style={styles.container}>
      <VStack spacing="xs" style={styles.header}>
        <View style={styles.backButton}>
          <Button
            variant="ghost"
            title="← Back"
            size="sm"
            onPress={() => router.back()}
          />
        </View>
        <Text variant="xl" weight="bold">Edit Daily Log</Text>
        <Text color={theme.colors.text.secondary}>
          {formattedDate ? `Update tasks and notes for ${formattedDate}.` : 'Update tasks and notes for this daily log.'}
        </Text>
      </VStack>

      {isLoading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={theme.colors.action.primary} />
        </View>
      ) : !log ? (
        <View style={[styles.emptyState, { backgroundColor: theme.colors.surface.card, borderColor: theme.colors.border.subtle }]}>
          <Text variant="sm" weight="semibold" align="center">Daily log not found</Text>
          <Text variant="xs" align="center" color={theme.colors.text.secondary}>
            This log may have been removed or is no longer available.
          </Text>
        </View>
      ) : (
        <KeyboardAwareView offset={20} contentContainerStyle={styles.scrollContent}>
          <VStack spacing="xl">
            <VStack spacing="sm">
              <Text variant="sm" weight="medium">Log Title</Text>
              <Controller
                control={control}
                name="title"
                render={({ field: { value, onChange, onBlur } }) => (
                  <TextInput
                    style={[
                      ...inputStyle,
                      errors.title && { borderColor: theme.colors.action.danger },
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
                      errors.description && { borderColor: theme.colors.action.danger },
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
            title="Save Changes"
            onPress={onSubmit}
            loading={isSubmitting}
            fullWidth
          />

          <Spacer size="xxxl" />
        </KeyboardAwareView>
      )}
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
  loadingState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyState: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'center',
    gap: 8,
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
});

import { Button, KeyboardAwareView, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller } from 'react-hook-form';
import {
  Platform,
  StyleSheet,
  TextInput,
  View
} from 'react-native';

import { useManualEntryScreen } from './hooks/use-manual-entry-screen';

export const ManualEntryScreen = () => {
  const { theme } = useTheme();
  const { control, errors, isSubmitting, onSubmit } = useManualEntryScreen();
  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface.input,
      borderColor: theme.colors.border.default,
      color: theme.colors.text.primary,
    }
  ];

  const renderPicker = (
    value: Date | undefined,
    onChange: (...event: any[]) => void
  ) => {
    if (Platform.OS === 'ios') {
      return (
        <View style={styles.iosPickerContainer}>
          {value ? (
            <DateTimePicker
              value={value}
              mode="datetime"
              display="default"
              onChange={(event, selectedDate) => {
                if (selectedDate) onChange(selectedDate);
              }}
              textColor={theme.colors.text.primary}
              themeVariant={theme.mode}
            />
          ) : (
            <Button
              variant="outlined"
              title="Select Date & Time"
              onPress={() => onChange(new Date())}
            />
          )}
        </View>
      );
    }

    // Android behavior: sequential dialogs via API to avoid unmount crashes
    const openAndroidPicker = () => {
      DateTimePickerAndroid.open({
        value: value || new Date(),
        mode: 'date',
        onChange: (event, selectedDate) => {
          if (event.type === 'set' && selectedDate) {
            // After date is picked, open the time picker
            DateTimePickerAndroid.open({
              value: selectedDate,
              mode: 'time',
              onChange: (timeEvent, selectedTime) => {
                if (timeEvent.type === 'set' && selectedTime) {
                  onChange(selectedTime);
                }
              }
            });
          }
        }
      });
    };

    return (
      <View>
        <Button
          variant="outlined"
          title={value ? value.toLocaleString() : "Select Date & Time"}
          onPress={openAndroidPicker}
        />
      </View>
    );
  };

  const router = useRouter();

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
        <Text variant="xl" weight="bold">Manual Entry</Text>
        <Text color={theme.colors.text.secondary}>
          Log a past shift by setting the start and end times below.
        </Text>
      </VStack>

      <KeyboardAwareView offset={20} contentContainerStyle={styles.scrollContent}>
        <VStack spacing="lg">

          {/* Clock In */}
          <VStack spacing="sm">
            <Text variant="sm" weight="medium">Clock In Time</Text>
            <Controller
              control={control}
              name="clockIn"
              render={({ field: { value, onChange } }) => renderPicker(value, onChange)}
            />
            {errors.clockIn && <Text variant="xs" color={theme.colors.action.danger}>{errors.clockIn.message}</Text>}
          </VStack>

          {/* Clock Out */}
          <VStack spacing="sm">
            <Text variant="sm" weight="medium">Clock Out Time</Text>
            <Controller
              control={control}
              name="clockOut"
              render={({ field: { value, onChange } }) => renderPicker(value, onChange)}
            />
            {errors.clockOut && <Text variant="xs" color={theme.colors.action.danger}>{errors.clockOut.message}</Text>}
          </VStack>

          {/* Break Minutes */}
          <VStack spacing="sm">
            <Text variant="sm" weight="medium">Deducted Break (Minutes)</Text>
            <Controller
              control={control}
              name="breakMinutes"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[
                    ...inputStyle,
                    errors.breakMinutes && { borderColor: theme.colors.action.danger }
                  ]}
                  placeholder="0"
                  placeholderTextColor={theme.colors.text.tertiary}
                  keyboardType="number-pad"
                  value={value !== undefined ? String(value) : ''}
                  onChangeText={(text) => onChange(text ? parseInt(text, 10) : 0)}
                  onBlur={onBlur}
                />
              )}
            />
            {errors.breakMinutes && <Text variant="xs" color={theme.colors.action.danger}>{errors.breakMinutes.message}</Text>}
          </VStack>

          {/* Notes */}
          <VStack spacing="sm">
            <Text variant="sm" weight="medium">Notes (Optional)</Text>
            <Controller
              control={control}
              name="notes"
              render={({ field: { value, onChange, onBlur } }) => (
                <TextInput
                  style={[
                    ...inputStyle,
                    styles.textArea,
                    errors.notes && { borderColor: theme.colors.action.danger }
                  ]}
                  placeholder="Why was this entered manually?"
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

        </VStack>

        <Spacer size="xxl" />

        <Button
          title="Save Time Entry"
          onPress={onSubmit}
          loading={isSubmitting}
          fullWidth
        />

        <Spacer size="xxl" />
      </KeyboardAwareView>
    </Screen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: -16, // to visually align the text of the ghost button
  },
  scrollContent: {
    paddingBottom: 40,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  textArea: {
    height: 100,
    paddingTop: 12,
  },
  iosPickerContainer: {
    alignItems: 'flex-start', // iOS pickers are inline, keep them left aligned
  }
});

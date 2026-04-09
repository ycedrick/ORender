import { Button, Chip, HStack, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import DateTimePicker, { DateTimePickerAndroid } from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, StyleSheet, Switch, View } from 'react-native';
import { useNotificationsScreen } from './hooks/use-notifications-screen';

const weekdayOptions = [
  { label: 'Sun', value: 1 },
  { label: 'Mon', value: 2 },
  { label: 'Tue', value: 3 },
  { label: 'Wed', value: 4 },
  { label: 'Thu', value: 5 },
  { label: 'Fri', value: 6 },
  { label: 'Sat', value: 7 },
];

export const NotificationsScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [pickerDraftDate, setPickerDraftDate] = React.useState<Date | null>(null);
  const {
    reminders,
    activePickerType,
    isLoading,
    supportsInlineTimePicker,
    openTimePicker,
    closeTimePicker,
    handleToggleReminder,
    handleSaveReminderTime,
    handleToggleRepeatDay,
  } = useNotificationsScreen();

  const openAndroidTimePicker = (type: typeof reminders[number]['type'], date: Date) => {
    DateTimePickerAndroid.open({
      value: date,
      mode: 'time',
      onChange: (event, selectedDate) => {
        if (event.type === 'set' && selectedDate) {
          handleSaveReminderTime(type, selectedDate);
        }
      },
    });
  };

  const openReminderTimePicker = (type: typeof reminders[number]['type'], date: Date) => {
    if (Platform.OS === 'android') {
      openAndroidTimePicker(type, date);
      return;
    }

    setPickerDraftDate(date);
    openTimePicker(type);
  };

  return (
    <Screen edges={["right", "left"]} scroll style={styles.container} contentContainerStyle={styles.content}>
      <VStack spacing="lg">
        <VStack spacing="xs" style={styles.header}>
          <View style={styles.backButton}>
            <Button variant="ghost" title="← Back" size="sm" onPress={() => router.back()} />
          </View>
          <Text variant="xl" weight="bold">Notifications</Text>
          <Text color={theme.colors.text.secondary}>
            Configure on-device reminders for starting shifts, ending sessions, and writing logs.
          </Text>
        </VStack>

        {isLoading ? (
          <View style={styles.centeredState}>
            <ActivityIndicator color={theme.colors.action.primary} />
          </View>
        ) : (
          <VStack spacing="md">
            {reminders.map((reminder) => (
              <View
                key={reminder.type}
                style={[
                  styles.reminderCard,
                  {
                    backgroundColor: theme.colors.surface.card,
                    borderColor: theme.colors.border.subtle,
                  },
                ]}
              >
                <VStack spacing="md">
                  <HStack justify="space-between" align="center">
                    <VStack spacing="xxs" style={styles.reminderCopy}>
                      <Text variant="md" weight="semibold">{reminder.title}</Text>
                      <Text variant="sm" color={theme.colors.text.secondary}>{reminder.description}</Text>
                    </VStack>
                    <Switch
                      value={reminder.enabled}
                      onValueChange={(value) => handleToggleReminder(reminder.type, value)}
                      disabled={reminder.isSaving}
                      trackColor={{
                        false: theme.colors.border.default,
                        true: theme.colors.action.primary,
                      }}
                      thumbColor={theme.colors.surface.card}
                    />
                  </HStack>

                  <VStack spacing="sm">
                    <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>TIME</Text>
                    <Button
                      variant="outlined"
                      title={reminder.formattedTime}
                      onPress={() => openReminderTimePicker(reminder.type, reminder.pickerDate)}
                      disabled={!reminder.enabled || reminder.isSaving}
                    />
                    {supportsInlineTimePicker && activePickerType === reminder.type ? (
                      <View style={styles.inlinePicker}>
                        <DateTimePicker
                          value={pickerDraftDate ?? reminder.pickerDate}
                          mode="time"
                          display="spinner"
                          onChange={(event, selectedDate) => {
                            if (selectedDate) {
                              setPickerDraftDate(selectedDate);
                            }
                          }}
                          textColor={theme.colors.text.primary}
                          themeVariant={theme.mode}
                        />
                        <HStack spacing="sm">
                          <Button
                            variant="ghost"
                            title="Cancel"
                            size="sm"
                            onPress={() => {
                              setPickerDraftDate(null);
                              closeTimePicker();
                            }}
                          />
                          <Button
                            variant="ghost"
                            title="Done"
                            size="sm"
                            onPress={() => {
                              handleSaveReminderTime(reminder.type, pickerDraftDate ?? reminder.pickerDate);
                              setPickerDraftDate(null);
                            }}
                          />
                        </HStack>
                      </View>
                    ) : null}
                  </VStack>

                  <VStack spacing="sm">
                    <Text variant="xs" weight="semibold" color={theme.colors.text.tertiary}>REPEAT DAYS</Text>
                    <HStack spacing="xs" wrap>
                      {weekdayOptions.map((day) => (
                        <Chip
                          key={day.value}
                          label={day.label}
                          size="sm"
                          selected={reminder.repeatDays.includes(day.value)}
                          disabled={!reminder.enabled || reminder.isSaving}
                          onPress={() => handleToggleRepeatDay(reminder.type, day.value)}
                        />
                      ))}
                    </HStack>
                    <Text variant="xs" color={theme.colors.text.secondary}>{reminder.repeatSummary}</Text>
                  </VStack>
                </VStack>
              </View>
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
  centeredState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 56,
  },
  reminderCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 16,
  },
  reminderCopy: {
    flex: 1,
    paddingRight: 16,
  },
  inlinePicker: {
    alignItems: 'flex-start',
  },
});

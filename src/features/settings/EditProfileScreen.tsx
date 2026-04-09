import { Button, KeyboardAwareView, Screen, Spacer, Text, VStack } from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import { useRouter } from 'expo-router';
import React from 'react';
import { Controller } from 'react-hook-form';
import { ActivityIndicator, StyleSheet, TextInput, View } from 'react-native';
import { useEditProfileScreen } from './hooks/use-edit-profile-screen';

export const EditProfileScreen = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const { control, errors, isLoading, isSubmitting, hasProfile, onSubmit } = useEditProfileScreen();

  const inputStyle = [
    styles.input,
    {
      backgroundColor: theme.colors.surface.input,
      borderColor: theme.colors.border.default,
      color: theme.colors.text.primary,
    }
  ];

  return (
    <Screen edges={["right", "left"]} style={styles.container}>
      <VStack spacing="xs" style={styles.header}>
        <View style={styles.backButton}>
          <Button variant="ghost" title="← Back" size="sm" onPress={() => router.back()} />
        </View>
        <Text variant="xl" weight="bold">Edit Profile</Text>
        <Text color={theme.colors.text.secondary}>
          Keep your trainee details and required hours up to date.
        </Text>
      </VStack>

      {isLoading ? (
        <View style={styles.centeredState}>
          <ActivityIndicator color={theme.colors.action.primary} />
        </View>
      ) : !hasProfile ? (
        <View style={styles.centeredState}>
          <Text align="center" color={theme.colors.text.secondary}>
            No trainee profile was found for this app session.
          </Text>
        </View>
      ) : (
        <KeyboardAwareView offset={20} contentContainerStyle={styles.scrollContent}>
          <VStack spacing="lg">
            {[
              { name: 'fullName', label: 'Full Name', placeholder: 'Juan Dela Cruz', required: true, autoCapitalize: 'words' as const },
              { name: 'studentId', label: 'Student ID', placeholder: '20XX-XXXXX' },
              { name: 'school', label: 'School / University', placeholder: 'University of the Philippines', autoCapitalize: 'words' as const },
              { name: 'department', label: 'Department / Program', placeholder: 'BS Information Technology', autoCapitalize: 'words' as const },
              { name: 'company', label: 'Company / Organization', placeholder: 'Acme Corporation', autoCapitalize: 'words' as const },
              { name: 'supervisorName', label: 'Supervisor Name', placeholder: 'Maria Santos', autoCapitalize: 'words' as const },
              { name: 'requiredHours', label: 'Required OJT Hours', placeholder: '600', keyboardType: 'numeric' as const, required: true },
            ].map((field) => (
              <VStack spacing="sm" key={field.name}>
                <Text variant="sm" weight="medium">
                  {field.label}{field.required ? ' *' : ''}
                </Text>
                <Controller
                  control={control}
                  name={field.name as never}
                  render={({ field: controllerField }) => (
                    <TextInput
                      style={[
                        ...inputStyle,
                        errors[field.name as keyof typeof errors] && { borderColor: theme.colors.action.danger },
                      ]}
                      placeholder={field.placeholder}
                      placeholderTextColor={theme.colors.text.tertiary}
                      autoCapitalize={field.autoCapitalize}
                      keyboardType={field.keyboardType}
                      value={(controllerField.value ?? '') as string}
                      onBlur={controllerField.onBlur}
                      onChangeText={controllerField.onChange}
                    />
                  )}
                />
                {errors[field.name as keyof typeof errors] ? (
                  <Text variant="xs" color={theme.colors.action.danger}>
                    {errors[field.name as keyof typeof errors]?.message as string}
                  </Text>
                ) : null}
              </VStack>
            ))}
          </VStack>

          <Spacer size="xxl" />

          <Button title="Save Profile" onPress={onSubmit} loading={isSubmitting} fullWidth />

          <Spacer size="xxl" />
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
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
    marginLeft: -16,
  },
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
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
});

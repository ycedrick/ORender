import {
  Button,
  Divider,
  Heading,
  Label,
  Screen,
  Spacer,
  Text,
  VStack
} from '@/components/ui';
import { useTheme } from '@/hooks/use-theme';
import React, { useEffect } from 'react';
import { Controller } from 'react-hook-form';
import { StyleSheet, TextInput } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';
import { useProfileSetupScreen } from './hooks/use-profile-setup-screen';

/**
 * Profile Setup screen — second step of onboarding.
 *
 * Collects the user's core info (name, school, company, hours)
 * and persists it to the local SQLite database.
 */
export const ProfileSetupScreen = () => {
  const { theme } = useTheme();
  const { control, handleSubmit, errors, isSubmitting } = useProfileSetupScreen();

  // ── Staggered fade-in values ─────────────────────────────────────────────
  const headerOpacity = useSharedValue(0);
  const headerY = useSharedValue(10);
  const formOpacity = useSharedValue(0);
  const formY = useSharedValue(14);

  useEffect(() => {
    headerOpacity.value = withDelay(100, withTiming(1, { duration: 450 }));
    headerY.value = withDelay(100, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));

    formOpacity.value = withDelay(300, withTiming(1, { duration: 450 }));
    formY.value = withDelay(300, withTiming(0, { duration: 450, easing: Easing.out(Easing.cubic) }));
  }, []);

  const headerStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerY.value }],
  }));

  const formStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formY.value }],
  }));

  // ── Shared input style builder ───────────────────────────────────────────
  const inputStyles = [
    styles.input,
    {
      backgroundColor: theme.colors.surface.input,
      color: theme.colors.text.primary,
      borderColor: theme.colors.border.default,
      fontFamily: theme.typography.fontFamily.regular,
      fontSize: theme.typography.fontSizes.md,
      borderRadius: theme.borderRadius.md,
    },
  ];

  return (
    <Screen safeArea scroll padding edges={['left', 'right', 'bottom']}>
      <VStack spacing="xl" style={styles.root}>
        {/* Header */}
        <Animated.View style={headerStyle}>
          <VStack spacing="sm">
            <Heading level={2}>Set up your profile</Heading>
            <Text dimmed lineHeight="relaxed">
              Tell us a bit about yourself so we can set things up. Only your name is required — the rest is optional.
            </Text>
          </VStack>
        </Animated.View>

        {/* Form */}
        <Animated.View style={formStyle}>
          <VStack spacing="xxl">
            {/* ── Required fields ─────────────────────────────────── */}
            <VStack spacing="lg">
              <Text variant="xs" weight="semibold" style={styles.sectionLabel} color={theme.colors.text.secondary}>
                REQUIRED
              </Text>

              <VStack spacing="xs">
                <Label required error={!!errors.fullName}>Full Name</Label>
                <Controller
                  control={control}
                  name="fullName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[inputStyles, errors.fullName && { borderColor: theme.colors.action.danger }]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Juan Dela Cruz"
                      placeholderTextColor={theme.colors.text.tertiary}
                      autoCapitalize="words"
                      autoComplete="name"
                      autoFocus
                    />
                  )}
                />
                {errors.fullName && (
                  <Text variant="xs" color={theme.colors.action.danger}>
                    {errors.fullName.message}
                  </Text>
                )}
              </VStack>

              <VStack spacing="xs">
                <Label required error={!!errors.requiredHours}>Required OJT Hours</Label>
                <Controller
                  control={control}
                  name="requiredHours"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={[inputStyles, errors.requiredHours && { borderColor: theme.colors.action.danger }]}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="600"
                      placeholderTextColor={theme.colors.text.tertiary}
                      keyboardType="numeric"
                    />
                  )}
                />
                {errors.requiredHours ? (
                  <Text variant="xs" color={theme.colors.action.danger}>
                    {errors.requiredHours.message}
                  </Text>
                ) : (
                  <Text variant="xs" muted>
                    The total hours your school requires for OJT completion.
                  </Text>
                )}
              </VStack>
            </VStack>

            <Divider spacing="xs" />

            {/* ── Optional fields ─────────────────────────────────── */}
            <VStack spacing="lg">
              <Text variant="xs" weight="semibold" style={styles.sectionLabel} color={theme.colors.text.secondary}>
                OPTIONAL
              </Text>

              <VStack spacing="xs">
                <Label>Student ID</Label>
                <Controller
                  control={control}
                  name="studentId"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyles}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="20XX-XXXXX"
                      placeholderTextColor={theme.colors.text.tertiary}
                    />
                  )}
                />
              </VStack>

              <VStack spacing="xs">
                <Label>School / University</Label>
                <Controller
                  control={control}
                  name="school"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyles}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="University of the Philippines"
                      placeholderTextColor={theme.colors.text.tertiary}
                      autoCapitalize="words"
                    />
                  )}
                />
              </VStack>

              <VStack spacing="xs">
                <Label>Department / Program</Label>
                <Controller
                  control={control}
                  name="department"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyles}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="BS Information Technology"
                      placeholderTextColor={theme.colors.text.tertiary}
                      autoCapitalize="words"
                    />
                  )}
                />
              </VStack>

              <VStack spacing="xs">
                <Label>Company / Organization</Label>
                <Controller
                  control={control}
                  name="company"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyles}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Acme Corp"
                      placeholderTextColor={theme.colors.text.tertiary}
                      autoCapitalize="words"
                    />
                  )}
                />
              </VStack>

              <VStack spacing="xs">
                <Label>Supervisor Name</Label>
                <Controller
                  control={control}
                  name="supervisorName"
                  render={({ field: { onChange, onBlur, value } }) => (
                    <TextInput
                      style={inputStyles}
                      onBlur={onBlur}
                      onChangeText={onChange}
                      value={value}
                      placeholder="Maria Santos"
                      placeholderTextColor={theme.colors.text.tertiary}
                      autoCapitalize="words"
                    />
                  )}
                />
              </VStack>
            </VStack>

            <Spacer size="sm" />

            {/* Submit */}
            <Button
              title="Continue"
              size="lg"
              fullWidth
              variant="filled"
              onPress={handleSubmit}
              loading={isSubmitting}
            />

            <Text variant="xs" muted align="center" style={styles.footerNote}>
              You can always update these later in Settings.
            </Text>

            <Spacer size="lg" />
          </VStack>
        </Animated.View>
      </VStack>
    </Screen>
  );
};

// ─── Styles ────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    paddingTop: 16,
    paddingBottom: 42,
  },
  sectionLabel: {
    letterSpacing: 1.2,
  },
  input: {
    height: 48,
    borderWidth: 1,
    paddingHorizontal: 16,
  },
  footerNote: {
    paddingBottom: 4,
  },
});

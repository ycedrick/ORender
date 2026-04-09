import { useEffect } from 'react';
import { Alert } from 'react-native';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useUserProfile, useUpdateUserProfile } from '@/hooks/use-user-profile';

const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  studentId: z.string().optional(),
  school: z.string().optional(),
  department: z.string().optional(),
  company: z.string().optional(),
  supervisorName: z.string().optional(),
  requiredHours: z.string().refine((value) => !Number.isNaN(parseFloat(value)) && parseFloat(value) > 0, {
    message: 'Required hours must be a positive number',
  }),
});

export type EditProfileFormData = z.infer<typeof profileSchema>;

export const useEditProfileScreen = () => {
  const router = useRouter();
  const { data: profile, isPending } = useUserProfile();
  const updateProfile = useUpdateUserProfile();

  const form = useForm<EditProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: '',
      studentId: '',
      school: '',
      department: '',
      company: '',
      supervisorName: '',
      requiredHours: '600',
    },
  });

  useEffect(() => {
    if (!profile) return;

    form.reset({
      fullName: profile.fullName,
      studentId: profile.studentId ?? '',
      school: profile.school ?? '',
      department: profile.department ?? '',
      company: profile.company ?? '',
      supervisorName: profile.supervisorName ?? '',
      requiredHours: `${profile.requiredHours}`,
    });
  }, [form, profile]);

  const handleSubmit = form.handleSubmit(async (values) => {
    if (!profile) {
      Alert.alert('Profile unavailable', 'We could not load your profile right now.');
      return;
    }

    try {
      await updateProfile.mutateAsync({
        id: profile.id,
        data: {
          fullName: values.fullName,
          studentId: values.studentId || null,
          school: values.school || null,
          department: values.department || null,
          company: values.company || null,
          supervisorName: values.supervisorName || null,
          requiredHours: parseFloat(values.requiredHours),
        },
      });

      Alert.alert('Profile updated', 'Your trainee profile was saved successfully.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Could not update profile', 'Please try saving your profile again.');
    }
  });

  return {
    control: form.control,
    errors: form.formState.errors,
    isLoading: isPending,
    isSubmitting: updateProfile.isPending,
    hasProfile: !!profile,
    onSubmit: handleSubmit,
  };
};

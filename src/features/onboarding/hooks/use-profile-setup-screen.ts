import { useOnboarding } from '@/hooks/use-onboarding';
import { useCreateUserProfile } from '@/hooks/use-user-profile';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Alert } from 'react-native';
import { z } from 'zod';

/**
 * Validation schema for the profile setup form.
 */
const profileSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').trim(),
  studentId: z.string().optional(),
  school: z.string().optional(),
  department: z.string().optional(),
  company: z.string().optional(),
  supervisorName: z.string().optional(),
  requiredHours: z.string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Required hours must be a positive number',
    }),
});

export type ProfileFormData = z.infer<typeof profileSchema>;

const INITIAL_VALUES: ProfileFormData = {
  fullName: '',
  studentId: '',
  school: '',
  department: '',
  company: '',
  supervisorName: '',
  requiredHours: '600',
};

/**
 * Business logic for the ProfileSetup screen.
 *
 * Manages the form state for the user profile fields using react-hook-form and zod,
 * persists to SQLite using TanStack Query, and completes onboarding on success.
 */
export const useProfileSetupScreen = () => {
  const { completeOnboarding } = useOnboarding();
  const { mutateAsync: createUserProfile, isPending: isSubmitting } = useCreateUserProfile();

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: INITIAL_VALUES,
  });

  const handleSubmit = async (data: ProfileFormData) => {
    try {
      await createUserProfile({
        fullName: data.fullName,
        studentId: data.studentId || null,
        school: data.school || null,
        department: data.department || null,
        company: data.company || null,
        supervisorName: data.supervisorName || null,
        requiredHours: parseFloat(data.requiredHours),
      });
      
      await completeOnboarding();
    } catch (error) {
      console.error('Failed to save profile:', error);
      Alert.alert('Something went wrong', 'Could not save your profile. Please try again.');
    }
  };

  return {
    control: form.control,
    handleSubmit: form.handleSubmit(handleSubmit),
    errors: form.formState.errors,
    isSubmitting,
    reset: form.reset,
  };
};

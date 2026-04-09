import { useMemo } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useCreateDailyLog } from '@/hooks/use-daily-logs';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useActiveSession, useTimeEntries } from '@/hooks/use-time-entries';

// Define the task item schema
export const taskItemSchema = z.object({
  id: z.string(),
  text: z.string().min(1, 'Task description cannot be empty'),
  completed: z.boolean(),
});

export type TaskItem = z.infer<typeof taskItemSchema>;

const createLogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tasks: z.array(taskItemSchema),
  selectedTimeEntryId: z.string().optional(),
});

export type CreateLogFormData = z.infer<typeof createLogSchema>;

export const useCreateLogScreen = () => {
  const router = useRouter();
  const { data: userProfile } = useUserProfile();
  const { data: activeSession } = useActiveSession();
  const { data: allTimeEntries } = useTimeEntries();
  const createDailyLog = useCreateDailyLog();

  // Get the 5 most recent completed shifts
  const recentShifts = useMemo(() => {
    if (!allTimeEntries) return [];
    return allTimeEntries
      .filter(entry => entry.status === 'complete' || entry.clockOut)
      .sort((a, b) => new Date(b.clockIn).getTime() - new Date(a.clockIn).getTime())
      .slice(0, 5);
  }, [allTimeEntries]);

  const { control, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<CreateLogFormData>({
    resolver: zodResolver(createLogSchema),
    defaultValues: {
      title: '',
      description: '',
      tasks: [],
      selectedTimeEntryId: undefined,
    }
  });

  const onSubmit = (data: CreateLogFormData) => {
    if (!userProfile?.id) {
      Alert.alert('Error', 'User profile not found. Cannot create daily log.');
      return;
    }

    createDailyLog.mutate({
      userId: userProfile.id,
      timeEntryId: activeSession?.id || data.selectedTimeEntryId || undefined, // Bind to active session, or selected, or standalone
      date: new Date(),
      title: data.title,
      description: data.description || null,
      tasksJson: JSON.stringify(data.tasks),
    }, {
      onSuccess: () => {
        Alert.alert('Success', 'Daily log saved successfully.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      },
      onError: (err: any) => {
        Alert.alert('Submission Error', err?.message || 'Failed to save daily log.');
      }
    });
  };

  return {
    control,
    errors,
    isSubmitting: createDailyLog.isPending,
    onSubmit: handleSubmit(onSubmit as any),
    setValue,
    getValues,
    watch,
    activeSession,
    recentShifts,
  };
};

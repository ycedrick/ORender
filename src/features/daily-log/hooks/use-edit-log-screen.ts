import { useEffect, useMemo } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useDailyLog, useUpdateDailyLog } from '@/hooks/use-daily-logs';
import { taskItemSchema, TaskItem } from './use-create-log-screen';

const editLogSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  tasks: z.array(taskItemSchema),
});

export type EditLogFormData = z.infer<typeof editLogSchema>;

const parseTasks = (raw: string | null): TaskItem[] => {
  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    const result = z.array(taskItemSchema).safeParse(parsed);
    return result.success ? result.data : [];
  } catch {
    return [];
  }
};

const parseRouteId = (value?: string | string[]) => Array.isArray(value) ? value[0] ?? '' : value ?? '';

export const useEditLogScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const logId = parseRouteId(params.id);
  const { data: log, isPending: isLogPending } = useDailyLog(logId);
  const updateDailyLog = useUpdateDailyLog();

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditLogFormData>({
    resolver: zodResolver(editLogSchema),
    defaultValues: {
      title: '',
      description: '',
      tasks: [],
    },
  });

  useEffect(() => {
    if (!log) return;

    reset({
      title: log.title ?? '',
      description: log.description ?? '',
      tasks: parseTasks(log.tasksJson),
    });
  }, [log, reset]);

  const formattedDate = useMemo(() => {
    if (!log) return '';
    return new Date(log.date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }, [log]);

  const onSubmit = (data: EditLogFormData) => {
    if (!logId) {
      Alert.alert('Error', 'Daily log not found.');
      return;
    }

    updateDailyLog.mutate({
      id: logId,
      data: {
        title: data.title,
        description: data.description || null,
        tasksJson: JSON.stringify(data.tasks),
      },
    }, {
      onSuccess: () => {
        Alert.alert('Success', 'Daily log updated successfully.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      },
      onError: (err: any) => {
        Alert.alert('Update Error', err?.message || 'Failed to update daily log.');
      },
    });
  };

  return {
    control,
    errors,
    log,
    formattedDate,
    isLoading: isLogPending,
    isSubmitting: updateDailyLog.isPending,
    onSubmit: handleSubmit(onSubmit),
  };
};

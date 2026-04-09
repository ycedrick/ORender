import { useState } from 'react';
import { Alert } from 'react-native';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { useCreateTimeEntry } from '@/hooks/use-time-entries';
import { useUserProfile } from '@/hooks/use-user-profile';

const manualEntrySchema = z.object({
  clockIn: z.date(),
  clockOut: z.date(),
  breakMinutes: z.number().min(0, 'Break minutes cannot be negative'),
  notes: z.string().optional(),
}).refine(data => data.clockOut > data.clockIn, {
  message: 'Clock-out time must be after clock-in time',
  path: ['clockOut']
});

export type ManualEntryFormData = z.infer<typeof manualEntrySchema>;

export const useManualEntryScreen = () => {
  const router = useRouter();
  const { data: userProfile } = useUserProfile();
  const createEntry = useCreateTimeEntry();

  const { control, handleSubmit, formState: { errors } } = useForm<ManualEntryFormData>({
    resolver: zodResolver(manualEntrySchema),
    defaultValues: {
      clockIn: undefined as unknown as Date,
      clockOut: undefined as unknown as Date,
      breakMinutes: 0,
      notes: '',
    }
  });

  const onSubmit = (data: ManualEntryFormData) => {
    if (!userProfile?.id) {
      Alert.alert('Error', 'User profile not found. Cannot create entry.');
      return;
    }

    // Calculate total hours
    const diffInMinutes = Math.floor((data.clockOut.getTime() - data.clockIn.getTime()) / 60000);
    const effectiveMinutes = Math.max(0, diffInMinutes - data.breakMinutes);
    const totalHours = Number((effectiveMinutes / 60).toFixed(2));

    createEntry.mutate({
      userId: userProfile.id,
      clockIn: data.clockIn,
      clockOut: data.clockOut,
      breakMinutes: data.breakMinutes,
      totalHours: totalHours,
      notes: data.notes,
      status: 'complete', // Because both in and out are provided
      isManual: true,     // Flag as manual entry
    }, {
      onSuccess: () => {
        Alert.alert('Success', 'Manual entry recorded successfully.', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      },
      onError: (err: any) => {
        Alert.alert('Submission Error', err?.message || 'Failed to save entry.');
      }
    });
  };

  return {
    control,
    errors,
    isSubmitting: createEntry.isPending,
    onSubmit: handleSubmit(onSubmit as any),
  };
};

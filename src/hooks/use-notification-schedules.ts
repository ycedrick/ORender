import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  NotificationScheduleService, 
  NotificationSchedule, 
  NewNotificationSchedule 
} from '@/services/local/notification-schedule-service';

export const notificationQueryKeys = {
  all: ['notifications'] as const,
  byUser: (userId: string) => ['notifications', 'user', userId] as const,
};

export function useNotificationSchedules(userId?: string) {
  return useQuery<NotificationSchedule[]>({
    queryKey: notificationQueryKeys.byUser(userId ?? ''),
    queryFn: () => NotificationScheduleService.getByUserId(userId!),
    enabled: !!userId,
  });
}

export function useCreateNotificationSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewNotificationSchedule, 'id'>) => NotificationScheduleService.create(data),
    onSuccess: async (newSchedule: NotificationSchedule) => {
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.byUser(newSchedule.userId) });
    },
  });
}

export function useUpdateNotificationSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<NewNotificationSchedule, 'id'>> }) => 
      NotificationScheduleService.update(id, data),
    onSuccess: async (updated: NotificationSchedule) => {
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.byUser(updated.userId) });
    },
  });
}

export function useDeleteNotificationSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      NotificationScheduleService.delete(id),
    onSuccess: async (_: void, { userId }: { userId: string }) => {
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: notificationQueryKeys.byUser(userId) });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  DailyLogService, 
  DailyLog, 
  NewDailyLog 
} from '@/services/local/daily-log-service';

export const dailyLogQueryKeys = {
  all: ['daily-logs'] as const,
  detail: (id: string) => ['daily-logs', id] as const,
};

export function useDailyLogs() {
  return useQuery<DailyLog[]>({
    queryKey: dailyLogQueryKeys.all,
    queryFn: () => DailyLogService.getAll(),
  });
}

export function useDailyLog(id: string) {
  return useQuery<DailyLog | null>({
    queryKey: dailyLogQueryKeys.detail(id),
    queryFn: async () => {
      const log = await DailyLogService.getById(id);
      return log ?? null;
    },
    enabled: !!id,
  });
}

export function useCreateDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewDailyLog, 'id'>) => DailyLogService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: dailyLogQueryKeys.all });
    },
  });
}

export function useUpdateDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<NewDailyLog, 'id'>> }) => 
      DailyLogService.update(id, data),
    onSuccess: async (updated: DailyLog) => {
      queryClient.setQueryData(dailyLogQueryKeys.detail(updated.id), updated);
      await queryClient.invalidateQueries({ queryKey: dailyLogQueryKeys.all });
    },
  });
}

export function useDeleteDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => DailyLogService.delete(id),
    onSuccess: async (_: void, id: string) => {
      queryClient.removeQueries({ queryKey: dailyLogQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: dailyLogQueryKeys.all });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  BreakService, 
  Break, 
  NewBreak 
} from '@/services/local/break-service';

export const breakQueryKeys = {
  all: ['breaks'] as const,
  byEntry: (timeEntryId: string) => ['breaks', 'entry', timeEntryId] as const,
};

export function useBreaks(timeEntryId?: string) {
  return useQuery<Break[]>({
    queryKey: breakQueryKeys.byEntry(timeEntryId ?? ''),
    queryFn: () => BreakService.getByTimeEntryId(timeEntryId!),
    enabled: !!timeEntryId,
  });
}

export function useCreateBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewBreak, 'id'>) => BreakService.create(data),
    onSuccess: async (newBreak: Break) => {
      await queryClient.invalidateQueries({ queryKey: breakQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: breakQueryKeys.byEntry(newBreak.timeEntryId) });
    },
  });
}

export function useUpdateBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<NewBreak, 'id'>> }) => 
      BreakService.update(id, data),
    onSuccess: async (updated: Break) => {
      await queryClient.invalidateQueries({ queryKey: breakQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: breakQueryKeys.byEntry(updated.timeEntryId) });
    },
  });
}

export function useDeleteBreak() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, timeEntryId }: { id: string; timeEntryId: string }) => 
      BreakService.delete(id),
    onSuccess: async (_: void, { timeEntryId }: { timeEntryId: string }) => {
      await queryClient.invalidateQueries({ queryKey: breakQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: breakQueryKeys.byEntry(timeEntryId) });
    },
  });
}

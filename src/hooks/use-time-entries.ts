import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  TimeEntryService, 
  TimeEntry, 
  NewTimeEntry 
} from '@/services/local/time-entry-service';

export const timeEntryQueryKeys = {
  all: ['time-entries'] as const,
  active: () => ['time-entries', 'active'] as const,
  detail: (id: string) => ['time-entries', id] as const,
};

export function useTimeEntries() {
  return useQuery<TimeEntry[]>({
    queryKey: timeEntryQueryKeys.all,
    queryFn: () => TimeEntryService.getAll(),
  });
}

export function useTimeEntry(id: string) {
  return useQuery<TimeEntry | null>({
    queryKey: timeEntryQueryKeys.detail(id),
    queryFn: async () => {
      const res = await TimeEntryService.getById(id);
      return res || null;
    },
    enabled: !!id,
  });
}

export function useActiveSession() {
  return useQuery<TimeEntry | null>({
    queryKey: timeEntryQueryKeys.active(),
    queryFn: async () => {
      const res = await TimeEntryService.getActiveSession();
      return res || null;
    },
  });
}

export function useCreateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewTimeEntry, 'id'>) => TimeEntryService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: timeEntryQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: timeEntryQueryKeys.active() });
    },
  });
}

export function useUpdateTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<NewTimeEntry, 'id'>> }) => 
      TimeEntryService.update(id, data),
    onSuccess: async (updated: TimeEntry) => {
      queryClient.setQueryData(timeEntryQueryKeys.detail(updated.id), updated);
      await queryClient.invalidateQueries({ queryKey: timeEntryQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: timeEntryQueryKeys.active() });
    },
  });
}

export function useDeleteTimeEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => TimeEntryService.delete(id),
    onSuccess: async (_: void, id: string) => {
      queryClient.removeQueries({ queryKey: timeEntryQueryKeys.detail(id) });
      await queryClient.invalidateQueries({ queryKey: timeEntryQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: timeEntryQueryKeys.active() });
    },
  });
}

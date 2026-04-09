import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  SavedTaskService, 
  SavedTask, 
  NewSavedTask 
} from '@/services/local/saved-task-service';

export const savedTaskQueryKeys = {
  all: ['saved-tasks'] as const,
};

export function useSavedTasks() {
  return useQuery<SavedTask[]>({
    queryKey: savedTaskQueryKeys.all,
    queryFn: () => SavedTaskService.getAll(),
  });
}

export function useCreateSavedTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewSavedTask, 'id'>) => SavedTaskService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: savedTaskQueryKeys.all });
    },
  });
}

export function useIncrementTaskUsage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SavedTaskService.incrementUseCount(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: savedTaskQueryKeys.all });
    },
  });
}

export function useDeleteSavedTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => SavedTaskService.delete(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: savedTaskQueryKeys.all });
    },
  });
}

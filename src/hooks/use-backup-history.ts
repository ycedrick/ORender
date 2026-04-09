import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  BackupHistoryService, 
  BackupHistory, 
  NewBackupHistory 
} from '@/services/local/backup-history-service';

export const backupQueryKeys = {
  all: ['backups'] as const,
  byUser: (userId: string) => ['backups', 'user', userId] as const,
};

export function useBackupHistory(userId?: string) {
  return useQuery<BackupHistory[]>({
    queryKey: backupQueryKeys.byUser(userId ?? ''),
    queryFn: () => BackupHistoryService.getByUserId(userId!),
    enabled: !!userId,
  });
}

export function useCreateBackupEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewBackupHistory, 'id'>) => BackupHistoryService.create(data),
    onSuccess: async (newEntry: BackupHistory) => {
      await queryClient.invalidateQueries({ queryKey: backupQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: backupQueryKeys.byUser(newEntry.userId) });
    },
  });
}

export function useDeleteBackupEntry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string }) => 
      BackupHistoryService.delete(id),
    onSuccess: async (_: void, { userId }: { userId: string }) => {
      await queryClient.invalidateQueries({ queryKey: backupQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: backupQueryKeys.byUser(userId) });
    },
  });
}

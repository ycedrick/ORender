import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  LogAttachmentService, 
  LogAttachment, 
  NewLogAttachment 
} from '@/services/local/log-attachment-service';

export const logAttachmentQueryKeys = {
  all: ['log-attachments'] as const,
  byLog: (dailyLogId: string) => ['log-attachments', 'log', dailyLogId] as const,
};

export function useLogAttachments(dailyLogId?: string) {
  return useQuery<LogAttachment[]>({
    queryKey: logAttachmentQueryKeys.byLog(dailyLogId ?? ''),
    queryFn: () => LogAttachmentService.getByDailyLogId(dailyLogId!),
    enabled: !!dailyLogId,
  });
}

export function useCreateLogAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewLogAttachment, 'id'>) => LogAttachmentService.create(data),
    onSuccess: async (newAttachment: LogAttachment) => {
      await queryClient.invalidateQueries({ queryKey: logAttachmentQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: logAttachmentQueryKeys.byLog(newAttachment.dailyLogId) });
    },
  });
}

export function useDeleteLogAttachment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, dailyLogId }: { id: string; dailyLogId: string }) => 
      LogAttachmentService.delete(id),
    onSuccess: async (_: void, { dailyLogId }: { dailyLogId: string }) => {
      await queryClient.invalidateQueries({ queryKey: logAttachmentQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: logAttachmentQueryKeys.byLog(dailyLogId) });
    },
  });
}

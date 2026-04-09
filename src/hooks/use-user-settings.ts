import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  UserSettingsService, 
  UserSettings, 
  NewUserSettings 
} from '@/services/local/user-settings-service';

export const userSettingsQueryKeys = {
  all: ['user-settings'] as const,
  byUser: (userId: string) => ['user-settings', userId] as const,
};

export function useUserSettings(userId?: string) {
  return useQuery<UserSettings | null>({
    queryKey: userSettingsQueryKeys.byUser(userId ?? ''),
    queryFn: () => UserSettingsService.getByUserId(userId!),
    enabled: !!userId,
  });
}

export function useCreateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewUserSettings, 'id'>) => UserSettingsService.create(data),
    onSuccess: async (settings) => {
      await queryClient.invalidateQueries({ queryKey: userSettingsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: userSettingsQueryKeys.byUser(settings.userId) });
    },
  });
}

export function useUpdateUserSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<NewUserSettings, 'id'>> }) => 
      UserSettingsService.update(id, data),
    onSuccess: async (updated: UserSettings) => {
      await queryClient.invalidateQueries({ queryKey: userSettingsQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: userSettingsQueryKeys.byUser(updated.userId) });
    },
  });
}

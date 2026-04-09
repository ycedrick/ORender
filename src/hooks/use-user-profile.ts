import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  UserProfileService, 
  UserProfile, 
  NewUserProfile 
} from '@/services/local/user-profile-service';

export const userProfileQueryKeys = {
  all: ['user-profile'] as const,
};

export function useUserProfile() {
  return useQuery<UserProfile | null>({
    queryKey: userProfileQueryKeys.all,
    queryFn: async () => {
      const res = await UserProfileService.get();
      return res || null;
    },
  });
}

export function useCreateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewUserProfile, 'id'>) => UserProfileService.create(data),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });
    },
  });
}

export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<NewUserProfile, 'id'>> }) => 
      UserProfileService.update(id, data),
    onSuccess: async (updated: UserProfile) => {
      queryClient.setQueryData(userProfileQueryKeys.all, updated);
      await queryClient.invalidateQueries({ queryKey: userProfileQueryKeys.all });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  LocationService, 
  Location, 
  NewLocation 
} from '@/services/local/location-service';

export const locationQueryKeys = {
  all: ['locations'] as const,
  byEntry: (timeEntryId: string) => ['locations', 'entry', timeEntryId] as const,
};

export function useLocation(timeEntryId?: string) {
  return useQuery<Location | undefined>({
    queryKey: locationQueryKeys.byEntry(timeEntryId ?? ''),
    queryFn: () => LocationService.getByTimeEntryId(timeEntryId!),
    enabled: !!timeEntryId,
  });
}

export function useCreateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: Omit<NewLocation, 'id'>) => LocationService.create(data),
    onSuccess: async (newLocation: Location) => {
      await queryClient.invalidateQueries({ queryKey: locationQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: locationQueryKeys.byEntry(newLocation.timeEntryId) });
    },
  });
}

export function useUpdateLocation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<NewLocation, 'id'>> }) => 
      LocationService.update(id, data),
    onSuccess: async (updated: Location) => {
      await queryClient.invalidateQueries({ queryKey: locationQueryKeys.all });
      await queryClient.invalidateQueries({ queryKey: locationQueryKeys.byEntry(updated.timeEntryId) });
    },
  });
}

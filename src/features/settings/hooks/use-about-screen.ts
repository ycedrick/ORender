import { useRouter } from 'expo-router';
import { appConstants } from '@/config/app-constants';

export const useAboutScreen = () => {
  const router = useRouter();

  return {
    appName: appConstants.appName,
    version: appConstants.appVersion,
    goBack: () => router.back(),
  };
};

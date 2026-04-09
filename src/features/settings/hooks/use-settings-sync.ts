import { useEffect } from 'react';
import { useTheme } from '@/hooks/use-theme';
import { useUserProfile } from '@/hooks/use-user-profile';
import { useUserSettings } from '@/hooks/use-user-settings';
import { configureNotificationPresentation, ensureReminderChannel } from './notification-utils';

export const useSettingsSync = () => {
  const { data: profile } = useUserProfile();
  const { data: settings } = useUserSettings(profile?.id);
  const { mode, isSystemDefault, setMode, useSystemDefault: applySystemDefault } = useTheme();

  useEffect(() => {
    configureNotificationPresentation();
    ensureReminderChannel().catch(() => {
      // Ignore channel creation failures until the user opens notifications.
    });
  }, []);

  useEffect(() => {
    if (!settings) return;

    if (settings.theme === 'system') {
      if (!isSystemDefault) {
        applySystemDefault();
      }
      return;
    }

    if (mode !== settings.theme || isSystemDefault) {
      setMode(settings.theme);
    }
  }, [applySystemDefault, isSystemDefault, mode, setMode, settings]);
};

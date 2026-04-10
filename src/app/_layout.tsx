import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { expoDb } from "@/db/client";
import { ActiveSessionBanner } from "@/features/dashboard/components/ActiveSessionBanner";
import { useSettingsSync } from "@/features/settings/hooks/use-settings-sync";
import { useAppUpdates } from "@/hooks/use-app-updates";
import { useBootstrap } from "@/hooks/use-bootstrap";
import { useOnboarding } from "@/hooks/use-onboarding";
import { useSessionControls } from "@/hooks/use-session-controls";
import { useTheme } from "@/hooks/use-theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useDrizzleStudio } from "expo-drizzle-studio-plugin";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { StyleSheet, View } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const queryClient = new QueryClient();

function RootLayoutContent() {
  const { isReady } = useBootstrap();

  if (!isReady) {
    return null;
  }

  return <BootstrappedAppShell />;
}

function BootstrappedAppShell() {
  const tabPaths = new Set(['/', '/calendar', '/reports', '/settings']);
  const { isCompleted } = useOnboarding();
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { activeSession, handleClockOut, isClockingOut, isSessionStateReady } = useSessionControls();
  const pathname = usePathname();
  useSettingsSync();
  useAppUpdates();

  // Enable Drizzle Studio in development
  if (__DEV__) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useDrizzleStudio(expoDb);
  }

  const isTabsRoute = tabPaths.has(pathname);
  const showGlobalBanner = !!isCompleted && !!activeSession && isTabsRoute;
  const bannerTop = 42;

  return (
    <View style={[styles.appShell, { backgroundColor: theme.colors.background }]}>
      {showGlobalBanner && activeSession && (
        <View style={[styles.bannerOverlay, { bottom: bannerTop + insets.bottom + 42 }]}>
          <ActiveSessionBanner
            clockInTime={activeSession.clockIn}
            onStop={handleClockOut}
            loading={isClockingOut || !isSessionStateReady}
          />
        </View>
      )}
      <StatusBar style={theme.mode === 'dark' ? 'light' : 'dark'} />


      <View style={[styles.stackContainer]}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Protected guard={!isCompleted}>
            <Stack.Screen name="(onboarding)" />
          </Stack.Protected>
          <Stack.Protected guard={!!isCompleted}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen name="history" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="focus-session" options={{ animation: "fade" }} />
            <Stack.Screen name="calendar/[date]" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="reports/[period]" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="reports/insights" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="settings/edit-profile" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="settings/notifications" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="settings/backup" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="settings/about" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="entry/manual" options={{ presentation: "formSheet", animation: "slide_from_bottom" }} />
            <Stack.Screen name="log/[id]" options={{ animation: "slide_from_right" }} />
            <Stack.Screen name="log/create" options={{ presentation: "formSheet", animation: "slide_from_bottom" }} />
          </Stack.Protected>
        </Stack >
      </View>
    </View>
  );
}

export default function RootLayout() {

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <OnboardingProvider>
              <RootLayoutContent />
            </OnboardingProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appShell: {
    flex: 1,
  },
  stackContainer: {
    flex: 1,
  },
  bannerOverlay: {
    position: "absolute",
    left: 16,
    right: 16,
    zIndex: 20,
  },
});

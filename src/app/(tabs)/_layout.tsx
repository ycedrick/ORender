import { Tabs } from "expo-router";
import { TabBar } from "@/components/navigation";

export default function TabLayout() {
    return (
        <Tabs 
            tabBar={(props) => <TabBar {...props} />}
            screenOptions={{ headerShown: false }} 
        >
            <Tabs.Screen name="index" />
            <Tabs.Screen name="calendar" />
            <Tabs.Screen name="reports" />
            <Tabs.Screen name="settings" />
        </Tabs>
    );
}

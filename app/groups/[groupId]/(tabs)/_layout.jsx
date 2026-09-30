import { useGroup } from "@/src/context/GroupContext";
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

export default function GroupLayout() {

    return ( <GroupTabs /> );
}

function GroupTabs() {
    const { colors } = useTheme();
    const { loading } = useGroup();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
                tabBarShowLabel: true,
                tabBarStyle: {
                    backgroundColor: colors.surface,
                    borderTopColor: colors.border,
                },            
            }}
            screenListeners={{
                tabPress: (e) => {
                    if (loading) {
                        e.preventDefault();
                    }
                },
            }}
        >
            <Tabs.Screen
                    name="index"
                    options={{
                        title: "Overview",
                        tabBarIcon: ({color, size, focused}) => (
                            <Ionicons name={focused ? 'speedometer' : 'speedometer-outline'} color={color} size={size} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="expenses"
                    options={{
                        title: "Expenses",
                        tabBarIcon: ({color, size, focused}) => (
                            <Ionicons name={focused ? 'receipt' : 'receipt-outline'} color={color} size={size} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="balances"
                    options={{
                        title: "Balances",
                        tabBarIcon: ({color, size, focused}) => (
                            <Ionicons name={focused ? 'wallet' : 'wallet-outline'} color={color} size={size} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="activity"
                    options={{
                        title: "Activity",
                        tabBarIcon: ({color, size, focused}) => (
                            <Ionicons name={focused ? 'time' : 'time-outline'} color={color} size={size} />
                        ),
                    }}
                />
        </Tabs>
    );
}
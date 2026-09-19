import { colors } from '@/src/constants/constants';
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams } from "expo-router";
import { GroupProvider, useGroup } from "../../../../backend/src/context/GroupContext";

export default function GroupLayout() {
    const { groupId } = useLocalSearchParams();

    return (
        <GroupProvider groupId={groupId}>

            <GroupTabs />
        </GroupProvider>
    );
}

function GroupTabs() {
    const { loading } = useGroup();

    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textMuted,
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
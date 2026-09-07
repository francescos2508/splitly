import { colors } from '@/src/constants/constants';
import { Ionicons } from "@expo/vector-icons";
import { Tabs, useLocalSearchParams } from "expo-router";
import { GroupProvider } from "../../../../backend/src/context/GroupContext";

export default function GroupLayout() {
    const { groupId } = useLocalSearchParams();

    return (
        <GroupProvider groupId={groupId}>

            <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: colors['primary'], tabBarInactiveTintColor: colors['textMuted'],}}>
                <Tabs.Screen
                    name="index"
                    options={{
                        title: "Overview",
                        tabBarIcon: ({color, size}) => (
                            <Ionicons name='home-outline' color={color} size={size} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="expenses"
                    options={{
                        title: "Expenses",
                        tabBarIcon: ({color, size}) => (
                            <Ionicons name='receipt' color={color} size={size} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="balances"
                    options={{
                        title: "Balances",
                        tabBarIcon: ({color, size}) => (
                            <Ionicons name='swap-horizontal-outline' color={color} size={size} />
                        ),
                    }}
                />

                <Tabs.Screen
                    name="activity"
                    options={{
                        title: "Activity",
                        tabBarIcon: ({color, size}) => (
                            <Ionicons name='time-outline' color={color} size={size} />
                        ),
                    }}
                />

                {/* hidden routes  */}
                {/* <Tabs.Screen
                    name="new-expense"
                    options={{
                        href: null,
                    }}
                /> */}
            </Tabs>
        </GroupProvider>
    );
}
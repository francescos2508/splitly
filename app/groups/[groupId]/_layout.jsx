import { colors } from '@/src/constants/colors';
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { GroupProvider } from "../../../backend/src/context/GroupContext";

export default function GroupLayout() {
    return (
        <GroupProvider>

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
                    name="members"
                    options={{
                        title: "Members",
                        tabBarIcon: ({color, size}) => (
                            <Ionicons name='people-outline' color={color} size={size} />
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
            </Tabs>
        </GroupProvider>
    );
}
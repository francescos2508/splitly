import { Stack, useLocalSearchParams } from "expo-router";
import { GroupProvider } from "../../../backend/src/context/GroupContext";

export default function GroupLayout() {
    const { groupId } = useLocalSearchParams();

    return (
        <GroupProvider groupId={groupId}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name="(tabs)" />
                <Stack.Screen name="new-expense" />
            </Stack>
        </GroupProvider>
    );
}
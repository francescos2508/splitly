import { GroupProvider } from "@/src/context/GroupContext";
import { BottomSheetModalProvider } from '@gorhom/bottom-sheet';
import { Stack, useLocalSearchParams } from "expo-router";

export default function GroupLayout() {
    const { groupId } = useLocalSearchParams();

    return (
        <BottomSheetModalProvider>
            <GroupProvider groupId={groupId}>
                <Stack screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="new-expense" options={{presentation: 'formSheet'}}/>
                </Stack>
            </GroupProvider>
        </BottomSheetModalProvider>
    );
}
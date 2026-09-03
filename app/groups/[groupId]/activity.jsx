import { commonStyle } from '@/src/styles/common';
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";


export default function Activity() {
    const { groupId } = useLocalSearchParams();

    return (
            /*   <View>
                  <Text>Group ID: {groupId}</Text>
              </View> */
    
            <View style={commonStyle.container}>
                <View style={commonStyle.header}>
                    {/* <Text style={commonStyle.title}>{group?.name || 'Error'}</Text> */}
                </View>
                <View style={commonStyle.body}>
                    <Text>Activity</Text>
                    
                    
                </View>
            </View>
        )
}

const styles = StyleSheet.create({
    
});
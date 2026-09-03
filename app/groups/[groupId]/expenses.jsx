import { commonStyle } from '@/src/styles/common';
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useGroup } from '../../../backend/src/context/GroupContext';


export default function Expenses() {
    const { groupId } = useLocalSearchParams();
    const {group, expenses} = useGroup();

    return (
            /*   <View>
                  <Text>Group ID: {groupId}</Text>
              </View> */
    
            <View style={commonStyle.container}>
                <View style={commonStyle.header}>
                    {/* <Text style={commonStyle.title}>{group?.name || 'Error'}</Text> */}
                </View>
                <View style={commonStyle.body}>
                    <Text>Expenses</Text>
                    
                    
                </View>
            </View>
        )
}

const styles = StyleSheet.create({
    
});
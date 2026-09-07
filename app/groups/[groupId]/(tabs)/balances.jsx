import { commonStyle } from '@/src/styles/common';
import { useLocalSearchParams } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import { useGroup } from '../../../../backend/src/context/GroupContext';


export default function Members() {
    const { groupId } = useLocalSearchParams();
    const {group, balances, members} = useGroup();
    console.log(balances);
    console.log(balances);

    return (
            /*   <View>
                  <Text>Group ID: {groupId}</Text>
              </View> */
    
            <View style={commonStyle.container}>
                <View style={commonStyle.header}>
                    {/* <Text style={commonStyle.title}>{group?.name || 'Error'}</Text> */}
                </View>
                <View style={commonStyle.body}>
                    <Text>Balances</Text>
                    
                    {balances.map((balance) => {
                        const memb = members.find(x => x.id === balance.id);
                        console.log(memb);

                        return (
                            <View style={styles.cardExpense} key={balance.id}>
                                <Text>{balance.name} {balance.balance} {group.currency}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        )
}

const styles = StyleSheet.create({
    
});
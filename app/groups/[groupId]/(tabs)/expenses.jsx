import { useGroup } from '@/backend/src/context/GroupContext';
import CardExpense from '@/src/components/CardExpense';
import { currencies } from '@/src/constants/constants';
import { commonStyle } from '@/src/styles/common';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";


export default function Expenses() {
    const {groupId, group, expenses, members} = useGroup();

    return (
        <View style={commonStyle.container}>
            <View style={commonStyle.header}>
                <Text style={commonStyle.title}>{group?.name || 'Error'}</Text>
            </View>
            <ScrollView style={commonStyle.body}>
                <Text style={commonStyle.sectionTitle}>Expenses</Text>
                {expenses.map((expense) => {
                    const memb = members.find(x => x.id === expense.paid_by_member_id);

                    return (
                        <CardExpense key={expense.id} expense={expense} paid_by_member={memb} groupCurrency={currencies[group.currency]} />
                    );
                })}
            </ScrollView>
            <View style={commonStyle.footer}>
                <Pressable style={commonStyle.btn} onPress={() => {router.push(`/groups/${groupId}/new-expense`)}} >
                    <Text style={commonStyle.btnText}>Add expense</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    
});
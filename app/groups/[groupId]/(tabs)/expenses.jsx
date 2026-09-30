import CardExpense from '@/src/components/CardExpense';
import { currencies } from '@/src/constants/constants';
import { useGroup } from '@/src/context/GroupContext';
import { useTheme } from '@/src/context/ThemeContext';
import { createCommonStyle } from "@/src/styles/common";
import { router } from 'expo-router';
import { Pressable, ScrollView, Text, View } from "react-native";


export default function Expenses() {
    const { colors } = useTheme();
    const commonStyle = createCommonStyle(colors);
    const {groupId, group, expenses, allMembers} = useGroup();

    return (
        <View style={commonStyle.container}>
            <View style={commonStyle.header}>
                <Text style={commonStyle.title}>{group?.name || 'Error'}</Text>
            </View>
            <View style={commonStyle.body}>
                <Text style={commonStyle.sectionTitle}>Expenses</Text>
                <ScrollView >
                    {expenses.map((expense) => {
                        const memb = allMembers.find(x => x.id === expense.paid_by_member_id);

                        return (
                            <CardExpense key={expense.id} 
                                expense={expense} 
                                paid_by_member={memb} 
                                groupCurrency={currencies[group.currency]} 
                                onPress={() => router.push(`/groups/${groupId}/new-expense?expenseId=${expense.id}`)}
                            />
                        );
                    })}
                </ScrollView>
            </View>
            <View style={commonStyle.footer}>
                <Pressable style={commonStyle.btn} onPress={() => {router.push(`/groups/${groupId}/new-expense`)}} >
                    <Text style={commonStyle.btnText}>Add expense</Text>
                </Pressable>
            </View>
        </View>
    );
}

import { colors, currencies, sp } from '@/src/constants/constants';
import { commonStyle } from '@/src/styles/common';
import { parseDate } from '@/src/utils/utils';
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useGroup } from '../../../../backend/src/context/GroupContext';


export default function Expenses() {
    const {group, expenses, members} = useGroup();

    return (
        <View style={commonStyle.container}>
            <View style={commonStyle.header}>
                <Text style={commonStyle.title}>{group?.name || 'Error'}</Text>
            </View>
            <ScrollView style={commonStyle.body}>
                <Text>Expenses</Text>
                {expenses.map((expense) => {
                    const memb = members.find(x => x.id === expense.paid_by_member_id);

                    return (
                        <View style={styles.cardExpense} key={expense.id}>
                            <Text>{parseDate(expense.expense_date)} | {expense.category || 'Generic'}</Text>
                            <Text>{memb.name} paid {expense.amount} {currencies[group.currency]} for {expense.description}</Text>
                        </View>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    cardExpense: {
        marginBottom: sp.half,
        borderRadius: 20,
        backgroundColor: colors.white,
        paddingHorizontal: sp[1],
        paddingVertical: 4,
    }
});
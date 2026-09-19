import { categoryColors, colors, sp } from '@/src/constants/constants';
import { StyleSheet, Text, View } from "react-native";
import { fmtNum, lightColor, parseDate } from "../utils/utils";

export default function CardExpense({ expense, paid_by_member, groupCurrency = '€' }) {
    if (!expense) return;
    if (!expense.category) expense.category = 'Generic';
    const catColor = categoryColors[expense.category];

    return (
        <View style={[styles.cardExpense, {borderColor: catColor}]} key={expense.id}>
            <View style={styles.expenseMain}>
                {/* <View style={styles.avatar}></View> */}
                <View style={styles.info}>
                    <Text style={styles.description}>{expense.description}</Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text style={styles.metainfo}>{paid_by_member?.name} · {parseDate(expense.expense_date)}</Text>
                    </View>
                </View>
                <View >
                    <Text style={styles.amount}>{fmtNum(expense.amount)} {groupCurrency}</Text>
                    <Text style={[styles.labelCat, {color: catColor, borderColor: catColor, backgroundColor: lightColor(catColor)}]}>{expense.category}</Text>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cardExpense: {
        marginBottom: sp.half,
        paddingLeft: sp.half,
        paddingVertical: 4,
        borderLeftWidth: 2,
        borderColor: colors.primary,
    },
    expenseMain: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    description: {
        fontSize: 16,
        fontWeight: '600',
    },
    metainfo: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 3,
    },
    amount: {
        fontSize: 16,
        fontWeight: 600,
        textAlign: 'right'
    },
    labelCat: {
        fontSize: 12,
        color: colors.primary,
        backgroundColor: colors.primaryLight,
        marginTop: 4,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: colors.primary,
        paddingHorizontal: 8
    },
});
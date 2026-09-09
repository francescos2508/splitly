import { useGroup } from '@/backend/src/context/GroupContext';
import { getGroupActivity, getGroupBalances, getGroupExpenses } from '@/src/api/api';
import { colors, currencies, sp } from '@/src/constants/constants';
import { commonStyle } from '@/src/styles/common';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { parseDate } from '../../../../src/utils/utils';

export default function Group() {
    const { groupId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);

    const {group, members, expenses, balances, activity, currentMember} = useGroup();
    const {
        setGroup,
        setMembers,
        setExpenses,
        setBalances,
        setActivity,
        setCurrentMember,
    } = useGroup();

    const myBalance = balances?.find(
        balance => balance.id === currentMember?.id
    );

    useFocusEffect(
        useCallback(() => {
            async function loadGroup(gid) {
                try {
                    

                    const balances = await getGroupBalances(gid);
                    setBalances(balances);
                    
                    const expenses = await getGroupExpenses(gid);
                    setExpenses(expenses);
                    
                    const activity = await getGroupActivity(gid);
                    setActivity(activity);
                    
                } catch (error) {
                    alert(error.message);
                } finally {
                    setLoading(false);
                }
            }
            loadGroup(groupId);
    }, [groupId]));
    
    if (loading) {
        return (
            <View style={commonStyle.container}>
                <Text>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={commonStyle.container}>
            <View style={commonStyle.header}>
                <Text style={commonStyle.title}>{group?.name || 'Error'}</Text>
                <Ionicons style={styles.settings} name="settings-outline" size={24} color={colors.text} />
            </View>
            <ScrollView style={commonStyle.body}>
                {/* <Text>Created: {parseDate(group?.created_at)}</Text>
                <Text>Invite code: {group?.invite_code}</Text> */}

                {/* my balance */}
                <View style={styles.myBalance}>
                    <Text style={styles.myBalanceTitle}>Your balance {currentMember?.name}</Text>
                    {myBalance && 
                        <Text style={styles.myBalanceText}>
                            {myBalance.balance >= 0 && '+ '}
                            {myBalance.balance} {currencies[group.currency]}
                        </Text>
                    }
                </View>

                {/* all balances */}
                <View style={styles.bodyBalance}>
                    <Text style={styles.sectionTitle}>Balances </Text>
                    {balances.map((balance) => {
                        const positive = balance.balance >= 0;
                        return (
                            <Pressable key={balance.id} >
                                <View style={styles.cardBalance}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <View style={[styles.avatar, {backgroundColor: balance.avatar_color}]}>
                                            <Text style={styles.avatarInits}>{balance.name.charAt(0)}</Text>
                                        </View>
                                        <Text>{balance.name}</Text>
                                    </View>
                                    <Text style={[styles.balanceTxt, {color: positive ? colors.success : colors.danger}]}>{positive && '+'}{balance.balance} {currencies[group?.currency]}</Text>
                                </View>
                            </Pressable>
                        )
                    })}
                </View>

                {/* expenses */}
                <View style={styles.bodyExpenses}>
                    <Text style={styles.sectionTitle}>Last expenses</Text>
                    {expenses.slice(-3).map((expense) => {
                        const memb = members.find(x => x.id === expense.paid_by_member_id);

                        return (
                            <View key={expense.id} style={styles.cardExpense}>
                                <Text>{parseDate(expense.expense_date)}</Text>
                                <Text>{memb?.name} paid {expense.amount} {currencies[group?.currency]} for {expense.description} </Text>
                            </View>
                        );
                    })}
                    <Pressable style={commonStyle.btn2}><Text style={commonStyle.btn2Text}>View All</Text></Pressable>
                </View>


                {/* <Text>{JSON.stringify(balances)}</Text> */}

                <Pressable style={commonStyle.btn} onPress={() => {router.push(`/groups/${groupId}/new-expense`)}} >
                    <Text style={commonStyle.btnText}>Add expense</Text>
                </Pressable>
                
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    avatar: {
        borderRadius: '100%',
        height: sp[2],
        width: sp[2],
        justifyContent: "center",
        alignItems: "center",
        marginRight: sp.half
    },
    bodyBalance: {
        marginVertical: sp[1],
    },
    cardBalance: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: sp.half,
        backgroundColor: colors.white,
        borderRadius: 20,
        justifyContent: 'space-between'
    },
    avatarInits: {
        color: colors.white,
    },
    sectionTitle: {
        fontSize: 18,
        textAlign: 'center',
        marginBottom: sp.half,
        fontWeight: 700,
    },
    balanceTxt: {
        marginHorizontal: sp['half'],
        fontWeight: 700,
        fontSize: 16,
    },
    myBalance: {
        alignItems: 'center',
        padding: sp[1],
        backgroundColor: colors.accent,
        borderRadius: 20,
    },
    myBalanceTitle: {
        color: colors.white,
        fontSize: 20,
        
    },
    myBalanceText: {
        color: colors.white,
        fontSize: 30,
        fontWeight: 700,
    },
    settings: {
        position: 'absolute',
        right: sp[1],
    },
    bodyExpenses: {
        marginVertical: sp[1],
    },
    cardExpense: {
        // borderBottomWidth: 1,
        marginBottom: sp.half,
        borderRadius: 20,
        backgroundColor: colors.white,
        paddingHorizontal: sp[1],
        paddingVertical: 4,
    },
})

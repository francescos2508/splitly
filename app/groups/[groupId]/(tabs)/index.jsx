import { useGroup } from '@/backend/src/context/GroupContext';
import { getGroup, getGroupActivity, getGroupBalances, getGroupExpenses } from '@/src/api/api';
import CardExpense from '@/src/components/CardExpense';
import Loader from '@/src/components/Loader';
import { colors, currencies, sp } from '@/src/constants/constants';
import { commonStyle } from '@/src/styles/common';
import { fmtNum } from '@/src/utils/utils';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from "expo-router";
import { useCallback } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

export default function Group() {

    const {
        group,
        groupId,
        members,
        expenses,
        balances,
        currentMember,
        loading,
        setGroup,
        setExpenses,
        setBalances,
        setActivity,
        setLoading,
    } = useGroup();

    const myBalance = balances?.find(
        balance => balance.id === currentMember?.id
    );
    const myBalanceColor = myBalance?.balance > 0 ? colors.positive : myBalance?.balance < 0 ? colors.negative : colors.primary;

    useFocusEffect(
        useCallback(() => {
            async function loadGroup(gid) {
                try {
                    setLoading(true);
                    const group = await getGroup(gid);
                    setGroup(group);
                    const balances = await getGroupBalances(gid);
                    setBalances(balances.sort((a,b) => {
                        // currentMember will always be first one in the list
                        if (a.id === currentMember?.id) return -1;
                        if (b.id === currentMember?.id) return 1;

                        return a.name.localeCompare(b.name);
                    }));
                    
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
            <Loader />
        );
    }

    return (
        <View style={commonStyle.container}>
            <View style={commonStyle.header}>
                <Pressable style={commonStyle.headerBack} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </Pressable>
                <Text style={commonStyle.title}>{group?.name || 'Error'}</Text>
                <Pressable style={styles.settings} onPress={() => router.push(`/groups/${groupId}/settings`)}>
                    <Ionicons name="settings-outline" size={24} color={colors.text} />
                </Pressable>
            </View>
            <ScrollView style={commonStyle.body}>
                {/* my balance */}
                <View style={[styles.myBalance, {backgroundColor: myBalanceColor}]}>
                    <Text style={styles.myBalanceTitle}>Your balance {currentMember?.name}</Text>
                    {myBalance && 
                        <Text style={styles.myBalanceText}>
                            {myBalance.balance >= 0 && '+'}
                            {fmtNum(myBalance.balance)} {currencies[group.currency]}
                        </Text>
                    }
                </View>

                {/* all balances */}
                <View style={styles.bodyBalance}>
                    <Text style={commonStyle.sectionTitle}>Balances </Text>
                    {balances.map((balance) => {
                        const bal = balance.balance;
                        return (
                            <Pressable key={balance.id} >
                                <View style={styles.cardBalance}>
                                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                        <View style={[styles.avatar, {backgroundColor: balance.avatar_color}]}>
                                            <Text style={styles.avatarInits}>{balance.name.charAt(0)}</Text>
                                        </View>
                                        <Text>{balance.name}</Text>
                                    </View>
                                    <Text style={[styles.balanceTxt, {color: bal > 0 ? colors.positive : bal < 0 ? colors.negative : colors.primary}]}>
                                        {bal > 0 && '+'}{fmtNum(balance.balance)} {currencies[group?.currency]}
                                        </Text>
                                </View>
                            </Pressable>
                        )
                    })}
                </View>

                {/* expenses */}
                <View style={styles.bodyExpenses}>
                    <Text style={commonStyle.sectionTitle}>Last expenses</Text>
                    {expenses.slice(0,3).map((expense) => {
                        const memb = members.find(x => x.id === expense.paid_by_member_id);

                        return (
                            <CardExpense key={expense.id} expense={expense} paid_by_member={memb} groupCurrency={currencies[group?.currency]} />
                        );
                    })}
                    <Pressable onPress={() => router.push(`/groups/${groupId}/expenses`)} style={commonStyle.btn2}>
                        <Text style={commonStyle.btn2Text}>View All</Text>
                    </Pressable>
                </View>                
            </ScrollView>

            <View style={commonStyle.footer}>
                <Pressable style={commonStyle.btn} onPress={() => {router.push(`/groups/${groupId}/new-expense`)}} >
                    <Text style={commonStyle.btnText}>Add expense</Text>
                </Pressable>
            </View>
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
    balanceTxt: {
        marginHorizontal: sp['half'],
        fontWeight: 700,
        fontSize: 16,
    },
    myBalance: {
        alignItems: 'center',
        padding: sp[1],
        backgroundColor: colors.primary,
        // borderColor: colors.success,
        // borderWidth: 5,
        borderRadius: 20,
    },
    myBalanceTitle: {
        color: colors.white,
        fontSize: 16,
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
})

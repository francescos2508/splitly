import { useGroup } from '@/backend/src/context/GroupContext';
import Avatar from '@/src/components/Avatar';
import Loader from '@/src/components/Loader';
import { colors, currencies, sp } from '@/src/constants/constants';
import { commonStyle } from '@/src/styles/common';
import { calculatePayments, fmtNum, getInits } from '@/src/utils/utils';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { createPayment } from '../../../../src/api/api';


export default function Members() {
    const {groupId, group, balances, members, currentMember, loading, setLoading, refreshGroup} = useGroup();
    const [payments, setPayments] = useState([]);
    const [myBalance, setMyBalance] = useState(null);
    const [myPayments, setMyPayments] = useState([]);
    const [otherPayments, setOtherPayments] = useState([]);
    const groupCurrency = group ? currencies[group.currency] : '';
    const myBalanceColor = myBalance?.balance > 0 ? colors.positive : myBalance?.balance < 0 ? colors.negative : colors.primary;
    const reloadPayments = async () => {
        setLoading(true);
        // updated balances to now
        const refreshed = await refreshGroup({balances: true});
        
        const updPayments = calculatePayments(refreshed.balances);
        setPayments(updPayments);

        const myPaym = updPayments.filter(x => x.from === currentMember?.id || x.to === currentMember?.id);
        setMyPayments(myPaym);

        const otherPaym = updPayments.filter(x => x.from !== currentMember?.id && x.to !== currentMember?.id);
        setOtherPayments(otherPaym);

        const myBal = refreshed.balances?.find( balance => balance.id === currentMember?.id );
        setMyBalance(myBal);
        setLoading(false);
    }
    useFocusEffect(
        useCallback(() => {
            if (!groupId) return;
            reloadPayments(groupId);
        }, [groupId])
    );

    if (loading) return (<Loader />);

    return (
            <View style={commonStyle.container}>
                <View style={commonStyle.header}>
                    <Text style={commonStyle.title}>{group?.name || 'Error'}</Text>
                </View>
                <ScrollView style={commonStyle.body}>
                    <View style={[styles.myBalance, {backgroundColor: myBalanceColor}]}>
                        {myBalance && 
                            <Text style={styles.myBalanceText2}>
                                {(myBalance.balance > 0) ? 'You are owed '
                                    : (myBalance.balance < 0) ? 'You owe '
                                    : 'You are settled'} 
                            </Text>
                        }
                        <Text style={styles.myBalanceText}>
                            {myBalance?.balance > 0 ? '+' : ''}
                            {fmtNum(myBalance?.balance)+' '+groupCurrency}
                        </Text>
                    </View>

                    <Text style={commonStyle.sectionTitle}>My payments</Text>
                    <View style={styles.myPayments}>
                        {myPayments.length > 0 ? (
                            <View>
                                {myPayments.map((payment) => {
                                    payment.fromMember = members.find(x => x.id === payment.from);
                                    payment.toMember = members.find(x => x.id === payment.to);

                                    return (
                                        <CardPayment
                                            key={`${payment.from}-${payment.to}`}
                                            payment={payment}
                                            iAmDebtor={payment.from === currentMember.id}
                                            groupCurrency={groupCurrency}
                                            settleUp={true}
                                            reloadFunc={reloadPayments}
                                        />
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={styles.emptySection}>
                                <Text style={styles.emptyText}>No payments to settle</Text>
                            </View>
                        )}
                    </View>

                    <Text style={commonStyle.sectionTitle}>Other payments</Text>
                    {otherPayments.length > 0 ? (
                        <View>
                            {otherPayments.map((payment) => {
                                payment.fromMember = members.find(x => x.id === payment.from);
                                payment.toMember = members.find(x => x.id === payment.to);

                                return (
                                    <CardPayment
                                        key={`${payment.from}-${payment.to}`}
                                        payment={payment}
                                        iAmDebtor={payment.from === currentMember?.id}
                                        groupCurrency={groupCurrency}
                                        settleUp={false}
                                    />
                                );
                            })}
                        </View>
                    ) : (
                        <View style={styles.emptySection}>
                            <Text style={styles.emptyText}>No payments to settle</Text>
                        </View>
                    )}

                    {/* all balances */}
                    <View style={styles.bodyBalance}>
                        <Text style={commonStyle.sectionTitle}>Balances </Text>
                        {balances.map((balance) => {
                            const bal = balance.balance;
                            return (
                                <Pressable key={balance.id} >
                                    <View style={styles.cardBalance}>
                                        <View style={{flexDirection: 'row', alignItems: 'center'}}>
                                            <Avatar color={balance.avatar_color} inits={getInits(balance.name)} />
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
                </ScrollView>
            </View>
        )
}

function CardPayment({ payment, iAmDebtor, groupCurrency, settleUp = false, reloadFunc }) {
    const fromInits = getInits(payment.fromMember?.name);
    const toInits = getInits(payment.toMember?.name);
    const {refreshGroup, groupId} = useGroup();
    const confirmSettleUp = (paym) => {
        const yesno = [{text: 'Cancel', style: 'cancel'}, {text: 'Yes, settle up', style: 'default', onPress: () => handleSettleUp(paym)}]
        Alert.alert('Settle up?', 'Do you confirm that '+paym?.fromMember?.name+' paid '+fmtNum(paym.amount)+' '+groupCurrency+' to '+paym.toMember?.name+'?', yesno);
    }
    const handleSettleUp = async (paym) => {
        const newPaym = {
            fromMemberId: paym.from,
            toMemberId: paym.to,
            amount: paym.amount,
            note: paym.note
        };
        const res = await createPayment(groupId, newPaym);
        if (res && typeof reloadFunc === 'function') await reloadFunc(); 
    }

    return (
        <View style={styles.cardPayment}>
            <View style={styles.rowPayment}>
                <View style={styles.memberPayment}>
                    <Avatar color={payment.fromMember?.avatar_color} inits={fromInits}/> 
                    <Text style={styles.memberName}>{payment.fromMember?.name}</Text>
                </View>
                <View><Ionicons name='arrow-forward' size={26} color={colors.primary} /></View>
                <View style={styles.memberPayment}>
                    <Avatar color={payment.toMember?.avatar_color} inits={toInits} />
                    <Text style={styles.memberName}>{payment.toMember?.name}</Text>
                </View>

            <View style={{alignItems: 'flex-end', width: '30%'}}>
                <Text style={iAmDebtor ? styles.negativeAmount : styles.positiveAmount}>
                    {iAmDebtor ? '-' : '+'}{fmtNum(payment.amount)} {groupCurrency}
                </Text>
                {settleUp && <Pressable style={commonStyle.inlineBtn} onPress={() => confirmSettleUp(payment)}>
                    <Text style={commonStyle.inlineBtnText}>Settle up</Text>
                </Pressable>}
            </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    myBalance: {
        alignItems: 'center',
        padding: sp[1],
        backgroundColor: colors.accent,
        borderRadius: 20,
        marginBottom: sp[1],
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
    myBalanceText2: {
        color: colors.white,
        fontSize: 20,
        // fontWeight: 700,
    },
    myPayments: {
        // marginTop: sp[1],
    },
    cardPayment: {
        backgroundColor: colors.white,
        paddingHorizontal: sp[1],
        paddingVertical: sp.half,
        borderRadius: 20,
        marginBottom: sp.half,
    },
    rowPayment: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    paymentTxt: {
        fontSize: 16,
    },
    positiveAmount: {
        // flex: 1,
        color: colors.primary,
        fontWeight: 700,
        fontSize: 16,
    },
    negativeAmount: {
        // flex: 1,
        // color: colors.negative,
        color: colors.primary,
        fontWeight: 700,
        fontSize: 16,
    },
    memberPayment: {
        alignItems: 'center',
        width: 70,
    },    
    memberName: {
        textAlign: 'center',
        fontSize: 12,
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
    balanceTxt: {
        marginHorizontal: sp['half'],
        fontWeight: 700,
        fontSize: 16,
    },
    emptySection: {
        paddingVertical: sp[1],
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textMuted,
        fontSize: 14,
    },
});
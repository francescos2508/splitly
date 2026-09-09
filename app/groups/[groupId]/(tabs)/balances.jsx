import Loader from '@/src/components/Loader';
import { colors, currencies, sp } from '@/src/constants/constants';
import { commonStyle } from '@/src/styles/common';
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGroup } from '../../../../backend/src/context/GroupContext';
import { getGroupBalances } from '../../../../src/api/api';
import { calculatePayments } from '../../../../src/utils/utils';


export default function Members() {
    const {groupId, group, balances, members, currentMember, setBalances} = useGroup();
    const [payments, setPayments] = useState([]);
    const [myBalance, setMyBalance] = useState(null);
    const [myPayments, setMyPayments] = useState([]);
    const [otherPayments, setOtherPayments] = useState([]);
    const groupCurrency = group ? currencies[group.currency] : '';
    const [loading, setLoading] = useState(true);
    const reloadPayments = async (gid) => {
        setLoading(true);
        // updated balances to now
        const updBalances = await getGroupBalances(gid);
        setBalances(updBalances);
        
        const updPayments = calculatePayments(updBalances);
        setPayments(updPayments);

        const myPaym = updPayments.filter(x => x.from === currentMember.id || x.to === currentMember.id);
        setMyPayments(myPaym);

        const otherPaym = updPayments.filter(x => x.from !== currentMember.id && x.to !== currentMember.id);
        setOtherPayments(otherPaym);

        const myBal = updBalances?.find(
            balance => balance.id === currentMember?.id
        );
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
                    <View style={styles.myBalance}>
                        {/* <Text style={styles.myBalanceTitle}>Your balance {currentMember?.name}</Text> */}
                        {myBalance && 
                            <Text style={styles.myBalanceText2}>
                                {(myBalance.balance > 0) ? 'You are owed '
                                    : (myBalance.balance < 0) ? 'You owe '
                                    : 'You are settled'} 
                            </Text>
                        }
                        <Text style={styles.myBalanceText}>
                            {myBalance?.balance >= 0 ? '+' : '-'}
                            {myBalance?.balance+' '+groupCurrency}
                        </Text>
                    </View>
                        <Text style={styles.sectionTitle}>My payments</Text>
                    <View style={styles.myPayments}>
                        {myPayments?.map((payment) => {
                            const iAmDebtor = payment.from === currentMember.id;
                            const text = iAmDebtor ? payment.toName+' you owe' : payment.fromName+' owes you';
                            return (
                                <View key={`${payment.from}-${payment.to}`} style={styles.cardPayment}>
                                    <View style={styles.rowPayment}>
                                        <Text style={styles.paymentTxt}>{text}</Text>
                                        <View style={{alignItems: 'flex-end'}}>
                                            <Text style={iAmDebtor ? styles.negativeAmount : styles.positiveAmount}>
                                                {iAmDebtor ? '-' : '+'}{payment.amount} {groupCurrency}
                                            </Text>
                                            <Pressable style={commonStyle.inlineBtn} onPress={(() => alert('paid'))}>
                                                <Text style={commonStyle.inlineBtnText}>Settle up</Text>
                                            </Pressable>
                                        </View>
                                    </View>
                                </View>
                            )}
                        )}
                    </View>

                    {/* <Text>Balances</Text>
                    {balances?.map((balance) => {
                        const memb = members.find(x => x.id === balance.id);
                        
                        return (
                            <View style={styles.cardExpense} key={balance.id}>
                                <Text>{balance.name} {balance.balance} {currencies[group?.currency]}</Text>
                            </View>
                        );
                    })} */}

                    <Text style={styles.sectionTitle}>Other payments</Text>
                    {otherPayments?.map((payment) => {
                        return (
                            <View style={styles.cardPayment2} key={`${payment.from}-${payment.to}`}>
                                <Text style={styles.paymentTxt2}>{payment.fromName} owes {payment.amount} {groupCurrency} to {payment.toName}</Text>
                            </View>
                        );
                    })}

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
                </ScrollView>
            </View>
        )
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
        backgroundColor: colors.background,
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
        color: colors.danger,
        fontWeight: 700,
        fontSize: 16,
    },
    cardPayment2: {
        backgroundColor: colors.background,
        paddingHorizontal: sp[1],
        paddingVertical: sp.half,
        borderRadius: 20,
        marginBottom: sp.half,
    },
    paymentTxt2: {
        // fontSize: 16,
    },
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
});
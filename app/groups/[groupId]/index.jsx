import { useGroup } from '@/backend/src/context/GroupContext';
import { getGroup, getGroupActivity, getGroupBalances, getGroupExpenses } from '@/src/api/groups';
import { colors } from '@/src/constants/colors';
import { sp } from '@/src/constants/spacing';
import { commonStyle } from '@/src/styles/common';
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const currencies = {EUR: '€', USD: '$', GBP: '£', CHF: '$$'}
export default function Group() {
    const { groupId } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);

    const {group, members, expenses, balances, activity} = useGroup();
    const {
        setGroup,
        setMembers,
        setExpenses,
        setBalances,
        setActivity,
    } = useGroup();


    useEffect(() => {
        async function loadGroup(gid) {
            try {
                const gr = await getGroup(gid);
                setGroup(gr);
                setMembers(gr.group_members);

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
    }, []);
    
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
            </View>
            <View style={commonStyle.body}>
                {/* <Text>Group ID: {groupId}</Text> */}
                <Text>Created: {group?.created_at}</Text>
                {/* <Text>Currency: {group?.currency}</Text> */}
                <Text>Invite code: {group?.invite_code}</Text>
                {/* <Text>Name: {group?.name}</Text> */}
                <Text>Balances: </Text>
                <View style={styles.bodyBalance}>
                    {balances.map((balance) => (
                        <Pressable key={balance.id} >
                            <View style={styles.cardBalance}>
                                <View style={[styles.avatar, {backgroundColor: balance.avatar_color}]}>
                                    <Text style={styles.avatarInits}>{balance.name.charAt(0)}</Text>
                                </View>
                                <Text style={styles.balanceTxt}>{balance.name} | {balance.balance} {currencies[group.currency]}</Text>
                            </View>
                        </Pressable>
                    ))}
                </View>
                {/* <Text>{JSON.stringify(balances)}</Text> */}

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
    },
    bodyBalance: {
        marginVertical: sp[1],
    },
    cardBalance: {
        // flex: 1,
        flexDirection: 'row',
        alignItems: 'center'
    },
    avatarInits: {
        color: colors['white'],
    },
    balanceTxt: {
        marginHorizontal: sp['half']
    }
})

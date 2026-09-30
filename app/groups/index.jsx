//My groups

import { getMyGroups } from '@/src/api/api';
import Loader from '@/src/components/Loader';
import { currencies, sp } from '@/src/constants/constants';
import { useTheme } from '@/src/context/ThemeContext';
import { createCommonStyle } from '@/src/styles/common';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Switcher from '../../src/components/Switcher';
import { fmtNum } from '../../src/utils/utils';



export default function myGroups() {
    const { colors, isDark, toggleDarkMode } = useTheme();
    const styles = createStyles(colors);
    const commonStyle = createCommonStyle(colors);
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    const [bigBalance, setBigBalance] = useState({});
    useFocusEffect(
        useCallback(() => {
            async function loadGroups() {
                try {
                    setLoading(true);
                    const myGroups = await getMyGroups();
                    const orderedGroups = myGroups.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
                    const balances = {};
                    orderedGroups.forEach(g => {
                        if (!balances[g.currency]) balances[g.currency] = 0;
                        balances[g.currency] += Number(g.balance);
                    });
                    setBigBalance(balances);
                    setGroups(orderedGroups);
                } catch (error) {
                    alert(error.message);
                } finally {
                    setLoading(false);
                }
            }
            loadGroups();
        }, [])
    );

    const currenciesList = Object.keys(bigBalance);
    let balanceBg = colors.primary;
    if (currenciesList.length === 1) {
        const bal = bigBalance[currenciesList[0]];
        (bal > 0) ? balanceBg = colors.positive : (bal < 0) ? balanceBg = colors.negative : balanceBg = colors.primary;
    }

    if (loading) {
        return (
            <Loader />
        );
    }

    return (
        <View style={commonStyle.container}>
            <View style={[commonStyle.header, {justifyContent: 'flex-end', gap: 8}]}>
                <Ionicons name={isDark ? 'moon-outline' : 'sunny-outline'} size={20} color={colors.text} />
                <Switcher value={isDark} onChange={toggleDarkMode}/>
            </View>
            {groups.length === 0 ? (
                <View>
                    <View style={commonStyle.header}>
                        <Text style={commonStyle.title}>Your Groups</Text>
                    </View>
                    <ScrollView style={commonStyle.body}>
                        <View style={styles.emptyBody}>
                            <Text style={styles.emptyTitle}>No groups yet</Text>
                            <Text style={styles.emptyText}>Create a group or join one to start splitting expenses.</Text>
                        </View>
                    </ScrollView>
                </View>
            ) : (
                <ScrollView style={commonStyle.body}>
                    <View style={[styles.myBalance, { backgroundColor: balanceBg }]}>
                        {Object.entries(bigBalance).map(([name, balance]) => {
                            return (
                                <View key={name}>
                                    <Text style={styles.myBalanceTitle}>Overall balance </Text>
                                    <Text style={styles.myBalanceText}>
                                        {balance > 0 && '+'}{fmtNum(balance)} {currencies[name]}
                                    </Text>
                                </View>
                            );
                        })}
                        {Object.keys(bigBalance).length > 1 && (
                            <Text style={{ fontSize: 12, color: colors.white }}>Balances are calculated separately for each currency.</Text>
                        )}
                    </View>
                    <View style={commonStyle.header}>
                        <Text style={commonStyle.title}>Your Groups</Text>
                    </View>
                    <View>
                        {groups.map((group) => (
                            <Pressable key={group.id} style={styles.groupCard} onPress={() => router.push(`/groups/${group.id}`)}>
                                <View style={commonStyle.rowBasic}>
                                    <View style={styles.groupIcon}>
                                        <Ionicons name={group.icon || 'people-outline'} size={35} color={colors.primary} />
                                    </View>
                                    <View style={{left: 20}}>
                                        <Text style={styles.groupName}>{group.name || 'Group name'}</Text>
                                        <Text style={styles.groupInfo}>
                                            {group.currency || 'EUR'} | {group.count || '**'} members
                                        </Text>
                                        <Text style={[styles.groupBalance, { color: group.balance > 0 ? colors.positive : group.balance < 0 ? colors.negative : colors.primary}]}>
                                            {group.balance > 0 && '+'}{fmtNum(group.balance)} {currencies[group.currency]}
                                        </Text>
                                    </View>
                                </View>
                                <View>
                                    <Ionicons name='chevron-forward' size={20} color={colors.primary} />
                                </View>
                            </Pressable>
                        ))}

                    </View>
                </ScrollView>
            )}
            <View style={commonStyle.footer}>
                <Pressable style={commonStyle.btn} onPress={() => router.push('/groups/create')}>
                    <Text style={commonStyle.btnText}>Create group</Text>
                </Pressable>
                <Pressable style={commonStyle.btn2} onPress={() => router.push('/groups/join')}>
                    <Text style={commonStyle.btn2Text}>Join group</Text>
                </Pressable>
            </View>
        </View>
    );
}

export const createStyles = (colors) => StyleSheet.create({
    emptyBody: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        // marginBottom: sp[5],
    },
    emptyTitle: {
        fontSize: 22,
        fontWeight: "600",
        marginBottom: sp[1],
    },
    emptyText: {
        textAlign: "center",
        fontSize: 16,
        marginBottom: sp[2],
    },

    groupCard: {
        // padding: sp[1],
        // borderRadius: 20,
        marginBottom: sp.md,
        // borderLeftWidth: 2,
        // borderLeftColor: colors.primary,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    groupName: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
        color: colors.text
    },
    groupInfo: {
        fontSize: 14,
        color: colors.text
    },
    myBalance: {
        alignItems: 'center',
        padding: sp[1],
        backgroundColor: colors.primary,
        borderRadius: 20,
        marginBottom: sp[1],
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
    groupBalance: {
        fontWeight: 600,
        fontSize: 16
    },
    groupIcon: {
        // position: 'absolute',
        // width: 60,
        // alignItems: 'center',
        backgroundColor: colors.primaryLight,
        borderRadius: 20,
        padding: sp[1],
    }
});
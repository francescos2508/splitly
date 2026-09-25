import { useGroup } from '@/backend/src/context/GroupContext';
import Avatar from '@/src/components/Avatar';
import Loader from '@/src/components/Loader';
import { activityColors, colors, currencies, sp } from '@/src/constants/constants';
import { commonStyle } from '@/src/styles/common';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { fmtNum, getInits, lightColor } from '../../../../src/utils/utils';

const getActivityDescription = (act, {allMembers, expenses, payments, group}) => {
    const actor = allMembers.find(x => x.id === act.actor_id);
    if (act.entity_type === 'group') {
        // created, updated
        if (act.event_type === 'group_created') return actor?.name+' created the group';
        if (act.event_type === 'group_updated') return actor?.name+' updated the group settings';
    }
    if (act.entity_type === 'member') {
        const memb = allMembers.find(x => x.id === act.entity_id);
        // joined, left, removed 
        if (act.event_type === 'member_joined') return actor?.name+' joined the group';
        if (act.event_type === 'member_left') return actor?.name+' left the group';
        if (act.event_type === 'member_removed') return act.description;
    }
    if (act.entity_type === 'expense') {
        const exp = expenses.find(x => x.id === act.entity_id);
        // created, updated, deleted
        if (act.event_type === 'expense_created') return actor?.name+' added '+exp?.description+' · '+fmtNum(exp?.amount)+' '+currencies[group?.currency];
        if (act.event_type === 'expense_updated') return actor?.name+' updated '+exp?.description+' · '+fmtNum(exp?.amount)+' '+currencies[group?.currency];
        if (act.event_type === 'expense_deleted') return act.description+' from '+actor?.name;
    }
    if (act.entity_type === 'payment') {
        const payment = payments.find(x => x.id === act.entity_id);
        const from = allMembers.find(x => x.id === payment.from_member_id);
        const to = allMembers.find(x => x.id === payment.to_member_id);
        // created, canceled(?)
        if (act.event_type === 'payment_created') return from?.name+' paid '+fmtNum(payment?.amount)+' '+currencies[group?.currency]+' to '+to?.name;
    }
    return act.description;
}
const getActivityDate = (act) => {
    const date = new Date(act.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);
    const time = date.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
    });

    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    if (isToday) return 'Today at '+time;
    if (isYesterday) return 'Yesterday at '+time;

    // diff in days
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (diff < 7) return date.toLocaleDateString('en-GB', {weekday: 'long'}) + ' at ' + time;

    const datestr = new Date(act.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
    return datestr;
}
const getSeparatorDate = (act) => {
    const date = new Date(act.created_at);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    if (isToday) return 'Today';
    if (isYesterday) return 'Yesterday';

    // diff in days
    const diff = Math.floor((today - date) / (1000 * 60 * 60 * 24));
    if (diff < 7) return date.toLocaleDateString('en-GB', {weekday: 'long'});

    const datestr = new Date(act.created_at).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'long',
    });
    return datestr;
}
export default function Activity() {
    const {group, activity, refreshGroup} = useGroup();
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [showFilterHint, setShowFilterHint] = useState(true);

    const handleFilterScroll = (e) => {
        const { contentOffset, contentSize, layoutMeasurement } = e.nativeEvent;
        setShowFilterHint( contentOffset.x + layoutMeasurement.width < contentSize.width - 5 );
    };
    
    useEffect(() => {
        async function loadGroup(gid) {
            try {
                await refreshGroup({ activity: true })
            } catch (error) {
                alert(error.message);
            } finally {
                setLoading(false);
            }
        }
        loadGroup(group.id);
    }, []);

    if (loading) return (<Loader />);
    return (    
            <View style={commonStyle.container}>
                <View style={commonStyle.header}>
                    <Text style={commonStyle.title}>{group?.name || 'Error'}</Text>
                </View>
                <View style={commonStyle.body}>
                    <View style={styles.filtersWrapper}>
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false} 
                            style={styles.filters} 
                            contentContainerStyle={styles.filtersContent}
                            onScroll={handleFilterScroll}
                            scrollEventThrottle={16}
                        >
                            <Pressable onPress={() => setFilter('all')} style={[styles.filterBtn, filter === 'all' && {backgroundColor: colors.primary}]}>
                                <Text style={[styles.filterBtnText, filter === 'all' && {color: (lightColor(colors.primary))}]}>All</Text>
                            </Pressable>
                            <Pressable onPress={() => setFilter('group')} style={[styles.filterBtn, {borderColor: activityColors.group, backgroundColor: filter === 'group' ? activityColors.group : lightColor(activityColors.group)}]}>
                                <Text style={[styles.filterBtnText, {color: filter === 'group' ? lightColor(activityColors.group) : activityColors.group}]}>Group</Text>
                            </Pressable>
                            <Pressable onPress={() => setFilter('member')} style={[styles.filterBtn, {borderColor: activityColors.members, backgroundColor: filter === 'member' ? activityColors.members : lightColor(activityColors.members)}]}>
                                <Text style={[styles.filterBtnText, {color: filter === 'member' ? lightColor(activityColors.members) : activityColors.members}]}>Members</Text>
                            </Pressable>
                            <Pressable onPress={() => setFilter('expense')} style={[styles.filterBtn, {borderColor: activityColors.expenses, backgroundColor: filter === 'expense' ? activityColors.expenses : lightColor(activityColors.expenses)}]}>
                                <Text style={[styles.filterBtnText, {color: filter === 'expense' ? lightColor(activityColors.expenses) : activityColors.expenses}]}>Expenses</Text>
                            </Pressable>
                            <Pressable onPress={() => setFilter('payment')} style={[styles.filterBtn, {borderColor: activityColors.payments, backgroundColor: filter === 'payment' ? activityColors.payments : lightColor(activityColors.payments)}]}>
                                <Text style={[styles.filterBtnText, {color: filter === 'payment' ? lightColor(activityColors.payments) : activityColors.payments}]}>Payments</Text>
                            </Pressable>
                        </ScrollView>
                        {showFilterHint && (
                            <View pointerEvents="none" style={styles.filterHint}>
                                <View style={styles.filterFade} />
                                <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
                            </View>
                        )}
                    </View>
                    <Text style={commonStyle.label}>Activity</Text>
                    <ScrollView>
                        {activity
                            .filter(act => !filter || filter === 'all' || filter === act.entity_type)
                            .map((act, idx, filteredActivity) => {
                                const currentDay = new Date(act.created_at);
                                const previousDay = idx > 0 ? new Date(filteredActivity[idx-1]?.created_at) : null;
                                const changedDay = !previousDay || currentDay.toDateString() !== previousDay.toDateString();

                                return (
                                    <View key={act.id} >
                                        {changedDay && <Text style={styles.daySeparator}>{getSeparatorDate(act)}</Text>}
                                        <CardActivity act={act} key={act.id} />
                                    </View>
                                )
                            }
                        )}
                    </ScrollView>
                </View>
            </View>
        )
}

function CardActivity({act}) {
    const { allMembers, expenses, payments, group } = useGroup();
    const member = allMembers.find(x => x.id === act.actor_id);
    const desc = getActivityDescription(act, {allMembers, expenses, payments, group});
    const datestr = getActivityDate(act);

    return (
        <View style={[styles.cardActivity]} key={act.id}>
            <View style={styles.activityMain}>
                <View style={styles.info}>
                    <Avatar color={member?.avatar_color} inits={getInits(member?.name)}/>
                    <View style={styles.textContainer}>
                        <Text style={styles.description}>{desc}</Text>
                        <Text style={styles.metainfo}>{datestr}</Text>
                    </View>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    cardActivity: {
        marginBottom: sp.half,
        paddingLeft: sp.half,
        paddingVertical: 4,
    },
    activityMain: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textContainer: {
        flex: 1,
        minWidth: 0,
        marginLeft: sp.half,
    },
    description: {
        fontSize: 16,
        fontWeight: '600',
        flexShrink: 1,
    },
    
    metainfo: {
        fontSize: 13,
        color: colors.textMuted,
        marginTop: 3,
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        minWidth: 0,
    },
    daySeparator: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textMuted,
        // borderColor: colors.border,
        // borderBottomWidth: 1,
        marginTop: sp,
        marginBottom: sp.half,
    },
    filters: {
        marginBottom: sp[1],
        minHeight: 40,
    },
    filtersContent: {
        gap: 4,
        alignItems: 'center'
    },
    filterBtn: {
        paddingHorizontal: sp.xlg,
        borderColor: colors.primary,
        backgroundColor: lightColor(colors.primary),
        borderRadius: 20,
        borderWidth: 1,
        paddingVertical: sp.half,
    },
    filterBtnText: {
        color: colors.primary,
        fontWeight: '600',
    },
    filtersWrapper: {
        position: 'relative',
    },
    filterHint: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        width: 25,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterFade: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        backgroundColor: colors.background,
        opacity: 0.9,
    },
});
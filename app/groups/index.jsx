//My groups

import { getMyGroups } from '@/src/api/groups';
import { sp } from '@/src/constants/constants';
import { commonStyle } from '@/src/styles/common';
import { router } from "expo-router";
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from "react-native";


export default function myGroups() {
    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadGroups() {
            try {
                const myGroups = await getMyGroups();
                setGroups(myGroups);
            } catch (error) {
                alert(error.message);
            } finally {
                setLoading(false);
            }
        }
        loadGroups();
    }, [])

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
                <Text style={commonStyle.title}>My Groups</Text>
                <Text style={commonStyle.title}>Profile</Text>
            </View>
            <View style={commonStyle.body}>
                { groups.length === 0 ? (
                    <View style={styles.emptyBody}>
                        <Text style={styles.emptyTitle}>No groups yet</Text>
                        <Text style={styles.emptyText}>Create a group or join one to start splitting expenses.</Text>
                        <View style={commonStyle.footer}>
                            <Pressable style={commonStyle.btn} onPress={() => router.push('/groups/create')}>
                                <Text style={commonStyle.btnText}>Create group</Text>
                            </Pressable>
                            <Pressable style={commonStyle.btn2} onPress={() => router.push('/groups/join')}>
                                <Text style={commonStyle.btn2Text}>Join group</Text>
                            </Pressable>
                        </View>
                    </View>
                ): (
                    <View>
                        {groups.map((group) => (
                            <Pressable key={group.id} style={styles.groupCard} onPress={() => router.push(`/groups/${group.id}`)}>
                                <Text style={styles.groupName}>{group.name || 'Error 404 no name found'}</Text>
                                <Text style={styles.groupInfo}>
                                    {group.currency || 'EUR'} | {group.group_members[0]?.count || '**'} members
                                </Text>
                            </Pressable>
                        ))}
                        <View style={commonStyle.footer}>
                            <Pressable style={commonStyle.btn} onPress={() => router.push('/groups/create')}>
                                <Text style={commonStyle.btnText}>Create group</Text>
                            </Pressable>
                            <Pressable style={commonStyle.btn2} onPress={() => router.push('/groups/join')}>
                                <Text style={commonStyle.btn2Text}>Join group</Text>
                            </Pressable>
                        </View>
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
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
        padding: sp[2],
        borderRadius: 20,
        marginBottom: sp[1],
    },
    groupName: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 4,
    },
    groupInfo: {
        fontSize: 14,
    },
});
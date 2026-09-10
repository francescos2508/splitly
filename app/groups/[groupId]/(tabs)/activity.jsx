import Loader from '@/src/components/Loader';
import { commonStyle } from '@/src/styles/common';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from "react-native";
import { useGroup } from '../../../../backend/src/context/GroupContext';
import { getGroupActivity } from '../../../../src/api/api';


export default function Activity() {
    const {group, members, balances, activity, setActivity} = useGroup();
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function loadGroup(gid) {
            try {
                const activity = await getGroupActivity(gid);
                setActivity(activity);
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
                    <Text>Activity</Text>
                    
                    {activity.map((act) => {
                        const memb = members.find(x => x.id === act.actor_id);

                        return (
                            <View style={styles.cardExpense} key={act.id}>
                                <Text>{act.description} | User: {memb?.name || ''}</Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        )
}

const styles = StyleSheet.create({
    
});
import { useGroup } from '@/backend/src/context/GroupContext';
import { updateMe } from '@/src/api/api';
import AppInput from '@/src/components/AppInput';
import Avatar from '@/src/components/Avatar';
import Toast from '@/src/components/Toast';
import { AVATAR_COLORS, colors, sp } from '@/src/constants/constants';
import { commonStyle } from "@/src/styles/common";
import { getInits } from '@/src/utils/utils';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Loader from '../../../src/components/Loader';



export default function MyProfile() {
    const [member, setMember] = useState(null);
    const {group, groupId, members, currentMember, refreshGroup, loading, setLoading} = useGroup();
    const [toast, setToast] = useState(null);
    const updMember = (field, val) => { setMember(prev => ({...prev, [field]: val}))};

    useEffect(() => {
        if (currentMember) setMember(currentMember);
    }, [currentMember]);
    const showToast = (message) => { setToast(message); };
    const handleSaveMember = async () => {
        try {
            setLoading(true);
            const res = await updateMe(groupId, member);
            if (res) {
                await refreshGroup();
                showToast('Member updated!');
            }
        } catch (error) {
            console.error(error.message);
            alert('Problem while updating member, please retry in few minutes.');
        } finally {
            setLoading(false);
        }
    }
    return (
        <View style={commonStyle.container}>
            {loading && <Loader overlay />}
            <View style={commonStyle.header}>
                <Pressable style={commonStyle.headerBack} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </Pressable>
                <Text style={commonStyle.sectionTitle}>Your profile</Text>
            </View>
            <ScrollView style={commonStyle.body}>
                <View style={styles.avatarCont}>
                    <Avatar height={sp[5]} width={sp[5]} color={member?.avatar_color} inits={getInits(member?.name)} />
                    <Text style={styles.name}>{member?.name} {member?.is_owner && '· admin'}</Text>
                </View>
                <Text style={commonStyle.label}>Display name</Text>
                <AppInput
                    style={commonStyle.input}
                    placeholder='Display name'
                    value={member?.name || ''}
                    onChangeText={(value) => updMember('name', value)}
                />
                <Text style={commonStyle.label}>Choose avatar color</Text>
                <View style={styles.chooseColorCont}>
                    {AVATAR_COLORS.map(x => {
                        let selected = x === member?.avatar_color;
                        return (
                        <Pressable key={x} style={[styles.colorPoint, {backgroundColor: x}]} onPress={() => updMember('avatar_color', x)}>
                            {selected && <Ionicons size={25} name='checkmark-outline' color={colors.white} />}
                        </Pressable>
                        );
                    })}
                </View>
            </ScrollView>
            <View style={commonStyle.footer}>
                {toast && ( <Toast message={toast} onHide={() => setToast(null)} /> )}
                <Pressable style={commonStyle.btn} onPress={handleSaveMember}>
                    <Text style={commonStyle.btnText}>Save</Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    avatarCont: {
        width: '100%',
        alignItems: 'center',
        marginBottom: sp[1]
    },
    name: {
        fontSize: 18,
        fontWeight: '600',
        marginTop: sp.half
    },
    chooseColorCont: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        rowGap: 4,
        columnGap: 4,
    },
    colorPoint: {
        height: 40,
        width: 40,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
})
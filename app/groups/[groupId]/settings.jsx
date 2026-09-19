import Avatar from '@/src/components/Avatar';
import Toast from '@/src/components/Toast';
import { colors, sp } from '@/src/constants/constants';
import { commonStyle } from "@/src/styles/common";
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useGroup } from "../../../backend/src/context/GroupContext";
import { getInits } from '../../../src/utils/utils';

const groupIcons = [
    'rocket-outline',   
    'house-outline',    
    'hammer-outline',   
    'fish-outline', 
    'airplane-outline', 
    'planet-outline',   
    'bug-outline',  
    'beer-outline', 
    'cash-outline', 
    'flash-outline',    
    'paw-outline',  
    'people-outline',   
    'people-outline',   
];


export default function Settings() {
    const {group, groupId, members, currentMember} = useGroup();
    const admin = currentMember?.is_owner;
    const [toast, setToast] = useState(null);
    const showToast = (message) => {
        setToast(message);
    };
    
    const copyInviteCode = async (code) => {
        await Clipboard.setStringAsync(code);
        showToast('Copied!');
    };

    return (
        <View style={commonStyle.container}>
            <View style={commonStyle.header}>
                <Pressable style={styles.headerBack} onPress={() => router.back()}>
                    <Ionicons name="chevron-back" size={20} color={colors.primary} />
                </Pressable>
                <Text style={commonStyle.title}>Group settings</Text>
            </View>

            <ScrollView style={commonStyle.body}>
                <Text style={commonStyle.sectionTitle}>Group info</Text>
                <Pressable style={styles.cardSettings}>
                    <View style={styles.iconView}>
                        <Ionicons name={group?.icon || 'people-outline'} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.mainInfo}>
                        <Text>Group icon</Text>
                        <Text style={styles.oldValue}>{group?.icon}</Text>
                    </View>
                    <View>
                        <Ionicons name='chevron-forward' size={20} color={colors.text} />
                    </View>
                </Pressable>
                <Pressable style={styles.cardSettings}>
                    <View style={styles.iconView}>
                        <Ionicons name='create-outline' size={20} color={colors.primary} />
                    </View>
                    <View style={styles.mainInfo}>
                        <Text>Name</Text>
                        <Text style={styles.oldValue}>{group?.name}</Text>
                    </View>
                    <View>
                        <Ionicons name='chevron-forward' size={20} color={colors.text} />
                    </View>
                </Pressable>
                <Pressable style={styles.cardSettings}>
                    <View style={styles.iconView}>
                        <Ionicons name='cash-outline' size={20} color={colors.primary} />
                    </View>
                    <View style={styles.mainInfo}>
                        <Text>Currency</Text>
                        <Text style={styles.oldValue}>{group?.currency}</Text>
                    </View>
                    <View>
                        <Ionicons name='chevron-forward' size={20} color={colors.text} />
                    </View>
                </Pressable>
                <Pressable style={styles.cardSettings} onPress={() => copyInviteCode(group?.invite_code)}>
                    <View style={styles.iconView}>
                        <Ionicons name='share-social-outline' size={20} color={colors.primary} />
                    </View>
                    <View style={styles.mainInfo}>
                        <Text>Invite code</Text>
                        <Text style={styles.oldValue}>{group?.invite_code}</Text>
                    </View>
                    <View>
                        <Ionicons name='copy-outline' size={20} color={colors.text} />
                    </View>
                </Pressable>

                {/* members */}
                <View style={styles.memberContainer}>
                    <Text style={commonStyle.sectionTitle}>Members</Text>
                    {members.map((member) => {
                        const itsme = member.id === currentMember.id;
                        return (
                            <View style={styles.cardMember} key={member.id}>
                                <View style={commonStyle.rowBasic}>
                                    <Avatar color={member.avatar_color} inits={getInits(member.name)} />
                                    <Text style={styles.name}>{!itsme ? member.name : 'You'} {member.is_owner && ' · admin'}</Text>
                                </View>
                                {itsme ? (
                                    <Pressable onPress={() => alert('Modified!')}>
                                        <Ionicons name='pencil' size={20} color={colors.primary} />
                                    </Pressable>
                                ) : admin ? ( 
                                    <Pressable onPress={() => alert('Deleted!')}>
                                        <Ionicons name='trash-outline' size={20} color={colors.primary} />
                                    </Pressable>
                                ): null}
                            </View>
                        );
                    })}
                </View>

                <View style={styles.dangerZone}>
                    <Pressable style={styles.dangerBtn}>
                        <Text style={styles.dangerBtnTxt}>Leave group</Text>
                    </Pressable>

                    {admin && (
                        <Pressable style={styles.dangerBtn}>
                            <Text style={styles.dangerBtnTxt}>Delete group</Text>
                        </Pressable>
                    )}
                    <Text style={styles.created}>
                        Created on 
                        {' '+new Date(group.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                </View>
            </ScrollView>
            
            <View style={commonStyle.footer}>
                {/* <Pressable onPress={ () => router.back() } style={commonStyle.btn}>
                    <Text style={commonStyle.btnText}>Done</Text>
                </Pressable> */}

                {toast && ( <Toast message={toast} onHide={() => setToast(null)} /> )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerBack: {
        position: 'absolute',
        left: sp[1],
        zIndex: 1,
    },
    cardSettings: {
        paddingHorizontal: sp[1],
        paddingVertical: sp.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: colors.border,
        borderBottomWidth: 1,
        // marginBottom: sp.half
    },
    oldValue: {
        fontWeight: 600,
        fontSize: 16
    },
    cardMember: {
        paddingHorizontal: sp[1],
        paddingVertical: sp.md,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderColor: colors.border,
        borderBottomWidth: 1,
        // marginBottom: sp.half,
    },
    name: {
        fontSize: 16,
        paddingLeft: sp[1],
    },
    memberContainer: {
        marginTop: sp[1]
    },
    dangerZone: {
        marginTop: sp[2],
    },
    dangerBtn: {
        width: "100%",
        paddingVertical: 14,
        alignItems: "center",
        borderRadius: 20,
        marginBottom: 12,
        borderColor: colors.danger,
        borderWidth: 1,
        // backgroundColor: colors.danger,
    },
    dangerBtnTxt: {
        // color: colors.white,
        color: colors.danger,
        fontSize: 16,
        fontWeight: "600",
    },
    created: {
        marginTop: sp[1],
        color: colors.textMuted,
        fontSize: 13,
    },
    iconView: {
        position: 'absolute',
        left: sp[1],
    },
    mainInfo: {
        left: sp[3],
    }
})
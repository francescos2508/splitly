import { leaveGroup, regenerateInviteCode, removeMemberGroup, updateGroup } from '@/src/api/api';
import AdaptiveSheet from '@/src/components/AdaptiveSheet';
import Avatar from '@/src/components/Avatar';
import Loader from "@/src/components/Loader";
import Toast from '@/src/components/Toast';
import { currencies, currencyOptions, sp } from '@/src/constants/constants';
import { useGroup } from "@/src/context/GroupContext";
import { useTheme } from '@/src/context/ThemeContext';
import { createCommonStyle } from "@/src/styles/common";
import { getInits } from '@/src/utils/utils';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export default function Settings() {
    const { colors } = useTheme();
    const commonStyle = createCommonStyle(colors);
    const styles = createStyles(colors);
    const { group, groupId, members, balances, currentMember, loading, setLoading, refreshGroup } = useGroup();
    const admin = currentMember?.is_owner;
    const [toast, setToast] = useState(null);
    const nameSheetRef = useRef(null);
    const currencySheetRef = useRef(null);
    const inviteCodeSheetRef = useRef(null);
    const removeMemberSheetRef = useRef(null);
    const leaveGroupSheetRef = useRef(null);
    const [removingMember, setRemovingMember] = useState(null);
    const [groupName, setGroupName] = useState(group?.name || '');

    const openNameSheet = () => {
        setGroupName(group?.name || '');
        nameSheetRef.current?.present();
    }
    const openCurrencySheet = () => { currencySheetRef.current?.present(); }
    const openInviteCodeSheet = () => { inviteCodeSheetRef.current?.present(); }
    const openRemoveMemberSheet = (member) => {
        const bal = balances.find(x => x.id === member.id);
        const isSettled = !bal || Math.abs(bal.balance) < 0.01;
        if (!isSettled) {
            alert('It\'s not possible to remove from the group a member that is not settled up');
            return;
        }
        setRemovingMember(member);
        removeMemberSheetRef.current?.present();
    }
    const openLeaveGroupSheet = () => {
        if (admin && members.length > 1) {
            alert('You can\'t leave the group while you\'re the admin');
            return;
        }
        const bal = balances.find(x => x.id === currentMember.id);
        const isSettled = !bal || Math.abs(bal.balance) < 0.01;
        if (!isSettled) {
            alert('It\'s not possible to leave the group if you aren\'t settled up');
            return;
        }
        leaveGroupSheetRef.current?.present();
    }
    const showToast = (message) => { setToast(message); };
    const copyInviteCode = async (code) => {
        await Clipboard.setStringAsync(code);
        showToast('Copied!');
    };
    const handleSaveGroupSettings = async (field, newVal, sheetRef) => {
        if (loading) return;
        try {
            setLoading(true);
            const res = await updateGroup({ ...group, [field]: newVal });
            if (res) {
                await refreshGroup({ group: true });
                if (sheetRef) sheetRef.current?.dismiss();
            }
        } catch (error) {
            console.error(error.message);
            alert('Problem while updating group, please retry in few minutes.');
        } finally {
            setLoading(false);
        }
    };
    const handleRegenerateInviteCode = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const res = await regenerateInviteCode(groupId);
            if (res) {
                await refreshGroup({ group: true });
                inviteCodeSheetRef.current?.dismiss();
            }
        } catch (error) {
            console.error(error.message);
            alert('Problem while regenerating the code, please retry in few minutes.');
        } finally {
            setLoading(false);
        }
    }
    const handleRemoveMember = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const res = await removeMemberGroup(groupId, removingMember?.id);
            if (res) {
                await refreshGroup();
                removeMemberSheetRef.current?.dismiss();
            }
        } catch (error) {
            console.error(error.message);
            alert('Problem while removing the member, please retry in few minutes.');
        } finally {
            setLoading(false);
        }
    }

    const handleLeaveGroup = async () => {
        if (loading) return;
        try {
            setLoading(true);
            const res = await leaveGroup(groupId);
            if (res) router.dismissTo('/groups');
        } catch (error) {
            console.error(error.message);
            alert('Problem while leaving the group, please retry in few minutes.');
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
                <Text style={commonStyle.title}>Group settings</Text>
            </View>

            <ScrollView style={commonStyle.body}>
                <Text style={commonStyle.sectionTitle}>Group info</Text>
                <Pressable style={styles.cardSettings} onPress={() => router.push(`/groups/${groupId}/group-icon`)}>
                    <View style={styles.iconView}>
                        <Ionicons name={group?.icon || 'people-outline'} size={20} color={colors.primary} />
                    </View>
                    <View style={styles.mainInfo}>
                        <Text style={styles.cardText}>Group icon</Text>
                        <Text style={styles.oldValue}>{group?.icon}</Text>
                    </View>
                    <View>
                        <Ionicons name='chevron-forward' size={20} color={colors.primary} />
                    </View>
                </Pressable>
                <Pressable style={styles.cardSettings} onPress={openNameSheet}>
                    <View style={styles.iconView}>
                        <Ionicons name='create-outline' size={20} color={colors.primary} />
                    </View>
                    <View style={styles.mainInfo}>
                        <Text style={styles.cardText}>Name</Text>
                        <Text style={styles.oldValue}>{group?.name}</Text>
                    </View>
                    <View>
                        <Ionicons name='chevron-forward' size={20} color={colors.primary} />
                    </View>
                </Pressable>
                <Pressable style={styles.cardSettings} onPress={openCurrencySheet}>
                    <View style={styles.iconView}>
                        <Ionicons name='cash-outline' size={20} color={colors.primary} />
                    </View>
                    <View style={styles.mainInfo}>
                        <Text style={styles.cardText}>Currency</Text>
                        <Text style={styles.oldValue}>{group?.currency} {'(' + currencies[group?.currency] + ')'}</Text>
                    </View>
                    <View>
                        <Ionicons name='chevron-forward' size={20} color={colors.primary} />
                    </View>
                </Pressable>
                <Pressable style={styles.cardSettings} onPress={() => copyInviteCode(group?.invite_code)}>
                    <View style={styles.iconView}>
                        <Ionicons name='share-social-outline' size={20} color={colors.primary} />
                    </View>
                    <View style={styles.mainInfo}>
                        <Text style={styles.cardText}>Invite code</Text>
                        <Text style={styles.oldValue}>{group?.invite_code}</Text>
                    </View>
                    <View>
                        <Ionicons name='copy-outline' size={20} color={colors.primary} />
                    </View>
                </Pressable>
                {admin && (
                    <Pressable style={styles.cardSettings} onPress={openInviteCodeSheet}>
                        <View style={styles.mainInfo}>
                            <Text style={styles.cardText}>Regenerate invite code</Text>
                            <Text style={styles.oldValue}>Replace the current invite code</Text>
                        </View>
                        <View>
                            <Ionicons name='sync-outline' size={20} color={colors.primary} />
                        </View>
                    </Pressable>
                )}

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
                                    <Pressable onPress={() => router.push(`/groups/${groupId}/my-profile`)}>
                                        <Ionicons name='pencil' size={20} color={colors.primary} />
                                    </Pressable>
                                ) : admin ? (
                                    <Pressable onPress={() => openRemoveMemberSheet(member)}>
                                        <Ionicons name='trash-outline' size={20} color={colors.primary} />
                                    </Pressable>
                                ) : null}
                            </View>
                        );
                    })}
                </View>

                <View style={styles.dangerZone}>
                    <Pressable style={styles.dangerBtn} onPress={openLeaveGroupSheet}>
                        <Text style={styles.dangerBtnTxt}>Leave group</Text>
                    </Pressable>

                    {admin && (
                        <Pressable style={styles.dangerBtn} onPress={() => alert('Not developed yet...')}>
                            <Text style={styles.dangerBtnTxt}>Delete group</Text>
                        </Pressable>
                    )}
                    <Text style={styles.created}>
                        Created on
                        {' ' + new Date(group?.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                </View>
            </ScrollView>

            <View style={commonStyle.footer}>
                {toast && (<Toast message={toast} onHide={() => setToast(null)} />)}
            </View>

            <AdaptiveSheet ref={nameSheetRef}>
                <View style={styles.sheet}>
                    <View style={{ flex: 1 }}>
                        <Text style={commonStyle.label}>Group name</Text>
                        {Platform.OS === 'web' ? (
                            <TextInput style={commonStyle.input} value={groupName} onChangeText={setGroupName} placeholder="Group name" /> 
                        ) : ( 
                            <BottomSheetTextInput style={commonStyle.input} value={groupName} onChangeText={setGroupName} placeholder='Group name' /> 
                        )}
                    </View>

                    <Pressable
                        style={commonStyle.btn}
                        onPress={() =>
                            handleSaveGroupSettings('name', groupName, nameSheetRef)
                        }
                    >
                        <Text style={commonStyle.btnText}>Save</Text>
                    </Pressable>
                </View>
            </AdaptiveSheet>

            <AdaptiveSheet ref={currencySheetRef}>
                <View style={styles.sheet}>
                    <View style={{ flex: 1 }}>
                        <Text style={commonStyle.label}>Choose currency</Text>

                        {currencyOptions.map((item) => {
                            const selected = group?.currency === item.value;

                            return (
                                <Pressable
                                    key={item.value}
                                    style={styles.option}
                                    onPress={() =>
                                        handleSaveGroupSettings(
                                            'currency',
                                            item.value,
                                            currencySheetRef
                                        )
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.optionText,
                                            selected && { fontWeight: '700' }
                                        ]}
                                    >
                                        {item.label}
                                    </Text>

                                    {selected && (
                                        <Ionicons
                                            name="checkmark-outline"
                                            size={20}
                                            color={colors.text}
                                        />
                                    )}
                                </Pressable>
                            );
                        })}
                    </View>
                </View>
            </AdaptiveSheet>

            <AdaptiveSheet
                ref={inviteCodeSheetRef}
ì            >
                <View style={styles.sheet}>
                    <View style={{ flex: 1 }}>
                        <Text style={commonStyle.label}>
                            Regenerate invite code?
                        </Text>

                        <Text style={styles.sheetText}>
                            The current invite code will no longer work for new members.
                            {'\n'}
                            This action cannot be undone.
                            {'\n'}
                        </Text>
                    </View>

                    <Pressable
                        style={commonStyle.btn}
                        onPress={handleRegenerateInviteCode}
                    >
                        <Text style={commonStyle.btnText}>
                            Regenerate code
                        </Text>
                    </Pressable>

                    <Pressable
                        style={commonStyle.btn2}
                        onPress={() => {
                            if (loading) return;
                            inviteCodeSheetRef.current?.dismiss();
                        }}
                    >
                        <Text style={commonStyle.btn2Text}>
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            </AdaptiveSheet>

            <AdaptiveSheet
                ref={removeMemberSheetRef}
            >
                <View style={styles.sheet}>
                    <View style={{ flex: 1 }}>
                        <Text style={commonStyle.label}>
                            Remove {removingMember?.name}?
                        </Text>

                        <Text style={styles.sheetText}>
                            Are you sure you want to remove {removingMember?.name} from the group?
                            {'\n'}
                            This member will no longer have access to the group.
                            Expenses and payments will remain in the group history.
                            {'\n'}
                        </Text>
                    </View>

                    <Pressable
                        style={styles.dangerBtn}
                        onPress={handleRemoveMember}
                    >
                        <Text style={styles.dangerBtnTxt}>
                            Remove
                        </Text>
                    </Pressable>

                    <Pressable
                        style={commonStyle.btn2}
                        onPress={() => {
                            if (loading) return;
                            removeMemberSheetRef.current?.dismiss();
                        }}
                    >
                        <Text style={commonStyle.btn2Text}>
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            </AdaptiveSheet>

            <AdaptiveSheet
                ref={leaveGroupSheetRef}
            >
                <View style={styles.sheet}>
                    <View style={{ flex: 1 }}>
                        <Text style={commonStyle.label}>
                            Leave the group?
                        </Text>

                        <Text style={styles.sheetText}>
                            Are you sure you want to leave the group?
                            {'\n'}
                            This operation can't be undone.
                            {'\n'}
                        </Text>
                    </View>

                    <Pressable
                        style={styles.dangerBtn}
                        onPress={handleLeaveGroup}
                    >
                        <Text style={styles.dangerBtnTxt}>
                            Leave
                        </Text>
                    </Pressable>

                    <Pressable
                        style={commonStyle.btn2}
                        onPress={() => {
                            if (loading) return;
                            leaveGroupSheetRef.current?.dismiss();
                        }}
                    >
                        <Text style={commonStyle.btn2Text}>
                            Cancel
                        </Text>
                    </Pressable>
                </View>
            </AdaptiveSheet>
        </View>
    );
}

const createStyles = (colors) => StyleSheet.create({
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
        fontWeight: "600",
        fontSize: 16,
        color: colors.textSecondary,
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
        color: colors.text,
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
    },
    sheet: {
        padding: sp[1],
        // gap: 20,
        flex: 1,
        justifyContent: 'space-between',
    },
    option: {
        paddingVertical: sp[1],
        paddingHorizontal: sp[2],
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionText: {
        fontSize: 16,
        color: colors.text,
    },
    regenerateBtn: {
        alignSelf: 'flex-end',
        marginTop: sp.half,
        marginBottom: sp[1],
        paddingHorizontal: sp[1],
        paddingVertical: sp.half,
    },
    regenerateText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '600',
    },
    cardText: {
        color: colors.text,
    },
    sheetText: {
        color: colors.text,
    },
})
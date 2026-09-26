import { useGroup } from "@/backend/src/context/GroupContext";
import { regenerateInviteCode, updateGroup } from '@/src/api/api';
import Avatar from '@/src/components/Avatar';
import Toast from '@/src/components/Toast';
import { colors, currencies, currencyOptions, sp } from '@/src/constants/constants';
import { commonStyle } from "@/src/styles/common";
import { getInits } from '@/src/utils/utils';
import { Ionicons } from '@expo/vector-icons';
import { BottomSheetBackdrop, BottomSheetModal, BottomSheetTextInput } from '@gorhom/bottom-sheet';
import * as Clipboard from 'expo-clipboard';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { removeMemberGroup } from "../../../src/api/api";
import Loader from "../../../src/components/Loader";




export default function Settings() {
    const {group, groupId, members, balances, currentMember, loading, setLoading, refreshGroup} = useGroup();
    const admin = currentMember?.is_owner;
    const [toast, setToast] = useState(null);
    const nameSheetRef = useRef(null);
    const currencySheetRef = useRef(null);
    const inviteCodeSheetRef = useRef(null);
    const removeMemberSheetRef = useRef(null);
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
    const showToast = (message) => { setToast(message); };
    const copyInviteCode = async (code) => {
        await Clipboard.setStringAsync(code);
        showToast('Copied!');
    };
    const handleSaveGroupSettings = async (field, newVal, sheetRef) => {
        if (loading) return;
        try {
            setLoading(true);
            const res = await updateGroup({...group, [field]: newVal});
            if (res) {
                await refreshGroup({group: true});
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
                await refreshGroup({group: true});
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
                        <Text>Group icon</Text>
                        <Text style={styles.oldValue}>{group?.icon}</Text>
                    </View>
                    <View>
                        <Ionicons name='chevron-forward' size={20} color={colors.text} />
                    </View>
                </Pressable>
                <Pressable style={styles.cardSettings} onPress={openNameSheet}>
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
                <Pressable style={styles.cardSettings} onPress={openCurrencySheet}>
                    <View style={styles.iconView}>
                        <Ionicons name='cash-outline' size={20} color={colors.primary} />
                    </View>
                    <View style={styles.mainInfo}>
                        <Text>Currency</Text>
                        <Text style={styles.oldValue}>{group?.currency} {'('+currencies[group?.currency]+')'}</Text>
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
                {admin && (
                    <Pressable style={styles.cardSettings} onPress={openInviteCodeSheet}>
                        {/* <View style={styles.iconView}>
                            <Ionicons name='sync-outline' size={20} color={colors.primary} />
                        </View> */}
                        <View style={styles.mainInfo}>
                            <Text>Regenerate invite code</Text>
                            <Text style={styles.oldValue}>Replace the current invite code</Text>
                        </View>
                        <View>
                            <Ionicons name='sync-outline' size={20} color={colors.text} />
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
                                ): null}
                            </View>
                        );
                    })}
                </View>

                <View style={styles.dangerZone}>
                    <Pressable style={styles.dangerBtn} onPress={() => alert('Not developed yet...')}>
                        <Text style={styles.dangerBtnTxt}>Leave group</Text>
                    </Pressable>

                    {admin && (
                        <Pressable style={styles.dangerBtn} onPress={() => alert('Not developed yet...')}>
                            <Text style={styles.dangerBtnTxt}>Delete group</Text>
                        </Pressable>
                    )}
                    <Text style={styles.created}>
                        Created on 
                        {' '+new Date(group?.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </Text>
                </View>
            </ScrollView>
            
            <View style={commonStyle.footer}>
                {/* <Pressable onPress={ () => router.back() } style={commonStyle.btn}>
                    <Text style={commonStyle.btnText}>Done</Text>
                </Pressable> */}

                {toast && ( <Toast message={toast} onHide={() => setToast(null)} /> )}
            </View>

            <BottomSheetModal ref={nameSheetRef} snapPoints={['40%']} enablePanDownToClose enableDynamicSizing={false} 
                keyboardBehavior='interactive' keyboardBlurBehavior='restore'
                backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior='close' />)}
            >
                <View style={styles.sheet} >
                    <Pressable style={{flex:1}} onPress={Keyboard.dismiss}>
                        <Text style={commonStyle.label}>Group name</Text>
                        <BottomSheetTextInput style={commonStyle.input} value={groupName} onChangeText={setGroupName} placeholder='Group name' />
                    </Pressable>
                    <Pressable  style={commonStyle.btn} onPress={() => handleSaveGroupSettings('name', groupName, nameSheetRef)}>
                        <Text style={commonStyle.btnText}>Save</Text>
                    </Pressable>
                </View>
            </BottomSheetModal>

            <BottomSheetModal ref={currencySheetRef} snapPoints={['40%']} enablePanDownToClose enableDynamicSizing={false} 
                keyboardBehavior='interactive' keyboardBlurBehavior='restore'
                backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior='close' />)}
            >
                <View style={styles.sheet} >
                    <View style={{flex:1}} onPress={Keyboard.dismiss}>
                        <Text style={commonStyle.label}>Choose currency</Text>
                        {currencyOptions.map( (item) => {
                            const selected = group?.currency === item.value;
                            return (
                                <Pressable key={item.value} style={styles.option} onPress={() => handleSaveGroupSettings('currency', item.value, currencySheetRef)}>
                                    <Text style={[styles.optionText, selected && {fontWeight: '700'}]}>
                                        {item.label}
                                    </Text>
                                    {selected && ( <Ionicons name="checkmark-outline" size={20} color={colors.text} /> )}
                                </Pressable>
                                )
                        })}
                    </View>
                </View>
            </BottomSheetModal>

            <BottomSheetModal ref={inviteCodeSheetRef} snapPoints={['40%']} enablePanDownToClose enableDynamicSizing={false} 
                keyboardBehavior='interactive' keyboardBlurBehavior='restore'
                backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior='close' />)}
            >
                <View style={styles.sheet} >
                    <View style={{flex:1}} >
                        <Text style={commonStyle.label}>Regenerate invite code?</Text>
                        <Text>The current invite code will no longer work for new members. {'\n'}This action cannot be undone.</Text>
                    </View>
                    <Pressable  style={commonStyle.btn} onPress={handleRegenerateInviteCode}>
                        <Text style={commonStyle.btnText}>Regenerate code</Text>
                    </Pressable>
                    <Pressable  style={commonStyle.btn2} onPress={() => inviteCodeSheetRef.current?.dismiss()}>
                        <Text style={commonStyle.btn2Text}>Cancel</Text>
                    </Pressable>
                </View>
            </BottomSheetModal>

            <BottomSheetModal ref={removeMemberSheetRef} snapPoints={['40%']} enablePanDownToClose enableDynamicSizing={false} 
                keyboardBehavior='interactive' keyboardBlurBehavior='restore'
                backdropComponent={(props) => (<BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior='close' />)}
            >
                <View style={styles.sheet} >
                    <View style={{flex:1}} >
                        <Text style={commonStyle.label}>Remove {removingMember?.name}?</Text>
                        <Text>Are you sure you want to remove {removingMember?.name} from the group? {'\n'}
                            This member will no longer have access to the group. Expenses and payments will remain in the group history.</Text>
                    </View>
                    <Pressable style={styles.dangerBtn} onPress={handleRemoveMember}>
                        <Text style={styles.dangerBtnTxt}>Remove</Text>
                    </Pressable>
                    <Pressable style={commonStyle.btn2} onPress={() => {if (loading) return; removeMemberSheetRef.current?.dismiss()}}>
                        <Text style={commonStyle.btn2Text}>Cancel</Text>
                    </Pressable>
                </View>
            </BottomSheetModal>
        </View>
    );
}

const styles = StyleSheet.create({
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
})
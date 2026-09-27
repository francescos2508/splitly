import { useGroup } from "@/backend/src/context/GroupContext";
import { createExpense, updateExpense } from "@/src/api/api";
import AppInput from "@/src/components/AppInput";
import DateInput from "@/src/components/DateInput";
import Loader from '@/src/components/Loader';
import SelectInput from "@/src/components/SelectInput";
import { colors, sp } from '@/src/constants/constants';
import { commonStyle } from "@/src/styles/common";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { deleteExpense } from "../../../src/api/api";
import { lightColor } from "../../../src/utils/utils";


export default function NewExpense() {
    const { allMembers, members, expenses, loading, currentMember, setLoading, refreshGroup } = useGroup();
    const { groupId, expenseId } = useLocalSearchParams();
    const isEditing = !!expenseId;
    const [showParticipants, setShowParticipants] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: "",
        amount: "",
        category: "",
        expense_date: new Date(),
        paid_by_member_id: "",
        split_type: "equal",
        participants: [],
    });
    const [options, setOptions] = useState({
        categories: [
            { label: 'Generic', value: 'Generic' },
            { label: 'Food', value: 'Food' },
            { label: 'Home', value: 'Home' },
            { label: 'Groceries', value: 'Groceries' },
            { label: 'Bills & Utilities', value: 'Bills & Utilities' },
            { label: 'Transport', value: 'Transport' },
            { label: 'Travel', value: 'Travel' },
            { label: 'Entertainment', value: 'Entertainment' },
            { label: 'Shopping', value: 'Shopping' },
            { label: 'Health', value: 'Health' },
            { label: 'Sports', value: 'Sports' },
            { label: 'Subscriptions', value: 'Subscriptions' },
            { label: 'Gifts', value: 'Gifts' },
            { label: 'Work', value: 'Work' },
            { label: 'Education', value: 'Education' },
            { label: 'Pets', value: 'Pets' },
            { label: 'Personal Care', value: 'Personal Care' },
            { label: 'Services', value: 'Services' },
            { label: 'Fees & Charges', value: 'Fees & Charges' },
            { label: 'Other', value: 'Other' },
        ],
        splitType: [
            { label: 'equal', value: 'equal' },
            { label: 'custom', value: 'custom' },
        ],
        paidBy: []
    });
    // all id of removed members
    const removedIds = allMembers.filter(x => !x.is_active).map(x => x.id);
    // flag 
    const hasRemovedMembers = removedIds.includes(newExpense.paid_by_member_id) || newExpense.participants.some(x => removedIds.includes(x.memberId));
    // to view everything correct even though there are removed members
    const participantMembers = hasRemovedMembers ? allMembers : members;

    const updExpense = (field, val) => { setNewExpense((prev) => ({ ...prev, [field]: val })); }

    useEffect(() => {
        if (!allMembers) return;
        if (!members) return;

        setOptions(prev => ({
            ...prev,
            paidBy: (hasRemovedMembers ? allMembers : members).map(member => ({
                label: member.name,
                value: member.id,
            })),
        }));

        // automatically all members are selected
        if (!isEditing) updExpense('participants', members.map(m => ({ memberId: m.id })));
        // if (isEditing) updExpense('participants', allMembers.filter(m => newExpense?.expense_participants?.some(x => x.member?.id === m.id)).map(m => ({ memberId: m.id })));
    }, [allMembers, members, isEditing, hasRemovedMembers]);

    useEffect(() => {
        if (!expenseId) return;
        const exp = expenses.find(x => x.id === expenseId);
        if (!exp) return;
        // setNewExpense(exp);
        setNewExpense({
            ...exp,
            amount: exp.amount.toString(),
            participants: exp.expense_participants.map(p => ({
                memberId: p.member.id,
                amount: p.share_amount,
            })),
        });
    }, [expenseId, expenses]);

    const handleSaveExpense = async function () {
        if (loading) return;
        setLoading(true);
        try {
            const amount = Number(newExpense.amount.replace(',', '.'));
            if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be higher than 0');
            const expenseData = { ...newExpense, amount };
            if (isEditing) {
                const res = await updateExpense(expenseId, expenseData);
                if (res) {
                    await refreshGroup({expenses: true, balances: true, activity: true});
                    router.back();
                }
            } else {
                const res = await createExpense(groupId, expenseData);
                if (res?.expense) {
                    await refreshGroup({expenses: true, balances: true, activity: true});
                    router.back();
                }
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }
    const confirmDelete = () => {
        const yesno = [{text: 'Cancel', style: 'cancel'}, {text: 'Yes, delete', style: 'destructive', onPress: handleDeleteExpense}]
        Alert.alert('Delete expense?', 'Are you sure you want to delete this expense? This action cannot be undone.', yesno);
    }
    const handleDeleteExpense = async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res = await deleteExpense(newExpense.id);
            if (res) {
                await refreshGroup({expenses: true, balances: true, activity: true});
                router.back();
            }
        } catch (error) {
            console.error(error);
            alert(error.message);
        } finally {
            setLoading(false);
        }
    }
    const toggleParticipant = function (mid) {
        setNewExpense((prev) => {
            const isExisting = prev.participants.some(p => p.memberId === mid);
            return {
                ...prev,
                participants: isExisting ? prev.participants.filter(x => x.memberId !== mid) : [...prev.participants, { memberId: mid }]
            }
        })
    }

    const updateParticipantAmount = (memberId, amount) => {
        setNewExpense(prev => ({
            ...prev,
            participants: prev.participants.map(participant =>
                participant.memberId === memberId
                    ? { ...participant, amount }
                    : participant
            ),
        }));
    };
    
    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={commonStyle.container}>
                {loading && <Loader overlay />}
                <View style={commonStyle.header}>
                    <Text style={commonStyle.title}>
                        {isEditing ? `Edit expense${hasRemovedMembers ? ' *' : ''}` : 'New expense'}
                    </Text>
                </View>
                <ScrollView style={[commonStyle.body, { flex: 1 }]}>
                    <Text style={commonStyle.label}>Description</Text>
                    <AppInput
                        style={commonStyle.input}
                        placeholder='Description'
                        value={newExpense.description}
                        onChangeText={(value) => updExpense('description', value)}
                    />
                    <View style={styles.row}>
                        <View style={styles.col}>
                            <Text style={commonStyle.label}>Amount</Text>
                            <AppInput
                                style={commonStyle.input}
                                keyboardType="decimal-pad"
                                placeholder='Amount'
                                value={newExpense.amount}
                                onChangeText={(value) => updExpense('amount', value)}
                                suffix='€'
                                editable={!hasRemovedMembers}
                            />
                        </View>
                        <View style={styles.col}>
                            <DateInput
                                label='Date'
                                value={newExpense.expense_date}
                                onChange={(value) => updExpense('expense_date', value)}
                            />
                        </View>
                    </View>

                    <SelectInput
                        label='Category'
                        value={newExpense.category}
                        options={options.categories}
                        onChange={(value) => updExpense('category', value)}
                    />

                    <SelectInput
                        label='Paid by'
                        value={newExpense.paid_by_member_id}
                        options={options.paidBy}
                        onChange={(value) => updExpense('paid_by_member_id', value)}
                        editable={!hasRemovedMembers}
                    />

                    <SelectInput
                        label='Split type'
                        value={newExpense.split_type}
                        options={options.splitType}
                        onChange={(value) => updExpense('split_type', value)}
                        editable={!hasRemovedMembers}
                    />

                    <Text style={commonStyle.label}>{hasRemovedMembers ? 'Participants' : 'Split between'}</Text>
                    <View style={styles.bodyParticipants}>
                        <Pressable onPress={() => setShowParticipants(true)}>
                            <Text style={styles.textInput}>
                                <Ionicons
                                    name="people-outline"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                                {/* {newExpense.participants?.length === members.length
                                    ? ' All members'
                                    : ' '+newExpense.participants?.length+'/'+participantMembers.length+' members'} */}
                                {' '+newExpense.participants?.length+'/'+participantMembers.length+' members'}
                            </Text>
                        </Pressable>

                        <Modal
                            visible={showParticipants}
                            transparent
                            animationType="fade"
                            onRequestClose={() => setShowParticipants(false)}
                        >
                            <Pressable
                                style={styles.overlay}
                                onPress={() => setShowParticipants(false)}
                            >
                                <View style={styles.modal}>
                                    <Text style={styles.modalTitle}>
                                        {hasRemovedMembers ? 'Participants' : 'Split between'}
                                    </Text>
                                    {participantMembers.map((member) => {
                                        const selected = newExpense.participants?.some(p => p.memberId === member.id);
                                        return (
                                        <Pressable style={styles.cardParticipant} key={member.id} 
                                            onPress={() => !hasRemovedMembers && toggleParticipant(member.id)}
                                        >
                                            <Ionicons name={selected ? "checkbox" : "square-outline"} size={24} color={hasRemovedMembers ? lightColor(colors.primary) : colors.primary} />
                                            <Text>{member.name}</Text>
                                        </Pressable>
                                        )
                                    })}
                                    <Pressable
                                        style={commonStyle.btn2}
                                        onPress={() => setShowParticipants(false)}
                                    >
                                        <Text style={commonStyle.btn2Text}>Done</Text>
                                    </Pressable>
                                </View>
                            </Pressable>
                        </Modal>
                    </View>

                        
                </ScrollView>
                <View style={commonStyle.footer}>
                    {hasRemovedMembers && (
                        <Text style={styles.editWarning}>
                            *Amount, paid by, split type and participants can't be changed, and this expense can't be deleted because it involves a removed member.
                        </Text>
                    )}
                    <Pressable disabled={loading} style={commonStyle.btn} onPress={handleSaveExpense} >
                        <Text style={commonStyle.btnText}>{isEditing ? "Save changes" : "Add expense"}</Text>
                    </Pressable>

                    {isEditing && (
                        <View style={[styles.dangerZone, hasRemovedMembers && {opacity: 0.5}]}>
                            <Pressable disabled={loading || hasRemovedMembers} style={styles.dangerBtn} onPress={confirmDelete} >
                                <Text style={styles.dangerBtnTxt}>Delete expense</Text>
                            </Pressable>
                        </View>
                    )}
                </View>
                
            </View>
        </TouchableWithoutFeedback>
    )
}

const styles = StyleSheet.create({
    bodyParticipants: {
        backgroundColor: 'transparent',
        marginBottom: sp[1],
        height: 40,
        // paddingHorizontal: sp[1],
        // paddingTop: sp[1]
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        paddingHorizontal: sp[1],
        flexDirection: 'row',
        alignItems: 'center',
        gap: sp['half'],
        // justifyContent: "center",
        // paddingVertical: sp[1],
    },
    textInput: {
        fontSize: 16,
        color: colors.text,
    },
    cardParticipant: {
        flexDirection: 'row',
        paddingHorizontal: sp[2],
        paddingVertical: sp['half'],
        alignItems: 'center',
        // marginBottom: sp[1],
        // backgroundColor: colors['accent']
        gap: sp['half']
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: sp['half'],
    },
    col: {
        flex: 1,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        justifyContent: "center",
        paddingHorizontal: sp[2],
    },
    modal: {
        backgroundColor: colors.surface,
        borderRadius: 20,
        paddingVertical: sp[2],
        maxHeight: "60%",
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: "700",
        color: colors.text,
        paddingHorizontal: sp[2],
        marginBottom: sp[1],
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
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: colors.textMuted,
        alignSelf: 'center',
        marginTop: 8,
        marginBottom: 16,
    },
    editWarning: {
        fontSize: 13,
        color: colors.textMuted,
        marginBottom: sp.half,
        lineHeight: 18,
    },
});
import { createExpense, updateExpense } from "@/src/api/api";
import AppInput from "@/src/components/AppInput";
import DateInput from "@/src/components/DateInput";
import Loader from '@/src/components/Loader';
import SelectInput from "@/src/components/SelectInput";
import { currencies, sp } from '@/src/constants/constants';
import { useGroup } from "@/src/context/GroupContext";
import { useTheme } from '@/src/context/ThemeContext';
import { createCommonStyle } from "@/src/styles/common";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Alert, Platform, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { deleteExpense } from "../../../src/api/api";
import AdaptiveSheet from "../../../src/components/AdaptiveSheet";
import OptionSelector from "../../../src/components/OptionSelector";
import { fmtNum, lightColor } from "../../../src/utils/utils";


export default function NewExpense() {
    const { colors } = useTheme();
    const commonStyle = createCommonStyle(colors);
    const styles = createStyles(colors);
    const { allMembers, members, expenses, loading, currentMember, setLoading, refreshGroup } = useGroup();
    const { groupId, expenseId } = useLocalSearchParams();
    const isEditing = !!expenseId;
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
        paidBy: []
    });
    const splitTypeOptions = [
        { label: 'equal', value: 'equal', onPress: () => updExpense('split_type', 'equal') , selected: newExpense.split_type === 'equal'},
        { label: 'custom', value: 'custom', onPress: () => updExpense('split_type', 'custom') , selected: newExpense.split_type === 'custom' },
    ];
    // all id of removed members
    const removedIds = allMembers.filter(x => !x.is_active).map(x => x.id);
    // flag 
    const hasRemovedMembers = removedIds.includes(newExpense.paid_by_member_id) || newExpense.participants.some(x => removedIds.includes(x.memberId));
    // to view everything correct even though there are removed members
    const participantMembers = hasRemovedMembers ? allMembers : members;

    const updExpense = (field, val) => {
        setNewExpense((prev) => {
            if (field === 'split_type' && val === 'custom') {
                const totalAmount = Number(String(prev.amount).replace(',', '.') || 0);
                const equalAmount = prev.participants.length > 0 ? totalAmount / prev.participants.length : 0;
                return {...prev, split_type: 'custom', participants: prev.participants.map((part) => ({...part, share_amount: equalAmount.toString()}))};
            }
            
            return { ...prev, [field]: val };
        });
    };

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
        if (!isEditing) updExpense('participants', members.map(m => ({ memberId: m.id, share_amount: '' })));
        // if (isEditing) updExpense('participants', allMembers.filter(m => newExpense?.expense_participants?.some(x => x.member?.id === m.id)).map(m => ({ memberId: m.id })));
    }, [allMembers, members, isEditing, hasRemovedMembers]);

    useEffect(() => {
        if (!expenseId) return;
        const exp = expenses.find(x => x.id === expenseId);
        if (!exp) return;
        // setNewExpense(exp);
        setNewExpense({
            ...exp,
            expense_date: new Date(exp.expense_date),
            amount: exp.amount.toString(),
            participants: exp.expense_participants.map(p => ({
                memberId: p.member.id,
                share_amount: p.share_amount,
            })),
        });
    }, [expenseId, expenses]);

    const handleSaveExpense = async function () {
        if (loading) return;
        setLoading(true);
        try {
            const amount = Number(newExpense.amount.replace(',', '.'));
            if (!Number.isFinite(amount) || amount <= 0) throw new Error('Invalid amount');
            if (newExpense.split_type === 'custom') {
                const total = Number(String(amount).replace(',', '.')) || 0;
                let totalAssigned = 0;
                newExpense.participants?.forEach(x => totalAssigned += Number(x.share_amount) || 0);
                const isok = Number(totalAssigned.toFixed(2)) === Number(total.toFixed(2));
                if (!isok) throw new Error('Participants amount does not match expense amount');
            }
            const participantsData = newExpense.participants.map((part) => {
                const shareAmount = Number(part.share_amount);
                if (!Number.isFinite(shareAmount) || shareAmount <= 0) throw new Error('Invalid amount for one or more participants');
                return {...part, share_amount: shareAmount};
            })
            const expenseData = { ...newExpense, amount, participants: participantsData };
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
                participants: isExisting ? prev.participants.filter(x => x.memberId !== mid) : [...prev.participants, { memberId: mid, share_amount: '' }]
            }
        })
    }

    const updateParticipantAmount = (memberId, share_amount) => {
        setNewExpense(prev => ({
            ...prev,
            participants: prev.participants.map(participant =>
                participant.memberId === memberId
                    ? { ...participant, share_amount }
                    : participant
            ),
        }));
    };
    
    return (
        <TouchableWithoutFeedback >
            <View style={commonStyle.container}>
                {loading && <Loader overlay />}
                <View style={commonStyle.header}>
                    {Platform.OS === 'web' && 
                        <Pressable style={commonStyle.headerBack} onPress={() => router.back()}>
                            <Ionicons name="chevron-back" size={20} color={colors.primary} />
                        </Pressable>
                    }
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
                                suffix={currencies[groupId.currency]}
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

                    <OptionSelector options={splitTypeOptions} />
                    {newExpense.split_type === 'custom' && 
                        <CustomSplitSummary amount={newExpense.amount} participants={newExpense.participants} />
                    }
                    <View style={styles.bodyParticipants}>
                        {participantMembers.map((member) => {
                                const part = newExpense.participants?.find(p => p.memberId === member.id);
                                const selected = !!part;
                                const totalAmount = Number(newExpense.amount.replace(',', '.')) || 0;
                                const equalAmount = newExpense.participants.length > 0 ? totalAmount / newExpense.participants.length : 0;

                                return (
                                    <View style={styles.cardParticipant} key={member.id}>
                                        <Pressable style={[commonStyle.rowBasic, { gap: 6 }]} onPress={() => !hasRemovedMembers && toggleParticipant(member.id)}>
                                            <Ionicons name={selected ? "checkbox" : "square-outline"} size={24} color={hasRemovedMembers ? lightColor(colors.primary) : colors.primary} />
                                            <Text style={styles.participantName}>{member.name}</Text>
                                        </Pressable>
                                        {selected ? (
                                            <EditableAmount
                                                value={
                                                    newExpense.split_type === 'equal'
                                                        ? equalAmount
                                                        : Number(part.share_amount) || 0
                                                }
                                                editable={
                                                    newExpense.split_type === 'custom' &&
                                                    !hasRemovedMembers
                                                }
                                                onChange={(value) => updateParticipantAmount(member.id, value)}
                                                label={member.name +' amount'}
                                            />
                                        ) : (
                                            <Text style={styles.amount}>-</Text>
                                        )}
                                    </View>
                                )
                            }
                        )}
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

function EditableAmount({ value, editable = false, suffix = '€', onChange, label }) {
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const commonStyle = createCommonStyle(colors);
    const sheetRef = useRef(null);
    const [text, setText] = useState(value?.toString() ?? '')

    return (
        <>
            <Pressable 
                style={{paddingLeft: 4, paddingVertical: 4}}
                disabled={!editable}
                onPress={() => { setText(value?.toString() ?? ''); sheetRef.current?.present(); }}
            >
                <Text style={styles.amount}>{suffix} {fmtNum(value || 0)}</Text>
            </Pressable>
        
            {editable && 
                <AdaptiveSheet ref={sheetRef} forceModal>
                    <View>
                        <Text style={commonStyle.label}>{label || ''}</Text>
                        <AppInput
                            value={text}
                            onChangeText={setText}
                            keyboardType="decimal-pad" 
                            selectTextOnFocus
                            onBlur={() => { onChange(text); sheetRef.current?.dismiss(); }}
                            suffix={suffix}
                        />
                        <Pressable style={commonStyle.btn2} onPress={() => { onChange(text); sheetRef.current?.dismiss(); }}>
                            <Text style={commonStyle.btn2Text}>Done</Text>
                        </Pressable>
                    </View>
                </AdaptiveSheet>
            }
        </>
    );
}

function CustomSplitSummary({ amount, participants }) {
    const total = Number(String(amount).replace(',', '.')) || 0;
    const { colors } = useTheme();
    const styles = createStyles(colors);
    const commonStyle = createCommonStyle(colors);
    const { group } = useGroup();
    const currency = currencies[group.currency];
    
    let totalAssigned = 0;
    participants?.forEach(x => totalAssigned += Number(x.share_amount) || 0);

    const isok = Number(totalAssigned.toFixed(2)) === Number(total.toFixed(2)); 
    const pendent = Number(total) - Number(totalAssigned); 

    return (
        <View style={styles.splitSummary}>
            <Text style={styles.amount}>Total assigned</Text>
            {pendent !== 0 && 
                <View>
                    <Text style={{color: colors.danger}}>Error: {Number(pendent) < 0 ? ('+'+currency+' '+Math.abs(pendent).toFixed(2)) : ('-'+currency+' '+Math.abs(pendent).toFixed(2))}</Text>
                </View>
            }
            <View style={[commonStyle.rowBasic, {gap: sp.half}]}>
                <Text style={styles.amount}>{currency} {fmtNum(totalAssigned)} / {currency} {fmtNum(amount)}</Text>
                <Ionicons name={isok ? "checkmark-circle-outline" : "alert-circle-outline"} size={20} color={isok ? colors.positive : colors.danger} />
            </View>
        </View>
    )
}

const createStyles = (colors) => StyleSheet.create({
    bodyParticipants: {
        backgroundColor: 'transparent',
        marginVertical: sp.half,
        paddingHorizontal: sp.half,
    },
    participantName: {
        color: colors.text,
    },
    textInput: {
        fontSize: 16,
        color: colors.text,
    },
    cardParticipant: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: sp.half,
        alignItems: 'center',
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
        overflow: "hidden",
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
    amount: {
        color: colors.text,
    },
    sheet: {
        padding: sp[1],
        flex: 1,
        justifyContent: 'space-between',
    },
    splitSummary: {
        marginTop: sp[1],
        borderBottomColor: colors.border,
        borderBottomWidth: 1,
        paddingBottom: sp[1],
        paddingHorizontal: sp.half,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});
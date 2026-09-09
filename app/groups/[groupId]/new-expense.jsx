import { createExpense } from "@/src/api/api";
import DateInput from "@/src/components/DateInput";
import SelectInput from "@/src/components/SelectInput";
import { colors, sp } from '@/src/constants/constants';
import { commonStyle } from "@/src/styles/common";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, Modal, Pressable, ScrollView, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { useGroup } from "../../../backend/src/context/GroupContext";
import { updateExpense } from "../../../src/api/api";
import AppInput from "../../../src/components/AppInput";



export default function NewExpense() {
    const { members } = useGroup();
    const { groupId, expenseId } = useLocalSearchParams();
    const isEditing = !!expenseId;
    const [showParticipants, setShowParticipants] = useState(false);
    const [newExpense, setNewExpense] = useState({
        description: "",
        amount: "",
        category: "",
        expense_date: new Date(),
        paid_by: "",
        split_type: "equal",
        participants: [],
    });
    const [options, setOptions] = useState({
        categories: [
            { label: 'Generic', value: 'Generic' },
            { label: 'Food', value: 'Food' },
            { label: 'Home', value: 'Home' },
        ],
        splitType: [
            { label: 'equal', value: 'equal' },
            { label: 'custom', value: 'custom' },
        ],
        paidBy: []
    });
    const updExpense = (field, val) => {
        setNewExpense((prev) => ({ ...prev, [field]: val }));
    }

    useEffect(() => {
        if (!members) return;

        setOptions(prev => ({
            ...prev,
            paidBy: members.map(member => ({
                label: member.name,
                value: member.id,
            })),
        }));

        // automatically all members are selected
        updExpense('participants', members.map(m => ({ memberId: m.id })));
    }, [members]);

    const handleSaveExpense = async function () {
        // console.log("expense:", expense);
        if (isEditing) {
            const res = await updateExpense(expenseId, newExpense);
            console.log(res);
            if (res?.expense) router.back();
        } else {
            const res = await createExpense(groupId, newExpense);
            console.log(res);
            // if (res?.expense) router.replace(`/groups/${groupId}/expenses`);
            if (res?.expense) router.back();
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
                <View style={commonStyle.header}>
                    <Text style={commonStyle.title}>{isEditing ? expenseId.description : 'Add expense'}</Text>
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
                        value={newExpense.paid_by}
                        options={options.paidBy}
                        onChange={(value) => updExpense('paid_by', value)}
                    />

                    <SelectInput
                        label='Split type'
                        value={newExpense.split_type}
                        options={options.splitType}
                        onChange={(value) => updExpense('split_type', value)}
                    />

                    {/* <View style={styles.bodyParticipants}>
                    <Text style={commonStyle.label}>Split between:</Text>
                    {members.map((member) => {
                        const selected = newExpense.participants.some(p => p.memberId === member.id);
                        return (<Pressable style={styles.cardParticipant} key={member.id} onPress={() => toggleParticipant(member.id)}>
                                <Ionicons name={selected ? "checkbox" : "square-outline"} size={24} color={colors['accent']} />
                                <Text>{member.name}</Text>
                            </Pressable>
                        )
                    })}
                </View> */}

                    <Text style={commonStyle.label}>Split between</Text>
                    <View style={styles.bodyParticipants}>
                        <Pressable onPress={() => setShowParticipants(true)}>
                            <Text style={styles.textInput}>
                                <Ionicons
                                    name="people-outline"
                                    size={20}
                                    color={colors.textSecondary}
                                />
                                {newExpense.participants.length === members.length
                                    ? ' All members'
                                    : ' '+newExpense.participants.length+'/'+members.length+' members'}
                            </Text>
                        </Pressable>
                        {/* <Ionicons name='pencil' size={20} color={colors.textSecondary} /> */}

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
                                    <Text style={styles.modalTitle}>Split between</Text>
                                    {members.map((member) => {
                                        const selected = newExpense.participants.some(p => p.memberId === member.id);
                                        return (<Pressable style={styles.cardParticipant} key={member.id} onPress={() => toggleParticipant(member.id)}>
                                            <Ionicons name={selected ? "checkbox" : "square-outline"} size={24} color={colors['accent']} />
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



                    <Pressable style={commonStyle.btn} onPress={handleSaveExpense} >
                        <Text style={commonStyle.btnText}>{isEditing ? "Save changes" : "Add expense"}</Text>
                    </Pressable>
                </ScrollView>
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
});
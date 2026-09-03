import { createExpense } from "@/src/api/groups";
import DateInput from "@/src/components/DateInput";
import SelectInput from "@/src/components/SelectInput";
import { colors } from '@/src/constants/colors';
import { sp } from '@/src/constants/spacing';
import { commonStyle } from "@/src/styles/common";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { useGroup } from "../../../backend/src/context/GroupContext";



export default function NewExpense() {
    const {members} = useGroup();
    const {groupId, expenseId} = useLocalSearchParams();
    const isEditing = !! expenseId;
    const [newExpense, setNewExpense] = useState({
        description: "",
        amount: "",
        category: "",
        expense_date: new Date(),
        paid_by: "",
        split_type: "equal",
        participants: [],
    });
    const [options, setOptions]= useState({
        categories: [
            { label: 'Generic', value: 'Generic'},
            { label: 'Food', value: 'Food'},
            { label: 'Home', value: 'Home'},
        ],
        splitType: [
            { label: 'equal', value: 'equal'},
            { label: 'custom', value: 'custom'},
        ],
        paidBy: []
    });
    const updateExpense = (field, val) => {
        setNewExpense((prev) => ({...prev, [field]: val}));
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
    }, [members]);

    const handleSaveExpense = async function () {
        // console.log("expense:", expense);
console.log("paidBy:", newExpense.paid_by);
console.log("participants:", newExpense.participants);
newExpense.participants = newExpense.participants.map(item => {memberId: item});
        if (isEditing) await updateExpense(expenseId, newExpense); else await createExpense(groupId, newExpense);
    }
    const toggleParticipant = function (mid) {
        setNewExpense((prev) => {
            const isExisting = prev.participants.some(p => p.memberId === mid);

            return {...prev,
                participants: isExisting ? prev.participants.filter(x => x.memberId !== mid) : [...prev.participants, {memberId: mid}]
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
            <ScrollView style={[commonStyle.body,{flex:1}]}>
                <Text style={commonStyle.label}>Description</Text>
                <TextInput
                    style={commonStyle.input}
                    placeholder='Description'
                    value={newExpense.description}
                    onChangeText={(value) => updateExpense('description', value)}
                />
                
                <Text style={commonStyle.label}>Amount</Text>
                <TextInput
                    style={commonStyle.input}
                    keyboardType="decimal-pad"
                    placeholder='Amount'
                    value={newExpense.amount}
                    onChangeText={(value) => updateExpense('amount', value)}
                />

                <SelectInput 
                    label='Category'
                    value={newExpense.category}
                    options={options.categories}
                    onChange={(value) => updateExpense('category', value)}
                />

                <SelectInput 
                    label='Paid by'
                    value={newExpense.paid_by}
                    options={options.paidBy}
                    onChange={(value) => updateExpense('paid_by', value)}
                />

                <SelectInput 
                    label='Split type'
                    value={newExpense.split_type}
                    options={options.splitType}
                    onChange={(value) => updateExpense('split_type', value)}
                />

                <View style={styles.bodyParticipants}>
                    {members.map((member) => {
                        const selected = newExpense.participants.some(p => p.memberId === member.id);
                        return (<Pressable style={styles.cardParticipant} key={member.id} onPress={() => toggleParticipant(member.id)}>
                                <Text>{member.name}</Text>
                                <Text>{selected ? 'V' : ''}</Text>
                            </Pressable>
                        )
                    })}
                </View>

                <DateInput 
                    label='Date'
                    value={newExpense.expense_date}
                />

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
        backgroundColor: 'red',
        // paddingHorizontal: sp[1],
        paddingTop: sp[1]
    },
    cardParticipant: {
        flexDirection: 'row',
        paddingHorizontal: sp[1],
        marginBottom: sp[1],
        backgroundColor: colors['accent']
    }
});
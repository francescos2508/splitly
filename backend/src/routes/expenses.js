const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

router.post('/', async (req, res) => {
    const { 
        groupId,
        paidByMemberId,
        description,
        amount,
        splitType,
        participants,
    } = req.body;

    if (!groupId || !paidByMemberId || ! description || !amount || !participants) {
        return res.status(400).json({
            error: 'Missing required fields'
        });
    }

    try {
        // altri controlli
        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be higher than 0' })
        }
        if (participants.length <= 0) {
            return res.status(400).json({ error: 'At least one participant is required' })
        }

        // no participant duplicates
        const checkDuplicates = new Set(participants.map(item => item.memberId));
        if (checkDuplicates.size !== participants.length) {
            return res.status(400).json({ error: 'Duplicate participants are not allowed è'})
        }
        // check gruppo esiste
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('id')
            .eq('id', groupId)
            .single();

        if (groupError || !group) {
            return res.status(404).json({
                error: 'Group not found'
            })
        }

        // check chi paga sta nel gruppo
        const { data: payer, error: payerError } = await supabase
            .from('group_members')
            .select('id')
            .eq('id', paidByMemberId)
            .eq('group_id', groupId)
            .single();

        if (payerError || !payer) {
            return res.status(400).json({
                error: 'Payer is not a member of this group'
            })
        }

        // check partecipanti della spesa sono tutti membri del gruppo
        const participantIds = participants.map( item => item.memberId);
        const {data: members, error: membersError} = await supabase
            .from('group_members')
            .select('id')
            .eq('group_id', groupId)
            .in('id', participantIds);
        
        if (membersError) throw membersError;

        if (members.length !== participants.length) {
            return res.status(400).json({
                error: 'Not all the participants of the expense are member of the group'
            })
        }

        let expenseParticipants = [];

        // equal
        if (splitType === 'equal') {
            const share = Number((amount / participants.length).toFixed(2));

            expenseParticipants = participants.map(item => ({
                member_id: item.memberId,
                share_amount: share
            }));
        } else if (splitType === 'custom') {
            expenseParticipants = participants.map(item => ({
                member_id: item.memberId,
                share_amount: item.shareAmount
            }));

            const total = expenseParticipants.reduce( (sum, item) => sum + Number(item.share_amount), 0);

            if (Number(total.toFixed(2)) !== Number(amount)) {
                return res.status(400).json({
                    error: 'Participants amount does not match expense amount'
                })
            }
        }  else {
            return res.status(400).json({
                error: "Invalid split type",
            });
        }

        // crea expense
        const {data: expense, error: expenseError} = await supabase
            .from('expenses')
            .insert({
                group_id: groupId,
                paid_by_member_id: paidByMemberId,
                description: description,
                amount: amount,
                split_type: splitType
            })
            .select()
            .single();

        if (expenseError) throw expenseError;

        const {error: participantsError} = await supabase
            .from('expense_participants')
            .insert(expenseParticipants.map(item => ({expense_id: expense.id, ...item})));

        if (participantsError) throw participantsError;


        res.status(201).json({
            expense,
            participants: expenseParticipants,
        });

        const {data: activityLog, error: activityError } = await supabase
            .from("activity_log")
            .insert({
                group_id: groupId,
                member_id: paidByMemberId,
                event_type: "expense_created",
                entity_type: "expense",
                entity_id: expense.id,
                description: `${description} (€${amount}) created`,
            });

        if (activityError) throw activityError;

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Internal server error",
        });
    }
});

router.patch('/:expenseId', async (req, res) => {
    const { expenseId } = req.params;

    const {
        description,
        amount,
        category,
        paidByMemberId,
        splitType,
        participants
    } = req.body;

    try {
        // altri controlli
        if (amount <= 0) {
            return res.status(400).json({ error: 'Amount must be higher than 0' })
        }
        if (participants.length <= 0) {
            return res.status(400).json({ error: 'At least one participant is required' })
        }

        const { data: expense, error: expenseError } = await supabase
            .from("expenses")
            .select("*")
            .eq("id", expenseId)
            .single();

        if (expenseError || !expense) {
            return res.status(404).json({
                error: "Expense not found"
            });
        }

        // members del gruppo
        const { data: members, error: membersError } = await supabase
            .from("group_members")
            .select("id")
            .eq("group_id", expense.group_id);

        if (membersError) throw membersError;

        // payer è nel gruppo
        const memberIds = members.map(m => m.id);

        if (!memberIds.includes(paidByMemberId)) {
            return res.status(400).json({
                error: "Payer is not part of the group"
            });
        }

        // partecipanti della spesa tutti nel gruppo
        const participantIds = participants.map(p => p.memberId);

        const allParticipantsValid = participantIds.every(id =>
            memberIds.includes(id)
        );
        if (!allParticipantsValid) {
            return res.status(400).json({
                error: "Not all participants belong to the group"
            });
        }

        let expenseParticipants = [];

        // equal
        if (splitType === 'equal') {
            const share = Number((amount / participants.length).toFixed(2));

            expenseParticipants = participants.map(item => ({
                member_id: item.memberId,
                share_amount: share
            }));
        } else if (splitType === 'custom') {
            expenseParticipants = participants.map(item => ({
                member_id: item.memberId,
                share_amount: item.shareAmount
            }));

            const total = expenseParticipants.reduce( (sum, item) => sum + Number(item.share_amount), 0);

            if (Number(total.toFixed(2)) !== Number(amount)) {
                return res.status(400).json({
                    error: 'Participants amount does not match expense amount'
                })
            }
        }  else {
            return res.status(400).json({
                error: "Invalid split type",
            });
        }

        // modifica expense
        const {data: newExpense, error: newExpenseError }= await supabase
            .from("expenses")
            .update({
                description,
                amount,
                category,
                paid_by_member_id: paidByMemberId,
                split_type: splitType,
                updated_at: new Date().toISOString()
            })
            .eq("id", expenseId)
            .select()
            .single();

        if (newExpenseError) throw newExpenseError;

        // cancello vecchi expense_participants
        const {error: deleteError} = await supabase
            .from('expense_participants')
            .delete()
            .eq('expense_id', expenseId);

        if (deleteError) throw deleteError;

        expenseParticipants = expenseParticipants.map(item => ({
            ...item,
            expense_id: expenseId
        }));

        const { error: participantsError } = await supabase
            .from("expense_participants")
            .insert(expenseParticipants);

        if (participantsError) throw participantsError;

        // activity log
        const { error: activityError } = await supabase
            .from("activity_log")
            .insert({
                group_id: expense.group_id,
                member_id: paidByMemberId,
                event_type: "expense_updated",
                entity_type: "expense",
                entity_id: expenseId,
                description: `Expense "${description}" updated`
            });

        if (activityError) throw activityError;

        return res.json(newExpense);
    } catch(error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.delete('/:expenseId', async (req, res) => {
    const { expenseId } = req.params;

    try {
        // recuperiamo expense
        const {data: expense, error: expenseError} = await supabase
            .from('expenses')
            .select('*')
            .eq('id', expenseId)
            .single();

        if (expenseError || !expense) {
            return res.status(404).json({
                error: "Expense not found"
            });
        }

        // cancelliamo expense
        const { error: deleteError } = await supabase
            .from("expenses")
            .delete()
            .eq("id", expenseId);

        if (deleteError) throw deleteError;

        // activity log
        const { error: activityError } = await supabase
            .from("activity_log")
            .insert({
                group_id: expense.group_id,
                member_id: expense.paid_by_member_id,
                event_type: "expense_deleted",
                entity_type: "expense",
                entity_id: expenseId,
                description: `Expense "${expense.description}" deleted`
            });

        if (activityError) throw activityError;

        return res.json({
            message: "Expense deleted successfully"
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});
module.exports = router;
const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const { authenticateMember } = require("../middleware/authenticateMember");
const { authorizeGroup, getMemberOfGroup } = require("../middleware/authorizeGroup");
const { calculateExpenseParticipants } = require("../utils/utils");


router.use(authenticateMember);

router.post('/', authorizeGroup, async (req, res) => {
    const { 
        groupId,
        paidByMemberId,
        description,
        amount,
        category,
        splitType,
        participants,
        expense_date
    } = req.body;

    if (!groupId || !paidByMemberId || !description || !amount || !participants || !expense_date) {
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
            return res.status(400).json({ error: 'Duplicate participants are not allowed'})
        }
        // check gruppo esiste
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('id')
            .eq('id', groupId)
            .eq('is_active', true)
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
            .eq('is_active', true)
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
            .eq('is_active', true)
            .in('id', participantIds);
        
        if (membersError) throw membersError;

        if (members.length !== participants.length) {
            return res.status(400).json({
                error: 'Not all the participants of the expense are member of the group'
            })
        }

        let expenseParticipants;
        try {
            expenseParticipants = calculateExpenseParticipants(amount, splitType, participants);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        // uniform date
        const fmtDate = new Date(expense_date).toLocaleDateString('en-CA');
        // crea expense
        const {data: expense, error: expenseError} = await supabase
            .from('expenses')
            .insert({
                group_id: groupId,
                paid_by_member_id: paidByMemberId,
                description: description,
                category: category,
                amount: amount,
                split_type: splitType,
                expense_date: fmtDate,
            })
            .select()
            .single();

        if (expenseError) throw expenseError;

        const {error: participantsError} = await supabase
            .from('expense_participants')
            .insert(expenseParticipants.map(item => ({expense_id: expense.id, ...item})));

        if (participantsError) throw participantsError;

        const { error: activityError } = await supabase
            .from("activity_log")
            .insert({
                group_id: groupId,
                actor_id: req.member.id,
                event_type: "expense_created",
                entity_type: "expense",
                entity_id: expense.id,
                description: `Expense ${description} (€${amount}) created`,
            });

        if (activityError) throw activityError;

        
        res.status(201).json({
            expense,
            participants: expenseParticipants,
        });

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
        participants,
        expense_date,
    } = req.body;

    try {
        // check consistent data passed by client
        if (!description || !amount || !paidByMemberId || !splitType || !participants || !expense_date) {
            return res.status(400).json({
                error: 'Missing required fields'
            });
        }

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
            return res.status(400).json({ error: 'Duplicate participants are not allowed'})
        }

        const { data: expense, error: expenseError } = await supabase
            .from("expenses")
            .select("*")
            .eq("id", expenseId)
            .eq('is_active', true)
            .single();

        if (expenseError || !expense) {
            return res.status(404).json({
                error: "Expense not found"
            });
        }

        const member = await getMemberOfGroup(req.member_token, expense.group_id);
        if (!member) {
            return res.status(403).json({
                error: "You are not a member of this group"
            });
        }
        req.member = member;


        // members del gruppo
        const { data: members, error: membersError } = await supabase
            .from("group_members")
            .select("id")
            .eq('is_active', true)
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

        let expenseParticipants;
        try {
            expenseParticipants = calculateExpenseParticipants(amount, splitType, participants);
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }

        // uniform date
        const fmtDate = new Date(expense_date).toLocaleDateString('en-CA');
        // modifica expense
        const {data: newExpense, error: newExpenseError }= await supabase
            .from("expenses")
            .update({
                description,
                amount,
                category,
                paid_by_member_id: paidByMemberId,
                split_type: splitType,
                expense_date: fmtDate,
                updated_at: new Date().toISOString()
            })
            .eq("id", expenseId)
            .eq('is_active', true)
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

        // inserisco nuovi expense_participants
        const { error: participantsError } = await supabase
            .from("expense_participants")
            .insert(expenseParticipants);

        if (participantsError) throw participantsError;

        // activity log
        const { error: activityError } = await supabase
            .from("activity_log")
            .insert({
                group_id: expense.group_id,
                actor_id: req.member.id,
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

router.patch('/:expenseId/remove', async (req, res) => {
    const { expenseId } = req.params;

    try {
        // recuperiamo expense
        const {data: expense, error: expenseError} = await supabase
            .from('expenses')
            .select('*')
            .eq('id', expenseId)
            .eq('is_active', true)
            .single();

        if (expenseError || !expense) {
            return res.status(404).json({
                error: "Expense not found"
            });
        }

        const member = await getMemberOfGroup(req.member_token, expense.group_id);
        if (!member) {
            return res.status(403).json({
                error: "You are not a member of this group"
            });
        }
        req.member = member;

        // cancelliamo expense
        const { error: deleteError } = await supabase
            .from("expenses")
            .update({ is_active: false })
            .eq("id", expenseId)
            .eq("is_active", true);

        if (deleteError) throw deleteError;

        // activity log
        const { error: activityError } = await supabase
            .from("activity_log")
            .insert({
                group_id: expense.group_id,
                actor_id: req.member.id,
                event_type: "expense_deleted",
                entity_type: "expense",
                entity_id: expenseId,
                description: `Expense "${expense.description}" deleted`
            });

        if (activityError) throw activityError;

        return res.status(200).json({
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
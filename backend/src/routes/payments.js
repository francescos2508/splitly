const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

router.post('/', async (req, res) => {
    const {
        groupId,
        fromMemberId,
        toMemberId,
        amount,
        note
    } = req.body;

    try {
        if (!groupId || !fromMemberId || !toMemberId || amount == null) {
            return res.status(400).json({
                error: "Missing required fields"
            });
        }

        if (fromMemberId === toMemberId) {
            return res.status(400).json({ error: 'Payment from and to the same member' })
        }

        if (amount <= 0) return res.status(400).json({ error: 'Amount must be higher than 0' });

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

        // check membri appartengono al gruppo
        const { data: members, error: membersError } = await supabase
            .from('group_members')
            .select('id, name')
            .eq('group_id', groupId)
            .in('id', [fromMemberId, toMemberId]);

        if (membersError) throw membersError;
        if (members.length !== 2 ) {
            return res.status(400).json({ error: 'One or more members not found' });
        }

        const fromMemberName = members.find(x => x.id === fromMemberId).name;
        const toMemberName = members.find(x => x.id === toMemberId).name;

        // pagamento
        const { data: payment, error: paymentError } = await supabase
            .from('payments')
            .insert({
                group_id: groupId,
                from_member_id: fromMemberId,
                to_member_id: toMemberId,
                note: note,
                amount: amount,
            })
            .select()
            .single();

        if (paymentError) throw paymentError;

        // activity log
        const { data: activityLog, error: activityError } = await supabase
            .from("activity_log")
            .insert({
                group_id: groupId,
                member_id: fromMemberId,
                event_type: "payment_created",
                entity_type: "payment",
                entity_id: payment.id,
                description: `${fromMemberName} paid €${amount} to ${toMemberName}`,
            });

        if (activityError) throw activityError;

        return res.status(201).json(payment);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
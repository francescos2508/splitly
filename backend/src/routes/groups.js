const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

const {
    generateInviteCode,
    generateMemberToken,
    generateRecoveryCode,
} = require("../utils/generateCode");

const generateAvatarColor = () => { return '#000000' }

router.post("/", async (req, res) => {
    const {groupName} = req.body;
    let {userName} = req.body;
    try {
        // check memberToken
        const authHeader = req.headers.authorization;
        let memberToken = null, recoveryCode = null;

        if (authHeader && authHeader.startsWith('Bearer ')) memberToken = authHeader.split(' ')[1];
        console.log(memberToken);
        if (memberToken) {
            const { data: existingMember, error: memberError } = await supabase
                .from('group_members')
                .select('member_token, name, recovery_code')
                .eq('member_token', memberToken)
                .limit(1)
                .maybeSingle();

            if (memberError) throw memberError;
            if (!existingMember) {
                return res.status(401).json({
                    error: "Invalid member token"
                });
            }
            recoveryCode = existingMember.recovery_code;
            userName = existingMember.name;
        }

        if (!memberToken) memberToken = generateMemberToken();
        if (!recoveryCode) recoveryCode = generateRecoveryCode();

        if (!groupName || !userName) {
            return res.status(400).json({
                error: "groupName and userName are required",
            });
        }

        let inviteCode;
        let exists = true;

        while (exists) {
            inviteCode = generateInviteCode();

            const { data } = await supabase
                .from("groups")
                .select("id")
                .eq("invite_code", inviteCode)
                .maybeSingle();

            exists = !!data;
        }

        // crea gruppo
        const { data: group, error: groupError } = await supabase
            .from("groups")
            .insert({
                name: groupName,
                invite_code: inviteCode,
            })
            .select()
            .single();

        if (groupError) throw groupError;


        // crea membro proprietario
        const { data: member, error: memberError } = await supabase
            .from("group_members")
            .insert({
                group_id: group.id,
                name: userName,
                member_token: memberToken,
                recovery_code: recoveryCode,
                is_owner: true,
                avatar_color: "#0044ff",
            })
            .select()
            .single();

        if (memberError) throw memberError;


        // log attività
        await supabase
            .from("activity_log")
            .insert({
                group_id: group.id,
                member_id: member.id,
                event_type: "group_created",
                entity_type: "group",
                entity_id: group.id,
                description: "Group created",
            });


        res.status(201).json({
            group,
            member,
        });


    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Internal server error",
        });
    }
});

// my groups
router.get("/me", async (req, res) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Missing authentication token",
            });
        }

        const memberToken = authHeader.split(" ")[1];
        if (memberToken.length < 1) return res.json([]);

        const { data: groupMembers, error: memberError } = await supabase
            .from("group_members")
            .select(`
                group_id,
                groups (
                    id,
                    name,
                    currency,
                    group_members (count)
                )
            `)
            .eq("member_token", memberToken)
            .eq("is_active", true);

        if (memberError) throw memberError;

        if (!groupMembers || groupMembers.length === 0) {
            return res.json([]);
        }

        const groups = groupMembers.map((g) => g.groups);

        return res.json(groups);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }
});

router.get('/:groupId', async (req, res) => {
    const { groupId } = req.params;

    try {
        const { data: group, error } = await supabase
            .from('groups')
            .select(`*, group_members (id, name, avatar_color)`)
            .eq('id', groupId)
            .single();
        if (error || !group) {
            return res.status(404).json({
                error: "Group not found",
            });
        }

        res.json(group);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Internal server error'
        })
    }
});

router.get('/:inviteCode', async (req, res) => {
    const { inviteCode } = req.params;

    try {
        const { data: group, error } = await supabase
            .from('groups')
            .select(`*, group_members (id, name, avatar_color)`)
            .eq('invite_code', inviteCode)
            .single();
        if (error || !group) {
            return res.status(404).json({
                error: "Group not found",
            });
        }

        res.json(group);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Internal server error'
        })
    }
});

router.post('/:inviteCode/join', async (req, res) => {
    const { inviteCode } = req.params;
    const { userName } = req.body;

    if (!userName) {
        return res.status(400).json({
            error: "userName is required",
        })
    }

    try {
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('*')
            .eq('invite_code', inviteCode)
            .single();

        if (groupError || !group) {
            return res.status(404).json({
                error: 'Group not found'
            });
        }

        // crea membro in group_members
        const { data: member, error: memberError } = await supabase
            .from('group_members')
            .insert({
                group_id: group.id,
                name: userName,
                member_token: generateMemberToken(),
                recovery_code: generateRecoveryCode(),
                avatar_color: generateAvatarColor()
            })
            .select()
            .single();

        if (memberError) {
            if (memberError.code === "23505") {
                return res.status(409).json({
                    error: "Member name already exists in this group",
                });
            }

            throw memberError;
        }

        // log activity
        await supabase
            .from("activity_log")
            .insert({
                group_id: group.id,
                member_id: member.id,
                event_type: "member_joined",
                entity_type: "member",
                entity_id: member.id,
                description: `${userName} joined the group`,
            });


        res.status(201).json({
            group,
            member,
        });
    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Internal server error",
        });
    }
});

router.get('/:groupId/expenses', async (req, res) => {
    const { groupId } = req.params;

    try {
        const { data: expenses, error: expensesError } = await supabase
            .from('expenses')
            .select(`
                *,
                payer: group_members!expenses_paid_by_member_id_fkey (
                    id, name, avatar_color
                ),  
                expense_participants ( 
                    share_amount, percentage, member: group_members (
                    id, name, avatar_color
                    )
                )`)
            .eq('group_id', groupId)
            .order('created_at', { ascending: false });

        if (expensesError) throw error;

        res.json(expenses);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Internal server error",
        });
    }
});

router.get('/:groupId/balances', async (req, res) => {
    const { groupId } = req.params;
    try {
        const { data: members, error: membersError } = await supabase
            .from('group_members')
            .select('*')
            .eq('group_id', groupId);

        if (membersError || members.length === 0) {
            return res.status(404).json({
                error: 'Members not found for the group ' + groupId
            })
        }

        const { data: expenses, error: expensesError } = await supabase
            .from('expenses')
            .select(`
            *,
            expense_participants (member_id, share_amount)`
            )
            .eq('group_id', groupId);

        if (expensesError) throw expensesError;

        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('group_id', groupId);

        if (paymentsError) throw paymentsError;

        const balances = new Map();
        members.forEach(m => { balances.set(m.id, 0) });

        for (let i = 0; i < expenses.length; i++) {
            let exp = expenses[i];
            let oldBalance = balances.get(exp.paid_by_member_id);
            balances.set(exp.paid_by_member_id, oldBalance + exp.amount);
            for (let j = 0; j < exp.expense_participants.length; j++) {
                let part = exp.expense_participants[j];
                let oldBalance = balances.get(part.member_id);
                balances.set(part.member_id, oldBalance - part.share_amount);
            }
        }

        for (let i = 0; i < payments.length; i++) {
            let paym = payments[i];
            let oldBalanceFrom = balances.get(paym.from_member_id);
            let oldBalanceTo = balances.get(paym.to_member_id);
            balances.set(paym.from_member_id, oldBalanceFrom + paym.amount);
            balances.set(paym.to_member_id, oldBalanceTo - paym.amount);
        }

        const result = members.map(member => ({
            id: member.id,
            name: member.name,
            avatar_color: member.avatar_color,
            balance: balances.get(member.id)
        }));

        res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
});

router.get('/:groupId/activity', async (req, res) => {
    const {groupId} = req.params;

    try {
        const {data: activity, error: activityError} = await supabase
            .from('activity_log')
            .select('*')
            .eq('group_id', groupId);

        if (activityError) throw activityError;

        res.json(activity);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
});

router.patch('/:groupId', async (req, res) => {
    const { groupId } = req.params;
    const {
        name,
        currency,
        // inviteCode,
    } = req.body;

    try {

        const { data: group, error: groupError } = await supabase
            .from('groups')
            .update({
                name,
                currency,
                // invite_code: inviteCode
            })
            .eq('id', groupId)
            .select()
            .single();

        if (groupError) {
            if (groupError.code === 'PGRST116') {
                return res.status(404).json({
                    error: "Group not found"
                });
            }

            throw groupError;
        }

        // activity log
        const { error: activityError } = await supabase
            .from("activity_log")
            .insert({
                group_id: group.id,
                // member_id: paidByMemberId,
                event_type: "group_updated",
                entity_type: "group",
                entity_id: groupId,
                description: `Group "${name}" updated`
            });

        if (activityError) throw activityError;

        return res.json(group);

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

router.patch('/:groupId/members/:memberId/leave', async (req, res) => {
    const { groupId, memberId } = req.params;

    try {
        // autorizzazione
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Missing authentication token"
            });
        }

        const memberToken = authHeader.split(" ")[1];

        //check memberToken
        const { data: currentMember, error: currentMemberError } = await supabase
            .from('group_members')
            .select('*')
            .eq('member_token', memberToken)
            .eq('group_id', groupId)
            .single();

        if (currentMemberError || !currentMember) {
            return res.status(401).json({
                error: "Invalid member token"
            });
        }

        if (currentMember.id !== memberId) {
            return res.status(403).json({
                error: "You are not allowed to leave as this member"
            });
        }

        if (currentMember.is_owner) {
            return res.status(400).json({
                error: "Group owner cannot leave the group"
            });
        }

        // verifica group esiste
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('id, name')
            .eq('id', groupId)
            .single();

        if (groupError || !group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        /*  // verifica membro del gruppo
         const {data: member, error: memberError} = await supabase
             .from('group_members')
             .select('*')
             .eq('id', memberId)
             .eq('group_id', groupId)
             .single();
 
         if (memberError || !member) {
             return res.status(404).json({error: 'Member is not part of the group'});
         }  */

        const { error: deleteError } = await supabase
            .from('group_members')
            .update({ is_active: false })
            .eq('group_id', groupId)
            .eq('id', memberId)
            .select()
            .single();

        if (deleteError) throw deleteError;

        // activity log
        const { error: activityError } = await supabase
            .from('activity_log')
            .insert({
                group_id: groupId,
                member_id: memberId,
                event_type: "member_left",
                entity_type: "member",
                entity_id: memberId,
                description: `Member ${currentMember.name} left the group ${group.name}`
            });

        if (activityError) throw activityError;

        return res.json({
            message: "Member left the group successfully"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }

});

router.patch('/:groupId/members/:memberId/remove', async (req, res) => {
    const { groupId, memberId } = req.params;

    try {
        // autorizzazione
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Missing authentication token"
            });
        }

        const memberToken = authHeader.split(" ")[1];

        //check memberToken
        const { data: currentMember, error: currentMemberError } = await supabase
            .from('group_members')
            .select('*')
            .eq('member_token', memberToken)
            .eq('group_id', groupId)
            .single();

        if (currentMemberError || !currentMember) {
            return res.status(401).json({
                error: "Invalid member token"
            });
        }

        if (!currentMember.is_owner) {
            return res.status(403).json({
                error: "You are not allowed to remove this member"
            });
        }

        if (currentMember.id === memberId) {
            return res.status(400).json({
                error: "Owner cannot remove themselves"
            });
        }

        // verifica group esiste
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('id, name')
            .eq('id', groupId)
            .single();

        if (groupError || !group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // verifica membro da elliminare fa parte del gruppo
        const { data: member, error: memberError } = await supabase
            .from('group_members')
            .select('id, name, is_owner')
            .eq('id', memberId)
            .eq('group_id', groupId)
            .single();

        if (memberError || !member) {
            return res.status(404).json({ error: 'Member is not part of the group' });
        }

        const { error: deleteError } = await supabase
            .from('group_members')
            .update({ is_active: false })
            .eq('group_id', groupId)
            .eq('id', memberId)
            .select()
            .single();

        if (deleteError) throw deleteError;

        // activity log
        const { error: activityError } = await supabase
            .from('activity_log')
            .insert({
                group_id: groupId,
                member_id: memberId,
                event_type: "member_deleted",
                entity_type: "member",
                entity_id: memberId,
                description: `${currentMember.name} removed ${member.name} from the group ${group.name}`
            });

        if (activityError) throw activityError;

        return res.json({
            message: "Member removed successfully from the group"
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }

});

// get member (me)
router.get('/:groupId/me', async (req, res) => {
    const {groupId} = req.params;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Missing authentication token"
        });
    }

    const memberToken = authHeader.split(" ")[1];
    try {
        const {data: member, error: memberError} = await supabase
            .from('group_members')
            .select('*')
            .eq('member_token', memberToken)
            .eq('group_id', groupId)
            .single();
        
        if (!member || memberError) {
            return res.status(404).json({error: 'Member not found'});
        }
        return res.status(200).json(member);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
})

// update member (me)
router.patch('/:groupId/me', async (req, res) => {
    const { groupId } = req.params;
    const { updatedName, updatedAvatar_color } = req.body;

    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            error: "Missing authentication token"
        });
    }

    const memberToken = authHeader.split(" ")[1];
    try {
        const { data: member, error: memberError } = await supabase
            .from('group_members')
            .select('*')
            .eq('member_token', memberToken)
            .eq('group_id', groupId)
            .single();

        if (!member || memberError) {
            return res.status(404).json({ error: 'Member not found' });
        }

        // update
        const { data: updatedMember, error: updatedMemberError } = await supabase
            .from('group_members')
            .update({ name: updatedName, avatar_color: updatedAvatar_color })
            .eq('id', member.id)
            .select()
            .single();

        if (updatedMemberError) {
            if (updatedMemberError.code === '23505') {
                return res.status(400).json({
                    error: "A member with this name already exists in the group"
                });
            }

            throw updatedMemberError;
        }

        // activity log
        const { error: activityError } = await supabase
            .from("activity_log")
            .insert({
                group_id: groupId,
                member_id: member.id,
                event_type: "member_updated",
                entity_type: "member",
                entity_id: member.id,
                description: `Member ${member.name} updated their profile`
            });

        if (activityError) throw activityError;

        return res.json(updatedMember);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

module.exports = router;
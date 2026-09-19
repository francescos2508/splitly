const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

const {
    generateInviteCode,
    generateMemberToken,
    generateRecoveryCode,
} = require("../utils/utils");

const { authenticateMember } = require("../middleware/authenticateMember");
const { authorizeGroup } = require("../middleware/authorizeGroup");
const { calculateBalance } = require('../utils/utils');
const AVATAR_COLORS = [
    '#2A9D8F',  // Teal
    '#9B5DE5',  // Purple
    '#F77F00',  // Orange
    '#F72585',  // Magenta
    '#118AB2',  // Ocean blue
    '#8AC926', // Lime
    '#FF595E', // Coral
    '#00B4D8', // Cyan
    '#FFCA3A', // Gold
    '#52B788', // Green

    // discarded ↓
    // '#E63946',  // Red
    // '#4361EE',  // Blue
    // '#F4D35E',  // Yellow
    // '#06D6A0',  // Emerald
    // '#6C584C', // Brown
    // '#8338EC', // Violet
    // '#1982C4', // Azure
    // '#C77DFF', // Lavender
    // '#FF70A6', // Pink
    // '#6D6875', // Slate
];
const generateAvatarColor = () => { return AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)]; };

// create group, you could be authenticated or not, if you are we use same member_token and username
router.post("/", async (req, res) => {
    const {groupName} = req.body;
    let {userName} = req.body;
    try {
        // check memberToken
        const authHeader = req.headers.authorization;
        let memberToken = null, recoveryCode = null;

        if (authHeader && authHeader.startsWith('Bearer ')) memberToken = authHeader.split(' ')[1];
        if (memberToken && memberToken !== 'undefined') {
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
            // userName = existingMember.name;
        }

        if (!memberToken) memberToken = generateMemberToken();
        if (!recoveryCode) recoveryCode = generateRecoveryCode();

        if (!groupName || !userName) {
            return res.status(400).json({
                error: "Group name and user name are required",
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
                avatar_color: generateAvatarColor(),
            })
            .select()
            .single();

        if (memberError) throw memberError;


        // log attività
        await supabase
            .from("activity_log")
            .insert({
                group_id: group.id,
                actor_id: member.id,
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

// join group, you don't have to be authenticated
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
            .eq('is_active', true)
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
                actor_id: member.id,
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

// my groups, empty if not authenticated
router.get("/me", async (req, res) => {
    // check memberToken
    const authHeader = req.headers.authorization;
    let memberToken = null;

    if (authHeader && authHeader.startsWith('Bearer ')) memberToken = authHeader.split(' ')[1];
    if (!memberToken) return res.json([]);

    try {
        const { data: memberships, error: groupsError } = await supabase
            .from("group_members")
            .select(`
                group_id,
                id,
                groups!inner (
                    id,
                    name,
                    currency
                )
            `)
            .eq("member_token", memberToken)
            .eq("is_active", true)
            .eq("groups.is_active", true);

        if (groupsError) throw groupsError;

        if (!memberships || memberships.length === 0) {
            return res.json([]);
        }
        // const groups = memberships.map((g) => g.groups);
        const groupIds = memberships.map(m => m.group_id);

        // counting members
        const { data: members, error: membersError } = await supabase
            .from("group_members")
            .select("group_id")
            .in("group_id", groupIds)
            .eq("is_active", true);

        if (membersError) throw membersError;

        // calculate balances for the groups
        const {data: expenses, error: expensesError} = await supabase
            .from("expenses")   
            .select(`
                *,
                expense_participants (
                    member_id,
                    share_amount
                )`)
            .in("group_id", groupIds)   
            .eq('is_active', true);
        if (expensesError) throw expensesError;
            
        const {data: payments, error: paymentsError} = await supabase
            .from("payments")
            .select('*')
            .in("group_id", groupIds);
        if (paymentsError) throw paymentsError;

        const resGroups = memberships.map(membership => {
            const groupExpenses = expenses.filter(x => x.group_id === membership.group_id);
            const groupPayments = payments.filter(x => x.group_id === membership.group_id);
            const balance = calculateBalance(membership.id, groupExpenses, groupPayments);
            const memberCount = members.filter(m => m.group_id === membership.group_id).length;
            return { ...membership.groups, balance, count: memberCount}
        })

        // const resGroups = groups;
        return res.json(resGroups);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Internal server error",
        });
    }
});

// from here until the end of the file the requests must be authenticated, before no
router.use(authenticateMember);


// return specific group and members
router.get('/:groupId', authorizeGroup, async (req, res) => {
    const { groupId } = req.params;
    try {
        const { data: group, error } = await supabase
            .from('groups')
            .select(`*, group_members (id, name, avatar_color, is_owner)`)
            .eq('id', groupId)
            .eq('is_active', true)
            .eq('group_members.is_active', true)
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

router.get('/:groupId/expenses', authorizeGroup, async (req, res) => {
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
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (expensesError) throw expensesError;
        res.json(expenses);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "Internal server error",
        });
    }
});

router.get('/:groupId/balances', authorizeGroup, async (req, res) => {
    const { groupId } = req.params;
    try {
        const { data: members, error: membersError } = await supabase
            .from('group_members')
            .select('*')
            .eq('is_active', true)
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
            .eq('is_active', true)
            .eq('group_id', groupId);

        if (expensesError) throw expensesError;

        const { data: payments, error: paymentsError } = await supabase
            .from('payments')
            .select('*')
            .eq('group_id', groupId);

        if (paymentsError) throw paymentsError;
        
        const result = members.map(member => ({
            id: member.id,
            name: member.name,
            avatar_color: member.avatar_color,
            // balance: balances.get(member.id)
            balance: calculateBalance(member.id, expenses, payments)
        }));


        res.json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Internal server error'
        })
    }
});

router.get('/:groupId/activity', authorizeGroup, async (req, res) => {
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

router.patch('/:groupId', authorizeGroup, async (req, res) => {
    const { groupId } = req.params;
    const {
        name,
        currency,
        invite_code,
        icon

    } = req.body;

    try {

        const { data: group, error: groupError } = await supabase
            .from('groups')
            .update({
                name,
                currency,
                invite_code,
                icon

            })
            .eq('id', groupId)
            .eq('is_active', true)
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
                actor_id: req.member.id,
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

router.patch('/:groupId/members/:memberId/leave', authorizeGroup, async (req, res) => {
    const { groupId, memberId } = req.params;

    try {
        // authenticated member has to be the one is leaving the group
        if (req.member.id !== memberId) {
            return res.status(403).json({
                error: "You are not allowed to leave as this member"
            });
        }

        if (req.member.is_owner) {
            return res.status(400).json({
                error: "Group owner cannot leave the group"
            });
        }

        // Check that the group exists
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('id, name')
            .eq('is_active', true)
            .eq('id', groupId)
            .single();

        if (groupError || !group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        const { error: deleteError } = await supabase
            .from('group_members')
            .update({ is_active: false })
            .eq('group_id', groupId)
            .eq('id', memberId);

        if (deleteError) throw deleteError;

        // activity log
        const { error: activityError } = await supabase
            .from('activity_log')
            .insert({
                group_id: groupId,
                actor_id: req.member.id,
                event_type: "member_left",
                entity_type: "member",
                entity_id: memberId,
                description: `Member ${req.member.name} left the group ${group.name}`
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

router.patch('/:groupId/members/:memberId/remove', authorizeGroup, async (req, res) => {
    const { groupId, memberId } = req.params;

    try {
        if (!req.member.is_owner) {
            return res.status(403).json({
                error: "You are not allowed to remove this member"
            });
        }

        if (req.member.id === memberId) {
            return res.status(400).json({
                error: "Owner cannot remove themselves"
            });
        }

        // Check that the group exists
        const { data: group, error: groupError } = await supabase
            .from('groups')
            .select('id, name')
            .eq('id', groupId)
            .eq('is_active', true)
            .single();

        if (groupError || !group) {
            return res.status(404).json({ error: 'Group not found' });
        }

        // verifica membro da eliminare fa parte del gruppo
        const { data: member, error: memberError } = await supabase
            .from('group_members')
            .select('id, name, is_owner')
            .eq('id', memberId)
            .eq('group_id', groupId)
            .eq('is_active', true)
            .single();

        if (memberError || !member) {
            return res.status(404).json({ error: 'Member is not part of the group' });
        }

        const { error: deleteError } = await supabase
            .from('group_members')
            .update({ is_active: false })
            .eq('group_id', groupId)
            .eq('id', memberId);

        if (deleteError) throw deleteError;

        // activity log
        const { error: activityError } = await supabase
            .from('activity_log')
            .insert({
                group_id: groupId,
                actor_id: req.member.id,
                event_type: "member_removed",
                entity_type: "member",
                entity_id: memberId,
                description: `${req.member.name} removed ${member.name} from the group ${group.name}`
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
router.get('/:groupId/me', authorizeGroup, async (req, res) => {
    const { groupId } = req.params;
    try {
        const {data: member, error: memberError} = await supabase
            .from('group_members')
            .select('*')
            .eq('id', req.member.id)
            .eq('group_id', groupId)
            .eq('is_active', true)
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
router.patch('/:groupId/me', authorizeGroup, async (req, res) => {
    const { groupId } = req.params;
    const { updatedName, updatedAvatar_color } = req.body;

    try {
        // update
        const { data: updatedMember, error: updatedMemberError } = await supabase
            .from('group_members')
            .update({ name: updatedName, avatar_color: updatedAvatar_color })
            .eq('id', req.member.id)
            .eq('group_id', groupId)
            .eq('is_active', true)
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
                actor_id: req.member.id,
                event_type: "member_updated",
                entity_type: "member",
                entity_id: req.member.id,
                description: `Member ${req.member.name} updated their profile`
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
const supabase = require("../config/supabase");


function isMemberOfGroup(member, groupId) {
    return member.group_id === groupId;
}

async function getMemberOfGroup(memberToken, groupId) {
    const { data: member, error } = await supabase
        .from("group_members")
        .select("id, group_id, name, member_token, is_owner, is_active")
        .eq("member_token", memberToken)
        .eq("group_id", groupId)
        .eq("is_active", true)
        .single();

    if (error || !member) {
        return null;
    }

    return member;
}

async function authorizeGroup(req, res, next) {
    // const { groupId } = req.params;
    const groupId = req.params.groupId || req.body.groupId;

    const member = await getMemberOfGroup(req.member_token, groupId);

    if (!member) {
        return res.status(403).json({
            error: "You are not a member of this group"
        });
    }

    req.member = member;
    next();
}

module.exports = { authorizeGroup, isMemberOfGroup };
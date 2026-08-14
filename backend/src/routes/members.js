const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");

router.patch('/me', async (req, res) => {
    const {updatedName, updatedAvatar_color} = req.body;

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
            .single();
        
        if (!member || memberError) {
            return res.status(404).json({error: 'Member not found'});
        }

        // update
        const {data: updatedMember, error: updatedMemberError} = await supabase
            .from('group_members')
            .update({name: updatedName, avatar_color: updatedAvatar_color})
            .eq('member_token', memberToken)
            .select()
            .single();

        if (updatedMemberError) throw updatedMemberError;

        return res.json(updatedMember);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Internal server error"
        });
    }
});

module.exports = router;
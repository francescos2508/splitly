const express = require("express");
const router = express.Router();

const supabase = require("../config/supabase");
const { authenticateMember } = require("../middleware/authenticateMember");

router.use(authenticateMember);

// dont't use // *** OLD ***
router.patch('/me', async (req, res) => {
    const {updatedName, updatedAvatar_color} = req.body;

    try {
        const {data: member, error: memberError} = await supabase
            .from('group_members')
            .select('*')
            .eq('id', req.member.id)
            .single();
        
        if (!member || memberError) {
            return res.status(404).json({error: 'Member not found'});
        }

        // update
        const {data: updatedMember, error: updatedMemberError} = await supabase
            .from('group_members')
            .update({name: updatedName, avatar_color: updatedAvatar_color})
            .eq('id', req.member.id)
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
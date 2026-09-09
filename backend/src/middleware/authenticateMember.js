const supabase = require("../config/supabase");

async function authenticateMember(req, res, next) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Authentication required"
            });
        }

        const token = authHeader.split(" ")[1];
        console.log('authenticateMember token: '+token);

        const { data: member, error } = await supabase
            .from("group_members")
            .select("id, group_id, name, member_token, is_owner, is_active")
            .eq("member_token", token)
            .eq("is_active", true)
            .limit(1)
            .maybeSingle();

            console.log(member);
        // doesn't exist a member with that token
        if (error || !member) {
            return res.status(401).json({
                error: "Invalid authentication token"
            });
        }

        req.member_token = member.member_token;

        next();

    } catch (error) {
        console.error("Authentication error:", error);

        return res.status(500).json({
            error: "Internal server error"
        });
    }
}

module.exports = { authenticateMember };
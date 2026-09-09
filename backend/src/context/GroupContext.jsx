import { createContext, useContext, useEffect, useState } from "react";
import { getGroup, loadCurrentMember } from "../../../src/api/api";

const GroupContext = createContext(null);

export function GroupProvider({ children, groupId }) {
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [activity, setActivity] = useState([]);
    const [currentMember, setCurrentMember] = useState(null);

    useEffect(() => {
        if (!groupId) return;

        const loadGroupData = async () => {
            try {
                const [groupData, member] = await Promise.all([
                    getGroup(groupId),
                    loadCurrentMember(groupId),
                ]);

                setGroup(groupData);
                setMembers(groupData.group_members);
                setCurrentMember(member);
            } catch (error) {
                console.error("Failed to load group data:", error);
            }
        };

        loadGroupData();
    }, [groupId]);

    return (
        <GroupContext.Provider
            value={{
                groupId,
                group,
                members,
                expenses,
                balances,
                activity,
                currentMember,
                setGroup,
                setMembers,
                setExpenses,
                setBalances,
                setActivity,
                setCurrentMember,
            }}
        >
            {children}
        </GroupContext.Provider>
    );
}

export function useGroup() {
    return useContext(GroupContext);
}
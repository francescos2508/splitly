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
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!groupId) return;

        const loadGroupData = async () => {
            try {
                const [groupData, member] = await Promise.all([
                    getGroup(groupId),
                    loadCurrentMember(groupId),
                ]);

                setGroup(groupData);
                setMembers(groupData.group_members.sort((a,b) => {
                    // currentMember will always be first one in the list
                    if (a.id === member.id) return -1;
                    if (b.id === member.id) return 1;

                    return a.name.localeCompare(b.name);
                }));
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
                loading,
                setGroup,
                setMembers,
                setExpenses,
                setBalances,
                setActivity,
                setCurrentMember,
                setLoading,
            }}
        >
            {children}
        </GroupContext.Provider>
    );
}

export function useGroup() {
    return useContext(GroupContext);
}
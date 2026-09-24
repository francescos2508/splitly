import { getGroup, getGroupActivity, getGroupBalances, getGroupExpenses, getGroupPayments, loadCurrentMember } from "@/src/api/api";
import { createContext, useContext, useEffect, useState } from "react";

const GroupContext = createContext(null);

export function GroupProvider({ children, groupId }) {
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [payments, setPayments] = useState([]);
    const [balances, setBalances] = useState([]);
    const [activity, setActivity] = useState([]);
    const [currentMember, setCurrentMember] = useState(null);
    const [loading, setLoading] = useState(false);

    const refreshGroup = async ( param = 'all' ) => {
        let result = {};
        if (param === 'all') param = {group: true, expenses: true, balances: true, activity: true, payments: true};
        const {group, expenses, balances, activity, payments} = param;
        try {
            setLoading(true);
            if (group) {
                const [groupData, member] = await Promise.all([
                    getGroup(groupId),
                    loadCurrentMember(groupId),
                ]);

                setGroup(groupData);
                const members = groupData.group_members.sort((a,b) => {
                    // currentMember will always be first one in the list
                    if (a.id === member.id) return -1;
                    if (b.id === member.id) return 1;

                    return a.name.localeCompare(b.name);
                });
                setMembers(members);
                setCurrentMember(member);
                result.group = groupData;
                result.members = members;
                result.currentMember = member;
            }

            if (expenses) {
                const expensesData = await getGroupExpenses(groupId);
                setExpenses(expensesData);
                result.expenses = expensesData;
            }
            
            if (payments) {
                const paymentsData = await getGroupPayments(groupId);
                setPayments(paymentsData);
                result.payments = paymentsData;
            }

            if (balances) {
                const balancesData = await getGroupBalances(groupId);
                setBalances(balancesData);
                result.balances = balancesData;
            }

            if (activity) {
                const activityData = await getGroupActivity(groupId);
                setActivity(activityData);
                result.activity = activityData;
            }
        } catch (error) {
            console.error("Failed to refresh group:", error);
            throw error;
        } finally {
            setLoading(false);
        }
        return result;
    }
    useEffect(() => {
        if (!groupId) return;

        const loadGroupData = async () => {
            try {
                await refreshGroup()
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
                payments,
                balances,
                activity,
                currentMember,
                loading,
                setGroup,
                setMembers,
                setExpenses,
                setPayments,
                setBalances,
                setActivity,
                setCurrentMember,
                setLoading,
                refreshGroup,
            }}
        >
            {children}
        </GroupContext.Provider>
    );
}

export function useGroup() {
    return useContext(GroupContext);
}


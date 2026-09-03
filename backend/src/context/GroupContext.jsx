import { createContext, useContext, useState } from "react";

const GroupContext = createContext(null);

export function GroupProvider({ children }) {
    const [group, setGroup] = useState(null);
    const [members, setMembers] = useState([]);
    const [expenses, setExpenses] = useState([]);
    const [balances, setBalances] = useState([]);
    const [activity, setActivity] = useState([]);

    return (
        <GroupContext.Provider
            value={{
                group,
                members,
                expenses,
                balances,
                activity,
                setGroup,
                setMembers,
                setExpenses,
                setBalances,
                setActivity,
            }}
        >
            {children}
        </GroupContext.Provider>
    );
}

export function useGroup() {
    return useContext(GroupContext);
}
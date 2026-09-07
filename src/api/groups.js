const API_URL = "http://192.168.0.15:3000";
import { getMemberToken } from "../storage/auth";


export async function loadCurrentMember(groupId) {
    const myToken = await getMemberToken();
    var authstr = 'Bearer '+myToken;
    if (!myToken) authstr = '';
    console.log("Calling API:", `${API_URL}/groups/${groupId}/me`);
    const response = await fetch(`${API_URL}/groups/${groupId}/me`, {
        method: "GET",
        headers: {
            Authorization: authstr,
        },
    });

    console.log("Response received:", response.status);
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Failed to get member");
    return result;
}

export async function createGroup(data) {
    const myToken = await getMemberToken();
    var authstr = 'Bearer '+myToken;
    if (!myToken) authstr = '';
    console.log("Calling API:", `${API_URL}/groups`);
    const response = await fetch(`${API_URL}/groups/`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
            Authorization: authstr,
            // ...options.headers,
        },
    });

    console.log("Response received:", response.status);
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Failed to create group");
    return result;
}

export async function joinGroup(inviteCode, username) {
    if (!inviteCode || !username) {
        alert('Missing required fields');
        return;
    }
    console.log("Calling API:", `${API_URL}/groups/:inviteCode/join`);
    const response = await fetch(`${API_URL}/groups/${inviteCode}/join`, {
        method: 'POST',
        body: JSON.stringify({userName: username}),
        headers: {
            "Content-Type": "application/json",
        }
    });

    console.log("Response received:", response.status);
    const result = await response.json();

    if (!response.ok) throw new Error(result.error || "Failed to join group");
    return result;
    
}

// get a specific group and the members
export async function getGroup(id) {
    console.log('Getting group ID: '+id);
    const resp = await fetch(`${API_URL}/groups/${id}`, {
        method: 'GET',
    });
    console.log('Response received: ', resp.status);
    const res = await resp.json();
    if (!resp.ok)  throw new Error(res.error || 'Failed to get group');
    return res;
}

// get a specific group balances
export async function getGroupBalances(id) {
    console.log('Getting group ID: '+id);
    const resp = await fetch(`${API_URL}/groups/${id}/balances`, {
        method: 'GET',
    });
    console.log('Response received: ', resp.status);
    const res = await resp.json();
    if (!resp.ok)  throw new Error(res.error || 'Failed to get group balances');
    return res;
}

// get a specific group expenses
export async function getGroupExpenses(id) {
    console.log('Getting group ID: '+id);
    const resp = await fetch(`${API_URL}/groups/${id}/expenses`, {
        method: 'GET',
    });
    console.log('Response received: ', resp.status);
    const res = await resp.json();
    if (!resp.ok)  throw new Error(res.error || 'Failed to get group expenses');
    if (res) res.sort((a, b) => new Date(a.expense_date) - new Date(b.expense_date))
    return res;
}

// get a specific group activity
export async function getGroupActivity(id) {
    console.log('Getting group ID: '+id);
    const resp = await fetch(`${API_URL}/groups/${id}/activity`, {
        method: 'GET',
    });
    console.log('Response received: ', resp.status);
    const res = await resp.json();
    if (!resp.ok)  throw new Error(res.error || 'Failed to get group activity');
    return res;
}

// get all groups where i am a member
export async function getMyGroups() {
    const myToken = await getMemberToken();
    if (!myToken) return [];

    const response = await fetch(`${API_URL}/groups/me`, {
        method: "GET",
        headers: {
            Authorization: 'Bearer '+myToken
        },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to fetch groups");
    
    return data;
}

// save new expense
export async function createExpense(groupId, newExpense) {
    const expense = {
            groupId: groupId,
            paidByMemberId: newExpense.paid_by,
            description: newExpense.description,
            amount: Number(newExpense.amount),
            category: newExpense.category,
            splitType: newExpense.split_type,
            expense_date: newExpense.expense_date,
            participants: newExpense.participants,
        };
        console.log(JSON.stringify(expense));
    const response = await fetch(`${API_URL}/expenses/`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(expense)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create the new expense");
    return data;
}

// update expense
export async function updateExpense(expenseId, newExpense) {
    const response = await fetch(`${API_URL}/expenses/${expenseId}`, {
        method: 'PATCH',
        body: JSON.stringify({
            // groupId: groupId,
            paidByMemberId: newExpense.paid_by,
            description: newExpense.description,
            amount: newExpense.amount,
            category: newExpense.category,
            splitType: newExpense.split_type,
            participants: newExpense.participants,
        })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create the new expense");
    return data;
}
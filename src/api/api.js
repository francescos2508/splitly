const API_URL = "http://192.168.0.15:3000";
import { getMemberToken } from "../storage/auth";

async function apiFetch(endpoint, options = {}) {
    const token = await getMemberToken();
    const headers = { ...options.headers, };

    if (token) headers.Authorization = `Bearer ${token}`;
    console.log("AUTH HEADER:", headers.Authorization);

    return fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });
}

export async function loadCurrentMember(groupId) {
    console.log("Calling API:", `${API_URL}/groups/${groupId}/me`);
    const response = await apiFetch(`/groups/${groupId}/me`, {
        method: "GET",
    });

    console.log("Response received:", response.status);
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Failed to get member");
    return result;
}

export async function createGroup(data) {
    console.log("Calling API:", `${API_URL}/groups`);
    const response = await apiFetch(`/groups/`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
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
    console.log("Calling API:", `${API_URL}/groups/${id}`);
    const resp = await apiFetch(`/groups/${id}`, {
        method: 'GET',
    });
    console.log('Response received: ', resp.status);
    const res = await resp.json();
    if (!resp.ok)  throw new Error(res.error || 'Failed to get group');
    return res;
}

// get a specific group balances
export async function getGroupBalances(id) {
    console.log("Calling API:", `${API_URL}/groups/${id}/balances`);
    if (!id) {
        console.trace("getGroupBalances called without groupId");
        return [];
    }
    const resp = await apiFetch(`/groups/${id}/balances`, {
        method: 'GET',
    });
    console.log('Response received: ', resp.status);
    const res = await resp.json();
    if (!resp.ok)  throw new Error(res.error || 'Failed to get group balances');
    return res;
}

// get a specific group expenses
export async function getGroupExpenses(id) {
    console.log("Calling API:", `${API_URL}/groups/${id}/expenses`);
    const resp = await apiFetch(`/groups/${id}/expenses`, {
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
    console.log("Calling API:", `${API_URL}/groups/${id}/activity`);
    const resp = await apiFetch(`/groups/${id}/activity`, {
        method: 'GET',
    });
    console.log('Response received: ', resp.status);
    const res = await resp.json();
    if (!resp.ok)  throw new Error(res.error || 'Failed to get group activity');
    return res;
}

// get all groups where i am a member
export async function getMyGroups() {
    console.log("Calling API:", `${API_URL}/groups/me`);
    const response = await apiFetch(`/groups/me`, {
        method: "GET",
    });
    console.log('Response received: ', response.status);
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
    console.log("Calling API:", `${API_URL}/expenses`);
    const response = await apiFetch(`/expenses`, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(expense)
    });
    console.log('Response received: ', response.status);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to create the new expense");
    return data;
}

// update expense
export async function updateExpense(expenseId, newExpense) {
    console.log("Calling API:", `${API_URL}/expenses/${expenseId}`);
    const response = await apiFetch(`/expenses/${expenseId}`, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json",
        },

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
    console.log('Response received: ', response.status);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Failed to update the expense");
    return data;
}
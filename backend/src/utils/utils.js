const crypto = require("crypto");
const INVITE_CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

function generateInviteCode(length = 8) {
  let code = "";
  for (let i = 0; i < length; i++) {
    const index = crypto.randomInt(0, INVITE_CHARACTERS.length);
    code += INVITE_CHARACTERS[index];
  }
  return code;
}

function generateMemberToken() {
  return crypto.randomBytes(32).toString("hex");
}

function generateRecoveryCode() {
  return crypto.randomBytes(8).toString("hex").toUpperCase();
}

function calculateBalance(memberId, expenses, payments) {
  let balance = 0;
  for (let i = 0; i < expenses.length; i++) {
      let exp = expenses[i];
      if (memberId === exp.paid_by_member_id) balance += Number(exp.amount);
      for (let j = 0; j < exp.expense_participants.length; j++) {
          let part = exp.expense_participants[j];
          if (memberId === part.member_id) balance -= Number(part.share_amount);
      }
  }

  for (let i = 0; i < payments.length; i++) {
      let paym = payments[i];
      if (memberId === paym.from_member_id) balance += Number(paym.amount);
      if (memberId === paym.to_member_id) balance -= Number(paym.amount)
  }

  return Math.round(balance * 100) / 100;;
}

function calculateExpenseParticipants(amount, splitType, participants) {
    if (splitType === 'equal') {
        const totalCents = Math.round(amount * 100);
        const baseShare = Math.floor(totalCents / participants.length);
        const remainder = totalCents % participants.length;

        return participants.map((item, index) => ({
            member_id: item.memberId,
            share_amount: Number(
                ((baseShare + (index < remainder ? 1 : 0)) / 100).toFixed(2)
            )
        }));
    }

    if (splitType === 'custom') {
        const invalidShare = participants.some(item =>
            !Number.isFinite(Number(item.shareAmount)) ||
            Number(item.shareAmount) <= 0
        );

        if (invalidShare) throw new Error('Invalid participant share');

        const expenseParticipants = participants.map(item => ({
            member_id: item.memberId,
            share_amount: Number(item.shareAmount)
        }));

        const total = expenseParticipants.reduce(
            (sum, item) => sum + item.share_amount,
            0
        );

        if (Number(total.toFixed(2)) !== Number(amount)) {
            throw new Error('Participants amount does not match expense amount');
        }

        return expenseParticipants;
    }

    throw new Error('Invalid split type');
}

module.exports = {
  generateInviteCode,
  generateMemberToken,
  generateRecoveryCode,
  calculateBalance,
  calculateExpenseParticipants
};
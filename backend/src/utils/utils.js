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
      if (memberId === from_member_id) balance += Number(paym.amount);
      if (memberId === paym.to_member_id) balance -= Number(paym.amount)
  }

  return balance;
}

module.exports = {
  generateInviteCode,
  generateMemberToken,
  generateRecoveryCode,
  calculateBalance,
};
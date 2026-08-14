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

module.exports = {
  generateInviteCode,
  generateMemberToken,
  generateRecoveryCode,
};
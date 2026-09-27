const crypto = require("crypto")

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex")
  return `scrypt$${salt}$${crypto.scryptSync(password, salt, 32).toString("hex")}`
}

function verifyPassword(password, stored) {
  try {
    const [, salt, value] = stored.split("$")
    return crypto.timingSafeEqual(
      crypto.scryptSync(password, salt, 32),
      Buffer.from(value, "hex")
    )
  } catch {
    return false
  }
}

module.exports = { hashPassword, verifyPassword }

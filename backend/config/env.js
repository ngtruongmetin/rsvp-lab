const dotenv = require("dotenv")
dotenv.config()
module.exports = {
  port: Number(process.env.PORT || 4005),
  sessionSecret: process.env.SESSION_SECRET || "development-secret",
  isProduction: process.env.NODE_ENV === "production",
  secureCookies: process.env.SECURE_COOKIES === "true",
}

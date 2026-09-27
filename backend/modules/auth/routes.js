const express = require("express")
const { query } = require("../../lib/database")
const { hashPassword, verifyPassword } = require("../../lib/security")
const router = express.Router()

router.post("/register", async (req, res, next) => {
  try {
    const { email, username, password } = req.body
    if (!email || !username || !password || password.length < 8)
      return res
        .status(400)
        .json({ error: "Cần email, tên người dùng và mật khẩu từ 8 ký tự" })
    const [user] = await query(
      "INSERT INTO users(email,username,password_hash) VALUES($1,$2,$3) RETURNING id,email,username,role",
      [email, username, hashPassword(password)]
    )
    req.session.user = user
    res.status(201).json(user)
  } catch (error) {
    if (error.code === "23505")
      return res
        .status(409)
        .json({ error: "Email hoặc tên người dùng đã tồn tại" })
    next(error)
  }
})
router.post("/login", async (req, res, next) => {
  try {
    const [user] = await query(
      "SELECT * FROM users WHERE email=$1 OR username=$1",
      [req.body.identifier]
    )
    if (!user || !verifyPassword(req.body.password || "", user.password_hash))
      return res.status(401).json({ error: "Thông tin đăng nhập không đúng" })
    delete user.password_hash
    req.session.user = user
    res.json(user)
  } catch (error) {
    next(error)
  }
})
router.get("/me", (req, res) => res.json(req.session.user || null))
router.post("/logout", (req, res) =>
  req.session.destroy(() => res.json({ ok: true }))
)
module.exports = router

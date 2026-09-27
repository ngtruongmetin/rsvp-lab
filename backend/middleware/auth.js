function requireAuth(req, res, next) {
  return req.session.user
    ? next()
    : res.status(401).json({ error: "Vui lòng đăng nhập để tiếp tục" })
}

function requireAdmin(req, res, next) {
  return req.session.user?.role === "admin"
    ? next()
    : res.status(403).json({ error: "Chỉ quản trị viên mới có quyền truy cập" })
}

module.exports = { requireAuth, requireAdmin }

const express = require("express")
const router = express.Router()
router.get("/", (_req, res) =>
  res.json({ success: true, service: "rsvp-lab-api" })
)
module.exports = router

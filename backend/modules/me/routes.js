const express = require("express")
const { query } = require("../../lib/database")
const { requireAuth } = require("../../middleware/auth")
const router = express.Router()
router.use(requireAuth)
router.get("/stats", async (req, res, next) => {
  try {
    const [stats] = await query(
      "SELECT COUNT(*) FILTER(WHERE passed) completed,COALESCE(MAX(score),0) best_score,COALESCE(AVG(wpm),0) avg_wpm FROM reading_sessions WHERE user_id=$1",
      [req.session.user.id]
    )
    res.json(stats)
  } catch (error) {
    next(error)
  }
})
router.get("/history", async (req, res, next) => {
  try {
    res.json(
      await query(
        "SELECT x.*,d.title FROM reading_sessions x JOIN documents d ON d.id=x.document_id WHERE user_id=$1 ORDER BY started_at DESC",
        [req.session.user.id]
      )
    )
  } catch (error) {
    next(error)
  }
})
module.exports = router

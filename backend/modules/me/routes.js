const express = require("express")
const { query } = require("../../lib/database")
const { requireAuth } = require("../../middleware/auth")
const { getAllLevelProgress } = require("../../lib/access")
const router = express.Router()
router.use(requireAuth)
router.get("/stats", async (req, res, next) => {
  try {
    const [stats] = await query(
      "SELECT COUNT(DISTINCT s.document_id) FILTER(WHERE s.status='completed' AND s.rsvp_level=d.rsvp_level) completed,COALESCE(MAX(s.score),0) best_score,COALESCE(AVG(s.wpm),0) avg_wpm FROM reading_sessions s JOIN documents d ON d.id=s.document_id WHERE s.user_id=$1",
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
router.get("/progress", async (req, res, next) => {
  try {
    res.json(await getAllLevelProgress(req.session.user.id))
  } catch (error) {
    next(error)
  }
})
module.exports = router

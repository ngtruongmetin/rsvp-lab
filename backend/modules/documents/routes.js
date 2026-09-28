const express = require("express")
const { query } = require("../../lib/database")
const { createChunks } = require("../../lib/rsvp")
const { requireAuth } = require("../../middleware/auth")
const { getLevelProgress, canAccessDocument } = require("../../lib/access")
const router = express.Router()
router.use(requireAuth)
router.get("/", async (req, res, next) => {
  try {
    const docs = await query(
      "SELECT d.*,l.wpm,EXISTS(SELECT 1 FROM reading_sessions x WHERE x.document_id=d.id AND x.user_id=$1 AND x.status='completed' AND x.passed) completed FROM documents d JOIN level_settings l ON l.level=d.rsvp_level WHERE d.status='published' ORDER BY d.rsvp_level,d.id",
      [req.session.user.id]
    )
    res.json(
      await Promise.all(docs.map(async (doc) => {
        const progress = Number(doc.rsvp_level) === 1 ? { correct: 0, threshold: null } : await getLevelProgress(req.session.user.id, Number(doc.rsvp_level) - 1)
        return {
        ...doc,
        progress_correct: progress.correct, progress_threshold: progress.threshold, current_level: Number(doc.rsvp_level), unlocked: await canAccessDocument(req.session.user.id, req.session.user.role, doc)
      }}))
    )
  } catch (error) {
    next(error)
  }
})
router.get("/:id", async (req, res, next) => {
  try {
    const [doc] = await query(
      "SELECT d.*,l.wpm AS level_wpm FROM documents d JOIN level_settings l ON l.level=d.rsvp_level WHERE d.id=$1",
      [req.params.id]
    )
    if (!doc) return res.status(404).json({ error: "Document not found" })
    if (!(await canAccessDocument(req.session.user.id, req.session.user.role, doc)))
      return res.status(403).json({ error: "Document is locked" })
    doc.chunks = createChunks(doc.content, 1)
    doc.wpm = doc.level_wpm
    delete doc.level_wpm
    doc.questions = await query(
      "SELECT id,question_type,question_text,option_a,option_b,option_c,option_d FROM questions WHERE document_id=$1 ORDER BY order_index",
      [doc.id]
    )
    res.json(doc)
  } catch (error) {
    next(error)
  }
})
module.exports = router

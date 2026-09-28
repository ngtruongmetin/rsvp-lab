const express = require("express")
const { query } = require("../../lib/database")
const { createChunks } = require("../../lib/rsvp")
const { requireAuth } = require("../../middleware/auth")
const { canAccessDocument } = require("../../lib/access")
const router = express.Router()
router.use(requireAuth)

router.post("/", async (req, res, next) => {
  try {
    const [doc] = await query(
      "SELECT d.*,l.wpm AS level_wpm FROM documents d JOIN level_settings l ON l.level=d.rsvp_level WHERE d.id=$1",
      [req.body.document_id]
    )
    if (!doc) return res.status(404).json({ error: "Không tìm thấy văn bản" })
    if (!(await canAccessDocument(req.session.user.id, req.session.user.role, doc))) return res.status(403).json({ error: "Document is locked" })
    const [session] = await query(
      "INSERT INTO reading_sessions(user_id,document_id,rsvp_level,wpm) VALUES($1,$2,$3,$4) RETURNING *",
      [
        req.session.user.id,
        doc.id,
        doc.rsvp_level || doc.required_level || 1,
        doc.level_wpm,
      ]
    )
    res.status(201).json(session)
  } catch (error) {
    next(error)
  }
})
router.get("/:id", async (req, res, next) => {
  try {
    const [session] = await query(
      "SELECT s.*,d.title,d.content,d.rsvp_level AS document_rsvp_level FROM reading_sessions s JOIN documents d ON d.id=s.document_id WHERE s.id=$1 AND s.user_id=$2",
      [req.params.id, req.session.user.id]
    )
    if (!session || !(await canAccessDocument(req.session.user.id, req.session.user.role, { rsvp_level: session.document_rsvp_level })))
      return res.status(404).json({ error: "Không tìm thấy buổi đọc" })
    session.chunks = createChunks(session.content, session.rsvp_level)
    delete session.content
    res.json(session)
  } catch (error) {
    next(error)
  }
})
router.post("/:id/progress", async (req, res, next) => {
  try {
    const [session] = await query(
      "UPDATE reading_sessions SET current_chunk=$1 WHERE id=$2 AND user_id=$3 RETURNING *",
      [+req.body.current_chunk || 0, req.params.id, req.session.user.id]
    )
    res.json(session)
  } catch (error) {
    next(error)
  }
})
router.post("/:id/complete", async (req, res, next) => {
  try {
    const [session] = await query(
      "SELECT s.*,d.rsvp_level FROM reading_sessions s JOIN documents d ON d.id=s.document_id WHERE s.id=$1 AND s.user_id=$2",
      [req.params.id, req.session.user.id]
    )
    if (!session || !(await canAccessDocument(req.session.user.id, req.session.user.role, session)))
      return res.status(404).json({ error: "Không tìm thấy buổi đọc" })
    const [{ question_count }] = await query(
      "SELECT COUNT(*)::int AS question_count FROM questions WHERE document_id=$1",
      [session.document_id]
    )
    const needsQuestions = question_count > 0
    const status = needsQuestions ? "questions" : "completed"
    const [out] = await query(
      "UPDATE reading_sessions SET status=$1,reading_duration_ms=$2,completed_at=CASE WHEN $1='completed' THEN NOW() ELSE completed_at END,score=CASE WHEN $1='completed' THEN 100 ELSE score END,passed=CASE WHEN $1='completed' THEN true ELSE passed END WHERE id=$3 RETURNING *",
      [status, +req.body.reading_duration_ms || 0, req.params.id]
    )
    res.json({ ...out, needs_questions: needsQuestions })
  } catch (error) {
    next(error)
  }
})
router.get("/:id/questions", async (req, res, next) => {
  try {
    const [session] = await query(
      "SELECT * FROM reading_sessions WHERE id=$1 AND user_id=$2",
      [req.params.id, req.session.user.id]
    )
    if (!session || !(await canAccessDocument(req.session.user.id, req.session.user.role, session)))
      return res.status(404).json({ error: "Không tìm thấy buổi đọc" })
    res.json(
      await query(
        "SELECT id,question_type,question_text,option_a,option_b,option_c,option_d,order_index FROM questions WHERE document_id=$1 ORDER BY order_index,id",
        [session.document_id]
      )
    )
  } catch (error) {
    next(error)
  }
})
router.post("/:id/answers", async (req, res, next) => {
  try {
    const [session] = await query(
      "SELECT * FROM reading_sessions WHERE id=$1 AND user_id=$2 AND status='questions'",
      [req.params.id, req.session.user.id]
    )
    if (!session || !(await canAccessDocument(req.session.user.id, req.session.user.role, session)))
      return res.status(404).json({ error: "Buổi đọc không hợp lệ" })
    const [question] = await query(
      "SELECT * FROM questions WHERE id=$1 AND document_id=$2",
      [req.body.question_id, session.document_id]
    )
    if (!question)
      return res.status(400).json({ error: "Câu hỏi không thuộc văn bản này" })
    const isCorrect = req.body.selected_option === question.correct_option
    const [answer] = await query(
      "INSERT INTO answers(session_id,question_id,selected_option,is_correct,response_time_ms) VALUES($1,$2,$3,$4,$5) ON CONFLICT(session_id,question_id) DO UPDATE SET selected_option=$3,is_correct=$4,response_time_ms=$5 RETURNING *",
      [
        session.id,
        question.id,
        req.body.selected_option,
        isCorrect,
        +req.body.response_time_ms || 0,
      ]
    )
    res.json({ ...answer, is_correct: isCorrect })
  } catch (error) {
    next(error)
  }
})
router.post("/:id/submit", async (req, res, next) => {
  try {
    const [session] = await query(
      "SELECT * FROM reading_sessions WHERE id=$1 AND user_id=$2",
      [req.params.id, req.session.user.id]
    )
    if (!session || !(await canAccessDocument(req.session.user.id, req.session.user.role, session)))
      return res.status(404).json({ error: "Không tìm thấy buổi đọc" })
    const questions = await query(
      "SELECT id FROM questions WHERE document_id=$1 ORDER BY order_index,id",
      [session.document_id]
    )
    const answered = await query("SELECT * FROM answers WHERE session_id=$1", [
      session.id,
    ])
    if (answered.length !== questions.length)
      return res
        .status(400)
        .json({ error: "Em cần trả lời đầy đủ các câu hỏi" })
    const correct = answered.filter((answer) => answer.is_correct).length
    const score = questions.length ? (correct / questions.length) * 100 : 0
    const [setting] = await query(
      "SELECT promotion_correct_answers FROM level_settings WHERE level=$1",
      [session.rsvp_level]
    )
    const [aggregate] = await query(
      "SELECT COALESCE(SUM(a.is_correct::int),0)::int AS correct FROM answers a JOIN reading_sessions s ON s.id=a.session_id WHERE s.user_id=$1 AND s.rsvp_level=$2",
      [req.session.user.id, session.rsvp_level]
    )
    const threshold =
      session.rsvp_level < 4 ? setting?.promotion_correct_answers : null
    const aggregateCorrect = Number(aggregate.correct) + correct
    const next_unlocked = threshold != null && aggregateCorrect >= Number(threshold)
    const [result] = await query(
      "UPDATE reading_sessions SET status='completed',completed_at=NOW(),score=$1,passed=$2 WHERE id=$3 RETURNING *",
      [score, true, session.id]
    )
    res.json({
      score,
      correct,
      total: questions.length,
      passed: true,
      aggregate_correct: aggregateCorrect,
      threshold,
      next_unlocked,
      session: result,
    })
  } catch (error) {
    next(error)
  }
})
module.exports = router

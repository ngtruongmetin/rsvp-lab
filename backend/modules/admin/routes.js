const express = require("express")
const { query } = require("../../lib/database")
const { requireAuth, requireAdmin } = require("../../middleware/auth")
const router = express.Router()
router.use(requireAuth, requireAdmin)
router.get("/analytics", async (_req, res, next) => {
  try {
    const [[users], [documents], [sessions], [score]] = await Promise.all(
      [
        "SELECT COUNT(*) n FROM users",
        "SELECT COUNT(*) n FROM documents",
        "SELECT COUNT(*) n FROM reading_sessions",
        "SELECT COALESCE(AVG(score),0) n FROM reading_sessions",
      ].map((sql) => query(sql))
    )
    res.json({
      users: users.n,
      documents: documents.n,
      sessions: sessions.n,
      average_score: score.n,
    })
  } catch (error) {
    next(error)
  }
})
router.get("/documents", async (_req, res, next) => {
  try {
    res.json(await query("SELECT * FROM documents ORDER BY rsvp_level,id"))
  } catch (error) {
    next(error)
  }
})
router.post("/documents", async (req, res, next) => {
  try {
    const [doc] = await query(
      "INSERT INTO documents(title,description,content,rsvp_level,wpm,status) VALUES($1,$2,$3,$4,$5,$6) RETURNING *",
      [
        req.body.title,
        req.body.description || "",
        req.body.content,
        req.body.rsvp_level || 1,
        req.body.wpm || 300,
        req.body.status || "draft",
      ]
    )
    res.status(201).json(doc)
  } catch (error) {
    next(error)
  }
})
router.patch("/documents/:id", async (req, res, next) => {
  try {
    const [doc] = await query(
      "UPDATE documents SET title=COALESCE($1,title),description=COALESCE($2,description),content=COALESCE($3,content),rsvp_level=COALESCE($4,rsvp_level),wpm=COALESCE($5,wpm),status=COALESCE($6,status),updated_at=NOW() WHERE id=$7 RETURNING *",
      [
        req.body.title,
        req.body.description,
        req.body.content,
        req.body.rsvp_level,
        req.body.wpm,
        req.body.status,
        req.params.id,
      ]
    )
    res.json(doc)
  } catch (error) {
    next(error)
  }
})
router.delete("/documents/:id", async (req, res, next) => {
  try {
    await query("DELETE FROM documents WHERE id=$1", [req.params.id])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})
router.get("/documents/:id/questions", async (req, res, next) => {
  try {
    res.json(
      await query(
        "SELECT * FROM questions WHERE document_id=$1 ORDER BY order_index,id",
        [req.params.id]
      )
    )
  } catch (error) {
    next(error)
  }
})
router.post("/documents/:id/questions", async (req, res, next) => {
  try {
    const [question] = await query(
      "INSERT INTO questions(document_id,question_type,question_text,option_a,option_b,option_c,option_d,correct_option,order_index) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *",
      [
        req.params.id,
        req.body.question_type || "multiple_choice",
        req.body.question_text,
        req.body.question_type === "true_false" ? "Đúng" : req.body.option_a,
        req.body.question_type === "true_false" ? "Sai" : req.body.option_b,
        req.body.question_type === "true_false" ? "" : req.body.option_c,
        req.body.question_type === "true_false" ? "" : req.body.option_d,
        req.body.correct_option,
        req.body.order_index || 0,
      ]
    )
    res.status(201).json(question)
  } catch (error) {
    next(error)
  }
})
router.patch("/questions/:id", async (req, res, next) => {
  try {
    const [question] = await query(
      "UPDATE questions SET question_type=COALESCE($1,question_type),question_text=COALESCE($2,question_text),option_a=COALESCE($3,option_a),option_b=COALESCE($4,option_b),option_c=COALESCE($5,option_c),option_d=COALESCE($6,option_d),correct_option=COALESCE($7,correct_option),order_index=COALESCE($8,order_index) WHERE id=$9 RETURNING *",
      [
        req.body.question_type,
        req.body.question_text,
        req.body.option_a,
        req.body.option_b,
        req.body.option_c,
        req.body.option_d,
        req.body.correct_option,
        req.body.order_index,
        req.params.id,
      ]
    )
    res.json(question)
  } catch (error) {
    next(error)
  }
})
router.delete("/questions/:id", async (req, res, next) => {
  try {
    await query("DELETE FROM questions WHERE id=$1", [req.params.id])
    res.json({ ok: true })
  } catch (error) {
    next(error)
  }
})
router.get("/results", async (_req, res, next) => {
  try {
    res.json(
      await query(
        "SELECT s.id,u.username,d.title,s.wpm,s.rsvp_level,s.score,s.passed,s.completed_at FROM reading_sessions s JOIN users u ON u.id=s.user_id JOIN documents d ON d.id=s.document_id ORDER BY s.started_at DESC"
      )
    )
  } catch (error) {
    next(error)
  }
})
router.get("/levels", async (_req, res, next) => {
  try {
    res.json(await query("SELECT * FROM level_settings ORDER BY level"))
  } catch (error) {
    next(error)
  }
})
router.patch("/levels/:level", async (req, res, next) => {
  try {
    const [setting] = await query(
      "UPDATE level_settings SET promotion_correct_answers=$1,wpm=COALESCE($2,wpm),updated_at=NOW() WHERE level=$3 RETURNING *",
      [
        req.body.promotion_correct_answers == null
          ? null
          : Math.max(0, +req.body.promotion_correct_answers),
        req.body.wpm == null
          ? null
          : Math.max(60, Math.min(1200, +req.body.wpm)),
        req.params.level,
      ]
    )
    res.json(setting)
  } catch (error) {
    next(error)
  }
})
module.exports = router

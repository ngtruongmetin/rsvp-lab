const { query } = require("./database")
async function getLevelProgress(userId, level) {
  const [row] = await query("SELECT COALESCE(SUM(a.is_correct::int),0)::int AS correct FROM answers a JOIN reading_sessions s ON s.id=a.session_id JOIN documents d ON d.id=s.document_id WHERE s.user_id=$1 AND d.rsvp_level=$2 AND s.status='completed'", [userId, level])
  const [setting] = await query("SELECT promotion_correct_answers AS threshold FROM level_settings WHERE level=$1", [level])
  return { correct: Number(row?.correct || 0), threshold: setting?.threshold == null ? null : Number(setting.threshold) }
}
async function canAccessDocument(userId, role, document) {
  if (role === "admin" || Number(document.rsvp_level) === 1) return true
  const progress = await getLevelProgress(userId, Number(document.rsvp_level) - 1)
  return progress.threshold != null && progress.correct >= progress.threshold
}
module.exports = { getLevelProgress, canAccessDocument }

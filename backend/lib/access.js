const { query } = require("./database")

const REQUIRED_ACCURACY_NUMERATOR = 2
const REQUIRED_ACCURACY_DENOMINATOR = 3

function evaluateLevelProgress(level, values = {}) {
  const totalDocuments = Number(values.total_documents || 0)
  const completedDocuments = Number(values.completed_documents || 0)
  const totalAnswers = Number(values.total_answers || 0)
  const correctAnswers = Number(values.correct_answers || 0)
  const allDocumentsRead = totalDocuments > 0 && completedDocuments >= totalDocuments
  const accuracyMet =
    totalAnswers === 0 ||
    correctAnswers * REQUIRED_ACCURACY_DENOMINATOR >=
      totalAnswers * REQUIRED_ACCURACY_NUMERATOR
  const levelCompleted = allDocumentsRead && accuracyMet

  return {
    level: Number(level),
    total_documents: totalDocuments,
    completed_documents: completedDocuments,
    remaining_documents: Math.max(0, totalDocuments - completedDocuments),
    total_answers: totalAnswers,
    correct_answers: correctAnswers,
    accuracy_percent:
      totalAnswers === 0 ? null : (correctAnswers / totalAnswers) * 100,
    required_accuracy_percent:
      (REQUIRED_ACCURACY_NUMERATOR / REQUIRED_ACCURACY_DENOMINATOR) * 100,
    all_documents_read: allDocumentsRead,
    accuracy_met: accuracyMet,
    level_completed: levelCompleted,
    next_unlocked: Number(level) < 4 && levelCompleted,
  }
}

async function getLevelProgress(userId, level) {
  const [row] = await query(
    `SELECT
      COUNT(DISTINCT d.id)::int AS total_documents,
      COUNT(DISTINCT d.id) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM reading_sessions completed
          WHERE completed.document_id=d.id
            AND completed.user_id=$1
            AND completed.status='completed'
            AND completed.rsvp_level=d.rsvp_level
        )
      )::int AS completed_documents,
      COUNT(a.id)::int AS total_answers,
      COUNT(a.id) FILTER (WHERE a.is_correct)::int AS correct_answers
    FROM documents d
    LEFT JOIN reading_sessions s
      ON s.document_id=d.id
      AND s.user_id=$1
      AND s.status='completed'
      AND s.rsvp_level=d.rsvp_level
    LEFT JOIN answers a ON a.session_id=s.id
    WHERE d.status='published' AND d.rsvp_level=$2`,
    [userId, level]
  )
  return evaluateLevelProgress(level, row)
}

async function getAllLevelProgress(userId) {
  return Promise.all([1, 2, 3, 4].map((level) => getLevelProgress(userId, level)))
}

async function canAccessDocument(userId, role, document) {
  if (role === "admin" || Number(document.rsvp_level) === 1) return true
  const progress = await getLevelProgress(userId, Number(document.rsvp_level) - 1)
  return progress.next_unlocked
}

module.exports = {
  evaluateLevelProgress,
  getLevelProgress,
  getAllLevelProgress,
  canAccessDocument,
}

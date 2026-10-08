const test = require("node:test")
const assert = require("node:assert/strict")
const { evaluateLevelProgress } = require("../lib/access")

test("requires every published document and at least two thirds accuracy", () => {
  const missingDocument = evaluateLevelProgress(1, {
    total_documents: 2,
    completed_documents: 1,
    total_answers: 3,
    correct_answers: 3,
  })
  assert.equal(missingDocument.accuracy_met, true)
  assert.equal(missingDocument.level_completed, false)

  const lowAccuracy = evaluateLevelProgress(1, {
    total_documents: 2,
    completed_documents: 2,
    total_answers: 3,
    correct_answers: 1,
  })
  assert.equal(lowAccuracy.all_documents_read, true)
  assert.equal(lowAccuracy.level_completed, false)
})

test("accepts an accuracy of exactly two thirds", () => {
  const progress = evaluateLevelProgress(2, {
    total_documents: 1,
    completed_documents: 1,
    total_answers: 6,
    correct_answers: 4,
  })
  assert.equal(progress.accuracy_percent, 100 * (2 / 3))
  assert.equal(progress.level_completed, true)
  assert.equal(progress.next_unlocked, true)
})

test("counts retry answers in both sides of the ratio", () => {
  const progress = evaluateLevelProgress(3, {
    total_documents: 1,
    completed_documents: 1,
    total_answers: 8,
    correct_answers: 6,
  })
  assert.equal(progress.accuracy_percent, 75)
  assert.ok(progress.accuracy_percent <= 100)
})

test("allows a question-free level after every document is read", () => {
  const progress = evaluateLevelProgress(1, {
    total_documents: 2,
    completed_documents: 2,
  })
  assert.equal(progress.accuracy_percent, null)
  assert.equal(progress.accuracy_met, true)
  assert.equal(progress.level_completed, true)
})

test("does not complete an empty level and never unlocks after level four", () => {
  assert.equal(evaluateLevelProgress(1).level_completed, false)
  assert.equal(
    evaluateLevelProgress(4, {
      total_documents: 1,
      completed_documents: 1,
    }).next_unlocked,
    false
  )
})

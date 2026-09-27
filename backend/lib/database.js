const { pool } = require("../config/database")

async function query(sql, values = []) {
  const result = await pool.query(sql, values)
  return result.rows
}

module.exports = { query }

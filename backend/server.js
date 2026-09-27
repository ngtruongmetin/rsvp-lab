const express = require("express")
const session = require("express-session")
const PgSession = require("connect-pg-simple")(session)
const { pool } = require("./config/database")
const { port, sessionSecret, secureCookies } = require("./config/env")
const { query } = require("./lib/database")

const app = express()
app.use(express.json({ limit: "2mb" }))
app.use(
  session({
    secret: sessionSecret,
    store: new PgSession({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookies,
      maxAge: 2592000000,
    },
  })
)
app.get("/api", (_req, res) => res.json({ name: "rsvp-lab", status: "ok" }))
app.use("/api/health", require("./modules/health/routes"))
app.use("/api/auth", require("./modules/auth/routes"))
app.use("/api/documents", require("./modules/documents/routes"))
app.use("/api/sessions", require("./modules/sessions/routes"))
app.use("/api/me", require("./modules/me/routes"))
app.use("/api/admin", require("./modules/admin/routes"))
app.use((error, _req, res, _next) => {
  console.error(error)
  res
    .status(error.status || 500)
    .json({ error: error.message || "Internal server error" })
})
async function start() {
  try {
    await query("ALTER TABLE documents ADD COLUMN IF NOT EXISTS rsvp_level INT")
    await query(
      "ALTER TABLE documents ADD COLUMN IF NOT EXISTS wpm INT NOT NULL DEFAULT 300"
    )
    await query(
      "UPDATE documents SET rsvp_level=required_level WHERE rsvp_level IS NULL"
    )
    await query(
      "ALTER TABLE questions ADD COLUMN IF NOT EXISTS question_type TEXT NOT NULL DEFAULT 'multiple_choice'"
    )
    await query("ALTER TABLE questions ALTER COLUMN correct_option TYPE TEXT")
    await query("ALTER TABLE answers ALTER COLUMN selected_option TYPE TEXT")
    await query(
      "CREATE TABLE IF NOT EXISTS level_settings (level INT PRIMARY KEY, promotion_correct_answers INT, updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW())"
    )
    await query(
      "ALTER TABLE level_settings ADD COLUMN IF NOT EXISTS wpm INT NOT NULL DEFAULT 300"
    )
    await query(
      "INSERT INTO level_settings(level,wpm,promotion_correct_answers) VALUES (1,250,NULL),(2,300,7),(3,350,7),(4,400,NULL) ON CONFLICT(level) DO NOTHING"
    )
    await query(
      "UPDATE level_settings SET wpm=CASE level WHEN 1 THEN 250 WHEN 2 THEN 300 WHEN 3 THEN 350 WHEN 4 THEN 400 END WHERE wpm=300"
    )
    await query(
      "INSERT INTO questions(document_id,question_type,question_text,option_a,option_b,option_c,option_d,correct_option,order_index) SELECT d.id,'multiple_choice','Ý chính của văn bản là gì?','Rèn khả năng đọc và suy nghĩ','Học thuộc mọi câu chữ','Đọc càng nhanh càng tốt','Không cần ghi nhớ','a',1 FROM documents d WHERE d.rsvp_level>1 AND NOT EXISTS (SELECT 1 FROM questions q WHERE q.document_id=d.id)"
    )
    await query(
      "INSERT INTO questions(document_id,question_type,question_text,option_a,option_b,option_c,option_d,correct_option,order_index) SELECT d.id,'true_false','Văn bản khuyến khích người đọc suy nghĩ lại bằng lời của mình.','Đúng','Sai','','','true',2 FROM documents d WHERE d.rsvp_level>1 AND (SELECT COUNT(*) FROM questions q WHERE q.document_id=d.id)=1"
    )
    await query(
      "UPDATE users SET password_hash=$1, role='admin' WHERE username='admin'",
      [
        "scrypt$eeb038d3ba540a077fb67cb11fb4c683$7b62b037772fc2cfb60d7bb8c29513dd9b267253ad8fc197717eaa9b692db8f8",
      ]
    )
    const [{ count }] = await query(
      "SELECT COUNT(*)::int AS count FROM documents"
    )
    if (count === 0) {
      await query(
        "INSERT INTO documents(title,description,content,required_level,status) VALUES($1,$2,$3,$4,'published'),($5,$6,$7,$8,'published'),($9,$10,$11,$12,'published'),($13,$14,$15,$16,'published')",
        [
          "Tập trung để hiểu",
          "Cách giữ sự chú ý khi đọc một bài khó.",
          "Đọc sâu bắt đầu từ việc chọn một mục tiêu rõ ràng. Khi đọc, em hãy gạch chân ý chính, tự hỏi vì sao tác giả viết điều này và nối mỗi đoạn với điều em đã biết.",
          1,
          "Đọc lại để nhớ lâu",
          "Vì sao lần đọc thứ hai giúp kiến thức bền hơn.",
          "Lần đọc đầu giúp em nhìn thấy bản đồ của văn bản. Lần đọc thứ hai giúp em hiểu địa hình và phát hiện mối liên hệ mới.",
          2,
          "Xây thói quen học tập",
          "Thiết kế một hệ thống học tập phù hợp.",
          "Một hệ thống nhỏ thường bền vững vì nó yêu cầu ít hơn. Hãy chia nhiệm vụ thành bước ngắn và ghi lại một điều em hiểu.",
          3,
          "Suy nghĩ có chiều sâu",
          "Bài đọc rèn khả năng phân tích.",
          "Tập trung là nghệ thuật loại bỏ điều thừa. Đóng những tab không cần thiết và giải thích lại bằng lời của em.",
          4,
        ]
      )
    }
    await query(
      "UPDATE documents SET title=$1,description=$2,content=$3 WHERE title=$4",
      [
        "Tập trung để hiểu",
        "Cách giữ sự chú ý khi đọc một bài khó.",
        "Đọc sâu bắt đầu từ việc chọn một mục tiêu rõ ràng. Khi đọc, em hãy gạch chân ý chính, tự hỏi vì sao tác giả viết điều này và nối mỗi đoạn với điều em đã biết.",
        "Signal / Noise",
      ]
    )
    await query(
      "UPDATE documents SET title=$1,description=$2,content=$3 WHERE title=$4",
      [
        "Đọc lại để nhớ lâu",
        "Vì sao lần đọc thứ hai giúp kiến thức bền hơn.",
        "Lần đọc đầu giúp em nhìn thấy bản đồ của văn bản. Lần đọc thứ hai giúp em hiểu địa hình và phát hiện mối liên hệ mới.",
        "The Second Pass",
      ]
    )
    await query(
      "UPDATE documents SET title=$1,description=$2,content=$3 WHERE title=$4",
      [
        "Xây thói quen học tập",
        "Thiết kế một hệ thống học tập phù hợp.",
        "Một hệ thống nhỏ thường bền vững vì nó yêu cầu ít hơn. Hãy chia nhiệm vụ thành bước ngắn và ghi lại một điều em hiểu.",
        "Small Systems",
      ]
    )
    await query(
      "UPDATE documents SET title=$1,description=$2,content=$3 WHERE title=$4",
      [
        "Suy nghĩ có chiều sâu",
        "Bài đọc rèn khả năng phân tích.",
        "Tập trung là nghệ thuật loại bỏ điều thừa. Đóng những tab không cần thiết và giải thích lại bằng lời của em.",
        "Deep Work Notes",
      ]
    )
    app.listen(port, "0.0.0.0", () =>
      console.log(`RSVP Lab API listening on ${port}`)
    )
  } catch (error) {
    console.error("Không thể khởi động backend:", error)
    process.exit(1)
  }
}
start()

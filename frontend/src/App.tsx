import { useEffect, useState } from "react"
import { Link, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom"
import { api } from "./lib/api"
function Nav({ user, logout }: any) {
  return (
    <header>
      <Link className="brand" to={user ? "/dashboard" : "/"}>
        RSVP<span>LAB</span>
      </Link>
      <nav>
        {user ? (
          <>
            <Link to="/dashboard">BẢNG ĐIỀU KHIỂN</Link>
            {user.role === "admin" && <Link to="/admin">QUẢN TRỊ</Link>}
            <button className="text-button" onClick={logout}>
              ĐĂNG XUẤT
            </button>
          </>
        ) : (
          <>
            <Link to="/login">ĐĂNG NHẬP</Link>
            <Link className="button small" to="/register">
              ĐĂNG KÝ
            </Link>
          </>
        )}
      </nav>
    </header>
  )
}
function PageTitle() {
  const { pathname } = useLocation()
  useEffect(() => {
    const title = pathname === "/" ? "RSVP Lab" :
      pathname === "/login" ? "Đăng nhập | RSVP Lab" :
      pathname === "/register" ? "Đăng ký | RSVP Lab" :
      pathname === "/dashboard" ? "Dashboard | RSVP Lab" :
      pathname === "/admin" ? "Quản trị | RSVP Lab" :
      pathname.includes("/questions") ? "Câu hỏi | RSVP Lab" :
      pathname.includes("/result") ? "Kết quả | RSVP Lab" :
      pathname.includes("/setup") ? "Cài đặt đọc | RSVP Lab" :
      pathname.startsWith("/read/") ? "Đang đọc | RSVP Lab" : "RSVP Lab"
    document.title = title
  }, [pathname])
  return null
}
function Landing() {
  return (
    <main className="landing">
      <section className="hero">
        <div>
          <p className="kicker">ĐỌC SÂU / NGHĨ SÂU HƠN</p>
          <h1>
            Làm mỗi
            <br />
            <em>giây</em> đều có ý nghĩa.
          </h1>
          <p className="lede">
            RSVP Lab giúp học sinh rèn tốc độ đọc, tập trung và khả năng hiểu ý
            qua từng văn bản.
          </p>
          <div className="actions">
            <Link className="button pink" to="/register">
              BẮT ĐẦU ĐỌC ↗
            </Link>
            <Link className="button ghost" to="/login">
              ĐĂNG NHẬP
            </Link>
          </div>
        </div>
        <div className="reader-preview">
          <b>ĐANG CHẠY / RSVP</b>
          <strong>
            Sự chú ý là
            <br />
            một hướng đi
            <br />
            do em chọn.
          </strong>
          <small>PHÍM CÁCH ĐỂ DỪNG · ESC ĐỂ THOÁT</small>
        </div>
      </section>
    </main>
  )
}
function Auth({ mode, onAuth }: any) {
  const nav = useNavigate()
  const [f, setF] = useState<any>({
    email: "",
    username: "",
    password: "",
    identifier: "",
  })
  const [e, setE] = useState("")
  const submit = async (x: any) => {
    x.preventDefault()
    try {
      const u = await api(`/auth/${mode === "login" ? "login" : "register"}`, {
        method: "POST",
        body: JSON.stringify(f),
      })
      onAuth(u)
      nav("/dashboard")
    } catch (x: any) {
      setE(x.message)
    }
  }
  return (
    <main className="auth">
      <p className="kicker">RSVP LAB / TRUY CẬP</p>
      <h1>{mode === "login" ? "Mừng em trở lại." : "Xây năng lực đọc sâu."}</h1>
      <form onSubmit={submit}>
        {mode === "register" ? (
          <>
            <label>
              EMAIL
              <input
                type="email"
                required
                value={f.email}
                onChange={(x) => setF({ ...f, email: x.target.value })}
              />
            </label>
            <label>
              TÊN NGƯỜI DÙNG
              <input
                required
                value={f.username}
                onChange={(x) => setF({ ...f, username: x.target.value })}
              />
            </label>
          </>
        ) : (
          <label>
            EMAIL HOẶC TÊN NGƯỜI DÙNG
            <input
              required
              value={f.identifier}
              onChange={(x) => setF({ ...f, identifier: x.target.value })}
            />
          </label>
        )}
        <label>
          MẬT KHẨU
          <input
            type="password"
            required
            minLength={8}
            value={f.password}
            onChange={(x) => setF({ ...f, password: x.target.value })}
          />
        </label>
        {e && <p className="error">{e}</p>}
        <button className="button pink">
          {mode === "login" ? "VÀO PHÒNG ĐỌC" : "TẠO TÀI KHOẢN"} ↗
        </button>
      </form>
    </main>
  )
}
function PublicRoute({ children, user }: any) {
  return user ? <Redirect to="/dashboard" /> : children
}
function Dashboard({ user }: any) {
  const [d, setD] = useState<any[]>([])
  useEffect(() => {
    api("/documents").then(setD).catch(() => setD([]))
  }, [])
  return (
    <main className="dash">
      <p className="kicker">CHÀO MỪNG, {user.username.toUpperCase()}</p>
      <h1>Phòng đọc của em.</h1>
      <div className="section-title">
        <h2>Thư viện văn bản</h2>
        <span>{d.length} BÀI ĐỌC</span>
      </div>
      <div className="doc-grid">
        {d.map((x) => (
          <article
            className={"doc " + (!x.unlocked ? "locked" : "")}
            key={x.id}
          >
            <div className="doc-meta">
              <span>CẤP RSVP {x.rsvp_level ?? x.required_level ?? "-"}</span>
              <span>{x.unlocked ? "ĐÃ MỞ" : "BỊ KHÓA"}</span>
            </div>
            <h3>{x.title}</h3>
            <p>{x.description}</p>
            <footer>
              <span>{x.wpm} TỪ/PHÚT</span>
              {x.unlocked && (
                <Link className="button small" to={`/read/${x.id}/setup`}>
                  BẮT ĐẦU ↗
                </Link>
              )}
            </footer>
          </article>
        ))}
      </div>
    </main>
  )
}
function Setup() {
  const { id } = useParams()
  const nav = useNavigate()
  const [d, setD] = useState<any>()
  useEffect(() => {
    api(`/documents/${id}`).then(setD)
  }, [id])
  if (!d) return <main className="setup">ĐANG TẢI...</main>
  return (
    <main className="setup">
      <p className="kicker">CÀI ĐẶT ĐỌC / {d.title}</p>
      <h1>
        Sẵn sàng
        <br />
        <em>đọc sâu.</em>
      </h1>
      <div className="controls">
        <div>
          <b>CẤP RSVP {d.rsvp_level}</b>
          <small>Cấu hình cố định</small>
        </div>
        <div>
          <b>{d.wpm ?? 300} TỪ/PHÚT</b>
          <small>Tốc độ do admin đặt</small>
        </div>
        <div>
          <b>{d.questions?.length || 0} CÂU HỎI</b>
          <small>Sau khi đọc</small>
        </div>
      </div>
      <button
        className="button pink"
        onClick={async () => {
          const s = await api("/sessions", {
            method: "POST",
            body: JSON.stringify({ document_id: id }),
          })
          nav(`/read/${s.id}`)
        }}
      >
        BẮT ĐẦU BÀI ĐỌC ↗
      </button>
    </main>
  )
}
function Reader() {
  const { id } = useParams()
  const nav = useNavigate()
  const [s, setS] = useState<any>()
  const [i, setI] = useState(0)
  const [p, setP] = useState(false)
  useEffect(() => {
    api(`/sessions/${id}`).then((x) => {
      setS(x)
      setI(x.current_chunk || 0)
    })
  }, [id])
  useEffect(() => {
    if (!s || p) return
    const t = setTimeout(
      () => {
        if (i + 1 >= s.chunks.length)
          api(`/sessions/${id}/complete`, {
            method: "POST",
            body: JSON.stringify({}),
          }).then((x) =>
            nav(
              x.needs_questions ? `/read/${id}/questions` : `/read/${id}/result`
            )
          )
        else {
          setI(i + 1)
          api(`/sessions/${id}/progress`, {
            method: "POST",
            body: JSON.stringify({ current_chunk: i + 1 }),
          })
        }
      },
      (s.chunks[i].split(/\s+/).length / s.wpm) * 60000
    )
    return () => clearTimeout(t)
  }, [s, i, p, id, nav])
  if (!s) return <main className="reader">ĐANG CHUẨN BỊ BÀI ĐỌC...</main>
  return (
    <main className="reader">
      <div className="reader-bar">
        <span>{s.title}</span>
        <span>
          {s.wpm} TỪ/PHÚT · CẤP {s.rsvp_level}
        </span>
        <button onClick={() => nav("/dashboard")}>THOÁT ×</button>
      </div>
      <div className="word">{s.chunks[i]}</div>
      <div className="reader-bottom">
        <div className="progress">
          <i style={{ width: `${(i / s.chunks.length) * 100}%` }} />
        </div>
        <button className="button" onClick={() => setP(!p)}>
          {p ? "TIẾP TỤC" : "TẠM DỪNG"}
        </button>
      </div>
    </main>
  )
}
function Questions() {
  const { id } = useParams()
  const nav = useNavigate()
  const [q, setQ] = useState<any[]>([])
  const [i, setI] = useState(0)
  const [a, setA] = useState<any>({})
  useEffect(() => {
    api(`/sessions/${id}/questions`).then(setQ)
  }, [id])
  const c = q[i]
  if (!c) return <main className="questions">ĐANG TẢI CÂU HỎI...</main>
  const opts =
    c.question_type === "true_false"
      ? [
          { k: "true", v: "Đúng" },
          { k: "false", v: "Sai" },
        ]
      : ["a", "b", "c", "d"].map((k) => ({ k, v: c[`option_${k}`] }))
  const choose = async (k: string) => {
    setA({ ...a, [c.id]: k })
    await api(`/sessions/${id}/answers`, {
      method: "POST",
      body: JSON.stringify({ question_id: c.id, selected_option: k }),
    })
  }
  const submit = async () => {
    const r = await api(`/sessions/${id}/submit`, {
      method: "POST",
      body: JSON.stringify({}),
    })
    sessionStorage.setItem("result", JSON.stringify(r))
    nav(`/read/${id}/result`)
  }
  return (
    <main className="questions">
      <p className="kicker">
        CÂU {i + 1} / {q.length}
      </p>
      <h1>{c.question_text}</h1>
      {opts.map((o) => (
        <button
          className={a[c.id] === o.k ? "choice selected" : "choice"}
          key={o.k}
          onClick={() => choose(o.k)}
        >
          {o.v}
        </button>
      ))}
      <div className="actions">
        {i > 0 && (
          <button className="button" onClick={() => setI(i - 1)}>
            CÂU TRƯỚC
          </button>
        )}
        {i < q.length - 1 ? (
          <button
            className="button pink"
            disabled={!a[c.id]}
            onClick={() => setI(i + 1)}
          >
            CÂU TIẾP THEO ↗
          </button>
        ) : (
          <button className="button pink" disabled={!a[c.id]} onClick={submit}>
            NỘP BÀI ↗
          </button>
        )}
      </div>
    </main>
  )
}
function Result() {
  const nav = useNavigate()
  const r = JSON.parse(sessionStorage.getItem("result") || "{}")
  return (
    <main className="result">
      <p className="kicker">HOÀN TẤT BÀI ĐỌC</p>
      <h1>{r.next_unlocked ? "Đã mở cấp tiếp theo." : "Đã hoàn thành."}</h1>
      <div className="score">
        <b>{Math.round(r.score || 100)}%</b>
        <span>
          {r.correct || 0} / {r.total || 0} CÂU ĐÚNG
        </span>
      </div>
      <p>
        {r.threshold
          ? `Tổng cấp: ${r.aggregate_correct} / ${r.threshold} câu đúng.`
          : "Cấp 1 không yêu cầu câu hỏi."}
      </p>
      <button className="button pink" onClick={() => nav("/dashboard")}>
        VỀ THƯ VIỆN ↗
      </button>
    </main>
  )
}
function Admin() {
  const [d, setD] = useState<any[]>([])
  const [l, setL] = useState<any[]>([])
  const [selected, setSelected] = useState<any>()
  const [q, setQ] = useState<any[]>([])
  const [editingDoc, setEditingDoc] = useState<number | null>(null)
  const [editingQuestion, setEditingQuestion] = useState<number | null>(null)
  const load = () =>
    Promise.all([api("/admin/documents"), api("/admin/levels")]).then(
      ([x, y]) => {
        setD(x)
        setL(y)
      }
    )
  useEffect(() => {
    load()
  }, [])
  const [f, setF] = useState<any>({
    title: "",
    description: "",
    content: "",
    rsvp_level: 1,
    wpm: 300,
    status: "published",
  })
  const [form, setForm] = useState<any>({
    question_type: "multiple_choice",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "a",
  })
  const saveDocument = async (e: any) => {
    e.preventDefault()
    await api(
      editingDoc ? `/admin/documents/${editingDoc}` : "/admin/documents",
      { method: editingDoc ? "PATCH" : "POST", body: JSON.stringify(f) }
    )
    setEditingDoc(null)
    load()
  }
  const saveQuestion = async (e: any) => {
    e.preventDefault()
    await api(
      editingQuestion
        ? `/admin/questions/${editingQuestion}`
        : `/admin/documents/${selected.id}/questions`,
      { method: editingQuestion ? "PATCH" : "POST", body: JSON.stringify(form) }
    )
    setEditingQuestion(null)
    api(`/admin/documents/${selected.id}/questions`).then(setQ)
  }
  const removeDocument = async (id: number) => {
    if (confirm("Xóa văn bản này?")) {
      await api(`/admin/documents/${id}`, { method: "DELETE" })
      load()
    }
  }
  return (
    <main className="dash admin">
      <p className="kicker">KHU VỰC QUẢN TRỊ</p>
      <h1>Điều hành phòng đọc.</h1>
      <section className="admin-editor">
        <h2>Tạo văn bản</h2>
        <form onSubmit={saveDocument}>
          <input
            placeholder="Tiêu đề"
            required
            value={f.title}
            onChange={(e) => setF({ ...f, title: e.target.value })}
          />
          <input
            placeholder="Mô tả"
            value={f.description}
            onChange={(e) => setF({ ...f, description: e.target.value })}
          />
          <textarea
            placeholder="Nội dung tiếng Việt"
            required
            rows={6}
            value={f.content}
            onChange={(e) => setF({ ...f, content: e.target.value })}
          />
          <label>
            Cấp RSVP{" "}
            <select
              value={f.rsvp_level}
              onChange={(e) => setF({ ...f, rsvp_level: +e.target.value })}
            >
              {[1, 2, 3, 4].map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <button className="button pink">
            {editingDoc ? "LƯU VĂN BẢN" : "TẠO VĂN BẢN"}
          </button>
          {editingDoc && (
            <button
              type="button"
              className="button"
              onClick={() => setEditingDoc(null)}
            >
              HỦY
            </button>
          )}
        </form>
      </section>
      <div className="section-title">
        <h2>Văn bản</h2>
      </div>
      {d.map((x) => (
        <div className="admin-row" key={x.id}>
          <b>CẤP {x.rsvp_level}</b>
          <strong>{x.title}</strong>
          <span>{x.wpm} TỪ/PHÚT</span>
          <button
            className="button small"
            onClick={() => {
              setSelected(x)
              api(`/admin/documents/${x.id}/questions`).then(setQ)
            }}
          >
            CÂU HỎI
          </button>
          <button
            className="button small"
            onClick={() => {
              setEditingDoc(x.id)
              setF({
                title: x.title,
                description: x.description,
                content: x.content,
                rsvp_level: x.rsvp_level,
                wpm: x.wpm,
                status: x.status,
              })
            }}
          >
            SỬA
          </button>
          <button className="button small" onClick={() => removeDocument(x.id)}>
            XÓA
          </button>
        </div>
      ))}
      {selected && (
        <section className="admin-editor">
          <h2>Câu hỏi: {selected.title}</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              await saveQuestion(e)
            }}
          >
            <select
              value={form.question_type}
              onChange={(e) =>
                setForm({ ...form, question_type: e.target.value })
              }
            >
              <option value="true_false">Đúng / Sai</option>
              <option value="multiple_choice">Nhiều lựa chọn</option>
            </select>
            <input
              placeholder="Nội dung câu hỏi"
              required
              value={form.question_text}
              onChange={(e) =>
                setForm({ ...form, question_text: e.target.value })
              }
            />
            {form.question_type === "multiple_choice" &&
              ["a", "b", "c", "d"].map((x) => (
                <input
                  key={x}
                  placeholder={`Lựa chọn ${x.toUpperCase()}`}
                  value={form[`option_${x}`]}
                  onChange={(e) =>
                    setForm({ ...form, [`option_${x}`]: e.target.value })
                  }
                />
              ))}
            <select
              value={form.correct_option}
              onChange={(e) =>
                setForm({ ...form, correct_option: e.target.value })
              }
            >
              {form.question_type === "true_false" ? (
                <>
                  <option value="true">Đúng</option>
                  <option value="false">Sai</option>
                </>
              ) : (
                ["a", "b", "c", "d"].map((x) => <option key={x}>{x}</option>)
              )}
            </select>
            <button className="button pink">
              {editingQuestion ? "LƯU CÂU HỎI" : "THÊM CÂU HỎI"}
            </button>
          </form>
          {q.map((x) => (
            <div className="admin-row" key={x.id}>
              <strong>{x.question_text}</strong>
              <span>{x.question_type}</span>
              <button
                className="button small"
                onClick={() =>
                  api(`/admin/questions/${x.id}`, { method: "DELETE" }).then(
                    () =>
                      api(`/admin/documents/${selected.id}/questions`).then(
                        setQ
                      )
                  )
                }
              >
                XÓA
              </button>
              <button
                className="button small"
                onClick={() => {
                  setEditingQuestion(x.id)
                  setForm({
                    question_type: x.question_type,
                    question_text: x.question_text,
                    option_a: x.option_a || "",
                    option_b: x.option_b || "",
                    option_c: x.option_c || "",
                    option_d: x.option_d || "",
                    correct_option: x.correct_option,
                  })
                }}
              >
                SỬA
              </button>
            </div>
          ))}
        </section>
      )}
      <section className="admin-editor">
        <h2>Ngưỡng mở cấp</h2>
        {l.map((x) => (
          <form
            key={x.level}
            onSubmit={async (e) => {
              e.preventDefault()
              await api(`/admin/levels/${x.level}`, {
                method: "PATCH",
                body: JSON.stringify({
                  promotion_correct_answers: x.promotion_correct_answers,
                  wpm: x.wpm,
                }),
              })
              load()
            }}
          >
            <label>
              Cấp {x.level}
              <input
                type="number"
                min="0"
                value={x.promotion_correct_answers || ""}
                onChange={(e) =>
                  setL(
                    l.map((y) =>
                      y.level === x.level
                        ? { ...y, promotion_correct_answers: e.target.value }
                        : y
                    )
                  )
                }
              />
            </label>
            <label>
              Tốc độ cấp này (WPM)
              <input
                type="number"
                min="60"
                max="1200"
                value={x.wpm || 300}
                onChange={(e) =>
                  setL(
                    l.map((y) =>
                      y.level === x.level ? { ...y, wpm: e.target.value } : y
                    )
                  )
                }
              />
            </label>
            <button className="button small">LƯU</button>
          </form>
        ))}
      </section>
    </main>
  )
}
function Redirect({ to }: { to: string }) {
  const n = useNavigate()
  useEffect(() => {
    n(to)
  }, [n, to])
  return null
}
export default function App() {
  const [user, setUser] = useState<any>()
  const [ready, setReady] = useState(false)
  useEffect(() => {
    api("/auth/me")
      .then(setUser)
      .finally(() => setReady(true))
  }, [])
  const logout = () =>
    api("/auth/logout", { method: "POST" }).then(() => setUser(null))
  const guard = (x: any, r?: string) =>
    !user ? (
      <Redirect to="/login" />
    ) : r && user.role !== r ? (
      <Redirect to="/dashboard" />
    ) : (
      x
    )
  return (
    <>
      <PageTitle />
      <Nav user={user} logout={logout} />
      {ready && (
        <Routes>
          <Route path="/" element={<PublicRoute user={user}><Landing /></PublicRoute>} />
          <Route
            path="/login"
            element={<PublicRoute user={user}><Auth mode="login" onAuth={setUser} /></PublicRoute>}
          />
          <Route
            path="/register"
            element={<PublicRoute user={user}><Auth mode="register" onAuth={setUser} /></PublicRoute>}
          />
          <Route path="/dashboard" element={guard(<Dashboard user={user} />)} />
          <Route path="/read/:id/setup" element={guard(<Setup />)} />
          <Route path="/read/:id" element={guard(<Reader />)} />
          <Route path="/read/:id/questions" element={guard(<Questions />)} />
          <Route path="/read/:id/result" element={guard(<Result />)} />
          <Route path="/admin" element={guard(<Admin />, "admin")} />
        </Routes>
      )}
    </>
  )
}

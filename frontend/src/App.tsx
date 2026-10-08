import { FormEvent, useEffect, useRef, useState } from "react"
import {
  Link,
  NavLink,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom"
import { api } from "./lib/api"

const formatDuration = (value?: number) => {
  const seconds = Math.round((value || 0) / 1000)
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

function Notice({ error, success }: { error?: string; success?: string }) {
  if (!error && !success) return null
  return (
    <p
      className={error ? "notice error" : "notice success"}
      role={error ? "alert" : "status"}
    >
      {error || success}
    </p>
  )
}

function Loading({ label = "Đang tải dữ liệu..." }: { label?: string }) {
  return (
    <main id="main-content" className="state">
      <p className="kicker">{label}</p>
    </main>
  )
}

function ErrorState({
  error,
  retry,
  back = "/dashboard",
}: {
  error: string
  retry?: () => void
  back?: string
}) {
  return (
    <main id="main-content" className="state">
      <p className="kicker">KHÔNG THỂ TẢI NỘI DUNG</p>
      <h1>Đã có sự cố.</h1>
      <Notice error={error} />
      <div className="actions">
        {retry && (
          <button className="button pink" onClick={retry}>
            THỬ LẠI
          </button>
        )}
        <Link className="button ghost" to={back}>
          QUAY LẠI
        </Link>
      </div>
    </main>
  )
}

function Nav({ user, logout }: any) {
  return (
    <header>
      <Link className="brand" to={user ? "/dashboard" : "/"}>
        RSVP<span>LAB</span>
      </Link>
      <nav aria-label="Điều hướng chính">
        {user ? (
          <>
            <NavLink to="/dashboard">BẢNG ĐIỀU KHIỂN</NavLink>
            {user.role === "admin" && <NavLink to="/admin">QUẢN TRỊ</NavLink>}
            <button className="text-button" onClick={logout}>
              ĐĂNG XUẤT
            </button>
          </>
        ) : (
          <>
            <NavLink to="/login">ĐĂNG NHẬP</NavLink>
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
    document.title =
      pathname === "/"
        ? "RSVP Lab"
        : pathname.includes("questions")
          ? "Câu hỏi | RSVP Lab"
          : pathname.includes("result")
            ? "Kết quả | RSVP Lab"
            : pathname.includes("setup")
              ? "Cài đặt đọc | RSVP Lab"
              : pathname.startsWith("/read/")
                ? "Đang đọc | RSVP Lab"
                : pathname === "/admin"
                  ? "Quản trị | RSVP Lab"
                  : "RSVP Lab"
  }, [pathname])
  return null
}

function Landing() {
  return (
    <main id="main-content" className="landing">
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
              BẮT ĐẦU ĐỌC
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
          <small>SPACE ĐỂ TẠM DỪNG · ESC ĐỂ THOÁT</small>
        </div>
      </section>
    </main>
  )
}

function Auth({ mode, onAuth }: any) {
  const nav = useNavigate()
  const [form, setForm] = useState<any>({
    email: "",
    username: "",
    password: "",
    identifier: "",
  })
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError("")
    try {
      onAuth(
        await api(`/auth/${mode}`, {
          method: "POST",
          body: JSON.stringify(form),
        })
      )
      nav("/dashboard")
    } catch (value: any) {
      setError(value.message)
    } finally {
      setSubmitting(false)
    }
  }
  const update = (key: string, value: string) => {
    setForm({ ...form, [key]: value })
    setError("")
  }
  return (
    <main id="main-content" className="auth">
      <p className="kicker">RSVP LAB / TRUY CẬP</p>
      <h1>{mode === "login" ? "Mừng em trở lại." : "Xây năng lực đọc sâu."}</h1>
      <form onSubmit={submit}>
        {mode === "register" && (
          <>
            <label>
              Email
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
              />
            </label>
            <label>
              Tên người dùng
              <input
                required
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
              />
            </label>
          </>
        )}
        {mode === "login" && (
          <label>
            Email hoặc tên người dùng
            <input
              required
              value={form.identifier}
              onChange={(e) => update("identifier", e.target.value)}
            />
          </label>
        )}
        <label>
          Mật khẩu
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
          />
        </label>
        <Notice error={error} />
        <button className="button pink" disabled={submitting}>
          {submitting
            ? "ĐANG XỬ LÝ..."
            : mode === "login"
              ? "VÀO PHÒNG ĐỌC"
              : "TẠO TÀI KHOẢN"}
        </button>
      </form>
    </main>
  )
}

function Dashboard({ user }: any) {
  const [data, setData] = useState<any>()
  const [error, setError] = useState("")
  const load = () => {
    setError("")
    setData(undefined)
    Promise.all([
      api("/documents"),
      api("/me/stats"),
      api("/me/history"),
      api("/me/progress"),
    ])
      .then(([documents, stats, history, levelProgress]) =>
        setData({ documents, stats, history, levelProgress })
      )
      .catch((value: any) => setError(value.message))
  }
  useEffect(load, [])
  if (error) return <ErrorState error={error} retry={load} />
  if (!data) return <Loading label="Đang tải thư viện..." />
  const { documents, stats, history, levelProgress } = data
  const lockMessage = (doc: any) => {
    const progress = doc.prerequisite_progress
    if (!progress) return "Cấp này chưa được mở."
    if (!progress.all_documents_read)
      return `Cần đọc thêm ${progress.remaining_documents} bài ở cấp ${progress.level}.`
    return `Tỷ lệ đúng cấp ${progress.level} hiện là ${Math.round(progress.accuracy_percent || 0)}%, cần từ 67%.`
  }
  return (
    <main id="main-content" className="dash">
      <p className="kicker">CHÀO MỪNG, {user.username.toUpperCase()}</p>
      <h1>Phòng đọc của em.</h1>
      <section className="stats" aria-label="Tiến độ học">
        <div>
          <b>{stats.completed}</b>
          <span>BÀI ĐÃ HOÀN THÀNH</span>
        </div>
        <div>
          <b>{Math.round(Number(stats.best_score))}%</b>
          <span>ĐIỂM CAO NHẤT</span>
        </div>
        <div>
          <b>{Math.round(Number(stats.avg_wpm)) || "-"}</b>
          <span>WPM GẦN ĐÂY</span>
        </div>
      </section>
      <div className="section-title">
        <h2>Tiến độ theo cấp</h2>
        <span>YÊU CẦU TỪ 2/3 CÂU ĐÚNG</span>
      </div>
      <section
        className="level-progress-grid"
        aria-label="Tiến độ RSVP theo cấp"
      >
        {levelProgress.map((level: any) => (
          <article
            className={
              level.level_completed
                ? "level-progress complete"
                : "level-progress"
            }
            key={level.level}
          >
            <div>
              <span>CẤP {level.level}</span>
              <b>
                {level.completed_documents}/{level.total_documents} BÀI
              </b>
            </div>
            <strong>
              {level.accuracy_percent == null
                ? "KHÔNG CÓ CÂU HỎI"
                : `${Math.round(level.accuracy_percent)}% CÂU ĐÚNG`}
            </strong>
            <div className="level-progress-bar">
              <i
                style={{
                  width: `${level.total_documents ? Math.min(100, (level.completed_documents / level.total_documents) * 100) : 0}%`,
                }}
              />
            </div>
            <small>
              {level.level_completed
                ? level.level === 4
                  ? "ĐÃ HOÀN THÀNH CẤP CUỐI"
                  : `ĐÃ MỞ CẤP ${level.level + 1}`
                : !level.all_documents_read
                  ? `CÒN ${level.remaining_documents} BÀI CHƯA ĐỌC`
                  : "CHƯA ĐẠT TỶ LỆ 2/3"}
            </small>
          </article>
        ))}
      </section>
      <div className="section-title">
        <h2>Thư viện văn bản</h2>
        <span>{documents.length} BÀI ĐỌC</span>
      </div>
      {documents.length === 0 ? (
        <section className="empty">
          <h2>Chưa có bài đọc được phát hành.</h2>
          <p>Thư viện sẽ xuất hiện tại đây khi quản trị viên đăng bài.</p>
        </section>
      ) : (
        <div className="doc-grid">
          {documents.map((doc: any) => (
            <article
              className={`doc ${doc.unlocked ? "" : "locked"}`}
              key={doc.id}
            >
              <div className="doc-meta">
                <span>CẤP RSVP {doc.rsvp_level}</span>
                <span>
                  {doc.completed
                    ? "ĐÃ HOÀN THÀNH"
                    : doc.unlocked
                      ? "ĐÃ MỞ"
                      : "ĐANG KHÓA"}
                </span>
              </div>
              <h3>{doc.title}</h3>
              <p>{doc.description}</p>
              <footer>
                {doc.unlocked ? (
                  <>
                    <span>{doc.wpm} WPM GỢI Ý</span>
                    <Link className="button small" to={`/read/${doc.id}/setup`}>
                      {doc.completed ? "ĐỌC LẠI" : "BẮT ĐẦU"}
                    </Link>
                  </>
                ) : (
                  <span className="lock-copy">{lockMessage(doc)}</span>
                )}
              </footer>
            </article>
          ))}
        </div>
      )}
      {history.length > 0 && (
        <section className="history">
          <div className="section-title">
            <h2>Hoạt động gần đây</h2>
          </div>
          {history.slice(0, 5).map((item: any) => (
            <div className="history-row" key={item.id}>
              <span>{item.title}</span>
              <span>
                {item.score == null ? "Đang đọc" : `${Math.round(item.score)}%`}
              </span>
              <span>{item.wpm} WPM</span>
            </div>
          ))}
        </section>
      )}
    </main>
  )
}

function Setup() {
  const { id } = useParams()
  const nav = useNavigate()
  const [doc, setDoc] = useState<any>()
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [wpm, setWpm] = useState(300)
  const load = () => {
    setError("")
    api(`/documents/${id}`)
      .then((value) => {
        setDoc(value)
        setWpm(value.wpm)
      })
      .catch((value: any) => setError(value.message))
  }
  useEffect(load, [id])
  if (error) return <ErrorState error={error} retry={load} />
  if (!doc) return <Loading label="Đang tải cấu hình bài đọc..." />
  const words = doc.chunks?.length || 0
  const minutes = words / wpm
  const start = async () => {
    setSubmitting(true)
    setError("")
    try {
      const session = await api("/sessions", {
        method: "POST",
        body: JSON.stringify({
          document_id: id,
          rsvp_level: doc.rsvp_level,
          wpm,
        }),
      })
      nav(`/read/${session.id}`)
    } catch (value: any) {
      setError(value.message)
      setSubmitting(false)
    }
  }
  return (
    <main id="main-content" className="setup">
      <p className="kicker">CÀI ĐẶT ĐỌC / {doc.title}</p>
      <h1>
        Sẵn sàng
        <br />
        <em>đọc sâu.</em>
      </h1>
      <div className="controls">
        <div>
          <label>
            Cấp RSVP<output>Cấp {doc.rsvp_level}</output>
          </label>
          <small>
            Bài đọc phải được hoàn thành ở đúng cấp này để tính tiến độ.
          </small>
        </div>
        <div>
          <label htmlFor="wpm">
            Tốc độ đọc
            <input
              id="wpm"
              type="range"
              min="60"
              max="1200"
              step="10"
              value={wpm}
              onChange={(e) => setWpm(Number(e.target.value))}
            />
            <output>{wpm} WPM</output>
          </label>
        </div>
        <div>
          <b>{words} TỪ</b>
          <small>
            Ước tính{" "}
            {minutes < 1
              ? `${Math.max(1, Math.round(minutes * 60))} giây`
              : `${minutes.toFixed(1)} phút`}{" "}
            · {doc.questions?.length || 0} câu hỏi
          </small>
        </div>
      </div>
      <Notice error={error} />
      <div className="actions">
        <button className="button pink" onClick={start} disabled={submitting}>
          {submitting ? "ĐANG TẠO..." : "BẮT ĐẦU BÀI ĐỌC"}
        </button>
        <Link className="button ghost" to="/dashboard">
          QUAY LẠI
        </Link>
      </div>
    </main>
  )
}

function Reader() {
  const { id } = useParams()
  const nav = useNavigate()
  const [session, setSession] = useState<any>()
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [error, setError] = useState("")
  const [finishing, setFinishing] = useState(false)
  const startedAt = useRef(Date.now())
  const load = () => {
    setError("")
    api(`/sessions/${id}`)
      .then((value) => {
        setSession(value)
        setIndex(
          Math.min(
            value.current_chunk || 0,
            Math.max(0, value.chunks.length - 1)
          )
        )
        startedAt.current = Date.now()
      })
      .catch((value: any) => setError(value.message))
  }
  useEffect(load, [id])
  const complete = async () => {
    if (!session || finishing) return
    setFinishing(true)
    try {
      await api(`/sessions/${id}/progress`, {
        method: "POST",
        body: JSON.stringify({ current_chunk: session.chunks.length }),
      })
      const result = await api(`/sessions/${id}/complete`, {
        method: "POST",
        body: JSON.stringify({
          reading_duration_ms:
            (session.reading_duration_ms || 0) + Date.now() - startedAt.current,
        }),
      })
      nav(
        result.needs_questions ? `/read/${id}/questions` : `/read/${id}/result`
      )
    } catch (value: any) {
      setError(value.message)
      setFinishing(false)
    }
  }
  useEffect(() => {
    if (!session || paused || finishing) return
    const chunk = session.chunks[index]
    const timeout = window.setTimeout(
      async () => {
        if (index + 1 >= session.chunks.length) complete()
        else {
          const next = index + 1
          setIndex(next)
          try {
            await api(`/sessions/${id}/progress`, {
              method: "POST",
              body: JSON.stringify({ current_chunk: next }),
            })
          } catch (value: any) {
            setPaused(true)
            setError(value.message)
          }
        }
      },
      (chunk.split(/\s+/).length / session.wpm) * 60000
    )
    return () => window.clearTimeout(timeout)
  }, [session, index, paused, finishing])
  useEffect(() => {
    const onKey = (event: globalThis.KeyboardEvent) => {
      if ((event.target as HTMLElement)?.tagName === "INPUT") return
      if (event.code === "Space") {
        event.preventDefault()
        setPaused((value) => !value)
      }
      if (event.key === "Escape") nav("/dashboard")
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [nav])
  if (error && !session) return <ErrorState error={error} retry={load} />
  if (!session) return <Loading label="Đang chuẩn bị bài đọc..." />
  const restart = async () => {
    setPaused(true)
    try {
      await api(`/sessions/${id}/progress`, {
        method: "POST",
        body: JSON.stringify({ current_chunk: 0 }),
      })
      setIndex(0)
      startedAt.current = Date.now()
    } catch (value: any) {
      setError(value.message)
    }
  }
  const progress = ((index + 1) / session.chunks.length) * 100
  return (
    <main id="main-content" className="reader">
      <div className="reader-bar">
        <span>{session.title}</span>
        <span>
          {session.wpm} WPM · CẤP {session.rsvp_level} · {index + 1}/
          {session.chunks.length}
        </span>
        <button onClick={() => nav("/dashboard")}>THOÁT</button>
      </div>
      <div className="word" aria-live="polite">
        {session.chunks[index]}
      </div>
      <Notice error={error} />
      <div className="reader-bottom">
        <div
          className="progress"
          aria-label={`${Math.round(progress)}% hoàn thành`}
        >
          <i style={{ width: `${progress}%` }} />
        </div>
        <button className="button ghost" onClick={restart} disabled={finishing}>
          ĐỌC LẠI
        </button>
        <button
          className="button"
          onClick={() => setPaused((value) => !value)}
          disabled={finishing}
        >
          {paused ? "TIẾP TỤC" : "TẠM DỪNG"}
        </button>
      </div>
    </main>
  )
}

function Questions() {
  const { id } = useParams()
  const nav = useNavigate()
  const [data, setData] = useState<any>()
  const [index, setIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const load = () => {
    setError("")
    api(`/sessions/${id}/questions`)
      .then((value) => {
        const next = Array.isArray(value)
          ? { questions: value, answers: [] }
          : value
        setData(next)
        setAnswers(
          Object.fromEntries(
            next.answers.map((answer: any) => [
              answer.question_id,
              answer.selected_option,
            ])
          )
        )
        setIndex(Number(sessionStorage.getItem(`question-${id}`)) || 0)
      })
      .catch((value: any) => setError(value.message))
  }
  useEffect(load, [id])
  if (error && !data) return <ErrorState error={error} retry={load} />
  if (!data) return <Loading label="Đang tải câu hỏi..." />
  const question = data.questions[index]
  if (!question)
    return <ErrorState error="Bài đọc này chưa có câu hỏi." back="/dashboard" />
  const options =
    question.question_type === "true_false"
      ? [
          { key: "true", label: "Đúng" },
          { key: "false", label: "Sai" },
        ]
      : ["a", "b", "c", "d"].map((key) => ({
          key,
          label: question[`option_${key}`],
        }))
  const choose = async (key: string) => {
    setSaving(true)
    setError("")
    try {
      await api(`/sessions/${id}/answers`, {
        method: "POST",
        body: JSON.stringify({
          question_id: question.id,
          selected_option: key,
        }),
      })
      setAnswers((value) => ({ ...value, [question.id]: key }))
    } catch (value: any) {
      setError(value.message)
    } finally {
      setSaving(false)
    }
  }
  const go = (next: number) => {
    setIndex(next)
    sessionStorage.setItem(`question-${id}`, String(next))
  }
  const submit = async () => {
    setSaving(true)
    setError("")
    try {
      await api(`/sessions/${id}/submit`, { method: "POST", body: "{}" })
      sessionStorage.removeItem(`question-${id}`)
      nav(`/read/${id}/result`)
    } catch (value: any) {
      setError(value.message)
    } finally {
      setSaving(false)
    }
  }
  return (
    <main id="main-content" className="questions">
      <p className="kicker">
        CÂU {index + 1} / {data.questions.length}
      </p>
      <h1>{question.question_text}</h1>
      <div className="choices">
        {options.map((option) => (
          <button
            className={
              answers[question.id] === option.key ? "choice selected" : "choice"
            }
            key={option.key}
            onClick={() => choose(option.key)}
            disabled={saving}
            aria-pressed={answers[question.id] === option.key}
          >
            {option.label}
          </button>
        ))}
      </div>
      <Notice error={error} />
      <div className="actions">
        {index > 0 && (
          <button
            className="button ghost"
            onClick={() => go(index - 1)}
            disabled={saving}
          >
            CÂU TRƯỚC
          </button>
        )}
        {index < data.questions.length - 1 ? (
          <button
            className="button pink"
            disabled={!answers[question.id] || saving}
            onClick={() => go(index + 1)}
          >
            CÂU TIẾP THEO
          </button>
        ) : (
          <button
            className="button pink"
            disabled={!answers[question.id] || saving}
            onClick={submit}
          >
            {saving ? "ĐANG NỘP..." : "NỘP BÀI"}
          </button>
        )}
      </div>
    </main>
  )
}

function Result() {
  const { id } = useParams()
  const [result, setResult] = useState<any>()
  const [error, setError] = useState("")
  const load = () => {
    setError("")
    api(`/sessions/${id}/result`)
      .then(setResult)
      .catch((value: any) => setError(value.message))
  }
  useEffect(load, [id])
  if (error) return <ErrorState error={error} retry={load} />
  if (!result) return <Loading label="Đang tải kết quả..." />
  const score = result.score == null ? 0 : Math.round(Number(result.score))
  const progress = result.level_progress
  const progressMessage = progress.level_completed
    ? progress.level === 4
      ? "Em đã hoàn thành cấp cuối."
      : `Em đã mở khóa cấp ${progress.level + 1}.`
    : !progress.all_documents_read
      ? `Cần đọc thêm ${progress.remaining_documents} bài ở cấp ${progress.level}.`
      : `Tỷ lệ tích lũy cần đạt từ 67%; hiện tại là ${Math.round(progress.accuracy_percent || 0)}%.`
  return (
    <main id="main-content" className="result">
      <p className="kicker">HOÀN TẤT BÀI ĐỌC</p>
      <h1>{result.passed ? "Em đã đạt bài đọc." : "Em chưa đạt lần này."}</h1>
      <div className="score">
        <b>{score}%</b>
        <span>
          {result.correct} / {result.total} CÂU ĐÚNG
        </span>
      </div>
      <section className="result-meta">
        <span>{result.wpm} WPM</span>
        <span>CẤP RSVP {result.rsvp_level}</span>
        <span>{formatDuration(result.reading_duration_ms)}</span>
        <span>{result.passed ? "ĐẠT TỪ 70%" : "CẦN TỪ 70%"}</span>
      </section>
      <section
        className="level-result"
        aria-label={`Tiến độ cấp ${progress.level}`}
      >
        <div>
          <span>TIẾN ĐỘ CẤP {progress.level}</span>
          <b>
            {progress.completed_documents} / {progress.total_documents} BÀI ĐÃ
            ĐỌC
          </b>
        </div>
        <div>
          <span>TỶ LỆ TÍCH LŨY</span>
          <b>
            {progress.accuracy_percent == null
              ? "KHÔNG CÓ CÂU HỎI"
              : `${Math.round(progress.accuracy_percent)}% (${progress.correct_answers}/${progress.total_answers})`}
          </b>
        </div>
      </section>
      <p>{progressMessage}</p>
      <Link className="button pink" to="/dashboard">
        VỀ THƯ VIỆN
      </Link>
    </main>
  )
}

export function LegacyAdmin() {
  const [data, setData] = useState<any>()
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [selected, setSelected] = useState<any>()
  const [questions, setQuestions] = useState<any[]>([])
  const [editDoc, setEditDoc] = useState<any>()
  const [editQuestion, setEditQuestion] = useState<any>()
  const [confirming, setConfirming] = useState<string>("")
  const emptyDoc = {
    title: "",
    description: "",
    content: "",
    rsvp_level: 1,
    wpm: 300,
    status: "published",
  }
  const emptyQuestion = {
    question_type: "multiple_choice",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "a",
  }
  const [docForm, setDocForm] = useState<any>(emptyDoc)
  const [questionForm, setQuestionForm] = useState<any>(emptyQuestion)
  const load = () => {
    setError("")
    Promise.all([
      api("/admin/documents"),
      api("/admin/analytics"),
      api("/admin/results"),
    ])
      .then(([documents, analytics, results]) =>
        setData({ documents, analytics, results })
      )
      .catch((value: any) => setError(value.message))
  }
  useEffect(load, [])
  const call = async (action: () => Promise<any>, message: string) => {
    setError("")
    setSuccess("")
    try {
      await action()
      setSuccess(message)
      load()
    } catch (value: any) {
      setError(value.message)
    }
  }
  const openQuestions = async (document: any) => {
    setSelected(document)
    setEditQuestion(undefined)
    setQuestionForm(emptyQuestion)
    try {
      setQuestions(await api(`/admin/documents/${document.id}/questions`))
    } catch (value: any) {
      setError(value.message)
    }
  }
  if (error && !data) return <ErrorState error={error} retry={load} />
  if (!data) return <Loading label="Đang tải quản trị..." />
  const { documents, analytics, results } = data
  return (
    <main id="main-content" className="dash admin">
      <p className="kicker">KHU VỰC QUẢN TRỊ</p>
      <h1>Điều hành phòng đọc.</h1>
      <section className="stats">
        <div>
          <b>{analytics.users}</b>
          <span>NGƯỜI DÙNG</span>
        </div>
        <div>
          <b>{analytics.documents}</b>
          <span>VĂN BẢN</span>
        </div>
        <div>
          <b>{Math.round(Number(analytics.average_score))}%</b>
          <span>ĐIỂM TRUNG BÌNH</span>
        </div>
      </section>
      <Notice error={error} success={success} />
      <section className="admin-editor">
        <h2>{editDoc ? "Sửa văn bản" : "Tạo văn bản"}</h2>
        <form
          onSubmit={(event) => {
            event.preventDefault()
            call(
              () =>
                api(
                  editDoc
                    ? `/admin/documents/${editDoc.id}`
                    : "/admin/documents",
                  {
                    method: editDoc ? "PATCH" : "POST",
                    body: JSON.stringify(docForm),
                  }
                ),
              editDoc ? "Đã lưu văn bản." : "Đã tạo văn bản."
            )
            setEditDoc(undefined)
            setDocForm(emptyDoc)
          }}
        >
          <label>
            Tiêu đề
            <input
              required
              value={docForm.title}
              onChange={(e) =>
                setDocForm({ ...docForm, title: e.target.value })
              }
            />
          </label>
          <label>
            Mô tả
            <input
              value={docForm.description}
              onChange={(e) =>
                setDocForm({ ...docForm, description: e.target.value })
              }
            />
          </label>
          <label className="wide">
            Nội dung
            <textarea
              required
              rows={6}
              value={docForm.content}
              onChange={(e) =>
                setDocForm({ ...docForm, content: e.target.value })
              }
            />
          </label>
          <label>
            Cấp RSVP
            <select
              value={docForm.rsvp_level}
              onChange={(e) =>
                setDocForm({ ...docForm, rsvp_level: Number(e.target.value) })
              }
            >
              {[1, 2, 3, 4].map((value) => (
                <option value={value} key={value}>
                  {value}
                </option>
              ))}
            </select>
          </label>
          <label>
            WPM gợi ý
            <input
              type="number"
              min="60"
              max="1200"
              value={docForm.wpm}
              onChange={(e) =>
                setDocForm({ ...docForm, wpm: Number(e.target.value) })
              }
            />
          </label>
          <label>
            Trạng thái
            <select
              value={docForm.status}
              onChange={(e) =>
                setDocForm({ ...docForm, status: e.target.value })
              }
            >
              <option value="published">Đã phát hành</option>
              <option value="draft">Bản nháp</option>
            </select>
          </label>
          <div className="actions wide">
            <button className="button pink">
              {editDoc ? "LƯU VĂN BẢN" : "TẠO VĂN BẢN"}
            </button>
            {editDoc && (
              <button
                className="button ghost"
                type="button"
                onClick={() => {
                  setEditDoc(undefined)
                  setDocForm(emptyDoc)
                }}
              >
                HỦY
              </button>
            )}
          </div>
        </form>
      </section>
      <section className="admin-list">
        <div className="section-title">
          <h2>Văn bản</h2>
          <span>{documents.length} MỤC</span>
        </div>
        {documents.map((doc: any) => (
          <div className="admin-row" key={doc.id}>
            <b>CẤP {doc.rsvp_level}</b>
            <strong>{doc.title}</strong>
            <span>
              {doc.status === "published" ? "ĐÃ PHÁT HÀNH" : "BẢN NHÁP"}
            </span>
            <span>{doc.wpm} WPM</span>
            <button className="button small" onClick={() => openQuestions(doc)}>
              CÂU HỎI
            </button>
            <button
              className="button small"
              onClick={() => {
                setEditDoc(doc)
                setDocForm(doc)
              }}
            >
              SỬA
            </button>
            {confirming === `doc-${doc.id}` ? (
              <button
                className="button danger small"
                onClick={() => {
                  call(
                    () =>
                      api(`/admin/documents/${doc.id}`, { method: "DELETE" }),
                    "Đã xóa văn bản."
                  )
                  setConfirming("")
                }}
              >
                XÁC NHẬN XÓA
              </button>
            ) : (
              <button
                className="button small"
                onClick={() => setConfirming(`doc-${doc.id}`)}
              >
                XÓA
              </button>
            )}
          </div>
        ))}
      </section>
      {selected && (
        <section className="admin-editor">
          <h2>Câu hỏi: {selected.title}</h2>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              call(
                async () => {
                  await api(
                    editQuestion
                      ? `/admin/questions/${editQuestion.id}`
                      : `/admin/documents/${selected.id}/questions`,
                    {
                      method: editQuestion ? "PATCH" : "POST",
                      body: JSON.stringify(questionForm),
                    }
                  )
                  await openQuestions(selected)
                },
                editQuestion ? "Đã lưu câu hỏi." : "Đã thêm câu hỏi."
              )
              setEditQuestion(undefined)
              setQuestionForm(emptyQuestion)
            }}
          >
            <label>
              Loại câu hỏi
              <select
                value={questionForm.question_type}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    question_type: e.target.value,
                    correct_option:
                      e.target.value === "true_false" ? "true" : "a",
                  })
                }
              >
                <option value="multiple_choice">Nhiều lựa chọn</option>
                <option value="true_false">Đúng / Sai</option>
              </select>
            </label>
            <label>
              Nội dung câu hỏi
              <input
                required
                value={questionForm.question_text}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    question_text: e.target.value,
                  })
                }
              />
            </label>
            {questionForm.question_type === "multiple_choice" &&
              ["a", "b", "c", "d"].map((key) => (
                <label key={key}>
                  Lựa chọn {key.toUpperCase()}
                  <input
                    required
                    value={questionForm[`option_${key}`]}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        [`option_${key}`]: e.target.value,
                      })
                    }
                  />
                </label>
              ))}
            <label>
              Đáp án đúng
              <select
                value={questionForm.correct_option}
                onChange={(e) =>
                  setQuestionForm({
                    ...questionForm,
                    correct_option: e.target.value,
                  })
                }
              >
                {questionForm.question_type === "true_false" ? (
                  <>
                    <option value="true">Đúng</option>
                    <option value="false">Sai</option>
                  </>
                ) : (
                  ["a", "b", "c", "d"].map((key) => (
                    <option value={key} key={key}>
                      {key.toUpperCase()}
                    </option>
                  ))
                )}
              </select>
            </label>
            <div className="actions wide">
              <button className="button pink">
                {editQuestion ? "LƯU CÂU HỎI" : "THÊM CÂU HỎI"}
              </button>
              {editQuestion && (
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => {
                    setEditQuestion(undefined)
                    setQuestionForm(emptyQuestion)
                  }}
                >
                  HỦY
                </button>
              )}
            </div>
          </form>
          {questions.map((question) => (
            <div className="admin-row" key={question.id}>
              <strong>{question.question_text}</strong>
              <span>{question.question_type}</span>
              <button
                className="button small"
                onClick={() => {
                  setEditQuestion(question)
                  setQuestionForm(question)
                }}
              >
                SỬA
              </button>
              {confirming === `question-${question.id}` ? (
                <button
                  className="button danger small"
                  onClick={() => {
                    call(async () => {
                      await api(`/admin/questions/${question.id}`, {
                        method: "DELETE",
                      })
                      await openQuestions(selected)
                    }, "Đã xóa câu hỏi.")
                    setConfirming("")
                  }}
                >
                  XÁC NHẬN XÓA
                </button>
              ) : (
                <button
                  className="button small"
                  onClick={() => setConfirming(`question-${question.id}`)}
                >
                  XÓA
                </button>
              )}
            </div>
          ))}
        </section>
      )}
      <section className="admin-results">
        <div className="section-title">
          <h2>Kết quả gần đây</h2>
          <span>{analytics.sessions} PHIÊN</span>
        </div>
        {results.slice(0, 10).map((item: any) => (
          <div className="history-row" key={item.id}>
            <span>
              {item.username} · {item.title}
            </span>
            <span>
              {item.score == null ? "Chưa xong" : `${Math.round(item.score)}%`}
            </span>
            <span>{item.wpm} WPM</span>
          </div>
        ))}
      </section>
    </main>
  )
}

function Admin() {
  const blankDocument = {
    title: "",
    description: "",
    content: "",
    rsvp_level: 1,
    wpm: 300,
    status: "draft",
  }
  const blankQuestion = {
    question_type: "multiple_choice",
    question_text: "",
    option_a: "",
    option_b: "",
    option_c: "",
    option_d: "",
    correct_option: "a",
  }
  const [documents, setDocuments] = useState<any[]>()
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [creating, setCreating] = useState(false)
  const [tab, setTab] = useState<"content" | "questions" | "levels">("content")
  const [draft, setDraft] = useState<any>(blankDocument)
  const [baseline, setBaseline] = useState<any>(blankDocument)
  const [questions, setQuestions] = useState<any[]>([])
  const [questionDraft, setQuestionDraft] = useState<any>(blankQuestion)
  const [editingQuestionId, setEditingQuestionId] = useState<number | null>(
    null
  )
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [levelFilter, setLevelFilter] = useState("all")
  const [pendingId, setPendingId] = useState<number | null>(null)
  const [confirmQuestionId, setConfirmQuestionId] = useState<number | null>(
    null
  )
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [saving, setSaving] = useState(false)
  const isNew = creating
  const dirty = JSON.stringify(draft) !== JSON.stringify(baseline)
  const load = () => {
    setError("")
    api("/admin/documents")
      .then(setDocuments)
      .catch((value: any) => setError(value.message))
  }
  useEffect(load, [])
  const selectDocument = async (
    id: number | null,
    nextTab: "content" | "questions" = "content",
    discard = false
  ) => {
    if (dirty && !discard && selectedId !== id) {
      setPendingId(id)
      return
    }
    setError("")
    setMessage("")
    setPendingId(null)
    setSelectedId(id)
    setTab(nextTab)
    setEditingQuestionId(null)
    setQuestionDraft(blankQuestion)
    if (id === null) {
      setCreating(true)
      setDraft(blankDocument)
      setBaseline(blankDocument)
      setQuestions([])
      return
    }
    setCreating(false)
    const doc = documents?.find((item) => item.id === id)
    if (!doc) return
    const form = {
      title: doc.title,
      description: doc.description,
      content: doc.content,
      rsvp_level: doc.rsvp_level,
      wpm: doc.wpm,
      status: doc.status,
    }
    setDraft(form)
    setBaseline(form)
    try {
      setQuestions(await api(`/admin/documents/${id}/questions`))
    } catch (value: any) {
      setError(value.message)
    }
  }
  const updateDocument = (document: any) =>
    setDocuments((items) =>
      items?.map((item) =>
        item.id === document.id ? { ...item, ...document } : item
      )
    )
  const saveDocument = async () => {
    setSaving(true)
    setError("")
    setMessage("")
    try {
      const saved = await api(
        isNew ? "/admin/documents" : `/admin/documents/${selectedId}`,
        { method: isNew ? "POST" : "PATCH", body: JSON.stringify(draft) }
      )
      const next = {
        ...saved,
        question_count: isNew
          ? 0
          : documents?.find((item) => item.id === saved.id)?.question_count ||
            0,
        session_count: isNew
          ? 0
          : documents?.find((item) => item.id === saved.id)?.session_count || 0,
      }
      setDocuments((items) =>
        isNew
          ? [...(items || []), next]
          : items?.map((item) =>
              item.id === next.id ? { ...item, ...next } : item
            )
      )
      setSelectedId(next.id)
      setCreating(false)
      setDraft({
        title: next.title,
        description: next.description,
        content: next.content,
        rsvp_level: next.rsvp_level,
        wpm: next.wpm,
        status: next.status,
      })
      setBaseline({
        title: next.title,
        description: next.description,
        content: next.content,
        rsvp_level: next.rsvp_level,
        wpm: next.wpm,
        status: next.status,
      })
      setMessage(isNew ? "Đã tạo bản nháp." : "Đã lưu văn bản.")
    } catch (value: any) {
      setError(value.message)
    } finally {
      setSaving(false)
    }
  }
  const setStatus = async (status: string) => {
    if (!selectedId) return
    setSaving(true)
    setError("")
    try {
      const saved = await api(`/admin/documents/${selectedId}`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      })
      updateDocument(saved)
      setDraft((value: any) => ({ ...value, status: saved.status }))
      setBaseline((value: any) => ({ ...value, status: saved.status }))
      setMessage(
        status === "draft" ? "Đã chuyển về bản nháp." : "Đã phát hành văn bản."
      )
    } catch (value: any) {
      setError(value.message)
    } finally {
      setSaving(false)
    }
  }
  const saveQuestion = async () => {
    if (!selectedId) return
    setSaving(true)
    setError("")
    try {
      const payload = editingQuestionId
        ? questionDraft
        : { ...questionDraft, order_index: questions.length + 1 }
      const saved = await api(
        editingQuestionId
          ? `/admin/questions/${editingQuestionId}`
          : `/admin/documents/${selectedId}/questions`,
        {
          method: editingQuestionId ? "PATCH" : "POST",
          body: JSON.stringify(payload),
        }
      )
      setQuestions((items) =>
        editingQuestionId
          ? items.map((item) => (item.id === saved.id ? saved : item))
          : [...items, saved].sort(
              (a, b) => a.order_index - b.order_index || a.id - b.id
            )
      )
      setDocuments((items) =>
        items?.map((item) =>
          item.id === selectedId
            ? {
                ...item,
                question_count: editingQuestionId
                  ? item.question_count
                  : item.question_count + 1,
              }
            : item
        )
      )
      setQuestionDraft(blankQuestion)
      setEditingQuestionId(null)
      setMessage(editingQuestionId ? "Đã lưu câu hỏi." : "Đã thêm câu hỏi.")
    } catch (value: any) {
      setError(value.message)
    } finally {
      setSaving(false)
    }
  }
  const reorderQuestions = async (from: number, to: number) => {
    if (!selectedId || to < 0 || to >= questions.length) return
    const next = [...questions]
    const [moved] = next.splice(from, 1)
    next.splice(to, 0, moved)
    setQuestions(next)
    try {
      setQuestions(
        await api(`/admin/documents/${selectedId}/questions/reorder`, {
          method: "POST",
          body: JSON.stringify({ question_ids: next.map((item) => item.id) }),
        })
      )
    } catch (value: any) {
      setError(value.message)
      setQuestions(questions)
    }
  }
  const removeQuestion = async (id: number) => {
    setSaving(true)
    try {
      await api(`/admin/questions/${id}`, { method: "DELETE" })
      setQuestions((items) => items.filter((item) => item.id !== id))
      setDocuments((items) =>
        items?.map((item) =>
          item.id === selectedId
            ? { ...item, question_count: Math.max(0, item.question_count - 1) }
            : item
        )
      )
      setConfirmQuestionId(null)
      setMessage("Đã xóa câu hỏi.")
    } catch (value: any) {
      setError(value.message)
    } finally {
      setSaving(false)
    }
  }
  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "s" &&
        tab === "content"
      ) {
        event.preventDefault()
        if (!saving && (dirty || isNew)) saveDocument()
      }
      if (event.key === "Escape" && tab === "content") {
        setDraft(baseline)
        setPendingId(null)
      }
    }
    window.addEventListener("keydown", shortcut)
    return () => window.removeEventListener("keydown", shortcut)
  }, [tab, saving, dirty, isNew, draft, baseline, selectedId])
  if (!documents) return <Loading label="Đang tải bàn làm việc quản trị..." />
  const visibleDocuments = documents.filter(
    (doc) =>
      (statusFilter === "all" || doc.status === statusFilter) &&
      (levelFilter === "all" || String(doc.rsvp_level) === levelFilter) &&
      doc.title.toLowerCase().includes(search.toLowerCase())
  )
  return (
    <main id="main-content" className="admin-workspace">
      <header className="admin-workspace-head">
        <div>
          <p className="kicker">QUẢN TRỊ / THƯ VIỆN</p>
          <h1>Soạn và phát hành.</h1>
        </div>
        <button
          className="button pink"
          onClick={() => selectDocument(null)}
          disabled={saving}
        >
          BÀI MỚI
        </button>
      </header>
      <Notice error={error} success={message} />
      {pendingId !== null && (
        <section className="unsaved-bar" role="alert">
          <span>Văn bản hiện tại có thay đổi chưa lưu.</span>
          <div>
            <button
              className="button small"
              onClick={() => {
                setDraft(baseline)
                selectDocument(pendingId, "content", true)
              }}
            >
              BỎ THAY ĐỔI
            </button>
            <button
              className="button pink small"
              onClick={async () => {
                await saveDocument()
                selectDocument(pendingId, "content", true)
              }}
            >
              LƯU RỒI CHUYỂN
            </button>
          </div>
        </section>
      )}
      <div className="admin-workspace-grid">
        <aside className="admin-sidebar">
          <div className="sidebar-head">
            <h2>Văn bản</h2>
            <button
              className={tab === "levels" ? "side-link active" : "side-link"}
              onClick={() => {
                setSelectedId(null)
                setCreating(false)
                setTab("levels")
              }}
            >
              QUY TẮC MỞ CẤP
            </button>
          </div>
          <label className="search-field">
            Tìm văn bản
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Tiêu đề..."
            />
          </label>
          <div className="filter-row">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
            >
              <option value="all">Mọi trạng thái</option>
              <option value="published">Đã phát hành</option>
              <option value="draft">Bản nháp</option>
            </select>
            <select
              value={levelFilter}
              onChange={(event) => setLevelFilter(event.target.value)}
            >
              <option value="all">Mọi cấp</option>
              {[1, 2, 3, 4].map((value) => (
                <option value={value} key={value}>
                  Cấp {value}
                </option>
              ))}
            </select>
          </div>
          <div className="document-list">
            {visibleDocuments.map((doc) => (
              <button
                className={
                  selectedId === doc.id && tab !== "levels"
                    ? "document-item selected"
                    : "document-item"
                }
                key={doc.id}
                onClick={() => selectDocument(doc.id)}
              >
                <span className="document-title">{doc.title}</span>
                <span className="document-meta">
                  CẤP {doc.rsvp_level} · {doc.question_count} CÂU ·{" "}
                  {doc.status === "published" ? "ĐÃ PHÁT HÀNH" : "NHÁP"}
                </span>
              </button>
            ))}
            {visibleDocuments.length === 0 && (
              <p className="sidebar-empty">Không có văn bản phù hợp.</p>
            )}
          </div>
        </aside>
        <section className="admin-pane">
          {tab === "levels" ? (
            <>
              <div className="pane-title">
                <div>
                  <p className="kicker">QUY TẮC TIẾN CẤP</p>
                  <h2>Hoàn thành theo cấp</h2>
                </div>
              </div>
              <div className="level-rules">
                <p>
                  Học sinh phải đọc hết mọi bài đang phát hành bằng đúng cấp
                  RSVP của bài.
                </p>
                <p>
                  Tỷ lệ tích lũy phải đạt ít nhất 2/3 số câu trả lời đúng. Mọi
                  lần làm lại đều được cộng vào cả số đúng và tổng lượt trả lời.
                </p>
                <p>
                  Cấp không có câu hỏi được hoàn thành sau khi học sinh đọc hết
                  tất cả bài.
                </p>
              </div>
            </>
          ) : !selectedId && !isNew ? (
            <div className="workspace-empty">
              <p className="kicker">THƯ VIỆN VĂN BẢN</p>
              <h2>Chọn một văn bản để chỉnh sửa.</h2>
              <p>Hoặc tạo bản nháp mới để bắt đầu nội dung và câu hỏi.</p>
              <button
                className="button pink"
                onClick={() => selectDocument(null)}
              >
                BÀI MỚI
              </button>
            </div>
          ) : (
            <>
              <div className="pane-title">
                <div>
                  <p className="kicker">
                    {isNew
                      ? "BẢN NHÁP MỚI"
                      : draft.status === "published"
                        ? "ĐÃ PHÁT HÀNH"
                        : "BẢN NHÁP"}
                  </p>
                  <h2>
                    {isNew ? "Tạo văn bản" : draft.title || "Chưa có tiêu đề"}
                  </h2>
                </div>
                <div className="pane-actions">
                  {!isNew && (
                    <button
                      className="button ghost small"
                      onClick={() =>
                        setStatus(
                          draft.status === "published" ? "draft" : "published"
                        )
                      }
                      disabled={saving}
                    >
                      {draft.status === "published"
                        ? "CHUYỂN NHÁP"
                        : "PHÁT HÀNH"}
                    </button>
                  )}
                  <button
                    className="button pink small"
                    onClick={saveDocument}
                    disabled={saving || (!dirty && !isNew)}
                  >
                    {saving ? "ĐANG LƯU" : "LƯU"}
                  </button>
                </div>
              </div>
              <div className="admin-tabs" role="tablist">
                <button
                  className={tab === "content" ? "active" : ""}
                  onClick={() => setTab("content")}
                  role="tab"
                >
                  NỘI DUNG
                </button>
                <button
                  className={tab === "questions" ? "active" : ""}
                  onClick={() => setTab("questions")}
                  role="tab"
                  disabled={isNew}
                >
                  CÂU HỎI {!isNew && `(${questions.length})`}
                </button>
              </div>
              {tab === "content" ? (
                <form
                  className="workspace-form"
                  onSubmit={(event) => {
                    event.preventDefault()
                    saveDocument()
                  }}
                >
                  <label>
                    Tiêu đề
                    <input
                      required
                      value={draft.title}
                      onChange={(event) =>
                        setDraft({ ...draft, title: event.target.value })
                      }
                      autoFocus={isNew}
                    />
                  </label>
                  <label>
                    Mô tả ngắn
                    <input
                      value={draft.description}
                      onChange={(event) =>
                        setDraft({ ...draft, description: event.target.value })
                      }
                    />
                  </label>
                  <div className="form-split">
                    <label>
                      Cấp RSVP
                      <select
                        value={draft.rsvp_level}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            rsvp_level: Number(event.target.value),
                          })
                        }
                      >
                        {[1, 2, 3, 4].map((value) => (
                          <option key={value} value={value}>
                            Cấp {value}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      WPM gợi ý
                      <input
                        type="number"
                        min="60"
                        max="1200"
                        value={draft.wpm}
                        onChange={(event) =>
                          setDraft({
                            ...draft,
                            wpm: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                  </div>
                  <label>
                    Nội dung
                    <textarea
                      required
                      rows={18}
                      value={draft.content}
                      onChange={(event) =>
                        setDraft({ ...draft, content: event.target.value })
                      }
                    />
                  </label>
                  <div className="form-footer">
                    <span>{dirty ? "Có thay đổi chưa lưu" : "Đã lưu"}</span>
                    <button
                      className="button pink"
                      disabled={saving || (!dirty && !isNew)}
                    >
                      {saving ? "ĐANG LƯU" : "LƯU VĂN BẢN"}
                    </button>
                  </div>
                </form>
              ) : (
                <section className="question-workspace">
                  <div className="question-editor">
                    <h3>
                      {editingQuestionId ? "Sửa câu hỏi" : "Thêm câu hỏi"}
                    </h3>
                    <div className="form-split">
                      <label>
                        Loại
                        <select
                          value={questionDraft.question_type}
                          onChange={(event) =>
                            setQuestionDraft({
                              ...questionDraft,
                              question_type: event.target.value,
                              correct_option:
                                event.target.value === "true_false"
                                  ? "true"
                                  : "a",
                            })
                          }
                        >
                          <option value="multiple_choice">
                            Nhiều lựa chọn
                          </option>
                          <option value="true_false">Đúng / Sai</option>
                        </select>
                      </label>
                      <label>
                        Đáp án đúng
                        <select
                          value={questionDraft.correct_option}
                          onChange={(event) =>
                            setQuestionDraft({
                              ...questionDraft,
                              correct_option: event.target.value,
                            })
                          }
                        >
                          {questionDraft.question_type === "true_false" ? (
                            <>
                              <option value="true">Đúng</option>
                              <option value="false">Sai</option>
                            </>
                          ) : (
                            ["a", "b", "c", "d"].map((key) => (
                              <option value={key} key={key}>
                                {key.toUpperCase()}
                              </option>
                            ))
                          )}
                        </select>
                      </label>
                    </div>
                    <label>
                      Nội dung câu hỏi
                      <input
                        value={questionDraft.question_text}
                        onChange={(event) =>
                          setQuestionDraft({
                            ...questionDraft,
                            question_text: event.target.value,
                          })
                        }
                      />
                    </label>
                    {questionDraft.question_type === "multiple_choice" && (
                      <div className="question-options">
                        {["a", "b", "c", "d"].map((key) => (
                          <label key={key}>
                            Lựa chọn {key.toUpperCase()}
                            <input
                              value={questionDraft[`option_${key}`]}
                              onChange={(event) =>
                                setQuestionDraft({
                                  ...questionDraft,
                                  [`option_${key}`]: event.target.value,
                                })
                              }
                            />
                          </label>
                        ))}
                      </div>
                    )}
                    <div className="form-footer">
                      <button
                        className="button ghost"
                        onClick={() => {
                          setEditingQuestionId(null)
                          setQuestionDraft(blankQuestion)
                        }}
                      >
                        HỦY
                      </button>
                      <button
                        className="button pink"
                        onClick={saveQuestion}
                        disabled={saving || !questionDraft.question_text}
                      >
                        LƯU CÂU HỎI
                      </button>
                    </div>
                  </div>
                  <div className="question-list">
                    {questions.map((question, index) => (
                      <article className="question-item" key={question.id}>
                        <div className="question-order">
                          <button
                            aria-label="Đưa câu hỏi lên"
                            disabled={index === 0 || saving}
                            onClick={() => reorderQuestions(index, index - 1)}
                          >
                            ↑
                          </button>
                          <button
                            aria-label="Đưa câu hỏi xuống"
                            disabled={index === questions.length - 1 || saving}
                            onClick={() => reorderQuestions(index, index + 1)}
                          >
                            ↓
                          </button>
                        </div>
                        <button
                          className="question-summary"
                          onClick={() => {
                            setEditingQuestionId(question.id)
                            setQuestionDraft(question)
                          }}
                        >
                          <b>
                            {index + 1}. {question.question_text}
                          </b>
                          <small>
                            {question.question_type === "true_false"
                              ? "Đúng / Sai"
                              : "Nhiều lựa chọn"}
                          </small>
                        </button>
                        {confirmQuestionId === question.id ? (
                          <button
                            className="button danger small"
                            onClick={() => removeQuestion(question.id)}
                            disabled={saving}
                          >
                            XÁC NHẬN
                          </button>
                        ) : (
                          <button
                            className="icon-button"
                            aria-label="Xóa câu hỏi"
                            onClick={() => setConfirmQuestionId(question.id)}
                          >
                            ×
                          </button>
                        )}
                      </article>
                    ))}
                    {questions.length === 0 && (
                      <p className="sidebar-empty">
                        Chưa có câu hỏi. Thêm câu hỏi đầu tiên ở biểu mẫu bên
                        trên.
                      </p>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  )
}

function NotFound() {
  return (
    <main id="main-content" className="state">
      <p className="kicker">404</p>
      <h1>Không tìm thấy trang.</h1>
      <Link className="button pink" to="/">
        VỀ TRANG CHỦ
      </Link>
    </main>
  )
}
function Guard({ user, role, children }: any) {
  if (!user) return <Navigate to="/login" replace />
  if (role && user.role !== role) return <Navigate to="/dashboard" replace />
  return children
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
    api("/auth/logout", { method: "POST" }).finally(() => setUser(null))
  if (!ready)
    return (
      <>
        <a className="skip-link" href="#main-content">
          Bỏ qua điều hướng
        </a>
        <Nav user={null} logout={logout} />
        <Loading label="Đang khởi động RSVP Lab..." />
      </>
    )
  return (
    <>
      <a className="skip-link" href="#main-content">
        Bỏ qua điều hướng
      </a>
      <PageTitle />
      <Nav user={user} logout={logout} />
      <Routes>
        <Route
          path="/"
          element={user ? <Navigate to="/dashboard" replace /> : <Landing />}
        />
        <Route
          path="/login"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Auth mode="login" onAuth={setUser} />
            )
          }
        />
        <Route
          path="/register"
          element={
            user ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Auth mode="register" onAuth={setUser} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            <Guard user={user}>
              <Dashboard user={user} />
            </Guard>
          }
        />
        <Route
          path="/read/:id/setup"
          element={
            <Guard user={user}>
              <Setup />
            </Guard>
          }
        />
        <Route
          path="/read/:id/questions"
          element={
            <Guard user={user}>
              <Questions />
            </Guard>
          }
        />
        <Route
          path="/read/:id/result"
          element={
            <Guard user={user}>
              <Result />
            </Guard>
          }
        />
        <Route
          path="/read/:id"
          element={
            <Guard user={user}>
              <Reader />
            </Guard>
          }
        />
        <Route
          path="/admin"
          element={
            <Guard user={user} role="admin">
              <Admin />
            </Guard>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  )
}

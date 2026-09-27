export async function api(path: string, options: RequestInit = {}) {
  const response = await fetch(`/api${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.error || "Request failed")
  return data
}

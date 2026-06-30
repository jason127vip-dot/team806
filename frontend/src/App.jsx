import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function apiRequest(path, options = {}, token = null) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      data.detail ||
      data.non_field_errors?.join(" ") ||
      Object.values(data).flat().join(" ") ||
      "Request failed.";
    throw new Error(message);
  }

  return data;
}

function AuthPage({ onAuthenticated }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const payload = isRegister
        ? form
        : { username: form.username, password: form.password };
      const data = await apiRequest(`/auth/${mode}/`, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      onAuthenticated(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel" aria-label="Authentication">
        <div className="brand-block">
          <span className="brand-mark">TS</span>
          <div>
            <h1>TaskSphere</h1>
            <p>Manage daily tasks for small teams and freelancers.</p>
          </div>
        </div>

        <div className="mode-switch" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === "login" ? "active" : ""}
            onClick={() => setMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={mode === "register" ? "active" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <label>
            Username
            <input
              name="username"
              value={form.username}
              onChange={updateField}
              autoComplete="username"
              required
            />
          </label>

          {isRegister && (
            <label>
              Email
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={updateField}
                autoComplete="email"
              />
            </label>
          )}

          <label>
            Password
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={8}
              required
            />
          </label>

          {error && <p className="form-error">{error}</p>}

          <button className="primary-action" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isRegister ? "Create account" : "Login"}
          </button>
        </form>
      </section>
    </main>
  );
}

function HomePage({ session, onLogout }) {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: "", description: "", status: "todo" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const statusCounts = useMemo(
    () =>
      tasks.reduce(
        (counts, task) => ({
          ...counts,
          [task.status]: (counts[task.status] || 0) + 1,
        }),
        { todo: 0, in_progress: 0, completed: 0 },
      ),
    [tasks],
  );

  useEffect(() => {
    loadTasks();
  }, []);

  async function loadTasks() {
    setIsLoading(true);
    setError("");
    try {
      const data = await apiRequest("/tasks/", {}, session.token);
      setTasks(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  async function createTask(event) {
    event.preventDefault();
    setError("");
    try {
      const task = await apiRequest(
        "/tasks/",
        {
          method: "POST",
          body: JSON.stringify(form),
        },
        session.token,
      );
      setTasks((current) => [task, ...current]);
      setForm({ title: "", description: "", status: "todo" });
    } catch (err) {
      setError(err.message);
    }
  }

  async function updateTaskStatus(task, status) {
    setError("");
    try {
      const updated = await apiRequest(
        `/tasks/${task.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({ status }),
        },
        session.token,
      );
      setTasks((current) => current.map((item) => (item.id === updated.id ? updated : item)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeTask(taskId) {
    setError("");
    try {
      await apiRequest(`/tasks/${taskId}/`, { method: "DELETE" }, session.token);
      setTasks((current) => current.filter((task) => task.id !== taskId));
    } catch (err) {
      setError(err.message);
    }
  }

  async function logout() {
    try {
      await apiRequest("/auth/logout/", { method: "POST" }, session.token);
    } finally {
      onLogout();
    }
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <span className="eyebrow">TaskSphere Dashboard</span>
          <h1>Welcome, {session.user.username}</h1>
        </div>
        <button className="ghost-action" type="button" onClick={logout}>
          Logout
        </button>
      </header>

      <section className="summary-grid" aria-label="Task summary">
        <article>
          <strong>{statusCounts.todo}</strong>
          <span>To Do</span>
        </article>
        <article>
          <strong>{statusCounts.in_progress}</strong>
          <span>In Progress</span>
        </article>
        <article>
          <strong>{statusCounts.completed}</strong>
          <span>Completed</span>
        </article>
      </section>

      <section className="workspace-grid">
        <form className="task-form" onSubmit={createTask}>
          <h2>Create task</h2>
          <label>
            Title
            <input
              value={form.title}
              onChange={(event) => setForm({ ...form, title: event.target.value })}
              required
            />
          </label>
          <label>
            Description
            <textarea
              value={form.description}
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              rows="5"
            />
          </label>
          <label>
            Status
            <select
              value={form.status}
              onChange={(event) => setForm({ ...form, status: event.target.value })}
            >
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <button className="primary-action" type="submit">
            Add task
          </button>
        </form>

        <section className="task-list" aria-label="Tasks">
          <div className="section-heading">
            <h2>My tasks</h2>
            <button className="text-action" type="button" onClick={loadTasks}>
              Refresh
            </button>
          </div>

          {error && <p className="form-error">{error}</p>}
          {isLoading && <p className="empty-state">Loading tasks...</p>}
          {!isLoading && tasks.length === 0 && (
            <p className="empty-state">No tasks yet. Create your first task.</p>
          )}
          <div className="task-stack">
            {tasks.map((task) => (
              <article className="task-card" key={task.id}>
                <div>
                  <h3>{task.title}</h3>
                  {task.description && <p>{task.description}</p>}
                </div>
                <div className="task-actions">
                  <select
                    value={task.status}
                    onChange={(event) => updateTaskStatus(task, event.target.value)}
                    aria-label={`Status for ${task.title}`}
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button type="button" onClick={() => removeTask(task.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function App() {
  const [session, setSession] = useState(() => {
    const raw = localStorage.getItem("tasksphere-session");
    return raw ? JSON.parse(raw) : null;
  });

  function handleAuthenticated(data) {
    localStorage.setItem("tasksphere-session", JSON.stringify(data));
    setSession(data);
  }

  function handleLogout() {
    localStorage.removeItem("tasksphere-session");
    setSession(null);
  }

  return session ? (
    <HomePage session={session} onLogout={handleLogout} />
  ) : (
    <AuthPage onAuthenticated={handleAuthenticated} />
  );
}

createRoot(document.getElementById("root")).render(<App />);

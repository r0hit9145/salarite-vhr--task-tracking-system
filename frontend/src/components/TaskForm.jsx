import { useState } from "react";
import { api } from "../api";

const EMPTY = { title: "", description: "", priority: "medium", due_date: "", assigned_to: "" };

export default function TaskForm({ hrUsers, onCreated }) {
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            await api.post("/tasks", {
                title: form.title.trim(),
                description: form.description.trim(),
                priority: form.priority,
                due_date: form.due_date || null,
                assigned_to: Number(form.assigned_to),
            });
            setForm(EMPTY);
            onCreated();   // refresh the dashboard immediately instead of waiting for the next poll
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={submit}>
            <label>Title</label>
            <input value={form.title} onChange={set("title")} placeholder="e.g. Screen 20 resumes" required />

            <label>Description</label>
            <textarea rows={3} value={form.description} onChange={set("description")} />

            <label>Assign to</label>
            <select value={form.assigned_to} onChange={set("assigned_to")} required>
                <option value="">Select a Virtual HR</option>
                {hrUsers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                ))}
            </select>

            <label>Priority</label>
            <select value={form.priority} onChange={set("priority")}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
            </select>

            <label>Due date (optional)</label>
            <input type="date" value={form.due_date} onChange={set("due_date")} />

            {error && <div className="error">{error}</div>}

            <button className="btn" type="submit" disabled={saving}>
                {saving ? "Assigning..." : "Assign task"}
            </button>
        </form>
    );
}
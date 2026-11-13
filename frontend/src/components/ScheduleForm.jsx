import { useState } from "react";
import { api } from "../api";

const EMPTY = { candidate_name: "", candidate_email: "", mode: "video", scheduled_at: "", task_id: "" };

export default function ScheduleForm({ tasks, onScheduled }) {
    const [form, setForm] = useState(EMPTY);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const set = (field) => (e) => setForm({ ...form, [field]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            await api.post("/interviews", {
                candidate_name: form.candidate_name.trim(),
                candidate_email: form.candidate_email.trim(),
                mode: form.mode,
                // datetime-local gives local time with no zone; toISOString() converts it to UTC ("...Z")
                scheduled_at: new Date(form.scheduled_at).toISOString(),
                task_id: form.task_id ? Number(form.task_id) : null,
            });
            setForm(EMPTY);
            onScheduled();
        } catch (err) {
            setError(err.message);   // e.g. 409 "You already have an interview in that time slot"
        } finally {
            setSaving(false);
        }

    };

    return (
        <form onSubmit={submit}>
            <label>Candidate name</label>
            <input value={form.candidate_name} onChange={set("candidate_name")} required />

            <label>Candidate email</label>
            <input type="email" value={form.candidate_email} onChange={set("candidate_email")} required />

            <label>Interview mode</label>
            <select value={form.mode} onChange={set("mode")}>
                <option value="voice">Voice</option>
                <option value="video">Video</option>
                <option value="chat">Chat</option>
            </select>

            <label>Date and time</label>
            <input type="datetime-local" value={form.scheduled_at} onChange={set("scheduled_at")} required />

            <label>Linked task (optional)</label>
            <select value={form.task_id} onChange={set("task_id")}>
                <option value="">No linked task</option>
                {tasks.filter((t) => t.status !== "done").map((t) => (
                    <option key={t.id} value={t.id}>{t.title}</option>
                ))}
            </select>

            {error && <div className="error">{error}</div>}

            <button className="btn" type="submit" disabled={saving}>
                {saving ? "Scheduling..." : "Schedule interview"}

            </button>
        </form>
    );
}
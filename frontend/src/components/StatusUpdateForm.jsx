import { useState } from "react";
import { api } from "../api";

export default function StatusUpdateForm({ task, onSaved }) {
    const [status, setStatus] = useState(task.status);
    const [note, setNote] = useState("");
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setError("");
        setSaving(true);
        try {
            await api.patch(`/tasks/${task.id}/status`, { status, note: note.trim() });
            setNote("");
            onSaved();
        } catch (err) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="status-form" onSubmit={submit}>
            <h3>Update progress</h3>

            <label>Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="pending">Pending</option>
                <option value="in_progress">In progress</option>

                <option value="done">Done</option>
            </select>

            <label>Progress note (visible to employer)</label>
            <textarea
                rows={2}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Shortlisted 5 candidates, waiting on feedback"
            />

            {error && <div className="error">{error}</div>}

            <button className="btn" type="submit" disabled={saving}>
                {saving ? "Saving..." : "Save update"}
            </button>
        </form>
    );
}
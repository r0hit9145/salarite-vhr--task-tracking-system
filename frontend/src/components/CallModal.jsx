import { useEffect, useState } from "react";
import { api } from "../api";

const MODES = {
    voice: { icon: "🎙️", title: "Voice call" },
    video: { icon: "📹", title: "Video call" },
    chat: { icon: "💬", title: "Chat session" },
};

export default function CallModal({ interview, onClose, onCompleted }) {
    const [session, setSession] = useState(null);
    const [error, setError] = useState("");
    const mode = MODES[interview.mode];

    useEffect(() => {
        api.post(`/interviews/${interview.id}/start`)
            .then(setSession)
            .catch((err) => setError(err.message));
    }, [interview.id]);

    const endAndComplete = async () => {
        try {
            await api.patch(`/interviews/${interview.id}/status`, { status: "completed" });
            onCompleted();
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h3>{mode.title} with {interview.candidate_name}</h3>

                {error && <div className="error">{error}</div>}
                {!session && !error && <p>Starting session...</p>}

                {session && (
                    <div className="call-box">
                        <div className="call-icon">{mode.icon}</div>
                        <p><strong>Room:</strong> {session.room_id}</p>
                        <p className="muted">{session.message}</p>
                    </div>
                )}

                <button className="btn btn-secondary" onClick={onClose}>End session</button>
                <button className="btn" onClick={endAndComplete}>End &amp; mark completed</button>
            </div>
        </div>
    );
}
import { api } from "../api";
import usePolling from "../hooks/usePolling";
import { formatDate, formatDateTime } from "../utils/date";
import LiveIndicator from "./LiveIndicator";
import StatusBadge from "./StatusBadge";

export default function TaskDetail({ taskId, onClose, renderActions }) {
    const { data: task, error, lastUpdated, refresh } = usePolling(
        () => api.get(`/tasks/${taskId}`),
        5000
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-head">
                    <LiveIndicator lastUpdated={lastUpdated} error={error} />
                    <button className="btn btn-secondary" onClick={onClose}>Close</button>
                </div>

                {!task && error && <div className="error">{error}</div>}
                {!task && !error && <p>Loading...</p>}

                {task && (
                    <>
                        <h3>{task.title}</h3>
                        <div className="meta">
                            <StatusBadge status={task.status} />
                            <StatusBadge status={task.priority} />
                            <span>Assigned to: {task.assignee.name}</span>
                            <span>Due: {formatDate(task.due_date)}</span>
                        </div>

                        {task.description && <p>{task.description}</p>}

                        {renderActions && renderActions(task, refresh)}

                        <h3>Activity log</h3>
                        <ul className="timeline">
                            {task.updates.map((u) => (
                                <li key={u.id}>
                                    <div className="timeline-meta">
                                        <strong>{u.author.name}</strong> · <StatusBadge status={u.status} /> · {formatDateTime(u.created_at)}
                                    </div>
                                    {u.note && <div>{u.note}</div>}
                                </li>
                            ))}
                        </ul>
                    </>
                )}
            </div>
        </div>
    );
}
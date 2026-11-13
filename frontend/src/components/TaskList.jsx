import { formatDate, formatDateTime } from "../utils/date";
import StatusBadge from "./StatusBadge";

export default function TaskList({ tasks, selectedId, onSelect, showAssignee = true }) {
    if (tasks.length === 0) return <p className="empty">No tasks to show.</p>;

    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Task</th>
                        {showAssignee && <th>Assigned to</th>}
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Due</th>
                        <th>Updated</th>
                    </tr>
                </thead>
                <tbody>
                    {tasks.map((t) => (
                        <tr
                            key={t.id}
                            className={`clickable ${t.id === selectedId ? "selected" : ""}`}
                            onClick={() => onSelect(t.id)}
                        >
                            <td>{t.title}</td>
                            {showAssignee && <td>{t.assignee.name}</td>}
                            <td><StatusBadge status={t.priority} /></td>
                            <td><StatusBadge status={t.status} /></td>
                            <td>{formatDate(t.due_date)}</td>
                            <td>{formatDateTime(t.updated_at)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
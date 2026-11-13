const LABELS = {
    pending: "Pending",
    in_progress: "In Progress",
    done: "Done",
    scheduled: "Scheduled",
    completed: "Completed",
    cancelled: "Cancelled",
    low: "Low",
    medium: "Medium",
    high: "High",
};

// Used for task status, interview status and priority
export default function StatusBadge({ status }) {
    return <span className={`badge badge-${status}`}>{LABELS[status] ?? status}</span>;
}
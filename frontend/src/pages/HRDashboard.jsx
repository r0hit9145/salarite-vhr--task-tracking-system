import { useState } from "react";
import { api } from "../api";
import CallModal from "../components/CallModal";
import InterviewTable from "../components/InterviewTable";
import Layout from "../components/Layout";
import LiveIndicator from "../components/LiveIndicator";
import ScheduleForm from "../components/ScheduleForm";
import StatusUpdateForm from "../components/StatusUpdateForm";
import TaskDetail from "../components/TaskDetail";
import TaskList from "../components/TaskList";
import usePolling from "../hooks/usePolling";

const fetchDashboard = () => Promise.all([api.get("/tasks"), api.get("/interviews")]);

export default function HRDashboard() {
    const { data, error, lastUpdated, refresh } = usePolling(fetchDashboard, 5000);
    const [selectedId, setSelectedId] = useState(null);
    const [callInterview, setCallInterview] = useState(null);
    const [actionError, setActionError] = useState("");

    const [tasks, interviews] = data ?? [[], []];

    const stats = [
        { label: "My tasks", value: tasks.length },
        { label: "Pending", value: tasks.filter((t) => t.status === "pending").length },
        { label: "In progress", value: tasks.filter((t) => t.status === "in_progress").length },
        { label: "Done", value: tasks.filter((t) => t.status === "done").length },
        { label: "Upcoming interviews", value: interviews.filter((i) => i.status === "scheduled").length },
    ];

    const changeInterview = async (id, status) => {
        if (status === "cancelled" && !window.confirm("Cancel this interview?")) return;
        setActionError("");
        try {
            await api.patch(`/interviews/${id}/status`, { status });
            refresh();
        } catch (err) {
            setActionError(err.message);
        }
    };

    const interviewActions = (i) =>
        i.status === "scheduled" ? (
            <>
                <button className="btn btn-small" onClick={() => setCallInterview(i)}>Start</button>
                <button className="btn btn-small btn-secondary" onClick={() => changeInterview(i.id, "completed")}>Complete</button>
                <button className="btn btn-small btn-danger" onClick={() => changeInterview(i.id, "cancelled")}>Cancel</button>
            </>
        ) : null;

    return (
        <Layout
            title="Virtual HR Dashboard"
            right={<LiveIndicator lastUpdated={lastUpdated} error={error} />}
        >
            {!data && !error && <p>Loading...</p>}
            {!data && error && <div className="error">{error}</div>}

            {data && (
                <>
                    <div className="stats">
                        {stats.map((s) => (
                            <div className="stat" key={s.label}>
                                <div className="stat-value">{s.value}</div>
                                <div className="stat-label">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    <div className="card" style={{ marginBottom: 20 }}>
                        <div className="section-head">
                            <h3>My assigned tasks</h3>
                            <span className="muted">Click a task to update its progress</span>
                        </div>
                        <TaskList tasks={tasks} selectedId={selectedId} onSelect={setSelectedId} showAssignee={false} />
                    </div>

                    <div className="grid">
                        <div className="card">
                            <h3>Schedule an interview</h3>
                            <ScheduleForm tasks={tasks} onScheduled={refresh} />
                        </div>

                        <div className="card">
                            <div className="section-head">
                                <h3>My interviews</h3>
                            </div>
                            {actionError && <div className="error">{actionError}</div>}
                            <InterviewTable interviews={interviews} renderActions={interviewActions} />
                        </div>
                    </div>
                </>
            )}

            {selectedId && (
                <TaskDetail
                    key={selectedId}
                    taskId={selectedId}
                    onClose={() => setSelectedId(null)}
                    renderActions={(task, refreshDetail) => (
                        <StatusUpdateForm
                            task={task}
                            onSaved={() => { refreshDetail(); refresh(); }}
                        />
                    )}
                />
            )}

            {callInterview && (
                <CallModal
                    interview={callInterview}
                    onClose={() => setCallInterview(null)}
                    onCompleted={() => { setCallInterview(null); refresh(); }}
                />
            )}
        </Layout>
    );
}
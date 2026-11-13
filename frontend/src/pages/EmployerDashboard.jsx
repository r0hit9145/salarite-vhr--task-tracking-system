import { useEffect, useState } from "react";
import { api } from "../api";
import InterviewTable from "../components/InterviewTable";
import Layout from "../components/Layout";
import LiveIndicator from "../components/LiveIndicator";
import TaskDetail from "../components/TaskDetail";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import usePolling from "../hooks/usePolling";

// One polling call refreshes tasks and interviews together
const fetchDashboard = () => Promise.all([api.get("/tasks"), api.get("/interviews")]);

export default function EmployerDashboard() {
    const { data, error, lastUpdated, refresh } = usePolling(fetchDashboard, 5000);
    const [hrUsers, setHrUsers] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [filter, setFilter] = useState("");

    useEffect(() => {
        api.get("/users?role=hr").then(setHrUsers).catch(() => { });
    }, []);

    const [tasks, interviews] = data ?? [[], []];
    const visibleTasks = filter ? tasks.filter((t) => t.status === filter) : tasks;

    const stats = [
        { label: "Total tasks", value: tasks.length },
        { label: "Pending", value: tasks.filter((t) => t.status === "pending").length },
        { label: "In progress", value: tasks.filter((t) => t.status === "in_progress").length },
        { label: "Done", value: tasks.filter((t) => t.status === "done").length },
        { label: "Upcoming interviews", value: interviews.filter((i) => i.status === "scheduled").length },

    ];

    return (
        <Layout
            title="Employer Dashboard"
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

                    <div className="grid">
                        <div className="card">
                            <h3>Assign a task</h3>
                            <TaskForm hrUsers={hrUsers} onCreated={refresh} />
                        </div>

                        <div className="card">
                            <div className="section-head">
                                <h3>Tasks</h3>
                                <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                                    <option value="">All statuses</option>

                                    <option value="pending">Pending</option>
                                    <option value="in_progress">In progress</option>
                                    <option value="done">Done</option>
                                </select>
                            </div>
                            <TaskList tasks={visibleTasks} selectedId={selectedId} onSelect={setSelectedId} />
                        </div>
                    </div>

                    <div className="card">
                        <div className="section-head">
                            <h3>Interviews</h3>
                        </div>
                        <InterviewTable interviews={interviews} showHr />
                    </div>
                </>
            )}

            {selectedId && (
                <TaskDetail key={selectedId} taskId={selectedId} onClose={() => setSelectedId(null)} />
            )}
        </Layout>
    );
}
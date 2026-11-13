import { formatDateTime } from "../utils/date";
import StatusBadge from "./StatusBadge";

export default function InterviewTable({ interviews, showHr = false, renderActions }) {
    if (interviews.length === 0) return <p className="empty">No interviews scheduled yet.</p>;

    return (
        <div className="table-wrap">
            <table>
                <thead>
                    <tr>
                        <th>Candidate</th>
                        <th>Mode</th>
                        <th>When</th>
                        {showHr && <th>Virtual HR</th>}
                        <th>Status</th>
                        {renderActions && <th></th>}
                    </tr>
                </thead>
                <tbody>
                    {interviews.map((i) => (
                        <tr key={i.id}>
                            <td>
                                {i.candidate_name}
                                <div className="sub">{i.candidate_email}</div>
                            </td>
                            <td className="cap">{i.mode}</td>
                            <td>{formatDateTime(i.scheduled_at)}</td>
                            {showHr && <td>{i.hr.name}</td>}
                            <td><StatusBadge status={i.status} /></td>
                            {renderActions && <td>{renderActions(i)}</td>}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
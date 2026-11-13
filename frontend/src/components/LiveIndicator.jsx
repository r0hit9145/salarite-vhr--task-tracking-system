import { useEffect, useState } from "react";

export default function LiveIndicator({ lastUpdated, error }) {
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(id);
    }, []);

    if (error) return <span className="live live-error">● Connection issue, retrying...</span>;
    if (!lastUpdated) return <span className="live">Loading...</span>;

    const secs = Math.max(0, Math.round((now - lastUpdated.getTime()) / 1000));
    return (
        <span className="live">
            <span className="dot" /> Live · updated {secs}s ago
        </span>
    );
}
import React, { useEffect, useState } from "react"
import "./ApiStatus.css"
const ApiStatus = () => {
    const [status, setStatus] = useState("Offline");
    useEffect(() => {
        const fetchStatus = async () => {
            try {
                const response = await fetch("http://localhost:3000/status");
                const data = await response.json();
                setStatus(data.status);
            } catch (error) {
                setStatus("offline");
            }
        };
        fetchStatus();
    }, [])
  return (
    <div className="api-status">
      <span className={`bullet status-${status}`}></span>
      <span className="api-status-label">API </span>
      <span className="api-status-value">{status}</span>
    </div>
  )
}

export default ApiStatus

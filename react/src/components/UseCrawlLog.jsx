import react, {useState, useEffect} from 'react';


const UseCrawlLog = () => {
    const [logMessages, setLogMessages] = useState([])
    const [eventSource, setEventSource] = useState(null)
    const startLogStream = (crawlId) => {
        const newEventSource = new EventSource(`http://localhost:3000/logs/stream/${crawlId}`)
        setEventSource(newEventSource)
        setLogMessages([])
    
        newEventSource.onmessage = (event) => {
          const log = JSON.parse(event.data)
          setLogMessages((prevLogs) => [
            ...prevLogs,
            `${log.timestamp} - ${log.level.toUpperCase()}: ${log.message}`
          ])
        }
    
        newEventSource.onerror = () => {
          setLogMessages((prevLogs) => [
            ...prevLogs,
            "An error occurred with the log stream."
          ])
          newEventSource.close()
        }
      }
    
      useEffect(() => {
        return () => {
          if (eventSource) {
            eventSource.close()
          }
        }
      }, [eventSource])

      const CrawlLog = () => {
    return (
    <div>
    <h4>Crawl Log</h4>
    <div
      id="log-container"
      style={{
        height: "200px",
        overflowY: "auto",
        border: "1px solid #ccc",
        padding: "10px"
      }}>
      {logMessages.map((message, index) => (
        <p key={index}>{message}</p>
      ))}
    </div>
  </div>
    )
  }
  return {CrawlLog, startLogStream}
}
export default UseCrawlLog;

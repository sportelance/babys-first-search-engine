import React, { useState, useEffect } from "react"
import "./NotificationQueue.css"

const UseNotifications = () => {
  const [notifications, setNotifications] = useState([])

  const enqueueNotification = (title, message) => {
    if (!title || !message) {
        return
    }
    if (!message) {
        message = title
        title = ""
    }
    if (typeof title === "object") {
        message = title.message
        title = title.title
    }
    setNotifications((prev) => [...prev, { id: Date.now(), title, message }])
  }
  const Notifications = () => {
    useEffect(() => {
      if (notifications.length > 0) {
        const timer = setTimeout(() => {
          setNotifications(notifications.slice(1))
        }, 3000)
        return () => clearTimeout(timer)
      }
    }, [notifications])

    return (
      <>
        <div className="notification-container">
          {notifications.length > 0 && notifications.map((notification) => (
            <div key={notification.id} className="notification">
              <strong>{notification.title}</strong>
              <p>{notification.message}</p>
            </div>
          ))}
        </div>
      </>
    )
  }

  return { Notifications, enqueueNotification }
}

// Export the NotificationProvider and the useNotification hook
export default UseNotifications

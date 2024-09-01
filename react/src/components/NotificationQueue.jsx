import React, { useState, useEffect } from "react"
import "./NotificationQueue.css"

const UseNotifications = (notificationLength=3000) => {
  const [notifications, setNotifications] = useState([])

  const notify = (title, message) => {
    if (!title && !message) {
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
        }, notificationLength)
        return () => clearTimeout(timer)
      }
    }, [notifications])

    return (
      <>
        <div className="notification-container">
          {notifications.length > 0 &&
            notifications.map((notification) => {
              const { title, message, id } = notification
              return (
                <div key={id} className="notification">
                  <strong>{title}</strong>
                  <p>{message}</p>
                </div>
              )
            })}
        </div>
      </>
    )
  }

  return { Notifications, notify }
}

// Export the NotificationProvider and the useNotification hook
export default UseNotifications

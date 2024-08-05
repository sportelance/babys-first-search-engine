import React, { useState, useEffect } from "react"
import Info from "./components/Info"
import Enqueue from "./components/Enqueue"
import Search from "./components/Search"
import { Tabs } from "./components/Tabs"
import ApiStatus from "./components/ApiStatus"
import useNotifications from "./components/NotificationQueue"

import "./App.css"

const App = () => {
 const { enqueueNotification, Notifications } = useNotifications()
  return (
    <div className="container">
      <div className="header">
        <h3>Baby's First Search Engine</h3> <ApiStatus />
      </div>
      <button
        onClick={() => enqueueNotification("Test", "This is a test notification")}>
        Test Notification
      </button>
      <Tabs>
        <Search label="Search" />
        <Enqueue label="Enqueue" popNotification={enqueueNotification} />
        <Info label="Info" />
      </Tabs>

      <Notifications />
    </div>
  )
}

export default App

import React from "react"

import { Routes, Route } from "react-router-dom"
import Enqueue from "./components/Enqueue"
import Search from "./components/Search"
import Layout from "./Layout"
import useNotifications from "./components/NotificationQueue"

import "./App.css"

const App = () => {
  const {Notifications } = useNotifications()
  return (
    <div className="container">
      <div className="header">
        <h3>Baby's First Search Engine</h3>
      </div>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Search />} />
          <Route path="enqueue" element={<Enqueue />} />
        </Route>
      </Routes>

      <Notifications />
    </div>
  )
}

export default App

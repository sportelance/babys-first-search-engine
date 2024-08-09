import React, { useState, useEffect } from "react"
import Info from "./components/Info"
import { Routes, Route, Outlet, Link, useLocation } from "react-router-dom"
import Enqueue from "./components/Enqueue"
import Search from "./components/Search"
import { Tabs } from "./components/Tabs"
import ApiStatus from "./components/ApiStatus"
import useNotifications from "./components/NotificationQueue"

import "./App.css"
function Layout() {
  const location = useLocation();
  return (
    <div>
     <nav >      
        <ul className={"tab-buttons"}>
          <li className={`${location.pathname === "/" ? "active" : ""}`}>
            <Link to="/">Home</Link>
          </li>
          <li className={`${location.pathname === "/enqueue" ? "active" : ""}`}>
            <Link to="enqueue">Enqueue</Link>
          </li>
        </ul>
      </nav>



      <Outlet />
    </div>
  )
}
const App = () => {
  const { enqueueNotification, Notifications } = useNotifications()
  return (
    <div className="container">
      <div className="header">
        <h3>Baby's First Search Engine</h3> <ApiStatus />
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

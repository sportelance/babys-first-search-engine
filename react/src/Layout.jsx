import React from "react"

import {Outlet, Link, useLocation } from "react-router-dom"
import "./components/Tabs.css"

function Layout() {
  const location = useLocation()
  return (
    <div>
      <nav>
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
export default Layout;
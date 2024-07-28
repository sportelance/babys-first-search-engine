import React, { useState, useEffect } from "react"
import Info from "./components/Info"
import Enqueue from "./components/Enqueue"
import Search from "./components/Search"
import {Tabs} from "./components/Tabs"
import "./App.css"

const App = () => {
 

  return (
    <div className="container">
      <h3>Baby's First Search Engine</h3>

      <Tabs>
        <Search label="Search" />
        <Enqueue label="Enqueue" />
        <Info label="Info" />
      </Tabs>
        
     
    </div>
  )
}

export default App

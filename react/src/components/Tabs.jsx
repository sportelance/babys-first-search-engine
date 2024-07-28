import React, { useState } from "react"
import "./Tabs.css"
const Tabs = ({ children }) => {
  const [activeIndex, setActiveIndex] = useState(0)

  const handleTabClick = (index) => {
    setActiveIndex(index)
  }

  return (
    <div>
      <div className="tab-buttons">
        {React.Children.map(children, (child, index) => (
          <div
            data-tab-indicated={child.props.label.toLowerCase()}
            key={index}
            className={index === activeIndex ? "active" : ""}
            onClick={() => handleTabClick(index)}>
            {child.props.label}
          </div>
        ))}
      </div>
      <div className="tabs">
        {React.Children.map(children, (child, index) => 
            <div
            data-tab-indicated={child.props.label.toLowerCase()}
              key={index}
              className={`${index === activeIndex ? "active" : "inactive"} tab`}
              label={child.props.label}>
              {child}
            </div>
          )}
      </div>
    </div>
  )
}


export { Tabs }

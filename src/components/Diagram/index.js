import React, { useState } from "react";

function Diagram() {
  const steps = [
    { label: "SELECT", link: "/select" },
    { label: "FROM", link: "/from" },
    { label: "JOIN", link: "/join" },
    { label: "LEFT JOIN", link: "/left-join" },
    { label: "RIGHT JOIN", link: "/right-join" },
    { label: "WHERE", link: "/where" },
    { label: "GROUP BY", link: "/group-by" },
    { label: "HAVING", link: "/having" },
    { label: "ORDER BY", link: "/order-by" },
    { label: "LIMIT", link: "/limit" },
  ];

  const [hoveredIndex, setHoveredIndex] = useState(null);

  const containerStyle = {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontFamily: "Arial, sans-serif",
  };

  const stepStyle = (isHovered) => ({
    padding: "10px 20px",
    margin: "10px 0",
    border: "1px solid #007bff",
    borderRadius: "5px",
    backgroundColor: isHovered ? "#007bff" : "#f0f8ff",
    color: isHovered ? "white" : "#007bff",
    cursor: "pointer",
    textAlign: "center",
    width: "200px",
    transition: "all 0.3s ease",
  });

  const connectorStyle = {
    width: "2px",
    height: "20px",
    backgroundColor: "#007bff",
  };

  const handleStepClick = (link) => {
    window.location.href = "/docs/sql/select-statement" + link; // Redirect to the appropriate page
  };

  return (
    <div style={containerStyle}>
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div
            style={stepStyle(hoveredIndex === index)}
            onMouseEnter={() => setHoveredIndex(index)}
            onMouseLeave={() => setHoveredIndex(null)}
            onClick={() => handleStepClick(step.link)}
          >
            {step.label}
          </div>
          {index < steps.length - 1 && <div style={connectorStyle}></div>}
        </React.Fragment>
      ))}
    </div>
  );
}

export default Diagram;

import React, { useState } from 'react';
import './PriorityPieChart.css';

const PriorityPieChart = ({ complaints }) => {
  const [hoveredSegment, setHoveredSegment] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });

  const priorityCounts = complaints.reduce((acc, complaint) => {
    const priority = complaint.priority || 'Unknown';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});

  const total = complaints.length;
  const priorities = [
    { name: 'High', count: priorityCounts.High || 0, color: '#e74c3c', hoverColor: '#c0392b' },
    { name: 'Medium', count: priorityCounts.Medium || 0, color: '#f39c12', hoverColor: '#d68910' },
    { name: 'Low', count: priorityCounts.Low || 0, color: '#27ae60', hoverColor: '#229954' }
  ];

  let cumulativePercentage = 0;

  const handleMouseEnter = (priority, event, percentage) => {
    setHoveredSegment(priority.name);
    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      content: `${priority.name}: ${priority.count} (${percentage.toFixed(1)}%)`
    });
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
    setTooltip({ show: false, x: 0, y: 0, content: '' });
  };

  const handleMouseMove = (event) => {
    if (tooltip.show) {
      setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
    }
  };

  return (
    <div className="pie-chart-container">
      <h3>Priority Distribution</h3>
      <div className="pie-chart-wrapper" onMouseMove={handleMouseMove}>
        <div className="chart-svg-container">
          <svg width="220" height="220" viewBox="0 0 220 220">
            <defs>
              <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
                <feDropShadow dx="2" dy="2" stdDeviation="3" floodOpacity="0.3"/>
              </filter>
            </defs>
            <circle cx="110" cy="110" r="90" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.2)" strokeWidth="2" />
            {priorities.map((priority, index) => {
              if (priority.count === 0) return null;
              
              const percentage = (priority.count / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = (cumulativePercentage / 100) * 360;
              
              const radius = hoveredSegment === priority.name ? 95 : 90;
              const x1 = 110 + radius * Math.cos((startAngle - 90) * Math.PI / 180);
              const y1 = 110 + radius * Math.sin((startAngle - 90) * Math.PI / 180);
              const x2 = 110 + radius * Math.cos((startAngle + angle - 90) * Math.PI / 180);
              const y2 = 110 + radius * Math.sin((startAngle + angle - 90) * Math.PI / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              const pathData = `M 110 110 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
              
              cumulativePercentage += percentage;
              
              return (
                <path
                  key={priority.name}
                  d={pathData}
                  fill={hoveredSegment === priority.name ? priority.hoverColor : priority.color}
                  stroke="#fff"
                  strokeWidth="3"
                  filter="url(#shadow)"
                  className="pie-segment"
                  onMouseEnter={(e) => handleMouseEnter(priority, e, percentage)}
                  onMouseLeave={handleMouseLeave}
                />
              );
            })}
            <circle cx="110" cy="110" r="35" fill="rgba(255,255,255,0.9)" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
            <text x="110" y="105" textAnchor="middle" className="chart-center-text">
              Total
            </text>
            <text x="110" y="120" textAnchor="middle" className="chart-center-number">
              {total}
            </text>
          </svg>
        </div>
        
        <div className="pie-chart-legend">
          {priorities.map(priority => (
            <div 
              key={priority.name} 
              className={`legend-item ${hoveredSegment === priority.name ? 'highlighted' : ''}`}
              onMouseEnter={() => setHoveredSegment(priority.name)}
              onMouseLeave={() => setHoveredSegment(null)}
            >
              <div 
                className="legend-color" 
                style={{ backgroundColor: priority.color }}
              ></div>
              <div className="legend-text">
                <span className="legend-name">{priority.name}</span>
                <span className="legend-count">{priority.count} complaints</span>
                <span className="legend-percentage">{total > 0 ? ((priority.count / total) * 100).toFixed(1) : 0}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {tooltip.show && (
        <div 
          className="chart-tooltip"
          style={{ left: tooltip.x + 10, top: tooltip.y - 10 }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default PriorityPieChart;
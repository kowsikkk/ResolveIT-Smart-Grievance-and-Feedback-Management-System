import React, { useState } from 'react';
import './ComplaintColumnChart.css';

const ComplaintColumnChart = ({ complaints }) => {
  const [hoveredBar, setHoveredBar] = useState(null);
  const [tooltip, setTooltip] = useState({ show: false, x: 0, y: 0, content: '' });

  // Get last 7 days
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    last7Days.push(date.toISOString().split('T')[0]);
  }

  const dailyCounts = last7Days.map(date => {
    const count = complaints.filter(complaint => {
      const complaintDate = new Date(complaint.createdAt).toISOString().split('T')[0];
      return complaintDate === date;
    }).length;
    
    const dayName = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });
    return { 
      date, 
      dayName, 
      count, 
      color: '#4299e1' 
    };
  });

  const maxCount = Math.max(...dailyCounts.map(d => d.count), 1);

  const handleMouseEnter = (day, event) => {
    setHoveredBar(day.dayName);
    setTooltip({
      show: true,
      x: event.clientX,
      y: event.clientY,
      content: `${day.dayName}: ${day.count} complaints`
    });
  };

  const handleMouseLeave = () => {
    setHoveredBar(null);
    setTooltip({ show: false, x: 0, y: 0, content: '' });
  };

  const handleMouseMove = (event) => {
    if (tooltip.show) {
      setTooltip(prev => ({ ...prev, x: event.clientX, y: event.clientY }));
    }
  };

  return (
    <div className="column-chart-container">
      <h3>Daily Complaints (Last 7 Days)</h3>
      <div className="column-chart-wrapper" onMouseMove={handleMouseMove}>
        <div className="chart-area">
          <div className="y-axis">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="y-axis-label">
                {maxCount - i}
              </div>
            ))}
          </div>
          <div className="chart-bars">
            {dailyCounts.map((day, index) => (
              <div key={day.date} className="bar-container">
                <div
                  className={`bar ${hoveredBar === day.dayName ? 'hovered' : ''}`}
                  style={{
                    height: day.count === 0 ? '0px' : `${(day.count / maxCount) * 100}%`,
                    backgroundColor: day.color,
                    boxShadow: hoveredBar === day.dayName ? `0 4px 12px ${day.color}40` : 'none'
                  }}
                  onMouseEnter={() => setHoveredBar(day.dayName)}
                  onMouseLeave={() => setHoveredBar(null)}
                >
                  {day.count > 0 && <div className={`bar-value ${hoveredBar === day.dayName ? 'visible' : ''}`}>{day.count}</div>}
                </div>
                <div className="x-axis-label">{day.dayName}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintColumnChart;
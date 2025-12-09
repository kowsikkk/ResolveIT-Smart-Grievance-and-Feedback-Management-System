import React, { useState } from 'react';
import './CategoryChart.css';

const CategoryChart = ({ complaints }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const knownCategories = ['Roads', 'Electricity', 'Water', 'Sanitation', 'Public Safety', 'Traffic'];
  
  const totalComplaints = complaints.length;
  
  const categoryData = complaints.reduce((acc, complaint) => {
    const category = complaint.category && knownCategories.includes(complaint.category) 
      ? complaint.category 
      : 'Other';
    if (!acc[category]) {
      acc[category] = { total: 0 };
    }
    acc[category].total++;
    return acc;
  }, {});

  const allCategories = Object.entries(categoryData).map(([name, data]) => ({
    name,
    ...data
  }));

  const otherCategory = allCategories.find(c => c.name === 'Other');
  const mainCategories = allCategories.filter(c => c.name !== 'Other').sort((a, b) => b.total - a.total);
  const categories = otherCategory ? [...mainCategories, otherCategory] : mainCategories;

  const categoryColors = {
    'Roads': '#3b82f6',
    'Electricity': '#f59e0b',
    'Water': '#06b6d4',
    'Sanitation': '#10b981',
    'Public Safety': '#ef4444',
    'Traffic': '#ec4899',
    'Other': '#8b5cf6'
  };

  return (
    <div className="category-chart-container">
      <div className="chart-header">
        <h3>Complaints by Category</h3>
      </div>

      <div className="category-bars">
        {categories.map((category) => (
          <div 
            key={category.name}
            className={`category-row ${hoveredCategory === category.name ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredCategory(category.name)}
            onMouseLeave={() => setHoveredCategory(null)}
          >
            <div className="category-label">
              <span className="category-name">{category.name}</span>
              <span className="category-count">{category.total}</span>
            </div>
            
            <div className="category-bar-wrapper">
              <div className="category-bar-background">
                <div 
                  className="category-bar-single"
                  style={{ 
                    width: `${(category.total / totalComplaints) * 100}%`,
                    backgroundColor: categoryColors[category.name] || categoryColors['Other']
                  }}
                />
              </div>
              
              {hoveredCategory === category.name && (
                <div className="category-tooltip">
                  <div className="tooltip-row">
                    <span>Complaints:</span>
                    <strong>{category.total}/{totalComplaints}</strong>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {categories.length === 0 && (
        <div className="no-data">No complaint data available</div>
      )}
    </div>
  );
};

export default CategoryChart;

/**
 * Investment Opportunities Visualization Component
 * Displays high-potential investment areas in the E&S insurance market
 */

// Initialize the investment opportunities visualization
function initInvestmentOpportunities() {
    console.log('Initializing Investment Opportunities visualization...');
    
    // Fetch the investment opportunities data
    fetch('data/investment_opportunities.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Investment opportunities data loaded:', data.length, 'opportunities');
            createInvestmentOpportunitiesVisualization(data);
        })
        .catch(error => {
            console.error('Error loading investment opportunities data:', error);
            document.getElementById('investment-opportunities-container').innerHTML = 
                '<p class="error">Error loading investment opportunities data. Please try again later.</p>';
        });
}

// Create the investment opportunities visualization
function createInvestmentOpportunitiesVisualization(data) {
    // Clear the container
    const container = document.getElementById('investment-opportunities-container');
    container.innerHTML = '';
    
    // Create filters
    createFilters(container, data);
    
    // Create the scatter plot
    createScatterPlot(container, data);
    
    // Create the insights panel
    createInsightsPanel(container, data);
}

// Create filter controls
function createFilters(container, data) {
    const filterContainer = document.createElement('div');
    filterContainer.className = 'filters-container';
    
    // Get unique categories and market segments
    const categories = [...new Set(data.map(item => item.category))];
    const segments = [...new Set(data.map(item => item.marketSegment))];
    
    // Create category filter
    const categoryFilter = document.createElement('div');
    categoryFilter.className = 'filter';
    categoryFilter.innerHTML = `
        <label for="category-filter">Category:</label>
        <select id="category-filter">
            <option value="all">All Categories</option>
            ${categories.map(category => `<option value="${category}">${category}</option>`).join('')}
        </select>
    `;
    
    // Create market segment filter
    const segmentFilter = document.createElement('div');
    segmentFilter.className = 'filter';
    segmentFilter.innerHTML = `
        <label for="segment-filter">Market Segment:</label>
        <select id="segment-filter">
            <option value="all">All Segments</option>
            ${segments.map(segment => `<option value="${segment}">${segment}</option>`).join('')}
        </select>
    `;
    
    // Append filters to container
    filterContainer.appendChild(categoryFilter);
    filterContainer.appendChild(segmentFilter);
    container.appendChild(filterContainer);
    
    // Add event listeners to filters
    document.getElementById('category-filter').addEventListener('change', () => {
        updateVisualization(data);
    });
    
    document.getElementById('segment-filter').addEventListener('change', () => {
        updateVisualization(data);
    });
}

// Create the scatter plot
function createScatterPlot(container, data) {
    // Create chart container
    const chartContainer = document.createElement('div');
    chartContainer.id = 'investment-scatter-plot';
    chartContainer.className = 'chart-container';
    container.appendChild(chartContainer);
    
    // Set dimensions
    const margin = {top: 50, right: 50, bottom: 60, left: 70};
    const width = chartContainer.clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG
    const svg = d3.select('#investment-scatter-plot')
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Create scales
    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.techPenetration) * 1.1])
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.growthPotential) * 1.1])
        .range([height, 0]);
    
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.marketSize)])
        .range([5, 30]);
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d => d + '%');
    
    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d => d + '%');
    
    // Add X axis
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);
    
    // Add Y axis
    svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);
    
    // Add axis labels
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Technology Penetration (%)');
    
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 15)
        .text('Growth Potential (%)');
    
    // Create a tooltip
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
    
    // Add scatter plot points
    svg.selectAll('.dot')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'dot')
        .attr('cx', d => xScale(d.techPenetration))
        .attr('cy', d => yScale(d.growthPotential))
        .attr('r', d => sizeScale(d.marketSize))
        .attr('fill', d => getColorByCompetitiveIntensity(d.competitiveIntensity))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1)
        .attr('opacity', 0.8)
        .attr('data-category', d => d.category)
        .attr('data-segment', d => d.marketSegment)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke-width', 2)
                .attr('opacity', 1);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            
            tooltip.html(`
                <strong>${d.name}</strong><br>
                Category: ${d.category}<br>
                Market Segment: ${d.marketSegment}<br>
                Growth Potential: ${d.growthPotential}%<br>
                Tech Penetration: ${d.techPenetration}%<br>
                Market Size: $${formatNumber(d.marketSize)}<br>
                Competitive Intensity: ${d.competitiveIntensity}/10<br>
                <em>${d.description}</em>
            `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke-width', 1)
                .attr('opacity', 0.8);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    // Add chart title
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('x', width / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .text('Investment Opportunities by Growth Potential & Tech Penetration');
    
    // Add legend for bubble size
    addSizeLegend(svg, sizeScale, width, height);
    
    // Add legend for competitive intensity
    addColorLegend(svg, width);
}

// Create insights panel
function createInsightsPanel(container, data) {
    const insightsPanel = document.createElement('div');
    insightsPanel.className = 'insights-panel';
    insightsPanel.id = 'investment-insights';
    
    // Add title
    const title = document.createElement('h3');
    title.textContent = 'Market Insights';
    insightsPanel.appendChild(title);
    
    // Add content
    const content = document.createElement('div');
    content.className = 'insights-content';
    
    // Calculate insights from data
    const totalOpportunities = data.length;
    const avgGrowth = d3.mean(data, d => d.growthPotential).toFixed(1);
    const avgTechPenetration = d3.mean(data, d => d.techPenetration).toFixed(1);
    const highestGrowth = data.reduce((max, item) => item.growthPotential > max.growthPotential ? item : max, data[0]);
    const lowestCompetition = data.reduce((min, item) => item.competitiveIntensity < min.competitiveIntensity ? item : min, data[0]);
    
    content.innerHTML = `
        <div class="insight-item">
            <span class="insight-label">Total Opportunities:</span>
            <span class="insight-value">${totalOpportunities}</span>
        </div>
        <div class="insight-item">
            <span class="insight-label">Average Growth Potential:</span>
            <span class="insight-value">${avgGrowth}%</span>
        </div>
        <div class="insight-item">
            <span class="insight-label">Average Tech Penetration:</span>
            <span class="insight-value">${avgTechPenetration}%</span>
        </div>
        <div class="insight-item highlight">
            <span class="insight-label">Highest Growth Opportunity:</span>
            <span class="insight-value">${highestGrowth.name} (${highestGrowth.growthPotential}%)</span>
        </div>
        <div class="insight-item highlight">
            <span class="insight-label">Lowest Competition Opportunity:</span>
            <span class="insight-value">${lowestCompetition.name} (${lowestCompetition.competitiveIntensity}/10)</span>
        </div>
    `;
    
    insightsPanel.appendChild(content);
    container.appendChild(insightsPanel);
}

// Add size legend to the chart
function addSizeLegend(svg, sizeScale, width, height) {
    const legendSize = sizeScale.domain();
    const legendData = [legendSize[0], legendSize[1] / 2, legendSize[1]];
    
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 120}, ${height - 100})`);
    
    legend.append('text')
        .attr('class', 'legend-title')
        .attr('x', 0)
        .attr('y', -10)
        .text('Market Size');
    
    const legendGroups = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25 + 10})`);
    
    legendGroups.append('circle')
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('r', d => sizeScale(d))
        .attr('fill', '#888')
        .attr('opacity', 0.8);
    
    legendGroups.append('text')
        .attr('x', 40)
        .attr('y', 5)
        .text(d => '$' + formatNumber(d));
}

// Add color legend to the chart
function addColorLegend(svg, width) {
    const legendData = [
        {intensity: 'Low', color: getColorByCompetitiveIntensity(2), value: '1-3'},
        {intensity: 'Medium', color: getColorByCompetitiveIntensity(5), value: '4-7'},
        {intensity: 'High', color: getColorByCompetitiveIntensity(9), value: '8-10'}
    ];
    
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - 120}, 0)`);
    
    legend.append('text')
        .attr('class', 'legend-title')
        .attr('x', 0)
        .attr('y', -10)
        .text('Competitive Intensity');
    
    const legendGroups = legend.selectAll('.legend-item')
        .data(legendData)
        .enter()
        .append('g')
        .attr('class', 'legend-item')
        .attr('transform', (d, i) => `translate(0, ${i * 25 + 10})`);
    
    legendGroups.append('rect')
        .attr('x', 0)
        .attr('y', -10)
        .attr('width', 15)
        .attr('height', 15)
        .attr('fill', d => d.color)
        .attr('opacity', 0.8);
    
    legendGroups.append('text')
        .attr('x', 25)
        .attr('y', 0)
        .text(d => `${d.intensity} (${d.value})`);
}

// Get color based on competitive intensity
function getColorByCompetitiveIntensity(intensity) {
    // Color scale from green (low competition) to yellow (medium) to red (high competition)
    if (intensity <= 3) {
        return '#2ecc71'; // Green for low competition
    } else if (intensity <= 7) {
        return '#f39c12'; // Yellow/orange for medium competition
    } else {
        return '#e74c3c'; // Red for high competition
    }
}

// Format numbers with commas
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

// Update visualization based on filters
function updateVisualization(data) {
    const categoryFilter = document.getElementById('category-filter').value;
    const segmentFilter = document.getElementById('segment-filter').value;
    
    // Filter data
    let filteredData = data;
    
    if (categoryFilter !== 'all') {
        filteredData = filteredData.filter(item => item.category === categoryFilter);
    }
    
    if (segmentFilter !== 'all') {
        filteredData = filteredData.filter(item => item.marketSegment === segmentFilter);
    }
    
    // Update dots visibility
    d3.selectAll('.dot')
        .style('display', d => {
            const matchCategory = categoryFilter === 'all' || d.category === categoryFilter;
            const matchSegment = segmentFilter === 'all' || d.marketSegment === segmentFilter;
            return (matchCategory && matchSegment) ? 'block' : 'none';
        });
    
    // Update insights panel
    updateInsightsPanel(filteredData);
}

// Update insights panel with filtered data
function updateInsightsPanel(filteredData) {
    const insightsContent = document.querySelector('#investment-insights .insights-content');
    
    if (filteredData.length === 0) {
        insightsContent.innerHTML = '<p>No data available for the selected filters.</p>';
        return;
    }
    
    // Calculate insights from filtered data
    const totalOpportunities = filteredData.length;
    const avgGrowth = d3.mean(filteredData, d => d.growthPotential).toFixed(1);
    const avgTechPenetration = d3.mean(filteredData, d => d.techPenetration).toFixed(1);
    const highestGrowth = filteredData.reduce((max, item) => item.growthPotential > max.growthPotential ? item : max, filteredData[0]);
    const lowestCompetition = filteredData.reduce((min, item) => item.competitiveIntensity < min.competitiveIntensity ? item : min, filteredData[0]);
    
    insightsContent.innerHTML = `
        <div class="insight-item">
            <span class="insight-label">Total Opportunities:</span>
            <span class="insight-value">${totalOpportunities}</span>
        </div>
        <div class="insight-item">
            <span class="insight-label">Average Growth Potential:</span>
            <span class="insight-value">${avgGrowth}%</span>
        </div>
        <div class="insight-item">
            <span class="insight-label">Average Tech Penetration:</span>
            <span class="insight-value">${avgTechPenetration}%</span>
        </div>
        <div class="insight-item highlight">
            <span class="insight-label">Highest Growth Opportunity:</span>
            <span class="insight-value">${highestGrowth.name} (${highestGrowth.growthPotential}%)</span>
        </div>
        <div class="insight-item highlight">
            <span class="insight-label">Lowest Competition Opportunity:</span>
            <span class="insight-value">${lowestCompetition.name} (${lowestCompetition.competitiveIntensity}/10)</span>
        </div>
    `;
}
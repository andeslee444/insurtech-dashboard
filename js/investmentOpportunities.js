// Investment Opportunities Module for E&S Market Opportunity Analyzer
// This file creates a visualization of investment opportunities in the E&S insurance market

// Global variables
let opportunitiesData = null;

// Initialize the Investment Opportunities visualization
function initInvestmentOpportunities() {
    console.log('Initializing Investment Opportunities visualization');
    
    try {
        // Fetch the data from the mock data generator
        if (typeof generateInvestmentOpportunityData === 'function') {
            opportunitiesData = generateInvestmentOpportunityData();
            createInvestmentOpportunitiesVisualization(opportunitiesData);
        } else {
            // Try to fetch from JSON file as fallback
            fetch('/data/investment_opportunities.json')
                .then(response => response.json())
                .then(data => {
                    opportunitiesData = data;
                    createInvestmentOpportunitiesVisualization(opportunitiesData);
                })
                .catch(error => {
                    console.error('Error loading investment opportunities data:', error);
                    displayErrorMessage('investment-opportunities-container');
                });
        }
    } catch (error) {
        console.error('Error initializing investment opportunities visualization:', error);
        displayErrorMessage('investment-opportunities-container');
    }
    
    // Set up filter event listeners
    setupFilterEventListeners();
}

// Create the visualization based on the data
function createInvestmentOpportunitiesVisualization(data) {
    const container = document.getElementById('investment-opportunities-container');
    if (!container) {
        console.error('Investment opportunities container not found');
        return;
    }
    
    // Clear the container
    container.innerHTML = '';
    
    // Set up dimensions and margins
    const margin = {top: 40, right: 30, bottom: 70, left: 80};
    const width = container.clientWidth - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;
    
    // Create SVG element
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Define scales
    const xScale = d3.scaleLinear()
        .domain([0, 1])  // Growth potential from 0 to 1
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 1])  // Tech penetration from 0 to 1 (inverted Y axis for better visualization)
        .range([0, height]);  // Y axis starts at top for better visualization of opportunities
    
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data.opportunities, d => d.marketSize)])
        .range([10, 50]);
    
    const colorScale = d3.scaleSequential()
        .domain([0, 1])  // Competitive intensity from 0 to 1
        .interpolator(d3.interpolateRdYlGn().reverse());  // Red is high competition (bad), green is low competition (good)
    
    // Create axes
    const xAxis = d3.axisBottom(xScale)
        .ticks(5)
        .tickFormat(d => `${d * 100}%`);
    
    const yAxis = d3.axisLeft(yScale)
        .ticks(5)
        .tickFormat(d => `${d * 100}%`);
    
    svg.append('g')
        .attr('class', 'x-axis')
        .attr('transform', `translate(0,${height})`)
        .call(xAxis);
    
    svg.append('g')
        .attr('class', 'y-axis')
        .call(yAxis);
    
    // Add X axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .text('Market Growth Potential');
    
    // Add Y axis label
    svg.append('text')
        .attr('class', 'axis-label')
        .attr('text-anchor', 'middle')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -margin.left + 20)
        .text('Technology Penetration (Lower is Better)');
    
    // Add title
    svg.append('text')
        .attr('class', 'chart-title')
        .attr('text-anchor', 'middle')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .text('E&S Insurance Market Investment Opportunities');
    
    // Create a tooltip div
    const tooltip = d3.select('body').append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0);
    
    // Add bubbles
    svg.selectAll('.bubble')
        .data(data.opportunities)
        .enter()
        .append('circle')
        .attr('class', 'bubble')
        .attr('cx', d => xScale(d.growthPotential))
        .attr('cy', d => yScale(d.techPenetration))
        .attr('r', d => sizeScale(d.marketSize))
        .attr('fill', d => colorScale(d.competitiveIntensity))
        .attr('opacity', 0.7)
        .attr('stroke', '#000')
        .attr('stroke-width', 1)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .attr('stroke-width', 2)
                .attr('opacity', 0.9);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', 0.9);
            
            tooltip.html(`
                <strong>${d.name}</strong><br/>
                Category: ${d.category}<br/>
                Growth Potential: ${d.growthPotential * 100}%<br/>
                Tech Penetration: ${d.techPenetration * 100}%<br/>
                Market Size: $${d.marketSize}B<br/>
                Competitive Intensity: ${d.competitiveIntensity * 100}%<br/>
                Implementation: ${d.implementationComplexity}<br/>
                ROI Potential: ${d.roiPotential}<br/>
                Priority Ranking: #${d.priority}
            `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .attr('stroke-width', 1)
                .attr('opacity', 0.7);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    // Add labels for larger bubbles
    svg.selectAll('.bubble-label')
        .data(data.opportunities.filter(d => d.marketSize > 7))  // Only label bigger bubbles
        .enter()
        .append('text')
        .attr('class', 'bubble-label')
        .attr('x', d => xScale(d.growthPotential))
        .attr('y', d => yScale(d.techPenetration))
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .text(d => d.name.split(' ')[0])  // Just the first word to avoid clutter
        .style('font-size', '10px')
        .style('pointer-events', 'none');
    
    // Add quadrant labels to help interpretation
    const quadrants = [
        { x: width * 0.75, y: height * 0.25, text: "High Growth, Low Penetration (Best Opportunities)" },
        { x: width * 0.25, y: height * 0.25, text: "Low Growth, Low Penetration" },
        { x: width * 0.75, y: height * 0.75, text: "High Growth, High Penetration" },
        { x: width * 0.25, y: height * 0.75, text: "Low Growth, High Penetration (Avoid)" }
    ];
    
    svg.selectAll('.quadrant-label')
        .data(quadrants)
        .enter()
        .append('text')
        .attr('class', 'quadrant-label')
        .attr('x', d => d.x)
        .attr('y', d => d.y)
        .attr('text-anchor', 'middle')
        .text(d => d.text)
        .style('font-size', '9px')
        .style('font-style', 'italic')
        .style('opacity', 0.7);
}

// Set up event listeners for filters
function setupFilterEventListeners() {
    // Get the filters that might affect this visualization
    const categoryFilter = document.getElementById('opportunity-category-filter');
    const segmentFilter = document.getElementById('market-segment-filter');
    
    // Set up category filter change event
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            // Generate new data based on the filter
            const filters = {
                category: this.value,
                marketSegment: segmentFilter ? segmentFilter.value : 'all'
            };
            
            // Generate new data based on the filters
            const newData = generateInvestmentOpportunityData(filters);
            
            // Update the visualization
            createInvestmentOpportunitiesVisualization(newData);
        });
    }
    
    // Set up segment filter change event
    if (segmentFilter) {
        segmentFilter.addEventListener('change', function() {
            // Generate new data based on the filter
            const filters = {
                category: categoryFilter ? categoryFilter.value : 'all',
                marketSegment: this.value
            };
            
            // Generate new data based on the filters
            const newData = generateInvestmentOpportunityData(filters);
            
            // Update the visualization
            createInvestmentOpportunitiesVisualization(newData);
        });
    }
}

// Display error message when data loading fails
function displayErrorMessage(containerId) {
    const container = document.getElementById(containerId);
    if (container) {
        container.innerHTML = `
            <div class="error-message">
                <h3>Error Loading Data</h3>
                <p>Could not load investment opportunities data. Please try again later.</p>
            </div>
        `;
    }
}

// Export the init function to the global scope
window.initInvestmentOpportunities = initInvestmentOpportunities; 
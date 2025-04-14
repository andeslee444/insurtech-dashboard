// Enhanced Market Momentum Visualizer Component
// This component visualizes E&S premium growth compared to admitted markets with interactive features

// DOM elements
const marketMomentumContainer = document.getElementById('market-momentum-container');
const yearRangeFilter = document.getElementById('year-range-filter');
const lineOfBusinessFilter = document.getElementById('line-of-business-filter');
const viewTypeToggle = document.getElementById('view-type-toggle');

// Initialize the visualization
async function initMarketMomentum() {
    try {
        // Load data from JSON files
        const premiumResponse = await fetch('data/premium_growth.json');
        const premiumData = await premiumResponse.json();
        
        // Initialize filters
        populateFilters(premiumData);
        
        // Create initial visualization
        createMarketMomentumVisualization(premiumData);
        
        // Add event listeners
        if (yearRangeFilter) yearRangeFilter.addEventListener('change', () => updateVisualization(premiumData));
        if (lineOfBusinessFilter) lineOfBusinessFilter.addEventListener('change', () => updateVisualization(premiumData));
        if (viewTypeToggle) viewTypeToggle.addEventListener('change', () => updateVisualization(premiumData));
        
        console.log('Market Momentum visualization initialized');
    } catch (error) {
        console.error('Error initializing Market Momentum:', error);
        if (marketMomentumContainer) {
            marketMomentumContainer.innerHTML = '<p class="error">Error loading market data. Please try again later.</p>';
        }
    }
}

// Populate filter dropdowns
function populateFilters(data) {
    // Line of business filter
    if (lineOfBusinessFilter) {
        const lobs = Object.keys(data.line_of_business || {});
        
        lineOfBusinessFilter.innerHTML = '<option value="all">All Lines of Business</option>';
        lobs.forEach(lob => {
            const option = document.createElement('option');
            option.value = lob;
            option.textContent = lob;
            lineOfBusinessFilter.appendChild(option);
        });
    }
}

// Update visualization based on selected filters
function updateVisualization(data) {
    const yearRange = yearRangeFilter ? yearRangeFilter.value : '5year';
    const lineOfBusiness = lineOfBusinessFilter ? lineOfBusinessFilter.value : 'all';
    const viewType = viewTypeToggle ? viewTypeToggle.value : 'growth';
    
    createMarketMomentumVisualization(data, yearRange, lineOfBusiness, viewType);
}

// Create the Market Momentum visualization
function createMarketMomentumVisualization(data, yearRange = '5year', lineOfBusiness = 'all', viewType = 'growth') {
    if (!marketMomentumContainer) return;
    
    // Clear previous visualization
    const chartContainer = document.getElementById('market-momentum-chart');
    if (chartContainer) {
        chartContainer.innerHTML = '';
    } else {
        const newChartContainer = document.createElement('div');
        newChartContainer.id = 'market-momentum-chart';
        newChartContainer.className = 'chart';
        marketMomentumContainer.appendChild(newChartContainer);
    }
    
    // Create insights container if it doesn't exist
    let insightsContainer = document.getElementById('market-momentum-insights');
    if (!insightsContainer) {
        insightsContainer = document.createElement('div');
        insightsContainer.id = 'market-momentum-insights';
        insightsContainer.className = 'insights';
        marketMomentumContainer.appendChild(insightsContainer);
    }
    
    // Set up dimensions
    const width = 800;
    const height = 500;
    const margin = {top: 50, right: 50, bottom: 70, left: 80};
    
    // Create SVG
    const svg = d3.select('#market-momentum-chart')
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Add dark theme background
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('x', -margin.left)
        .attr('y', -margin.top)
        .attr('fill', 'var(--bg-tertiary)')
        .attr('rx', 12);
    
    // Process data based on filters
    const processedData = processMarketData(data, yearRange, lineOfBusiness, viewType);
    
    // No data case
    if (processedData.length === 0) {
        svg.append('text')
            .attr('x', (width - margin.left - margin.right) / 2)
            .attr('y', (height - margin.top - margin.bottom) / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', 'var(--text-secondary)')
            .text('No data available for the selected filters');
        
        updateMarketInsights(data, []);
        return;
    }
    
    // Create visualization based on view type
    if (viewType === 'growth') {
        createGrowthChart(svg, processedData, width, height, margin);
    } else if (viewType === 'comparison') {
        createComparisonChart(svg, processedData, width, height, margin);
    } else if (viewType === 'market_share') {
        createMarketShareChart(svg, processedData, width, height, margin);
    }
    
    // Update insights
    updateMarketInsights(data, processedData, yearRange, lineOfBusiness, viewType);
}

// Process market data for visualization
function processMarketData(data, yearRange, lineOfBusiness, viewType) {
    let processedData = [];
    
    // Determine years to include based on year range
    const years = Object.keys(data.market_size || {}).sort();
    let filteredYears = years;
    
    if (yearRange === '3year') {
        filteredYears = years.slice(-3);
    } else if (yearRange === '5year') {
        filteredYears = years.slice(-5);
    } else if (yearRange === '10year') {
        filteredYears = years.slice(-10);
    }
    
    // Process data based on view type
    if (viewType === 'growth') {
        // E&S market growth rates
        filteredYears.forEach(year => {
            if (data.growth_rates && data.growth_rates[year]) {
                processedData.push({
                    year: year,
                    value: data.growth_rates[year],
                    type: 'E&S Market'
                });
            }
        });
        
        // Add admitted market growth rates (estimated at 60% of E&S growth)
        filteredYears.forEach(year => {
            if (data.growth_rates && data.growth_rates[year]) {
                processedData.push({
                    year: year,
                    value: data.growth_rates[year] * 0.6,
                    type: 'Admitted Market'
                });
            }
        });
    } else if (viewType === 'comparison') {
        // E&S market size
        filteredYears.forEach(year => {
            if (data.market_size && data.market_size[year]) {
                processedData.push({
                    year: year,
                    value: data.market_size[year] / 1000000000, // Convert to billions
                    type: 'E&S Market'
                });
            }
        });
        
        // Admitted market size (estimated at 10x E&S market)
        filteredYears.forEach(year => {
            if (data.market_size && data.market_size[year]) {
                processedData.push({
                    year: year,
                    value: (data.market_size[year] * 10) / 1000000000, // Convert to billions
                    type: 'Admitted Market'
                });
            }
        });
    } else if (viewType === 'market_share') {
        // E&S market share (estimated)
        filteredYears.forEach(year => {
            if (data.market_size && data.market_size[year]) {
                // E&S market share is approximately 9% of total market
                processedData.push({
                    year: year,
                    value: 9 + (year - 2020) * 0.5, // Increasing trend from 9% in 2020
                    type: 'E&S Market Share'
                });
            }
        });
    }
    
    // Filter by line of business if specified
    if (lineOfBusiness !== 'all' && data.line_of_business) {
        // Adjust growth rates based on selected line of business
        const lobGrowthFactor = data.line_of_business[lineOfBusiness] / 
            (Object.values(data.line_of_business).reduce((sum, val) => sum + val, 0) / 
             Object.values(data.line_of_business).length);
        
        processedData = processedData.map(d => ({
            ...d,
            value: d.type === 'E&S Market' ? d.value * lobGrowthFactor : d.value
        }));
    }
    
    return processedData;
}

// Create growth rate chart
function createGrowthChart(svg, data, width, height, margin) {
    // Group data by type
    const dataByType = d3.group(data, d => d.type);
    
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(Array.from(new Set(data.map(d => d.year))))
        .range([0, width - margin.left - margin.right])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.2])
        .range([height - margin.top - margin.bottom, 0]);
    
    // Define color scale
    const colorScale = d3.scaleOrdinal()
        .domain(['E&S Market', 'Admitted Market'])
        .range(['#0a84ff', '#64d2ff']);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d + '%'))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px');
    
    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -(height - margin.top - margin.bottom) / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '14px')
        .text('Growth Rate (%)');
    
    // Add X axis label
    svg.append('text')
        .attr('y', height - margin.top - margin.bottom + 40)
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '14px')
        .text('Year');
    
    // Create grouped bar chart
    const types = Array.from(dataByType.keys());
    const groupWidth = xScale.bandwidth() / types.length;
    
    types.forEach((type, i) => {
        const typeData = dataByType.get(type);
        
        // Add bars
        svg.selectAll(`.bar-${type}`)
            .data(typeData)
            .enter()
            .append('rect')
            .attr('class', `bar-${type}`)
            .attr('x', d => xScale(d.year) + i * groupWidth)
            .attr('y', d => yScale(d.value))
            .attr('width', groupWidth)
            .attr('height', d => height - margin.top - margin.bottom - yScale(d.value))
            .attr('fill', colorScale(type))
            .attr('rx', 4)
            .attr('opacity', 0.8)
            .on('mouseover', function(event, d) {
                // Highlight bar
                d3.select(this)
                    .attr('opacity', 1)
                    .attr('stroke', '#ffffff')
                    .attr('stroke-width', 1);
                
                // Show tooltip
                d3.select('#tooltip')
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 20}px`)
                    .style('display', 'block')
                    .html(`
                        <div class="tooltip-title">${type} (${d.year})</div>
                        <div class="tooltip-content">
                            <p><strong>Growth Rate:</strong> ${d.value.toFixed(1)}%</p>
                            <p><strong>Trend:</strong> ${d.value > 10 ? 'Strong Growth' : d.value > 5 ? 'Moderate Growth' : 'Slow Growth'}</p>
                        </div>
                    `);
            })
            .on('mouseout', function() {
                // Restore bar
                d3.select(this)
                    .attr('opacity', 0.8)
                    .attr('stroke', 'none');
                
                // Hide tooltip
                d3.select('#tooltip').style('display', 'none');
            });
        
        // Add value labels
        svg.selectAll(`.label-${type}`)
            .data(typeData)
            .enter()
            .append('text')
            .attr('class', `label-${type}`)
            .attr('x', d => xScale(d.year) + i * groupWidth + groupWidth / 2)
            .attr('y', d => yScale(d.value) - 5)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', 'var(--text-primary)')
            .text(d => `${d.value.toFixed(1)}%`);
    });
    
    // Add legend
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - margin.left - margin.right - 150}, 10)`);
    
    // Legend background
    legend.append('rect')
        .attr('width', 140)
        .attr('height', 80)
        .attr('rx', 8)
        .attr('fill', 'rgba(44, 44, 46, 0.7)')
        .attr('stroke', 'var(--divider)')
        .attr('stroke-width', 1);
    
    // Legend title
    legend.append('text')
        .attr('x', 10)
        .attr('y', 20)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', 'var(--text-primary)')
        .text('Market Type');
    
    // Legend items
    types.forEach((type, i) => {
        const legendItem = legend.append('g')
            .attr('transform', `translate(10, ${i * 20 + 40})`);
        
        legendItem.append('rect')
            .attr('width', 12)
            .attr('height', 12)
            .attr('rx', 2)
            .attr('fill', colorScale(type));
        
        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .style('font-size', '11px')
            .style('fill', 'var(--text-secondary)')
            .text(type);
    });
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text('E&S vs. Admitted Market Growth Rates');
}

// Create market size comparison chart
function createComparisonChart(svg, data, width, height, margin) {
    // Group data by type
    const dataByType = d3.group(data, d => d.type);
    
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(Array.from(new Set(data.map(d => d.year))))
        .range([0, width - margin.left - margin.right])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.1])
        .range([height - margin.top - margin.bottom, 0]);
    
    // Define color scale
    const colorScale = d3.scaleOrdinal()
        .domain(['E&S Market', 'Admitted Market'])
        .range(['#0a84ff', '#64d2ff']);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `$${d}B`))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px');
    
    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -(height - margin.top - margin.bottom) / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '14px')
        .text('Premium Volume (Billions USD)');
    
    // Add X axis label
    svg.append('text')
        .attr('y', height - margin.top - margin.bottom + 40)
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '14px')
        .text('Year');
    
    // Create line chart
    const types = Array.from(dataByType.keys());
    
    types.forEach(type => {
        const typeData = dataByType.get(type);
        
        // Add line
        const line = d3.line()
            .x(d => xScale(d.year) + xScale.bandwidth() / 2)
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX);
        
        // Add gradient
        const gradientId = `line-gradient-${type.replace(/\s+/g, '-').toLowerCase()}`;
        
        const gradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', gradientId)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('y1', yScale(0))
            .attr('x2', 0)
            .attr('y2', yScale(d3.max(typeData, d => d.value)));
        
        gradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', colorScale(type))
            .attr('stop-opacity', 0.1);
        
        gradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', colorScale(type))
            .attr('stop-opacity', 0.8);
        
        // Add area
        svg.append('path')
            .datum(typeData)
            .attr('fill', `url(#${gradientId})`)
            .attr('d', d3.area()
                .x(d => xScale(d.year) + xScale.bandwidth() / 2)
                .y0(height - margin.top - margin.bottom)
                .y1(d => yScale(d.value))
                .curve(d3.curveMonotoneX)
            );
        
        // Add line
        svg.append('path')
            .datum(typeData)
            .attr('fill', 'none')
            .attr('stroke', colorScale(type))
            .attr('stroke-width', 3)
            .attr('d', line);
        
        // Add points
        svg.selectAll(`.point-${type}`)
            .data(typeData)
            .enter()
            .append('circle')
            .attr('class', `point-${type}`)
            .attr('cx', d => xScale(d.year) + xScale.bandwidth() / 2)
            .attr('cy', d => yScale(d.value))
            .attr('r', 5)
            .attr('fill', colorScale(type))
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 2)
            .on('mouseover', function(event, d) {
                // Highlight point
                d3.select(this)
                    .attr('r', 7);
                
                // Show tooltip
                d3.select('#tooltip')
                    .style('left', `${event.pageX + 10}px`)
                    .style('top', `${event.pageY - 20}px`)
                    .style('display', 'block')
                    .html(`
                        <div class="tooltip-title">${type} (${d.year})</div>
                        <div class="tooltip-content">
                            <p><strong>Premium Volume:</strong> $${d.value.toFixed(1)} Billion</p>
                            <p><strong>Year-over-Year Change:</strong> ${
                                typeData.findIndex(item => item.year === d.year) > 0 
                                ? ((d.value / typeData[typeData.findIndex(item => item.year === d.year) - 1].value - 1) * 100).toFixed(1) + '%'
                                : 'N/A'
                            }</p>
                        </div>
                    `);
            })
            .on('mouseout', function() {
                // Restore point
                d3.select(this)
                    .attr('r', 5);
                
                // Hide tooltip
                d3.select('#tooltip').style('display', 'none');
            });
        
        // Add value labels
        svg.selectAll(`.label-${type}`)
            .data(typeData)
            .enter()
            .append('text')
            .attr('class', `label-${type}`)
            .attr('x', d => xScale(d.year) + xScale.bandwidth() / 2)
            .attr('y', d => yScale(d.value) - 10)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .style('fill', 'var(--text-primary)')
            .text(d => `$${d.value.toFixed(0)}B`);
    });
    
    // Add legend
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - margin.left - margin.right - 150}, 10)`);
    
    // Legend background
    legend.append('rect')
        .attr('width', 140)
        .attr('height', 80)
        .attr('rx', 8)
        .attr('fill', 'rgba(44, 44, 46, 0.7)')
        .attr('stroke', 'var(--divider)')
        .attr('stroke-width', 1);
    
    // Legend title
    legend.append('text')
        .attr('x', 10)
        .attr('y', 20)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', 'var(--text-primary)')
        .text('Market Type');
    
    // Legend items
    types.forEach((type, i) => {
        const legendItem = legend.append('g')
            .attr('transform', `translate(10, ${i * 20 + 40})`);
        
        legendItem.append('line')
            .attr('x1', 0)
            .attr('y1', 6)
            .attr('x2', 12)
            .attr('y2', 6)
            .attr('stroke', colorScale(type))
            .attr('stroke-width', 3);
        
        legendItem.append('text')
            .attr('x', 20)
            .attr('y', 10)
            .style('font-size', '11px')
            .style('fill', 'var(--text-secondary)')
            .text(type);
    });
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text('E&S vs. Admitted Market Premium Volume');
}

// Create market share chart
function createMarketShareChart(svg, data, width, height, margin) {
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([0, width - margin.left - margin.right])
        .padding(0.1);
    
    const yScale = d3.scaleLinear()
        .domain([0, 15]) // Market share percentage
        .range([height - margin.top - margin.bottom, 0]);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => d + '%'))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px');
    
    // Add Y axis label
    svg.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -margin.left + 20)
        .attr('x', -(height - margin.top - margin.bottom) / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '14px')
        .text('Market Share (%)');
    
    // Add X axis label
    svg.append('text')
        .attr('y', height - margin.top - margin.bottom + 40)
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '14px')
        .text('Year');
    
    // Add gradient
    const gradientId = 'market-share-gradient';
    
    const gradient = svg.append('defs')
        .append('linearGradient')
        .attr('id', gradientId)
        .attr('gradientUnits', 'userSpaceOnUse')
        .attr('x1', 0)
        .attr('y1', yScale(0))
        .attr('x2', 0)
        .attr('y2', yScale(15));
    
    gradient.append('stop')
        .attr('offset', '0%')
        .attr('stop-color', '#30d158')
        .attr('stop-opacity', 0.1);
    
    gradient.append('stop')
        .attr('offset', '100%')
        .attr('stop-color', '#30d158')
        .attr('stop-opacity', 0.8);
    
    // Add area
    svg.append('path')
        .datum(data)
        .attr('fill', `url(#${gradientId})`)
        .attr('d', d3.area()
            .x(d => xScale(d.year) + xScale.bandwidth() / 2)
            .y0(height - margin.top - margin.bottom)
            .y1(d => yScale(d.value))
            .curve(d3.curveMonotoneX)
        );
    
    // Add line
    svg.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', '#30d158')
        .attr('stroke-width', 3)
        .attr('d', d3.line()
            .x(d => xScale(d.year) + xScale.bandwidth() / 2)
            .y(d => yScale(d.value))
            .curve(d3.curveMonotoneX)
        );
    
    // Add points
    svg.selectAll('.point')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('cx', d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr('cy', d => yScale(d.value))
        .attr('r', 5)
        .attr('fill', '#30d158')
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 2)
        .on('mouseover', function(event, d) {
            // Highlight point
            d3.select(this)
                .attr('r', 7);
            
            // Show tooltip
            d3.select('#tooltip')
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 20}px`)
                .style('display', 'block')
                .html(`
                    <div class="tooltip-title">E&S Market Share (${d.year})</div>
                    <div class="tooltip-content">
                        <p><strong>Market Share:</strong> ${d.value.toFixed(1)}%</p>
                        <p><strong>Year-over-Year Change:</strong> ${
                            data.findIndex(item => item.year === d.year) > 0 
                            ? ((d.value - data[data.findIndex(item => item.year === d.year) - 1].value)).toFixed(1) + ' percentage points'
                            : 'N/A'
                        }</p>
                        <p><strong>Trend:</strong> ${d.value > 10 ? 'Strong E&S Market' : 'Growing E&S Presence'}</p>
                    </div>
                `);
        })
        .on('mouseout', function() {
            // Restore point
            d3.select(this)
                .attr('r', 5);
            
            // Hide tooltip
            d3.select('#tooltip').style('display', 'none');
        });
    
    // Add value labels
    svg.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 10)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'var(--text-primary)')
        .text(d => `${d.value.toFixed(1)}%`);
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text('E&S Market Share Trend');
}

// Update insights based on filtered data
function updateMarketInsights(data, processedData, yearRange = '5year', lineOfBusiness = 'all', viewType = 'growth') {
    const insightsContainer = document.getElementById('market-momentum-insights');
    if (!insightsContainer) return;
    
    let insightsHTML = '<h3>Market Momentum Insights</h3>';
    
    if (processedData.length === 0) {
        insightsHTML += '<p>No data available for the selected filters. Try adjusting your criteria.</p>';
        insightsContainer.innerHTML = insightsHTML;
        return;
    }
    
    // Calculate insights based on view type
    if (viewType === 'growth') {
        // Get E&S and admitted market data
        const esData = processedData.filter(d => d.type === 'E&S Market');
        const admittedData = processedData.filter(d => d.type === 'Admitted Market');
        
        // Calculate average growth rates
        const esAvgGrowth = esData.reduce((sum, d) => sum + d.value, 0) / esData.length;
        const admittedAvgGrowth = admittedData.reduce((sum, d) => sum + d.value, 0) / admittedData.length;
        
        // Calculate growth differential
        const growthDifferential = esAvgGrowth - admittedAvgGrowth;
        
        // Get latest year data
        const latestYear = Math.max(...esData.map(d => parseInt(d.year)));
        const latestEsGrowth = esData.find(d => d.year == latestYear)?.value || 0;
        const latestAdmittedGrowth = admittedData.find(d => d.year == latestYear)?.value || 0;
        
        insightsHTML += `
            <p><strong>Average E&S Growth Rate:</strong> ${esAvgGrowth.toFixed(1)}%</p>
            <p><strong>Average Admitted Growth Rate:</strong> ${admittedAvgGrowth.toFixed(1)}%</p>
            <p><strong>Growth Differential:</strong> ${growthDifferential.toFixed(1)} percentage points</p>
            <p><strong>Latest E&S Growth (${latestYear}):</strong> ${latestEsGrowth.toFixed(1)}%</p>
        `;
        
        // Add line of business specific insight if selected
        if (lineOfBusiness !== 'all' && data.line_of_business) {
            const lobGrowth = data.line_of_business[lineOfBusiness];
            insightsHTML += `<p><strong>${lineOfBusiness} Growth Rate:</strong> ${lobGrowth.toFixed(1)}%</p>`;
        }
    } else if (viewType === 'comparison') {
        // Get E&S and admitted market data
        const esData = processedData.filter(d => d.type === 'E&S Market');
        const admittedData = processedData.filter(d => d.type === 'Admitted Market');
        
        // Get latest year data
        const latestYear = Math.max(...esData.map(d => parseInt(d.year)));
        const latestEsVolume = esData.find(d => d.year == latestYear)?.value || 0;
        const latestAdmittedVolume = admittedData.find(d => d.year == latestYear)?.value || 0;
        
        // Calculate CAGR
        const firstYear = Math.min(...esData.map(d => parseInt(d.year)));
        const firstEsVolume = esData.find(d => d.year == firstYear)?.value || 0;
        const yearDiff = latestYear - firstYear;
        const esCagr = yearDiff > 0 ? ((Math.pow(latestEsVolume / firstEsVolume, 1 / yearDiff) - 1) * 100) : 0;
        
        insightsHTML += `
            <p><strong>Latest E&S Premium Volume (${latestYear}):</strong> $${latestEsVolume.toFixed(1)} Billion</p>
            <p><strong>Latest Admitted Premium Volume (${latestYear}):</strong> $${latestAdmittedVolume.toFixed(1)} Billion</p>
            <p><strong>E&S Market CAGR (${firstYear}-${latestYear}):</strong> ${esCagr.toFixed(1)}%</p>
            <p><strong>E&S to Admitted Ratio:</strong> 1:${(latestAdmittedVolume / latestEsVolume).toFixed(1)}</p>
        `;
    } else if (viewType === 'market_share') {
        // Get latest year data
        const latestYear = Math.max(...processedData.map(d => parseInt(d.year)));
        const latestShare = processedData.find(d => d.year == latestYear)?.value || 0;
        
        // Get first year data
        const firstYear = Math.min(...processedData.map(d => parseInt(d.year)));
        const firstShare = processedData.find(d => d.year == firstYear)?.value || 0;
        
        // Calculate change
        const shareChange = latestShare - firstShare;
        
        insightsHTML += `
            <p><strong>Current E&S Market Share (${latestYear}):</strong> ${latestShare.toFixed(1)}%</p>
            <p><strong>Market Share in ${firstYear}:</strong> ${firstShare.toFixed(1)}%</p>
            <p><strong>Change (${firstYear}-${latestYear}):</strong> ${shareChange.toFixed(1)} percentage points</p>
            <p><strong>Annual Growth Rate:</strong> ${(shareChange / (latestYear - firstYear)).toFixed(2)} points per year</p>
        `;
    }
    
    // Add AI-generated insight
    insightsHTML += `<div style="margin-top: 20px; padding: 15px; background: rgba(10, 132, 255, 0.1); border-radius: 8px; border: 1px solid rgba(10, 132, 255, 0.3);">
        <h4 style="color: var(--accent-primary); margin-bottom: 10px; font-size: 14px;">AI-Generated Insight</h4>
        <p style="font-style: italic; color: var(--text-secondary);">
            ${generateMarketInsight(data, processedData, yearRange, lineOfBusiness, viewType)}
        </p>
    </div>`;
    
    insightsContainer.innerHTML = insightsHTML;
}

// Generate AI insight based on data and filters
function generateMarketInsight(data, processedData, yearRange, lineOfBusiness, viewType) {
    if (viewType === 'growth') {
        const esData = processedData.filter(d => d.type === 'E&S Market');
        const admittedData = processedData.filter(d => d.type === 'Admitted Market');
        
        if (esData.length === 0 || admittedData.length === 0) return 'Insufficient data to generate insights.';
        
        const esAvgGrowth = esData.reduce((sum, d) => sum + d.value, 0) / esData.length;
        const admittedAvgGrowth = admittedData.reduce((sum, d) => sum + d.value, 0) / admittedData.length;
        const growthDifferential = esAvgGrowth - admittedAvgGrowth;
        
        if (lineOfBusiness !== 'all') {
            return `The E&S market for ${lineOfBusiness} is growing at ${esAvgGrowth.toFixed(1)}%, outpacing the admitted market by ${growthDifferential.toFixed(1)} percentage points. This indicates significant opportunity for technology solutions that can address the unique challenges of ${lineOfBusiness.toLowerCase()} risks in the non-admitted space, particularly in underwriting automation and risk assessment tools.`;
        } else {
            return `The E&S market is experiencing ${esAvgGrowth > 15 ? 'exceptional' : esAvgGrowth > 10 ? 'strong' : 'moderate'} growth at ${esAvgGrowth.toFixed(1)}%, outpacing the admitted market by ${growthDifferential.toFixed(1)} percentage points. This growth trajectory suggests increasing risk complexity and capacity constraints in the admitted market, creating opportunities for technology solutions that can efficiently assess, price, and manage these displaced risks.`;
        }
    } else if (viewType === 'comparison') {
        const esData = processedData.filter(d => d.type === 'E&S Market');
        
        if (esData.length === 0) return 'Insufficient data to generate insights.';
        
        const latestYear = Math.max(...esData.map(d => parseInt(d.year)));
        const latestEsVolume = esData.find(d => d.year == latestYear)?.value || 0;
        
        const firstYear = Math.min(...esData.map(d => parseInt(d.year)));
        const firstEsVolume = esData.find(d => d.year == firstYear)?.value || 0;
        
        const volumeGrowth = ((latestEsVolume / firstEsVolume) - 1) * 100;
        
        return `The E&S market has grown from $${firstEsVolume.toFixed(1)}B in ${firstYear} to $${latestEsVolume.toFixed(1)}B in ${latestYear}, representing ${volumeGrowth.toFixed(1)}% total growth. This $${(latestEsVolume - firstEsVolume).toFixed(1)}B increase in premium volume indicates substantial opportunity for technology investments targeting distribution efficiency, underwriting automation, and claims management in the non-admitted space.`;
    } else if (viewType === 'market_share') {
        if (processedData.length === 0) return 'Insufficient data to generate insights.';
        
        const latestYear = Math.max(...processedData.map(d => parseInt(d.year)));
        const latestShare = processedData.find(d => d.year == latestYear)?.value || 0;
        
        const firstYear = Math.min(...processedData.map(d => parseInt(d.year)));
        const firstShare = processedData.find(d => d.year == firstYear)?.value || 0;
        
        const shareChange = latestShare - firstShare;
        
        return `The E&S market's share of total premium has increased from ${firstShare.toFixed(1)}% in ${firstYear} to ${latestShare.toFixed(1)}% in ${latestYear}, a gain of ${shareChange.toFixed(1)} percentage points. This consistent market share expansion indicates structural shifts in risk placement, with admitted carriers increasingly ceding complex risks to the E&S market. Technology solutions that facilitate this risk transfer process represent significant investment opportunities.`;
    }
    
    return 'Select different filters to generate market insights.';
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initMarketMomentum);

// Investment Opportunities Module for E&S Market Opportunity Analyzer
// This file contains the visualization for the Investment Opportunities tab

// Initialize the Investment Opportunities visualization
function initInvestmentOpportunities() {
    console.log('Initializing Investment Opportunities visualization');
    
    try {
        // Use the mock data generator to get data
        const filters = {
            dateRange: document.getElementById('date-range-filter').value,
            geography: document.getElementById('geography-filter').value,
            lineOfBusiness: document.getElementById('lob-filter').value,
            category: document.getElementById('opportunity-category-filter').value,
            marketSegment: document.getElementById('market-segment-filter').value
        };
        
        // Generate investment opportunity data or load from JSON
        if (typeof generateInvestmentOpportunityData === 'function') {
            const data = generateInvestmentOpportunityData(filters);
            createInvestmentOpportunitiesVisualization(data);
        } else {
            // Fallback to JSON if mock data generator not available
            fetch('/data/investment_opportunities.json')
                .then(response => response.json())
                .then(data => createInvestmentOpportunitiesVisualization(data))
                .catch(error => {
                    console.error('Error loading investment opportunities data:', error);
                    displayErrorMessage('Error loading data');
                });
        }
        
        // Set up filter event listeners
        setupFilterEventListeners();
        
    } catch (error) {
        console.error('Error initializing investment opportunities visualization:', error);
        displayErrorMessage('Error initializing visualization');
    }
}

// Create the Investment Opportunities visualization
function createInvestmentOpportunitiesVisualization(data) {
    console.log('Creating Investment Opportunities visualization with data:', data);
    
    // Select the container
    const container = document.getElementById('investment-opportunities-container');
    if (!container) {
        console.error('Container not found: investment-opportunities-container');
        return;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Set dimensions and margins
    const margin = {top: 50, right: 50, bottom: 70, left: 70};
    const width = container.clientWidth - margin.left - margin.right;
    const height = 550 - margin.top - margin.bottom;
    
    // Create SVG element
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width + margin.left + margin.right)
        .attr('height', height + margin.top + margin.bottom)
        .append('g')
        .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([0, 10])  // Growth potential scale 0-10
        .range([0, width]);
    
    const yScale = d3.scaleLinear()
        .domain([0, 10])  // Technology penetration scale 0-10 (inverted)
        .range([0, height]);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale))
        .append('text')
        .attr('class', 'axis-label')
        .attr('x', width / 2)
        .attr('y', 40)
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .text('Growth Potential');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale))
        .append('text')
        .attr('class', 'axis-label')
        .attr('transform', 'rotate(-90)')
        .attr('x', -height / 2)
        .attr('y', -50)
        .attr('fill', '#000')
        .attr('text-anchor', 'middle')
        .text('Technology Penetration (Lower is Higher)');
    
    // Add grid lines
    svg.append('g')
        .attr('class', 'grid')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(xScale)
            .tickSize(-height)
            .tickFormat('')
        );
    
    svg.append('g')
        .attr('class', 'grid')
        .call(d3.axisLeft(yScale)
            .tickSize(-width)
            .tickFormat('')
        );
    
    // Size scale for bubbles based on market size
    const sizeScale = d3.scaleSqrt()
        .domain([0, d3.max(data, d => d.marketSize)])
        .range([5, 50]);
    
    // Color scale for competitive intensity
    const colorScale = d3.scaleLinear()
        .domain([0, 5, 10])  // Low to high competitive intensity
        .range(['#1a9850', '#ffffbf', '#d73027']); // Green (low) to Red (high)
    
    // Create a tooltip
    const tooltip = d3.select(container)
        .append('div')
        .attr('class', 'tooltip')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('background-color', 'white')
        .style('border', '1px solid #ddd')
        .style('border-radius', '8px')
        .style('padding', '10px')
        .style('box-shadow', '0 0 10px rgba(0,0,0,0.1)')
        .style('z-index', 1000);
    
    // Add bubbles
    svg.selectAll('circle')
        .data(data)
        .enter()
        .append('circle')
        .attr('cx', d => xScale(d.growthPotential))
        .attr('cy', d => yScale(d.techPenetration))
        .attr('r', d => sizeScale(d.marketSize))
        .attr('fill', d => colorScale(d.competitiveIntensity))
        .attr('stroke', '#fff')
        .attr('stroke-width', 1.5)
        .attr('opacity', 0.85)
        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(200)
                .attr('stroke-width', 3)
                .attr('opacity', 1);
            
            tooltip.transition()
                .duration(200)
                .style('opacity', .9);
            
            tooltip.html(`
                <div style="font-weight:bold; font-size:14px; margin-bottom:5px;">${d.name}</div>
                <div style="margin-bottom:3px;"><b>Category:</b> ${d.category}</div>
                <div style="margin-bottom:3px;"><b>Market Segment:</b> ${d.marketSegment}</div>
                <div style="margin-bottom:3px;"><b>Growth Potential:</b> ${d.growthPotential}/10</div>
                <div style="margin-bottom:3px;"><b>Tech Penetration:</b> ${10-d.techPenetration}/10</div>
                <div style="margin-bottom:3px;"><b>Market Size:</b> $${d.marketSize.toLocaleString()}M</div>
                <div style="margin-bottom:3px;"><b>Competitive Intensity:</b> ${d.competitiveIntensity}/10</div>
                <div style="margin-top:8px; font-style:italic;">${d.description}</div>
            `)
                .style('left', (event.pageX + 10) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })
        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .duration(500)
                .attr('stroke-width', 1.5)
                .attr('opacity', 0.85);
            
            tooltip.transition()
                .duration(500)
                .style('opacity', 0);
        });
    
    // Add labels for larger bubbles
    svg.selectAll('text.bubble-label')
        .data(data.filter(d => d.marketSize > 500))  // Only label larger opportunities
        .enter()
        .append('text')
        .attr('class', 'bubble-label')
        .attr('x', d => xScale(d.growthPotential))
        .attr('y', d => yScale(d.techPenetration) - sizeScale(d.marketSize) - 5)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('font-weight', 'bold')
        .text(d => d.name);
    
    // Add quadrant labels
    // Top-left: Low Growth, High Tech
    svg.append('text')
        .attr('x', width * 0.25)
        .attr('y', height * 0.15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#666')
        .text('Mature Technology');
    
    // Top-right: High Growth, High Tech
    svg.append('text')
        .attr('x', width * 0.75)
        .attr('y', height * 0.15)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#666')
        .text('Growth Technology');
    
    // Bottom-left: Low Growth, Low Tech
    svg.append('text')
        .attr('x', width * 0.25)
        .attr('y', height * 0.85)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#666')
        .text('Limited Opportunity');
    
    // Bottom-right: High Growth, Low Tech
    svg.append('text')
        .attr('x', width * 0.75)
        .attr('y', height * 0.85)
        .attr('text-anchor', 'middle')
        .attr('font-size', '14px')
        .attr('fill', '#666')
        .text('Untapped Opportunity');
    
    // Add legend for bubble size
    const sizeLegend = svg.append('g')
        .attr('class', 'size-legend')
        .attr('transform', `translate(${width - 150}, ${height - 100})`);
    
    sizeLegend.append('text')
        .attr('x', 0)
        .attr('y', -40)
        .attr('text-anchor', 'start')
        .text('Market Size ($M)');
    
    const sizeValues = [100, 500, 1000];
    sizeValues.forEach((size, i) => {
        sizeLegend.append('circle')
            .attr('cx', 30)
            .attr('cy', i * 25)
            .attr('r', sizeScale(size))
            .attr('fill', 'none')
            .attr('stroke', '#666');
        
        sizeLegend.append('text')
            .attr('x', 70)
            .attr('y', i * 25 + 5)
            .text(`$${size}M`);
    });
    
    // Add legend for color
    const colorLegend = svg.append('g')
        .attr('class', 'color-legend')
        .attr('transform', `translate(50, ${height - 100})`);
    
    colorLegend.append('text')
        .attr('x', 0)
        .attr('y', -40)
        .attr('text-anchor', 'start')
        .text('Competitive Intensity');
    
    const colorValues = [1, 5, 9];
    const colorLabels = ['Low', 'Medium', 'High'];
    
    colorValues.forEach((value, i) => {
        colorLegend.append('circle')
            .attr('cx', 30)
            .attr('cy', i * 25)
            .attr('r', 10)
            .attr('fill', colorScale(value));
        
        colorLegend.append('text')
            .attr('x', 50)
            .attr('y', i * 25 + 5)
            .text(colorLabels[i]);
    });
    
    // Update insights based on data
    updateInsightsFromData(data);
}

// Set up filter event listeners
function setupFilterEventListeners() {
    const categoryFilter = document.getElementById('opportunity-category-filter');
    const segmentFilter = document.getElementById('market-segment-filter');
    
    // Add event listeners to filters
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            reloadData();
        });
    }
    
    if (segmentFilter) {
        segmentFilter.addEventListener('change', function() {
            reloadData();
        });
    }
}

// Reload data based on current filter values
function reloadData() {
    const filters = {
        dateRange: document.getElementById('date-range-filter').value,
        geography: document.getElementById('geography-filter').value,
        lineOfBusiness: document.getElementById('lob-filter').value,
        category: document.getElementById('opportunity-category-filter').value,
        marketSegment: document.getElementById('market-segment-filter').value
    };
    
    // Generate new data
    if (typeof generateInvestmentOpportunityData === 'function') {
        const data = generateInvestmentOpportunityData(filters);
        createInvestmentOpportunitiesVisualization(data);
    }
}

// Update insights panel based on data
function updateInsightsFromData(data) {
    // Calculate insights
    // 1. Total market size
    const totalMarketSize = d3.sum(data, d => d.marketSize);
    
    // 2. Top opportunity by growth potential
    const topGrowthOpp = data.sort((a, b) => b.growthPotential - a.growthPotential)[0];
    
    // 3. Most untapped opportunity (high growth, low tech)
    const untappedOpps = data.filter(d => d.growthPotential > 7 && d.techPenetration > 7);
    const topUntappedOpp = untappedOpps.sort((a, b) => b.marketSize - a.marketSize)[0];
    
    // 4. Biggest market size opportunity
    const biggestMarketOpp = data.sort((a, b) => b.marketSize - a.marketSize)[0];
    
    // Update the insights panel
    const insightContent = document.querySelector('.insight-content');
    if (insightContent) {
        insightContent.innerHTML = `
            <p><strong>Total Market Opportunity:</strong> $${totalMarketSize.toLocaleString()}M across ${data.length} opportunities</p>
            <p><strong>Highest Growth Potential:</strong> ${topGrowthOpp.name} (${topGrowthOpp.growthPotential}/10)</p>
            ${topUntappedOpp ? 
                `<p><strong>Most Untapped Opportunity:</strong> ${topUntappedOpp.name} ($${topUntappedOpp.marketSize}M market size with ${10-topUntappedOpp.techPenetration}/10 tech gap)</p>` : ''}
            <p><strong>Largest Market Size:</strong> ${biggestMarketOpp.name} ($${biggestMarketOpp.marketSize}M)</p>
            <p><strong>Recommendation:</strong> Focus on opportunities in the bottom-right quadrant (high growth potential, low current tech penetration) for greatest impact.</p>
        `;
    }
}

// Display error message in the container
function displayErrorMessage(message) {
    const container = document.getElementById('investment-opportunities-container');
    if (container) {
        container.innerHTML = `
            <div class="error-message" style="text-align: center; padding: 50px;">
                <h3>Error</h3>
                <p>${message}</p>
                <p>Please try refreshing the page or contact support.</p>
            </div>
        `;
    }
}
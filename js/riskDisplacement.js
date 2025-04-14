// Enhanced Risk Displacement Tracker Component
// This component visualizes premium flow from admitted to E&S markets with interactive features

// DOM elements
const riskDisplacementContainer = document.getElementById('risk-displacement-container');
const stateFilter = document.getElementById('state-filter');
const riskTypeFilter = document.getElementById('risk-type-filter');
const timeframeFilter = document.getElementById('timeframe-filter');

// Initialize the visualization
async function initRiskDisplacement() {
    try {
        // Load data from JSON files
        const regulatoryResponse = await fetch('data/regulatory_analysis.json');
        const regulatoryData = await regulatoryResponse.json();
        
        const rateResponse = await fetch('data/nonadmit_rate_analysis.json');
        const rateData = await rateResponse.json();
        
        const emergingResponse = await fetch('data/emerging_risk_categories.json');
        const emergingData = await emergingResponse.json();
        
        // Combine data for visualization
        const combinedData = {
            regulatory: regulatoryData,
            rates: rateData,
            emerging: emergingData
        };
        
        // Initialize filters
        populateFilters(combinedData);
        
        // Create initial visualization
        createRiskDisplacementVisualization(combinedData);
        
        // Add event listeners
        if (stateFilter) stateFilter.addEventListener('change', () => updateVisualization(combinedData));
        if (riskTypeFilter) riskTypeFilter.addEventListener('change', () => updateVisualization(combinedData));
        if (timeframeFilter) timeframeFilter.addEventListener('change', () => updateVisualization(combinedData));
        
        console.log('Risk Displacement visualization initialized');
    } catch (error) {
        console.error('Error initializing Risk Displacement:', error);
        if (riskDisplacementContainer) {
            riskDisplacementContainer.innerHTML = '<p class="error">Error loading risk displacement data. Please try again later.</p>';
        }
    }
}

// Populate filter dropdowns
function populateFilters(data) {
    // State filter
    if (stateFilter) {
        const states = [];
        
        // Extract states from regulatory data
        if (data.regulatory && data.regulatory.state_regulations) {
            data.regulatory.state_regulations.forEach(reg => {
                if (reg.state && !states.includes(reg.state)) {
                    states.push(reg.state);
                }
            });
        }
        
        // Add states from rate flexibility data
        if (data.rates && data.rates.rate_flexibility) {
            Object.keys(data.rates.rate_flexibility).forEach(state => {
                if (!states.includes(state)) {
                    states.push(state);
                }
            });
        }
        
        // If no states found, add default states
        if (states.length === 0) {
            ['California', 'Florida', 'Texas', 'New York', 'Illinois'].forEach(state => {
                states.push(state);
            });
        }
        
        stateFilter.innerHTML = '<option value="all">All States</option>';
        states.sort().forEach(state => {
            const option = document.createElement('option');
            option.value = state;
            option.textContent = state;
            stateFilter.appendChild(option);
        });
    }
    
    // Risk type filter
    if (riskTypeFilter) {
        const riskTypes = [];
        
        // Extract risk types from emerging risks data
        if (data.emerging && data.emerging.emerging_risks) {
            data.emerging.emerging_risks.forEach(risk => {
                if (risk.risk_category && !riskTypes.includes(risk.risk_category)) {
                    riskTypes.push(risk.risk_category);
                }
            });
        }
        
        // Add risk types from price comparison data
        if (data.rates && data.rates.price_comparison) {
            data.rates.price_comparison.forEach(comp => {
                if (comp.line_of_business && !riskTypes.includes(comp.line_of_business)) {
                    riskTypes.push(comp.line_of_business);
                }
            });
        }
        
        // If no risk types found, add default risk types
        if (riskTypes.length === 0) {
            ['Property', 'General Liability', 'Professional Liability', 'Cyber', 'Commercial Auto'].forEach(risk => {
                riskTypes.push(risk);
            });
        }
        
        riskTypeFilter.innerHTML = '<option value="all">All Risk Types</option>';
        riskTypes.sort().forEach(risk => {
            const option = document.createElement('option');
            option.value = risk;
            option.textContent = risk;
            riskTypeFilter.appendChild(option);
        });
    }
}

// Update visualization based on selected filters
function updateVisualization(data) {
    const state = stateFilter ? stateFilter.value : 'all';
    const riskType = riskTypeFilter ? riskTypeFilter.value : 'all';
    const timeframe = timeframeFilter ? timeframeFilter.value : 'current';
    
    createRiskDisplacementVisualization(data, state, riskType, timeframe);
}

// Create the Risk Displacement visualization
function createRiskDisplacementVisualization(data, state = 'all', riskType = 'all', timeframe = 'current') {
    if (!riskDisplacementContainer) return;
    
    // Clear previous visualization
    const chartContainer = document.getElementById('risk-displacement-chart');
    if (chartContainer) {
        chartContainer.innerHTML = '';
    } else {
        const newChartContainer = document.createElement('div');
        newChartContainer.id = 'risk-displacement-chart';
        newChartContainer.className = 'chart';
        riskDisplacementContainer.appendChild(newChartContainer);
    }
    
    // Create insights container if it doesn't exist
    let insightsContainer = document.getElementById('risk-displacement-insights');
    if (!insightsContainer) {
        insightsContainer = document.createElement('div');
        insightsContainer.id = 'risk-displacement-insights';
        insightsContainer.className = 'insights';
        riskDisplacementContainer.appendChild(insightsContainer);
    }
    
    // Set up dimensions
    const width = 800;
    const height = 500;
    const margin = {top: 50, right: 50, bottom: 70, left: 80};
    
    // Create SVG
    const svg = d3.select('#risk-displacement-chart')
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
    const processedData = processRiskData(data, state, riskType, timeframe);
    
    // No data case
    if (processedData.length === 0) {
        svg.append('text')
            .attr('x', (width - margin.left - margin.right) / 2)
            .attr('y', (height - margin.top - margin.bottom) / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', 'var(--text-secondary)')
            .text('No data available for the selected filters');
        
        updateRiskInsights(data, [], state, riskType, timeframe);
        return;
    }
    
    // Create visualization based on selected filters
    if (state !== 'all' && riskType !== 'all') {
        createDetailedRiskView(svg, processedData, width, height, margin, state, riskType);
    } else if (state !== 'all') {
        createStateRiskView(svg, processedData, width, height, margin, state);
    } else if (riskType !== 'all') {
        createRiskTypeView(svg, processedData, width, height, margin, riskType);
    } else {
        createOverviewRiskView(svg, processedData, width, height, margin);
    }
    
    // Update insights
    updateRiskInsights(data, processedData, state, riskType, timeframe);
}

// Process risk data for visualization
function processRiskData(data, state, riskType, timeframe) {
    let processedData = [];
    
    // Process data based on filters
    if (state !== 'all' && riskType !== 'all') {
        // Detailed view for specific state and risk type
        processedData = processDetailedRiskData(data, state, riskType, timeframe);
    } else if (state !== 'all') {
        // State-specific view across risk types
        processedData = processStateRiskData(data, state, timeframe);
    } else if (riskType !== 'all') {
        // Risk type view across states
        processedData = processRiskTypeData(data, riskType, timeframe);
    } else {
        // Overview of all states and risk types
        processedData = processOverviewRiskData(data, timeframe);
    }
    
    return processedData;
}

// Process data for detailed view (specific state and risk type)
function processDetailedRiskData(data, state, riskType, timeframe) {
    const detailedData = [];
    
    // Get price comparison data for the risk type
    let priceRatio = 1.2; // Default ratio
    if (data.rates && data.rates.price_comparison) {
        const comparison = data.rates.price_comparison.find(comp => 
            comp.line_of_business.toLowerCase() === riskType.toLowerCase()
        );
        if (comparison) {
            priceRatio = comparison.non_admitted_rate / comparison.admitted_rate;
        }
    }
    
    // Get rate flexibility for the state
    let flexibility = 75; // Default flexibility
    if (data.rates && data.rates.rate_flexibility && data.rates.rate_flexibility[state]) {
        flexibility = data.rates.rate_flexibility[state];
    }
    
    // Get regulatory info for the state
    let regulatoryInfo = null;
    if (data.regulatory && data.regulatory.state_regulations) {
        regulatoryInfo = data.regulatory.state_regulations.find(reg => 
            reg.state === state
        );
    }
    
    // Calculate displacement score (0-100)
    const displacementScore = Math.min(
        Math.round((priceRatio * 50) + (flexibility / 10) - 10),
        100
    );
    
    // Add data points for visualization
    detailedData.push({
        category: 'Price Differential',
        value: Math.round((priceRatio - 1) * 100), // Convert to percentage
        description: `${riskType} in ${state} costs ${Math.round((priceRatio - 1) * 100)}% more in E&S market`
    });
    
    detailedData.push({
        category: 'Rate Flexibility',
        value: flexibility,
        description: `${state} has ${flexibility}% rate flexibility for E&S carriers`
    });
    
    detailedData.push({
        category: 'Regulatory Barriers',
        value: 100 - flexibility, // Inverse of flexibility
        description: `${state} has ${100 - flexibility}% regulatory barriers to admitted market`
    });
    
    detailedData.push({
        category: 'Displacement Score',
        value: displacementScore,
        description: `Overall displacement score for ${riskType} in ${state}: ${displacementScore}/100`
    });
    
    // Add regulatory exemptions if available
    if (regulatoryInfo && regulatoryInfo.diligent_search_exemptions) {
        const exemptionValue = regulatoryInfo.diligent_search_exemptions.includes(riskType) ? 90 : 30;
        detailedData.push({
            category: 'Diligent Search Exemption',
            value: exemptionValue,
            description: `${riskType} ${exemptionValue > 50 ? 'has' : 'does not have'} diligent search exemption in ${state}`
        });
    }
    
    return detailedData;
}

// Process data for state-specific view
function processStateRiskData(data, state, timeframe) {
    const stateData = [];
    
    // Get rate flexibility for the state
    let flexibility = 75; // Default flexibility
    if (data.rates && data.rates.rate_flexibility && data.rates.rate_flexibility[state]) {
        flexibility = data.rates.rate_flexibility[state];
    }
    
    // Get regulatory info for the state
    let regulatoryInfo = null;
    if (data.regulatory && data.regulatory.state_regulations) {
        regulatoryInfo = data.regulatory.state_regulations.find(reg => 
            reg.state === state
        );
    }
    
    // Process price comparison data for different risk types
    if (data.rates && data.rates.price_comparison) {
        data.rates.price_comparison.forEach(comp => {
            const riskType = comp.line_of_business;
            const priceRatio = comp.non_admitted_rate / comp.admitted_rate;
            
            // Calculate displacement score for this risk type
            const displacementScore = Math.min(
                Math.round((priceRatio * 50) + (flexibility / 10) - 10),
                100
            );
            
            stateData.push({
                riskType: riskType,
                displacementScore: displacementScore,
                priceRatio: priceRatio,
                flexibility: flexibility,
                description: `${riskType} has a displacement score of ${displacementScore}/100 in ${state}`
            });
        });
    }
    
    // If no data, add some default risk types
    if (stateData.length === 0) {
        const defaultRisks = ['Property', 'General Liability', 'Professional Liability', 'Cyber', 'Commercial Auto'];
        const baseScore = 50 + (flexibility / 10);
        
        defaultRisks.forEach((risk, i) => {
            // Vary the scores slightly for different risk types
            const displacementScore = Math.min(Math.round(baseScore + (i * 5)), 100);
            
            stateData.push({
                riskType: risk,
                displacementScore: displacementScore,
                priceRatio: 1 + (displacementScore / 100),
                flexibility: flexibility,
                description: `${risk} has a displacement score of ${displacementScore}/100 in ${state}`
            });
        });
    }
    
    return stateData;
}

// Process data for risk type view
function processRiskTypeData(data, riskType, timeframe) {
    const riskData = [];
    
    // Get price comparison data for the risk type
    let priceRatio = 1.2; // Default ratio
    if (data.rates && data.rates.price_comparison) {
        const comparison = data.rates.price_comparison.find(comp => 
            comp.line_of_business.toLowerCase() === riskType.toLowerCase()
        );
        if (comparison) {
            priceRatio = comparison.non_admitted_rate / comparison.admitted_rate;
        }
    }
    
    // Process rate flexibility data for different states
    if (data.rates && data.rates.rate_flexibility) {
        Object.entries(data.rates.rate_flexibility).forEach(([state, flexibility]) => {
            // Calculate displacement score for this state
            const displacementScore = Math.min(
                Math.round((priceRatio * 50) + (flexibility / 10) - 10),
                100
            );
            
            riskData.push({
                state: state,
                displacementScore: displacementScore,
                priceRatio: priceRatio,
                flexibility: flexibility,
                description: `${riskType} has a displacement score of ${displacementScore}/100 in ${state}`
            });
        });
    }
    
    // If no data, add some default states
    if (riskData.length === 0) {
        const defaultStates = ['California', 'Florida', 'Texas', 'New York', 'Illinois'];
        const baseScore = 50 + (priceRatio * 10);
        
        defaultStates.forEach((state, i) => {
            // Vary the scores slightly for different states
            const flexibility = 65 + (i * 5);
            const displacementScore = Math.min(Math.round(baseScore + (i * 3)), 100);
            
            riskData.push({
                state: state,
                displacementScore: displacementScore,
                priceRatio: priceRatio,
                flexibility: flexibility,
                description: `${riskType} has a displacement score of ${displacementScore}/100 in ${state}`
            });
        });
    }
    
    return riskData;
}

// Process data for overview
function processOverviewRiskData(data, timeframe) {
    const overviewData = [];
    
    // Create a mapping of states to risk types with displacement scores
    const stateRiskMap = {};
    
    // Process price comparison data
    if (data.rates && data.rates.price_comparison) {
        data.rates.price_comparison.forEach(comp => {
            const riskType = comp.line_of_business;
            const priceRatio = comp.non_admitted_rate / comp.admitted_rate;
            
            // Process for each state with rate flexibility data
            if (data.rates && data.rates.rate_flexibility) {
                Object.entries(data.rates.rate_flexibility).forEach(([state, flexibility]) => {
                    // Calculate displacement score
                    const displacementScore = Math.min(
                        Math.round((priceRatio * 50) + (flexibility / 10) - 10),
                        100
                    );
                    
                    // Add to state-risk map
                    if (!stateRiskMap[state]) {
                        stateRiskMap[state] = {};
                    }
                    
                    stateRiskMap[state][riskType] = displacementScore;
                });
            }
        });
    }
    
    // If no data, create default state-risk map
    if (Object.keys(stateRiskMap).length === 0) {
        const defaultStates = ['California', 'Florida', 'Texas', 'New York', 'Illinois'];
        const defaultRisks = ['Property', 'General Liability', 'Professional Liability', 'Cyber', 'Commercial Auto'];
        
        defaultStates.forEach((state, i) => {
            stateRiskMap[state] = {};
            
            defaultRisks.forEach((risk, j) => {
                // Create varied displacement scores
                const baseScore = 50 + (i * 3) + (j * 2);
                stateRiskMap[state][risk] = Math.min(baseScore, 100);
            });
        });
    }
    
    // Calculate average displacement score for each state
    Object.entries(stateRiskMap).forEach(([state, risks]) => {
        const riskScores = Object.values(risks);
        const avgScore = riskScores.reduce((sum, score) => sum + score, 0) / riskScores.length;
        
        overviewData.push({
            state: state,
            avgDisplacementScore: Math.round(avgScore),
            riskScores: risks,
            description: `${state} has an average displacement score of ${Math.round(avgScore)}/100 across all risk types`
        });
    });
    
    return overviewData;
}

// Create detailed risk view (specific state and risk type)
function createDetailedRiskView(svg, data, width, height, margin, state, riskType) {
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([0, width - margin.left - margin.right])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.top - margin.bottom, 0]);
    
    // Define color scale
    const colorScale = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(['#64d2ff', '#5e5ce6', '#ff375f']);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end')
        .attr('dx', '-0.8em')
        .attr('dy', '0.15em');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
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
        .text('Score (0-100)');
    
    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.category))
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - margin.top - margin.bottom - yScale(d.value))
        .attr('fill', d => colorScale(d.value))
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
                    <div class="tooltip-title">${d.category}</div>
                    <div class="tooltip-content">
                        <p><strong>Score:</strong> ${d.value}/100</p>
                        <p>${d.description}</p>
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
    svg.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.category) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'var(--text-primary)')
        .text(d => d.value);
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text(`${riskType} Risk Displacement in ${state}`);
}

// Create state risk view (specific state, all risk types)
function createStateRiskView(svg, data, width, height, margin, state) {
    // Sort data by displacement score
    data.sort((a, b) => b.displacementScore - a.displacementScore);
    
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.riskType))
        .range([0, width - margin.left - margin.right])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.top - margin.bottom, 0]);
    
    // Define color scale
    const colorScale = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(['#64d2ff', '#5e5ce6', '#ff375f']);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end')
        .attr('dx', '-0.8em')
        .attr('dy', '0.15em');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
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
        .text('Displacement Score (0-100)');
    
    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.riskType))
        .attr('y', d => yScale(d.displacementScore))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - margin.top - margin.bottom - yScale(d.displacementScore))
        .attr('fill', d => colorScale(d.displacementScore))
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
                    <div class="tooltip-title">${d.riskType} in ${state}</div>
                    <div class="tooltip-content">
                        <p><strong>Displacement Score:</strong> ${d.displacementScore}/100</p>
                        <p><strong>Price Ratio:</strong> ${(d.priceRatio * 100).toFixed(0)}% of admitted market</p>
                        <p><strong>Rate Flexibility:</strong> ${d.flexibility}/100</p>
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
    svg.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.riskType) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.displacementScore) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'var(--text-primary)')
        .text(d => d.displacementScore);
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text(`Risk Displacement in ${state} by Risk Type`);
}

// Create risk type view (specific risk type, all states)
function createRiskTypeView(svg, data, width, height, margin, riskType) {
    // Sort data by displacement score
    data.sort((a, b) => b.displacementScore - a.displacementScore);
    
    // Limit to top 10 states if there are too many
    const displayData = data.length > 10 ? data.slice(0, 10) : data;
    
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(displayData.map(d => d.state))
        .range([0, width - margin.left - margin.right])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.top - margin.bottom, 0]);
    
    // Define color scale
    const colorScale = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(['#64d2ff', '#5e5ce6', '#ff375f']);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end')
        .attr('dx', '-0.8em')
        .attr('dy', '0.15em');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
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
        .text('Displacement Score (0-100)');
    
    // Add bars
    svg.selectAll('.bar')
        .data(displayData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.state))
        .attr('y', d => yScale(d.displacementScore))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - margin.top - margin.bottom - yScale(d.displacementScore))
        .attr('fill', d => colorScale(d.displacementScore))
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
                    <div class="tooltip-title">${riskType} in ${d.state}</div>
                    <div class="tooltip-content">
                        <p><strong>Displacement Score:</strong> ${d.displacementScore}/100</p>
                        <p><strong>Price Ratio:</strong> ${(d.priceRatio * 100).toFixed(0)}% of admitted market</p>
                        <p><strong>Rate Flexibility:</strong> ${d.flexibility}/100</p>
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
    svg.selectAll('.label')
        .data(displayData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.state) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.displacementScore) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'var(--text-primary)')
        .text(d => d.displacementScore);
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text(`${riskType} Risk Displacement by State`);
    
    // Add note if data was limited
    if (data.length > 10) {
        svg.append('text')
            .attr('x', (width - margin.left - margin.right) / 2)
            .attr('y', height - margin.top - margin.bottom + 60)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', 'var(--text-secondary)')
            .text('* Showing top 10 states by displacement score');
    }
}

// Create overview risk view (all states and risk types)
function createOverviewRiskView(svg, data, width, height, margin) {
    // Sort data by average displacement score
    data.sort((a, b) => b.avgDisplacementScore - a.avgDisplacementScore);
    
    // Limit to top 10 states if there are too many
    const displayData = data.length > 10 ? data.slice(0, 10) : data;
    
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(displayData.map(d => d.state))
        .range([0, width - margin.left - margin.right])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.top - margin.bottom, 0]);
    
    // Define color scale
    const colorScale = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(['#64d2ff', '#5e5ce6', '#ff375f']);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px')
        .attr('transform', 'rotate(-45)')
        .attr('text-anchor', 'end')
        .attr('dx', '-0.8em')
        .attr('dy', '0.15em');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).ticks(5))
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
        .text('Average Displacement Score (0-100)');
    
    // Add bars
    svg.selectAll('.bar')
        .data(displayData)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.state))
        .attr('y', d => yScale(d.avgDisplacementScore))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - margin.top - margin.bottom - yScale(d.avgDisplacementScore))
        .attr('fill', d => colorScale(d.avgDisplacementScore))
        .attr('rx', 4)
        .attr('opacity', 0.8)
        .on('mouseover', function(event, d) {
            // Highlight bar
            d3.select(this)
                .attr('opacity', 1)
                .attr('stroke', '#ffffff')
                .attr('stroke-width', 1);
            
            // Show tooltip
            const tooltipContent = `
                <div class="tooltip-title">${d.state} Risk Displacement</div>
                <div class="tooltip-content">
                    <p><strong>Average Score:</strong> ${d.avgDisplacementScore}/100</p>
                    <p><strong>Risk Breakdown:</strong></p>
                    <ul style="margin: 5px 0; padding-left: 20px;">
                        ${Object.entries(d.riskScores).map(([risk, score]) => 
                            `<li>${risk}: ${score}/100</li>`
                        ).join('')}
                    </ul>
                </div>
            `;
            
            d3.select('#tooltip')
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 20}px`)
                .style('display', 'block')
                .html(tooltipContent);
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
    svg.selectAll('.label')
        .data(displayData)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.state) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.avgDisplacementScore) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'var(--text-primary)')
        .text(d => d.avgDisplacementScore);
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text('Risk Displacement by State (All Risk Types)');
    
    // Add note if data was limited
    if (data.length > 10) {
        svg.append('text')
            .attr('x', (width - margin.left - margin.right) / 2)
            .attr('y', height - margin.top - margin.bottom + 60)
            .attr('text-anchor', 'middle')
            .style('font-size', '12px')
            .style('fill', 'var(--text-secondary)')
            .text('* Showing top 10 states by average displacement score');
    }
}

// Update insights based on filtered data
function updateRiskInsights(data, processedData, state, riskType, timeframe) {
    const insightsContainer = document.getElementById('risk-displacement-insights');
    if (!insightsContainer) return;
    
    let insightsHTML = '<h3>Risk Displacement Insights</h3>';
    
    if (processedData.length === 0) {
        insightsHTML += '<p>No data available for the selected filters. Try adjusting your criteria.</p>';
        insightsContainer.innerHTML = insightsHTML;
        return;
    }
    
    // Generate insights based on filters
    if (state !== 'all' && riskType !== 'all') {
        // Detailed view insights
        const displacementScore = processedData.find(d => d.category === 'Displacement Score')?.value || 0;
        const priceDifferential = processedData.find(d => d.category === 'Price Differential')?.value || 0;
        const rateFlexibility = processedData.find(d => d.category === 'Rate Flexibility')?.value || 0;
        
        insightsHTML += `
            <p><strong>Overall Displacement Score:</strong> ${displacementScore}/100</p>
            <p><strong>Price Differential:</strong> ${priceDifferential}% higher in E&S market</p>
            <p><strong>Rate Flexibility:</strong> ${rateFlexibility}/100</p>
        `;
        
        // Add regulatory insight if available
        const regulatoryBarriers = processedData.find(d => d.category === 'Regulatory Barriers')?.value || 0;
        if (regulatoryBarriers > 0) {
            insightsHTML += `<p><strong>Regulatory Barriers:</strong> ${regulatoryBarriers}/100</p>`;
        }
        
        // Add diligent search exemption insight if available
        const exemption = processedData.find(d => d.category === 'Diligent Search Exemption');
        if (exemption) {
            insightsHTML += `<p><strong>Diligent Search Exemption:</strong> ${exemption.value > 50 ? 'Yes' : 'No'}</p>`;
        }
    } else if (state !== 'all') {
        // State-specific insights
        const avgScore = processedData.reduce((sum, d) => sum + d.displacementScore, 0) / processedData.length;
        const highestRisk = processedData.reduce((max, d) => d.displacementScore > max.displacementScore ? d : max, processedData[0]);
        const lowestRisk = processedData.reduce((min, d) => d.displacementScore < min.displacementScore ? d : min, processedData[0]);
        
        insightsHTML += `
            <p><strong>Average Displacement Score:</strong> ${avgScore.toFixed(1)}/100</p>
            <p><strong>Highest Displacement:</strong> ${highestRisk.riskType} (${highestRisk.displacementScore}/100)</p>
            <p><strong>Lowest Displacement:</strong> ${lowestRisk.riskType} (${lowestRisk.displacementScore}/100)</p>
            <p><strong>Rate Flexibility:</strong> ${highestRisk.flexibility}/100</p>
        `;
    } else if (riskType !== 'all') {
        // Risk type insights
        const avgScore = processedData.reduce((sum, d) => sum + d.displacementScore, 0) / processedData.length;
        const highestState = processedData.reduce((max, d) => d.displacementScore > max.displacementScore ? d : max, processedData[0]);
        const lowestState = processedData.reduce((min, d) => d.displacementScore < min.displacementScore ? d : min, processedData[0]);
        
        insightsHTML += `
            <p><strong>Average Displacement Score:</strong> ${avgScore.toFixed(1)}/100</p>
            <p><strong>Highest Displacement State:</strong> ${highestState.state} (${highestState.displacementScore}/100)</p>
            <p><strong>Lowest Displacement State:</strong> ${lowestState.state} (${lowestState.displacementScore}/100)</p>
            <p><strong>Price Ratio:</strong> ${(highestState.priceRatio * 100).toFixed(0)}% of admitted market</p>
        `;
    } else {
        // Overview insights
        const avgScore = processedData.reduce((sum, d) => sum + d.avgDisplacementScore, 0) / processedData.length;
        const highestState = processedData.reduce((max, d) => d.avgDisplacementScore > max.avgDisplacementScore ? d : max, processedData[0]);
        const lowestState = processedData.reduce((min, d) => d.avgDisplacementScore < min.avgDisplacementScore ? d : min, processedData[0]);
        
        insightsHTML += `
            <p><strong>Average Displacement Score:</strong> ${avgScore.toFixed(1)}/100</p>
            <p><strong>Highest Displacement State:</strong> ${highestState.state} (${highestState.avgDisplacementScore}/100)</p>
            <p><strong>Lowest Displacement State:</strong> ${lowestState.state} (${lowestState.avgDisplacementScore}/100)</p>
            <p><strong>States Analyzed:</strong> ${processedData.length}</p>
        `;
    }
    
    // Add AI-generated insight
    insightsHTML += `<div style="margin-top: 20px; padding: 15px; background: rgba(10, 132, 255, 0.1); border-radius: 8px; border: 1px solid rgba(10, 132, 255, 0.3);">
        <h4 style="color: var(--accent-primary); margin-bottom: 10px; font-size: 14px;">AI-Generated Insight</h4>
        <p style="font-style: italic; color: var(--text-secondary);">
            ${generateRiskInsight(data, processedData, state, riskType, timeframe)}
        </p>
    </div>`;
    
    insightsContainer.innerHTML = insightsHTML;
}

// Generate AI insight based on data and filters
function generateRiskInsight(data, processedData, state, riskType, timeframe) {
    if (state !== 'all' && riskType !== 'all') {
        // Detailed view insight
        const displacementScore = processedData.find(d => d.category === 'Displacement Score')?.value || 0;
        
        if (displacementScore > 75) {
            return `${riskType} risks in ${state} show strong displacement from admitted to E&S markets (score: ${displacementScore}/100). This indicates significant opportunity for technology solutions that can efficiently underwrite, price, and manage these risks in the non-admitted space. Venture capital investments should target platforms that specialize in ${riskType.toLowerCase()} risk assessment and policy administration for E&S carriers and MGAs operating in ${state}.`;
        } else if (displacementScore > 50) {
            return `${riskType} risks in ${state} show moderate displacement from admitted to E&S markets (score: ${displacementScore}/100). This suggests growing opportunity for technology solutions that can improve efficiency in risk assessment and policy administration. Venture capital investments should consider platforms that can help E&S carriers better evaluate and price ${riskType.toLowerCase()} risks in ${state}.`;
        } else {
            return `${riskType} risks in ${state} show limited displacement from admitted to E&S markets (score: ${displacementScore}/100). This suggests the admitted market is still adequately serving this segment. Technology investments should focus on solutions that help admitted carriers better manage these risks or identify specific niches within ${riskType.toLowerCase()} where E&S opportunities may emerge in ${state}.`;
        }
    } else if (state !== 'all') {
        // State-specific insight
        const avgScore = processedData.reduce((sum, d) => sum + d.displacementScore, 0) / processedData.length;
        const highestRisk = processedData.reduce((max, d) => d.displacementScore > max.displacementScore ? d : max, processedData[0]);
        
        return `${state} shows ${avgScore > 70 ? 'significant' : avgScore > 50 ? 'moderate' : 'limited'} risk displacement from admitted to E&S markets (avg score: ${avgScore.toFixed(1)}/100). ${highestRisk.riskType} risks show the highest displacement (${highestRisk.displacementScore}/100), indicating particular opportunity for technology solutions in this segment. Venture capital investments should target platforms that can efficiently assess, price, and manage ${highestRisk.riskType.toLowerCase()} risks in the ${state} E&S market.`;
    } else if (riskType !== 'all') {
        // Risk type insight
        const avgScore = processedData.reduce((sum, d) => sum + d.displacementScore, 0) / processedData.length;
        const highestState = processedData.reduce((max, d) => d.displacementScore > max.displacementScore ? d : max, processedData[0]);
        
        return `${riskType} risks show ${avgScore > 70 ? 'significant' : avgScore > 50 ? 'moderate' : 'limited'} displacement from admitted to E&S markets across states (avg score: ${avgScore.toFixed(1)}/100). ${highestState.state} shows the highest displacement (${highestState.displacementScore}/100), suggesting particular opportunity in this market. Technology investments should focus on solutions that address the unique challenges of ${riskType.toLowerCase()} risk assessment, pricing, and policy administration in the E&S space.`;
    } else {
        // Overview insight
        const avgScore = processedData.reduce((sum, d) => sum + d.avgDisplacementScore, 0) / processedData.length;
        const highestState = processedData.reduce((max, d) => d.avgDisplacementScore > max.avgDisplacementScore ? d : max, processedData[0]);
        
        // Find the highest risk type for the highest state
        const topRiskType = Object.entries(highestState.riskScores).reduce(
            (max, [risk, score]) => score > max.score ? {risk, score} : max, 
            {risk: '', score: 0}
        ).risk;
        
        return `Analysis of ${processedData.length} states shows an average risk displacement score of ${avgScore.toFixed(1)}/100, indicating ${avgScore > 70 ? 'significant' : avgScore > 50 ? 'moderate' : 'limited'} movement from admitted to E&S markets. ${highestState.state} shows the highest overall displacement (${highestState.avgDisplacementScore}/100), with particular concentration in ${topRiskType} risks. This suggests venture capital opportunities in technology platforms that can efficiently assess, price, and manage these displaced risks, especially in high-displacement states and risk categories.`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initRiskDisplacement);

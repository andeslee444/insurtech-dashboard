// InsurTech Startup Landscape Component
// This component visualizes the InsurTech startup ecosystem in the E&S insurance market

// DOM elements
const insurtechContainer = document.getElementById('insurtech-container');
const fundingStageFilter = document.getElementById('funding-stage-filter');
const technologyFocusFilter = document.getElementById('technology-focus-filter');
const sortByFilter = document.getElementById('sort-by-filter');

// Initialize the visualization
async function initInsurtechLandscape() {
    try {
        // Load data from JSON files
        const startupResponse = await fetch('data/insurtech_startups.json');
        const startupData = await startupResponse.json();
        
        // Initialize filters
        populateFilters(startupData);
        
        // Create initial visualization
        createInsurtechVisualization(startupData);
        
        // Add event listeners
        if (fundingStageFilter) fundingStageFilter.addEventListener('change', () => updateVisualization(startupData));
        if (technologyFocusFilter) technologyFocusFilter.addEventListener('change', () => updateVisualization(startupData));
        if (sortByFilter) sortByFilter.addEventListener('change', () => updateVisualization(startupData));
        
        console.log('InsurTech Landscape visualization initialized');
    } catch (error) {
        console.error('Error initializing InsurTech Landscape:', error);
        if (insurtechContainer) {
            insurtechContainer.innerHTML = '<p class="error">Error loading InsurTech startup data. Please try again later.</p>';
        }
    }
}

// Populate filter dropdowns
function populateFilters(data) {
    // First transform the data to get funding stages and tech focuses
    const transformedData = [];
    
    if (data.startups) {
        data.startups.forEach(startup => {
            // Determine funding stage from funding_rounds/amounts
            let fundingStage = "Unknown";
            if (startup["funding_rounds/amounts"]) {
                if (startup["funding_rounds/amounts"].includes('Seed')) {
                    fundingStage = "Seed";
                } else if (startup["funding_rounds/amounts"].includes('Series A')) {
                    fundingStage = "Series A";
                } else if (startup["funding_rounds/amounts"].includes('Series B')) {
                    fundingStage = "Series B";
                } else if (startup["funding_rounds/amounts"].includes('Series C')) {
                    fundingStage = "Series C";
                } else if (startup["funding_rounds/amounts"].includes('IPO') || 
                          startup["funding_rounds/amounts"].includes('SPAC')) {
                    fundingStage = "Public";
                }
            }
            
            // For technology focus, clean up any comma-separated lists
            let techFocus = startup.technology_focus;
            if (techFocus && techFocus.includes(',')) {
                techFocus = techFocus.split(',')[0].trim();
            }
            
            transformedData.push({
                funding_stage: fundingStage,
                technology_focus: techFocus
            });
        });
    }
    
    // Funding stage filter
    if (fundingStageFilter) {
        const stages = [];
        
        // Extract funding stages from transformed data
        transformedData.forEach(item => {
            if (item.funding_stage && !stages.includes(item.funding_stage)) {
                stages.push(item.funding_stage);
            }
        });
        
        fundingStageFilter.innerHTML = '<option value="all">All Funding Stages</option>';
        stages.sort().forEach(stage => {
            const option = document.createElement('option');
            option.value = stage;
            option.textContent = stage;
            fundingStageFilter.appendChild(option);
        });
    }
    
    // Technology focus filter
    if (technologyFocusFilter) {
        const focuses = [];
        
        // Extract technology focuses from transformed data
        transformedData.forEach(item => {
            if (item.technology_focus && !focuses.includes(item.technology_focus)) {
                focuses.push(item.technology_focus);
            }
        });
        
        technologyFocusFilter.innerHTML = '<option value="all">All Technology Focuses</option>';
        focuses.sort().forEach(focus => {
            const option = document.createElement('option');
            option.value = focus;
            option.textContent = focus;
            technologyFocusFilter.appendChild(option);
        });
    }
}

// Update visualization based on selected filters
function updateVisualization(data) {
    const fundingStage = fundingStageFilter ? fundingStageFilter.value : 'all';
    const technologyFocus = technologyFocusFilter ? technologyFocusFilter.value : 'all';
    const sortBy = sortByFilter ? sortByFilter.value : 'funding';
    
    createInsurtechVisualization(data, fundingStage, technologyFocus, sortBy);
}

// Create the InsurTech Landscape visualization
function createInsurtechVisualization(data, fundingStage = 'all', technologyFocus = 'all', sortBy = 'funding') {
    if (!insurtechContainer) return;
    
    // Clear previous visualization
    const chartContainer = document.getElementById('insurtech-chart');
    if (chartContainer) {
        chartContainer.innerHTML = '';
    } else {
        const newChartContainer = document.createElement('div');
        newChartContainer.id = 'insurtech-chart';
        newChartContainer.className = 'chart';
        insurtechContainer.appendChild(newChartContainer);
    }
    
    // Create insights container if it doesn't exist
    let insightsContainer = document.getElementById('insurtech-insights');
    if (!insightsContainer) {
        insightsContainer = document.createElement('div');
        insightsContainer.id = 'insurtech-insights';
        insightsContainer.className = 'insights';
        insurtechContainer.appendChild(insightsContainer);
    }
    
    // Set up dimensions
    const width = 800;
    const height = 500;
    const margin = {top: 50, right: 50, bottom: 70, left: 80};
    
    // Create SVG
    const svg = d3.select('#insurtech-chart')
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
    const processedData = processInsurtechData(data, fundingStage, technologyFocus, sortBy);
    
    // No data case
    if (processedData.length === 0) {
        svg.append('text')
            .attr('x', (width - margin.left - margin.right) / 2)
            .attr('y', (height - margin.top - margin.bottom) / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', 'var(--text-secondary)')
            .text('No startups match the selected filters');
        
        updateInsurtechInsights(data, [], fundingStage, technologyFocus);
        return;
    }
    
    // Create bubble chart visualization
    createBubbleChart(svg, processedData, width, height, margin);
    
    // Update insights
    updateInsurtechInsights(data, processedData, fundingStage, technologyFocus);
}

// Process InsurTech startup data for visualization
function processInsurtechData(data, fundingStage, technologyFocus, sortBy) {
    let processedData = [];
    
    // Filter and transform startups based on selected criteria
    if (data.startups) {
        // First transform the data to have the expected properties
        const transformedData = data.startups.map(startup => {
            // Extract funding amount from funding_rounds/amounts
            let totalFunding = 0;
            if (startup["funding_rounds/amounts"] && startup["funding_rounds/amounts"] !== "NA") {
                // Try to extract a dollar amount
                const match = startup["funding_rounds/amounts"].match(/\$(\d+(\.\d+)?)([MB])/);
                if (match) {
                    const amount = parseFloat(match[1]);
                    const unit = match[3];
                    totalFunding = unit === 'M' ? amount * 1000000 : amount * 1000000000;
                } else if (startup["funding_rounds/amounts"].includes('Seed')) {
                    // Estimate Seed funding average
                    totalFunding = 2000000; // $2M average seed round
                } else if (startup["funding_rounds/amounts"].includes('Series A')) {
                    totalFunding = 10000000; // $10M average Series A
                } else if (startup["funding_rounds/amounts"].includes('Series B')) {
                    totalFunding = 30000000; // $30M average Series B
                }
            }
            
            // Extract founding year from founded
            const foundingYear = parseInt(startup.founded) || 2020;
            
            // Determine funding stage based on funding_rounds/amounts
            let fundingStage = "Unknown";
            if (startup["funding_rounds/amounts"]) {
                if (startup["funding_rounds/amounts"].includes('Seed')) {
                    fundingStage = "Seed";
                } else if (startup["funding_rounds/amounts"].includes('Series A')) {
                    fundingStage = "Series A";
                } else if (startup["funding_rounds/amounts"].includes('Series B')) {
                    fundingStage = "Series B";
                } else if (startup["funding_rounds/amounts"].includes('Series C')) {
                    fundingStage = "Series C";
                } else if (startup["funding_rounds/amounts"].includes('IPO') || 
                          startup["funding_rounds/amounts"].includes('SPAC')) {
                    fundingStage = "Public";
                }
            }
            
            // Extract growth rate from growth_metrics
            let growthRate = 10; // Default growth rate
            if (startup.growth_metrics && startup.growth_metrics !== "NA") {
                const growthMatch = startup.growth_metrics.match(/(\d+)%/);
                if (growthMatch) {
                    growthRate = parseInt(growthMatch[1]);
                } else if (startup.growth_metrics.includes('$')) {
                    // If there's revenue/premium info but no explicit growth, assign moderate growth
                    growthRate = 20;
                }
            }
            
            // For technology focus, take first item if it's a comma-separated list
            let techFocus = startup.technology_focus;
            if (techFocus && techFocus.includes(',')) {
                techFocus = techFocus.split(',')[0].trim();
            }
            
            return {
                company_name: startup.company,
                founding_year: foundingYear,
                total_funding: totalFunding,
                growth_rate: growthRate,
                technology_focus: techFocus,
                funding_stage: fundingStage,
                es_market_segment: startup["e&s_market_segment"]
            };
        });
        
        // Now filter the transformed data
        processedData = transformedData.filter(startup => {
            let include = true;
            
            if (fundingStage !== 'all' && startup.funding_stage !== fundingStage) {
                include = false;
            }
            
            if (technologyFocus !== 'all' && startup.technology_focus !== technologyFocus) {
                include = false;
            }
            
            return include;
        });
    }
    
    // Sort data based on selected criteria
    if (sortBy === 'funding') {
        processedData.sort((a, b) => b.total_funding - a.total_funding);
    } else if (sortBy === 'year') {
        processedData.sort((a, b) => b.founding_year - a.founding_year);
    } else if (sortBy === 'growth') {
        processedData.sort((a, b) => b.growth_rate - a.growth_rate);
    }
    
    return processedData;
}

// Create bubble chart visualization
function createBubbleChart(svg, data, width, height, margin) {
    // Set up scales
    const xScale = d3.scaleLinear()
        .domain([Math.min(...data.map(d => d.founding_year)) - 1, Math.max(...data.map(d => d.founding_year)) + 1])
        .range([0, width - margin.left - margin.right]);
    
    const yScale = d3.scaleLinear()
        .domain([0, Math.max(...data.map(d => d.growth_rate)) * 1.1])
        .range([height - margin.top - margin.bottom, 0]);
    
    const radiusScale = d3.scaleSqrt()
        .domain([0, Math.max(...data.map(d => d.total_funding))])
        .range([5, 50]);
    
    // Define color scale for technology focus
    const techFocuses = Array.from(new Set(data.map(d => d.technology_focus)));
    const colorScale = d3.scaleOrdinal()
        .domain(techFocuses)
        .range(['#ff375f', '#ff9f0a', '#30d158', '#0a84ff', '#5e5ce6', '#bf5af2', '#ff2d55', '#64d2ff']);
    
    // Add X axis
    svg.append('g')
        .attr('transform', `translate(0,${height - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale).tickFormat(d => d.toString()).ticks(5))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '12px');
    
    // Add X axis label
    svg.append('text')
        .attr('y', height - margin.top - margin.bottom + 40)
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '14px')
        .text('Founding Year');
    
    // Add Y axis
    svg.append('g')
        .call(d3.axisLeft(yScale).tickFormat(d => d + '%').ticks(5))
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
    
    // Create a group for the bubbles
    const bubblesGroup = svg.append('g')
        .attr('class', 'bubbles');
    
    // Add bubbles
    bubblesGroup.selectAll('.bubble')
        .data(data)
        .enter()
        .append('circle')
        .attr('class', 'bubble')
        .attr('cx', d => xScale(d.founding_year))
        .attr('cy', d => yScale(d.growth_rate))
        .attr('r', d => radiusScale(d.total_funding))
        .attr('fill', d => colorScale(d.technology_focus))
        .attr('stroke', '#ffffff')
        .attr('stroke-width', 1)
        .attr('opacity', 0.7)
        .on('mouseover', function(event, d) {
            // Highlight bubble
            d3.select(this)
                .attr('opacity', 1)
                .attr('stroke-width', 2);
            
            // Show tooltip
            d3.select('#tooltip')
                .style('left', `${event.pageX + 10}px`)
                .style('top', `${event.pageY - 20}px`)
                .style('display', 'block')
                .html(`
                    <div class="tooltip-title">${d.company_name}</div>
                    <div class="tooltip-content">
                        <p><strong>Founded:</strong> ${d.founding_year}</p>
                        <p><strong>Funding:</strong> $${(d.total_funding / 1000000).toFixed(1)}M</p>
                        <p><strong>Growth Rate:</strong> ${d.growth_rate}%</p>
                        <p><strong>Focus:</strong> ${d.technology_focus}</p>
                        <p><strong>Stage:</strong> ${d.funding_stage}</p>
                        <p><strong>E&S Target:</strong> ${d.es_market_segment}</p>
                    </div>
                `);
        })
        .on('mouseout', function() {
            // Restore bubble
            d3.select(this)
                .attr('opacity', 0.7)
                .attr('stroke-width', 1);
            
            // Hide tooltip
            d3.select('#tooltip').style('display', 'none');
        });
    
    // Add company name labels to larger bubbles
    bubblesGroup.selectAll('.label')
        .data(data.filter(d => radiusScale(d.total_funding) > 20)) // Only label larger bubbles
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.founding_year))
        .attr('y', d => yScale(d.growth_rate))
        .attr('text-anchor', 'middle')
        .attr('dy', '0.3em')
        .style('font-size', '10px')
        .style('fill', '#ffffff')
        .style('pointer-events', 'none')
        .text(d => d.company_name.length > 10 ? d.company_name.substring(0, 10) + '...' : d.company_name);
    
    // Add legend
    const legend = svg.append('g')
        .attr('class', 'legend')
        .attr('transform', `translate(${width - margin.left - margin.right - 150}, 10)`);
    
    // Legend background
    legend.append('rect')
        .attr('width', 140)
        .attr('height', Math.min(30 + techFocuses.length * 20, 200))
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
        .text('Technology Focus');
    
    // Legend items
    techFocuses.forEach((focus, i) => {
        if (i < 8) { // Limit to 8 items to fit in the chart
            const legendItem = legend.append('g')
                .attr('transform', `translate(10, ${i * 20 + 40})`);
            
            legendItem.append('circle')
                .attr('r', 6)
                .attr('fill', colorScale(focus));
            
            legendItem.append('text')
                .attr('x', 15)
                .attr('y', 4)
                .style('font-size', '11px')
                .style('fill', 'var(--text-secondary)')
                .text(focus.length > 15 ? focus.substring(0, 15) + '...' : focus);
        }
    });
    
    // Add bubble size legend
    const sizeLegend = svg.append('g')
        .attr('class', 'size-legend')
        .attr('transform', `translate(20, 10)`);
    
    // Size legend background
    sizeLegend.append('rect')
        .attr('width', 140)
        .attr('height', 80)
        .attr('rx', 8)
        .attr('fill', 'rgba(44, 44, 46, 0.7)')
        .attr('stroke', 'var(--divider)')
        .attr('stroke-width', 1);
    
    // Size legend title
    sizeLegend.append('text')
        .attr('x', 10)
        .attr('y', 20)
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .style('fill', 'var(--text-primary)')
        .text('Funding Amount');
    
    // Size legend items
    const sizeValues = [1000000, 10000000, 50000000]; // $1M, $10M, $50M
    
    sizeValues.forEach((value, i) => {
        const legendItem = sizeLegend.append('g')
            .attr('transform', `translate(30, ${i * 20 + 40})`);
        
        legendItem.append('circle')
            .attr('r', radiusScale(value))
            .attr('fill', 'rgba(255, 255, 255, 0.3)')
            .attr('stroke', '#ffffff')
            .attr('stroke-width', 1);
        
        legendItem.append('text')
            .attr('x', 25)
            .attr('y', 4)
            .style('font-size', '11px')
            .style('fill', 'var(--text-secondary)')
            .text(`$${(value / 1000000)}M`);
    });
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text('InsurTech Startup Landscape in E&S Market');
}

// Update InsurTech Landscape insights
function updateInsurtechInsights(data, processedData, fundingStage, technologyFocus) {
    // Get insights container
    const insightsContainer = document.getElementById('insurtech-insights');
    if (!insightsContainer) return;
    
    // Create insights HTML
    let insightsHTML = '<h3>InsurTech Landscape Insights</h3>';
    
    if (processedData.length > 0) {
        // Calculate insights
        const totalFunding = processedData.reduce((sum, startup) => sum + startup.total_funding, 0);
        const avgGrowthRate = processedData.reduce((sum, startup) => sum + startup.growth_rate, 0) / processedData.length;
        
        // Count by technology focus
        const focusCounts = {};
        processedData.forEach(startup => {
            focusCounts[startup.technology_focus] = (focusCounts[startup.technology_focus] || 0) + 1;
        });
        const topFocus = Object.entries(focusCounts).sort((a, b) => b[1] - a[1])[0] || ['Unknown', 0];
        
        // Count by funding stage
        const stageCounts = {};
        processedData.forEach(startup => {
            stageCounts[startup.funding_stage] = (stageCounts[startup.funding_stage] || 0) + 1;
        });
        const topStage = Object.entries(stageCounts).sort((a, b) => b[1] - a[1])[0] || ['Unknown', 0];
        
        // Find highest funded startup
        const highestFundingStartup = processedData.reduce((highest, startup) => 
            startup.total_funding > highest.total_funding ? startup : highest, processedData[0]);
        
        insightsHTML += `
            <div class="stats-grid">
                <div class="stat">
                    <h4>Startups</h4>
                    <p>${processedData.length}</p>
                </div>
                <div class="stat">
                    <h4>Total Funding</h4>
                    <p>$${(totalFunding / 1000000).toFixed(1)}M</p>
                </div>
                <div class="stat">
                    <h4>Avg. Growth</h4>
                    <p>${avgGrowthRate.toFixed(1)}%</p>
                </div>
            </div>
            <div class="insights-details">
                <p><strong>Top Technology Focus:</strong> ${topFocus[0]} (${topFocus[1]} startups)</p>
                <p><strong>Top Funding Stage:</strong> ${topStage[0]} (${topStage[1]} startups)</p>
                <p><strong>Highest Funded:</strong> ${highestFundingStartup.company_name} ($${(highestFundingStartup.total_funding / 1000000).toFixed(1)}M)</p>
            </div>
        `;
    }
    
    // Add AI-generated insight
    insightsHTML += `<div style="margin-top: 20px; padding: 15px; background: rgba(10, 132, 255, 0.1); border-radius: 8px; border: 1px solid rgba(10, 132, 255, 0.3);">
        <h4 style="color: var(--accent-primary); margin-bottom: 10px; font-size: 14px;">AI-Generated Insight</h4>
        <p style="font-style: italic; color: var(--text-secondary);">
            ${generateInsurtechInsight(data, processedData, fundingStage, technologyFocus)}
        </p>
    </div>`;
    
    insightsContainer.innerHTML = insightsHTML;
}

// Generate AI insight based on data and filters
function generateInsurtechInsight(data, processedData, fundingStage, technologyFocus) {
    if (processedData.length === 0) return 'Insufficient data to generate insights.';
    
    // Calculate total funding
    const totalFunding = processedData.reduce((sum, startup) => sum + startup.total_funding, 0);
    
    // Calculate average growth rate
    const avgGrowthRate = processedData.reduce((sum, startup) => sum + startup.growth_rate, 0) / processedData.length;
    
    // Find newest and oldest startups
    const newestStartup = processedData.reduce((newest, startup) => 
        startup.founding_year > newest.founding_year ? startup : newest, processedData[0]);
    
    const oldestStartup = processedData.reduce((oldest, startup) => 
        startup.founding_year < oldest.founding_year ? startup : oldest, processedData[0]);
    
    // Find startup with highest funding
    const highestFundingStartup = processedData.reduce((highest, startup) => 
        startup.total_funding > highest.total_funding ? startup : highest, processedData[0]);
    
    // Generate insight based on filters
    if (fundingStage !== 'all' && technologyFocus !== 'all') {
        // Specific funding stage and technology focus
        if (processedData.length <= 2) {
            return `The ${technologyFocus} segment within the E&S InsurTech landscape shows limited activity at the ${fundingStage} stage, with only ${processedData.length} companies and $${(totalFunding / 1000000).toFixed(1)}M in funding. This suggests either an emerging opportunity with first-mover advantage potential or a challenging area for technology application. Venture investors should conduct deeper diligence on market-specific barriers and evaluate whether these companies are addressing fundamental E&S market needs or peripheral use cases.`;
        } else if (avgGrowthRate > 50) {
            return `${technologyFocus} solutions at the ${fundingStage} stage show exceptional growth (${avgGrowthRate.toFixed(1)}%) within the E&S InsurTech landscape, attracting $${(totalFunding / 1000000).toFixed(1)}M across ${processedData.length} companies. This rapid growth suggests strong product-market fit and increasing E&S carrier adoption. Venture investors should prioritize companies with proven implementation success in multiple E&S lines and demonstrable ROI metrics, as this segment appears to be approaching an inflection point in the adoption curve.`;
        } else {
            return `The ${fundingStage} segment of ${technologyFocus} solutions in E&S InsurTech shows moderate growth (${avgGrowthRate.toFixed(1)}%) with $${(totalFunding / 1000000).toFixed(1)}M invested across ${processedData.length} companies. ${highestFundingStartup.company_name} leads with $${(highestFundingStartup.total_funding / 1000000).toFixed(1)}M in funding, suggesting investor confidence in their approach. For venture investors, the key differentiator in this space will be solutions that address E&S-specific challenges like non-standard risk assessment and specialized policy forms, rather than general insurance technology.`;
        }
    } else if (fundingStage !== 'all') {
        // Specific funding stage only
        const techFocuses = {};
        processedData.forEach(startup => {
            techFocuses[startup.technology_focus] = (techFocuses[startup.technology_focus] || 0) + 1;
        });
        
        const topFocus = Object.entries(techFocuses).sort((a, b) => b[1] - a[1])[0];
        const diversityIndex = Object.keys(techFocuses).length / processedData.length;
        
        if (fundingStage === 'Seed' || fundingStage === 'Series A') {
            return `Early-stage E&S InsurTech investment (${fundingStage}) is concentrated in ${topFocus[0]} (${topFocus[1]} startups), with $${(totalFunding / 1000000).toFixed(1)}M total funding across ${processedData.length} companies. This early-stage activity suggests emerging opportunities in addressing E&S-specific challenges. Venture investors should look for solutions that target unique E&S market inefficiencies like complex risk assessment, specialized underwriting, and non-standard policy administration, particularly in hardening market segments where admitted carriers are retreating.`;
        } else {
            return `Later-stage E&S InsurTech companies (${fundingStage}) show ${diversityIndex < 0.3 ? 'concentration' : 'diversification'} across technology categories, with ${topFocus[0]} representing the largest segment (${topFocus[1]} companies). With $${(totalFunding / 1000000).toFixed(1)}M invested and ${avgGrowthRate.toFixed(1)}% average growth, these companies demonstrate proven value in the E&S market. Venture investors should focus on solutions showing clear scalability across multiple E&S lines and carrier types, particularly those addressing the increasing flow of risks from admitted to non-admitted markets.`;
        }
    } else if (technologyFocus !== 'all') {
        // Specific technology focus only
        const fundingStages = {};
        processedData.forEach(startup => {
            fundingStages[startup.funding_stage] = (fundingStages[startup.funding_stage] || 0) + 1;
        });
        
        const topStage = Object.entries(fundingStages).sort((a, b) => b[1] - a[1])[0];
        const earlyStageCount = (fundingStages['Seed'] || 0) + (fundingStages['Series A'] || 0);
        const laterStageCount = processedData.length - earlyStageCount;
        
        if (earlyStageCount > laterStageCount) {
            return `${technologyFocus} solutions in the E&S InsurTech landscape are predominantly early-stage (${earlyStageCount} of ${processedData.length} companies), indicating an emerging technology category with $${(totalFunding / 1000000).toFixed(1)}M invested to date. This early-stage concentration suggests the market is still defining optimal approaches and business models. Venture investors should look for companies demonstrating clear differentiation in addressing E&S-specific challenges rather than applying generic insurance technology to the E&S market.`;
        } else {
            return `${technologyFocus} solutions in E&S InsurTech show maturity with ${laterStageCount} of ${processedData.length} companies at Series B or later stages, attracting $${(totalFunding / 1000000).toFixed(1)}M in funding. This maturity suggests proven value propositions and established market adoption. Venture investors should focus on category leaders with demonstrated scale and E&S carrier integration, particularly solutions that address the unique challenges of non-admitted markets like rate flexibility, specialized underwriting, and complex risk assessment.`;
        }
    } else {
        // Overview of all startups
        const techFocuses = {};
        const fundingStages = {};
        const esSegments = {};
        
        processedData.forEach(startup => {
            techFocuses[startup.technology_focus] = (techFocuses[startup.technology_focus] || 0) + 1;
            fundingStages[startup.funding_stage] = (fundingStages[startup.funding_stage] || 0) + 1;
            esSegments[startup.es_market_segment] = (esSegments[startup.es_market_segment] || 0) + 1;
        });
        
        const topFocus = Object.entries(techFocuses).sort((a, b) => b[1] - a[1])[0];
        const topStage = Object.entries(fundingStages).sort((a, b) => b[1] - a[1])[0];
        const topSegment = Object.entries(esSegments).sort((a, b) => b[1] - a[1])[0];
        
        const earlyStageCount = (fundingStages['Seed'] || 0) + (fundingStages['Series A'] || 0);
        const earlyStagePercentage = (earlyStageCount / processedData.length) * 100;
        
        return `The E&S InsurTech landscape shows $${(totalFunding / 1000000).toFixed(1)}M invested across ${processedData.length} companies, with ${earlyStagePercentage.toFixed(0)}% in early stages (Seed/Series A). ${topFocus[0]} represents the dominant technology focus (${topFocus[1]} companies), while ${topSegment[0]} is the primary E&S market segment targeted (${topSegment[1]} companies). This investment pattern suggests venture opportunity in two areas: (1) scaling proven solutions in ${topFocus[0]} that have demonstrated E&S market traction, and (2) identifying early-stage companies addressing underserved E&S segments with innovative approaches to complex risk assessment, specialized underwriting, and non-standard policy administration.`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initInsurtechLandscape);

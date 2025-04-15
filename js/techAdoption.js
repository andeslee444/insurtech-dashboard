// Technology Adoption Metrics Component
// This component visualizes technology adoption in the E&S insurance market

// DOM elements
const techAdoptionContainer = document.getElementById('tech-adoption-container');
const techCategoryFilter = document.getElementById('tech-category-filter');
const entityTypeFilter = document.getElementById('entity-type-filter');

// Initialize the visualization
async function initTechAdoption() {
    try {
        console.log('Initializing Tech Adoption visualization');
        
        // Load data from JSON files
        const techResponse = await fetch('/data/tech_adoption.json');
        const techData = await techResponse.json();
        
        // Initialize filters
        populateFilters(techData);
        
        // Create initial visualization
        createTechAdoptionVisualization(techData);
        
        // Add event listeners
        if (techCategoryFilter) techCategoryFilter.addEventListener('change', () => updateVisualization(techData));
        if (entityTypeFilter) entityTypeFilter.addEventListener('change', () => updateVisualization(techData));
        
        console.log('Technology Adoption visualization initialized');
    } catch (error) {
        console.error('Error initializing Tech Adoption:', error);
        
        // Create a fallback visualization
        const container = document.getElementById('tech-adoption-container');
        if (container) {
            container.innerHTML = `
                <div class="fallback-visualization" style="padding: 20px; border: 1px solid #ccc; border-radius: 8px; margin: 20px 0;">
                    <h3>Technology Adoption Visualization</h3>
                    <p>The visualization could not be loaded. Showing static content instead.</p>
                    
                    <div style="display: flex; justify-content: space-between; margin-top: 20px;">
                        <div style="flex: 1; text-align: center; padding: 15px; background: rgba(10, 132, 255, 0.1); border-radius: 8px; margin-right: 10px;">
                            <h4>AI/ML Adoption</h4>
                            <div style="font-size: 24px; font-weight: bold; color: #0a84ff; margin: 10px 0;">42%</div>
                            <p>E&S Carriers</p>
                        </div>
                        
                        <div style="flex: 1; text-align: center; padding: 15px; background: rgba(10, 132, 255, 0.1); border-radius: 8px; margin-left: 10px;">
                            <h4>Digital Distribution</h4>
                            <div style="font-size: 24px; font-weight: bold; color: #0a84ff; margin: 10px 0;">38%</div>
                            <p>Wholesale Brokers</p>
                        </div>
                    </div>
                    
                    <div style="margin-top: 20px; padding: 15px; background: rgba(10, 132, 255, 0.1); border-radius: 8px;">
                        <h4>Technology Investment Trend</h4>
                        <p>E&S technology investment has grown by 36% year-over-year, with particular focus on underwriting automation and digital distribution platforms.</p>
                    </div>
                </div>
            `;
        }
    }
}

// Populate filter dropdowns
function populateFilters(data) {
    // Tech category filter
    if (techCategoryFilter) {
        const categories = [];
        
        // Extract categories from tech adoption data
        if (data.technology_categories) {
            Object.keys(data.technology_categories).forEach(category => {
                if (!categories.includes(category)) {
                    categories.push(category);
                }
            });
        }
        
        techCategoryFilter.innerHTML = '<option value="all">All Technology Categories</option>';
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            techCategoryFilter.appendChild(option);
        });
    }
    
    // Entity type filter
    if (entityTypeFilter) {
        const entityTypes = [];
        
        // Extract entity types from tech adoption data
        if (data.adoption_by_entity_type) {
            Object.keys(data.adoption_by_entity_type).forEach(entity => {
                if (!entityTypes.includes(entity)) {
                    entityTypes.push(entity);
                }
            });
        }
        
        entityTypeFilter.innerHTML = '<option value="all">All Entity Types</option>';
        entityTypes.sort().forEach(entity => {
            const option = document.createElement('option');
            option.value = entity;
            option.textContent = entity;
            entityTypeFilter.appendChild(option);
        });
    }
}

// Update visualization based on selected filters
function updateVisualization(data) {
    const techCategory = techCategoryFilter ? techCategoryFilter.value : 'all';
    const entityType = entityTypeFilter ? entityTypeFilter.value : 'all';
    
    createTechAdoptionVisualization(data, techCategory, entityType);
}

// Create the Technology Adoption visualization
function createTechAdoptionVisualization(data, techCategory = 'all', entityType = 'all') {
    if (!techAdoptionContainer) return;
    
    // Clear previous visualization
    const chartContainer = document.getElementById('tech-adoption-chart');
    if (chartContainer) {
        chartContainer.innerHTML = '';
    } else {
        const newChartContainer = document.createElement('div');
        newChartContainer.id = 'tech-adoption-chart';
        newChartContainer.className = 'chart';
        techAdoptionContainer.appendChild(newChartContainer);
    }
    
    // Create insights container if it doesn't exist
    let insightsContainer = document.getElementById('tech-adoption-insights');
    if (!insightsContainer) {
        insightsContainer = document.createElement('div');
        insightsContainer.id = 'tech-adoption-insights';
        insightsContainer.className = 'insights';
        techAdoptionContainer.appendChild(insightsContainer);
    }
    
    // Set up dimensions
    const width = 800;
    const height = 500;
    const margin = {top: 50, right: 50, bottom: 70, left: 80};
    
    // Create SVG
    const svg = d3.select('#tech-adoption-chart')
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
    const processedData = processTechData(data, techCategory, entityType);
    
    // No data case
    if (processedData.length === 0) {
        svg.append('text')
            .attr('x', (width - margin.left - margin.right) / 2)
            .attr('y', (height - margin.top - margin.bottom) / 2)
            .attr('text-anchor', 'middle')
            .style('font-size', '16px')
            .style('fill', 'var(--text-secondary)')
            .text('No data available for the selected filters');
        
        updateTechInsights(data, [], techCategory, entityType);
        return;
    }
    
    // Create visualization based on selected filters
    if (techCategory !== 'all' && entityType !== 'all') {
        createDetailedTechView(svg, processedData, width, height, margin, techCategory, entityType);
    } else if (techCategory !== 'all') {
        createTechCategoryView(svg, processedData, width, height, margin, techCategory);
    } else if (entityType !== 'all') {
        createEntityTypeView(svg, processedData, width, height, margin, entityType);
    } else {
        createOverviewTechView(svg, processedData, width, height, margin);
    }
    
    // Update insights
    updateTechInsights(data, processedData, techCategory, entityType);
}

// Process technology adoption data for visualization
function processTechData(data, techCategory, entityType) {
    let processedData = [];
    
    // Process data based on filters
    if (techCategory !== 'all' && entityType !== 'all') {
        // Detailed view for specific tech category and entity type
        processedData = processDetailedTechData(data, techCategory, entityType);
    } else if (techCategory !== 'all') {
        // Tech category view across entity types
        processedData = processTechCategoryData(data, techCategory);
    } else if (entityType !== 'all') {
        // Entity type view across tech categories
        processedData = processEntityTypeData(data, entityType);
    } else {
        // Overview of all tech categories and entity types
        processedData = processOverviewTechData(data);
    }
    
    return processedData;
}

// Process data for detailed view (specific tech category and entity type)
function processDetailedTechData(data, techCategory, entityType) {
    const detailedData = [];
    
    // Get adoption rate for the tech category and entity type
    let adoptionRate = 0;
    if (data.adoption_by_entity_type && 
        data.adoption_by_entity_type[entityType] && 
        data.adoption_by_entity_type[entityType][techCategory]) {
        adoptionRate = data.adoption_by_entity_type[entityType][techCategory];
    }
    
    // Get ROI metrics for the tech category
    let roiMetrics = null;
    if (data.roi_metrics && data.roi_metrics[techCategory]) {
        roiMetrics = data.roi_metrics[techCategory];
    }
    
    // Get investment data for the tech category
    let investmentData = null;
    if (data.investment_by_category && data.investment_by_category[techCategory]) {
        investmentData = data.investment_by_category[techCategory];
    }
    
    // Add data points for visualization
    detailedData.push({
        metric: 'Adoption Rate',
        value: adoptionRate,
        description: `${adoptionRate}% of ${entityType}s have adopted ${techCategory} technology`
    });
    
    if (roiMetrics) {
        detailedData.push({
            metric: 'ROI',
            value: roiMetrics.average_roi,
            description: `Average ROI for ${techCategory}: ${roiMetrics.average_roi}%`
        });
        
        detailedData.push({
            metric: 'Implementation Time',
            value: roiMetrics.implementation_time,
            description: `Average implementation time for ${techCategory}: ${roiMetrics.implementation_time} months`
        });
        
        detailedData.push({
            metric: 'Cost Reduction',
            value: roiMetrics.cost_reduction,
            description: `Average cost reduction from ${techCategory}: ${roiMetrics.cost_reduction}%`
        });
    }
    
    if (investmentData) {
        detailedData.push({
            metric: 'Investment',
            value: investmentData.total_investment / 1000000, // Convert to millions
            description: `Total investment in ${techCategory}: $${(investmentData.total_investment / 1000000).toFixed(1)}M`
        });
    }
    
    return detailedData;
}

// Process data for tech category view
function processTechCategoryData(data, techCategory) {
    const categoryData = [];
    
    // Get adoption rates for the tech category across entity types
    if (data.adoption_by_entity_type) {
        Object.entries(data.adoption_by_entity_type).forEach(([entityType, categories]) => {
            if (categories[techCategory]) {
                categoryData.push({
                    entityType: entityType,
                    adoptionRate: categories[techCategory],
                    description: `${categories[techCategory]}% of ${entityType}s have adopted ${techCategory} technology`
                });
            }
        });
    }
    
    // Get ROI metrics for the tech category
    let roiMetrics = null;
    if (data.roi_metrics && data.roi_metrics[techCategory]) {
        roiMetrics = data.roi_metrics[techCategory];
    }
    
    // Add ROI data to each entity type
    if (roiMetrics) {
        categoryData.forEach(item => {
            item.roi = roiMetrics.average_roi;
            item.implementationTime = roiMetrics.implementation_time;
            item.costReduction = roiMetrics.cost_reduction;
        });
    }
    
    return categoryData;
}

// Process data for entity type view
function processEntityTypeData(data, entityType) {
    const entityData = [];
    
    // Get adoption rates for the entity type across tech categories
    if (data.adoption_by_entity_type && data.adoption_by_entity_type[entityType]) {
        Object.entries(data.adoption_by_entity_type[entityType]).forEach(([category, rate]) => {
            // Get ROI metrics for the tech category
            let roi = 0;
            let implementationTime = 0;
            let costReduction = 0;
            
            if (data.roi_metrics && data.roi_metrics[category]) {
                roi = data.roi_metrics[category].average_roi;
                implementationTime = data.roi_metrics[category].implementation_time;
                costReduction = data.roi_metrics[category].cost_reduction;
            }
            
            entityData.push({
                category: category,
                adoptionRate: rate,
                roi: roi,
                implementationTime: implementationTime,
                costReduction: costReduction,
                description: `${rate}% of ${entityType}s have adopted ${category} technology`
            });
        });
    }
    
    return entityData;
}

// Process data for overview
function processOverviewTechData(data) {
    const overviewData = [];
    
    // Process technology categories
    if (data.technology_categories) {
        Object.entries(data.technology_categories).forEach(([category, details]) => {
            // Calculate average adoption rate across entity types
            let totalAdoption = 0;
            let entityCount = 0;
            
            if (data.adoption_by_entity_type) {
                Object.values(data.adoption_by_entity_type).forEach(entityAdoption => {
                    if (entityAdoption[category]) {
                        totalAdoption += entityAdoption[category];
                        entityCount++;
                    }
                });
            }
            
            const avgAdoption = entityCount > 0 ? totalAdoption / entityCount : 0;
            
            // Get ROI metrics
            let roi = 0;
            let implementationTime = 0;
            let costReduction = 0;
            
            if (data.roi_metrics && data.roi_metrics[category]) {
                roi = data.roi_metrics[category].average_roi;
                implementationTime = data.roi_metrics[category].implementation_time;
                costReduction = data.roi_metrics[category].cost_reduction;
            }
            
            // Get investment data
            let investment = 0;
            if (data.investment_by_category && data.investment_by_category[category]) {
                investment = data.investment_by_category[category].total_investment / 1000000; // Convert to millions
            }
            
            overviewData.push({
                category: category,
                avgAdoption: avgAdoption,
                roi: roi,
                implementationTime: implementationTime,
                costReduction: costReduction,
                investment: investment,
                description: details.description || `${category} technology in E&S insurance`
            });
        });
    }
    
    return overviewData;
}

// Create detailed tech view (specific tech category and entity type)
function createDetailedTechView(svg, data, width, height, margin, techCategory, entityType) {
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.metric))
        .range([0, width - margin.left - margin.right])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.value) * 1.2])
        .range([height - margin.top - margin.bottom, 0]);
    
    // Define color scale
    const colorScale = d3.scaleOrdinal()
        .domain(['Adoption Rate', 'ROI', 'Implementation Time', 'Cost Reduction', 'Investment'])
        .range(['#30d158', '#5e5ce6', '#ff375f', '#ff9f0a', '#64d2ff']);
    
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
        .text('Value');
    
    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.metric))
        .attr('y', d => yScale(d.value))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - margin.top - margin.bottom - yScale(d.value))
        .attr('fill', d => colorScale(d.metric))
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
                    <div class="tooltip-title">${d.metric}</div>
                    <div class="tooltip-content">
                        <p><strong>Value:</strong> ${d.value.toFixed(1)}${d.metric === 'Investment' ? 'M' : '%'}</p>
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
        .attr('x', d => xScale(d.metric) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.value) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'var(--text-primary)')
        .text(d => `${d.value.toFixed(1)}${d.metric === 'Investment' ? 'M' : '%'}`);
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text(`${techCategory} Adoption by ${entityType}`);
}

// Create tech category view (specific tech category, all entity types)
function createTechCategoryView(svg, data, width, height, margin, techCategory) {
    // Sort data by adoption rate
    data.sort((a, b) => b.adoptionRate - a.adoptionRate);
    
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.entityType))
        .range([0, width - margin.left - margin.right])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.top - margin.bottom, 0]);
    
    // Define color scale
    const colorScale = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(['#64d2ff', '#5e5ce6', '#30d158']);
    
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
        .text('Adoption Rate (%)');
    
    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.entityType))
        .attr('y', d => yScale(d.adoptionRate))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - margin.top - margin.bottom - yScale(d.adoptionRate))
        .attr('fill', d => colorScale(d.adoptionRate))
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
                    <div class="tooltip-title">${d.entityType}</div>
                    <div class="tooltip-content">
                        <p><strong>Adoption Rate:</strong> ${d.adoptionRate}%</p>
                        <p><strong>ROI:</strong> ${d.roi}%</p>
                        <p><strong>Implementation Time:</strong> ${d.implementationTime} months</p>
                        <p><strong>Cost Reduction:</strong> ${d.costReduction}%</p>
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
        .attr('x', d => xScale(d.entityType) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.adoptionRate) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'var(--text-primary)')
        .text(d => `${d.adoptionRate}%`);
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text(`${techCategory} Adoption by Entity Type`);
}

// Create entity type view (specific entity type, all tech categories)
function createEntityTypeView(svg, data, width, height, margin, entityType) {
    // Sort data by adoption rate
    data.sort((a, b) => b.adoptionRate - a.adoptionRate);
    
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
        .range(['#64d2ff', '#5e5ce6', '#30d158']);
    
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
        .text('Adoption Rate (%)');
    
    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.category))
        .attr('y', d => yScale(d.adoptionRate))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - margin.top - margin.bottom - yScale(d.adoptionRate))
        .attr('fill', d => colorScale(d.adoptionRate))
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
                        <p><strong>Adoption Rate:</strong> ${d.adoptionRate}%</p>
                        <p><strong>ROI:</strong> ${d.roi}%</p>
                        <p><strong>Implementation Time:</strong> ${d.implementationTime} months</p>
                        <p><strong>Cost Reduction:</strong> ${d.costReduction}%</p>
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
        .attr('y', d => yScale(d.adoptionRate) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'var(--text-primary)')
        .text(d => `${d.adoptionRate}%`);
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text(`Technology Adoption by ${entityType}`);
}

// Create overview tech view (all tech categories and entity types)
function createOverviewTechView(svg, data, width, height, margin) {
    // Sort data by average adoption rate
    data.sort((a, b) => b.avgAdoption - a.avgAdoption);
    
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.category))
        .range([0, width - margin.left - margin.right])
        .padding(0.3);
    
    const yScale = d3.scaleLinear()
        .domain([0, 100])
        .range([height - margin.top - margin.bottom, 0]);
    
    // Define color scale for adoption rate
    const colorScale = d3.scaleLinear()
        .domain([0, 50, 100])
        .range(['#64d2ff', '#5e5ce6', '#30d158']);
    
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
        .text('Average Adoption Rate (%)');
    
    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.category))
        .attr('y', d => yScale(d.avgAdoption))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - margin.top - margin.bottom - yScale(d.avgAdoption))
        .attr('fill', d => colorScale(d.avgAdoption))
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
                        <p><strong>Avg. Adoption Rate:</strong> ${d.avgAdoption.toFixed(1)}%</p>
                        <p><strong>ROI:</strong> ${d.roi}%</p>
                        <p><strong>Implementation Time:</strong> ${d.implementationTime} months</p>
                        <p><strong>Cost Reduction:</strong> ${d.costReduction}%</p>
                        <p><strong>Total Investment:</strong> $${d.investment.toFixed(1)}M</p>
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
        .attr('y', d => yScale(d.avgAdoption) - 5)
        .attr('text-anchor', 'middle')
        .style('font-size', '10px')
        .style('fill', 'var(--text-primary)')
        .text(d => `${d.avgAdoption.toFixed(1)}%`);
    
    // Add title
    svg.append('text')
        .attr('x', (width - margin.left - margin.right) / 2)
        .attr('y', -20)
        .attr('text-anchor', 'middle')
        .style('font-size', '16px')
        .style('font-weight', '600')
        .style('fill', 'var(--text-primary)')
        .text('Technology Adoption in E&S Insurance');
}

// Update insights based on filtered data
function updateTechInsights(data, processedData, techCategory, entityType) {
    const insightsContainer = document.getElementById('tech-adoption-insights');
    if (!insightsContainer) return;
    
    let insightsHTML = '<h3>Technology Adoption Insights</h3>';
    
    if (processedData.length === 0) {
        insightsHTML += '<p>No data available for the selected filters. Try adjusting your criteria.</p>';
        insightsContainer.innerHTML = insightsHTML;
        return;
    }
    
    // Generate insights based on filters
    if (techCategory !== 'all' && entityType !== 'all') {
        // Detailed view insights
        const adoptionRate = processedData.find(d => d.metric === 'Adoption Rate')?.value || 0;
        const roi = processedData.find(d => d.metric === 'ROI')?.value || 0;
        const implementationTime = processedData.find(d => d.metric === 'Implementation Time')?.value || 0;
        const costReduction = processedData.find(d => d.metric === 'Cost Reduction')?.value || 0;
        
        insightsHTML += `
            <p><strong>Adoption Rate:</strong> ${adoptionRate}% of ${entityType}s have adopted ${techCategory}</p>
            <p><strong>ROI:</strong> ${roi}% average return on investment</p>
            <p><strong>Implementation Time:</strong> ${implementationTime} months average</p>
            <p><strong>Cost Reduction:</strong> ${costReduction}% average</p>
        `;
        
        // Add investment insight if available
        const investment = processedData.find(d => d.metric === 'Investment')?.value || 0;
        if (investment > 0) {
            insightsHTML += `<p><strong>Total Investment:</strong> $${investment.toFixed(1)}M</p>`;
        }
    } else if (techCategory !== 'all') {
        // Tech category insights
        const avgAdoption = processedData.reduce((sum, d) => sum + d.adoptionRate, 0) / processedData.length;
        const highestEntity = processedData.reduce((max, d) => d.adoptionRate > max.adoptionRate ? d : max, processedData[0]);
        const lowestEntity = processedData.reduce((min, d) => d.adoptionRate < min.adoptionRate ? d : min, processedData[0]);
        
        // Get ROI metrics from first item (should be same for all)
        const roi = processedData[0]?.roi || 0;
        const implementationTime = processedData[0]?.implementationTime || 0;
        const costReduction = processedData[0]?.costReduction || 0;
        
        insightsHTML += `
            <p><strong>Average Adoption Rate:</strong> ${avgAdoption.toFixed(1)}% across all entity types</p>
            <p><strong>Highest Adoption:</strong> ${highestEntity.entityType} (${highestEntity.adoptionRate}%)</p>
            <p><strong>Lowest Adoption:</strong> ${lowestEntity.entityType} (${lowestEntity.adoptionRate}%)</p>
            <p><strong>ROI:</strong> ${roi}% average return on investment</p>
            <p><strong>Implementation Time:</strong> ${implementationTime} months average</p>
            <p><strong>Cost Reduction:</strong> ${costReduction}% average</p>
        `;
    } else if (entityType !== 'all') {
        // Entity type insights
        const avgAdoption = processedData.reduce((sum, d) => sum + d.adoptionRate, 0) / processedData.length;
        const highestCategory = processedData.reduce((max, d) => d.adoptionRate > max.adoptionRate ? d : max, processedData[0]);
        const lowestCategory = processedData.reduce((min, d) => d.adoptionRate < min.adoptionRate ? d : min, processedData[0]);
        
        insightsHTML += `
            <p><strong>Average Adoption Rate:</strong> ${avgAdoption.toFixed(1)}% across all technology categories</p>
            <p><strong>Highest Adoption:</strong> ${highestCategory.category} (${highestCategory.adoptionRate}%)</p>
            <p><strong>Lowest Adoption:</strong> ${lowestCategory.category} (${lowestCategory.adoptionRate}%)</p>
            <p><strong>Highest ROI Technology:</strong> ${processedData.reduce((max, d) => d.roi > max.roi ? d : max, processedData[0]).category} (${processedData.reduce((max, d) => d.roi > max.roi ? d : max, processedData[0]).roi}%)</p>
        `;
    } else {
        // Overview insights
        const avgAdoption = processedData.reduce((sum, d) => sum + d.avgAdoption, 0) / processedData.length;
        const highestCategory = processedData.reduce((max, d) => d.avgAdoption > max.avgAdoption ? d : max, processedData[0]);
        const lowestCategory = processedData.reduce((min, d) => d.avgAdoption < min.avgAdoption ? d : min, processedData[0]);
        
        // Find highest ROI category
        const highestRoi = processedData.reduce((max, d) => d.roi > max.roi ? d : max, processedData[0]);
        
        // Find highest investment category
        const highestInvestment = processedData.reduce((max, d) => d.investment > max.investment ? d : max, processedData[0]);
        
        insightsHTML += `
            <p><strong>Average Adoption Rate:</strong> ${avgAdoption.toFixed(1)}% across all technologies</p>
            <p><strong>Highest Adoption:</strong> ${highestCategory.category} (${highestCategory.avgAdoption.toFixed(1)}%)</p>
            <p><strong>Lowest Adoption:</strong> ${lowestCategory.category} (${lowestCategory.avgAdoption.toFixed(1)}%)</p>
            <p><strong>Highest ROI Technology:</strong> ${highestRoi.category} (${highestRoi.roi}%)</p>
            <p><strong>Highest Investment:</strong> ${highestInvestment.category} ($${highestInvestment.investment.toFixed(1)}M)</p>
        `;
    }
    
    // Add AI-generated insight
    insightsHTML += `<div style="margin-top: 20px; padding: 15px; background: rgba(10, 132, 255, 0.1); border-radius: 8px; border: 1px solid rgba(10, 132, 255, 0.3);">
        <h4 style="color: var(--accent-primary); margin-bottom: 10px; font-size: 14px;">AI-Generated Insight</h4>
        <p style="font-style: italic; color: var(--text-secondary);">
            ${generateTechInsight(data, processedData, techCategory, entityType)}
        </p>
    </div>`;
    
    insightsContainer.innerHTML = insightsHTML;
}

// Generate AI insight based on data and filters
function generateTechInsight(data, processedData, techCategory, entityType) {
    if (techCategory !== 'all' && entityType !== 'all') {
        // Detailed view insight
        const adoptionRate = processedData.find(d => d.metric === 'Adoption Rate')?.value || 0;
        const roi = processedData.find(d => d.metric === 'ROI')?.value || 0;
        
        if (adoptionRate > 70) {
            return `${techCategory} technology has achieved high adoption (${adoptionRate}%) among ${entityType}s with strong ROI (${roi}%). This indicates market maturity and suggests venture capital opportunities may lie in next-generation solutions that enhance existing capabilities rather than in foundational technology. Consider investments in companies offering advanced features, integration capabilities, or specialized solutions for underserved niches within this technology category.`;
        } else if (adoptionRate > 40) {
            return `${techCategory} technology shows moderate adoption (${adoptionRate}%) among ${entityType}s with promising ROI (${roi}%). This indicates a technology in the growth phase, suggesting significant venture capital opportunities in solutions that address adoption barriers and expand use cases. Consider investments in companies that simplify implementation, reduce costs, or demonstrate clear ROI acceleration compared to existing solutions.`;
        } else {
            return `${techCategory} technology shows low adoption (${adoptionRate}%) among ${entityType}s despite potential ROI (${roi}%). This suggests either an emerging technology with significant growth potential or one facing substantial adoption barriers. Venture capital opportunities exist in solutions that address implementation challenges, demonstrate compelling ROI cases, or offer significant advantages over manual processes. Early-stage investments may yield high returns as this technology category matures.`;
        }
    } else if (techCategory !== 'all') {
        // Tech category insight
        const avgAdoption = processedData.reduce((sum, d) => sum + d.adoptionRate, 0) / processedData.length;
        const highestEntity = processedData.reduce((max, d) => d.adoptionRate > max.adoptionRate ? d : max, processedData[0]);
        const lowestEntity = processedData.reduce((min, d) => d.adoptionRate < min.adoptionRate ? d : min, processedData[0]);
        const roi = processedData[0]?.roi || 0;
        
        return `${techCategory} technology shows varying adoption across entity types (${avgAdoption.toFixed(1)}% average), with ${highestEntity.entityType}s leading at ${highestEntity.adoptionRate}% and ${lowestEntity.entityType}s lagging at ${lowestEntity.adoptionRate}%. This adoption disparity coupled with a ${roi}% average ROI suggests targeted venture capital opportunities in solutions that address the specific needs and adoption barriers of ${lowestEntity.entityType}s. The strong adoption among ${highestEntity.entityType}s indicates proven value, suggesting investments should focus on expanding capabilities for underserved segments rather than fundamental technology development.`;
    } else if (entityType !== 'all') {
        // Entity type insight
        const avgAdoption = processedData.reduce((sum, d) => sum + d.adoptionRate, 0) / processedData.length;
        const highestCategory = processedData.reduce((max, d) => d.adoptionRate > max.adoptionRate ? d : max, processedData[0]);
        const lowestCategory = processedData.reduce((min, d) => d.adoptionRate < min.adoptionRate ? d : min, processedData[0]);
        
        return `${entityType}s show selective technology adoption patterns (${avgAdoption.toFixed(1)}% average), embracing ${highestCategory.category} (${highestCategory.adoptionRate}%) while showing limited adoption of ${lowestCategory.category} (${lowestCategory.adoptionRate}%). This suggests venture capital opportunities in two areas: (1) enhancing capabilities in already-adopted technologies like ${highestCategory.category} with specialized features for ${entityType}s, and (2) addressing adoption barriers for underutilized technologies like ${lowestCategory.category} through solutions tailored to ${entityType} workflows and requirements. The adoption disparity indicates ${entityType}s prioritize technologies with clear ROI and implementation pathways.`;
    } else {
        // Overview insight
        const avgAdoption = processedData.reduce((sum, d) => sum + d.avgAdoption, 0) / processedData.length;
        const highestCategory = processedData.reduce((max, d) => d.avgAdoption > max.avgAdoption ? d : max, processedData[0]);
        const lowestCategory = processedData.reduce((min, d) => d.avgAdoption < min.avgAdoption ? d : min, processedData[0]);
        const highestRoi = processedData.reduce((max, d) => d.roi > max.roi ? d : max, processedData[0]);
        const highestInvestment = processedData.reduce((max, d) => d.investment > max.investment ? d : max, processedData[0]);
        
        return `The E&S insurance technology landscape shows an average adoption rate of ${avgAdoption.toFixed(1)}% across categories, with ${highestCategory.category} leading at ${highestCategory.avgAdoption.toFixed(1)}% and ${lowestCategory.category} at only ${lowestCategory.avgAdoption.toFixed(1)}%. ${highestRoi.category} delivers the highest ROI at ${highestRoi.roi}%, while ${highestInvestment.category} has attracted the most investment ($${highestInvestment.investment.toFixed(1)}M). This suggests venture capital opportunities in three areas: (1) scaling proven high-ROI technologies like ${highestRoi.category}, (2) addressing adoption barriers in underutilized categories like ${lowestCategory.category}, and (3) identifying emerging technologies with strong ROI potential but limited current investment. The E&S market's unique risk profile and regulatory flexibility create particular opportunities for specialized technology solutions that may not be viable in the admitted market.`;
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initTechAdoption);

// Main JavaScript file for E&S Market Opportunity Analyzer
// Enhanced with Apple-inspired dark theme

// Global variables
let marketData;
let structureData;

// Initialize the dashboard
async function initDashboard() {
    try {
        // Try to create dashboard overview container if it doesn't exist
        ensureDashboardOverview();
        
        // Load real data from JSON files
        const marketResponse = await fetch('/data/market_growth_data.json');
        marketData = await marketResponse.json();
        
        try {
            const structureResponse = await fetch('/data/market_structure_data.json');
            structureData = await structureResponse.json();
        } catch (structureError) {
            console.warn('Could not load market structure data:', structureError);
            // Continue with marketData only
        }
        
        // Update dashboard overview with latest data
        updateDashboardOverview();
        
        // Initialize components
        // Note: Individual component initialization is handled in their respective JS files
        initializeAllComponents();
        
        // Add smooth scrolling for navigation
        setupNavigation();
        
        // Add active class to current section in navigation
        setupScrollSpy();
        
        // Add animations for sections
        setupAnimations();
        
        console.log('Dashboard initialized successfully with real data');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        displayFallbackDashboard();
    }
}

// Initialize all visualization components
function initializeAllComponents() {
    // Initialize Market Momentum visualization
    if (typeof initMarketMomentum === 'function') {
        console.log('Initializing Market Momentum visualization');
        initMarketMomentum();
    } else {
        console.warn('initMarketMomentum function not found, skipping initialization');
    }
    
    // Initialize Risk Displacement visualization
    if (typeof initRiskDisplacement === 'function') {
        console.log('Initializing Risk Displacement visualization');
        initRiskDisplacement();
    } else {
        console.warn('initRiskDisplacement function not found, skipping initialization');
    }
    
    // Initialize Tech Adoption visualization
    if (typeof initTechAdoption === 'function') {
        console.log('Initializing Tech Adoption visualization');
        initTechAdoption();
    } else {
        console.warn('initTechAdoption function not found, skipping initialization');
    }
    
    // Initialize InsurTech Landscape visualization
    if (typeof initInsurtechLandscape === 'function') {
        console.log('Initializing InsurTech Landscape visualization');
        initInsurtechLandscape();
    } else {
        console.warn('initInsurtechLandscape function not found, skipping initialization');
    }
    
    // Initialize Investment Opportunities visualization
    if (typeof initInvestmentOpportunities === 'function') {
        console.log('Initializing Investment Opportunities visualization');
        initInvestmentOpportunities();
    } else {
        console.warn('initInvestmentOpportunities function not found, skipping initialization');
    }
}

// Ensure dashboard overview section exists
function ensureDashboardOverview() {
    // Check if dashboard-overview section exists, create if not
    let overviewElement = document.querySelector('.dashboard-overview');
    if (!overviewElement) {
        console.log('Creating dashboard overview element');
        const contentElement = document.querySelector('.content');
        if (contentElement) {
            overviewElement = document.createElement('section');
            overviewElement.className = 'dashboard-overview';
            
            // Create basic structure
            overviewElement.innerHTML = `
                <div class="card">
                    <h2>E&S Market Overview</h2>
                    <div class="stats-container">
                        <div class="stat">
                            <h3>$135B</h3>
                            <p>Total Premium</p>
                        </div>
                        <div class="stat">
                            <h3>14.2%</h3>
                            <p>YoY Growth</p>
                        </div>
                        <div class="stat">
                            <h3>11.5%</h3>
                            <p>Market Share</p>
                        </div>
                        <div class="stat">
                            <h3>$2.8B</h3>
                            <p>Tech Investment</p>
                        </div>
                    </div>
                </div>
            `;
            
            // Insert at the beginning of the content
            contentElement.insertBefore(overviewElement, contentElement.firstChild);
        }
    }
}

// Display fallback dashboard when errors occur
function displayFallbackDashboard() {
    // Create or update dashboard overview with static data
    const overviewElement = document.querySelector('.dashboard-overview');
    if (overviewElement) {
        overviewElement.innerHTML = `
            <div class="card">
                <h2>E&S Market Overview</h2>
                <div class="stats-container">
                    <div class="stat">
                        <h3>$135B</h3>
                        <p>Total Premium</p>
                    </div>
                    <div class="stat">
                        <h3>12.5%</h3>
                        <p>YoY Growth</p>
                    </div>
                    <div class="stat">
                        <h3>11.5%</h3>
                        <p>Market Share</p>
                    </div>
                    <div class="stat">
                        <h3>15.2%</h3>
                        <p>Projected CAGR</p>
                    </div>
                </div>
                <p class="error">Some market data could not be loaded. Showing fallback values.</p>
            </div>
        `;
    }
}

// Update dashboard overview with latest data
function updateDashboardOverview() {
    // Update key metrics with real data
    // Select based on the actual HTML structure: .stats-container .stat
    const metrics = document.querySelectorAll('.stats-container .stat');
    const overviewElement = document.querySelector('.dashboard-overview .card');
    
    if (!metrics || metrics.length === 0) {
        console.warn('No metrics elements found to update');
        return;
    }
    
    // Add a visual chart container if it doesn't exist
    let chartContainer = document.querySelector('.dashboard-overview .chart-container');
    if (!chartContainer) {
        chartContainer = document.createElement('div');
        chartContainer.className = 'chart-container';
        overviewElement.appendChild(chartContainer);
    }
    
    if (marketData) {
        // Use index checks to avoid errors if fewer metrics are found than expected
        // Market size
        if (metrics[0] && marketData.market_size && marketData.market_size['2024']) {
            const h3 = metrics[0].querySelector('h3');
            if (h3) {
                h3.textContent = `$${(marketData.market_size['2024'] / 1e9).toFixed(1)}B`;
            }
        }
        
        // Growth rate
        if (metrics[1] && marketData.growth_rates && marketData.growth_rates['2024']) {
            const h3 = metrics[1].querySelector('h3');
            if (h3) {
                h3.textContent = `${marketData.growth_rates['2024']}%`;
            }
        }
        
        // Market share
        if (metrics[2] && marketData.market_share && marketData.market_share['2023']) {
            const h3 = metrics[2].querySelector('h3');
            if (h3) {
                h3.textContent = `${marketData.market_share['2023']}%`;
            }
        }
        
        // Projected CAGR (Assuming this corresponds to the 4th stat element)
        if (metrics[3] && marketData.projections && marketData.projections['2027'] && marketData.projections['2027'].cagr) {
            const h3 = metrics[3].querySelector('h3');
            if (h3) {
                h3.textContent = `${marketData.projections['2027'].cagr}%`;
            }
        }
        
        // Create visualization for the market overview
        createMarketOverviewVisual(chartContainer);
    }
}

// Create a visualization for the market overview
function createMarketOverviewVisual(container) {
    if (!container || !marketData) return;
    
    // Clear previous chart if any
    container.innerHTML = '';
    
    // Set up dimensions
    const width = container.clientWidth || 800;
    const height = 200;
    const margin = {top: 20, right: 30, bottom: 30, left: 50};
    
    // Create SVG element
    const svg = d3.select(container)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .attr('class', 'overview-chart');
    
    // Create background
    svg.append('rect')
        .attr('width', width)
        .attr('height', height)
        .attr('fill', 'var(--bg-tertiary)')
        .attr('rx', 8);
    
    // Extract growth rate data points for the chart
    const years = Object.keys(marketData.growth_rates).sort();
    const data = years.map(year => ({
        year: year,
        rate: marketData.growth_rates[year]
    }));
    
    // Set up scales
    const xScale = d3.scaleBand()
        .domain(data.map(d => d.year))
        .range([margin.left, width - margin.right])
        .padding(0.2);
    
    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.rate) * 1.2])
        .range([height - margin.bottom, margin.top]);
    
    // Create X and Y axes
    const xAxis = svg.append('g')
        .attr('transform', `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(xScale))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '10px');
    
    const yAxis = svg.append('g')
        .attr('transform', `translate(${margin.left},0)`)
        .call(d3.axisLeft(yScale).ticks(5).tickFormat(d => `${d}%`))
        .selectAll('text')
        .style('fill', 'var(--text-secondary)')
        .style('font-size', '10px');
    
    // Add bars
    svg.selectAll('.bar')
        .data(data)
        .enter()
        .append('rect')
        .attr('class', 'bar')
        .attr('x', d => xScale(d.year))
        .attr('y', d => yScale(d.rate))
        .attr('width', xScale.bandwidth())
        .attr('height', d => height - margin.bottom - yScale(d.rate))
        .attr('fill', (d, i) => {
            // Use a color gradient based on index
            const colors = ['#ff375f', '#ff9f0a', '#30d158', '#0a84ff'];
            return colors[i % colors.length];
        })
        .attr('rx', 4)
        .attr('opacity', 0.8);
    
    // Add value labels
    svg.selectAll('.label')
        .data(data)
        .enter()
        .append('text')
        .attr('class', 'label')
        .attr('x', d => xScale(d.year) + xScale.bandwidth() / 2)
        .attr('y', d => yScale(d.rate) - 5)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-primary)')
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .text(d => `${d.rate}%`);
    
    // Add chart title
    svg.append('text')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .style('fill', 'var(--text-primary)')
        .style('font-size', '12px')
        .style('font-weight', 'bold')
        .text('E&S Market Growth Rate (%)');
}

// Handle navigation
function setupNavigation() {
    const navLinks = document.querySelectorAll('nav a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get the target section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            
            // Remove active class from all links
            navLinks.forEach(link => link.classList.remove('active'));
            
            // Add active class to current link
            this.classList.add('active');
            
            // Scroll to the section with smooth animation
            targetSection.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        });
    });
}

// Setup scroll spy to highlight active navigation item
function setupScrollSpy() {
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('nav a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 200)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
}

// Setup animations for sections
function setupAnimations() {
    // Use Intersection Observer to trigger animations when sections come into view
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1
    });
    
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        section.classList.add('animate-ready');
        observer.observe(section);
    });
    
    // Add animation classes to metrics
    document.querySelectorAll('.metric').forEach((metric, index) => {
        metric.style.animationDelay = `${index * 0.1 + 0.3}s`;
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initDashboard();
    
    // Create tooltip container if it doesn't exist
    if (!document.getElementById('tooltip')) {
        const tooltip = document.createElement('div');
        tooltip.id = 'tooltip';
        tooltip.className = 'tooltip';
        document.body.appendChild(tooltip);
    }
    
    // Add theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

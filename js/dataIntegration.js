// Data Integration Module for E&S Market Opportunity Analyzer
// This file connects the mock data generator with the visualization components

document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard with integrated data
    initializeDashboardWithData();
});

// Initialize the dashboard with integrated data
function initializeDashboardWithData() {
    console.log('Initializing dashboard with integrated data');
    
    // Set up event listeners for global filters
    setupGlobalFilterListeners();
    
    // Load the initial dashboard state
    loadDashboardState();
}

// Set up event listeners for global filters
function setupGlobalFilterListeners() {
    // Get all global filter elements
    const globalFilters = document.querySelectorAll('.global-filters .filter-select');
    
    // Add change event listeners to all global filters
    globalFilters.forEach(filter => {
        filter.addEventListener('change', function() {
            // Update all visualizations when global filters change
            loadDashboardState();
        });
    });
    
    // Set up tab navigation with data integration
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            const tabContents = document.querySelectorAll('.tab-content');
            tabContents.forEach(content => {
                content.style.display = 'none';
            });
            
            // Show the corresponding tab content
            const tabId = this.getAttribute('data-tab');
            const tabContent = document.getElementById(tabId + '-tab');
            if (tabContent) {
                tabContent.style.display = 'block';
                
                // Load the appropriate data and visualizations
                loadTabData(tabId);
            }
        });
    });
}

// Load the dashboard state based on current filters and active tab
function loadDashboardState() {
    // Get the current active tab
    const activeTab = document.querySelector('.nav-tab.active');
    const tabId = activeTab.getAttribute('data-tab');
    
    // Load data for the active tab
    loadTabData(tabId);
}

// Load data for a specific tab
function loadTabData(tabId) {
    // Get current filter values
    const filters = getGlobalFilterValues();
    
    // Show loading state
    showLoadingState(tabId);
    
    // Simulate data loading delay (would be replaced with actual data fetching)
    setTimeout(() => {
        switch(tabId) {
            case 'market-momentum':
                loadMarketMomentumData(filters);
                break;
            case 'risk-displacement':
                loadRiskDisplacementData(filters);
                break;
            case 'value-chain':
                loadValueChainData(filters);
                break;
            case 'market-structure':
                loadMarketStructureData(filters);
                break;
            case 'investment-opportunity':
                loadInvestmentOpportunityData(filters);
                break;
        }
        
        // Update insights based on the active tab and filters
        updateInsightsForTab(tabId, filters);
    }, 800);
}

// Show loading state for a tab
function showLoadingState(tabId) {
    // Get the main chart container for the tab
    const chartContainer = document.getElementById(tabId + '-chart');
    if (chartContainer) {
        chartContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    }
    
    // Clear any secondary elements
    const secondaryContainers = document.querySelectorAll(`#${tabId}-tab .secondary-element > div`);
    secondaryContainers.forEach(container => {
        container.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
    });
}

// Get values from all global filters
function getGlobalFilterValues() {
    return {
        dateRange: document.getElementById('date-range-filter').value,
        geography: document.getElementById('geography-filter').value,
        lineOfBusiness: document.getElementById('lob-filter').value
    };
}

// Load Market Momentum data and render visualizations
function loadMarketMomentumData(globalFilters) {
    // Get component-specific filters
    const viewType = document.querySelector('.toggle-option.active').getAttribute('data-view');
    const timeGranularity = document.getElementById('time-granularity').value;
    const comparisonType = document.getElementById('comparison-type').value;
    
    // Combine global and component-specific filters
    const filters = {
        ...globalFilters,
        viewType,
        timeGranularity,
        comparisonType
    };
    
    // Generate data using the mock data generator
    const data = generateMarketMomentumData(filters);
    
    // Render the main chart
    renderMarketMomentumChart(data, filters);
    
    // Render secondary elements
    renderStateHeatmap();
    renderLineTrends();
    renderYoYComparison();
}

// Load Risk Displacement data and render visualizations
function loadRiskDisplacementData(globalFilters) {
    // Generate data using the mock data generator
    const data = generateRiskDisplacementData(globalFilters);
    
    // Render the main chart
    renderRiskDisplacementChart(data, globalFilters);
    
    // Render secondary elements
    renderLineComparison();
    renderRiskCorrelation();
    renderRegulatoryTimeline();
}

// Load Value Chain data and render visualizations
function loadValueChainData(globalFilters) {
    // Generate data using the mock data generator
    const data = generateValueChainData(globalFilters);
    
    // Create a placeholder for now
    const chartContainer = document.getElementById('value-chain-chart');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 400px; flex-direction: column;">
                <h3>Value Chain Opportunity Identifier</h3>
                <p>This component will compare E&S vs. admitted markets across value chain metrics.</p>
                <p>Data is ready for integration in future development phases.</p>
            </div>
        `;
    }
}

// Load Market Structure data and render visualizations
function loadMarketStructureData(globalFilters) {
    // Generate data using the mock data generator
    const data = generateMarketStructureData(globalFilters);
    
    // Create a placeholder for now
    const chartContainer = document.getElementById('market-structure-chart');
    if (chartContainer) {
        chartContainer.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 400px; flex-direction: column;">
                <h3>Market Structure Analyzer</h3>
                <p>This component will visualize relationships between market participants.</p>
                <p>Data is ready for integration in future development phases.</p>
            </div>
        `;
    }
}

// Load Investment Opportunity data and render visualizations
function loadInvestmentOpportunityData(globalFilters) {
    try {
        // Get component-specific filters
        const categoryFilter = document.getElementById('opportunity-category-filter');
        const segmentFilter = document.getElementById('market-segment-filter');
        
        // Create filters object
        const filters = {
            ...globalFilters,
            category: categoryFilter ? categoryFilter.value : 'all',
            marketSegment: segmentFilter ? segmentFilter.value : 'all'
        };
        
        // Generate data using the mock data generator
        const data = generateInvestmentOpportunityData(filters);
        
        // Initialize the visualization if available
        if (typeof initInvestmentOpportunities === 'function') {
            // Clear any previous visualization first
            const container = document.getElementById('investment-opportunities-container');
            if (container) {
                container.innerHTML = '';
            }
            
            // Start fresh initialization
            initInvestmentOpportunities();
        } else {
            // Fallback if initInvestmentOpportunities not defined
            const chartContainer = document.getElementById('investment-opportunities-container');
            if (chartContainer) {
                chartContainer.innerHTML = `
                    <div style="display: flex; justify-content: center; align-items: center; height: 400px; flex-direction: column;">
                        <h3>Investment Opportunity Scorecard</h3>
                        <p>This component will map investment opportunities based on market analysis.</p>
                        <p>Data is ready for integration in future development phases.</p>
                    </div>
                `;
            }
        }
    } catch (error) {
        console.error('Error loading investment opportunity data:', error);
        // Display error message
        const container = document.getElementById('investment-opportunities-container');
        if (container) {
            container.innerHTML = `
                <div class="error-message">
                    <h3>Error Loading Data</h3>
                    <p>Could not load investment opportunities data. Please check the console for details.</p>
                </div>
            `;
        }
    }
}

// Update insights based on the active tab and filters
function updateInsightsForTab(tabId, filters) {
    const insightContent = document.querySelector('.insight-content');
    
    if (tabId === 'market-momentum') {
        if (filters.lineOfBusiness === 'auto') {
            insightContent.innerHTML = `
                <p>Auto liability shows exceptional growth at 61.1% in 2024, the highest among all E&S segments.</p>
                <p>In California specifically, commercial auto premiums surged 162% year-over-year, indicating significant admitted market displacement.</p>
                <p>This trend suggests opportunities for technology solutions focused on auto risk assessment and pricing in the E&S market.</p>
            `;
        } else if (filters.lineOfBusiness === 'property') {
            insightContent.innerHTML = `
                <p>Personal property grew 31.8% in 2024, the second highest growth rate among E&S segments.</p>
                <p>Texas (63.3% increase) and California (60.9% increase) show the highest growth in personal property transactions.</p>
                <p>The correlation with catastrophe-prone regions suggests admitted market retreat from climate-related risks.</p>
            `;
        } else if (filters.lineOfBusiness === 'liability') {
            insightContent.innerHTML = `
                <p>Commercial liability remains the largest E&S segment at approximately $30.2 billion in premium (35% of total).</p>
                <p>Growth has moderated to 11% in 2024, down from higher rates in previous years.</p>
                <p>This segment represents a mature but substantial opportunity for technology solutions.</p>
            `;
        } else {
            insightContent.innerHTML = `
                <p>The E&S market continues to show strong growth at 12.1% in 2024, though the rate has moderated from 24% in 2022 and 14.6% in 2023.</p>
                <p>Auto liability (61.1% growth) and personal property (31.8% growth) are the fastest growing segments, indicating significant displacement from the admitted market.</p>
                <p>California and Texas show the highest growth in personal property transactions, suggesting regional regulatory and catastrophe factors are driving market shifts.</p>
            `;
        }
    } else if (tabId === 'risk-displacement') {
        insightContent.innerHTML = `
            <p>The flow of premium from admitted to E&S markets is most pronounced in auto liability, with a 61.1% growth rate.</p>
            <p>Personal property shows the second highest displacement rate at 31.8%, concentrated in catastrophe-prone regions.</p>
            <p>Commercial liability and property, while growing more moderately at 11%, represent the largest volume of displaced premium at approximately $30.2 billion and $26.9 billion respectively.</p>
        `;
    } else if (tabId === 'value-chain') {
        insightContent.innerHTML = `
            <p>The E&S market shows significant efficiency gaps compared to the admitted market across the insurance value chain.</p>
            <p>Underwriting efficiency and distribution costs show the largest gaps, representing prime opportunities for technology solutions.</p>
            <p>Auto liability underwriting in the E&S market shows particularly low efficiency scores, suggesting technology investment opportunities.</p>
        `;
    } else if (tabId === 'market-structure') {
        insightContent.innerHTML = `
            <p>The E&S market structure is characterized by a concentration of premium among key carriers like Lexington, Scottsdale, and Lloyd's.</p>
            <p>Wholesale brokers and MGAs play a critical role in the distribution chain, with significant premium flow through entities like AmWINS, RPS, and CRC Group.</p>
            <p>Reinsurance relationships are essential to the market structure, with Munich Re, Swiss Re, and Hannover Re providing critical capacity.</p>
        `;
    } else if (tabId === 'investment-opportunity') {
        insightContent.innerHTML = `
            <p>Auto Liability Risk Assessment technology represents the highest priority investment opportunity, combining high growth potential (61.1%) with low current technology penetration.</p>
            <p>Digital Wholesale Platforms rank second in priority, addressing inefficiencies in the multi-layered E&S distribution chain.</p>
            <p>Catastrophe Risk Modeling technology ranks third, driven by the increasing frequency and severity of weather events and the growth in property E&S premium.</p>
        `;
    }
}
// Mock data generator for the E&S Market Opportunity Analyzer
// This file contains functions to generate mock data for all dashboard components

// Generate mock data for all visualizations
function generateMockData() {
    return {
        marketMomentum: generateMarketMomentumData(),
        riskDisplacement: generateRiskDisplacementData(),
        valueChain: generateValueChainData(),
        marketStructure: generateMarketStructureData(),
        investmentOpportunity: generateInvestmentOpportunityData()
    };
}

// Generate mock data for Market Momentum Visualizer
function generateMarketMomentumData(filters = {}) {
    // Default filters if not provided
    const defaultFilters = {
        dateRange: '5y',
        geography: 'national',
        lineOfBusiness: 'all',
        viewType: 'volume',
        timeGranularity: 'quarterly',
        comparisonType: 'admitted-es'
    };
    
    // Merge provided filters with defaults
    filters = { ...defaultFilters, ...filters };
    
    const quarters = [];
    const esData = [];
    const admittedData = [];
    
    // Generate data for the last 5 years (20 quarters)
    const currentYear = 2025;
    const currentQuarter = 1;
    
    let numDataPoints = 20; // Default to 5 years of quarterly data
    
    if (filters.dateRange === '1y') {
        numDataPoints = 4; // 1 year of quarterly data
    } else if (filters.dateRange === '3y') {
        numDataPoints = 12; // 3 years of quarterly data
    } else if (filters.dateRange === 'all') {
        numDataPoints = 28; // 7 years of quarterly data
    }
    
    if (filters.timeGranularity === 'annual') {
        numDataPoints = Math.ceil(numDataPoints / 4); // Convert quarters to years
    }
    
    for (let i = 0; i < numDataPoints; i++) {
        let year, quarter, label;
        
        if (filters.timeGranularity === 'quarterly') {
            quarter = currentQuarter - (i % 4);
            if (quarter <= 0) quarter += 4;
            
            year = currentYear - Math.floor(i / 4) - (currentQuarter - quarter < 0 ? 1 : 0);
            label = `Q${quarter} ${year}`;
        } else {
            year = currentYear - i;
            label = `${year}`;
        }
        
        quarters.unshift(label);
        
        // Generate E&S market data with strong growth
        // Based on the actual data: 2022: 24%, 2023: 14.6%, 2024: 12.1%
        let esValue;
        let admittedValue;
        
        if (filters.viewType === 'volume') {
            // Premium volume in billions
            if (year === 2025) {
                esValue = 85 + (Math.random() * 5); // Projected 2025
                admittedValue = 650 + (Math.random() * 20);
            } else if (year === 2024) {
                esValue = 81 + (Math.random() * 2); // 2024 data
                admittedValue = 640 + (Math.random() * 15);
            } else if (year === 2023) {
                esValue = 72.7 + (Math.random() * 2); // 2023 data
                admittedValue = 630 + (Math.random() * 15);
            } else if (year === 2022) {
                esValue = 63 + (Math.random() * 2); // 2022 data
                admittedValue = 620 + (Math.random() * 15);
            } else if (year === 2021) {
                esValue = 51 + (Math.random() * 2); // 2021 data (estimated)
                admittedValue = 610 + (Math.random() * 15);
            } else if (year === 2020) {
                esValue = 45 + (Math.random() * 2); // 2020 data (estimated)
                admittedValue = 600 + (Math.random() * 15);
            } else {
                esValue = 40 + (Math.random() * 2); // 2019 data (estimated)
                admittedValue = 590 + (Math.random() * 15);
            }
            
            // Adjust for quarterly data if needed
            if (filters.timeGranularity === 'quarterly') {
                esValue = esValue / 4 * (1 + (quarter - 2.5) / 10); // Slight seasonal variation
                admittedValue = admittedValue / 4 * (1 + (quarter - 2.5) / 15);
            }
            
            // Adjust for line of business if specific one is selected
            if (filters.lineOfBusiness === 'auto') {
                esValue = esValue * 0.2 * 1.61; // Auto liability with 61% growth
                admittedValue = admittedValue * 0.15;
            } else if (filters.lineOfBusiness === 'property') {
                esValue = esValue * 0.35 * 1.11; // Property with 11% growth
                admittedValue = admittedValue * 0.4;
            } else if (filters.lineOfBusiness === 'liability') {
                esValue = esValue * 0.35 * 1.11; // Liability with 11% growth
                admittedValue = admittedValue * 0.35;
            } else if (filters.lineOfBusiness === 'professional') {
                esValue = esValue * 0.1 * 1.05; // Professional with 5% growth (estimated)
                admittedValue = admittedValue * 0.1;
            }
        } else {
            // Growth percentage
            if (year === 2025) {
                esValue = 10 + (Math.random() * 4); // Projected 2025
                admittedValue = 2 + (Math.random() * 2);
            } else if (year === 2024) {
                esValue = 12.1 + (Math.random() * 1); // 2024 data
                admittedValue = 1.5 + (Math.random() * 1);
            } else if (year === 2023) {
                esValue = 14.6 + (Math.random() * 1); // 2023 data
                admittedValue = 1.8 + (Math.random() * 1);
            } else if (year === 2022) {
                esValue = 24 + (Math.random() * 1); // 2022 data
                admittedValue = 2 + (Math.random() * 1);
            } else if (year === 2021) {
                esValue = 15 + (Math.random() * 3); // 2021 data (estimated)
                admittedValue = 3 + (Math.random() * 1);
            } else if (year === 2020) {
                esValue = 12 + (Math.random() * 3); // 2020 data (estimated)
                admittedValue = 1 + (Math.random() * 2);
            } else {
                esValue = 8 + (Math.random() * 3); // 2019 data (estimated)
                admittedValue = 2 + (Math.random() * 2);
            }
            
            // Adjust for line of business if specific one is selected
            if (filters.lineOfBusiness === 'auto') {
                esValue = esValue * 2.5; // Auto liability with much higher growth
                admittedValue = admittedValue * 0.5;
            } else if (filters.lineOfBusiness === 'property') {
                esValue = esValue * 1.2; // Property with higher growth
                admittedValue = admittedValue * 0.8;
            } else if (filters.lineOfBusiness === 'liability') {
                esValue = esValue * 1.0; // Liability with average growth
                admittedValue = admittedValue * 1.0;
            } else if (filters.lineOfBusiness === 'professional') {
                esValue = esValue * 0.8; // Professional with lower growth
                admittedValue = admittedValue * 1.2;
            }
        }
        
        esData.unshift(esValue);
        admittedData.unshift(admittedValue);
    }
    
    return {
        labels: quarters,
        datasets: [
            {
                name: 'E&S Market',
                values: esData,
                color: '#FF9800' // Secondary color (orange)
            },
            {
                name: 'Admitted Market',
                values: admittedData,
                color: '#1A73E8' // Primary color (blue)
            }
        ]
    };
}

// Generate mock data for Risk Displacement Tracker
function generateRiskDisplacementData(filters = {}) {
    // Default filters if not provided
    const defaultFilters = {
        dateRange: '5y',
        geography: 'national',
        lineOfBusiness: 'all'
    };
    
    // Merge provided filters with defaults
    filters = { ...defaultFilters, ...filters };
    
    // Define the nodes (market segments)
    const nodes = [
        { id: 'admitted_auto', name: 'Admitted Auto', group: 'admitted' },
        { id: 'admitted_property', name: 'Admitted Property', group: 'admitted' },
        { id: 'admitted_liability', name: 'Admitted Liability', group: 'admitted' },
        { id: 'admitted_professional', name: 'Admitted Professional', group: 'admitted' },
        { id: 'es_auto', name: 'E&S Auto', group: 'es' },
        { id: 'es_property', name: 'E&S Property', group: 'es' },
        { id: 'es_liability', name: 'E&S Liability', group: 'es' },
        { id: 'es_professional', name: 'E&S Professional', group: 'es' }
    ];
    
    // Define the links (premium flow)
    const links = [
        { source: 'admitted_auto', target: 'es_auto', value: 15, rate: 0.61 }, // 61% growth
        { source: 'admitted_property', target: 'es_property', value: 10, rate: 0.32 }, // 32% growth
        { source: 'admitted_liability', target: 'es_liability', value: 8, rate: 0.11 }, // 11% growth
        { source: 'admitted_professional', target: 'es_professional', value: 3, rate: 0.05 } // 5% growth
    ];
    
    // Adjust values based on filters
    if (filters.lineOfBusiness !== 'all') {
        links.forEach(link => {
            if (!link.source.includes(filters.lineOfBusiness) && !link.target.includes(filters.lineOfBusiness)) {
                link.value = 0;
            } else {
                link.value *= 2; // Emphasize the selected line of business
            }
        });
    }
    
    if (filters.geography !== 'national') {
        // Adjust values based on geography
        if (filters.geography === 'west') {
            // California and Texas have higher personal property growth
            links.find(l => l.source === 'admitted_property' && l.target === 'es_property').value *= 1.5;
            links.find(l => l.source === 'admitted_property' && l.target === 'es_property').rate = 0.6;
        } else if (filters.geography === 'south') {
            // South has higher auto liability growth
            links.find(l => l.source === 'admitted_auto' && l.target === 'es_auto').value *= 1.3;
        }
    }
    
    return {
        nodes: nodes,
        links: links
    };
}

// Generate mock data for Value Chain Opportunity Identifier
function generateValueChainData(filters = {}) {
    // Default filters if not provided
    const defaultFilters = {
        lineOfBusiness: 'all'
    };
    
    // Merge provided filters with defaults
    filters = { ...defaultFilters, ...filters };
    
    // Define the value chain components
    const components = [
        'Underwriting Efficiency',
        'Claims Processing',
        'Distribution Costs',
        'Policy Servicing',
        'Risk Selection'
    ];
    
    // Generate values for E&S and Admitted markets
    // Lower values indicate less efficiency (more opportunity)
    let esValues = [0.4, 0.5, 0.3, 0.6, 0.5]; // Base values for E&S
    let admittedValues = [0.8, 0.7, 0.7, 0.8, 0.9]; // Base values for Admitted
    
    // Adjust based on line of business
    if (filters.lineOfBusiness === 'auto') {
        // Auto has significant inefficiencies in underwriting and risk selection in E&S
        esValues = [0.3, 0.5, 0.4, 0.6, 0.3];
    } else if (filters.lineOfBusiness === 'property') {
        // Property has inefficiencies in claims processing in E&S
        esValues = [0.5, 0.3, 0.4, 0.6, 0.5];
    } else if (filters.lineOfBusiness === 'liability') {
        // Liability has inefficiencies in distribution in E&S
        esValues = [0.5, 0.5, 0.2, 0.6, 0.5];
    }
    
    return {
        components: components,
        datasets: [
            {
                name: 'E&S Market',
                values: esValues,
                color: '#FF9800' // Secondary color (orange)
            },
            {
                name: 'Admitted Market',
                values: admittedValues,
                color: '#1A73E8' // Primary color (blue)
            }
        ]
    };
}

// Generate mock data for Market Structure Analyzer
function generateMarketStructureData(filters = {}) {
    // Default filters if not provided
    const defaultFilters = {
        lineOfBusiness: 'all'
    };
    
    // Merge provided filters with defaults
    filters = { ...defaultFilters, ...filters };
    
    // Define the nodes (market participants)
    const nodes = [
        // Carriers
        { id: 'carrier1', name: 'Lexington Insurance', type: 'carrier', premium: 12.5 },
        { id: 'carrier2', name: 'Scottsdale Insurance', type: 'carrier', premium: 10.2 },
        { id: 'carrier3', name: 'Lloyd\'s of London', type: 'carrier', premium: 9.8 },
        { id: 'carrier4', name: 'Nationwide E&S', type: 'carrier', premium: 7.5 },
        { id: 'carrier5', name: 'Chubb E&S', type: 'carrier', premium: 6.9 },
        
        // MGAs
        { id: 'mga1', name: 'AmWINS', type: 'mga', premium: 5.2 },
        { id: 'mga2', name: 'Risk Placement Services', type: 'mga', premium: 4.8 },
        { id: 'mga3', name: 'CRC Group', type: 'mga', premium: 4.5 },
        { id: 'mga4', name: 'RT Specialty', type: 'mga', premium: 4.2 },
        
        // Brokers
        { id: 'broker1', name: 'Marsh', type: 'broker', premium: 3.8 },
        { id: 'broker2', name: 'Aon', type: 'broker', premium: 3.5 },
        { id: 'broker3', name: 'Willis Towers Watson', type: 'broker', premium: 3.2 },
        
        // Reinsurers
        { id: 'reinsurer1', name: 'Munich Re', type: 'reinsurer', premium: 2.8 },
        { id: 'reinsurer2', name: 'Swiss Re', type: 'reinsurer', premium: 2.5 },
        { id: 'reinsurer3', name: 'Hannover Re', type: 'reinsurer', premium: 2.2 }
    ];
    
    // Define the links (business relationships)
    const links = [
        // Carrier to MGA relationships
        { source: 'carrier1', target: 'mga1', value: 2.5, type: 'capacity' },
        { source: 'carrier1', target: 'mga2', value: 1.8, type: 'capacity' },
        { source: 'carrier2', target: 'mga1', value: 2.2, type: 'capacity' },
        { source: 'carrier2', target: 'mga3', value: 1.5, type: 'capacity' },
        { source: 'carrier3', target: 'mga2', value: 2.0, type: 'capacity' },
        { source: 'carrier3', target: 'mga4', value: 1.7, type: 'capacity' },
        { source: 'carrier4', target: 'mga3', value: 1.6, type: 'capacity' },
        { source: 'carrier5', target: 'mga4', value: 1.4, type: 'capacity' },
        
        // MGA to Broker relationships
        { source: 'mga1', target: 'broker1', value: 1.2, type: 'distribution' },
        { source: 'mga1', target: 'broker2', value: 1.0, type: 'distribution' },
        { source: 'mga2', target: 'broker1', value: 1.1, type: 'distribution' },
        { source: 'mga2', target: 'broker3', value: 0.9, type: 'distribution' },
        { source: 'mga3', target: 'broker2', value: 1.0, type: 'distribution' },
        { source: 'mga4', target: 'broker3', value: 0.8, type: 'distribution' },
        
        // Carrier to Reinsurer relationships
        { source: 'carrier1', target: 'reinsurer1', value: 1.5, type: 'reinsurance' },
        { source: 'carrier2', target: 'reinsurer1', value: 1.3, type: 'reinsurance' },
        { source: 'carrier3', target: 'reinsurer2', value: 1.4, type: 'reinsurance' },
        { source: 'carrier4', target: 'reinsurer2', value: 1.2, type: 'reinsurance' },
        { source: 'carrier5', target: 'reinsurer3', value: 1.1, type: 'reinsurance' }
    ];
    
    // Filter nodes and links based on line of business
    if (filters.lineOfBusiness !== 'all') {
        // This would be more sophisticated in a real implementation
        // For now, we'll just reduce the dataset size
        nodes.forEach(node => {
            if (node.type === 'carrier' || node.type === 'mga') {
                node.premium *= 0.5;
            }
        });
        
        links.forEach(link => {
            link.value *= 0.5;
        });
    }
    
    return {
        nodes: nodes,
        links: links
    };
}

// Generate mock data for Investment Opportunity Scorecard
function generateInvestmentOpportunityData(filters = {}) {
    // Default filters if not provided
    const defaultFilters = {
        lineOfBusiness: 'all'
    };
    
    // Merge provided filters with defaults
    filters = { ...defaultFilters, ...filters };
    
    // Define the investment opportunities
    const opportunities = [
        {
            id: 'auto_risk_assessment',
            name: 'Auto Liability Risk Assessment',
            category: 'Underwriting Technology',
            growthPotential: 0.85, // X-axis: Market growth potential (0-1)
            techPenetration: 0.35, // Y-axis: Technology penetration (0-1, lower is better opportunity)
            marketSize: 12.5, // Bubble size: Market size in billions
            competitiveIntensity: 0.4, // Color: Competitive intensity (0-1, lower is better opportunity)
            implementationComplexity: 'Medium',
            roiPotential: 'High',
            priority: 1
        },
        {
            id: 'digital_wholesale',
            name: 'Digital Wholesale Platforms',
            category: 'Distribution Technology',
            growthPotential: 0.75,
            techPenetration: 0.45,
            marketSize: 15.0,
            competitiveIntensity: 0.5,
            implementationComplexity: 'High',
            roiPotential: 'High',
            priority: 2
        },
        {
            id: 'cat_modeling',
            name: 'Catastrophe Risk Modeling',
            category: 'Underwriting Technology',
            growthPotential: 0.70,
            techPenetration: 0.50,
            marketSize: 10.0,
            competitiveIntensity: 0.6,
            implementationComplexity: 'High',
            roiPotential: 'High',
            priority: 3
        },
        {
            id: 'personal_lines',
            name: 'Personal Lines E&S Automation',
            category: 'Underwriting Technology',
            growthPotential: 0.90,
            techPenetration: 0.25,
            marketSize: 4.0,
            competitiveIntensity: 0.3,
            implementationComplexity: 'Medium',
            roiPotential: 'Medium',
            priority: 4
        },
        {
            id: 'submission_mgmt',
            name: 'Submission Management Automation',
            category: 'Distribution Technology',
            growthPotential: 0.65,
            techPenetration: 0.55,
            marketSize: 8.0,
            competitiveIntensity: 0.5,
            implementationComplexity: 'Medium',
            roiPotential: 'Medium',
            priority: 5
        },
        {
            id: 'claims_analytics',
            name: 'Claims Analytics Platforms',
            category: 'Claims Technology',
            growthPotential: 0.60,
            techPenetration: 0.60,
            marketSize: 6.0,
            competitiveIntensity: 0.7,
            implementationComplexity: 'High',
            roiPotential: 'Medium',
            priority: 6
        },
        {
            id: 'fraud_detection',
            name: 'Fraud Detection Systems',
            category: 'Claims Technology',
            growthPotential: 0.50,
            techPenetration: 0.65,
            marketSize: 5.0,
            competitiveIntensity: 0.8,
            implementationComplexity: 'High',
            roiPotential: 'Medium',
            priority: 7
        }
    ];
    
    // Filter opportunities based on line of business
    let filteredOpportunities = [...opportunities];
    
    if (filters.lineOfBusiness === 'auto') {
        filteredOpportunities = opportunities.filter(o => 
            o.id === 'auto_risk_assessment' || 
            o.id === 'digital_wholesale' || 
            o.id === 'submission_mgmt'
        );
    } else if (filters.lineOfBusiness === 'property') {
        filteredOpportunities = opportunities.filter(o => 
            o.id === 'cat_modeling' || 
            o.id === 'personal_lines' || 
            o.id === 'digital_wholesale'
        );
    } else if (filters.lineOfBusiness === 'liability') {
        filteredOpportunities = opportunities.filter(o => 
            o.id === 'submission_mgmt' || 
            o.id === 'claims_analytics' || 
            o.id === 'fraud_detection'
        );
    }
    
    return {
        opportunities: filteredOpportunities
    };
}

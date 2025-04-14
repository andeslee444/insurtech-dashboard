// Main JavaScript file for E&S Market Opportunity Analyzer
// Enhanced with Apple-inspired dark theme

// Global variables
let marketData;
let structureData;

// Initialize the dashboard
async function initDashboard() {
    try {
        // Load real data from JSON files
        const marketResponse = await fetch('data/market_growth_data.json');
        marketData = await marketResponse.json();
        
        const structureResponse = await fetch('data/market_structure_data.json');
        structureData = await structureResponse.json();
        
        // Update dashboard overview with latest data
        updateDashboardOverview();
        
        // Initialize components
        // Note: Individual component initialization is handled in their respective JS files
        
        // Add smooth scrolling for navigation
        setupNavigation();
        
        // Add active class to current section in navigation
        setupScrollSpy();
        
        // Add animations for sections
        setupAnimations();
        
        console.log('Dashboard initialized successfully with real data');
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        document.getElementById('dashboard-overview').innerHTML += 
            '<p class="error">Error loading market data. Some features may not be available.</p>';
    }
}

// Update dashboard overview with latest data
function updateDashboardOverview() {
    // Update key metrics with real data
    const metrics = document.querySelectorAll('.key-metrics .metric');
    
    if (marketData) {
        // Market size
        if (marketData.market_size && marketData.market_size['2024']) {
            metrics[0].querySelector('h3').textContent = 
                `$${(marketData.market_size['2024'] / 1e9).toFixed(1)}B`;
        }
        
        // Growth rate
        if (marketData.growth_rates && marketData.growth_rates['2024']) {
            metrics[1].querySelector('h3').textContent = 
                `${marketData.growth_rates['2024']}%`;
        }
        
        // Market share
        if (marketData.market_share && marketData.market_share['2023']) {
            metrics[2].querySelector('h3').textContent = 
                `${marketData.market_share['2023']}%`;
        }
        
        // Projected CAGR
        if (marketData.projections && marketData.projections['2027'] && marketData.projections['2027'].cagr) {
            metrics[3].querySelector('h3').textContent = 
                `${marketData.projections['2027'].cagr}%`;
        }
    }
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

# E&S Market Opportunity Analyzer Dashboard

**Live Dashboard:** [https://andeslee444.github.io/insurtech-dashboard/](https://andeslee444.github.io/insurtech-dashboard/)

## Overview

The E&S Market Opportunity Analyzer is a web-based dashboard designed to help venture capital investors identify technological investment opportunities within the Excess & Surplus (E&S) insurance market. It aims to transform complex E&S insurance market data into clear investment signals by providing insights through interactive data visualizations and market analysis based on data from various industry sources.

This repository contains the frontend source code for the current version of the dashboard, implemented as a static web application and hosted via GitHub Pages.

## Key Components

The dashboard features several interactive components designed to provide a holistic view:

1.  **Market Momentum Visualizer:** Tracks E&S premium growth compared to the admitted market over time, highlighting high-growth segments and geographic patterns.
2.  **Risk Displacement Tracker:** Visualizes the flow of premium from admitted to E&S markets using a Sankey diagram, identifying segments experiencing significant market shifts.
3.  **Technology Adoption Metrics:** Shows technology adoption levels across different segments and value chain components (derived from underlying data analysis).
4.  **InsurTech Startup Landscape:** Displays information about relevant InsurTech startups active in the E&S space.
5.  **Investment Opportunity Scorecard:** (Placeholder for future implementation) Intended to map investment opportunities based on market growth potential, technology penetration, market size, and competitive intensity.

_(Note: Some components mentioned in planning documents, like Value Chain Opportunity Identifier and Market Structure Analyzer using specific chart types like Radar or Force-Directed Graphs, may be represented differently or integrated into other components in this current static implementation.)_

## Viewing the Dashboard

The live dashboard can be accessed directly via the GitHub Pages link:
[https://andeslee444.github.io/insurtech-dashboard/](https://andeslee444.github.io/insurtech-dashboard/)

No installation is required.

## Running Locally

To run the dashboard on your local machine:

1.  Clone this repository:
    ```bash
    git clone https://github.com/andeslee444/insurtech-dashboard.git
    ```
2.  Navigate to the cloned directory:
    ```bash
    cd insurtech-dashboard
    ```
3.  Serve the files using a simple local web server. For example, if you have Python 3:
    ```bash
    python -m http.server
    ```
    Or using Node.js `http-server`:
    ```bash
    npx http-server .
    ```
4.  Open your web browser and navigate to the local address provided by the server (e.g., `http://localhost:8000` or `http://127.0.0.1:8080`).

## Technology Stack (Current Implementation)

*   HTML5
*   CSS3
*   JavaScript (ES6+)
*   D3.js (v7) for visualizations

_(The development masterplan envisions a future iteration potentially using React.js, TypeScript, Node.js, etc.)_

## Data

This dashboard utilizes static data files (`.json`) located in the `/data` directory and mock data definitions within `/js/mockData.js`. 

The underlying data originates from various public sources as outlined in project documentation (including regulatory filings like NAIC/State Dept reports, industry reports from WSIA/AM Best, catastrophe data from NOAA, economic indicators from FRED, etc.). This data was processed offline to generate the static files used in this version of the dashboard.

## Project Structure

*   `index.html`: The main HTML file for the dashboard structure.
*   `css/`: Contains stylesheets (`styles.css`).
*   `js/`: Contains JavaScript files for interactivity, data handling, and visualization logic (e.g., `main.js`, `marketMomentum.js`, `dataIntegration.js`, `mockData.js`).
*   `data/`: Contains static JSON data files used by the visualizations. 
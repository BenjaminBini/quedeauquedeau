// Global state
let allActions = [];
let filteredActions = [];
let currentPage = 1;
let itemsPerPage = 25;

// Category mappings
const categories = {
    'democratic_norms': 'Violating Democratic Norms Undermining Rule of Law',
    'hollowing_state': 'Hollowing State / Weakening Federal Institutions',
    'suppressing_dissent': 'Suppressing Dissent / Weaponising State Against \'Enemies\'',
    'controlling_info': 'Controlling Information Including Spreading Misinformation and Propaganda',
    'science_health': 'Control of Science & Health to Align with State Ideology',
    'attacking_culture': 'Attacking Universities Schools Museums Culture',
    'civil_rights': 'Weakening Civil Rights',
    'corruption': 'Corruption & Enrichment',
    'foreign_policy': 'Aggressive Foreign Policy & Global Destabilisation',
    'anti_immigrant': 'Anti-immigrant or Militarised Nationalism'
};

const categoryShortNames = {
    'Violating Democratic Norms Undermining Rule of Law': 'Democratic Norms',
    'Hollowing State / Weakening Federal Institutions': 'Weakening Institutions',
    'Suppressing Dissent / Weaponising State Against \'Enemies\'': 'Suppressing Dissent',
    'Controlling Information Including Spreading Misinformation and Propaganda': 'Controlling Information',
    'Control of Science & Health to Align with State Ideology': 'Science & Health Control',
    'Attacking Universities Schools Museums Culture': 'Attacking Culture',
    'Weakening Civil Rights': 'Civil Rights',
    'Corruption & Enrichment': 'Corruption',
    'Aggressive Foreign Policy & Global Destabilisation': 'Foreign Policy',
    'Anti-immigrant or Militarised Nationalism': 'Anti-Immigrant'
};

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    loadCSVData();
    setupNavigation();
});

// Load and parse CSV data
async function loadCSVData() {
    try {
        const response = await fetch('trumpactions.csv');
        const csvText = await response.text();
        allActions = parseCSV(csvText);
        filteredActions = [...allActions];

        // Initialize all views
        renderDashboard();
        renderTimeline();
        renderBrowse();
        renderCategories();

        // Populate filter dropdowns
        populateFilterDropdowns();

        // Set last update date
        if (allActions.length > 0) {
            const latestDate = allActions[0].date;
            document.getElementById('last-update').textContent = latestDate;
        }
    } catch (error) {
        console.error('Error loading CSV:', error);
        document.querySelector('main').innerHTML = '<div class="loading">Error loading data. Please refresh the page.</div>';
    }
}

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',');

    const actions = [];
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const values = parseCSVLine(line);

        if (values.length < headers.length) continue;

        const action = {
            index: values[0],
            date: values[1],
            title: values[2],
            url: values[3],
            categories: []
        };

        // Parse category flags (columns 4-13)
        const categoryKeys = Object.keys(categories);
        for (let j = 0; j < categoryKeys.length; j++) {
            if (values[4 + j]?.toLowerCase() === 'yes') {
                action.categories.push(categories[categoryKeys[j]]);
            }
        }

        actions.push(action);
    }

    return actions;
}

// Parse a single CSV line (handles commas in quotes)
function parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            values.push(currentValue.trim());
            currentValue = '';
        } else {
            currentValue += char;
        }
    }

    values.push(currentValue.trim());
    return values;
}

// Setup navigation
function setupNavigation() {
    const navButtons = document.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);

            // Update active button
            navButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
}

// Switch between views
function switchView(viewName) {
    const views = document.querySelectorAll('.view');
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(viewName).classList.add('active');
}

// Render Dashboard
function renderDashboard() {
    // Total actions
    document.getElementById('total-actions').textContent = allActions.length.toLocaleString();

    // Date range
    if (allActions.length > 0) {
        const dates = allActions.map(a => new Date(a.date)).filter(d => !isNaN(d));
        const earliest = new Date(Math.min(...dates));
        const latest = new Date(Math.max(...dates));
        document.getElementById('date-range').textContent =
            `${formatDate(earliest)} - ${formatDate(latest)}`;
    }

    // Category statistics
    const categoryStats = calculateCategoryStats();
    renderCategoryStats(categoryStats);

    // Most common category
    const mostCommon = Object.entries(categoryStats)
        .sort((a, b) => b[1] - a[1])[0];
    if (mostCommon) {
        document.getElementById('most-common').textContent =
            categoryShortNames[mostCommon[0]] || mostCommon[0];
    }

    // Recent actions
    renderRecentActions();
}

// Calculate category statistics
function calculateCategoryStats() {
    const stats = {};
    Object.values(categories).forEach(cat => {
        stats[cat] = 0;
    });

    allActions.forEach(action => {
        action.categories.forEach(cat => {
            stats[cat]++;
        });
    });

    return stats;
}

// Render category statistics
function renderCategoryStats(stats) {
    const container = document.getElementById('category-stats');
    const total = allActions.length;

    const sortedStats = Object.entries(stats).sort((a, b) => b[1] - a[1]);

    container.innerHTML = sortedStats.map(([category, count]) => {
        const percentage = ((count / total) * 100).toFixed(1);
        const shortName = categoryShortNames[category] || category;

        return `
            <div class="category-stat">
                <h4>${shortName}</h4>
                <div class="count">${count.toLocaleString()}</div>
                <div class="percentage">${percentage}% of all actions</div>
            </div>
        `;
    }).join('');
}

// Render recent actions
function renderRecentActions() {
    const container = document.getElementById('recent-actions-list');
    const recent = allActions.slice(0, 10);

    container.innerHTML = recent.map(action => createActionCard(action)).join('');
}

// Create an action card HTML
function createActionCard(action) {
    const categoryBadges = action.categories.map(cat => {
        const shortName = categoryShortNames[cat] || cat;
        return `<span class="category-badge active">${shortName}</span>`;
    }).join('');

    return `
        <div class="action-card">
            <div class="action-date">${action.date}</div>
            <div class="action-title">${action.title}</div>
            <a href="${action.url}" target="_blank" class="action-link" rel="noopener noreferrer">
                Read more →
            </a>
            <div class="action-categories">
                ${categoryBadges}
            </div>
        </div>
    `;
}

// Render Timeline
function renderTimeline() {
    const container = document.getElementById('timeline-content');
    const filter = document.getElementById('timeline-filter')?.value || 'all';
    const sort = document.getElementById('timeline-sort')?.value || 'newest';

    let actions = [...allActions];

    // Filter
    if (filter !== 'all') {
        actions = actions.filter(action =>
            action.categories.includes(filter)
        );
    }

    // Sort
    if (sort === 'oldest') {
        actions.reverse();
    }

    container.innerHTML = actions.map(action => `
        <div class="timeline-item">
            ${createActionCard(action)}
        </div>
    `).join('');

    // Setup event listeners
    setupTimelineFilters();
}

// Setup timeline filters
function setupTimelineFilters() {
    const filterSelect = document.getElementById('timeline-filter');
    const sortSelect = document.getElementById('timeline-sort');

    if (filterSelect && !filterSelect.hasAttribute('data-initialized')) {
        filterSelect.setAttribute('data-initialized', 'true');
        filterSelect.addEventListener('change', renderTimeline);
    }

    if (sortSelect && !sortSelect.hasAttribute('data-initialized')) {
        sortSelect.setAttribute('data-initialized', 'true');
        sortSelect.addEventListener('change', renderTimeline);
    }
}

// Render Browse view
function renderBrowse() {
    const searchInput = document.getElementById('search-input');
    const filterSelect = document.getElementById('browse-filter');
    const itemsSelect = document.getElementById('items-per-page');

    // Setup event listeners
    if (searchInput && !searchInput.hasAttribute('data-initialized')) {
        searchInput.setAttribute('data-initialized', 'true');
        searchInput.addEventListener('input', applyBrowseFilters);
    }

    if (filterSelect && !filterSelect.hasAttribute('data-initialized')) {
        filterSelect.setAttribute('data-initialized', 'true');
        filterSelect.addEventListener('change', applyBrowseFilters);
    }

    if (itemsSelect && !itemsSelect.hasAttribute('data-initialized')) {
        itemsSelect.setAttribute('data-initialized', 'true');
        itemsSelect.addEventListener('change', (e) => {
            itemsPerPage = e.target.value === 'all' ? allActions.length : parseInt(e.target.value);
            currentPage = 1;
            renderBrowseContent();
        });
    }

    applyBrowseFilters();
}

// Apply browse filters
function applyBrowseFilters() {
    const searchTerm = document.getElementById('search-input')?.value.toLowerCase() || '';
    const filter = document.getElementById('browse-filter')?.value || 'all';

    filteredActions = allActions.filter(action => {
        const matchesSearch = action.title.toLowerCase().includes(searchTerm);
        const matchesFilter = filter === 'all' || action.categories.includes(filter);
        return matchesSearch && matchesFilter;
    });

    currentPage = 1;
    renderBrowseContent();
}

// Render browse content with pagination
function renderBrowseContent() {
    const container = document.getElementById('browse-content');
    const paginationContainer = document.getElementById('pagination');

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageActions = filteredActions.slice(startIndex, endIndex);

    container.innerHTML = pageActions.map(action => createActionCard(action)).join('');

    // Render pagination
    const totalPages = Math.ceil(filteredActions.length / itemsPerPage);
    renderPagination(paginationContainer, totalPages);
}

// Render pagination controls
function renderPagination(container, totalPages) {
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }

    let html = '<button onclick="goToPage(1)" ' + (currentPage === 1 ? 'disabled' : '') + '>First</button>';
    html += '<button onclick="goToPage(' + (currentPage - 1) + ')" ' + (currentPage === 1 ? 'disabled' : '') + '>Previous</button>';

    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
        html += '<button onclick="goToPage(' + i + ')" ' +
                (i === currentPage ? 'class="active"' : '') + '>' + i + '</button>';
    }

    html += '<button onclick="goToPage(' + (currentPage + 1) + ')" ' + (currentPage === totalPages ? 'disabled' : '') + '>Next</button>';
    html += '<button onclick="goToPage(' + totalPages + ')" ' + (currentPage === totalPages ? 'disabled' : '') + '>Last</button>';
    html += '<div class="page-info">Page ' + currentPage + ' of ' + totalPages + '</div>';

    container.innerHTML = html;
}

// Go to page function (global)
function goToPage(page) {
    currentPage = page;
    renderBrowseContent();
}

// Render Categories view
function renderCategories() {
    const container = document.getElementById('categories-content');
    const categoryStats = calculateCategoryStats();

    const sortedCategories = Object.entries(categoryStats)
        .sort((a, b) => b[1] - a[1]);

    container.innerHTML = sortedCategories.map(([category, count]) => {
        const actions = allActions.filter(action =>
            action.categories.includes(category)
        );

        const shortName = categoryShortNames[category] || category;

        return `
            <div class="category-section">
                <h3>${shortName} (${count} actions)</h3>
                ${actions.slice(0, 5).map(action => createActionCard(action)).join('')}
                ${count > 5 ? `<p class="text-muted">...and ${count - 5} more actions in this category</p>` : ''}
            </div>
        `;
    }).join('');
}

// Populate filter dropdowns
function populateFilterDropdowns() {
    const timelineFilter = document.getElementById('timeline-filter');
    const browseFilter = document.getElementById('browse-filter');

    const options = Object.values(categories).map(cat => {
        const shortName = categoryShortNames[cat] || cat;
        return `<option value="${cat}">${shortName}</option>`;
    }).join('');

    if (timelineFilter) {
        timelineFilter.innerHTML = '<option value="all">All Categories</option>' + options;
    }

    if (browseFilter) {
        browseFilter.innerHTML = '<option value="all">All Categories</option>' + options;
    }
}

// Format date helper
function formatDate(date) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Make goToPage available globally
window.goToPage = goToPage;

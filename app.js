// Global state
let db = null;
let allActions = [];
let filteredActions = [];
let currentPage = 1;
let itemsPerPage = 25;

// Category mappings (for backwards compatibility and filtering)
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

// Theme management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            const currentTheme = document.documentElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// Render hero section with category counts
function renderHero() {
    const container = document.getElementById('hero-categories');
    const categoryStats = getCategoryStats();

    container.innerHTML = categoryStats.map(stat => `
        <div class="hero-category">
            <div class="hero-category-name">${stat.short_name}</div>
            <div class="hero-category-count">${stat.count.toLocaleString()}</div>
        </div>
    `).join('');
}

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupThemeToggle();
    loadDatabase();
    setupNavigation();
});

// Load SQLite database
async function loadDatabase() {
    try {
        // Load sql.js library
        const SQL = await initSqlJs({
            locateFile: file => `https://sql.js.org/dist/${file}`
        });

        // Fetch the database file
        const response = await fetch('trumpactions.db');
        const buffer = await response.arrayBuffer();
        db = new SQL.Database(new Uint8Array(buffer));

        // Load all actions into memory for client-side operations
        loadAllActions();

        // Render hero section
        renderHero();

        // Initialize all views
        renderDashboard();
        renderTimeline();
        renderBrowse();
        renderCategories();

        // Populate filter dropdowns
        populateFilterDropdowns();

        // Set last update date
        const latest = queryOne('SELECT date FROM actions ORDER BY date DESC LIMIT 1');
        if (latest) {
            document.getElementById('last-update').textContent = latest.date;
        }
    } catch (error) {
        console.error('Error loading database:', error);
        document.querySelector('main').innerHTML = '<div class="loading">Error loading database. Please refresh the page.</div>';
    }
}

// Helper function to query database and get single row
function queryOne(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    let result = null;
    if (stmt.step()) {
        const row = stmt.getAsObject();
        result = row;
    }
    stmt.free();
    return result;
}

// Helper function to query database and get all rows
function queryAll(sql, params = []) {
    const stmt = db.prepare(sql);
    stmt.bind(params);
    const results = [];
    while (stmt.step()) {
        results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
}

// Load all actions with their categories
function loadAllActions() {
    const sql = `
        SELECT
            a.id,
            a.index_num,
            a.date,
            a.title,
            a.url,
            GROUP_CONCAT(c.name, '||') as category_names
        FROM actions a
        LEFT JOIN action_categories ac ON a.id = ac.action_id
        LEFT JOIN categories c ON ac.category_id = c.id
        GROUP BY a.id
        ORDER BY a.date DESC
    `;

    const rows = queryAll(sql);

    allActions = rows.map(row => ({
        index: row.index_num,
        date: row.date,
        title: row.title,
        url: row.url,
        categories: row.category_names ? row.category_names.split('||') : []
    }));

    filteredActions = [...allActions];
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
    const total = queryOne('SELECT COUNT(*) as count FROM actions');
    document.getElementById('total-actions').textContent = total.count.toLocaleString();

    // Date range
    const earliest = queryOne('SELECT date FROM actions ORDER BY date ASC LIMIT 1');
    const latest = queryOne('SELECT date FROM actions ORDER BY date DESC LIMIT 1');
    if (earliest && latest) {
        document.getElementById('date-range').textContent =
            `${formatDate(new Date(earliest.date))} - ${formatDate(new Date(latest.date))}`;
    }

    // Category statistics
    const categoryStats = getCategoryStats();
    renderCategoryStats(categoryStats);

    // Most common category
    if (categoryStats.length > 0) {
        const mostCommon = categoryStats[0];
        const shortName = categoryShortNames[mostCommon.name] || mostCommon.name;
        document.getElementById('most-common').textContent = shortName;
    }

    // Recent actions
    renderRecentActions();
}

// Get category statistics from database
function getCategoryStats() {
    const sql = `
        SELECT
            c.name,
            c.short_name,
            COUNT(ac.action_id) as count
        FROM categories c
        LEFT JOIN action_categories ac ON c.id = ac.category_id
        GROUP BY c.id, c.name, c.short_name
        ORDER BY count DESC
    `;

    return queryAll(sql);
}

// Render category statistics
function renderCategoryStats(stats) {
    const container = document.getElementById('category-stats');
    const total = allActions.length;

    container.innerHTML = stats.map(stat => {
        const percentage = ((stat.count / total) * 100).toFixed(1);

        return `
            <div class="category-stat">
                <h4>${stat.short_name}</h4>
                <div class="count">${stat.count.toLocaleString()}</div>
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
    const categoryStats = getCategoryStats();

    container.innerHTML = categoryStats.map(stat => {
        const actions = allActions.filter(action =>
            action.categories.includes(stat.name)
        );

        return `
            <div class="category-section">
                <h3>${stat.short_name} (${stat.count} actions)</h3>
                <p class="text-muted">${getCategoryDescription(stat.name)}</p>
                ${actions.slice(0, 5).map(action => createActionCard(action)).join('')}
                ${stat.count > 5 ? `<p class="text-muted">...and ${stat.count - 5} more actions in this category</p>` : ''}
            </div>
        `;
    }).join('');
}

// Get category description
function getCategoryDescription(categoryName) {
    const descriptions = {
        'Violating Democratic Norms Undermining Rule of Law': 'Actions that violate democratic processes and undermine the rule of law',
        'Hollowing State / Weakening Federal Institutions': 'Dismantling institutional capacity and expertise in federal agencies',
        'Suppressing Dissent / Weaponising State Against \'Enemies\'': 'Using state power to silence opposition and target perceived enemies',
        'Controlling Information Including Spreading Misinformation and Propaganda': 'Manipulating public understanding through propaganda and misinformation',
        'Control of Science & Health to Align with State Ideology': 'Replacing scientific evidence with political ideology in health and science policy',
        'Attacking Universities Schools Museums Culture': 'Controlling or attacking cultural institutions, education, and the arts',
        'Weakening Civil Rights': 'Eroding legal protections for vulnerable groups and minorities',
        'Corruption & Enrichment': 'Using public office for personal financial gain',
        'Aggressive Foreign Policy & Global Destabilisation': 'Reckless militarism and destabilizing foreign policy actions',
        'Anti-immigrant or Militarised Nationalism': 'Dehumanizing immigrants and militarizing immigration enforcement'
    };

    return descriptions[categoryName] || '';
}

// Populate filter dropdowns
function populateFilterDropdowns() {
    const timelineFilter = document.getElementById('timeline-filter');
    const browseFilter = document.getElementById('browse-filter');

    const categoryStats = getCategoryStats();
    const options = categoryStats.map(stat => {
        return `<option value="${stat.name}">${stat.short_name}</option>`;
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

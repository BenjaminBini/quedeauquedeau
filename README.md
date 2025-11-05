# Trump Actions Tracker

An interactive website for navigating and understanding Trump's actions that threaten democracy, institutions, and civil rights.

## Features

### 📊 Dashboard
- Overview statistics of all documented actions
- Category breakdown showing the distribution of threats
- Most recent actions
- Total action count and date range

### 📅 Timeline View
- Chronological view of all actions
- Filter by threat category
- Sort by newest or oldest first
- Visual timeline with date markers

### 🔍 Browse All
- Search functionality to find specific actions
- Filter by threat category
- Pagination support (25, 50, 100, or all items)
- Real-time filtering

### 📑 Categories View
- Actions grouped by 10 threat categories
- Shows top actions in each category
- Easy navigation between categories
- Percentage breakdown of threats

## Threat Categories

The tracker monitors 10 categories of authoritarian behavior:

1. **Democratic Norms** - Violating Democratic Norms & Undermining Rule of Law
2. **Weakening Institutions** - Hollowing State / Weakening Federal Institutions
3. **Suppressing Dissent** - Suppressing Dissent / Weaponizing State Against 'Enemies'
4. **Controlling Information** - Controlling Information Including Spreading Misinformation and Propaganda
5. **Science & Health Control** - Control of Science & Health to Align with State Ideology
6. **Attacking Culture** - Attacking Universities, Schools, Museums, Culture
7. **Civil Rights** - Weakening Civil Rights
8. **Corruption** - Corruption & Enrichment
9. **Foreign Policy** - Aggressive Foreign Policy & Global Destabilization
10. **Anti-Immigrant** - Anti-immigrant or Militarized Nationalism

## Data Source

The website uses `trumpactions.csv` which contains:
- **1,669 documented actions**
- Date, title, and source URL for each action
- Category flags indicating which threat categories apply
- Data spans from Trump's presidency through 2025

## How to Use

### Local Development

1. Clone the repository
2. Open `index.html` in a web browser, or
3. Run a local server:
   ```bash
   python3 -m http.server 8000
   ```
4. Navigate to `http://localhost:8000`

### Navigation

- Use the top navigation buttons to switch between views
- Use filters and search to find specific actions
- Click on action links to read the full source articles
- Hover over category badges to see full descriptions

## Technology

- Pure HTML, CSS, and JavaScript (no dependencies)
- Client-side CSV parsing
- Responsive design for mobile and desktop
- Fast and lightweight

## Purpose

This tracker helps citizens:
- **Understand patterns** of authoritarian behavior
- **Track threats** to democratic institutions
- **Document actions** that undermine civil rights
- **Raise awareness** of dangerous precedents
- **Maintain accountability** through transparency

## Category Grouping Philosophy

Actions are not mutually exclusive - a single action may threaten multiple democratic pillars. For example:
- Firing FBI agents investigating Trump violates democratic norms AND suppresses dissent
- Restricting journalist access violates democratic norms AND controls information
- ICE detaining citizens weakens civil rights AND represents anti-immigrant militarization

This multi-category tagging reveals how authoritarian actions often attack democracy on multiple fronts simultaneously.

## License

This is a civic project for educational and awareness purposes. Data is sourced from public reporting by major news organizations.

## Contributing

To add new actions:
1. Add entries to `trumpactions.csv` following the existing format
2. Ensure accurate categorization
3. Include credible source URLs
4. Maintain chronological order

---

**Last Updated:** November 2025
**Total Actions Documented:** 1,669

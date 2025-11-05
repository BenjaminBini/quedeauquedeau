# Database Schema

The Trump Actions Tracker uses a normalized SQLite database with the following schema:

## Tables

### `actions`
Primary table containing all documented actions.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing unique identifier |
| index_num | INTEGER UNIQUE | Original index from CSV (for reference) |
| date | TEXT NOT NULL | Date of the action (YYYY-MM-DD format) |
| title | TEXT NOT NULL | Description of the action |
| url | TEXT | Source URL for the action |

**Indexes:**
- `idx_date` on `date` column for efficient date-based queries

### `categories`
Lookup table for threat categories.

| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER PRIMARY KEY | Auto-incrementing unique identifier |
| name | TEXT UNIQUE NOT NULL | Full category name |
| short_name | TEXT NOT NULL | Abbreviated category name for display |
| description | TEXT | Detailed description of the category |

**Categories:**
1. **Democratic Norms** - Violating Democratic Norms Undermining Rule of Law
2. **Weakening Institutions** - Hollowing State / Weakening Federal Institutions
3. **Suppressing Dissent** - Suppressing Dissent / Weaponising State Against 'Enemies'
4. **Controlling Information** - Controlling Information Including Spreading Misinformation and Propaganda
5. **Science & Health Control** - Control of Science & Health to Align with State Ideology
6. **Attacking Culture** - Attacking Universities Schools Museums Culture
7. **Civil Rights** - Weakening Civil Rights
8. **Corruption** - Corruption & Enrichment
9. **Foreign Policy** - Aggressive Foreign Policy & Global Destabilisation
10. **Anti-Immigrant** - Anti-immigrant or Militarised Nationalism

### `action_categories`
Junction table implementing many-to-many relationship between actions and categories.

| Column | Type | Description |
|--------|------|-------------|
| action_id | INTEGER NOT NULL | Foreign key to actions.id |
| category_id | INTEGER NOT NULL | Foreign key to categories.id |

**Primary Key:** Composite of (action_id, category_id)

**Foreign Keys:**
- `action_id` → `actions(id)` with CASCADE DELETE
- `category_id` → `categories(id)` with CASCADE DELETE

**Indexes:**
- `idx_action_id` on `action_id` for efficient lookups by action
- `idx_category_id` on `category_id` for efficient lookups by category

## Database Statistics

- **Total Actions:** 1,669
- **Total Categories:** 10
- **Total Action-Category Relationships:** 2,682
- **Date Range:** January 20, 2025 - November 3, 2025

## Common Queries

### Get all actions with their categories
```sql
SELECT
    a.id,
    a.date,
    a.title,
    a.url,
    GROUP_CONCAT(c.name, ', ') as categories
FROM actions a
LEFT JOIN action_categories ac ON a.id = ac.action_id
LEFT JOIN categories c ON ac.category_id = c.id
GROUP BY a.id
ORDER BY a.date DESC;
```

### Get category statistics
```sql
SELECT
    c.name,
    c.short_name,
    COUNT(ac.action_id) as action_count
FROM categories c
LEFT JOIN action_categories ac ON c.id = ac.category_id
GROUP BY c.id, c.name, c.short_name
ORDER BY action_count DESC;
```

### Get actions for a specific category
```sql
SELECT
    a.id,
    a.date,
    a.title,
    a.url
FROM actions a
JOIN action_categories ac ON a.id = ac.action_id
JOIN categories c ON ac.category_id = c.id
WHERE c.short_name = 'Democratic Norms'
ORDER BY a.date DESC;
```

### Get actions with multiple threat categories
```sql
SELECT
    a.id,
    a.date,
    a.title,
    COUNT(ac.category_id) as category_count
FROM actions a
JOIN action_categories ac ON a.id = ac.action_id
GROUP BY a.id
HAVING category_count > 1
ORDER BY category_count DESC, a.date DESC;
```

## Implementation

### Browser-Side (sql.js)
The website uses [sql.js](https://sql.js.org/), a JavaScript library that runs SQLite compiled to WebAssembly in the browser. This allows:
- No server-side database required
- Fast client-side queries
- Reduced data transfer (733KB vs 511KB CSV)
- Better query performance for filtering and aggregation

### Database Creation
The database is generated from the CSV using the Python script `create_db.py`:

```bash
python3 create_db.py
```

This script:
1. Creates the normalized schema
2. Populates the categories table
3. Imports all actions from CSV
4. Creates the action-category relationships
5. Builds indexes for query performance
6. Outputs statistics about the created database

## Benefits of Normalized Schema

1. **Data Integrity:** Foreign key constraints ensure referential integrity
2. **Flexibility:** Easy to add/modify categories without changing action records
3. **Efficiency:** Smaller database size with no data duplication
4. **Queryability:** Complex queries using JOINs for powerful analysis
5. **Maintainability:** Single source of truth for category definitions
6. **Scalability:** Can easily add new categories or relationships

## File Size Comparison

- **CSV:** 511 KB
- **SQLite Database:** 733 KB (includes indexes and metadata)
- **Overhead:** ~220 KB for indexes, foreign keys, and database structure

The overhead is justified by:
- Much faster query performance
- Built-in data validation
- Relational integrity
- Powerful SQL query capabilities

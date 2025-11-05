#!/usr/bin/env python3
"""
Convert Trump Actions CSV to normalized SQLite database
"""
import sqlite3
import csv

# Create SQLite database
conn = sqlite3.connect('trumpactions.db')
cursor = conn.cursor()

# Create tables
cursor.execute('''
CREATE TABLE IF NOT EXISTS actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    index_num INTEGER UNIQUE,
    date TEXT NOT NULL,
    title TEXT NOT NULL,
    url TEXT
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    short_name TEXT NOT NULL,
    description TEXT
)
''')

cursor.execute('''
CREATE TABLE IF NOT EXISTS action_categories (
    action_id INTEGER NOT NULL,
    category_id INTEGER NOT NULL,
    PRIMARY KEY (action_id, category_id),
    FOREIGN KEY (action_id) REFERENCES actions(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
)
''')

# Create indexes for better query performance
cursor.execute('CREATE INDEX IF NOT EXISTS idx_date ON actions(date)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_action_id ON action_categories(action_id)')
cursor.execute('CREATE INDEX IF NOT EXISTS idx_category_id ON action_categories(category_id)')

# Insert categories
categories_data = [
    ('Violating Democratic Norms Undermining Rule of Law', 'Democratic Norms',
     'Actions that violate democratic processes and undermine the rule of law'),
    ('Hollowing State / Weakening Federal Institutions', 'Weakening Institutions',
     'Dismantling institutional capacity and expertise in federal agencies'),
    ('Suppressing Dissent / Weaponising State Against \'Enemies\'', 'Suppressing Dissent',
     'Using state power to silence opposition and target perceived enemies'),
    ('Controlling Information Including Spreading Misinformation and Propaganda', 'Controlling Information',
     'Manipulating public understanding through propaganda and misinformation'),
    ('Control of Science & Health to Align with State Ideology', 'Science & Health Control',
     'Replacing scientific evidence with political ideology in health and science policy'),
    ('Attacking Universities Schools Museums Culture', 'Attacking Culture',
     'Controlling or attacking cultural institutions, education, and the arts'),
    ('Weakening Civil Rights', 'Civil Rights',
     'Eroding legal protections for vulnerable groups and minorities'),
    ('Corruption & Enrichment', 'Corruption',
     'Using public office for personal financial gain'),
    ('Aggressive Foreign Policy & Global Destabilisation', 'Foreign Policy',
     'Reckless militarism and destabilizing foreign policy actions'),
    ('Anti-immigrant or Militarised Nationalism', 'Anti-Immigrant',
     'Dehumanizing immigrants and militarizing immigration enforcement')
]

cursor.executemany('''
    INSERT OR IGNORE INTO categories (name, short_name, description)
    VALUES (?, ?, ?)
''', categories_data)

# Create mapping of category names to IDs
cursor.execute('SELECT id, name FROM categories')
category_map = {name: id for id, name in cursor.fetchall()}

# Read CSV and insert data
with open('trumpactions.csv', 'r', encoding='utf-8-sig') as csvfile:
    reader = csv.DictReader(csvfile)

    for row in reader:
        # Insert action
        cursor.execute('''
            INSERT INTO actions (index_num, date, title, url)
            VALUES (?, ?, ?, ?)
        ''', (
            int(row['Index']),
            row['Date'],
            row['Title'],
            row['URL']
        ))

        action_id = cursor.lastrowid

        # Map CSV columns to category names
        category_columns = {
            'Violating Democratic Norms Undermining Rule of Law': row['Violating Democratic Norms Undermining Rule of Law'],
            'Hollowing State / Weakening Federal Institutions': row['Hollowing State / Weakening Federal Institutions'],
            'Suppressing Dissent / Weaponising State Against \'Enemies\'': row['Suppressing Dissent / Weaponising State Against \'Enemies\''],
            'Controlling Information Including Spreading Misinformation and Propaganda': row['Controlling Information Including Spreading Misinformation and Propaganda'],
            'Control of Science & Health to Align with State Ideology': row['Control of Science & Health to Align with State Ideology'],
            'Attacking Universities Schools Museums Culture': row['Attacking Universities Schools Museums Culture'],
            'Weakening Civil Rights': row['Weakening Civil Rights'],
            'Corruption & Enrichment': row['Corruption & Enrichment'],
            'Aggressive Foreign Policy & Global Destabilisation': row['Aggressive Foreign Policy & Global Destabilisation'],
            'Anti-immigrant or Militarised Nationalism': row['Anti-immigrant or Militarised Nationalism']
        }

        # Insert action-category relationships
        for category_name, value in category_columns.items():
            if value.strip().lower() == 'yes':
                category_id = category_map[category_name]
                cursor.execute('''
                    INSERT INTO action_categories (action_id, category_id)
                    VALUES (?, ?)
                ''', (action_id, category_id))

conn.commit()

# Print statistics
print("=" * 60)
print("DATABASE CREATION SUMMARY")
print("=" * 60)

cursor.execute('SELECT COUNT(*) FROM actions')
total_actions = cursor.fetchone()[0]
print(f"✓ Total actions: {total_actions}")

cursor.execute('SELECT COUNT(*) FROM categories')
total_categories = cursor.fetchone()[0]
print(f"✓ Total categories: {total_categories}")

cursor.execute('SELECT COUNT(*) FROM action_categories')
total_relationships = cursor.fetchone()[0]
print(f"✓ Total action-category relationships: {total_relationships}")

print("\nDate Range:")
cursor.execute('SELECT date FROM actions ORDER BY date ASC LIMIT 1')
earliest = cursor.fetchone()[0]
print(f"  Earliest: {earliest}")

cursor.execute('SELECT date FROM actions ORDER BY date DESC LIMIT 1')
latest = cursor.fetchone()[0]
print(f"  Latest: {latest}")

print("\nCategory Statistics:")
cursor.execute('''
    SELECT c.short_name, COUNT(ac.action_id) as count
    FROM categories c
    LEFT JOIN action_categories ac ON c.id = ac.category_id
    GROUP BY c.id, c.short_name
    ORDER BY count DESC
''')

for short_name, count in cursor.fetchall():
    percentage = (count / total_actions * 100) if total_actions > 0 else 0
    print(f"  {short_name:25} {count:4} actions ({percentage:5.1f}%)")

print("\n" + "=" * 60)
print(f"✓ Database created successfully: trumpactions.db")
print("=" * 60)

conn.close()

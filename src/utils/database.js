import initSqlJs from 'sql.js';

let db = null;

export async function initDatabase() {
  try {
    const SQL = await initSqlJs({
      locateFile: file => `https://sql.js.org/dist/${file}`
    });

    const response = await fetch('./trumpactions.db');
    const buffer = await response.arrayBuffer();
    db = new SQL.Database(new Uint8Array(buffer));

    return db;
  } catch (error) {
    console.error('Error loading database:', error);
    throw error;
  }
}

export function queryOne(sql, params = []) {
  if (!db) return null;

  const stmt = db.prepare(sql);
  stmt.bind(params);
  let result = null;
  if (stmt.step()) {
    result = stmt.getAsObject();
  }
  stmt.free();
  return result;
}

export function queryAll(sql, params = []) {
  if (!db) return [];

  const stmt = db.prepare(sql);
  stmt.bind(params);
  const results = [];
  while (stmt.step()) {
    results.push(stmt.getAsObject());
  }
  stmt.free();
  return results;
}

export function loadAllActions() {
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

  return rows.map(row => ({
    index: row.index_num,
    date: row.date,
    title: row.title,
    url: row.url,
    categories: row.category_names ? row.category_names.split('||') : []
  }));
}

export function getCategoryStats() {
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

export const categoryShortNames = {
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

export const categoryDescriptions = {
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

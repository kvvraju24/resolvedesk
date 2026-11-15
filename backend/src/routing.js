// Assignment rules: route to the category's team, then to the team agent with
// the fewest active (open / in_progress) requests.

export function teamForCategory(db, model, category) {
  const slug = model.category_to_team[category];
  return slug ? db.prepare('SELECT * FROM teams WHERE slug = ?').get(slug) : null;
}

export function leastLoadedAgent(db, teamId) {
  return db.prepare(`
    SELECT u.id, u.name, COUNT(r.id) AS load
    FROM users u
    LEFT JOIN assignments a ON a.agent_id = u.id AND a.active = 1
    LEFT JOIN requests r ON r.id = a.request_id AND r.status IN ('open', 'in_progress')
    WHERE u.role = 'agent' AND u.team_id = ?
    GROUP BY u.id ORDER BY load ASC, u.id ASC LIMIT 1
  `).get(teamId);
}

export function assign(db, { requestId, agentId, teamId, by = null, reason }) {
  db.prepare('UPDATE assignments SET active = 0 WHERE request_id = ? AND active = 1').run(requestId);
  db.prepare('INSERT INTO assignments (request_id, agent_id, team_id, assigned_by, reason) VALUES (?, ?, ?, ?, ?)')
    .run(requestId, agentId ?? null, teamId ?? null, by, reason);
}

// Which status changes each role may make.
export const TRANSITIONS = {
  agent: {
    needs_review: ['open', 'rejected'],
    open: ['in_progress', 'resolved', 'rejected'],
    in_progress: ['open', 'resolved'],
    resolved: ['in_progress', 'closed'],
    closed: [],
    rejected: ['needs_review'],
  },
  customer: { resolved: ['closed', 'open'] },
};
TRANSITIONS.admin = TRANSITIONS.agent;

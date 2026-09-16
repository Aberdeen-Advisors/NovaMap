const { getSql } = require('./_db');

// GET /api/data — returns all four collections in one payload, replacing the
// four capabilities.json / applications.json / unmappedApps.json /
// techStandards.json seed fetches the Claude-hosted version used.
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  try {
    const sql = getSql();
    const [capRows, appRows, unmappedRows, techRows] = await Promise.all([
      sql`SELECT data FROM capabilities ORDER BY l2_id`,
      sql`SELECT data FROM applications ORDER BY apm_number`,
      sql`SELECT data FROM unmapped_apps ORDER BY apm_number`,
      sql`SELECT data FROM tech_standards ORDER BY name`,
    ]);
    res.status(200).json({
      capabilities: capRows.map((r) => r.data),
      applications: appRows.map((r) => r.data),
      unmapped: unmappedRows.map((r) => r.data),
      techStandards: techRows.map((r) => r.data),
    });
  } catch (err) {
    console.error('GET /api/data failed', err);
    res.status(500).json({ error: 'failed to load data' });
  }
};

const { getSql, parseBody } = require('../_db');

// PATCH /api/capabilities/:id — updates owner and/or notes on one capability.
// Uses a jsonb merge (data || patch) so it only ever touches the fields sent.
module.exports = async (req, res) => {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  const { id } = req.query;
  const body = parseBody(req);

  const patch = {};
  if (typeof body.owner === 'string') patch.owner = body.owner;
  if (typeof body.notes === 'string' || body.notes === null) patch.notes = body.notes;

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: 'no valid fields in patch' });
    return;
  }

  try {
    const sql = getSql();
    const rows = await sql`
      UPDATE capabilities
      SET data = data || ${JSON.stringify(patch)}::jsonb, updated_at = now()
      WHERE l2_id = ${id}
      RETURNING data
    `;
    if (!rows.length) {
      res.status(404).json({ error: 'capability not found' });
      return;
    }
    res.status(200).json(rows[0].data);
  } catch (err) {
    console.error('PATCH /api/capabilities/[id] failed', err);
    res.status(500).json({ error: 'save failed' });
  }
};

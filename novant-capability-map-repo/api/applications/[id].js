const { getSql, parseBody } = require('../_db');

// PATCH /api/applications/:id — updates primaryCapabilityId, trmCategory
// and/or notes on one application. Uses a jsonb merge (data || patch).
module.exports = async (req, res) => {
  if (req.method !== 'PATCH') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  const { id } = req.query;
  const body = parseBody(req);

  const patch = {};
  if (typeof body.primaryCapabilityId === 'string') patch.primaryCapabilityId = body.primaryCapabilityId;
  if (typeof body.trmCategory === 'string' || body.trmCategory === null) patch.trmCategory = body.trmCategory;
  if (typeof body.notes === 'string' || body.notes === null) patch.notes = body.notes;

  if (Object.keys(patch).length === 0) {
    res.status(400).json({ error: 'no valid fields in patch' });
    return;
  }

  try {
    const sql = getSql();
    const rows = await sql`
      UPDATE applications
      SET data = data || ${JSON.stringify(patch)}::jsonb, updated_at = now()
      WHERE apm_number = ${id}
      RETURNING data
    `;
    if (!rows.length) {
      res.status(404).json({ error: 'application not found' });
      return;
    }
    res.status(200).json(rows[0].data);
  } catch (err) {
    console.error('PATCH /api/applications/[id] failed', err);
    res.status(500).json({ error: 'save failed' });
  }
};

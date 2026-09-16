const { getSql, parseBody } = require('./_db');

// POST /api/assign — moves an unmapped app into the applications table under
// a chosen capability, in a single atomic transaction (insert + delete).
// Body: { unmapped: {apmNumber, name, vendor, installStatus, businessOwner,
//          plannedDisposition}, primaryCapabilityId: "XXX-00.00" }
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'method not allowed' });
    return;
  }
  const body = parseBody(req);
  const u = body.unmapped;
  const primaryCapabilityId = body.primaryCapabilityId;

  if (!u || typeof u.apmNumber !== 'string' || typeof primaryCapabilityId !== 'string' || !primaryCapabilityId) {
    res.status(400).json({ error: 'unmapped item and primaryCapabilityId are required' });
    return;
  }

  const newApp = {
    apmNumber: u.apmNumber,
    name: u.name || null,
    novantName: null,
    vendor: u.vendor || null,
    installStatus: u.installStatus || null,
    assignmentGroup: null,
    validateWith: null,
    businessNeed: null,
    businessService: null,
    businessOwner: u.businessOwner || null,
    disposition: u.plannedDisposition || null,
    drTier: null,
    primaryCapabilityId: primaryCapabilityId,
    reviewerConfidence: 'Manual',
    reviewerRationale: 'Assigned via Capability Map tool.',
    reasoning: null,
    migrationStrategy: null,
    targetBusinessApplication: null,
    trmCategory: null,
    notes: null,
  };

  try {
    const sql = getSql();
    await sql.transaction([
      sql`
        INSERT INTO applications (apm_number, data)
        VALUES (${newApp.apmNumber}, ${JSON.stringify(newApp)}::jsonb)
        ON CONFLICT (apm_number) DO UPDATE SET data = EXCLUDED.data, updated_at = now()
      `,
      sql`DELETE FROM unmapped_apps WHERE apm_number = ${newApp.apmNumber}`,
    ]);
    res.status(200).json(newApp);
  } catch (err) {
    console.error('POST /api/assign failed', err);
    res.status(500).json({ error: 'assign failed' });
  }
};

export function ok(res, data, meta) {
  return res.status(200).json({ ok: true, data, ...(meta ? { meta } : {}) });
}

export function created(res, data) {
  return res.status(201).json({ ok: true, data });
}

export function fail(res, status, code, message, details) {
  return res.status(status).json({ ok: false, error: { code, message, ...(details ? { details } : {}) } });
}

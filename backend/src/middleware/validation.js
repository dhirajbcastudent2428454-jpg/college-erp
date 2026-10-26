export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) return res.status(422).json({ ok: false, error: { code: 'VALIDATION_ERROR', message: 'Please correct the highlighted fields.', details: result.error.flatten() } });
    if (source === 'query') req.validatedQuery = result.data;
    else req[source] = result.data;
    next();
  };
}

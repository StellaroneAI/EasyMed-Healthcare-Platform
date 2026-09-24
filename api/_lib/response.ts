export function json(data: unknown, init: ResponseInit = {}): Response {
  return Response.json(data, {
    ...init,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...init.headers,
    },
  });
}

export function methodNotAllowed(allowed: string[]): Response {
  return json({ error: 'Method not allowed' }, {
    status: 405,
    headers: { Allow: allowed.join(', ') },
  });
}

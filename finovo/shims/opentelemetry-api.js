// shims/opentelemetry-api.js
module.exports = {
  context: { active: () => ({}) },
  propagation: { extract: () => ({}), inject: () => {} },
  trace: { getSpan: () => null, getActiveSpan: () => null },
  diag: { warn: () => {}, error: () => {}, debug: () => {} },
  SpanStatusCode: { OK: 1, ERROR: 2, UNSET: 0 },
}
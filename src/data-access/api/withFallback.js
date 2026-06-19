export const withFallback = (realFn, localFn) => async (...args) => {
  try { return await realFn(...args); } catch (e) { console.warn('[API fallback]', e?.message); return localFn(...args); }
};

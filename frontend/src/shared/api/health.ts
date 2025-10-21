export const startSelfPing = () => {
  const url =
    import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/healthz';
  // 예: 60분마다 ping (600000ms)
  const intervalMs = 60 * 60 * 1000;

  setInterval(async () => {
    try {
      const resp = await fetch(url, { method: 'GET' });
      if (!resp.ok) {
        throw new Error(`HTTP error! status: ${resp.status}`);
      }
      console.log(`[SelfPing] status: ${resp.status}`);
    } catch (error) {
      console.error(`[SelfPing] error: ${error}`);
    }
  }, intervalMs);
};

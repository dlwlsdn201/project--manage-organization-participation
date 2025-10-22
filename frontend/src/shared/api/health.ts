let pingIntervalId: ReturnType<typeof setInterval> | null = null;

export const startSelfPing = () => {
  // 이미 실행 중이면 중복 실행 방지
  if (pingIntervalId) {
    return;
  }

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  const healthUrl = `${baseUrl}/health`;
  // Render 무료 플랜은 15분 유휴 시 중지되므로 14분마다 핑
  const intervalMs = 14 * 60 * 1000; // 14분 = 840,000ms

  console.log(
    `🔔 Keep-alive 시작: ${healthUrl} (${intervalMs / 60000}분 간격)`
  );

  // 즉시 한 번 실행
  pingBackend(healthUrl);

  // 주기적으로 실행
  pingIntervalId = setInterval(() => {
    pingBackend(healthUrl);
  }, intervalMs);
};

export const stopSelfPing = () => {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
    console.log('🔕 Keep-alive 중지');
  }
};

const pingBackend = async (url: string) => {
  try {
    const timestamp = new Date().toISOString();
    const resp = await fetch(url, { method: 'GET' });

    if (!resp.ok) {
      console.warn(`⚠️ [${timestamp}] Keep-alive 응답: ${resp.status}`);
    } else {
      console.log(`✅ [${timestamp}] Keep-alive 성공`);
    }
  } catch (error) {
    console.error(`❌ Keep-alive 오류:`, error);
  }
};

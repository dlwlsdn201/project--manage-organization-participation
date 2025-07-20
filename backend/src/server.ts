import express from 'express';
import dotenv from 'dotenv';
import morgan from 'morgan';
import helmet from 'helmet';

import { connectDatabase } from './config/database.js';
import { corsMiddleware } from './middleware/cors.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// 환경 변수 로드
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어 설정
app.use(helmet()); // 보안 헤더
app.use(corsMiddleware); // CORS
app.use(morgan('combined')); // 로깅
app.use(express.json({ limit: '10mb' })); // JSON 파싱
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL 인코딩

// 기본 라우트
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Organization Participation Management API',
    version: '1.0.0',
    endpoints: {
      organizations: '/api/organizations',
      members: '/api/members',
      events: '/api/events',
      logs: '/api/logs',
    },
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API 라우트 import
import organizationRoutes from './routes/organizationRoutes.js';
import memberRoutes from './routes/memberRoutes.js';
import activityLogRoutes from './routes/activityLogRoutes.js';

// API 라우트 설정
app.use('/api/organizations', organizationRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/logs', activityLogRoutes);
// app.use('/api/events', eventRoutes);

// 404 핸들러
app.use(notFoundHandler);

// 에러 핸들러
app.use(errorHandler);

// 서버 시작
const startServer = async () => {
  try {
    // MongoDB 연결
    await connectDatabase();

    // 서버 시작
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다.`);
      console.log(`🌐 개발 서버: http://localhost:${PORT}`);
      console.log(`📱 프론트엔드: ${process.env.FRONTEND_URL}`);
      console.log(`🌍 환경: ${process.env.NODE_ENV}`);
    });
  } catch (error) {
    console.error('❌ 서버 시작 실패:', error);
    process.exit(1);
  }
};

startServer();

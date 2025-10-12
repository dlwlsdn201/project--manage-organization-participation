import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://localhost:27017/organization-participation';

export const connectDatabase = async (): Promise<void> => {
  try {
    console.log('🔄 MongoDB 연결 시도 중...');

    await mongoose.connect(MONGODB_URI);

    console.log('✅ MongoDB 연결 성공!');
    console.log(`📊 Database: ${mongoose.connection.name}`);

    // 연결 이벤트 리스너
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB 연결 오류:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('🔌 MongoDB 연결 해제됨');
    });

    // 프로세스 종료 시 연결 해제
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('🔌 MongoDB 연결이 정상적으로 종료되었습니다.');
      process.exit(0);
    });
  } catch (error) {
    console.error('❌ MongoDB 연결 실패:', error);
    process.exit(1);
  }
};

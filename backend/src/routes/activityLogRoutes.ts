import { Router } from 'express';
import {
  getAllActivityLogs,
  getActivityLogById,
  getActivityLogsByOrganization,
  createActivityLog,
  updateActivityLog,
  deleteActivityLog,
} from '../controllers/activityLogController.js';

const router: Router = Router();

// GET /api/logs - 모든 활동 로그 조회
router.get('/', getAllActivityLogs);

// GET /api/logs/:id - 특정 활동 로그 조회
router.get('/:id', getActivityLogById);

// GET /api/logs/organization/:organizationId - 조직별 활동 로그 조회
router.get('/organization/:organizationId', getActivityLogsByOrganization);

// POST /api/logs - 활동 로그 생성
router.post('/', createActivityLog);

// PUT /api/logs/:id - 활동 로그 수정
router.put('/:id', updateActivityLog);

// DELETE /api/logs/:id - 활동 로그 삭제
router.delete('/:id', deleteActivityLog);

export default router;

import { Router } from 'express';
import {
  getOrganizationAnalytics,
  getMemberAnalytics,
  getSystemAnalytics,
} from '../controllers/analyticsController.js';

const router: Router = Router();

// GET /api/analytics/organization/:organizationId - 조직별 참여 분석
router.get('/organization/:organizationId', getOrganizationAnalytics);

// GET /api/analytics/member/:organizationId/:memberId - 멤버별 상세 분석
router.get('/member/:organizationId/:memberId', getMemberAnalytics);

// GET /api/analytics/system - 전체 시스템 분석
router.get('/system', getSystemAnalytics);

export default router;

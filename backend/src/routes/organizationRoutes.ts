import { Router } from 'express';
import {
  getAllOrganizations,
  getOrganizationById,
  createOrganization,
  updateOrganization,
  deleteOrganization,
  updateMemberCount,
} from '../controllers/organizationController.js';

const router: Router = Router();

// GET /api/organizations - 모든 조직 조회
router.get('/', getAllOrganizations);

// GET /api/organizations/:id - 특정 조직 조회
router.get('/:id', getOrganizationById);

// POST /api/organizations - 조직 생성
router.post('/', createOrganization);

// PUT /api/organizations/:id - 조직 수정
router.put('/:id', updateOrganization);

// DELETE /api/organizations/:id - 조직 삭제
router.delete('/:id', deleteOrganization);

// PATCH /api/organizations/:id/member-count - 구성원 수 업데이트
router.patch('/:id/member-count', updateMemberCount);

export default router;

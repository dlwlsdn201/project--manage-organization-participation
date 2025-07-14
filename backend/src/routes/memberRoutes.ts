import { Router } from 'express';
import {
  getAllMembers,
  getMemberById,
  createMember,
  updateMember,
  deleteMember,
  getMembersByOrganization,
} from '../controllers/memberController.js';

const router: Router = Router();

// GET /api/members - 모든 구성원 조회
router.get('/', getAllMembers);

// GET /api/members/organization/:organizationId - 특정 조직의 구성원 조회
router.get('/organization/:organizationId', getMembersByOrganization);

// GET /api/members/:id - 특정 구성원 조회
router.get('/:id', getMemberById);

// POST /api/members - 구성원 생성
router.post('/', createMember);

// PUT /api/members/:id - 구성원 수정
router.put('/:id', updateMember);

// DELETE /api/members/:id - 구성원 삭제
router.delete('/:id', deleteMember);

export default router;

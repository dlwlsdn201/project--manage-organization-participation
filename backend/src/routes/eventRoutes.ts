import { Router } from 'express';
import {
  getAllEvents,
  getEventById,
  getEventsByOrganization,
  createEvent,
  updateEvent,
  deleteEvent,
  updateEventAttendance,
  updateEventStatus,
} from '../controllers/eventController.js';

const router: Router = Router();

// GET /api/events - 모든 이벤트 조회 (필터링 지원)
router.get('/', getAllEvents);

// GET /api/events/:id - 특정 이벤트 조회
router.get('/:id', getEventById);

// GET /api/events/organization/:organizationId - 조직별 이벤트 조회
router.get('/organization/:organizationId', getEventsByOrganization);

// POST /api/events - 이벤트 생성
router.post('/', createEvent);

// PUT /api/events/:id - 이벤트 수정
router.put('/:id', updateEvent);

// DELETE /api/events/:id - 이벤트 삭제
router.delete('/:id', deleteEvent);

// PATCH /api/events/:id/attendance - 참여자 추가/제거
router.patch('/:id/attendance', updateEventAttendance);

// PATCH /api/events/:id/status - 이벤트 상태 변경
router.patch('/:id/status', updateEventStatus);

export default router;

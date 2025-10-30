import { Request, Response } from 'express';
import { Event } from '../models/index.js';
import { ApiResponse, PaginationQuery } from '../types/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// 모든 이벤트 조회
export const getAllEvents = asyncHandler(
  async (
    req: Request<
      {},
      ApiResponse,
      {},
      PaginationQuery & { organizationId?: string; status?: string }
    >,
    res: Response<ApiResponse>
  ) => {
    const {
      sortBy = 'date',
      sortOrder = 'desc',
      organizationId,
      status,
    } = req.query;

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // 필터 조건 구성
    const filter: { organizationId?: string; status?: string } = {};
    if (organizationId) {
      filter.organizationId = organizationId;
    }
    if (status) {
      filter.status = status;
    }

    // limit/skip 없이 전체 데이터 조회
    const events = await Event.find(filter).sort(sortObj).lean();
    const total = events.length;

    res.json({
      success: true,
      data: events,
      // 참고: 클라이언트 호환성을 위해 pagination은 고정값으로 반환
      pagination: {
        page: 1,
        limit: total,
        total,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  }
);

// 특정 이벤트 조회
export const getEventById = asyncHandler(
  async (
    req: Request<{ id: string }, ApiResponse>,
    res: Response<ApiResponse>
  ) => {
    const { id } = req.params;

    const event = await Event.findById(id).lean();
    if (!event) {
      throw new AppError('이벤트를 찾을 수 없습니다.', 404);
    }

    res.json({
      success: true,
      data: event,
    });
  }
);

// 조직별 이벤트 조회
export const getEventsByOrganization = asyncHandler(
  async (
    req: Request<{ organizationId: string }, ApiResponse, {}, PaginationQuery>,
    res: Response<ApiResponse>
  ) => {
    const { organizationId } = req.params;
    const { sortBy = 'date', sortOrder = 'desc' } = req.query;

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // limit/skip 없이 전체 데이터 조회
    const events = await Event.find({ organizationId }).sort(sortObj).lean();
    const total = events.length;

    res.json({
      success: true,
      data: events,
      pagination: {
        page: 1,
        limit: total,
        total,
        totalPages: 1,
        hasNext: false,
        hasPrev: false,
      },
    });
  }
);

// 이벤트 생성
export const createEvent = asyncHandler(
  async (req: Request<{}, ApiResponse, any>, res: Response<ApiResponse>) => {
    const eventData = req.body;

    // 필수 필드 검증
    if (
      !eventData.organizationId ||
      !eventData.title ||
      !eventData.date ||
      !eventData.location ||
      !eventData.hostId
    ) {
      throw new AppError('필수 필드가 누락되었습니다.', 400);
    }

    const newEvent = new Event({
      ...eventData,
      createdBy: eventData.createdBy || 'system',
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      success: true,
      data: savedEvent,
      message: '이벤트가 성공적으로 생성되었습니다.',
    });
  }
);

// 이벤트 수정
export const updateEvent = asyncHandler(
  async (
    req: Request<{ id: string }, ApiResponse, any>,
    res: Response<ApiResponse>
  ) => {
    const { id } = req.params;
    const updateData = req.body;

    const event = await Event.findById(id);
    if (!event) {
      throw new AppError('이벤트를 찾을 수 없습니다.', 404);
    }

    // 업데이트 가능한 필드들만 허용
    const allowedFields = [
      'title',
      'description',
      'date',
      'location',
      'hostId',
      'maxParticipants',
      'currentParticipants',
      'status',
      'attendees',
    ];

    allowedFields.forEach((field) => {
      if (updateData[field] !== undefined) {
        (event as unknown as Record<string, unknown>)[field] =
          updateData[field];
      }
    });

    event.updatedAt = new Date();
    const updatedEvent = await event.save();

    res.json({
      success: true,
      data: updatedEvent,
      message: '이벤트가 성공적으로 수정되었습니다.',
    });
  }
);

// 이벤트 삭제
export const deleteEvent = asyncHandler(
  async (
    req: Request<{ id: string }, ApiResponse>,
    res: Response<ApiResponse>
  ) => {
    const { id } = req.params;

    const event = await Event.findById(id);
    if (!event) {
      throw new AppError('이벤트를 찾을 수 없습니다.', 404);
    }

    await Event.findByIdAndDelete(id);

    res.json({
      success: true,
      message: '이벤트가 성공적으로 삭제되었습니다.',
    });
  }
);

// 참여자 추가/제거
export const updateEventAttendance = asyncHandler(
  async (
    req: Request<
      { id: string },
      ApiResponse,
      { memberId: string; action: 'add' | 'remove' }
    >,
    res: Response<ApiResponse>
  ) => {
    const { id } = req.params;
    const { memberId, action } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      throw new AppError('이벤트를 찾을 수 없습니다.', 404);
    }

    if (action === 'add') {
      if (!event.attendees.includes(memberId)) {
        event.attendees.push(memberId);
      }
    } else if (action === 'remove') {
      event.attendees = event.attendees.filter((id) => id !== memberId);
    }

    event.updatedAt = new Date();
    const updatedEvent = await event.save();

    res.json({
      success: true,
      data: updatedEvent,
      message: `참여자가 성공적으로 ${action === 'add' ? '추가' : '제거'}되었습니다.`,
    });
  }
);

// 이벤트 상태 변경
export const updateEventStatus = asyncHandler(
  async (
    req: Request<{ id: string }, ApiResponse, { status: string }>,
    res: Response<ApiResponse>
  ) => {
    const { id } = req.params;
    const { status } = req.body;

    const event = await Event.findById(id);
    if (!event) {
      throw new AppError('이벤트를 찾을 수 없습니다.', 404);
    }

    event.status = status as any;
    event.updatedAt = new Date();
    const updatedEvent = await event.save();

    res.json({
      success: true,
      data: updatedEvent,
      message: '이벤트 상태가 성공적으로 변경되었습니다.',
    });
  }
);

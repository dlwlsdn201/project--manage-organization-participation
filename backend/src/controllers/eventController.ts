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
      page = '1',
      limit = '20',
      sortBy = 'date',
      sortOrder = 'desc',
      organizationId,
      status,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

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

    const [events, total] = await Promise.all([
      Event.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Event.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
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
    const {
      page = '1',
      limit = '20',
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [events, total] = await Promise.all([
      Event.find({ organizationId })
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Event.countDocuments({ organizationId }),
    ]);

    res.json({
      success: true,
      data: events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasNext: pageNum < Math.ceil(total / limitNum),
        hasPrev: pageNum > 1,
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

    console.log('이벤트 수정 요청:', { id, updateData });

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
        console.log(`업데이트 필드 ${field}:`, updateData[field]);
        console.log(`업데이트 필드 ${field} 타입:`, typeof updateData[field]);
        console.log(
          `업데이트 필드 ${field} 배열 여부:`,
          Array.isArray(updateData[field])
        );

        // attendees 필드 특별 처리
        if (field === 'attendees') {
          let attendeesData = updateData[field];
          console.log('attendees 원본 데이터:', attendeesData);
          console.log('attendees 원본 타입:', typeof attendeesData);

          // 문자열로 전달된 경우 JSON 파싱 시도
          if (typeof attendeesData === 'string') {
            console.log('attendees가 문자열로 전달됨, JSON 파싱 시도');
            try {
              attendeesData = JSON.parse(attendeesData);
              console.log('JSON 파싱 성공:', attendeesData);
            } catch (parseError) {
              console.error('attendees JSON 파싱 오류:', parseError);
              throw new AppError(
                'attendees 데이터 형식이 올바르지 않습니다.',
                400
              );
            }
          }

          // 배열인지 확인
          if (Array.isArray(attendeesData)) {
            // joinedAt 필드를 Date 객체로 변환하고 유효성 검사
            const processedAttendees = attendeesData.map((attendee: any) => {
              if (!attendee.memberId) {
                throw new AppError('attendee.memberId는 필수입니다.', 400);
              }
              if (
                !attendee.status ||
                !['confirmed', 'pending', 'declined'].includes(attendee.status)
              ) {
                attendee.status = 'confirmed';
              }
              return {
                memberId: attendee.memberId,
                status: attendee.status,
                joinedAt: attendee.joinedAt
                  ? new Date(attendee.joinedAt)
                  : new Date(),
              };
            });
            (event as any)[field] = processedAttendees;
            event.markModified('attendees');
          } else {
            throw new AppError('attendees는 배열이어야 합니다.', 400);
          }
        } else {
          (event as any)[field] = updateData[field];
        }
      }
    });

    event.updatedAt = new Date();

    let updatedEvent;
    try {
      updatedEvent = await event.save();
      console.log('이벤트 저장 성공:', updatedEvent);
    } catch (saveError: any) {
      console.error('이벤트 저장 오류:', saveError);
      console.error('오류 상세 정보:', {
        name: saveError.name,
        message: saveError.message,
        errors: saveError.errors,
        code: saveError.code,
      });
      throw new AppError(`이벤트 저장 실패: ${saveError.message}`, 400);
    }

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
      if (!event.attendees.some((attendee) => attendee.memberId === memberId)) {
        event.attendees.push({
          memberId,
          status: 'confirmed',
          joinedAt: new Date(),
        });
      }
    } else if (action === 'remove') {
      event.attendees = event.attendees.filter(
        (attendee) => attendee.memberId !== memberId
      );
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

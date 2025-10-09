import { Request, Response } from 'express';
import { ActivityLog } from '../models/index.js';
import { ApiResponse, PaginationQuery } from '../types/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// 모든 활동 로그 조회
export const getAllActivityLogs = asyncHandler(
  async (
    req: Request<{}, ApiResponse, {}, PaginationQuery>,
    res: Response<ApiResponse>
  ) => {
    const {
      page = '1',
      limit = '20',
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [logs, total] = await Promise.all([
      ActivityLog.find({}).sort(sortObj).skip(skip).limit(limitNum).lean(),
      ActivityLog.countDocuments({}),
    ]);

    res.json({
      success: true,
      data: logs,
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

// 특정 활동 로그 조회
export const getActivityLogById = asyncHandler(
  async (
    req: Request<{ id: string }, ApiResponse>,
    res: Response<ApiResponse>
  ) => {
    const { id } = req.params;

    const log = await ActivityLog.findById(id).lean();

    if (!log) {
      throw new AppError('활동 로그를 찾을 수 없습니다.', 404);
    }

    res.json({
      success: true,
      data: log,
    });
  }
);

// 조직별 활동 로그 조회
export const getActivityLogsByOrganization = asyncHandler(
  async (
    req: Request<{ organizationId: string }, ApiResponse, {}, PaginationQuery>,
    res: Response<ApiResponse>
  ) => {
    const { organizationId } = req.params;
    const {
      page = '1',
      limit = '20',
      sortBy = 'timestamp',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [logs, total] = await Promise.all([
      ActivityLog.find({ organizationId })
        .sort(sortObj)
        .skip(skip)
        .limit(limitNum)
        .lean(),
      ActivityLog.countDocuments({ organizationId }),
    ]);

    res.json({
      success: true,
      data: logs,
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

// 활동 로그 생성
export const createActivityLog = asyncHandler(
  async (req: Request<{}, ApiResponse, any>, res: Response<ApiResponse>) => {
    const logData = req.body;

    const newLog = new ActivityLog({
      ...logData,
      timestamp: logData.timestamp || new Date(),
    });

    const savedLog = await newLog.save();

    res.status(201).json({
      success: true,
      data: savedLog,
      message: '활동 로그가 생성되었습니다.',
    });
  }
);

// 활동 로그 수정
export const updateActivityLog = asyncHandler(
  async (
    req: Request<{ id: string }, ApiResponse, any>,
    res: Response<ApiResponse>
  ) => {
    const { id } = req.params;
    const updateData = req.body;

    const updatedLog = await ActivityLog.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedLog) {
      throw new AppError('활동 로그를 찾을 수 없습니다.', 404);
    }

    res.json({
      success: true,
      data: updatedLog,
      message: '활동 로그가 수정되었습니다.',
    });
  }
);

// 활동 로그 삭제
export const deleteActivityLog = asyncHandler(
  async (
    req: Request<{ id: string }, ApiResponse>,
    res: Response<ApiResponse>
  ) => {
    const { id } = req.params;

    const deletedLog = await ActivityLog.findByIdAndDelete(id);

    if (!deletedLog) {
      throw new AppError('활동 로그를 찾을 수 없습니다.', 404);
    }

    res.json({
      success: true,
      message: '활동 로그가 삭제되었습니다.',
    });
  }
);

import { Request, Response } from 'express';
import { Organization, Member } from '../models/index.js';
import { ApiResponse, PaginationQuery } from '../types/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';
import { extractUserIdFromRequest } from '../utils/user-utils.js';

// 모든 조직 조회
export const getAllOrganizations = asyncHandler(
  async (
    req: Request<{}, ApiResponse, {}, PaginationQuery>,
    res: Response<ApiResponse>
  ) => {
    const {
      page = '1',
      limit = '10',
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [organizations, total] = await Promise.all([
      Organization.find({}).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Organization.countDocuments({}),
    ]);

    res.json({
      success: true,
      data: organizations,
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

// 특정 조직 조회
export const getOrganizationById = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const organization = await Organization.findById(id).lean();

    if (!organization) {
      throw new AppError('조직을 찾을 수 없습니다.', 404);
    }

    res.json({
      success: true,
      data: organization,
    });
  }
);

// 조직 생성
export const createOrganization = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const organizationData = req.body;

    // 중복 이름 확인
    const existingOrg = await Organization.findOne({
      name: organizationData.name,
    });
    if (existingOrg) {
      throw new AppError('같은 이름의 조직이 이미 존재합니다.', 409);
    }

    const organization = new Organization({
      ...organizationData,
      createdBy: extractUserIdFromRequest(req),
    });

    await organization.save();

    res.status(201).json({
      success: true,
      message: '조직이 성공적으로 생성되었습니다.',
      data: organization.toJSON(),
    });
  }
);

// 조직 수정
export const updateOrganization = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const updateData = req.body;

    // 이름 중복 확인 (자신 제외)
    if (updateData.name) {
      const existingOrg = await Organization.findOne({
        name: updateData.name,
        _id: { $ne: id },
      });
      if (existingOrg) {
        throw new AppError('같은 이름의 조직이 이미 존재합니다.', 409);
      }
    }

    const organization = await Organization.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!organization) {
      throw new AppError('조직을 찾을 수 없습니다.', 404);
    }

    res.json({
      success: true,
      message: '조직이 성공적으로 수정되었습니다.',
      data: organization.toJSON(),
    });
  }
);

// 조직 삭제
export const deleteOrganization = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;

    // 조직에 속한 구성원 수 확인
    const memberCount = await Member.countDocuments({ organizationId: id });

    // 트랜잭션으로 조직과 관련 구성원을 함께 삭제
    const session = await Organization.startSession();
    session.startTransaction();

    try {
      // 관련 구성원 삭제
      if (memberCount > 0) {
        await Member.deleteMany({ organizationId: id }, { session });
      }

      // 조직 삭제
      const organization = await Organization.findByIdAndDelete(id, {
        session,
      });

      if (!organization) {
        throw new AppError('조직을 찾을 수 없습니다.', 404);
      }

      await session.commitTransaction();

      res.json({
        success: true,
        message: `조직이 성공적으로 삭제되었습니다. (삭제된 구성원: ${memberCount}명)`,
        data: {
          deletedOrganization: organization.toJSON(),
          deletedMembersCount: memberCount,
        },
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }
);

// 조직 구성원 수 업데이트
export const updateMemberCount = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const memberCount = await Member.countDocuments({
      organizationId: id,
      status: 'active',
    });

    const organization = await Organization.findByIdAndUpdate(
      id,
      { currentMembers: memberCount, updatedAt: new Date() },
      { new: true }
    );

    if (!organization) {
      throw new AppError('조직을 찾을 수 없습니다.', 404);
    }

    res.json({
      success: true,
      message: '구성원 수가 업데이트되었습니다.',
      data: organization.toJSON(),
    });
  }
);

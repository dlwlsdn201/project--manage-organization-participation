import { Request, Response } from 'express';
import { Member, Organization } from '../models/index.js';
import { ApiResponse, PaginationQuery } from '../types/index.js';
import { asyncHandler, AppError } from '../middleware/errorHandler.js';

// 모든 구성원 조회 (조직별 필터링 가능)
export const getAllMembers = asyncHandler(
  async (
    req: Request<
      {},
      ApiResponse,
      {},
      PaginationQuery & { organizationId?: string }
    >,
    res: Response<ApiResponse>
  ) => {
    const {
      page = '1',
      limit = '20',
      sortBy = 'joinedAt',
      sortOrder = 'desc',
      organizationId,
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const sortObj: Record<string, 1 | -1> = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const filter: { organizationId?: string } = {};
    if (organizationId) {
      filter.organizationId = organizationId;
    }

    const [members, total] = await Promise.all([
      Member.find(filter).sort(sortObj).skip(skip).limit(limitNum).lean(),
      Member.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: members,
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

// 특정 구성원 조회
export const getMemberById = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const member = await Member.findById(id).lean();

    if (!member) {
      throw new AppError('구성원을 찾을 수 없습니다.', 404);
    }

    res.json({
      success: true,
      data: member,
    });
  }
);

// 조직별 구성원 조회
export const getMembersByOrganization = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { organizationId } = req.params;
    const { status } = req.query;

    // 조직 존재 확인
    const organization = await Organization.findById(organizationId);
    if (!organization) {
      throw new AppError('조직을 찾을 수 없습니다.', 404);
    }

    const filter: { organizationId: string; status?: string } = {
      organizationId,
    };
    if (status) {
      filter.status = status as string;
    }

    const members = await Member.find(filter).sort({ joinedAt: -1 }).lean();

    res.json({
      success: true,
      data: members,
    });
  }
);

// 구성원 생성
export const createMember = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const memberData = req.body;

    // 조직 존재 확인
    const organization = await Organization.findById(memberData.organizationId);
    if (!organization) {
      throw new AppError('조직을 찾을 수 없습니다.', 404);
    }

    // 최대 구성원 수 확인
    if (organization.maxMembers) {
      const currentActiveMembers = await Member.countDocuments({
        organizationId: memberData.organizationId,
        status: 'active',
      });

      if (currentActiveMembers >= organization.maxMembers) {
        throw new AppError('조직의 최대 구성원 수를 초과했습니다.', 400);
      }
    }

    // 중복 이름 확인 (같은 조직 내)
    const existingMember = await Member.findOne({
      organizationId: memberData.organizationId,
      name: memberData.name,
    });
    if (existingMember) {
      throw new AppError(
        '같은 조직에 동일한 이름의 구성원이 이미 존재합니다.',
        409
      );
    }

    const member = new Member(memberData);
    await member.save();

    // 조직의 구성원 수 업데이트
    await Organization.findByIdAndUpdate(memberData.organizationId, {
      $inc: { currentMembers: 1 },
    });

    res.status(201).json({
      success: true,
      message: '구성원이 성공적으로 추가되었습니다.',
      data: member.toJSON(),
    });
  }
);

// 구성원 수정
export const updateMember = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;
    const updateData = req.body;

    // 이름 중복 확인 (자신 제외, 같은 조직 내)
    if (updateData.name || updateData.organizationId) {
      const currentMember = await Member.findById(id);
      if (!currentMember) {
        throw new AppError('구성원을 찾을 수 없습니다.', 404);
      }

      const organizationId =
        updateData.organizationId || currentMember.organizationId;
      const name = updateData.name || currentMember.name;

      const existingMember = await Member.findOne({
        organizationId,
        name,
        _id: { $ne: id },
      });
      if (existingMember) {
        throw new AppError(
          '같은 조직에 동일한 이름의 구성원이 이미 존재합니다.',
          409
        );
      }
    }

    const member = await Member.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!member) {
      throw new AppError('구성원을 찾을 수 없습니다.', 404);
    }

    res.json({
      success: true,
      message: '구성원 정보가 성공적으로 수정되었습니다.',
      data: member.toJSON(),
    });
  }
);

// 구성원 삭제
export const deleteMember = asyncHandler(
  async (req: Request, res: Response<ApiResponse>) => {
    const { id } = req.params;

    const member = await Member.findByIdAndDelete(id);

    if (!member) {
      throw new AppError('구성원을 찾을 수 없습니다.', 404);
    }

    // 조직의 구성원 수 업데이트
    await Organization.findByIdAndUpdate(member.organizationId, {
      $inc: { currentMembers: -1 },
    });

    res.json({
      success: true,
      message: '구성원이 성공적으로 삭제되었습니다.',
    });
  }
);

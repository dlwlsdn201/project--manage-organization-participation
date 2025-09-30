import { Schema, model } from 'mongoose';
import { IOrganization } from '../types/index.js';

const organizationSettingsSchema = new Schema(
  {
    participationRule: {
      type: String,
      required: true,
      enum: ['제한없음', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
      default: '제한없음',
    },
  },
  { _id: false }
);

const organizationSchema = new Schema<IOrganization>(
  {
    name: {
      type: String,
      required: [true, '조직명은 필수입니다.'],
      trim: true,
      minlength: [2, '조직명은 최소 2자 이상이어야 합니다.'],
      maxlength: [50, '조직명은 최대 50자까지 가능합니다.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, '설명은 최대 500자까지 가능합니다.'],
    },
    logo: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, '지역명은 최대 100자까지 가능합니다.'],
    },
    type: {
      type: String,
      required: [true, '조직 유형은 필수입니다.'],
      enum: {
        values: [
          'club',
          'study',
          'culture',
          'sports',
          'volunteer',
          'business',
          'social',
          'other',
        ],
        message: '올바른 조직 유형을 선택해주세요.',
      },
    },
    maxMembers: {
      type: Number,
      min: [1, '최대 구성원 수는 1명 이상이어야 합니다.'],
      max: [1000, '최대 구성원 수는 1000명까지 가능합니다.'],
      default: 50,
    },
    currentMembers: {
      type: Number,
      default: 0,
      min: [0, '현재 구성원 수는 0명 이상이어야 합니다.'],
    },
    settings: {
      type: organizationSettingsSchema,
      required: true,
      default: () => ({ participationRule: '제한없음' }),
    } as any,
    createdBy: {
      type: String,
      required: [true, '생성자 정보는 필수입니다.'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        const { __v, ...result } = ret;
        return result;
      },
    },
  }
);

// 인덱스 설정
organizationSchema.index({ name: 1 });
organizationSchema.index({ type: 1 });
organizationSchema.index({ createdBy: 1 });
organizationSchema.index({ createdAt: -1 });

// 가상 필드
organizationSchema.virtual('memberCount').get(function () {
  return (this as any).currentMembers;
});

// 미들웨어
organizationSchema.pre('save', function (next) {
  // maxMembers보다 currentMembers가 많으면 조정
  if (
    (this as any).maxMembers &&
    (this as any).currentMembers > (this as any).maxMembers
  ) {
    (this as any).currentMembers = (this as any).maxMembers;
  }
  next();
});

export const Organization = model<IOrganization>(
  'Organization',
  organizationSchema
);

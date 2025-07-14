import { Schema, model } from 'mongoose';
import { IActivityLog } from '../types/index.js';

const activityLogSchema = new Schema<IActivityLog>(
  {
    organizationId: {
      type: String,
      required: [true, '조직 ID는 필수입니다.'],
      ref: 'Organization',
    },
    userId: {
      type: String,
      required: [true, '사용자 ID는 필수입니다.'],
    },
    action: {
      type: String,
      required: [true, '액션은 필수입니다.'],
      trim: true,
      maxlength: [100, '액션은 최대 100자까지 가능합니다.'],
    },
    details: {
      type: String,
      required: [true, '상세 내용은 필수입니다.'],
      trim: true,
      maxlength: [500, '상세 내용은 최대 500자까지 가능합니다.'],
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete (ret as any)._id;
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// 인덱스 설정
activityLogSchema.index({ organizationId: 1 });
activityLogSchema.index({ userId: 1 });
activityLogSchema.index({ timestamp: -1 });
activityLogSchema.index({ action: 1 });

// 복합 인덱스
activityLogSchema.index({ organizationId: 1, timestamp: -1 });
activityLogSchema.index({ organizationId: 1, action: 1 });
activityLogSchema.index({ userId: 1, timestamp: -1 });

// 정적 메서드
activityLogSchema.statics.findByOrganization = function (
  organizationId: string,
  limit: number = 50
) {
  return this.find({ organizationId }).sort({ timestamp: -1 }).limit(limit);
};

activityLogSchema.statics.findByUser = function (
  userId: string,
  limit: number = 50
) {
  return this.find({ userId }).sort({ timestamp: -1 }).limit(limit);
};

activityLogSchema.statics.findByAction = function (
  action: string,
  organizationId?: string
) {
  const query = { action };
  if (organizationId) {
    (query as any).organizationId = organizationId;
  }
  return this.find(query).sort({ timestamp: -1 });
};

export const ActivityLog = model<IActivityLog>(
  'ActivityLog',
  activityLogSchema
);

import { Schema, model } from 'mongoose';
import { IActivityLog } from '../types/index.js';

const activityLogSchema = new Schema<IActivityLog>(
  {
    organizationId: {
      type: String,
      required: [true, '조직 ID는 필수입니다.'],
    },
    userId: {
      type: String,
      required: [true, '사용자 ID는 필수입니다.'],
    },
    action: {
      type: String,
      required: [true, '액션은 필수입니다.'],
    },
    details: {
      type: String,
      required: [true, '상세 내용은 필수입니다.'],
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
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

export const ActivityLog = model<IActivityLog>(
  'ActivityLog',
  activityLogSchema
);

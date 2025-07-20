import { Schema, model } from 'mongoose';
import { IEvent } from '../types/index.js';

const eventSchema = new Schema<IEvent>(
  {
    organizationId: {
      type: String,
      required: [true, '조직 ID는 필수입니다.'],
      ref: 'Organization',
    },
    title: {
      type: String,
      required: [true, '이벤트 제목은 필수입니다.'],
      trim: true,
      minlength: [2, '제목은 최소 2자 이상이어야 합니다.'],
      maxlength: [100, '제목은 최대 100자까지 가능합니다.'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, '설명은 최대 1000자까지 가능합니다.'],
    },
    date: {
      type: Date,
      required: [true, '이벤트 날짜는 필수입니다.'],
      validate: {
        validator: function (value: Date) {
          // 과거 날짜도 허용 (이미 진행된 모임 기록용)
          return value instanceof Date && !isNaN(value.getTime());
        },
        message: '올바른 날짜 형식이어야 합니다.',
      },
    },
    location: {
      type: String,
      required: [true, '장소는 필수입니다.'],
      trim: true,
      minlength: [2, '장소는 최소 2자 이상이어야 합니다.'],
      maxlength: [200, '장소는 최대 200자까지 가능합니다.'],
    },
    hostId: {
      type: String,
      required: [true, '주최자 ID는 필수입니다.'],
      ref: 'Member',
    },
    maxParticipants: {
      type: Number,
      min: [1, '최대 참여자 수는 1명 이상이어야 합니다.'],
      max: [1000, '최대 참여자 수는 1000명까지 가능합니다.'],
    },
    currentParticipants: {
      type: Number,
      default: 0,
      min: [0, '현재 참여자 수는 0명 이상이어야 합니다.'],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
        message: '올바른 이벤트 상태를 선택해주세요.',
      },
      default: 'published',
    },
    attendees: [
      {
        type: String,
        ref: 'Member',
      },
    ],
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
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// 인덱스 설정
eventSchema.index({ organizationId: 1 });
eventSchema.index({ date: -1 });
eventSchema.index({ status: 1 });
eventSchema.index({ hostId: 1 });
eventSchema.index({ createdAt: -1 });

// 복합 인덱스
eventSchema.index({ organizationId: 1, date: -1 });
eventSchema.index({ organizationId: 1, status: 1 });
eventSchema.index({ organizationId: 1, createdAt: -1 });

// 가상 필드
eventSchema.virtual('isUpcoming').get(function () {
  return this.date > new Date();
});

eventSchema.virtual('isPast').get(function () {
  return this.date < new Date();
});

eventSchema.virtual('attendeeCount').get(function () {
  return this.attendees.length;
});

// 미들웨어
eventSchema.pre('save', function (next) {
  // currentParticipants를 attendees 배열 길이로 동기화
  this.currentParticipants = this.attendees.length;

  // maxParticipants보다 attendees가 많으면 오류
  if (this.maxParticipants && this.attendees.length > this.maxParticipants) {
    return next(new Error('참여자 수가 최대 허용 인원을 초과했습니다.'));
  }

  next();
});

// 정적 메서드
eventSchema.statics.findByOrganization = function (organizationId: string) {
  return this.find({ organizationId }).sort({ date: -1 });
};

eventSchema.statics.findUpcoming = function (organizationId?: string) {
  const query = { date: { $gte: new Date() } };
  if (organizationId) {
    (query as any).organizationId = organizationId;
  }
  return this.find(query).sort({ date: 1 });
};

eventSchema.statics.findPast = function (organizationId?: string) {
  const query = { date: { $lt: new Date() } };
  if (organizationId) {
    (query as any).organizationId = organizationId;
  }
  return this.find(query).sort({ date: -1 });
};

export const Event = model<IEvent>('Event', eventSchema);

import { Schema, model } from 'mongoose';
import { IMember } from '../types/index.js';

const memberSchema = new Schema<IMember>(
  {
    name: {
      type: String,
      required: [true, '이름은 필수입니다.'],
      trim: true,
      minlength: [2, '이름은 최소 2자 이상이어야 합니다.'],
      maxlength: [20, '이름은 최대 20자까지 가능합니다.'],
    },
    gender: {
      type: String,
      required: [true, '성별은 필수입니다.'],
      enum: {
        values: ['male', 'female'],
        message: '성별은 male 또는 female이어야 합니다.',
      },
    },
    birthYear: {
      type: Number,
      required: [true, '출생년도는 필수입니다.'],
      min: [1950, '출생년도는 1950년 이후여야 합니다.'],
      max: [
        new Date().getFullYear(),
        '출생년도는 현재 년도를 초과할 수 없습니다.',
      ],
      validate: {
        validator: function (value: number) {
          return Number.isInteger(value);
        },
        message: '출생년도는 정수여야 합니다.',
      },
    },
    district: {
      type: String,
      required: [true, '거주지역은 필수입니다.'],
      trim: true,
      maxlength: [50, '거주지역은 최대 50자까지 가능합니다.'],
    },
    organizationId: {
      type: String,
      required: [true, '조직 ID는 필수입니다.'],
      ref: 'Organization',
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: ['active', 'inactive'],
        message: '상태는 active 또는 inactive여야 합니다.',
      },
      default: 'active',
    },
    joinedAt: {
      type: Date,
      required: true,
      default: Date.now,
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
memberSchema.index({ organizationId: 1 });
memberSchema.index({ status: 1 });
memberSchema.index({ joinedAt: -1 });
memberSchema.index({ name: 1 });
memberSchema.index({ gender: 1 });
memberSchema.index({ district: 1 });

// 복합 인덱스
memberSchema.index({ organizationId: 1, status: 1 });
memberSchema.index({ organizationId: 1, joinedAt: -1 });

// 가상 필드
memberSchema.virtual('age').get(function () {
  return new Date().getFullYear() - this.birthYear + 1;
});

// 정적 메서드
memberSchema.statics.findByOrganization = function (organizationId: string) {
  return this.find({ organizationId, status: 'active' });
};

memberSchema.statics.findActiveMembers = function () {
  return this.find({ status: 'active' });
};

export const Member = model<IMember>('Member', memberSchema);

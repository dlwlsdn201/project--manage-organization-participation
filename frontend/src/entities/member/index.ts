// DB에 최종적으로 저장된 구성원 데이터 객체의 인터페이스
export interface Member extends InitialMember {
  _id: string;
  organizationId: string;
  joinedAt: Date;
  updatedAt: Date;
}

// 신규 등록 시, 구성원 데이터 객체의 초기 인터페이스
export interface InitialMember {
  name: string;
  gender: 'male' | 'female';
  birthYear: number;
  district: string;
}

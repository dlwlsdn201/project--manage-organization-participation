export const organizationTypeOptions = [
  { value: 'club', label: '동호회' },
  { value: 'study', label: '스터디' },
  { value: 'culture', label: '문화' },
  { value: 'sports', label: '스포츠' },
  { value: 'volunteer', label: '봉사' },
  { value: 'business', label: '비즈니스' },
  { value: 'social', label: '소셜' },
  { value: 'other', label: '기타' },
];

export const participationRuleOptions = [
  { value: '제한없음', label: '제한없음' },
  { value: '1', label: '월 1회' },
  { value: '2', label: '월 2회' },
  { value: '3', label: '월 3회' },
  { value: '4', label: '월 4회' },
];

export const genderOptions = [
  { value: 'male', label: '남성' },
  { value: 'female', label: '여성' },
];

export const defaultFormValues = {
  type: 'club',
  settings: { participationRule: '제한없음' },
};

export const defaultMemberValues = {
  gender: 'male' as const,
  birthYear: new Date().getFullYear() - 20,
};

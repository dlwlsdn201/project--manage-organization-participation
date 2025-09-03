import { Member } from '@/entities';

export const sortMembers = (members: Member[]): Member[] => {
  return members.sort(
    (a, b) => new Date(b?.joinedAt).getTime() - new Date(a?.joinedAt).getTime()
  );
};

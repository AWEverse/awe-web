export interface ApiUserInfo {
  id: bigint;
  username: string;
  fullName?: string;
  avatarUrl?: string;
  flags: number;
  lastSeen?: Date;
}

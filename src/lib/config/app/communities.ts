import { MAX_INT32 } from '@/lib/core';

export const ForumConfig = {
  Group: {
    Participants: {
      Max: { default: 200_000 },
      Broadcast: { default: MAX_INT32, unlimited: true },
    },
    Admins: {
      Max: 50,
      RoleLength: 16,
    },
    Bots: {
      Max: 20,
    },
    Name: {
      MaxLength: 255,
    },
    Description: {
      MaxLength: 255,
    },
    PromotedStickers: {
      MinParticipants: 100,
    },
    ConvertToBroadcast: {
      MaxMembers: 199_000,
    },
    Statistics: {
      MinMembers: 500,
    },
  },
  Chat: {
    Pinned: {
      Main: { default: 5, premium: 10 },
      Secret: { default: 5 },
    },
    Title: {
      MaxLength: 128,
    },
  },
  Message: {
    Editing: {
      Period: { seconds: 48 * 60 * 60, description: '48 hours' },
      SavedAndAdmins: { seconds: MAX_INT32, description: 'Unlimited for saved messages and admins' },
    },
    Mentions: {
      MaxPerMessage: 50,
      MaxNotifications: 5,
    },
    Pinned: {
      Max: { default: MAX_INT32, unlimited: true },
    },
    VisibleInGroup: {
      Limit: 1_000_000,
    },
  },
  Media: {
    SelfDestruction: {
      MinTime: { seconds: 1, description: '1 second' },
      MaxTime: { seconds: 60, description: '1 minute' },
    },
  },
  User: {
    Username: {
      ChangeReservation: { seconds: 15 * 60, description: '15 minutes' },
    },
    RecentActions: {
      Period: { seconds: 2 * 24 * 60 * 60, description: '2 days' },
    },
  },
  ReadReceipts: {
    Lifetime: { seconds: 7 * 24 * 60 * 60, description: '7 days' },
    MaxMembers: 100,
  },
};

export function getConfigValue<T>(path: keyof typeof ForumConfig): T | undefined {
  return ForumConfig[path] as T;
}


import { MAX_INT32 } from '@/lib/core';

export const Constraints = {
  Username: {
    MinLength: 4,
    MaxLength: 32,
  },
  Bio: {
    MaxLength: 70,
    MaxLengthPremium: 140,
  },
  Name: {
    MinFirstNameLength: 1,
    MaxFirstNameLength: 64,
    MaxLastNameLength: 64,
  },
  SelfDestruction: {
    Periods: [1, 3, 6, 12],
    DefaultPeriod: 6,
  },
  SpamBan: {
    MinDuration: 1,
    MaxDuration: MAX_INT32,
  },
  ChannelsAndSupergroups: {
    Max: 500,
    MaxPremium: 1000,
  },
  Geochats: {
    Max: MAX_INT32,
  },
  SavedGifs: {
    Max: 200,
    MaxPremium: 400,
  },
  VideoAvatar: {
    MaxDuration: 10,
  },
  GroupChannelCreation: {
    MaxPerDay: 50,
  },
  Accounts: {
    Max: 3,
    MaxPremium: 4,
  },
  VisibleMessages: {
    Limit: MAX_INT32,
    LegacyLimit: 1_000_000,
  },
};

import { MAX_INT_32 } from '../../constants/numeric';

// Username constraints
export const MIN_USERNAME_LENGTH = 4; // Minimum for NFT usernames
export const MAX_USERNAME_LENGTH = 32;

// Bio constraints
export const MAX_BIO_LENGTH = 70; // Regular users
export const MAX_BIO_LENGTH_PREMIUM = 140; // Premium users

// Name length constraints
export const MIN_FIRST_NAME_LENGTH = 1;
export const MAX_FIRST_NAME_LENGTH = 64;
export const MAX_LAST_NAME_LENGTH = 64; // Last name can be 0 characters (optional)

// Self-destruction period options (in months)
export const SELF_DESTRUCTION_PERIODS = [1, 3, 6, 12];
export const DEFAULT_SELF_DESTRUCTION_PERIOD = 6;

// Spam ban duration (in days)
export const MIN_SPAM_BAN_DURATION = 1;
export const MAX_SPAM_BAN_DURATION = MAX_INT_32; // "Forever" represented by Infinity

// Channels and supergroups membership limits
export const MAX_CHANNELS_AND_SUPERGROUPS = 500;
export const MAX_CHANNELS_AND_SUPERGROUPS_PREMIUM = 1000;

// Geochats membership limit
export const MAX_GEOCHATS = MAX_INT_32; // Unlimited

// Saved GIFs limit
export const MAX_SAVED_GIFS = 200;
export const MAX_SAVED_GIFS_PREMIUM = 400;

// Video-avatar constraints
export const MAX_VIDEO_AVATAR_DURATION = 10; // in seconds

// Group and channel creation limits
export const MAX_GROUP_CHANNEL_CREATION_PER_DAY = 50;

// Accounts number limit
export const MAX_ACCOUNTS = 3;
export const MAX_ACCOUNTS_PREMIUM = 4; // Can be 4-6 depending on the app

// Visible messages limit
export const VISIBLE_MESSAGES_LIMIT = MAX_INT_32; // Unlimited for accounts created after 2018
export const VISIBLE_MESSAGES_LEGACY_LIMIT = 1_000_000; // For accounts before 2018
